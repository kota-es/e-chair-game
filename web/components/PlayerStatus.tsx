import { Skull } from "lucide-react";

export default function PlayerStatus() {
  return (
    <div className="p-6 bg-gray-700 text-center rounded-lg">
      <p className="text-xl text-red-400 font-bold">Player 1</p>
      <p className="text-yellow-300">得点:0</p>
      <div className="flex items-center justify-center text-red-300">
        <Skull className="mr-1" />
        <p>感電:0</p>
      </div>
    </div>
  );
}
