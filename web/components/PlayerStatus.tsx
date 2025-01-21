import { Player } from "@/types/room";
import { Skull } from "lucide-react";

type PlayerStatusProps = {
  userId: string | null;
  status: Player;
};

export default function PlayerStatus({ userId, status }: PlayerStatusProps) {
  const playerName = status?.id === userId ? "あなた" : "相手";
  return (
    <div className="p-6 bg-gray-700 text-center rounded-lg">
      <p className="text-xl text-red-400 font-bold">{playerName}</p>
      <p className="text-yellow-300">得点:{status?.point}</p>
      <div className="flex items-center justify-center text-red-300">
        <Skull className="mr-1" />
        <p>感電:{status?.shockedCount}</p>
      </div>
    </div>
  );
}
