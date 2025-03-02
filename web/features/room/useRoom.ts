import { getFirestoreApp } from "@/firestore/config";
import { GameRoom } from "@/types/room";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

type playerOperation = {
  setElectricShock: boolean;
  selectSitChair: boolean;
  activate: boolean;
  wait: boolean;
};

export const useRoom = (initialData: {
  room: GameRoom | null;
  userId: string | null;
  roomId: string | null;
}) => {
  const [roomData, setRoomData] = useState<GameRoom | null>(initialData.room);
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const [playerOperation, setPlayerOperation] = useState<playerOperation>({
    setElectricShock: false,
    selectSitChair: false,
    activate: false,
    wait: false,
  });
  const previousRoomDataRef = useRef<GameRoom | null>(null);

  const roomId = initialData.roomId;
  const userId = initialData.userId;

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
          updatePlayerOperation(data);
          return data;
        });
        return () => unsubscribe();
      });
    };

    watchRoom();
  }, []);

  const updatePlayerOperation = (data: GameRoom) => {
    const operation: playerOperation = {
      setElectricShock: false,
      selectSitChair: false,
      activate: false,
      wait: false,
    };
    if (
      data?.round.attackerId !== userId &&
      data?.round.electricChair === null
    ) {
      operation.setElectricShock = true;
    } else if (
      data?.round.attackerId === userId &&
      data?.round.electricChair !== null &&
      data?.round.seatedChair === null
    ) {
      operation.selectSitChair = true;
    } else if (
      data?.round.phase === "activating" &&
      data?.round.attackerId !== userId
    ) {
      operation.activate = true;
    } else {
      operation.wait = true;
    }
    setPlayerOperation(operation);
  };

  const submitSelectedChair = async () => {
    const data = getSubmitRoundData(selectedChair);
    const res = await fetch(`/api/rooms/${roomId}/round`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: data }),
    });
    if (res.status !== 200) {
      const data = await res.json();
      console.error(data.error);
      return { status: res.status, error: data.error };
    }
    return { status: 200, data: data };
  };

  const submitActivate = async () => {
    const res = await fetch(`/api/rooms/${roomId}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status !== 200) {
      const data = await res.json();
      console.error(data.error);
      return { status: res.status, error: data.error };
    }
    return { status: 200, data: null };
  };

  const changeTurn = async () => {
    const res = await fetch(`/api/rooms/${roomId}/turn`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    if (res.status !== 200) {
      const data = await res.json();
      console.error(data.error);
      return { status: res.status, error: data.error };
    }
    return { status: 200, data: null };
  };

  const getSubmitRoundData = (chair: number | null) => {
    const round = roomData?.round;
    if (playerOperation.setElectricShock) {
      return {
        ...round,
        electricChair: chair,
        phase: "sitting",
      };
    } else if (playerOperation.selectSitChair) {
      return {
        ...round,
        seatedChair: chair,
        phase: "activating",
      };
    } else if (playerOperation.activate) {
      const electricChair = round?.electricChair;
      const seatedChair = round?.seatedChair;
      const resultStatus = electricChair === seatedChair ? "shocked" : "safe";
      const result = round?.result;
      return {
        ...round,
        result: {
          ...result,
          status: resultStatus,
        },
        phase: "result",
      };
    }

    return round;
  };

  return {
    roomData,
    selectedChair,
    setSelectedChair,
    submitSelectedChair,
    submitActivate,
    changeTurn,
    previousRoomDataRef,
    playerOperation,
  };
};
