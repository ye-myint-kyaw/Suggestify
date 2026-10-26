import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FeedbackBoxSkeleton = () => {
  return (
    <div className="md:px-10 px-5">
      <SkeletonTheme baseColor="#283618" highlightColor="#606C38">
        <div className="flex gap-4 ">
          <div className="flex-1 ">
            <Skeleton height={56} className="rounded-none" />
          </div>
          <div className="flex-grow-[2]">
            <Skeleton height={56} className="rounded-none" />
          </div>
          <div className="flex-grow-[1.5]">
            <Skeleton height={56} className="rounded-none" />
          </div>
        </div>
        <div className="flex gap-4 my-4">
          <div className="flex-grow-[2]">
            <Skeleton height={56} className="rounded-none" />
          </div>
          <div className="flex-grow-[1.5]">
            <Skeleton height={56} className="rounded-none" />
          </div>
          <div className="flex-grow-[1]">
            <Skeleton height={56} className="rounded-none" />
          </div>
        </div>
      </SkeletonTheme>
    </div>
  );
};

export default FeedbackBoxSkeleton;
