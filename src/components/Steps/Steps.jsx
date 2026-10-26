const Steps = ({ steps }) => {
  return (
    <div className="flex flex-col gap-16 relative ">
      {steps.map((step, index) => (
        <div key={index} className="flex items-start md:items-center gap-5 md:gap-10 z-10 ">
          <div className="w-[60px] min-w-[60px] h-[60px] flex items-center justify-center font-body font-light text-2xl md:text-4xl rounded-full bg-darkGreen text-brown toDown">
            {index + 1}
          </div>
          <div className=" text-4xl md:text-5xl self-center font-display toLeft ">
            {step}
          </div>
        </div>
      ))}
      <div className="absolute left-[30px] w-[1px] h-full bg-darkGreen toDown"></div>
    </div>
  );
};

export default Steps;
