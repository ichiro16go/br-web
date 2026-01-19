
/**
 * カードの種類を定義する列挙型
 */
export enum CardType {
  Slash = 'SLASH',         // 斬撃（攻撃カード）
  Blood = 'BLOOD',         // 鮮血（リソース生成カード）
  Regalia = 'REGALIA',     // 神器（キャラクター固有の装備）
  BloodRecall = 'BLOOD_RECALL', // ブラッドリコール（奥義）
  Recall = 'RECALL',       // リコール（マーケットから購入するカード）
  Calamity = 'CALAMITY'    // 災厄（マイナス効果など）
}

/**
 * ゲームの進行フェーズ
 */
export enum Phase {
  Setup = 'SETUP',             // セットアップ
  Main = 'MAIN',               // メインフェーズ（アクションを行う）
  BloodBattle = 'BLOOD_BATTLE',// ブラッドバトル（戦闘解決）
  Cleanup = 'CLEANUP',         // クリーンアップ（ターン終了処理）
  GameOver = 'GAME_OVER'       // ゲーム終了
}

/**
 * 基本的なカード情報のインターフェース
 */
export interface Card {
  id: string;             // 一意の識別子
  name: string;           // カード名
  type: CardType;         // カードタイプ
  attack: number;         // 攻撃力
  cost: number;           // リコール（購入）にかかるコスト
  description: string;    // 効果テキスト
  level: number;          // カードレベル (1: 初期, 2: 強化, 3: 極意...)
  isTapped?: boolean;     // タップ状態（主に行動済み神器の管理用）
}

/**
 * 神器のステータスセット
 */
export interface RegaliaStats {
  handSize: number;       // 手札上限枚数
  bloodPact: number;      // 血の契約値（毎ターンのアクション回数）
  selfHarmCost: number;   // 自傷コスト（ライフからプールへ送る枚数）
  selfHarmEffectDesc: string; // 自傷時の効果説明
}

/**
 * 神器カード（キャラクター固有）
 */
export interface RegaliaCard extends Card {
  year: number;           // 観測された年代
  base: RegaliaStats;     // 覚醒前のステータス
  awakened: RegaliaStats; // 覚醒後のステータス
}

/**
 * ブラッドリコール（必殺技）の定義
 */
export interface BloodRecall {
  id: string;
  name: string;
  regaliaId: string;      // 紐づく神器ID
  cost: number;           // 血廻りコスト（発動に必要な血廻エリアの枚数）
  timing: 'Main' | 'BattleStart' | 'Cleanup' | 'OnDamage' | 'BattleEnd'; // 発動可能タイミング
  description: string;    // 効果説明
  effectType: string;     // 内部ロジック分岐用の識別子
}

/**
 * プレイヤーの状態管理
 */
export interface PlayerState {
  id: string;
  isHuman: boolean;       // 人間かCPUか
  name: string;
  life: number;           // 現在のライフ（数値管理）
  lifeCards: Card[];      // ライフを構成するカード群（ダメージ時にここからプールへ移動）
  hand: Card[];           // 手札
  deck: Card[];           // 山札
  discard: Card[];        // 捨て札
  field: Card[];          // 現在のターンで場に出したカード
  bloodPool: Card[];      // ブラッドプール（リコールコストの支払い元）
  bloodCircuit: Card[];   // 血廻（必殺技コストや強化素材の行き先）
  regalia: RegaliaCard | null;   // 装備している神器
  bloodRecall: BloodRecall | null; // 選択した必殺技
  isRegaliaAwakened: boolean;    // 神器覚醒状態（Life 10以下でTrue）
  attackTotal: number;    // 現在の攻撃力合計値
  hasPassed: boolean;     // ターンをパスしたか
  remainingActions: number; // 残りアクション回数
  
  // 継続効果・バフの状態管理
  activeBuffs: {
    shiraganeConvert?: boolean;  // シラガネ: 自傷ダメージをプール追加に置換 (不要になったが互換性のため残すか検討)
    hihiirokaneConvert?: boolean; // ヒヒイロカネ: 自傷ダメージをゲーム外からのプール追加に置換
    damageReduction?: number;    // ニライカナイ: ダメージ軽減量
    usuganeBurn?: boolean;       // ウスガネ: クリーンナップ時ダメージ発生
    kutonePactBonus?: number;    // クトネシリカ: アクション回数ボーナス
    battleStartAtk?: number;     // 戦闘開始時ATK補正
    permanentAtk?: number;       // アポイタカラ: 永続ATK
  };
}

