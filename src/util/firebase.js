import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

// Firestore allows at most 500 writes per batch.
const BATCH_LIMIT = 450;

// auth //

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

const POPUP_FALLBACK_ERRORS = [
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
];

// Popup works on the live domain and on Vercel/Netlify alike.
// Fall back to a full-page redirect when the browser blocks popups.
export const signInWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (POPUP_FALLBACK_ERRORS.includes(error.code)) {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const getGoogleRedirectResult = () => getRedirectResult(auth);

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (callBack) =>
  onAuthStateChanged(auth, callBack);

// refs //

const boxRef = (boxId) => doc(db, "feedbackBox", boxId);
const feedbackCollectionRef = (boxId) =>
  collection(db, "feedbackBox", boxId, "feedback");
const ownerLinkCollectionRef = (userId) =>
  collection(db, "users", userId, "feedbacks");
const ownerLinkRef = (userId, boxId) =>
  doc(db, "users", userId, "feedbacks", boxId);

// Boxes created before "isOpen" existed have no such field and count as open.
const toBox = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
  isOpen: snapshot.data().isOpen ?? true,
});

// firestore--feedback box //

// The owner link and the public box are written together, so a failed
// write can never leave a share link that points at nothing.
export const createFeedbackBox = async (userId, name) => {
  const linkRef = doc(ownerLinkCollectionRef(userId));
  const batch = writeBatch(db);
  batch.set(linkRef, { name, isOpen: true });
  batch.set(boxRef(linkRef.id), {
    name,
    timestamp: serverTimestamp(),
    isOpen: true,
  });
  await batch.commit();
  return linkRef.id;
};

export const getFeedbackBox = async (boxId) => {
  const snapshot = await getDoc(boxRef(boxId));
  return snapshot.exists() ? toBox(snapshot) : null;
};

export const renameFeedbackBox = async (userId, boxId, name) => {
  const batch = writeBatch(db);
  batch.update(boxRef(boxId), { name });
  batch.update(ownerLinkRef(userId, boxId), { name });
  await batch.commit();
};

export const setFeedbackBoxOpen = async (userId, boxId, isOpen) => {
  const batch = writeBatch(db);
  batch.update(boxRef(boxId), { isOpen });
  batch.update(ownerLinkRef(userId, boxId), { isOpen });
  await batch.commit();
};

// Deleting a document does not delete its subcollections, so the feedback
// is removed first. The owner link goes last because the rules use it to
// prove ownership.
export const deleteFeedbackBox = async (userId, boxId) => {
  const feedbackSnapshot = await getDocs(feedbackCollectionRef(boxId));
  const feedbackRefs = feedbackSnapshot.docs.map((snapshot) => snapshot.ref);

  for (let i = 0; i < feedbackRefs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    feedbackRefs
      .slice(i, i + BATCH_LIMIT)
      .forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  const batch = writeBatch(db);
  batch.delete(boxRef(boxId));
  batch.delete(ownerLinkRef(userId, boxId));
  await batch.commit();
};

// firestore--feedback //

export const addFeedback = (boxId, feedback) =>
  addDoc(feedbackCollectionRef(boxId), {
    feedback,
    isMarked: false,
    isRead: false,
    dateTime: Date.now(),
  });

export const updateMarkFeedback = (boxId, feedbackId, isMarked) =>
  updateDoc(doc(feedbackCollectionRef(boxId), feedbackId), { isMarked });

export const markFeedbacksRead = async (boxId, feedbackIds) => {
  for (let i = 0; i < feedbackIds.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    feedbackIds.slice(i, i + BATCH_LIMIT).forEach((feedbackId) => {
      batch.update(doc(feedbackCollectionRef(boxId), feedbackId), {
        isRead: true,
      });
    });
    await batch.commit();
  }
};

export const deleteFeedback = (boxId, feedbackId) =>
  deleteDoc(doc(feedbackCollectionRef(boxId), feedbackId));

// realtime subscriptions — each returns its unsubscribe function //

export const subscribeToFeedbackBox = (boxId, onChange, onError) =>
  onSnapshot(
    boxRef(boxId),
    (snapshot) => onChange(snapshot.exists() ? toBox(snapshot) : null),
    onError
  );

export const subscribeToFeedbacks = (boxId, onChange, onError) =>
  onSnapshot(
    feedbackCollectionRef(boxId),
    (snapshot) =>
      onChange(
        snapshot.docs
          .map((feedback) => ({ id: feedback.id, ...feedback.data() }))
          .sort((a, b) => b.dateTime - a.dateTime)
      ),
    onError
  );

export const subscribeToUserBoxes = (userId, onChange, onError) =>
  onSnapshot(
    ownerLinkCollectionRef(userId),
    (snapshot) => onChange(snapshot.docs.map(toBox)),
    onError
  );

export const subscribeToUnreadCount = (boxId, onChange, onError) =>
  onSnapshot(
    query(feedbackCollectionRef(boxId), where("isRead", "==", false)),
    (snapshot) => onChange(snapshot.size),
    onError
  );

// firestore--user //

export const createUserDocumentFromAuth = async (userAuth) => {
  const userDocRef = doc(db, "users", userAuth.uid);
  const userSnapshot = await getDoc(userDocRef);
  if (userSnapshot.exists()) return;

  const { displayName, email } = userAuth;
  await setDoc(userDocRef, {
    displayName,
    email,
    createAt: new Date(),
  });
};
