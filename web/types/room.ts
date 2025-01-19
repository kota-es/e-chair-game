type Player = {
  point: number; // 現在の得点
  shockedCount: number; // 感電回数
  ready: boolean; // 準備完了フラグ
};

export type GameRoom = {
  createrId: string; // ルーム作成者のユーザーID
  status: "waiting" | "ready" | "inProgress"; // ルームステータス: waiting, ready, inProgress, finished
  players: {
    [userId: string]: Player; // プレイヤー情報（プレイヤーIDをキーにしたオブジェクト）
  };
  currentTurn: string | null; // 現在のターン（攻撃側プレイヤーのID）
  round: {
    number: number; // ラウンド数
    chairWithElectricity: number | null; // 電流を仕掛けた椅子番号
    chairChosenByPlayer: number | null; // 攻撃側プレイヤーが選んだ椅子番号（未選択ならnull）
  };
  remainingChairs: [number]; // 残りの椅子番号
  winner: string | null; // ゲーム終了時の勝者情報（ゲーム中はnull）
};

export type RoomResponse =
  | { status: 200; data: GameRoom }
  | { status: 404; error: string }
  | { status: 400; error: string }
  | { status: 500; error: string };
