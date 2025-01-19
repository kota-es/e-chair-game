"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef } from "react";

import type { GameRoom } from "@/types/room";

const roomId = localStorage.getItem("roomId");

const renderChair = (chair: number) => {
  const index = chair - 1;
  const angle = ((index - 3) / 12) * 2 * Math.PI;
  const radius = 45;
  const left = 50 + radius * Math.cos(angle);
  const top = 50 + radius * Math.sin(angle);

  return (
    <div
      key={chair}
      className={`inline-flex items-center justify-center  absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 bg-gray-700 text-gray-300 hover:bg-red-600 transition-all duration-300 border border-white rounded-lg cursor-pointer`}
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      {chair}
    </div>
  );
};

export default function RoomPage() {
  const createrDialogRef = useRef<HTMLDialogElement>(null);
  const opponentDialogRef = useRef<HTMLDialogElement>(null);
  const handleCreaterShowModal = () => createrDialogRef.current?.showModal();
  const handleOpponentShowModal = () => opponentDialogRef.current?.showModal();

  useEffect(() => {
    const entryRoom = async () => {
      const userId = localStorage.getItem("userId");
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
        if (room.createrId === userId) {
          handleCreaterShowModal();
        } else {
          handleOpponentShowModal();
        }
      }
    };

    entryRoom();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 grid grid-cols-1 auto-rows-max gap-8">
      <div
        id="card"
        className="h-fit bg-gray-800 p-6 border-red-500 border-2 rounded-lg grid gap-6"
      >
        <div className="text-center text-lg">ターン: 1|フェーズ:防御</div>
        <div className="grid grid-cols-2 gap-4">
          <PlayerStatus />
          <PlayerStatus />
        </div>
      </div>
      <div className="relative w-full max-w-md aspect-square mx-auto">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(renderChair)}
      </div>
      <button className="inline-flex h-10 justify-center items-center rounded-full bg-red-500 font-bold text-sm text-white">
        確定する
      </button>
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
          <div className="text-center text-2xl text-red-500">
            <span>{roomId}</span>
          </div>
        </div>
      </dialog>
      <dialog
        className="absolute min-w-fit max-w-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  backdrop:bg-black/80 shadow-sm w-full"
        ref={opponentDialogRef}
      >
        <div className="grid gap-4 backdrop:bg-black/80 p-6 text-card-foreground shadow-sm w-full bg-gray-800 border-2 border-red-500">
          <div>
            <p className="pt-1 text-center text-gray-300">
              まもなくゲームを開始します。
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
