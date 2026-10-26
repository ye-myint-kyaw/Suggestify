import Steps from "../Steps/Steps";

const steps = [
  "Get started with Google.",
  "Create A Suggestion Box.",
  "Share the Box QR Code.",
  "Receive Feedback.",
  "View in the box.",
];

const UserGuide = () => {
  return (
    <section className="flex flex-col lg:flex-row ps-5 md:ps-10 border-t border-darkGreen overflow-hidden">
      <h2 className="flex-1 font-display text-6xl md:text-7xl pt-10 toRight ">
        How Suggestify works?
      </h2>
      <div className="w-full lg:w-3/5 flex lg:gap-10  ">
        <span className="w-[.5px] h-full bg-darkGreen"></span>
        <div className="pt-14 pb-14">
          <Steps steps={steps} />
        </div>
      </div>
    </section>
  );
};

export default UserGuide;
