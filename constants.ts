import { Card, CardType, RegaliaCard, BloodRecall } from './types';
import { generateId } from './utils/common';

export const INITIAL_LIFE = 20; // 初期ライフ
export const STARTER_DECK_SLASH_COUNT = 4; // 初期デッキの斬撃枚数
export const STARTER_DECK_BLOOD_COUNT = 6; // 初期デッキの鮮血枚数

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

// リコールカードの汎用生成関数
export const createRecallCard = (template: Omit<Card, 'id'>): Card => ({
  ...template,
  id: generateId('recall')
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

// --- 神器（Regalia）の定義 (全8種) ---
// base: 覚醒前, awakened: 覚醒後
export const REGALIA_LIST: RegaliaCard[] = [
  {
    id: 'regalia-shiragane',
    name: 'シラガネ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '1980年代に観測された神器。',
    year: 1980,
    base: {
        handSize: 3, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: '手札にある「斬撃」(Lv1) 1枚を「斬撃一閃」(Lv2) に強化する。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: '手札にある「斬撃」(Lv1) 2枚を「斬撃一閃」(Lv2) に強化する。'
    }
  },
  {
    id: 'regalia-hihiirokane',
    name: 'ヒヒイロカネ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '1920年代に観測。古の金属で作られた刃。',
    year: 1920,
    base: {
        handSize: 3, bloodPact: 2, selfHarmCost: 4,
        selfHarmEffectDesc: '契告書から『斬撃一閃』を1枚手札に加える。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 4,
        selfHarmEffectDesc: '契告書から『絶技【斬閃】』を1枚手札に加える。'
    }
  },
  {
    id: 'regalia-totsukamatsurugi',
    name: 'トツカマヂチ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '1950年代に観測。呪いをまき散らす剣。',
    year: 1950,
    base: {
        handSize: 4, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: '相手の捨て札に『発狂』を1枚置く。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: '相手のデッキの1枚目(トップ)に『発狂』を置く。'
    }
  },
  {
    id: 'regalia-niraikanai',
    name: 'ニライカナイ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '2000年代に観測。理想郷への扉。',
    year: 2000,
    base: {
        handSize: 3, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: '自分の山札の上から2枚をブラッドプールに送る。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: '契告書から段階1のアーツを2枚選び、血廻エリアに送る。'
    }
  },
  {
    id: 'regalia-kutoneshirika',
    name: 'クトネシリカ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '2020年代に観測。英雄の魂が宿る。',
    year: 2020,
    base: {
        handSize: 5, bloodPact: 1, selfHarmCost: 5,
        selfHarmEffectDesc: '契告書から「赤血」を1枚、ブラッドプールに加える。'
    },
    awakened: {
        handSize: 5, bloodPact: 1, selfHarmCost: 3,
        selfHarmEffectDesc: '契告書から「赤血」を3枚、ブラッドプールに加える。'
    }
  },
  {
    id: 'regalia-apoitakara',
    name: 'アポイタカラ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '2040年代に観測。アイヌの秘宝。',
    year: 2040,
    base: {
        handSize: 4, bloodPact: 2, selfHarmCost: 1,
        selfHarmEffectDesc: 'デッキからカードを1枚引く。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: 'デッキの上から3枚見る。そのうち1枚を手札に加え、残りを捨て札にする。'
    }
  },
  {
    id: 'regalia-usuganeyoroi',
    name: 'ウスガネヨロイ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '1940年代に観測。鉄壁の守りの中に刃を隠す。',
    year: 1940,
    base: {
        handSize: 4, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: '契告書から「斬撃」を1枚手札に加える。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 4,
        selfHarmEffectDesc: '契告書から「斬撃」を2枚手札に加える。'
    }
  },
  {
    id: 'regalia-obotsukagura',
    name: 'オボツカグラ',
    type: CardType.Regalia,
    attack: 0,
    cost: 0,
    level: 0,
    description: '2010年代に観測。天と地をつなぐ神楽。',
    year: 2010,
    base: {
        handSize: 3, bloodPact: 2, selfHarmCost: 1,
        selfHarmEffectDesc: '契告書から「オボツの欠片」を1枚手札に加える。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: '契告書から「オボツの欠片」を1枚手札に加える。その後、手札2枚まで血廻へ送り、送った数だけ引く。'
    }
  }
];

// --- ブラッドリコール定義 (16種) ---
export const BLOOD_RECALLS: BloodRecall[] = [
    // シラガネ
    { id: 'br-shiragane-1', name: '無垢なる痛み', regaliaId: 'regalia-shiragane', cost: 6, timing: 'Cleanup', description: '【継続】自傷ダメージを受ける代わりに、その数だけブラッドカードをプールに加える。', effectType: 'shiragane_convert' },
    { id: 'br-shiragane-2', name: '銀の乱舞', regaliaId: 'regalia-shiragane', cost: 10, timing: 'Main', description: 'コストとして使用した斬撃アーツを全て場に出す（今回は簡易的にLv1斬撃を3枚場に出す）。', effectType: 'shiragane_revive' },
    
    // ヒヒイロカネ
    { id: 'br-hihiirokane-1', name: '狂気の感染', regaliaId: 'regalia-hihiirokane', cost: 6, timing: 'Main', description: '契告書（マーケット）から「発狂」を2枚、相手のデッキの上に置く。', effectType: 'hihi_madness' },
    { id: 'br-hihiirokane-2', name: '存在の剥奪', regaliaId: 'regalia-hihiirokane', cost: 10, timing: 'BattleStart', description: '相手の場にあるカードを1枚選び、捨て札に送る。', effectType: 'hihi_destroy' },

    // トツカマヂチ
    { id: 'br-totsuka-1', name: '呪詛の深淵', regaliaId: 'regalia-totsukamatsurugi', cost: 2, timing: 'Main', description: 'デッキの上からカードを4枚、血廻り（プール）に送る。', effectType: 'totsuka_mill' },
    { id: 'br-totsuka-2', name: '殺意の波動', regaliaId: 'regalia-totsukamatsurugi', cost: 10, timing: 'BattleStart', description: '[攻撃]+10 (本来はコストXだが簡易化)。', effectType: 'totsuka_atk' },

    // ニライカナイ
    { id: 'br-niraikanai-1', name: '理想郷の守護', regaliaId: 'regalia-niraikanai', cost: 6, timing: 'OnDamage', description: '次のダメージを-8軽減する。', effectType: 'nirai_shield' },
    { id: 'br-niraikanai-2', name: '楽園の光', regaliaId: 'regalia-niraikanai', cost: 12, timing: 'BattleStart', description: '[攻撃]+X。Xは自分の場のカード数に等しい。', effectType: 'nirai_field_atk' },

    // クトネシリカ
    { id: 'br-kutone-1', name: '英雄の血脈', regaliaId: 'regalia-kutoneshirika', cost: 4, timing: 'Cleanup', description: '【継続】人器の血継(Act)を+1する。', effectType: 'kutone_pact' },
    { id: 'br-kutone-2', name: '神威', regaliaId: 'regalia-kutoneshirika', cost: 6, timing: 'BattleStart', description: '[攻撃]+10。', effectType: 'kutone_atk' },

    // アポイタカラ
    { id: 'br-apoi-1', name: '叡智の探求', regaliaId: 'regalia-apoitakara', cost: 8, timing: 'Main', description: 'デッキからカードを2枚引く。', effectType: 'apoi_draw' },
    { id: 'br-apoi-2', name: '秘宝の輝き', regaliaId: 'regalia-apoitakara', cost: 12, timing: 'Main', description: '[攻撃]+8。', effectType: 'apoi_atk' },

    // ウスガネヨロイ
    { id: 'br-usugane-1', name: '棘の鎧', regaliaId: 'regalia-usuganeyoroi', cost: 8, timing: 'Cleanup', description: '【継続】クリーンナップフェイズに相手に2ダメージを与える。', effectType: 'usugane_burn' },
    { id: 'br-usugane-2', name: '決死の覚悟', regaliaId: 'regalia-usuganeyoroi', cost: 10, timing: 'BattleStart', description: 'ライフが1になるようにプールへ送り、送った数だけATKを得る。', effectType: 'usugane_last_stand' },

    // オボツカグラ
    { id: 'br-obotsu-1', name: '神楽舞', regaliaId: 'regalia-obotsukagura', cost: 5, timing: 'Main', description: '即座に覚醒する。既に覚醒していれば1ドロー。', effectType: 'obotsu_awaken' },
    { id: 'br-obotsu-2', name: '天地の共鳴', regaliaId: 'regalia-obotsukagura', cost: 6, timing: 'BattleStart', description: '[攻撃]+X。Xは「オボツの欠片」の数×2。', effectType: 'obotsu_fragment_atk' }
];

// --- マーケットカード（リコールカード）定義 ---
// 7色 x 5種類
export interface RecallColorSet {
    colorName: string;
    cards: Omit<Card, 'id'>[];
}

export const RECALL_SETS: RecallColorSet[] = [
    {
        colorName: '廃滅の緋 (Scarlet)',
        cards: [
            // 共通: Cost 4, 場に置かれた時1ドロー
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 0, cost: 4, level: 0, 
                description: '【共通】場に置かれた時、1ドロー。\n【固有】さらにデッキからカードを1枚引く(計2枚)。' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 0, cost: 4, level: 0, 
                description: '【共通】場に置かれた時、1ドロー。\n【固有】契告書エリアから「赤緋血」を1枚手札に加える。' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 3, cost: 4, level: 0, // 固有で攻撃+3
                description: '【共通】場に置かれた時、1ドロー。\n【固有】[攻撃]+3' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 0, cost: 4, level: 0, 
                description: '【共通】場に置かれた時、1ドロー。\n【固有】契告書エリアから「斬撃一閃」を1枚手札に加える。' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 0, cost: 4, level: 0, 
                description: '【共通】場に置かれた時、1ドロー。\n【固有】手札にあるアーツカードを1枚【追憶強化】する。' 
            }
        ]
    },
    {
        colorName: '無間の紫 (Purple)',
        cards: [
            // 共通: Cost 6, プレイした時相手デッキトップへ
            {
                name: '無間の紫', type: CardType.Recall, attack: -5, cost: 6, level: 0, // 固有で攻撃-5
                description: '【共通】プレイ後、相手デッキの上へ。\n【固有】[攻撃]-5'
            },
            {
                name: '無間の紫', type: CardType.Recall, attack: 0, cost: 6, level: 0,
                description: '【共通】プレイ後、相手デッキの上へ。\n【固有】ターン終了時、「発狂」を1枚相手の捨て札に送る。'
            },
            {
                name: '無間の紫', type: CardType.Recall, attack: 0, cost: 6, level: 0,
                description: '【共通】プレイ後、相手デッキの上へ。\n【固有】ターン終了時、「赤血」を2枚捨て札に送る。'
            },
            {
                name: '無間の紫', type: CardType.Recall, attack: 0, cost: 6, level: 0,
                description: '【共通】プレイ後、相手デッキの上へ。\n【固有】ターン終了時、「斬撃」を1枚デッキの上に置く。'
            },
            {
                name: '無間の紫', type: CardType.Recall, attack: 0, cost: 6, level: 0,
                description: '【共通】プレイ後、相手デッキの上へ。\n【固有】ターン終了時、場の最も攻撃力が高いカードを1枚捨て札に送る。'
            }
        ]
    },
    {
        colorName: '雷霆の灰 (Gray)',
        cards: [
            // 共通: Cost 2, [攻撃]+1, 手札から場に置かれた時効果発動
            { 
                name: '雷霆の灰', type: CardType.Recall, attack: 1, cost: 2, level: 0, 
                description: '【共通】[攻撃]+1\n【固有】手札のアーツカード1枚を【追憶強化】する。' 
            },
            { 
                name: '雷霆の灰', type: CardType.Recall, attack: 1, cost: 2, level: 0, 
                description: '【共通】[攻撃]+1\n【固有】デッキからカードを2枚引く。' 
            },
            { 
                name: '雷霆の灰', type: CardType.Recall, attack: 1, cost: 2, level: 0, 
                description: '【共通】[攻撃]+1\n【固有】「ブラッドカード」を4枚ブラッドプールに加える。' 
            },
            { 
                name: '雷霆の灰', type: CardType.Recall, attack: 1, cost: 2, level: 0, 
                description: '【共通】[攻撃]+1\n【固有】契告書から「絶技【斬閃】」を1枚手札に加える。' 
            },
            { 
                name: '雷霆の灰', type: CardType.Recall, attack: 7, cost: 2, level: 0, // 1 + 6 = 7
                description: '【共通】[攻撃]+1\n【固有】このカードの[攻撃]+6 (計7)。' 
            }
        ]
    },
    {
        colorName: '天球の蒼 (Blue)',
        cards: [
            // 共通: Cost 5, バトルフェイズ終了時場に残る。ターン開始時効果発動。
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。ターン開始時に発動。\n【固有】手札のアーツ1枚を【追憶強化】。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。ターン開始時に発動。\n【固有】デッキ上2枚を見て、血廻へ送るか戻す。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。ターン開始時に発動。\n【固有】「赤緋血」を1枚手札に加える。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。ターン開始時に発動。\n【固有】「ブラッドカード」を3枚プールへ加える。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。ターン開始時に発動。\n【固有】「斬撃一閃」を手札へ、「ブラッドカード」をプールへ。' 
            }
        ]
    },
    {
        colorName: '葬送の黒 (Black)',
        cards: [
            // 共通: Cost 9, [攻撃]+8。場に置かれた時、血(X)を払い固有効果。
            { 
                name: '葬送の黒', type: CardType.Recall, attack: 8, cost: 9, level: 0, 
                description: '【共通】[攻撃]+8。血を払い効果発動。\n【固有】1血払う: 1枚引く。' 
            },
            { 
                name: '葬送の黒', type: CardType.Recall, attack: 8, cost: 9, level: 0, 
                description: '【共通】[攻撃]+8。血を払い効果発動。\n【固有】5血払う: 「絶技【斬閃】」を手札へ。' 
            },
            { 
                name: '葬送の黒', type: CardType.Recall, attack: 8, cost: 9, level: 0, 
                description: '【共通】[攻撃]+8。血を払い効果発動。\n【固有】6血払う: デッキから好きなカードをデッキトップへ。' 
            },
            { 
                name: '葬送の黒', type: CardType.Recall, attack: 8, cost: 9, level: 0, 
                description: '【共通】[攻撃]+8。血を払い効果発動。\n【固有】7血払う: 公開リコールカードを1枚想起(獲得)する。' 
            },
            { 
                name: '葬送の黒', type: CardType.Recall, attack: 8, cost: 9, level: 0, 
                description: '【共通】[攻撃]+8。血を払い効果発動。\n【固有】X血払う: このカードの[攻撃]+X。' 
            }
        ]
    },
    {
        colorName: '超克の桜 (Cherry)',
        cards: [
            // 共通: Cost 7, 【凱旋】(ダメージ時墓地の斬撃系を追憶強化)。
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆手札のLv1アーツを【追憶強化】。' 
            },
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆契告書から「斬撃」2枚を手札へ。' 
            },
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆契告書から「斬撃一閃」1枚を手札へ。' 
            },
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 2ドロー。' 
            },
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆場の他のカードを手札に戻す。' 
            }
        ]
    },
    {
        colorName: '機翼の藍 (Indigo)',
        cards: [
            // 共通: Cost 3, 場に置かれた時「ラムダ(Atk2)」を場に出す。
            { 
                name: '機翼の藍', type: CardType.Recall, attack: 0, cost: 3, level: 0, 
                description: '【共通】ラムダを召喚。\n【固有】手札を任意枚数血廻へ送る。' 
            },
            { 
                name: '機翼の藍', type: CardType.Recall, attack: 0, cost: 3, level: 0, 
                description: '【共通】ラムダを召喚。\n【固有】デッキ上2枚を見て1枚アーツ強化/破棄/戻す。' 
            },
            { 
                name: '機翼の藍', type: CardType.Recall, attack: 0, cost: 3, level: 0, 
                description: '【共通】ラムダを召喚。\n【固有】手札のLv1血アーツを【追憶強化】。' 
            },
            { 
                name: '機翼の藍', type: CardType.Recall, attack: 0, cost: 3, level: 0, 
                description: '【共通】ラムダを召喚。\n【固有】手札2枚まで血廻へ送る→送ったら1ドロー。' 
            },
            { 
                name: '機翼の藍', type: CardType.Recall, attack: 0, cost: 3, level: 0, 
                description: '【共通】ラムダを召喚。\n【固有】血廻のカード1枚を手札へ→加えたら2ドロー。' 
            }
        ]
    }
];