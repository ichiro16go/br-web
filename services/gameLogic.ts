
import { PlayerState, Card, CardType, RegaliaStats, RegaliaCard, GameState, Phase } from '../types';
import { 
  INITIAL_LIFE, STARTER_DECK_SLASH_COUNT, STARTER_DECK_BLOOD_COUNT, 
  createStarterSlash, createStarterBlood, BLOOD_RECALLS, REGALIA_LIST, RECALL_SETS, createRecallCard
} from '../constants/index';
import { shuffle } from '../utils/common';

/**
 * プレイヤーの現在の神器ステータス（覚醒状態を考慮）を取得する関数
 * @param player 対象プレイヤー
 * @returns 適用される神器ステータス（Base または Awakened）
 */
export const getRegaliaStats = (player: PlayerState): RegaliaStats | null => {
    if (!player.regalia) return null;
    return player.isRegaliaAwakened ? player.regalia.awakened : player.regalia.base;
};

/**
 * 現在の場のカードから合計攻撃力を再計算する関数
 * 永続効果やバフの適用漏れを防ぐために使用する
 * @param player 対象プレイヤー
 */
export const recalculateAttackTotal = (player: PlayerState): void => {
    let total = 0;
    // 場のカードの攻撃力を合算
    for (const card of player.field) {
        total += card.attack;
    }
    // 注: activeBuffsによる加算はReducer側で制御している場合が多いが、
    // ここで一元管理することも検討可能。現状はベース値の計算に留める。
    
    player.attackTotal = total;
};

/**
 * プレイヤーにカードを引かせる関数
 * 山札がない場合は捨て札をシャッフルして山札にする
 * @param player 対象プレイヤー
 * @param count 引く枚数
 * @returns 更新されたプレイヤー状態
 */
export const drawCard = (player: PlayerState, count: number): PlayerState => {
  let newDeck = [...player.deck];
  let newHand = [...player.hand];
  let newDiscard = [...player.discard];

  for (let i = 0; i < count; i++) {
    if (newDeck.length === 0) {
      if (newDiscard.length === 0) break; // 山札も捨て札もなければ引けない
      newDeck = shuffle(newDiscard);
      newDiscard = [];
    }
    const card = newDeck.pop();
    if (card) newHand.push(card);
  }

  return {
    ...player,
    deck: newDeck,
    hand: newHand,
    discard: newDiscard
  };
};

/**
 * 初期デッキを生成する関数
 * @returns シャッフル済みの初期デッキ
 */
export const createInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  for (let i = 0; i < STARTER_DECK_SLASH_COUNT; i++) deck.push(createStarterSlash());
  for (let i = 0; i < STARTER_DECK_BLOOD_COUNT; i++) deck.push(createStarterBlood());
  return shuffle(deck);
};

/**
 * 新規プレイヤーを作成する関数
 * @param id プレイヤーID
 * @param name プレイヤー名
 * @param isHuman 人間かどうか
 * @param regalia 使用する神器
 * @param bloodRecallId 選択したブラッドリコールID
 * @returns 初期化されたプレイヤー状態
 */
export const createPlayer = (id: string, name: string, isHuman: boolean, regalia: RegaliaCard, bloodRecallId: string): PlayerState => {
  const deck = createInitialDeck();
  
  const lifeCards = Array(INITIAL_LIFE).fill(null).map((_, i) => ({
    id: `life-${id}-${i}`,
    name: 'Life Essence',
    type: CardType.Blood,
    attack: 0,
    cost: 0,
    level: 0,
    description: 'Life'
  }));

  const bloodRecall = BLOOD_RECALLS.find(br => br.id === bloodRecallId) || null;

  let player: PlayerState = {
    id,
    name,
    isHuman,
    life: INITIAL_LIFE,
    lifeCards,
    deck,
    hand: [],
    discard: [],
    field: [],
    bloodPool: [],
    bloodCircuit: [],
    regalia,
    bloodRecall, 
    isRegaliaAwakened: false,
    attackTotal: 0,
    hasPassed: false,
    remainingActions: regalia.base.bloodPact,
    activeBuffs: {}
  };
  
  // 初期手札をドロー
  player = drawCard(player, regalia.base.handSize);
  return player;
};

/**
 * チュートリアル用のゲームセットアップ
 */
