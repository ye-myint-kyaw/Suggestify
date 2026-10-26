import { NavLink } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center gap-6 px-5 text-center">
      <span className="font-display text-[30vw] md:text-[14vw] leading-none text-green">
        404
      </span>
      <h1 className="font-display text-4xl md:text-5xl tracking-wide">
        This page doesn&apos;t exist
      </h1>
      <NavLink
        to="/"
        className="border border-primary px-5 py-2 hover:border-green"
      >
        Back to Suggestify
      </NavLink>
    </div>
  );
};

export default NotFound;
