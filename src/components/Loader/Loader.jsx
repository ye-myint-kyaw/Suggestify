import "./style.css";
const Loader = () => {
  return (
    <div
      className="absolute top-0 left-0 right-0 bottom-0 m-auto flex justify-center items-center bg-darkGreen z-40"
      role="status"
    >
      <span className="loader" aria-hidden="true"></span>
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default Loader;
