"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipRefProps } from "react-tooltip";
import useSound from "use-sound";

import { useToast } from "@/utils/toast/useToast";

import { Chair } from "@/features/room/components/Chair";
import { PlayerStatus } from "@/features/room/components/PlayerStatus";
import { RoundStatus } from "@/features/room/components/RoundStatus";
import { CreaterWaitingStartDialog } from "@/features/room/components/dialogs/CreaterWaitingStartDialog";
import { StartTurnDialog } from "@/features/room/components/dialogs/StartTurnDialog";
import { GameResultDialog } from "@/features/room/components/dialogs/GameResultDialog";
import { TurnResultDialog } from "@/features/room/components/dialogs/TurnResultDialog";

import type { GameRoom, Round } from "@/types/room";
import { InstructionMessage } from "@/features/room/components/InstructionMessage";
import { ActivateEffect } from "@/features/room/components/ActivateEffect";
import { RoomContainer } from "@/features/room/components/RoomContainer";
import { GameStatusContainer } from "@/features/room/components/GameStatusContainer";
import { ChairContainer } from "@/features/room/components/ChairContainer";
import { InstructionContainer } from "@/features/room/components/InstructionContainer";
import { PlayerStatusContainer } from "@/features/room/components/PlayerStatusContainer";
import { Button } from "@/components/buttons/Button";
import {
  activateAction,
  changeTurnAction,
  selectChairAction,
} from "@/features/room/action";
import { NoticeDialog } from "@/components/dialogs/notice/NoticeDailog";
import { useRoomDialogs } from "@/features/room/hooks/useRoomDialogs";
import { usePlayerOperation } from "@/features/room/hooks/usePlayerOperation";
import { useRoomWatcher } from "@/features/room/hooks/useRoomWatcher";

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
  const [showShock, setShowShock] = useState<"" | "shock" | "safe">("");
  const [selectedChair, setSelectedChair] = useState<number | null>(null);
  const tooltipRef = useRef<TooltipRefProps>(null);
  const previousRoomDataRef = useRef<GameRoom | null>(null);
  const {
    NoticeDialogRef,
    noticeDialogState,
    showNoticeModal,
    closeNoticeModal,
    waitingCreaterStartDialogRef,
    showCreaterWaitingStartModa,
    closeCreaterWaitingStartModal,
    startTurnDialogRef,
    showStartTurnModal,
    turnResultDialogRef,
    showTurnResultModal,
    closeTurnResultModal,
    gameResultDialogRef,
    showGameResultModal,
  } = useRoomDialogs();

  const playerOperation = usePlayerOperation(roomData, userId!);

  useRoomWatcher({
    roomId: roomId,
    setRoomData: setRoomData,
    previousRoomDataRef: previousRoomDataRef,
  });

  const getSubmitRoundData = (chair: number | null): Round | undefined => {
    const round = roomData?.round;
    if (playerOperation.setElectricShock) {
      return {
        ...round,
        electricChair: chair,
        phase: "sitting",
      } as Round;
    } else if (playerOperation.selectSitChair) {
      return {
        ...round,
        seatedChair: chair,
        phase: "activating",
      } as Round;
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
      } as Round;
    }

    return round || undefined;
  };

  const selectChairActionWithData = selectChairAction.bind(null, {
    roomId: roomId,
    roundData: getSubmitRoundData(selectedChair),
  });
  const [selectState, selectAction] = useActionState(
    selectChairActionWithData,
    { status: 0, error: "" }
  );

  useEffect(() => {
    if (!selectedChair) return;
    const message =
      selectState.status === 200
        ? "番の椅子を選択しました。"
        : "椅子の選択に失敗しました。";
    toast.open(
      <span>
        <span style={{ color: "red", fontWeight: "bold", fontSize: "1.2rem" }}>
          {selectedChair}
        </span>
        {message}
      </span>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectState]);

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
    closeNoticeModal();
    const res = await activateAction(roomId!);
    if (res.status !== 200) {
      console.error(res.error);
    }
  };

  const changeTurn = async () => {
    closeTurnResultModal();
    const res = await changeTurnAction({
      roomId: roomId!,
      userId: userId!,
    });
    if (res.status !== 200) {
      console.error(res.error);
    }
    setSelectedChair(null);
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

    if (!isAllReady()) {
      if (roomData?.createrId === userId) {
        showCreaterWaitingStartModa();
      }
    }
    if (isAllReady()) {
      closeCreaterWaitingStartModal();

      if (roomData.round.phase === "setting") {
        showStartTurnModal(2000);
        if (roomData.round.attackerId !== userId) {
          setTimeout(() => {
            showNoticeModal(
              {
                title: "電気椅子設置",
                message: "電流を仕掛ける椅子を選択してください",
                button: { label: "OK", action: () => closeNoticeModal() },
              },
              2000
            );
          }, 2100);
        }
      }

      if (
        roomData.round.phase === "sitting" &&
        roomData.round.attackerId === userId
      ) {
        showNoticeModal(
          {
            title: "相手が電気椅子を仕掛けました",
            message: "座る椅子を選択してください",
            button: { label: "OK", action: () => closeNoticeModal() },
          },
          2000
        );
      }
    }
    if (
      roomData.round.attackerId !== userId &&
      roomData.round.phase === "activating"
    ) {
      showNoticeModal({
        title: "相手が椅子に座りました",
        message: "電流を起動してください",
        button: { label: "起動", action: () => submitActivate() },
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData]);

  const toToP = () => {
    router.push("/");
  };

  return (
    <RoomContainer>
      <GameStatusContainer>
        <RoundStatus round={roomData?.round} userId={userId} />
        <PlayerStatusContainer>
          <PlayerStatus
            userId={userId}
            status={roomData?.players.find((player) => player.id === userId)}
          />
          <PlayerStatus
            userId={userId}
            status={roomData?.players.find((player) => player.id !== userId)}
          />
        </PlayerStatusContainer>
      </GameStatusContainer>
      <form action={selectAction}>
        <ChairContainer>
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
            <InstructionContainer>
              <InstructionMessage
                playerOperation={playerOperation}
                round={roomData?.round}
                userId={userId}
              />
            </InstructionContainer>
          )}
        </ChairContainer>
        {!playerOperation.wait &&
          !playerOperation.activate &&
          selectedChair && (
            <div className="sticky bottom-3">
              <Button styles="border-2 border-red-700">確定</Button>
            </div>
          )}
      </form>
      <NoticeDialog
        dialogRef={NoticeDialogRef}
        title={noticeDialogState.title}
        message={noticeDialogState.message}
        button={noticeDialogState.button}
      />
      <CreaterWaitingStartDialog
        roomId={roomId!}
        dialogRef={waitingCreaterStartDialogRef}
        tooltipRef={tooltipRef}
        copyId={copyId}
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
      <ActivateEffect result={showShock} />
    </RoomContainer>
  );
}
