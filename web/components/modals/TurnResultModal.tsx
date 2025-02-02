import { GameRoom } from "@/types/room";
import { Ref } from "react";

type TurnResultModalProps = {
  ref: Ref<HTMLDialogElement>;
  roomData: GameRoom;
  userId: string;
  close: () => void;
};

export default function TurnResultModal({
  ref,
  roomData,
  userId,
  close,
}: TurnResultModalProps) {
  const isAttacker = roomData?.round?.attackerId === userId;
  const isShocked = roomData?.round?.result.status === "shocked";

  const myRoundStatus = roomData?.players.find(
    (player) => player.id === userId
  );
  const opponentRoundStatus = roomData?.players.find(
    (player) => player.id !== userId
  );

  const headingText = isShocked ? "感電！" : "セーフ";

  const bodyText1 = isShocked
    ? isAttacker
      ? "電気椅子に座ってしまいました..."
      : "電気椅子に座らせました"
    : isAttacker
    ? "電気椅子を回避しました"
    : "電気椅子を回避されました...";

  return (
    <dialog
      className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
      ref={ref}
    >
      <div className="grid place-items-center gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
        <div className="flex items-center flex-col gap-4">
          <h2 className="font-semibold text-red-500">
            <span className="text-3xl">{headingText}</span>
          </h2>
          <p className="pt-1 text-2xl font-semibold text-gray-300">
            {bodyText1}
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="text-gray-400">電気椅子</div>
              <div className="font-bold text-white text-4xl">
                {roomData?.round?.electricChair}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-400">座った椅子</div>
              <div className="font-bold text-white text-4xl">
                {roomData?.round?.seatedChair}
              </div>
            </div>
          </div>
          <p className="pt-1 text-xl font-semibold text-gray-300">
            {roomData?.round?.attackerId === userId ? "あなたの" : "相手の"}
            スコアが更新されました
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="text-gray-400">ポイント</div>
              <div className="font-bold text-green-500 text-4xl">
                {roomData?.round?.attackerId === userId
                  ? myRoundStatus?.point
                  : opponentRoundStatus?.point}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-400">感電回数</div>
              <div className="font-bold text-red-500 text-4xl">
                {roomData?.round?.attackerId === userId
                  ? myRoundStatus?.shockedCount
                  : opponentRoundStatus?.shockedCount}
              </div>
            </div>
          </div>
        </div>
        <button
          className="inline-flex h-10 w-full justify-center items-center rounded-full bg-red-500 font-bold text-white"
          onClick={close}
        >
          次へ進む
        </button>
      </div>
    </dialog>
  );
}
