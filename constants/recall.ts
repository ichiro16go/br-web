import { Card, CardType, RegaliaCard, BloodRecall } from '../types';
import { generateId } from '../utils/common';

// リコールカードの汎用生成関数
export const createRecallCard = (template: Omit<Card, 'id'>): Card => ({
    ...template,
    id: generateId('recall')
  });
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