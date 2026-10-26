import { FiExternalLink, FiGithub } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";

const stack = [
  ["React 18 + Vite", "Component UI, lazy-loaded routes and a fast dev server."],
  ["Firebase Auth", "One-tap Google sign-in for box owners. Respondents never sign in."],
  ["Cloud Firestore", "Stores boxes and feedback, and pushes changes to the dashboard in real time."],
  ["Firestore Security Rules", "All access control lives here, covered by automated tests."],
  ["Redux Toolkit", "Holds the signed-in user and auth status for route guards."],
  ["Tailwind CSS", "Utility-first styling with a small custom colour palette."],
  ["Formik", "Form state and validation for creating boxes and sending feedback."],
  ["react-pdf + qrcode", "PDF reports and downloadable QR codes, generated in the browser."],
  ["Vitest + Emulators", "Security rules tested against the local Firestore emulator."],
  ["GitHub Actions", "Lint, build and rules tests on every push."],
];

const flow = [
  ["Respondent", "Scans the QR code or opens the link. No account needed."],
  ["Public form", "/give-feedback/:boxId checks the box exists and is open."],
  ["Firestore", "Rules validate the write: plain text, 1-1000 characters, nothing else."],
  ["Owner dashboard", "A live listener shows the new feedback instantly and marks it read."],
];

const security = [
  "Anyone can send feedback, but only to a box that exists and is open, and only as plain text up to 1,000 characters.",
  "Only the box owner can read, bookmark or delete its feedback. Nobody can edit what someone wrote.",
  "Box IDs are public (they're in the share link), so ownership can only be claimed for a box that doesn't exist yet. This blocks anyone from taking over a box from its link.",
  "Nobody can list every box. A box can only be opened by its exact ID.",
  "Creating and deleting a box are atomic batched writes, so there are no half-created boxes or orphaned feedback.",
];

const features = [
  "Google sign-in",
  "Create, rename, close and reopen boxes",
  "Shareable link, QR code download and native share sheet",
  "Anonymous feedback form with a character counter",
  "Real-time feedback list and unread badges",
  "Bookmark, filter and delete feedback",
  "Export feedback to PDF",
  "Responsive, keyboard-friendly UI",
];

const dataModel = `users/{uid}                        owner profile
users/{uid}/feedbacks/{boxId}      owner's link to a box   { name, isOpen }
feedbackBox/{boxId}                public box info         { name, timestamp, isOpen }
feedbackBox/{boxId}/feedback/{id}  anonymous feedback      { feedback, isMarked, isRead, dateTime }`;

const links = [
  ["Source code", "https://github.com/ye-myint-kyaw/Suggestify", FiGithub],
  [
    "The story on Medium",
    "https://medium.com/@yemyintkyaw/suggestify-replacement-of-the-suggestion-box-0ddb61fc0d83",
    FiExternalLink,
  ],
  ["Ye Myint Kyaw · Portfolio", "https://yemyintkyaw.dev", FiExternalLink],
];

const Section = ({ title, children }) => (
  <section className="flex flex-col gap-6">
    <h2 className="font-display text-4xl md:text-5xl tracking-wide">{title}</h2>
    {children}
  </section>
);

const HowItsDeveloped = () => {
  return (
    <div className="px-5 md:px-10 py-16 flex flex-col gap-20 max-w-6xl mx-auto">
      <header className="flex flex-col gap-6">
        <h1 className="font-display text-6xl md:text-8xl tracking-wide">
          How it&apos;s built
        </h1>
        <p className="font-body font-light text-xl max-w-2xl">
          Suggestify started in 2023 as a learning project and was refreshed in
          2026 with real-time updates, stronger security and a test suite. It&apos;s
          a single-page React app with no custom server: Firebase handles auth
          and data, and security rules do the access control.
        </p>
      </header>

      <Section title="Tech stack">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map(([name, description]) => (
            <li key={name} className="bg-green p-5 flex flex-col gap-2">
              <span className="font-display text-2xl tracking-wide">{name}</span>
              <span className="font-body font-light">{description}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How feedback flows">
        <ol className="flex flex-col lg:flex-row lg:items-stretch gap-3">
          {flow.map(([name, description], index) => (
            <li key={name} className="flex flex-col lg:flex-row items-center gap-3 flex-1">
              <div className="border border-primary p-5 flex flex-col gap-2 w-full h-full">
                <span className="text-brown font-body text-sm">Step {index + 1}</span>
                <span className="font-display text-2xl tracking-wide">{name}</span>
                <span className="font-body font-light">{description}</span>
              </div>
              {index < flow.length - 1 && (
                <BsArrowRight
                  className="text-2xl shrink-0 rotate-90 lg:rotate-0 text-brown"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Data model">
        <pre className="bg-green p-5 overflow-x-auto text-sm leading-relaxed">
          <code>{dataModel}</code>
        </pre>
      </Section>

      <Section title="Security">
        <ul className="flex flex-col gap-3 font-body font-light text-lg max-w-3xl">
          {security.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="text-brown" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Features">
        <ul className="flex flex-wrap gap-3">
          {features.map((feature) => (
            <li key={feature} className="border border-primary px-4 py-2 font-body font-light">
              {feature}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Links">
        <ul className="flex flex-col sm:flex-row flex-wrap gap-4">
          {links.map(([label, href, Icon]) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green px-5 py-3 hover:shadow-lg"
              >
                <Icon aria-hidden="true" /> {label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

export default HowItsDeveloped;
