import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "./components/Loader/Loader";
import { GuestOnly, RequireAuth } from "./components/RouteGuards/RouteGuards";

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const GetStarted = lazy(() => import("./pages/GetStarted/GetStarted"));
const FeedbackGiven = lazy(() => import("./pages/FeedbackGiven/FeedbackGiven"));
const HowItsDeveloped = lazy(() =>
  import("./pages/HowItsDeveloped/HowItsDeveloped")
);
const Home = lazy(() => import("./pages/Home/Home"));
const SuggestionBoxCreation = lazy(() =>
  import("./pages/SuggestionBoxCreation/SuggestionBoxCreation")
);
const Feedbacks = lazy(() => import("./pages/Feedbacks/Feedbacks"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const routes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-started" element={<GetStarted />} />
        </Route>
        <Route path="/give-feedback/:uid" element={<FeedbackGiven />} />
        <Route path="/how-it-is-developed" element={<HowItsDeveloped />} />
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
          <Route path="/home/create-box" element={<SuggestionBoxCreation />} />
          <Route path="/home/feedbacks/:uid" element={<Feedbacks />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default routes;
