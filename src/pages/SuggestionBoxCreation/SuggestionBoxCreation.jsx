import { Formik } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { createFeedbackBox } from "../../util/firebase";

const MAX_NAME_LENGTH = 120;

const SuggestionBoxCreation = () => {
  const nav = useNavigate();
  const userId = useSelector((state) => state.user.uid);

  return (
    <div className="min-h-[90vh] bg-primary flex flex-col px-5 md:px-10 pb-10">
      <div className="flex justify-end py-10">
        <NavLink
          to={"/home"}
          className={
            "bg-darkGreen shadow text-primary text-lg flex items-center justify-center px-4 py-1"
          }
        >
          Go Back
        </NavLink>
      </div>
      <div className="flex-1 flex items-center">
        <div className="bg-darkGreen min-w-0 md:w-3/4 w-full max-w-full px-5 py-12 lg:px-11 flex items-center">
          <Formik
            initialValues={{ question: "" }}
            validate={(values) => {
              const error = {};
              if (!values.question.trim()) error.question = "Required";
              return error;
            }}
            onSubmit={async (values) => {
              try {
                const boxId = await createFeedbackBox(
                  userId,
                  values.question.trim()
                );
                toast.success("Your suggestion box is ready to share!");
                nav(`/home/feedbacks/${boxId}`);
              } catch (error) {
                console.error(error);
                toast.error("Couldn't create the box. Please try again.");
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
                <div className="flex flex-col">
                  <label
                    htmlFor="question"
                    className="font-display text-3xl md:text-4xl tracking-wide"
                  >
                    What do you want feedback on?
                  </label>
                  <input
                    id="question"
                    type="text"
                    name="question"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.question}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="e.g. How was my talk today?"
                    className="border-b border-primary outline-none py-5 text-xl w-full bg-inherit placeholder:text-primary placeholder:opacity-60"
                  />

                  <div className="flex justify-between text-lg mt-1 h-5">
                    <span className="text-red">
                      {errors.question && touched.question && errors.question}
                    </span>
                    <span className="text-sm opacity-70">
                      {values.question.length}/{MAX_NAME_LENGTH}
                    </span>
                  </div>

                  <button
                    className="bg-green md:min-w-[300px] w-auto md:w-3/5 max-w-full mt-5 h-fit px-7 py-2 text-lg disabled:opacity-60"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating…" : "Create suggestion box"}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SuggestionBoxCreation;
