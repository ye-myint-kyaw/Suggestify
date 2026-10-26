const Feedback = () => {
  return (
    <section
      className="flex lg:flex-row flex-col items-center py-28 px-5 md:px-10 border-b border-darkGreen bg-darkGreen overflow-hidden scroll-mt-16"
      id="feedback"
    >
      <div className="flex-1">
        <img
          src="https://i.ibb.co/F5Tkr5L/About-Suggestify.png"
          alt="About Suggestify"
          loading="lazy"
          className="max-w-[400px] w-full mx-auto toRight"
        />
      </div>
      <div className="flex-1  ">
        <h2 className="text-6xl md:text-7xl font-display mb-5 mt-5 md:mt-0 tracking-wide toUp">
          Give Feedback to us
        </h2>
        <p className="font-body font-light text-xl tracking-wide max-w-[550px] text-justify toUp">
          This is the feedback box of the Suggestify. You can give any feedback
          to us. Scan the given QR Code and give us feedback. We are waiting for
          your feedback.
        </p>
      </div>
    </section>
  );
};

export default Feedback;
