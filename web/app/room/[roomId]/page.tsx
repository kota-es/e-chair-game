"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { GameRoom, Player } from "@/types/room";
import { getFirestoreApp } from "@/firestore/config";
import { doc, onSnapshot } from "firebase/firestore";

import TurnResultModal from "@/components/modals/TurnResultModal";
import GameResultModal from "@/components/modals/GameResultModal";
import { Zap } from "lucide-react";

type playerOperation = {
  setElectricShock: boolean;
  selectSitChair: boolean;
  activate: boolean;
  wait: boolean;
};

const renderChair = (
  chair: number,
  setSelectedChair: (chair: number) => void,
  wait: boolean,
  selected: boolean
) => {
  const index = chair - 1;
  const angle = ((index - 2) / 12) * 2 * Math.PI;
  const radius = 45;
  const left = 50 + radius * Math.cos(angle);
  const top = 50 + radius * Math.sin(angle);

  const bgColor = selected ? "bg-red-500" : "bg-gray-700";
  const cursor = wait ? "cursor-not-allowed" : "cursor-pointer";

  return (
    <div
      key={chair}
      className={`inline-flex items-center justify-center  absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${bgColor} text-gray-300 transition-all duration-300 border border-white rounded-lg ${cursor}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={wait ? undefined : () => setSelectedChair(chair)}
    >
      {chair}
    </div>
  );
};

export default function RoomPage() {
  const router = useRouter();
  const [roomData, setRoomData] = useState<GameRoom | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerOperation, setPlayerOperation] = useState<playerOperation>({
    setElectricShock: false,
    selectSitChair: false,
    activate: false,
    wait: false,
  });
  const [showShock, setShowShock] = useState<"" | "shock" | "safe">("");
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const createrDialogRef = useRef<HTMLDialogElement>(null);
  const opponentDialogRef = useRef<HTMLDialogElement>(null);
  const activateDialogRef = useRef<HTMLDialogElement>(null);
  const turnResultDialogRef = useRef<HTMLDialogElement>(null);
  const gameResultDialogRef = useRef<HTMLDialogElement>(null);
  const handleCreaterShowModal = () => createrDialogRef.current?.showModal();
  const handleCrestorCloseModal = () => createrDialogRef.current?.close();
  const handleOpponentShowModal = () => opponentDialogRef.current?.showModal();
  const handleOpponentCloseModal = () => opponentDialogRef.current?.close();
  const handleShowActivateModal = () => activateDialogRef.current?.showModal();
  const handleCloseActivateModal = () => activateDialogRef.current?.close();
  const handleShowTurnResultModal = () =>
    turnResultDialogRef.current?.showModal();
  const handleCloseTurnResultModal = () => turnResultDialogRef.current?.close();
  const handleShowGameResultModal = () =>
    gameResultDialogRef.current?.showModal();

  const submitSelectedChair = async () => {
    const chair = selectedChair;
    if (!confirm(`${chair}番の椅子で良いですか？`)) {
      return;
    }
    const data = getSubmitRoundData(chair);
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
    }
  };

  const submitActivate = async () => {
    handleCloseActivateModal();
    const res = await fetch(`/api/rooms/${roomId}/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status !== 200) {
      const data = await res.json();
      console.error(data.error);
    }
  };

  const changeTurn = async () => {
    handleCloseTurnResultModal();
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
    }
    setSelectedChair(null);
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

  const myStatus = () => {
    const player = roomData?.players.find((player) => player.id === userId);
    if (!player) {
      return {
        id: "",
        point: 0,
        shockedCount: 0,
        ready: false,
      };
    }
    return player as Player;
  };

  const opponentStatus = () => {
    const player = roomData?.players.find((player) => player.id !== userId);
    if (!player) {
      return {
        id: "",
        point: 0,
        shockedCount: 0,
        ready: false,
      };
    }
    return player;
  };

  const getInstruction = () => {
    if (playerOperation.selectSitChair) {
      return "座る椅子を選んでください";
    }
    if (playerOperation.setElectricShock) {
      return "電流を設置してください";
    }
    if (playerOperation.wait) {
      if (roomData?.round.attackerId === userId) {
        if (roomData?.round.phase === "activating") {
          return "まもなく電流が起動します";
        }
        return "相手が電気椅子を設置中";
      }
      if (roomData?.round.attackerId !== userId) {
        if (roomData?.round.phase === "activating") {
          return "電流を起動してください";
        }
        return "相手が座る椅子を選択中。。。";
      }
    }
  };

  const getButtonLabel = () => {
    if (playerOperation.selectSitChair) {
      return "座る椅子を確定";
    }
    if (playerOperation.setElectricShock) {
      return "設置する椅子を確定";
    }
    return "お待ちください";
  };

  const updatePlayerOperation = () => {
    const operation: playerOperation = {
      setElectricShock: false,
      selectSitChair: false,
      activate: false,
      wait: false,
    };
    if (
      roomData?.round.attackerId !== userId &&
      roomData?.round.electricChair === null
    ) {
      operation.setElectricShock = true;
    } else if (
      roomData?.round.attackerId === userId &&
      roomData?.round.electricChair !== null &&
      roomData?.round.seatedChair === null
    ) {
      operation.selectSitChair = true;
    } else if (
      roomData?.round.phase === "activating" &&
      roomData?.round.attackerId !== userId
    ) {
      operation.activate = true;
    } else {
      operation.wait = true;
    }
    setPlayerOperation(operation);
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setUserId(userId);
    const roomId = localStorage.getItem("roomId");
    setRoomId(roomId);
    const entryRoom = async () => {
      const res = await fetch(`/api/rooms/${roomId}/entry`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (res.status === 200) {
        const data = await res.json();
        const room: GameRoom = data.data;

        setRoomData(room);
        if (room.createrId === userId) {
          handleCreaterShowModal();
        } else {
          handleOpponentShowModal();
        }
        const db = await getFirestoreApp();
        const docRef = doc(db, "rooms", roomId!);
        const unsubscribe = onSnapshot(docRef, (doc) => {
          const data = doc.data() as GameRoom;
          if (data.round.phase === "result" && !data.round.result.shownResult) {
            const effectType =
              data.round.result.status === "shocked" ? "shock" : "safe";
            setShowShock(effectType);
            setTimeout(() => {
              setShowShock("");
              if (data.winnerId) {
                handleShowGameResultModal();
              } else {
                handleShowTurnResultModal();
              }
            }, 1500);
          }
          setRoomData(data);
        });

        return () => unsubscribe();
      }
    };

    entryRoom();
  }, []);

  const isAllReady = () => {
    if (!roomData) return false;
    return (
      roomData.players.length == 2 &&
      roomData.players.every((player) => player.ready)
    );
  };

  useEffect(() => {
    if (!roomData) return;
    if (isAllReady()) {
      handleCrestorCloseModal();
      handleOpponentCloseModal();
    }
    if (
      roomData.round.attackerId !== userId &&
      roomData.round.phase === "activating"
    ) {
      handleShowActivateModal();
    }
    updatePlayerOperation();
  }, [roomData]);

  const toToP = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 grid grid-cols-1 auto-rows-max gap-8">
      <div
        id="card"
        className="h-fit bg-gray-800 p-6 border-red-500 border-2 rounded-lg grid gap-6"
      >
        <div className="text-center text-lg">
          ラウンド: {roomData?.round?.count}回{" "}
          {roomData?.round.turn === "top" ? "表" : "裏"}
          <div>
            {roomData?.round.attackerId === userId
              ? "攻撃ターン：電気椅子を避けて座れ！"
              : "守備ターン：電気椅子に座らせろ！"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PlayerStatus userId={userId} status={myStatus()} />
          <PlayerStatus userId={userId} status={opponentStatus()} />
        </div>
      </div>
      <div className="relative w-full max-w-md aspect-square mx-auto">
        {roomData?.remainingChairs.map((chair) =>
          renderChair(
            chair,
            setSelectedChair,
            playerOperation.wait,
            selectedChair === chair
          )
        )}
        {isAllReady() && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="font-bold text-white bg-gray-800 bg-opacity-75 p-4 rounded-full whitespace-nowrap">
              {getInstruction()}
            </p>
          </div>
        )}
      </div>
      <button
        className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
        disabled={playerOperation.wait || !selectedChair}
        onClick={submitSelectedChair}
      >
        {getButtonLabel()}
      </button>

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={createrDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <h2 className="font-semibold text-red-500">
              <span>ルームを作成しました</span>
            </h2>
            <p className="pt-1 text-gray-300">
              下記のルームIDを対戦相手に伝えてください。
            </p>
            <p className="pt-1 text-gray-300">
              対戦相手が入室しだい、ゲームを開始します。
            </p>
          </div>
          <div className="text-center text-2xl text-red-500">
            <span>{roomId}</span>
          </div>
        </div>
      </dialog>

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={opponentDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <p className="pt-1 text-center text-gray-300">
              まもなくゲームを開始します。
            </p>
          </div>
        </div>
      </dialog>

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={activateDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <h2 className="font-semibold text-red-500">
              <span>相手が椅子に座りました</span>
            </h2>
            <p className="pt-1 text-gray-300">電流を起動してください</p>
          </div>
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
            onClick={submitActivate}
          >
            起動
          </button>
        </div>
      </dialog>

      <TurnResultModal
        ref={turnResultDialogRef}
        roomData={roomData!}
        userId={userId!}
        close={changeTurn}
      />

      <GameResultModal
        ref={gameResultDialogRef}
        roomData={roomData!}
        userId={userId!}
        close={toToP}
      />
      {showShock === "shock" && (
        <div className="fixed inset-0 bg-yellow-500 bg-opacity-70 flex items-center justify-center z-50">
          <Zap className="animate-shock-vibrate text-red-700 w-48 h-48 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        </div>
      )}
      {showShock === "safe" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="animate-pulse text-white w-48 h-48 text-center flex justify-center">
            <span className="font-bold text-9xl">SAFE</span>
          </div>
        </div>
      )}
    </div>
  );
}
