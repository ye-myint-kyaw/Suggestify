import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ReactLogo from "/src/assets/images/logo.svg";
import "./style.css";
import { signOutUser } from "../../util/firebase";
import { useSelector } from "react-redux";
import { CiMenuFries } from "react-icons/ci";
import { RxCross1 } from "react-icons/rx";

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const Navbar = () => {
  const nav = useNavigate();
  const isAuthenticated = useSelector(
    (state) => state.user.status === "authenticated"
  );
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!isNavOpen) return;
    const closeOnEscape = (e) => e.key === "Escape" && setIsNavOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isNavOpen]);

  const handleLogout = async () => {
    await signOutUser();
    nav("/get-started");
  };

  const handleNavClose = () => {
    setIsNavOpen(false);
  };

  const logo = (
    <Link
      to={isAuthenticated ? "/home" : "/"}
      onClick={scrollToTop}
      className="nav-logo"
    >
      <img src={ReactLogo} className="w-[150px]" alt="Suggestify home" />
    </Link>
  );

  return (
    <>
      {!isAuthenticated ? (
        <nav className="nav-container" aria-label="Main">
          {logo}
          <Link to={"/#how-it-works"} className="hideInSp">
            How it works
          </Link>
          <Link to={"/#feedback"} className="hideInSp">
            Give Feedback
          </Link>
          <NavLink to={"/how-it-is-developed"} className="hideInSp">
            How it&apos;s built
          </NavLink>
          <NavLink
            to={"/get-started"}
            className="nav-button hideInSp"
          >
            Get Started
          </NavLink>
          <button
            className="md:hidden inline-block"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open menu"
            aria-expanded={isNavOpen}
            aria-controls="mobile-menu"
          >
            <CiMenuFries className="text-3xl text-primary" />
          </button>
        </nav>
      ) : (
        <nav className="nav-container" aria-label="Main">
          {logo}
          <div className="flex items-center gap-6">
            <NavLink to={"/how-it-is-developed"} className="hideInSp">
              How it&apos;s built
            </NavLink>
            <button className="nav-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </nav>
      )}
      {/* slide bar */}
      <div
        id="mobile-menu"
        className={`nav-slider w-full pr-10 ps-0 pt-5 z-50 md:hidden overflow-hidden ${
          isNavOpen ? "translate-x-0" : "translate-x-[100vw] invisible"
        } fixed top-0 bottom-0 right-0 my-auto bg-darkGreen flex flex-col transition-all duration-500 `}
      >
        <button
          className="text-4xl self-end mb-10"
          onClick={handleNavClose}
          aria-label="Close menu"
        >
          <RxCross1 />
        </button>
        <Link
          to={"/#how-it-works"}
          onClick={handleNavClose}
          className={"nav-inSlider"}
        >
          How it works
        </Link>
        <Link to={"/#feedback"} onClick={handleNavClose} className={"nav-inSlider"}>
          Give Feedback
        </Link>
        <NavLink
          to={"/how-it-is-developed"}
          onClick={handleNavClose}
          className={"nav-inSlider"}
        >
          How it&apos;s built
        </NavLink>
        <NavLink
          to={"/get-started"}
          className="nav-inSlider border border-s-0 border-primary bg-inherit"
          onClick={handleNavClose}
        >
          Get Started
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
