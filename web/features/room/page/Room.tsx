"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import useSound from "use-sound";

import type { GameRoom, Player } from "@/types/room";
import { getFirestoreApp } from "@/firestore/config";
import { doc, onSnapshot } from "firebase/firestore";

import WaitingStartDialog from "@/features/room/components/dialogs/WaitingStartDialog";
import TurnResultModal from "@/components/modals/TurnResultModal";
import GameResultModal from "@/components/modals/GameResultModal";
import { Armchair, Zap } from "lucide-react";
import { TooltipRefProps } from "react-tooltip";
import InfoDialog from "@/components/modals/InfoDialog";
import { useToast } from "@/utils/toast/useToast";
import NoticeSatDialog from "@/features/room/components/dialogs/NoticeSatDialog";
import NoticeSetDialog from "@/features/room/components/dialogs/NoticeSetDialog";
import StartTurnDialog from "@/features/room/components/dialogs/StartTurnDialog";

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
      className={`inline-flex items-center justify-center absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 ${bgColor} ${textColor} ${textFont} ${textSize} transition-all duration-300 border border-white rounded-lg ${cursor} select-none`}
      style={{ left: `${left}%`, top: `${top}%` }}
      onClick={wait ? undefined : () => setSelectedChair(chair)}
    >
      {chair}
    </div>
  );
};

export default function Room({
  initialData,
}: {
  initialData: {
    room: GameRoom | null;
    userId: string | null;
    roomId: string | null;
  };
}) {
  const [playShockEffect] = useSound("/sounds/shock.mp3");
  const [playSafeEffect] = useSound("/sounds/safe.mp3");
  const router = useRouter();
  const toast = useToast();
  const [roomData, setRoomData] = useState<GameRoom | null>(initialData.room);
  const userId = initialData.userId;
  const roomId = initialData.roomId;
  const [playerOperation, setPlayerOperation] = useState<playerOperation>({
    setElectricShock: false,
    selectSitChair: false,
    activate: false,
    wait: false,
  });
  const [showShock, setShowShock] = useState<"" | "shock" | "safe">("");
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const waitingStartDialogRef = useRef<HTMLDialogElement>(null);
  const opponentDialogRef = useRef<HTMLDialogElement>(null);
  const sittingPhaseDialogRef = useRef<HTMLDialogElement>(null);
  const activateDialogRef = useRef<HTMLDialogElement>(null);
  const turnResultDialogRef = useRef<HTMLDialogElement>(null);
  const gameResultDialogRef = useRef<HTMLDialogElement>(null);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const startTurnDialogRef = useRef<HTMLDialogElement>(null);
  const tooltipRef = useRef<TooltipRefProps>(null);
  const previousRoomDataRef = useRef<GameRoom | null>(null);
  const handleShowWaitingSTartModal = () =>
    waitingStartDialogRef.current?.showModal();
  const handleCloseWaitingStartModal = () =>
    waitingStartDialogRef.current?.close();
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
      return;
    }
    toast.open(
      <span>
        <span style={{ color: "red", fontWeight: "bold", fontSize: "1.2rem" }}>
          {selectedChair}
        </span>
        番の椅子を選択しました。
      </span>
    );
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
    if (roomData?.createrId === userId) {
      handleShowWaitingSTartModal();
    } else {
      handleOpponentShowModal();
    }

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
      handleCloseWaitingStartModal();
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
    if (
      roomData.round.phase === "result" &&
      !roomData.round.result.shownResult
    ) {
      const effectType =
        roomData.round.result.status === "shocked" ? "shock" : "safe";
      if (effectType === "shock") {
        playShockEffect({
          playbackRate: 0.7,
        });
      } else {
        playSafeEffect();
      }
      setShowShock(effectType);
      setTimeout(() => {
        setShowShock("");
        if (roomData.winnerId) {
          handleShowGameResultModal();
        } else {
          handleShowTurnResultModal();
        }
      }, 1500);
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
            <p
              className={`font-bold text-white text-sm bg-gray-800 bg-opacity-75 p-3 rounded-full whitespace-nowrap
              ${
                (playerOperation.setElectricShock ||
                  playerOperation.selectSitChair) &&
                "animate-pulse"
              }
              `}
            >
              {getInstruction()}
            </p>
          </div>
        )}
      </div>
      {!playerOperation.wait && !playerOperation.activate && selectedChair && (
        <button
          className="sticky bottom-3 inline-flex h-10 justify-center items-center rounded-full border-2 border-red-700 bg-red-500 font-bold text-sm text-white"
          onClick={submitSelectedChair}
        >
          確定
        </button>
      )}
      <WaitingStartDialog
        roomId={roomId!}
        dialogRef={waitingStartDialogRef}
        tooltipRef={tooltipRef}
        copyId={copyId}
      />
      <NoticeSatDialog dialogRef={activateDialogRef} action={submitActivate} />
      <NoticeSetDialog
        dialogRef={sittingPhaseDialogRef}
        action={handleCloseSittingPhaseModal}
      />
      <StartTurnDialog
        dialogRef={startTurnDialogRef}
        round={roomData!.round}
        userId={userId!}
      />
      <TurnResultModal
        ref={turnResultDialogRef}
        roomData={roomData!}
        previousRoomData={previousRoomDataRef.current!}
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
        <div className="fixed inset-0 bg-yellow-300 bg-opacity-70 flex items-center justify-center z-50">
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