/**
 * 解決待ちのアクション状態（ポップアップ表示用）
 */
export type PendingResolution = 
  | { type: 'APOITAKARA_SELECTION'; cards: Card[] }
  | { type: 'SHIRAGANE_HAND_SELECT'; count: number } // シラガネ用
  | { type: 'OBOTSU_BASE_CHOICE' }
  | { type: 'OBOTSU_AWAKENED_HAND_SELECT' }
  | { type: 'BLUE_SPHERE_UPGRADE' }
  | { type: 'BLUE_SPHERE_DECK_CONTROL'; cards: Card[] }
  | { type: 'INDIGO_HAND_TO_CIRCUIT' } // 機翼の藍: 任意枚数血廻へ
  | { type: 'INDIGO_DECK_STRATEGY'; cards: Card[] } // 機翼の藍: デッキトップ2枚操作
  | { type: 'INDIGO_UPGRADE_BLOOD' } // 機翼の藍: Lv1血アーツ強化
  | { type: 'INDIGO_HAND_TO_CIRCUIT_DRAW' } // 機翼の藍: 2枚まで血廻へ→ドロー
  | { type: 'INDIGO_CIRCUIT_TO_HAND' } // 機翼の藍: 血廻から手札へ
  | { type: 'BURIAL_PAYMENT'; cardId: string; costType: 'fixed' | 'variable'; costAmount: number } // 葬送の黒: コスト支払い
  | { type: 'BURIAL_SEARCH_DECK'; cards: Card[] } // 葬送の黒(6血): デッキ探索
  | { type: 'BURIAL_FREE_RECALL'; marketCards: Card[] } // 葬送の黒(7血): 無料想起
  | { type: 'CHERRY_VICTORY_SELECT' }; // 超克の桜【凱旋】: 場の斬アーツ選択

/**
 * ゲーム全体の状態管理
 */
export interface GameState {
  phase: Phase;
  turnPlayerId: string;   // 現在アクション権を持つプレイヤーID
  firstPlayerId: string;  // 先攻プレイヤーID（ラウンド開始時にリセットされる基準）
  players: {
    player: PlayerState;
    cpu: PlayerState;
  };
  market: {
    recallPiles: Card[][];     // マーケットの山札群（5つの山札）
    artsDeckSlash: Card[][];   // 強化用斬撃カード
    artsDeckBlood: Card[][];   // 強化用鮮血カード
  };
  log: string[];          // ゲームログ
  
  // ユーザーの選択待ち状態
  pendingResolution?: PendingResolution;
  // ターン開始時に順次解決すべき効果を持つカードのキュー
  pendingTurnStartEffects?: Card[];
  
  // AIデバッグ・ループ防止用
  cpuFailureCount?: number;

  // チュートリアルモード用
  isTutorial?: boolean;
  tutorialStep?: number;
}

/**
 * アクション定義 (Reducer用)
 */
export type ActionType = 
  | { type: 'START_GAME'; regaliaId: string; bloodRecallId: string; cpuRegaliaId: string; cpuBloodRecallId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }          // カードプレイ
  | { type: 'SELF_HARM'; playerId: string }                          // 自傷アクション
  | { type: 'RECALL_CARD'; playerId: string; pileIndex: number; paymentCardIds: string[] } // カード購入
  | { type: 'CRAFT_CARD'; playerId: string; recipeId: string; paymentCardIds: string[] }   // カード強化
  | { type: 'ACTIVATE_BLOOD_RECALL'; playerId: string }              // ブラッドリコール発動
  | { type: 'PASS_TURN'; playerId: string }                          // パス宣言
  | { type: 'RESOLVE_BATTLE' }                                       // 戦闘解決処理
  | { type: 'CLEANUP' }                                              // クリーンアップ処理
  | { type: 'CPU_ACTION' }                                           // AI思考ルーチン実行
  | { type: 'RESOLVE_PENDING_ACTION'; payload: any }                 // 選択ポップアップの結果解決
  | { type: 'PROCESS_NEXT_TURN_START_EFFECT' }                       // 次のターン開始時効果を処理
  | { type: 'TUTORIAL_NEXT_STEP' };                                  // チュートリアルのステップを進める
