import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import View from "./routes";
import {
  createUserDocumentFromAuth,
  getGoogleRedirectResult,
  onAuthStateChangedListener,
} from "./util/firebase";
import { clearUserInfo, setUserInfo } from "./store/userSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Surfaces errors from the redirect sign-in fallback.
    getGoogleRedirectResult().catch((error) => {
      console.error(error);
      toast.error("Sign in failed. Please try again.");
    });

    const unsubscribe = onAuthStateChangedListener((userAuth) => {
      if (!userAuth) {
        dispatch(clearUserInfo());
        return;
      }

      const { email, uid, displayName } = userAuth;
      dispatch(setUserInfo({ displayName, email, uid }));
      createUserDocumentFromAuth(userAuth).catch((error) =>
        console.error("Error creating user profile:", error)
      );
    });

    return unsubscribe;
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <main>
        <View />
      </main>
      <Footer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { background: "#FEFAE0", color: "#283618", borderRadius: 0 },
        }}
      />
    </>
  );
};

export default App;
