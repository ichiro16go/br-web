export enum CardType {
  Slash = 'SLASH', // 斬撃（攻撃カード）
  Blood = 'BLOOD', // 鮮血（リソース生成カード）
  Regalia = 'REGALIA', // 神器（キャラクター固有の装備）
  BloodRecall = 'BLOOD_RECALL', // ブラッドリコール（奥義）
  Recall = 'RECALL', // リコール（マーケットから購入するカード）
  Calamity = 'CALAMITY' // 災厄（マイナス効果など）
}

export enum Phase {
  Setup = 'SETUP', // セットアップ
  Main = 'MAIN', // メインフェーズ（アクションを行う）
  BloodBattle = 'BLOOD_BATTLE', // ブラッドバトル（戦闘解決）
  Cleanup = 'CLEANUP', // クリーンアップ（ターン終了処理）
  GameOver = 'GAME_OVER' // ゲーム終了
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  attack: number;
  cost: number; // リコール（購入）にかかるコスト
  description: string;
  level: number; // 1 (初期), 2, 3...
  isTapped?: boolean; // 神器の使用済み状態管理
}

export interface RegaliaCard extends Card {
  handSize: number; // 手札上限
  bloodPact: number; // 購入や強化に使用する「血の契約」値（アクション回数）
  selfHarmCost: number; // 自傷コスト（ライフからプールへ送る枚数）
  selfHarmEffectDesc: string; // 自傷時の効果説明
  year: number; // 観測された年代
}

// ブラッドリコール（必殺技）の定義
export interface BloodRecall {
  id: string;
  name: string;
  regaliaId: string; // 紐づく神器ID
  cost: number; // 血廻りコスト（ブラッドプール消費数）
  timing: 'Main' | 'BattleStart' | 'Cleanup' | 'OnDamage'; // 発動可能タイミング
  description: string;
  effectType: string; // 内部ロジック分岐用
}

export interface PlayerState {
  id: string;
  isHuman: boolean;
  name: string;
  life: number; // 総体力値
  lifeCards: Card[]; // ライフエリアにあるカード（ライフ自体がカードとして扱われる）
  hand: Card[]; // 手札
  deck: Card[]; // 山札
  discard: Card[]; // 捨て札
  field: Card[]; // このターンにプレイしたカード（フィールド）
  bloodPool: Card[]; // ブラッドプール（ダメージを受けた際や自傷コストで移動したカード）
  regalia: RegaliaCard | null; // 神器
  bloodRecall: BloodRecall | null; // 選択したブラッドリコール
  isRegaliaAwakened: boolean; // ライフ10以下で発動する覚醒状態
  attackTotal: number; // 現在の攻撃力合計
  hasPassed: boolean; // パスしたかどうか
  remainingActions: number; // 残り行動回数（リコール/クラフト用）
  
  // 継続効果・バフ管理
  activeBuffs: {
    shiraganeConvert?: boolean; // シラガネ: 自傷ダメージをプール追加に置換
    damageReduction?: number; // ニライカナイ: ダメージ軽減
    usuganeBurn?: boolean; // ウスガネ: クリーンナップダメージ
    kutonePactBonus?: number; // クトネシリカ: 血継+1
    battleStartAtk?: number; // 戦闘開始時ATK補正
  };
}

export interface GameState {
  phase: Phase;
  turnPlayerId: string; // メインフェーズで優先権を持つプレイヤー
  firstPlayerId: string; // 「血の契約（先攻マーカー）」を持つプレイヤー
  players: {
    player: PlayerState;
    cpu: PlayerState;
  };
  market: {
    recallPiles: Card[][]; // マーケットの山札群（5つの山札）
    artsDeckSlash: Card[][]; // 強化用斬撃カード（未使用）
    artsDeckBlood: Card[][]; // 強化用鮮血カード（未使用）
  };
  log: string[]; // ゲームログ
}

export type ActionType = 
  | { type: 'START_GAME'; regaliaId: string; bloodRecallId: string; cpuRegaliaId: string; cpuBloodRecallId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string } // カードプレイ
  | { type: 'SELF_HARM'; playerId: string } // 自傷アクション
  | { type: 'RECALL_CARD'; playerId: string; pileIndex: number; paymentCardIds: string[] } // カード購入 (pileIndex指定に変更)
  | { type: 'CRAFT_CARD'; playerId: string; recipeId: string; paymentCardIds: string[] } // カード強化
  | { type: 'ACTIVATE_BLOOD_RECALL'; playerId: string } // ブラッドリコール発動
  | { type: 'PASS_TURN'; playerId: string } // パス
  | { type: 'RESOLVE_BATTLE' } // バトル解決
  | { type: 'CLEANUP' } // クリーンアップ
  | { type: 'CPU_ACTION' }; // AIのアクション実行トリガー