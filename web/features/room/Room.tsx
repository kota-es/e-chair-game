"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import useSound from "use-sound";

import type { GameRoom, Player } from "@/types/room";

import TurnResultModal from "@/components/modals/TurnResultModal";
import GameResultModal from "@/components/modals/GameResultModal";
import { Armchair, Copy, Zap } from "lucide-react";
import { Tooltip, TooltipRefProps } from "react-tooltip";
import InfoDialog from "@/components/modals/InfoDialog";
import { useToast } from "@/utils/toast/useToast";
import { Toast } from "@/utils/toast/Toast";
import { useRoom } from "@/features/room/useRoom";

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
  const room = useRoom(initialData);
  const {
    roomData,
    selectedChair,
    setSelectedChair,
    submitSelectedChair,
    submitActivate,
    changeTurn,
    previousRoomDataRef,
    playerOperation,
  } = room;
  const [playShockEffect] = useSound("/sounds/shock.mp3");
  const [playSafeEffect] = useSound("/sounds/safe.mp3");
  const router = useRouter();
  const toast = useToast();

  const userId = initialData.userId;
  const roomId = initialData.roomId;
  const [showShock, setShowShock] = useState<"" | "shock" | "safe">("");
  const createrWaitingDialogRef = useRef<HTMLDialogElement>(null);
  const sittingPhaseDialogRef = useRef<HTMLDialogElement>(null);
  const activateDialogRef = useRef<HTMLDialogElement>(null);
  const turnResultDialogRef = useRef<HTMLDialogElement>(null);
  const gameResultDialogRef = useRef<HTMLDialogElement>(null);
  const startTurnDialogRef = useRef<HTMLDialogElement>(null);
  const tooltipRef = useRef<TooltipRefProps>(null);

  const handleShowCreaterWaitingModal = () =>
    createrWaitingDialogRef.current?.showModal();
  const handleCloseCreaterWaitingModal = () =>
    createrWaitingDialogRef.current?.close();
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
  const handleShowStartTurnModal = () =>
    startTurnDialogRef.current?.showModal();
  const handleCloseStartTurnModal = () => startTurnDialogRef.current?.close();

  const handleSubmitSelectedChair = async () => {
    if (!selectedChair) return;
    const res = await submitSelectedChair();
    if (res.status !== 200) {
      console.error(res.error);
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

  const handleSubmitActivate = async () => {
    handleCloseActivateModal();
    const res = await submitActivate();
    if (res.status !== 200) {
      console.error(res.error);
    }
  };

  const handleChangeTurn = async () => {
    handleCloseTurnResultModal();
    const res = await changeTurn();
    if (res.status !== 200) {
      console.error(res.error);
    }
    setSelectedChair(null);
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

  const isAllReady = () => {
    if (!roomData) return false;
    return (
      roomData.players.length == 2 &&
      roomData.players.every((player) => player.ready)
    );
  };

  useEffect(() => {
    if (!roomData) return;
    if (!isAllReady() && roomData.createrId === userId) {
      handleShowCreaterWaitingModal();
    }

    if (isAllReady()) {
      handleCloseCreaterWaitingModal();

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
        <div className="relative max-w-fit top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Toast />
        </div>
      </div>
      {!playerOperation.wait && !playerOperation.activate && selectedChair && (
        <button
          className="sticky bottom-3 inline-flex h-10 justify-center items-center rounded-full border-2 border-red-700 bg-red-500 font-bold text-sm text-white"
          onClick={handleSubmitSelectedChair}
        >
          確定
        </button>
      )}
      <InfoDialog ref={createrWaitingDialogRef}>
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
      </InfoDialog>
      <InfoDialog ref={activateDialogRef}>
        <div>
          <h2 className="font-semibold text-red-500">
            <span>相手が椅子に座りました</span>
          </h2>
          <p className="pt-1 text-gray-300">電流を起動してください</p>
        </div>
        <button
          className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
          onClick={handleSubmitActivate}
        >
          起動
        </button>
      </InfoDialog>

      <InfoDialog ref={sittingPhaseDialogRef}>
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
      </InfoDialog>
      <InfoDialog
        ref={startTurnDialogRef}
        borderColor={
          roomData?.round.attackerId === userId
            ? "border-emerald-500"
            : "border-orange-500"
        }
      >
        <div className="animate-flip-in-ver-right flex flex-col items-center gap-4">
          <h2
            className={`font-semibold text-3xl ${
              roomData?.round.attackerId === userId
                ? "text-emerald-500"
                : "text-orange-500"
            }`}
          >
            {roomData?.round.count === 1 && roomData?.round.turn === "top" ? (
              <span>ゲーム開始</span>
            ) : (
              <span>攻守交代</span>
            )}
          </h2>
          <p className="pt-1 text-lg font-bold text-gray-300">
            {roomData?.round.attackerId === userId
              ? "電流を避けて椅子に座れ"
              : "電流を仕掛けて相手に座らせろ"}
          </p>
          <div className="flex justify-center">
            {roomData?.round.attackerId === userId ? (
              <Armchair className="w-24 h-24 text-emerald-500 animate-pulse" />
            ) : (
              <Zap className="w-24 h-24 text-orange-500 animate-pulse" />
            )}
          </div>
        </div>
      </InfoDialog>
      <TurnResultModal
        ref={turnResultDialogRef}
        roomData={roomData!}
        previousRoomData={previousRoomDataRef.current!}
        userId={userId!}
        close={handleChangeTurn}
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
