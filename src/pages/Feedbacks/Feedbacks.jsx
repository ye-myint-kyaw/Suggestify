import { NavLink, useNavigate, useParams } from "react-router-dom";
import "./style.css";
import { BsBookmarkCheckFill, BsBookmarkPlus } from "react-icons/bs";
import {
  FiDownload,
  FiEdit2,
  FiLock,
  FiShare2,
  FiTrash2,
  FiUnlock,
} from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import QrCode from "../../components/QRCode/QrCode";
import Loader from "../../components/Loader/Loader";
import Modal, { ConfirmModal } from "../../components/Modal/Modal";
import {
  deleteFeedback,
  deleteFeedbackBox,
  markFeedbacksRead,
  renameFeedbackBox,
  setFeedbackBoxOpen,
  subscribeToFeedbackBox,
  subscribeToFeedbacks,
  updateMarkFeedback,
} from "../../util/firebase";
import {
  downloadBlob,
  formatDate,
  slugify,
  timeAgo,
} from "../../util/helpers";

const MAX_NAME_LENGTH = 120;

const buttonBase =
  "text-primary h-fit px-3 py-1 rounded-sm w-fit inline-flex items-center gap-2 disabled:opacity-60";
const toolbarButton = `${buttonBase} bg-darkGreen`;
const dangerButton = `${buttonBase} bg-red`;

