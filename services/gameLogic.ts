import { PlayerState, Card, CardType, RegaliaCard, RegaliaStats } from '../types';
import { 
  INITIAL_LIFE, STARTER_DECK_SLASH_COUNT, STARTER_DECK_BLOOD_COUNT, 
  createStarterSlash, createStarterBlood, BLOOD_RECALLS, 
  createSlashFlash, createMasterySlashFlash, createRedScarletBlood, createTorrentRedStarBlood, createLambda, createObotsuFragment
} from '../constants/index';
import { shuffle } from '../utils/common';

/**
 * プレイヤーの現在の神器ステータス（覚醒状態を考慮）を取得する
 */
export const getRegaliaStats = (player: PlayerState): RegaliaStats | null => {
    if (!player.regalia) return null;
    return player.isRegaliaAwakened ? player.regalia.awakened : player.regalia.base;
};

/**
 * 現在の場のカードから合計攻撃力を再計算する
 * (永続効果やバフの適用漏れを防ぐため)
 */
export const recalculateAttackTotal = (player: PlayerState): void => {
    let total = 0;
    // 場のカードの攻撃力を合算
    for (const card of player.field) {
        total += card.attack;
    }
    // その他のバフがあればここで加算（例：ブラッドリコールによる永続バフなどがあれば）
    
    player.attackTotal = total;
};

/**
 * プレイヤーにカードを引かせる処理
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
 * 初期デッキを生成する
 */
export const createInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  for (let i = 0; i < STARTER_DECK_SLASH_COUNT; i++) deck.push(createStarterSlash());
  for (let i = 0; i < STARTER_DECK_BLOOD_COUNT; i++) deck.push(createStarterBlood());
  return shuffle(deck);
};

/**
 * 新規プレイヤーを作成する
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
  
  player = drawCard(player, regalia.base.handSize);
  return player;
};

/**
 * 追憶強化ロジック
 */
const getUpgradedCard = (card: Card): Card | null => {
    if (card.name === '斬撃') return createSlashFlash();
    if (card.name === '斬撃一閃') return createMasterySlashFlash();
    if (card.name === '赤血') return createRedScarletBlood();
    if (card.name === '赤緋血') return createTorrentRedStarBlood();
    return null;
};

/**
 * 追憶強化を実行する
 */
export const executeRemembranceEnhancement = (player: PlayerState, log: string[], filter?: (c: Card) => boolean, count: number = 1): void => {
    for (let k = 0; k < count; k++) {
        const candidates = player.hand.map((c, i) => ({ card: c, index: i }))
            .filter(({ card }) => (card.type === CardType.Slash || card.type === CardType.Blood));
        
        const validCandidates = filter ? candidates.filter(({ card }) => filter(card)) : candidates;

        if (validCandidates.length === 0) {
            log.push(`${player.name}の手札に【追憶強化】の対象がなかった。`);
            return;
        }

        const targetInfo = validCandidates[0];
        const targetCard = targetInfo.card;
        const upgradedCard = getUpgradedCard(targetCard);
        
        if (upgradedCard) {
            player.hand.splice(targetInfo.index, 1);
            player.bloodCircuit.push(targetCard);
            player.hand.push(upgradedCard);
            log.push(`${player.name}は【追憶強化】を行った: ${targetCard.name} -> ${upgradedCard.name} (血廻へ)`);
        } else {
            log.push(`${player.name}の${targetCard.name}はこれ以上強化できない。`);
        }
    }
};

/**
 * カードが場に出た時の効果解決
 */
export const resolveFieldEntryEffects = (player: PlayerState, card: Card, log: string[]): void => {
    // ターン開始時効果や永続効果を持つカードはここでは発動しない
    if (['天球の蒼', '自律人器群【ラムダ】', 'オボツの欠片'].includes(card.name)) return;

    // ドロー効果
    if (card.description.includes('ドロー') || card.description.includes('Draw')) {
         const drawCount = (card.description.includes('計2枚') || card.description.includes('2ドロー') || card.description.includes('2枚引く')) ? 2 : 1;
         const drawn = drawCard(player, drawCount);
         player.deck = drawn.deck;
         player.hand = drawn.hand;
         player.discard = drawn.discard;
         log.push(`${player.name}は${drawCount}枚引いた。`);
    }

    // ブラッド追加 (プールへ)
    if (card.description.includes('ブラッドプールに加える')) {
        let amount = 0;
        if (card.description.includes('4枚')) amount = 4;
        else if (card.description.includes('3枚')) amount = 3;
        else if (card.description.includes('1枚')) amount = 1;

        if (amount > 0) {
             for(let i=0; i<amount; i++) player.bloodPool.push(createStarterBlood());
             log.push(`${player.name}はブラッド(+${amount})を得た。`);
        }
    }

    // 特定カード獲得
    if (card.description.includes('手札に加える')) {
        if (card.description.includes('赤緋血')) player.hand.push(createRedScarletBlood());
        else if (card.description.includes('斬撃一閃')) player.hand.push(createSlashFlash());
        else if (card.description.includes('絶技【斬閃】')) player.hand.push(createMasterySlashFlash());
        else if (card.description.includes('オボツの欠片')) player.hand.push(createObotsuFragment());
    }

    // 追憶強化
    if (card.description.includes('【追憶強化】')) {
        let filter: ((c: Card) => boolean) | undefined = undefined;
        if (card.description.includes('Lv1アーツ')) {
            filter = (c) => c.level === 1;
        } else if (card.description.includes('Lv1血アーツ')) {
            filter = (c) => c.level === 1 && c.type === CardType.Blood;
        }
        executeRemembranceEnhancement(player, log, filter);
    }
    
    // 機翼の藍: ラムダ召喚
    if (card.name.includes('機翼の藍')) {
        const lambda = createLambda();
        player.field.push(lambda);
        player.attackTotal += lambda.attack;
        log.push(`${player.name} は「自律人器群【ラムダ】」を召喚した (+${lambda.attack} ATK)`);
    }
};

