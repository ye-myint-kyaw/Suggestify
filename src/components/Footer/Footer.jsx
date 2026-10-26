const externalLink = { target: "_blank", rel: "noopener noreferrer" };
const linkStyle = "underline-offset-4 hover:underline";

const Footer = () => {
  return (
    <footer className="bg-green text-primary text-center px-5 py-3 flex flex-col gap-1">
      <p>
        Designed & developed by{" "}
        <a href="https://yemyintkyaw.dev" className={linkStyle} {...externalLink}>
          Ye Myint Kyaw
        </a>{" "}
        · Logo by{" "}
        <a href="https://instagram.com/leonegan8" className={linkStyle} {...externalLink}>
          Lynn
        </a>
      </p>
      <div className="flex justify-center gap-4 text-sm font-body font-light">
        <a
          href="https://github.com/ye-myint-kyaw/Suggestify"
          className={linkStyle}
          {...externalLink}
        >
          Source on GitHub
        </a>
        <a href="https://yemyintkyaw.dev" className={linkStyle} {...externalLink}>
          Portfolio
        </a>
        <a href="mailto:yemyintkyaw.dev@gmail.com" className={linkStyle}>
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
