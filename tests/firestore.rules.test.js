import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, test } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const OWNER = "owner-uid";
const STRANGER = "stranger-uid";
const BOX = "box-1";

let testEnv;

const validFeedback = (text = "Great work!") => ({
  feedback: text,
  isMarked: false,
  isRead: false,
  dateTime: Date.now(),
});

const dbAs = (uid) =>
  uid
    ? testEnv.authenticatedContext(uid).firestore()
    : testEnv.unauthenticatedContext().firestore();

// Seed data with rules disabled.
const seed = (fn) =>
  testEnv.withSecurityRulesDisabled((context) => fn(context.firestore()));

const seedBox = ({ isOpen } = {}) =>
  seed(async (db) => {
    const box = { name: "How was my talk?", timestamp: new Date() };
    if (isOpen !== undefined) box.isOpen = isOpen;
    await setDoc(doc(db, "users", OWNER, "feedbacks", BOX), { name: box.name });
    await setDoc(doc(db, "feedbackBox", BOX), box);
    await setDoc(doc(db, "feedbackBox", BOX, "feedback", "f1"), validFeedback());
  });

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-suggestify",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("creating a box", () => {
  test("owner can create a box and its owner link in one batch", async () => {
    const db = dbAs(OWNER);
    const batch = writeBatch(db);
    batch.set(doc(db, "users", OWNER, "feedbacks", BOX), {
      name: "Team retro",
      isOpen: true,
    });
    batch.set(doc(db, "feedbackBox", BOX), {
      name: "Team retro",
      timestamp: serverTimestamp(),
      isOpen: true,
    });
    await assertSucceeds(batch.commit());
  });

  test("cannot create a box without an owner link", async () => {
    const db = dbAs(OWNER);
    await assertFails(
      setDoc(doc(db, "feedbackBox", BOX), {
        name: "Team retro",
        timestamp: serverTimestamp(),
        isOpen: true,
      })
    );
  });

  test("box name must be 1-120 characters", async () => {
    const db = dbAs(OWNER);
    await assertFails(
      setDoc(doc(db, "users", OWNER, "feedbacks", BOX), { name: "" })
    );
    await assertFails(
      setDoc(doc(db, "users", OWNER, "feedbacks", BOX), {
        name: "x".repeat(121),
      })
    );
  });
});

describe("box takeover", () => {
  test("a stranger cannot claim an existing box from its share link", async () => {
    await seedBox();
    const db = dbAs(STRANGER);
    await assertFails(
      setDoc(doc(db, "users", STRANGER, "feedbacks", BOX), { name: "mine" })
    );
  });

  test("a stranger cannot read, rename or delete someone else's box feedback", async () => {
    await seedBox();
    const db = dbAs(STRANGER);
    await assertFails(getDocs(collection(db, "feedbackBox", BOX, "feedback")));
    await assertFails(updateDoc(doc(db, "feedbackBox", BOX), { name: "pwned" }));
    await assertFails(deleteDoc(doc(db, "feedbackBox", BOX)));
  });
});

describe("reading boxes", () => {
  test("anyone can load a single box by id", async () => {
    await seedBox();
    await assertSucceeds(getDoc(doc(dbAs(null), "feedbackBox", BOX)));
  });

  test("nobody can list every box", async () => {
    await seedBox();
    await assertFails(getDocs(collection(dbAs(null), "feedbackBox")));
    await assertFails(getDocs(collection(dbAs(STRANGER), "feedbackBox")));
  });
});

