import { NavLink } from "react-router-dom";

const FeedbackTab = ({ feedback: { name, id, isOpen }, unreadFeedbackNumber }) => {
  const unreadLabel = unreadFeedbackNumber > 99 ? "99+" : unreadFeedbackNumber;

  return (
    <NavLink
      to={`feedbacks/${id}`}
      className="bg-darkGreen w-fit h-fit px-2 py-2 relative flex items-center gap-3 hover:shadow-lg transition-shadow"
      aria-label={`${name}${unreadFeedbackNumber ? `, ${unreadFeedbackNumber} unread` : ""}${isOpen ? "" : ", closed"}`}
    >
      <span className="md:text-4xl text-2xl font-display tracking-wide">
        {name}
      </span>
      {!isOpen && (
        <span className="text-xs uppercase tracking-widest border border-brown text-brown px-1.5 py-0.5">
          Closed
        </span>
      )}

      {unreadFeedbackNumber > 0 && (
        <span
          className="flex justify-center items-center text-xs absolute -right-[0.625rem]
        -top-[0.625rem] min-w-5 h-5 px-1 rounded-full bg-red"
          aria-hidden="true"
        >
          {unreadLabel}
        </span>
      )}
    </NavLink>
  );
};

export default FeedbackTab;
