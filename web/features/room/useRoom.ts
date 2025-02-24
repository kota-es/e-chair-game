import { getFirestoreApp } from "@/firestore/config";
import { GameRoom } from "@/types/room";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export const useRoom = (initialData: {
  room: GameRoom | null;
  userId: string | null;
  roomId: string | null;
}) => {
  const [roomData, setRoomData] = useState<GameRoom | null>(initialData.room);
  const previousRoomDataRef = useRef<GameRoom | null>(null);

  const roomId = initialData.roomId;

  useEffect(() => {
    const watchRoom = async () => {
      const db = await getFirestoreApp();
      const docRef = doc(db, "rooms", roomId!);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        const data = doc.data() as GameRoom;

        setRoomData((prev) => {
          if (data.round.phase === "activating") {
            previousRoomDataRef.current = prev;
          }
          return data;
        });
        return () => unsubscribe();
      });
    };

    watchRoom();
  }, []);

  return { roomData, previousRoomDataRef };
};
