"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { TooltipRefProps } from "react-tooltip";
import { Zap } from "lucide-react";
import useSound from "use-sound";

import { getFirestoreApp } from "@/firestore/config";
import { Chair } from "@/features/room/components/Chair";
import ActivateShockDialog from "@/features/room/components/dialogs/ActivateShockDialog";
import CreaterWaitingStartDialog from "@/features/room/components/dialogs/CreaterWaitingStartDialog";
import NoticeSetDialog from "@/features/room/components/dialogs/NoticeSetDialog";
import StartTurnDialog from "@/features/room/components/dialogs/StartTurnDialog";
import GameResultDialog from "@/features/room/components/dialogs/GameResultDialog";
import TurnResultDialog from "@/features/room/components/dialogs/TurnResultDialog";
import PlayerStatus from "@/features/room/components/PlayerStatus";
import useDialog from "@/hooks/useDialog";
import { useToast } from "@/utils/toast/useToast";

import type { GameRoom, Player } from "@/types/room";

type playerOperation = {
  setElectricShock: boolean;
  selectSitChair: boolean;
  activate: boolean;
  wait: boolean;
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
  const tooltipRef = useRef<TooltipRefProps>(null);
  const previousRoomDataRef = useRef<GameRoom | null>(null);

  const {
    dialogRef: waitingCreaterStartDialogRef,
    showModal: showCreaterWaitingStartModa,
    closeModal: closeCreaterWaitingStartModal,
  } = useDialog();

  const { dialogRef: startTurnDialogRef, showModal: showStartTurnModal } =
    useDialog();

  const {
    dialogRef: noticeSetDialogRef,
    showModal: showNoticeSetModal,
    closeModal: closeNoticeSetModal,
  } = useDialog();

  const {
    dialogRef: activateShockDialogRef,
    showModal: showActivateShockModal,
    closeModal: closeActivateShockModal,
  } = useDialog();

  const {
    dialogRef: turnResultDialogRef,
    showModal: showTurnResultModal,
    closeModal: closeTurnResultModal,
  } = useDialog();

  const { dialogRef: gameResultDialogRef, showModal: showGameResultModal } =
    useDialog();

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
    closeActivateShockModal();
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
    closeTurnResultModal();
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

    if (!isAllReady()) {
      if (roomData?.createrId === userId) {
        showCreaterWaitingStartModa();
      }
    }
    if (isAllReady()) {
      closeCreaterWaitingStartModal();

      if (roomData.round.phase === "setting") {
        showStartTurnModal(2000);
      }

      if (
        roomData.round.phase === "sitting" &&
        roomData.round.attackerId === userId
      ) {
        showNoticeSetModal(3000);
      }
    }
    if (
      roomData.round.attackerId !== userId &&
      roomData.round.phase === "activating"
    ) {
      showActivateShockModal();
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
          showGameResultModal();
        } else {
          showTurnResultModal();
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
        {roomData?.remainingChairs.map((chair) => (
          <Chair
            key={chair}
            chair={chair}
            setSelectedChair={setSelectedChair}
            wait={playerOperation.wait}
            selected={selectedChair === chair}
          />
        ))}
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
      <CreaterWaitingStartDialog
        roomId={roomId!}
        dialogRef={waitingCreaterStartDialogRef}
        tooltipRef={tooltipRef}
        copyId={copyId}
      />
      <ActivateShockDialog
        dialogRef={activateShockDialogRef}
        action={submitActivate}
      />
      <NoticeSetDialog
        dialogRef={noticeSetDialogRef}
        action={closeNoticeSetModal}
      />
      <StartTurnDialog
        dialogRef={startTurnDialogRef}
        round={roomData!.round}
        userId={userId!}
      />
      <TurnResultDialog
        ref={turnResultDialogRef}
        roomData={roomData!}
        previousRoomData={previousRoomDataRef.current!}
        userId={userId!}
        close={changeTurn}
      />
      <GameResultDialog
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