describe("leaving feedback", () => {
  test("anyone can leave valid feedback on an open box", async () => {
    await seedBox({ isOpen: true });
    const db = dbAs(null);
    await assertSucceeds(
      setDoc(doc(db, "feedbackBox", BOX, "feedback", "new"), validFeedback())
    );
  });

  test("boxes created before isOpen existed still accept feedback", async () => {
    await seedBox();
    const db = dbAs(null);
    await assertSucceeds(
      setDoc(doc(db, "feedbackBox", BOX, "feedback", "new"), validFeedback())
    );
  });

  test("closed boxes reject feedback", async () => {
    await seedBox({ isOpen: false });
    const db = dbAs(null);
    await assertFails(
      setDoc(doc(db, "feedbackBox", BOX, "feedback", "new"), validFeedback())
    );
  });

  test("feedback for a box that does not exist is rejected", async () => {
    const db = dbAs(null);
    await assertFails(
      setDoc(doc(db, "feedbackBox", "missing", "feedback", "new"), validFeedback())
    );
  });

  test("invalid feedback is rejected", async () => {
    await seedBox();
    const db = dbAs(null);
    const ref = doc(db, "feedbackBox", BOX, "feedback", "new");
    await assertFails(setDoc(ref, validFeedback("")));
    await assertFails(setDoc(ref, validFeedback("x".repeat(1001))));
    await assertFails(setDoc(ref, { ...validFeedback(), isRead: true }));
    await assertFails(setDoc(ref, { ...validFeedback(), isMarked: true }));
    await assertFails(setDoc(ref, { ...validFeedback(), extra: "field" }));
  });

  test("anonymous users cannot read, edit or delete feedback", async () => {
    await seedBox();
    const db = dbAs(null);
    const ref = doc(db, "feedbackBox", BOX, "feedback", "f1");
    await assertFails(getDoc(ref));
    await assertFails(updateDoc(ref, { isRead: true }));
    await assertFails(deleteDoc(ref));
  });
});

describe("box owner", () => {
  test("can read, bookmark, mark read and delete feedback", async () => {
    await seedBox();
    const db = dbAs(OWNER);
    const ref = doc(db, "feedbackBox", BOX, "feedback", "f1");
    await assertSucceeds(getDocs(collection(db, "feedbackBox", BOX, "feedback")));
    await assertSucceeds(updateDoc(ref, { isMarked: true, isRead: true }));
    await assertSucceeds(deleteDoc(ref));
  });

  test("cannot edit the text of feedback", async () => {
    await seedBox();
    const db = dbAs(OWNER);
    await assertFails(
      updateDoc(doc(db, "feedbackBox", BOX, "feedback", "f1"), {
        feedback: "something nicer",
      })
    );
  });

  test("can rename, close and reopen a box", async () => {
    await seedBox();
    const db = dbAs(OWNER);
    const batch = writeBatch(db);
    batch.update(doc(db, "feedbackBox", BOX), { name: "Renamed", isOpen: false });
    batch.update(doc(db, "users", OWNER, "feedbacks", BOX), {
      name: "Renamed",
      isOpen: false,
    });
    await assertSucceeds(batch.commit());
    await assertSucceeds(
      updateDoc(doc(db, "feedbackBox", BOX), { isOpen: true })
    );
    await assertFails(
      updateDoc(doc(db, "feedbackBox", BOX), { timestamp: new Date() })
    );
  });

  test("can delete a box, its feedback and the owner link in one batch", async () => {
    await seedBox();
    const db = dbAs(OWNER);
    const batch = writeBatch(db);
    batch.delete(doc(db, "feedbackBox", BOX, "feedback", "f1"));
    batch.delete(doc(db, "feedbackBox", BOX));
    batch.delete(doc(db, "users", OWNER, "feedbacks", BOX));
    await assertSucceeds(batch.commit());
  });
});

describe("user profiles", () => {
  test("users can only access their own profile", async () => {
    await assertSucceeds(
      setDoc(doc(dbAs(OWNER), "users", OWNER), { displayName: "Owner" })
    );
    await assertFails(getDoc(doc(dbAs(STRANGER), "users", OWNER)));
    await assertFails(
      setDoc(doc(dbAs(STRANGER), "users", OWNER), { displayName: "Hacker" })
    );
  });
});
