import { CardType, RegaliaCard } from '../types';

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
        selfHarmEffectDesc: '手札にある段階1のアーツ1枚を、ゲーム外から「斬撃一閃」などの強化後カードにして手札に加える（追憶強化）。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 2,
        selfHarmEffectDesc: '手札にある段階1のアーツ2枚を、ゲーム外から強化後カードにして手札に加える（追憶強化）。'
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
        selfHarmEffectDesc: 'ゲーム外から『斬撃一閃』を1枚手札に加える。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 4,
        selfHarmEffectDesc: 'ゲーム外から『絶技【斬閃】』を1枚手札に加える。'
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
        selfHarmEffectDesc: '自分の山札の上から2枚を血廻エリアに送る。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: 'ゲーム外からランダムな段階1のアーツを2枚選び、血廻エリアに追加する。'
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
        selfHarmEffectDesc: 'ゲーム外から「赤血」を1枚、ブラッドプールに加える。'
    },
    awakened: {
        handSize: 5, bloodPact: 1, selfHarmCost: 3,
        selfHarmEffectDesc: 'ゲーム外から「赤血」を3枚、ブラッドプールに加える。'
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
        selfHarmEffectDesc: 'デッキの上から3枚見る。そのうち1枚を選んで手札に加え、残りを捨て札にする。'
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
        selfHarmEffectDesc: 'ゲーム外から「斬撃」を1枚手札に加える。'
    },
    awakened: {
        handSize: 4, bloodPact: 2, selfHarmCost: 4,
        selfHarmEffectDesc: 'ゲーム外から「斬撃」を2枚手札に加える。'
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
        selfHarmEffectDesc: '「オボツの欠片を1枚手札に加える」か「赤血を2枚手札に加える」かを選択する。'
    },
    awakened: {
        handSize: 3, bloodPact: 2, selfHarmCost: 3,
        selfHarmEffectDesc: '手札を2枚まで選び血廻へ送る。その後、送った数だけ引く。'
    }
  }
];


export const getRegaliaTheme = (id: string) => {
    switch (id) {
        case 'regalia-shiragane': // 灰
            return {
                border: 'border-gray-500',
                hover: 'hover:border-gray-300 hover:shadow-[0_0_15px_rgba(107,114,128,0.3)]',
                bg: 'bg-gray-900',
                title: 'text-gray-200',
                subText: 'text-gray-400',
                statsBg: 'bg-gray-800/50',
                accentText: 'text-gray-300',
                awakenedBorder: 'border-gray-500/30',
                descriptionBg: 'bg-gray-950/40',
                descriptionBorder: 'border-gray-700/30'
            };
        case 'regalia-hihiirokane': // 緋
            return {
                border: 'border-red-600',
                hover: 'hover:border-red-400 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]',
                bg: 'bg-red-950',
                title: 'text-red-500',
                subText: 'text-red-300',
                statsBg: 'bg-red-900/20',
                accentText: 'text-red-400',
                awakenedBorder: 'border-red-500/30',
                descriptionBg: 'bg-red-950/40',
                descriptionBorder: 'border-red-700/30'
            };
        case 'regalia-totsukamatsurugi': // 紫
            return {
                border: 'border-purple-600',
                hover: 'hover:border-purple-400 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]',
                bg: 'bg-purple-950',
                title: 'text-purple-400',
                subText: 'text-purple-300',
                statsBg: 'bg-purple-900/20',
                accentText: 'text-purple-400',
                awakenedBorder: 'border-purple-500/30',
                descriptionBg: 'bg-purple-950/40',
                descriptionBorder: 'border-purple-700/30'
            };
        case 'regalia-niraikanai': // 蒼
            return {
                border: 'border-cyan-600',
                hover: 'hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(8,145,178,0.3)]',
                bg: 'bg-cyan-950',
                title: 'text-cyan-400',
                subText: 'text-cyan-300',
                statsBg: 'bg-cyan-900/20',
                accentText: 'text-cyan-400',
                awakenedBorder: 'border-cyan-500/30',
                descriptionBg: 'bg-cyan-950/40',
                descriptionBorder: 'border-cyan-700/30'
            };
        case 'regalia-kutoneshirika': // 黒
            return {
                border: 'border-neutral-600',
                hover: 'hover:border-neutral-400 hover:shadow-[0_0_15px_rgba(82,82,82,0.3)]',
                bg: 'bg-neutral-950',
                title: 'text-neutral-300',
                subText: 'text-neutral-500',
                statsBg: 'bg-neutral-900/20',
                accentText: 'text-neutral-400',
                awakenedBorder: 'border-neutral-500/30',
                descriptionBg: 'bg-neutral-950/40',
                descriptionBorder: 'border-neutral-700/30'
            };
        case 'regalia-apoitakara': // 白
            return {
                border: 'border-slate-200',
                hover: 'hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
                bg: 'bg-slate-950',
                title: 'text-slate-100',
                subText: 'text-slate-400',
                statsBg: 'bg-slate-900/20',
                accentText: 'text-slate-200',
                awakenedBorder: 'border-slate-200/30',
                descriptionBg: 'bg-slate-950/40',
                descriptionBorder: 'border-slate-700/30'
            };
        case 'regalia-usuganeyoroi': // ピンク
            return {
                border: 'border-pink-500',
                hover: 'hover:border-pink-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]',
                bg: 'bg-pink-950',
                title: 'text-pink-400',
                subText: 'text-pink-300',
                statsBg: 'bg-pink-900/20',
                accentText: 'text-pink-400',
                awakenedBorder: 'border-pink-500/30',
                descriptionBg: 'bg-pink-950/40',
                descriptionBorder: 'border-pink-700/30'
            };
        case 'regalia-obotsukagura': // 藍
            return {
                border: 'border-indigo-500',
                hover: 'hover:border-indigo-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
                bg: 'bg-indigo-950',
                title: 'text-indigo-400',
                subText: 'text-indigo-300',
                statsBg: 'bg-indigo-900/20',
                accentText: 'text-indigo-400',
                awakenedBorder: 'border-indigo-500/30',
                descriptionBg: 'bg-indigo-950/40',
                descriptionBorder: 'border-indigo-700/30'
            };
        default:
            return {
                border: 'border-gray-600',
                hover: 'hover:border-gray-400',
                bg: 'bg-gray-800',
                title: 'text-gray-400',
                subText: 'text-gray-500',
                statsBg: 'bg-black/30',
                accentText: 'text-gray-400',
                awakenedBorder: 'border-gray-700/20',
                descriptionBg: 'bg-gray-900/20',
                descriptionBorder: 'border-gray-800/20'
            };
    }
};