export const setupTutorialGame = (): GameState => {
    const p1Regalia = REGALIA_LIST.find(r => r.id === 'regalia-shiragane')!; // シラガネ
    const cpuRegalia = REGALIA_LIST.find(r => r.id === 'regalia-totsukamatsurugi')!; // トツカ（敵役）
    
    // プレイヤー作成
    const player = createPlayer('p1', 'Player', true, p1Regalia, 'br-shiragane-1');
    const cpu = createPlayer('cpu', 'CPU (Tutorial)', false, cpuRegalia, 'br-totsuka-1');

    // プレイヤーの手札を調整（クラフト説明用に斬撃x2、赤血x2を確実に持たせる）
    // 一旦手札を空にして、特定のカードを入れる
    player.hand = [];
    player.hand.push(createStarterSlash());
    player.hand.push(createStarterSlash());
    player.hand.push(createStarterBlood());
    player.hand.push(createStarterBlood());
    
    // CPUのライフを調整（倒しやすくする）
    // チュートリアルなので、CPUはアクションを行わない前提だが、ライフは20で開始し、最後は強制的に倒す
    
    // マーケットのセットアップ（固定）
    const selectedSets = RECALL_SETS.slice(0, 5);
    const recallPiles = selectedSets.map(set => {
        const cards = set.cards.map(tmpl => createRecallCard(tmpl));
        return cards; // ランダムにしない
    });

    return {
        phase: Phase.Main,
        turnPlayerId: 'p1',
        firstPlayerId: 'p1',
        players: { player, cpu },
        market: {
            recallPiles: recallPiles,
            artsDeckSlash: [],
            artsDeckBlood: []
        },
        log: ['--- Tutorial Start ---'],
        isTutorial: true,
        tutorialStep: 0
    };
};


/**
 * 神器覚醒チェックを行う関数
 * ライフが10以下の場合、覚醒フラグを立てる
 * @param player 対象プレイヤー
 * @param log ゲームログ配列
 */
export const checkAwakening = (player: PlayerState, log: string[]): void => {
    if (player.life <= 10 && !player.isRegaliaAwakened) {
        player.isRegaliaAwakened = true;
        log.push(`${player.name} の神器が覚醒した！ (Life <= 10)`);
    }
};

/**
 * プレイヤーのクリーンナップ処理を行う関数
 * 場のカードを捨て札に送り（一部除く）、手札を捨て、リソースをリセットし、次ターンのドローを行う
 * @param player 対象プレイヤー
 * @param log ゲームログ配列
 */
export const performCleanup = (player: PlayerState, log: string[]): void => {
    // 1. フィールドカードの処理（一部カードは残留）
    const remainingCards = [];
    const discardCards = [];
    
    for (const card of player.field) {
        // 残留条件: 特定のカード名 または 説明文に「場に残る」を含む
        if (['天球の蒼', '自律人器群【ラムダ】', 'オボツの欠片'].includes(card.name) || card.description.includes('場に残る')) {
            remainingCards.push(card);
        } else {
            discardCards.push(card);
        }
    }

    player.discard.push(...discardCards);
    player.field = remainingCards;

    // 2. リソースリセット (注: bloodPoolのクリアはRESOLVE_BATTLEで行われるが、ここでも念のため確認)
    player.hasPassed = false;
    
    // 3. 攻撃力再計算 (場に残ったカードの攻撃力を反映)
    recalculateAttackTotal(player);

    // 4. アクション回数リセット
    const stats = getRegaliaStats(player);
    const pactBonus = player.activeBuffs.kutonePactBonus || 0;
    player.remainingActions = (stats ? stats.bloodPact : 1) + pactBonus;
    
    // 5. 神器のアンタップ
    if (player.regalia) player.regalia.isTapped = false;
    
    // 6. 手札の処理（発狂は消滅、他は捨て札）
    const handToDiscard: Card[] = [];
    for (const card of player.hand) {
        if (card.name === '発狂') {
            log.push(`${player.name}の手札の「発狂」は消滅した。`);
        } else {
            handToDiscard.push(card);
        }
    }
    player.discard.push(...handToDiscard);
    player.hand = [];

    // 7. 次ターンのドロー
    const drawCount = stats ? stats.handSize : 5;
    const drawn = drawCard(player, drawCount);
    player.deck = drawn.deck;
    player.hand = drawn.hand;
    player.discard = drawn.discard;
};
