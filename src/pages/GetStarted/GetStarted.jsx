import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Typed from "typed.js";
import { toast } from "react-hot-toast";
import "./style.css";
import { signInWithGoogle } from "../../util/firebase";

const IGNORED_SIGN_IN_ERRORS = [
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
];

const GetStarted = () => {
  const type = useRef(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // On success the auth listener updates the store and the route guard
  // takes the user to their boxes.
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (!IGNORED_SIGN_IN_ERRORS.includes(error.code)) {
        console.error(error);
        toast.error("Sign in failed. Please try again.");
      }
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    const typed = new Typed(type.current, {
      strings: ["Suggestify"],
      typeSpeed: 100,
      backDelay: 1500,
    });
    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.destroy();
    };
  }, []);

  return (
    <div className="min-h-[90vh] flex items-center lg:justify-between justify-center flex-col lg:flex-row gap-10 lg:gap-0 px-5 md:px-10 py-10">
      <div className="text-5xl md:text-8xl leading-tight font-display">
        <div>Get Started</div>
        <h1 className="inline-block w-fit " ref={type}></h1>
      </div>
      <button
        className="flex items-center gap-4 text-3xl md:text-6xl font-display border border-primary
        rounded-full px-6 py-4 md:p-6 hover:border-green disabled:opacity-60"
        onClick={handleSignIn}
        disabled={isSigningIn}
      >
        <span>{isSigningIn ? "Signing in…" : "Continue with Google"}</span>
        <FcGoogle aria-hidden="true" />
      </button>
    </div>
  );
};

export default GetStarted;
