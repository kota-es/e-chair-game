import { GameRoom } from "@/types/room";
import { Ref } from "react";

type GameResultModalProps = {
  ref: Ref<HTMLDialogElement>;
  roomData: GameRoom;
  userId: string;
  close: () => void;
};

export default function GameResultModal({
  ref,
  roomData,
  userId,
  close,
}: GameResultModalProps) {
  const isWinner = roomData?.winnerId === userId;

  const headingText = isWinner ? "勝利！！" : "敗北...";

  const text = () => {
    const myStatus = roomData?.players.find((player) => player.id === userId);
    const opponentStatus = roomData?.players.find(
      (player) => player.id !== userId
    );

    if (isWinner) {
      if (myStatus && myStatus.point >= 40) {
        return "40点以上を獲得しました。あなたの勝利です!";
      } else if (opponentStatus?.shockedCount === 3) {
        return "相手が3回感電しました。あなたの勝利です!";
      } else if (roomData.remainingChairs.length === 1) {
        return "残りいすが一つになりました。獲得ポイントの高いあなたの勝利です!";
      }
    } else {
      if (opponentStatus && opponentStatus?.point >= 40) {
        return "40点以上を獲得されました。あなたの敗北です...";
      } else if (myStatus?.shockedCount === 3) {
        return "3回感電しました。あなたの敗北です...";
      } else if (roomData?.remainingChairs.length === 1) {
        return "残りいすが一つになりました。獲得ポイントの高い相手の勝利です...";
      }
    }
  };

  return (
    <dialog
      className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
      ref={ref}
    >
      <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
        <div>
          <h2 className="font-semibold text-red-500">
            <span>{headingText}</span>
          </h2>
          <p className="pt-1 text-gray-300">{text()}</p>
        </div>
        <button
          className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
          onClick={close}
        >
          ゲームを終了する
        </button>
      </div>
    </dialog>
  );
}
