export type Player = {
  id: string; // プレイヤーID
  point: number; // 現在の得点
  shockedCount: number; // 感電回数
  ready: boolean; // 準備完了フラグ
};

export type GameRoom = {
  createrId: string; // ルーム作成者のユーザーID
  status: "waiting" | "ready" | "inProgress"; // ルームステータス: waiting, ready, inProgress, finished
  players: Player[]; // プレイヤー情報（プレイヤーIDをキーにしたオブジェクト）
  round: {
    count: number; // ラウンド数
    turn: "top" | "bottom"; // ターン: top, bottom
    attackerId: string; // 攻撃側プレイヤーのID
    phase: "setting" | "sitting" | "activating" | "result"; // フェーズ: setting, sitting, activating
    electricChair: number | null; // 電気椅子の番号（未設定ならnull）
    seatedChair: number | null; // 座っている椅子の番号（未設定ならnull）
    result: {
      status: "shocked" | "safe" | null; // 結果: shocked, safe
      confirmedIds: string[]; // 結果確定済みのプレイヤーID
    };
  };
  remainingChairs: [number]; // 残りの椅子番号
  winner: string | null; // ゲーム終了時の勝者情報（ゲーム中はnull）
};

export type RoomResponse =
  | { status: 200; data: GameRoom }
  | { status: 404; error: string }
  | { status: 400; error: string }
  | { status: 500; error: string };
