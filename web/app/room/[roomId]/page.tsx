"use client";

import PlayerStatus from "@/components/PlayerStatus";
import { useEffect, useRef, useState } from "react";

import type { GameRoom, Player } from "@/types/room";
import { getFirestoreApp } from "@/firestore/config";
import { doc, onSnapshot } from "firebase/firestore";

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
  const [roomData, setRoomData] = useState<GameRoom | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const createrDialogRef = useRef<HTMLDialogElement>(null);
  const opponentDialogRef = useRef<HTMLDialogElement>(null);
  const handleCreaterShowModal = () => createrDialogRef.current?.showModal();
  const handleCrestorCloseModal = () => createrDialogRef.current?.close();
  const handleOpponentShowModal = () => opponentDialogRef.current?.showModal();
  const handleOpponentCloseModal = () => opponentDialogRef.current?.close();

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

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setUserId(userId);
    const roomId = localStorage.getItem("roomId");
    setRoomId(roomId);
    const entryRoom = async () => {
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

        setRoomData(room);
        if (room.createrId === userId) {
          handleCreaterShowModal();
        } else {
          handleOpponentShowModal();
        }
        const db = await getFirestoreApp();
        const docRef = doc(db, "rooms", roomId!);
        const unsubscribe = onSnapshot(docRef, (doc) => {
          setRoomData(doc.data() as GameRoom);
        });

        return () => unsubscribe();
      }
    };

    entryRoom();
  }, []);

  useEffect(() => {
    if (!roomData) return;
    const isAllReady =
      roomData.players.length == 2 &&
      roomData.players.every((player) => player.ready);
    if (isAllReady) {
      handleCrestorCloseModal();
      handleOpponentCloseModal();
    }
  }, [roomData]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 grid grid-cols-1 auto-rows-max gap-8">
      <div
        id="card"
        className="h-fit bg-gray-800 p-6 border-red-500 border-2 rounded-lg grid gap-6"
      >
        <div className="text-center text-lg">
          ラウンド: {roomData?.round?.number} |{" "}
          {roomData?.round.turn === "top" ? "表" : "裏"}
          <div>
            {roomData?.round.attackerId === userId
              ? "あなたは攻撃です"
              : "あなたは防御です"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PlayerStatus userId={userId} status={myStatus()} />
          <PlayerStatus userId={userId} status={opponentStatus()} />
        </div>
      </div>
      <div className="relative w-full max-w-md aspect-square mx-auto">
        {roomData?.remainingChairs.map(renderChair)}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-xl font-bold text-white bg-gray-800 bg-opacity-75 p-4 rounded-full whitespace-nowrap">
            test
          </p>
        </div>
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
