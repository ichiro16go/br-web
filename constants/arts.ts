import { Card, CardType } from '../types';
import { generateId } from '../utils/common';

// --- 初期カード生成ファクトリ ---

export const createStarterSlash = (): Card => ({
  id: generateId('slash'),
  name: '斬撃', // Slash (I)
  type: CardType.Slash,
  attack: 1,
  cost: 0,
  level: 1,
  description: '[攻撃] +1'
});

export const createStarterBlood = (): Card => ({
  id: generateId('blood'),
  name: '赤血', // Blood (I)
  type: CardType.Blood,
  attack: 0,
  cost: 0,
  level: 1,
  description: 'ブラッドプールにブラッドカードを1枚加える。'
});

// --- 上位アーツ（強化カード）生成ファクトリ ---

// Level 2 Slash: 斬撃一閃
export const createSlashFlash = (): Card => ({
  id: generateId('art-slash-flash'),
  name: '斬撃一閃',
  type: CardType.Slash,
  attack: 3,
  cost: 0,
  level: 2,
  description: '[攻撃] +3'
});

// Level 2 Blood: 赤緋血
export const createRedScarletBlood = (): Card => ({
  id: generateId('art-red-scarlet'),
  name: '赤緋血',
  type: CardType.Blood,
  attack: 0,
  cost: 0,
  level: 2,
  description: 'ブラッドプールにブラッドカードを3枚加える。'
});

// Level 3 Slash: 絶技【斬閃】
export const createMasterySlashFlash = (): Card => ({
  id: generateId('art-mastery-slash'),
  name: '絶技【斬閃】',
  type: CardType.Slash,
  attack: 6,
  cost: 0,
  level: 3,
  description: '[攻撃] +6'
});

// Level 3 Blood: 奔流【緋星血】
export const createTorrentRedStarBlood = (): Card => ({
  id: generateId('art-torrent-blood'),
  name: '奔流【緋星血】',
  type: CardType.Blood,
  attack: 0,
  cost: 0,
  level: 3,
  description: 'ブラッドプールにブラッドカードを6枚加える。'
});

// Special: 桜流し
export const createSakuraNagashi = (): Card => ({
  id: generateId('art-sakura'),
  name: '桜流し',
  type: CardType.Slash,
  attack: 1,
  cost: 0,
  level: 1, // Special
  description: '[攻撃]+1, 1血ブラッド, 【発火】(デッキから1枚ドロー)'
});

// 災厄カード: 発狂
export const createMadness = (): Card => ({
  id: generateId('calamity-madness'),
  name: '発狂',
  type: CardType.Calamity,
  attack: 0,
  cost: 0,
  level: 0,
  description: '手札にあると邪魔になる。プレイ不可。'
});

// アイテム: オボツの欠片
export const createObotsuFragment = (): Card => ({
  id: generateId('item-fragment'),
  name: 'オボツの欠片',
  type: CardType.Recall, // 便宜上Recallタイプ
  attack: 1,
  cost: 0,
  level: 0,
  description: '【不屈】(場に残る), [攻撃]+1。ターン開始時、契告書から「赤血」を1枚プールに加える。'
});

// 機翼の藍の効果で出現するトークン: ラムダ
export const createLambda = (): Card => ({
    id: generateId('token-lambda'),
    name: '自律人器群【ラムダ】',
    type: CardType.Slash,
    attack: 1,
    cost: 0,
    level: 0,
    description: '【藍】の効果で召喚された自律兵器。[攻撃]+1'
});

// 古い実装互換のための強化アーツ生成（必要であれば使用）
export const createUpgradedSlash = (level: number): Card => ({
  id: generateId(`slash-${level}`),
  name: level === 2 ? '斬撃一閃' : '絶技【斬閃】',
  type: CardType.Slash,
  attack: level === 2 ? 3 : 6,
  cost: 0,
  level: level,
  description: level === 2 ? '[攻撃] +3' : '[攻撃] +6'
});

// --- 強化レシピ定義 ---
export interface CraftRecipe {
    id: string;
    name: string;
    resultName: string;
    description: string;
    inputMatcher: (hand: Card[]) => string[] | null; // 必要なカードIDの配列を返す、なければnull
    createResult: () => Card;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
    {
        id: 'upgrade-slash-2',
        name: '斬撃の強化 (II)',
        resultName: '斬撃一閃',
        description: '「斬撃」2枚を血廻に送り、「斬撃一閃」を得る。',
        inputMatcher: (hand) => {
            const cards = hand.filter(c => c.name === '斬撃');
            return cards.length >= 2 ? [cards[0].id, cards[1].id] : null;
        },
        createResult: createSlashFlash
    },
    {
        id: 'upgrade-blood-2',
        name: '赤血の強化 (II)',
        resultName: '赤緋血',
        description: '「赤血」2枚を血廻に送り、「赤緋血」を得る。',
        inputMatcher: (hand) => {
            const cards = hand.filter(c => c.name === '赤血');
            return cards.length >= 2 ? [cards[0].id, cards[1].id] : null;
        },
        createResult: createRedScarletBlood
    },
    {
        id: 'upgrade-slash-3',
        name: '斬撃の極意 (III)',
        resultName: '絶技【斬閃】',
        description: '「斬撃一閃」2枚を血廻に送り、「絶技【斬閃】」を得る。',
        inputMatcher: (hand) => {
            const cards = hand.filter(c => c.name === '斬撃一閃');
            return cards.length >= 2 ? [cards[0].id, cards[1].id] : null;
        },
        createResult: createMasterySlashFlash
    },
    {
        id: 'upgrade-blood-3',
        name: '赤血の極意 (III)',
        resultName: '奔流【緋星血】',
        description: '「赤緋血」2枚を血廻に送り、「奔流【緋星血】」を得る。',
        inputMatcher: (hand) => {
            const cards = hand.filter(c => c.name === '赤緋血');
            return cards.length >= 2 ? [cards[0].id, cards[1].id] : null;
        },
        createResult: createTorrentRedStarBlood
    },
    {
        id: 'craft-sakura',
        name: '桜流しの習得',
        resultName: '桜流し',
        description: '「斬撃」と「赤血」を各1枚血廻に送り、「桜流し」を得る。',
        inputMatcher: (hand) => {
            const slash = hand.find(c => c.name === '斬撃');
            const blood = hand.find(c => c.name === '赤血');
            return (slash && blood) ? [slash.id, blood.id] : null;
        },
        createResult: createSakuraNagashi
    }
];