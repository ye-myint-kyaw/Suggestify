import ScrollReveal from "scrollreveal";
import "./style.css";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Feedback from "../../components/Feedback/Feedback";
import UserGuide from "../../components/UserGuide/UserGuide";
import HomeHeroSection from "../../components/HomeHeroSection/HomeHeroSection";

const LandingPage = () => {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sr = ScrollReveal();
    let toUp = {
      distance: "200px",
      origin: "bottom",
      interval: 300,
      duration: 1000,
    };
    let toRight = {
      distance: "100px",
      origin: "left",
      interval: 300,
      duration: 1000,
    };
    let toDown = {
      distance: "100px",
      origin: "top",
      interval: 300,
      duration: 1000,
    };
    let toLeft = {
      distance: "100px",
      origin: "right",
      interval: 300,
      duration: 1000,
    };
    sr.reveal(".toDown", toDown);
    sr.reveal(".toLeft", toLeft);
    sr.reveal(".toRight", toRight);
    sr.reveal(".toUp", toUp);

    return () => sr.destroy();
  }, []);

  // Navbar links point at "/#how-it-works" and "/#feedback". Scrolling here
  // (instead of in the navbar) works from any page, after the route renders.
  useEffect(() => {
    if (!hash) return;
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ behavior: "smooth" });
  }, [hash, key]);

  return (
    <div className="bg-green mx-auto relative">
      {/* hero section */}
      <HomeHeroSection />
      {/* how it does section */}
      <div className="h-20 scroll-mt-16" id="how-it-works"></div>
      <UserGuide />

      {/* feedback */}
      <Feedback />
    </div>
  );
};

export default LandingPage;
