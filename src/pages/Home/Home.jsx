import { NavLink } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import FeedbackTab from "../../components/FeedbackTab/FeedbackTab";
import FeedbackBoxSkeleton from "../../components/FeedbackBoxSkeleton/FeedbackBoxSkeleton";
import { useFeedbackBoxes } from "../../hooks/useFeedbackBoxes";

const Home = () => {
  const userId = useSelector((state) => state.user.uid);
  const { boxes, unread } = useFeedbackBoxes(userId);
  const [search, setSearch] = useState("");

  // Boxes with the most unread feedback come first.
  const visibleBoxes = useMemo(() => {
    if (!boxes) return null;
    const term = search.trim().toLowerCase();
    return boxes
      .filter((box) => box.name.toLowerCase().includes(term))
      .sort((a, b) => (unread[b.id] ?? 0) - (unread[a.id] ?? 0));
  }, [boxes, unread, search]);

  return (
    <div className="min-h-[90vh] bg-green flex flex-col pb-5">
      <div className="flex flex-col-reverse gap-5 md:gap-0 md:flex-row justify-between md:px-10 py-10 px-5  ">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border w-full md:w-auto md:min-w-[300px] shadow text-primary border-primary text-lg rounded-md bg-inherit px-3 py-1 outline-none placeholder:text-primary placeholder:opacity-80"
          placeholder="Search..."
          aria-label="Search suggestion boxes"
        />
        <NavLink
          to={"create-box"}
          className={
            "bg-darkGreen shadow text-primary text-lg h-fit w-fit flex items-center justify-center px-4 py-1 hover:shadow-lg"
          }
        >
          + Create Suggestion Box
        </NavLink>
      </div>
      {!visibleBoxes ? (
        <div>
          <FeedbackBoxSkeleton />
          <FeedbackBoxSkeleton />
        </div>
      ) : boxes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 px-5 pb-10">
          <h1 className="font-display text-5xl md:text-6xl tracking-wide">
            No suggestion boxes yet
          </h1>
          <p className="font-body font-light text-lg max-w-md">
            Create a box, share its QR code, and start collecting honest,
            anonymous feedback.
          </p>
          <NavLink
            to={"create-box"}
            className="bg-darkGreen text-primary text-xl px-6 py-2 hover:shadow-lg"
          >
            Create your first box
          </NavLink>
        </div>
      ) : visibleBoxes.length === 0 ? (
        <p className="md:px-10 px-5 font-body font-light text-lg">
          No boxes match “{search}”.
        </p>
      ) : (
        <div className="flex flex-wrap md:px-10 px-5 gap-4  ">
          {visibleBoxes.map((box) => (
            <FeedbackTab
              feedback={box}
              unreadFeedbackNumber={unread[box.id] ?? 0}
              key={box.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
