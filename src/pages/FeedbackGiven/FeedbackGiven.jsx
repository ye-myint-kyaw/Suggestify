import { Formik } from "formik";
import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { addFeedback, getFeedbackBox } from "../../util/firebase";
import Loader from "../../components/Loader/Loader";

const MAX_FEEDBACK_LENGTH = 1000;

const Message = ({ title, children }) => (
  <div className="flex flex-col items-center text-center gap-4 px-5 max-w-lg mx-auto">
    <h1 className="capitalize text-4xl text-primary font-display tracking-wide">
      {title}
    </h1>
    {children}
  </div>
);

const FeedbackGiven = () => {
  const { uid } = useParams();
  // undefined while loading, null when the box doesn't exist
  const [box, setBox] = useState(undefined);
  const [isFeedbackGiven, setIsFeedbackGiven] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    getFeedbackBox(uid)
      .then((result) => isCurrent && setBox(result))
      .catch((error) => {
        console.error(error);
        if (isCurrent) setBox(null);
      });
    return () => {
      isCurrent = false;
    };
  }, [uid]);

  if (box === undefined) return <Loader />;

  return (
    <div className="min-h-[90vh] flex flex-col justify-center gap-10 py-10">
      {!box ? (
        <Message title="Suggestion box not found">
          <p className="font-body font-light text-lg">
            This link may be wrong, or the owner deleted the box.
          </p>
        </Message>
      ) : !box.isOpen ? (
        <Message title={box.name}>
          <p className="font-body font-light text-lg">
            This suggestion box is closed and no longer accepting feedback.
          </p>
        </Message>
      ) : isFeedbackGiven ? (
        <Message title="Thank you for your feedback">
          <p className="font-body font-light text-lg">
            It was sent anonymously to the owner of “{box.name}”.
          </p>
          <button
            className="border border-primary px-5 py-2 hover:bg-green"
            onClick={() => setIsFeedbackGiven(false)}
          >
            Send another response
          </button>
        </Message>
      ) : (
        <Formik
          initialValues={{ feedback: "" }}
          validate={(values) => {
            const error = {};
            if (!values.feedback.trim()) error.feedback = "Required";
            return error;
          }}
          onSubmit={async (values, { resetForm }) => {
            try {
              await addFeedback(uid, values.feedback.trim());
              resetForm();
              setIsFeedbackGiven(true);
            } catch (error) {
              console.error(error);
              toast.error(
                "Couldn't send your feedback. The box may have just closed."
              );
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} className="w-full">
              <div className="flex flex-col max-w-[500px] px-5 md:px-10 mx-auto">
                <label
                  htmlFor="feedback"
                  className="capitalize text-3xl text-primary font-display tracking-wide mb-5 break-words"
                >
                  {box.name}
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.feedback}
                  rows={7}
                  maxLength={MAX_FEEDBACK_LENGTH}
                  placeholder="Answer anonymously"
                  aria-describedby="feedback-hint"
                  className="text-lg bg-inherit border rounded resize-none border-primary
              focus:outline-none text-primary p-2 placeholder:text-primary placeholder:opacity-60"
                />

                <div className="flex justify-between text-lg mt-1 h-5">
                  <span className="text-red">
                    {errors.feedback && touched.feedback && errors.feedback}
                  </span>
                  <span id="feedback-hint" className="text-sm opacity-70">
                    {values.feedback.length}/{MAX_FEEDBACK_LENGTH}
                  </span>
                </div>

                <p className="font-body font-light text-sm opacity-80 mt-3">
                  Your name and account are never attached to your answer.
                </p>

                <button
                  className="bg-green mt-5 w-fit h-fit px-7 py-2 text-lg rounded disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Submit"}
                </button>
              </div>
            </form>
          )}
        </Formik>
      )}
      <NavLink
        className="border border-green mx-auto w-fit h-fit px-7 py-2 text-lg hover:bg-green"
        to={"/get-started"}
      >
        Make Your Own Suggestion Box
      </NavLink>
    </div>
  );
};

export default FeedbackGiven;
