import { NavLink } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";

const HomeHeroSection = () => {
  return (
    <section className="min-h-[90vh] flex flex-col px-5 md:px-10" id="landingHero">
      <div className="flex-1 flex items-center md:items-end text-[18vw] md:text-[11vw] font-display">
        <h1 className="leading-none flex flex-col md:flex-row">
          <span className="toUp">Seek.&nbsp;</span>
          <span className="toUp">Receive.&nbsp;</span>
          <span className="toUp">Grow</span>
        </h1>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1 relative pb-10 md:pb-0">
        <div className="md:w-1/2 flex">
          <div className="md:text-end w-fit flex flex-col gap-5 md:items-end font-body font-light toUp">
            <p className="tracking-wider text-md">
              Gather any suggestion.
              <br />
              Anyone can give feedback anonymously.
              <br />
              You will get honest feedback from clients or friends.
            </p>

            <NavLink
              to={"get-started"}
              className="inline-flex gap-2 py-2 px-4 items-center border rounded-full w-fit hover:border-darkGreen hover:shadow"
            >
              Get Started <BsArrowRight aria-hidden="true" />
            </NavLink>
          </div>
        </div>

        <div className="md:absolute md:right-0 flex items-end toUp">
          <a
            href="mailto:yemyintkyaw.dev@gmail.com"
            className="inline-flex gap-2 py-2 items-center w-fit relative getInTouch"
          >
            get in touch <BsArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroSection;