const Feedbacks = () => {
  const { uid } = useParams();
  const { uid: userId, displayName } = useSelector((state) => state.user);
  const nav = useNavigate();

  // undefined while loading, null when the box doesn't exist
  const [box, setBox] = useState(undefined);
  const [feedbacks, setFeedbacks] = useState(null);
  const [loadError, setLoadError] = useState(null);
  // Feedback that was unread when it arrived during this visit. It stays
  // highlighted even though it is marked as read in Firestore right away.
  const [newIds, setNewIds] = useState(() => new Set());
  const [filter, setFilter] = useState("all");
  const [isShare, setIsShare] = useState(false);
  const [modal, setModal] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    const onError = (error) => {
      if (isDeletingRef.current) return;
      console.error(error);
      setLoadError(error.code === "permission-denied" ? "denied" : "unknown");
    };

    const unsubscribeBox = subscribeToFeedbackBox(uid, setBox, onError);
    const unsubscribeFeedbacks = subscribeToFeedbacks(
      uid,
      (list) => {
        setFeedbacks(list);
        const unreadIds = list
          .filter((feedback) => !feedback.isRead)
          .map((feedback) => feedback.id);
        if (!unreadIds.length) return;

        setNewIds((prev) => new Set([...prev, ...unreadIds]));
        markFeedbacksRead(uid, unreadIds).catch((error) =>
          console.error("Error marking feedback as read:", error)
        );
      },
      onError
    );

    return () => {
      unsubscribeBox();
      unsubscribeFeedbacks();
    };
  }, [uid]);

  const visibleFeedbacks = useMemo(() => {
    if (!feedbacks) return [];
    if (filter === "saved") return feedbacks.filter(({ isMarked }) => isMarked);
    if (filter === "unread") return feedbacks.filter(({ id }) => newIds.has(id));
    return feedbacks;
  }, [feedbacks, filter, newIds]);

  const closeModal = () => !isBusy && setModal(null);

  // Runs a modal action, keeps the modal open (and busy) until it finishes.
  const runModalAction = async (action, errorMessage) => {
    setIsBusy(true);
    try {
      await action();
      setModal(null);
    } catch (error) {
      console.error(error);
      toast.error(errorMessage);
    } finally {
      setIsBusy(false);
    }
  };

  const toggleMarkFeedback = async (id, isMarked) => {
    try {
      await updateMarkFeedback(uid, id, !isMarked);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't update the bookmark.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // react-pdf is large, so it is only downloaded when someone exports.
      const [{ pdf }, { default: FeedbackPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../Pdf/FeedbackPdf"),
      ]);
      const report = await pdf(
        <FeedbackPdf
          feedbacks={visibleFeedbacks}
          title={box.name}
          name={displayName}
        />
      ).toBlob();
      downloadBlob(report, `${slugify(box.name)}.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Couldn't create the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleOpen = async () => {
    try {
      await setFeedbackBoxOpen(userId, uid, !box.isOpen);
      toast.success(
        box.isOpen
          ? "Box closed. It no longer accepts feedback."
          : "Box reopened. It accepts feedback again."
      );
    } catch (error) {
      console.error(error);
      toast.error("Couldn't update the box.");
    }
  };

  const handleRename = (e) => {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name").trim();
    if (!name || name === box.name) return setModal(null);
    runModalAction(
      () => renameFeedbackBox(userId, uid, name),
      "Couldn't rename the box."
    );
  };

  const handleDeleteBox = async () => {
    isDeletingRef.current = true;
    setIsBusy(true);
    try {
      await deleteFeedbackBox(userId, uid);
      toast.success("Suggestion box deleted.");
      nav("/home", { replace: true });
    } catch (error) {
      isDeletingRef.current = false;
      console.error(error);
      toast.error("Couldn't delete the box.");
      setIsBusy(false);
    }
  };

  const handleDeleteFeedback = () =>
    runModalAction(
      () => deleteFeedback(uid, modal.feedbackId),
      "Couldn't delete the feedback."
    );

  const handleGoBack = () => {
    isShare ? setIsShare(false) : nav("/home");
  };

  // The box listener fires as soon as the delete is applied locally.
  if (isDeletingRef.current) return <Loader />;

  if (box === null) {
    return (
      <div className="min-h-[90vh] bg-primary text-darkGreen flex flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="font-display text-5xl tracking-wide">
          This box doesn&apos;t exist
        </h1>
        <p className="font-body font-light text-lg">
          It may have been deleted.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <NavLink to="/home" className={toolbarButton}>
            Back to my boxes
          </NavLink>
          <button
            className="border border-darkGreen px-3 py-1"
            onClick={handleDeleteBox}
            disabled={isBusy}
          >
            Remove from my list
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[90vh] bg-primary text-darkGreen flex flex-col items-center justify-center gap-5 px-5 text-center">
        <h1 className="font-display text-5xl tracking-wide">
          {loadError === "denied"
            ? "You don't have access to this box"
            : "Something went wrong"}
        </h1>
        <NavLink to="/home" className={toolbarButton}>
          Back to my boxes
        </NavLink>
      </div>
    );
  }

  if (box === undefined || feedbacks === null) return <Loader />;

  const showShare = isShare || feedbacks.length === 0;

  return (
    <div className="min-h-screen bg-primary flex flex-col md:px-10 px-5 pb-10">
      <div className="flex justify-between items-start flex-col-reverse md:flex-row pt-10 pb-5 gap-5">
        <h1 className="bg-darkGreen shadow font-display text-primary rounded-sm text-4xl flex flex-wrap items-center gap-3 px-4 py-2 max-w-full break-words">
          {box.name}
          {!box.isOpen && (
            <span className="text-xs font-sans uppercase tracking-widest border border-brown text-brown px-1.5 py-0.5">
              Closed
            </span>
          )}
        </h1>
        <button
          className={"bg-darkGreen text-primary h-fit px-4 py-1 rounded-sm w-fit ms-auto"}
          onClick={handleGoBack}
        >
          {isShare && feedbacks.length > 0 ? "Back to feedback" : "Go Back"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pb-5" role="toolbar" aria-label="Box actions">
        {!showShare && (
          <>
            <button className={toolbarButton} onClick={() => setIsShare(true)}>
              <FiShare2 aria-hidden="true" /> Share
            </button>
            <button
              className={toolbarButton}
              onClick={handleExport}
              disabled={isExporting || visibleFeedbacks.length === 0}
            >
              <FiDownload aria-hidden="true" />
              {isExporting ? "Exporting…" : "Export PDF"}
            </button>
          </>
        )}
        <button className={toolbarButton} onClick={handleToggleOpen}>
          {box.isOpen ? (
            <>
              <FiLock aria-hidden="true" /> Close box
            </>
          ) : (
            <>
              <FiUnlock aria-hidden="true" /> Reopen box
            </>
          )}
        </button>
        <button className={toolbarButton} onClick={() => setModal({ type: "rename" })}>
          <FiEdit2 aria-hidden="true" /> Rename
        </button>
        <button
          className={dangerButton}
          onClick={() => setModal({ type: "deleteBox" })}
        >
          <FiTrash2 aria-hidden="true" /> Delete box
        </button>
      </div>

      {!box.isOpen && (
        <p className="bg-brown/20 text-darkGreen px-4 py-2 mb-5 font-body font-light">
          This box is closed. People with the link can&apos;t send new feedback
          until you reopen it.
        </p>
      )}

      {showShare ? (
        <div className="py-5">
          {feedbacks.length === 0 && (
            <p className="text-darkGreen text-center font-body font-light text-lg mb-8">
              No feedback yet. New responses will appear here instantly.
            </p>
          )}
          <QrCode
            url={`${window.location.origin}/give-feedback/${uid}`}
            name={box.name}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-3 md:gap-0">
            <p className="text-darkGreen font-display text-3xl" aria-live="polite">
              {filter === "all"
                ? `${feedbacks.length} feedback received`
                : `Showing ${visibleFeedbacks.length} of ${feedbacks.length}`}
            </p>
            <label className="flex items-center gap-2 text-darkGreen">
              <span className="sr-only md:not-sr-only">Filter</span>
              <select
                name="Filter"
                value={filter}
                className="bg-darkGreen text-primary px-2 py-1 text-xl h-fit"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="saved">Saved</option>
                <option value="unread">Unread</option>
              </select>
            </label>
          </div>

          {visibleFeedbacks.length === 0 ? (
            <p className="text-darkGreen font-body font-light text-lg py-10">
              {filter === "saved"
                ? "Nothing saved yet. Bookmark feedback to find it here."
                : "No unread feedback. You're all caught up."}
            </p>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5 py-10">
              {visibleFeedbacks.map(({ id, feedback, isMarked, dateTime }) => {
                const isNew = newIds.has(id);
                return (
                  <li
                    className={`text-primary shadow-lg py-3 px-5 rounded flex items-start gap-4 ${
                      isNew ? "unread" : "bg-green"
                    }`}
                    key={id}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-light text-lg whitespace-pre-wrap break-words">
                        {feedback}
                      </p>
                      <time
                        dateTime={new Date(dateTime).toISOString()}
                        title={formatDate(dateTime)}
                        className="block text-sm opacity-70 mt-2"
                      >
                        {timeAgo(dateTime)}
                        {isNew && " · new"}
                      </time>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        className={`text-3xl hover:scale-95 ${
                          isNew ? "text-primary" : "text-darkGreen"
                        }`}
                        onClick={() => toggleMarkFeedback(id, isMarked)}
                        aria-pressed={isMarked}
                        aria-label={isMarked ? "Remove bookmark" : "Bookmark"}
                        title={isMarked ? "Remove bookmark" : "Bookmark"}
                      >
                        {isMarked ? <BsBookmarkCheckFill /> : <BsBookmarkPlus />}
                      </button>
                      <button
                        className="text-xl opacity-60 hover:opacity-100"
                        onClick={() =>
                          setModal({ type: "deleteFeedback", feedbackId: id })
                        }
                        aria-label="Delete feedback"
                        title="Delete feedback"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={modal?.type === "deleteBox"}
        onClose={closeModal}
        onConfirm={handleDeleteBox}
        isBusy={isBusy}
        title="Delete this box?"
        message={`"${box.name}" and all of its feedback will be deleted permanently. The share link will stop working.`}
        confirmText="Delete box"
      />
      <ConfirmModal
        isOpen={modal?.type === "deleteFeedback"}
        onClose={closeModal}
        onConfirm={handleDeleteFeedback}
        isBusy={isBusy}
        title="Delete this feedback?"
        message="This can't be undone."
      />
      <Modal isOpen={modal?.type === "rename"} onClose={closeModal} title="Rename box">
        {modal?.type === "rename" && (
          <form onSubmit={handleRename} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="sr-only">Box name</span>
              <input
                name="name"
                defaultValue={box.name}
                maxLength={MAX_NAME_LENGTH}
                required
                autoFocus
                className="border-b border-darkGreen bg-inherit outline-none py-2 text-xl"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="border border-darkGreen px-4 py-1"
                onClick={closeModal}
                disabled={isBusy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-darkGreen text-primary px-4 py-1 disabled:opacity-60"
                disabled={isBusy}
              >
                {isBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Feedbacks;
