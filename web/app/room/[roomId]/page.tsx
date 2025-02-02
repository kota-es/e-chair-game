"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { GameRoom, Player } from "@/types/room";
import { getFirestoreApp } from "@/firestore/config";
import { doc, onSnapshot } from "firebase/firestore";

import TurnResultModal from "@/components/modals/TurnResultModal";
import GameResultModal from "@/components/modals/GameResultModal";
import { Armchair, Copy, Zap } from "lucide-react";
import { Tooltip, TooltipRefProps } from "react-tooltip";

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

  const bgColor = selected ? "bg-white" : "bg-gray-700";
  const textColor = selected ? "text-gray-900" : "text-white";
  const textFont = selected ? "font-bold" : "font-normal";
  const textSize = selected ? "text-lg" : "text-sm";
  const cursor = wait ? "cursor-not-allowed" : "cursor-pointer";

  return (
    <div
      key={chair}
      className={`inline-flex items-center justify-center  absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${bgColor} ${textColor} ${textFont} ${textSize} transition-all duration-300 border border-white rounded-lg ${cursor}`}
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
  const sittingPhaseDialogRef = useRef<HTMLDialogElement>(null);
  const activateDialogRef = useRef<HTMLDialogElement>(null);
  const turnResultDialogRef = useRef<HTMLDialogElement>(null);
  const gameResultDialogRef = useRef<HTMLDialogElement>(null);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const startTurnDialogRef = useRef<HTMLDialogElement>(null);
  const tooltipRef = useRef<TooltipRefProps>(null);
  const handleCreaterShowModal = () => createrDialogRef.current?.showModal();
  const handleCrestorCloseModal = () => createrDialogRef.current?.close();
  const handleOpponentShowModal = () => opponentDialogRef.current?.showModal();
  const handleOpponentCloseModal = () => opponentDialogRef.current?.close();
  const handleShowSittingPhaseModal = () =>
    sittingPhaseDialogRef.current?.showModal();
  const handleCloseSittingPhaseModal = () =>
    sittingPhaseDialogRef.current?.close();
  const handleShowActivateModal = () => activateDialogRef.current?.showModal();
  const handleCloseActivateModal = () => activateDialogRef.current?.close();
  const handleShowTurnResultModal = () =>
    turnResultDialogRef.current?.showModal();
  const handleCloseTurnResultModal = () => turnResultDialogRef.current?.close();
  const handleShowGameResultModal = () =>
    gameResultDialogRef.current?.showModal();
  const handleShowConfirmModal = () => confirmDialogRef.current?.showModal();
  const handleCloseConfirmModal = () => confirmDialogRef.current?.close();
  const handleShowStartTurnModal = () =>
    startTurnDialogRef.current?.showModal();
  const handleCloseStartTurnModal = () => startTurnDialogRef.current?.close();

  const submitSelectedChair = async () => {
    handleCloseConfirmModal();
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
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(roomId!);
      tooltipRef.current?.open({
        anchorSelect: "#id-tooltip",
        content: "IDをコピーしました",
      });
    } catch (error) {
      console.error(error);
      tooltipRef.current?.open({
        anchorSelect: "#id-tooltip",
        content: "IDをコピーできませんでした",
      });
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
    if (playerOperation.setElectricShock) {
      return "電流を仕掛ける椅子を選んでください";
    }
    if (playerOperation.selectSitChair) {
      return "座る椅子を選んでください";
    }
    if (playerOperation.wait) {
      if (roomData?.round.phase === "setting") {
        return "相手が電流を仕掛けています。。。";
      }
      if (roomData?.round.phase === "sitting") {
        return "相手が座る椅子を選んでいます。。。";
      }
      if (roomData?.round.phase === "activating") {
        if (roomData?.round.attackerId === userId) {
          return "まもなく電流が起動します。。。";
        } else {
          return "電流を起動してください";
        }
      }
    }
    return "お待ちください。。。";
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

      if (roomData.round.phase === "setting") {
        handleShowStartTurnModal();
        setTimeout(() => {
          handleCloseStartTurnModal();
        }, 3000);
      }

      if (
        roomData.round.phase === "sitting" &&
        roomData.round.attackerId === userId
      ) {
        handleShowSittingPhaseModal();
        setTimeout(() => {
          handleCloseSittingPhaseModal();
        }, 3000);
      }
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
    <div className="min-h-screen text-white p-4 grid grid-cols-1 auto-rows-max gap-8">
      <div
        id="card"
        className="h-fit bg-gray-800 p-6 border-red-500 border-2 rounded-lg grid gap-6"
      >
        <div className="text-center text-lg">
          {roomData?.round?.count}回{" "}
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
            <p className="font-bold text-white text-xs bg-gray-800 bg-opacity-75 p-4 rounded-full whitespace-nowrap">
              {getInstruction()}
            </p>
          </div>
        )}
      </div>
      {!playerOperation.wait && !playerOperation.activate && selectedChair && (
        <button
          className="sticky bottom-3 inline-flex h-10 justify-center items-center rounded-full border-2 border-red-700 bg-red-500 font-bold text-sm text-white"
          onClick={handleShowConfirmModal}
        >
          確定
        </button>
      )}
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
          <div className="flex gap-2 m-auto text-center text-2xl text-red-500">
            <span>{roomId}</span>
            <div>
              <Tooltip ref={tooltipRef} style={{ fontSize: "16px" }} />
              <a id="id-tooltip" className="cursor-pointer" onClick={copyId}>
                <Copy className="text-red-800" />
              </a>
            </div>
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

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={sittingPhaseDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <h2 className="font-semibold text-red-500">
              <span>相手が電気椅子を仕掛けました</span>
            </h2>
            <p className="pt-1 text-gray-300">座る椅子を選択してください</p>
          </div>
          <button
            className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
            onClick={handleCloseSittingPhaseModal}
          >
            OK
          </button>
        </div>
      </dialog>

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={confirmDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <p className="pt-1 text-gray-300">
              {selectedChair}番の椅子で確定しますか？
            </p>
          </div>
          <div className="grid gap-4 grid-cols-2">
            <button
              className="inline-flex h-10 justify-center items-center rounded-full bg-gray-700 font-bold text-sm text-white"
              onClick={handleCloseConfirmModal}
            >
              キャンセル
            </button>
            <button
              className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
              onClick={submitSelectedChair}
            >
              確定
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center backdrop:bg-black/80 shadow-sm w-full bg-transparent"
        ref={startTurnDialogRef}
      >
        <div className="flex justify-center gap-4 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div className="animate-flip-in-ver-right flex flex-col items-center gap-4">
            <h2 className="font-semibold text-3xl text-red-500">
              {roomData?.round.count === 1 && roomData?.round.turn === "top" ? (
                <span>ゲーム開始</span>
              ) : (
                <span>攻守交代</span>
              )}
            </h2>
            <p className="pt-1 text-lg text-gray-300">
              {roomData?.round.attackerId === userId
                ? "電流を避けて椅子に座れ"
                : "仕掛けた電気椅子に座らせろ"}
            </p>
            <div className="flex justify-center">
              {roomData?.round.attackerId === userId ? (
                <Armchair className="w-24 h-24 text-red-500 animate-pulse" />
              ) : (
                <Zap className="w-24 h-24 text-red-500 animate-pulse" />
              )}
            </div>
          </div>
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
