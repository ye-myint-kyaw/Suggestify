import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  subscribeToUnreadCount,
  subscribeToUserBoxes,
} from "../util/firebase";

// Live list of the user's boxes plus a live unread count for each box.
export const useFeedbackBoxes = (userId) => {
  const [boxes, setBoxes] = useState(null);
  const [unread, setUnread] = useState({});

  useEffect(() => {
    if (!userId) return;

    const unreadListeners = new Map();
    const onError = (error) => {
      console.error(error);
      toast.error("Couldn't load your suggestion boxes.", { id: "boxes" });
    };

    const unsubscribeBoxes = subscribeToUserBoxes(
      userId,
      (userBoxes) => {
        setBoxes(userBoxes);
        const boxIds = new Set(userBoxes.map(({ id }) => id));

        boxIds.forEach((boxId) => {
          if (unreadListeners.has(boxId)) return;
          unreadListeners.set(
            boxId,
            subscribeToUnreadCount(
              boxId,
              (count) => setUnread((prev) => ({ ...prev, [boxId]: count })),
              (error) => console.error(error)
            )
          );
        });

        unreadListeners.forEach((unsubscribe, boxId) => {
          if (boxIds.has(boxId)) return;
          unsubscribe();
          unreadListeners.delete(boxId);
        });
      },
      onError
    );

    return () => {
      unsubscribeBoxes();
      unreadListeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [userId]);

  return { boxes, unread };
};
