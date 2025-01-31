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

  const headingText = isShocked ? "感電！！" : "セーフ";

  const bodyText1 = isShocked
    ? isAttacker
      ? "電気椅子に座ってしまいました..."
      : "電気椅子に座らせました！"
    : isAttacker
    ? "電気椅子を回避しました！"
    : "電気椅子を回避されました...";

  const bodyText2 = () => {
    if (!myRoundStatus || !opponentRoundStatus || !roomData.round)
      return "結果取得エラー";
    if (isShocked) {
      return isAttacker
        ? `感電回数は${myRoundStatus?.shockedCount}回になりました`
        : `感電回数は${opponentRoundStatus?.shockedCount}回になりました！`;
    } else {
      return isAttacker
        ? `あなたのスコアは${myRoundStatus?.point}になりました！`
        : `相手のスコアは${opponentRoundStatus?.point}になりました`;
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
          <p className="pt-1 text-gray-300">{bodyText1}</p>
          <p className="pt-1 text-gray-300">{bodyText2()}</p>
        </div>
        <button
          className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white"
          onClick={close}
        >
          攻守交代
        </button>
      </div>
    </dialog>
  );
}