/**
 * 神器覚醒チェック
 */
export const checkAwakening = (player: PlayerState, log: string[]): void => {
    if (player.life <= 10 && !player.isRegaliaAwakened) {
        player.isRegaliaAwakened = true;
        log.push(`${player.name} の神器が覚醒した！ (Life <= 10)`);
    }
};

/**
 * ターン開始時の効果をまとめて解決する関数
 * 天球の蒼、ラムダ、オボツの欠片などの効果を処理
 * @returns 選択が必要な処理がある場合、そのカードのリストを返す
 */
export const resolveStartOfTurnEffects = (player: PlayerState, log: string[]): Card[] => {
    const pendingCards: Card[] = [];

    // 1. 天球の蒼の効果
    const blueSpheres = player.field.filter(c => c.name === '天球の蒼');
    for (const card of blueSpheres) {
        // 改行を削除して判定を堅牢にする
        const desc = card.description.replace(/\n/g, '');

        if (desc.includes('手札にあるアーツカードを1枚選ぶ')) {
            // 選択が必要なのでキューに追加
            pendingCards.push(card);
        }
        else if (desc.includes('デッキの上から2枚見る')) {
             // 選択が必要なのでキューに追加
             pendingCards.push(card);
        }
        else if (desc.includes('赤緋血を1枚手札に加える')) {
            player.hand.push(createRedScarletBlood());
            log.push(`[天球の蒼] ${player.name}は赤緋血を手に入れた。`);
        }
        else if (desc.includes('ブラッドカード」を3枚')) {
            for(let i=0; i<3; i++) player.bloodPool.push(createStarterBlood());
            log.push(`[天球の蒼] ${player.name}のプールにブラッドカードが3枚追加された。`);
        }
        else if (desc.includes('斬撃一閃') && desc.includes('ブラッドプール')) {
            player.hand.push(createSlashFlash());
            player.bloodPool.push(createStarterBlood());
            log.push(`[天球の蒼] ${player.name}は斬撃一閃とブラッドを得た。`);
        }
    }

    // 2. ラムダの効果 (3体以上でブラッド追加)
    const lambdaCount = player.field.filter(c => c.name === '自律人器群【ラムダ】').length;
    if (lambdaCount >= 3) {
        player.bloodPool.push(createStarterBlood());
        player.bloodPool.push(createStarterBlood());
        log.push(`[自律人器群【ラムダ】] 共鳴効果: ${player.name}はブラッド(+2)を得た。`);
    }

    // 3. オボツの欠片の効果 (1枚につきブラッド追加)
    const fragmentCount = player.field.filter(c => c.name === 'オボツの欠片').length;
    if (fragmentCount > 0) {
        for(let i=0; i<fragmentCount; i++) {
            player.bloodPool.push(createStarterBlood());
        }
        log.push(`[オボツの欠片] ${player.name}はブラッド(+${fragmentCount})を得た。`);
    }

    return pendingCards;
};

/**
 * プレイヤーのクリーンナップ処理を行う
 */
export const performCleanup = (player: PlayerState, log: string[]): void => {
    // フィールドカードの処理（一部カードは残留）
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

    // リソースリセット (注: bloodPoolのクリアはRESOLVE_BATTLEで行うためここでは行わない)
    player.hasPassed = false;
    
    // 攻撃力再計算 (場に残ったカードの攻撃力を反映)
    recalculateAttackTotal(player);

    // アクション回数リセット
    const stats = getRegaliaStats(player);
    const pactBonus = player.activeBuffs.kutonePactBonus || 0;
    player.remainingActions = (stats ? stats.bloodPact : 1) + pactBonus;
    
    // 神器のアンタップ
    if (player.regalia) player.regalia.isTapped = false;
    
    // 手札の処理（発狂は消滅、他は捨て札）
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

    // 次ターンのドロー
    const drawCount = stats ? stats.handSize : 5;
    const drawn = drawCard(player, drawCount);
    player.deck = drawn.deck;
    player.hand = drawn.hand;
    player.discard = drawn.discard;
};