import PlayerStatus from "@/components/PlayerStatus";

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
    </div>
  );
}
