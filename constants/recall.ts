import { Card, CardType, BloodRecall } from '../types';
import { generateId } from '../utils/common';

// リコールカードの汎用生成関数
export const createRecallCard = (template: Omit<Card, 'id'>): Card => ({
  ...template,
  id: generateId('recall')
});

// --- ブラッドリコール定義 (16種) ---
export const BLOOD_RECALLS: BloodRecall[] = [
    // シラガネ
    { 
        id: 'br-shiragane-1', name: '無垢なる痛み', regaliaId: 'regalia-shiragane', 
        cost: 2, timing: 'Main', 
        description: 'デッキの上からカードを4枚血廻に送る。', 
        effectType: 'shiragane_mill_circuit' 
    },
    { 
        id: 'br-shiragane-2', name: '銀の乱舞', regaliaId: 'regalia-shiragane', 
        cost: 10, timing: 'Main', 
        description: '血廻にある斬撃アーツをすべて場に出す。', 
        effectType: 'shiragane_deploy_slash' 
    },
    
    // ヒヒイロカネ
    { 
        id: 'br-hihiirokane-1', name: '狂気の感染', regaliaId: 'regalia-hihiirokane', 
        cost: 6, timing: 'BattleEnd', 
        description: '自傷ダメージを受ける代わりに、ゲーム外から「ブラッドカード」を自傷数だけプールに加える効果を得る（ターン終了時まで）。', 
        effectType: 'hihi_convert_blood' 
    },
    { 
        id: 'br-hihiirokane-2', name: '存在の剥奪', regaliaId: 'regalia-hihiirokane', 
        cost: 10, timing: 'Main', 
        description: '血廻コストとして使用した（＝現在血廻にある）<斬アーツカード>を全て場に出す。', 
        effectType: 'hihi_deploy_slash' 
    },

    // トツカマヂチ
    { 
        id: 'br-totsuka-1', name: '呪詛の深淵', regaliaId: 'regalia-totsukamatsurugi', 
        cost: 6, timing: 'Main', 
        description: 'ゲーム外から「発狂」を2枚、相手のデッキの上に置く。', 
        effectType: 'totsuka_madness_deck' 
    },
    { 
        id: 'br-totsuka-2', name: '殺意の波動', regaliaId: 'regalia-totsukamatsurugi', 
        cost: 10, timing: 'BattleStart', 
        description: '相手の場にあるカードを1枚選び、捨て札に送る。', 
        effectType: 'totsuka_destroy_field' 
    },

    // ニライカナイ
    { 
        id: 'br-niraikanai-1', name: '理想郷の守護', regaliaId: 'regalia-niraikanai', 
        cost: 6, timing: 'OnDamage', 
        description: '受けるダメージを-8軽減する。', 
        effectType: 'nirai_reduce_dmg' 
    },
    { 
        id: 'br-niraikanai-2', name: '楽園の光', regaliaId: 'regalia-niraikanai', 
        cost: 12, timing: 'BattleStart', 
        description: '[攻撃]+X。Xは自分の場のカード数に等しい。', 
        effectType: 'nirai_field_atk' 
    },

    // クトネシリカ
    { 
        id: 'br-kutone-1', name: '英雄の血脈', regaliaId: 'regalia-kutoneshirika', 
        cost: 4, timing: 'BattleEnd', 
        description: '人器の血継(Act)を+1する。', 
        effectType: 'kutone_add_act' 
    },
    { 
        id: 'br-kutone-2', name: '神威', regaliaId: 'regalia-kutoneshirika', 
        cost: 6, timing: 'BattleStart', 
        description: '[攻撃]+6。', 
        effectType: 'kutone_atk_6' 
    },

    // アポイタカラ
    { 
        id: 'br-apoi-1', name: 'あなたの為に', regaliaId: 'regalia-apoitakara', 
        cost: 8, timing: 'Main', 
        description: 'デッキからカードを2枚引く。', 
        effectType: 'apoi_draw_2' 
    },
    { 
        id: 'br-apoi-2', name: '秘宝の輝き', regaliaId: 'regalia-apoitakara', 
        cost: 12, timing: 'Main', 
        description: '[攻撃]+8をこのゲーム中継続する。', 
        effectType: 'apoi_perm_atk' 
    },

    // ウスガネヨロイ
    { 
        id: 'br-usugane-1', name: '棘の鎧', regaliaId: 'regalia-usuganeyoroi', 
        cost: 8, timing: 'BattleEnd', 
        description: '【継続】各バトルフェイズ終了時に相手に2ダメージ与える。', 
        effectType: 'usugane_persistent_dmg' 
    },
    { 
        id: 'br-usugane-2', name: '決死の覚悟', regaliaId: 'regalia-usuganeyoroi', 
        cost: 10, timing: 'BattleStart', 
        description: 'あなたのライフが1になるようにライフエリアからゲーム外に「ブラッドカード」を送る。その後[攻撃]+Xを得る(Xは送った枚数)。', 
        effectType: 'usugane_life_to_atk' 
    },

    // オボツカグラ
    { 
        id: 'br-obotsu-1', name: '神楽舞', regaliaId: 'regalia-obotsukagura', 
        cost: 5, timing: 'Main', 
        description: '即座に人器を覚醒させる。すでに覚醒していた場合、デッキからカードを1枚引く。', 
        effectType: 'obotsu_force_awaken' 
    },
    { 
        id: 'br-obotsu-2', name: '天地の共鳴', regaliaId: 'regalia-obotsukagura', 
        cost: 6, timing: 'BattleStart', 
        description: '[攻撃]＋Ｘ。Ｘはあなたの場にある[オボツの欠片]の数×2に等しい。', 
        effectType: 'obotsu_fragment_burst' 
    }
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
                description: '【共通】場に置かれた時、1ドロー。\n【固有】ゲーム外から「赤緋血」を1枚手札に加える。' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 3, cost: 4, level: 0, // 固有で攻撃+3
                description: '【共通】場に置かれた時、1ドロー。\n【固有】[攻撃]+3' 
            },
            { 
                name: '廃滅の緋', type: CardType.Recall, attack: 0, cost: 4, level: 0, 
                description: '【共通】場に置かれた時、1ドロー。\n【固有】ゲーム外から「斬撃一閃」を1枚手札に加える。' 
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
                description: '【共通】[攻撃]+1\n【固有】ゲーム外から「絶技【斬閃】」を1枚手札に加える。' 
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
                description: '【共通】場に残る。\n【固有】あなたのターン開始時、手札にあるアーツカードを1枚選ぶ。選んだアーツカードを【追憶強化】する。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。\n【固有】あなたのターン開始時、デッキの上から2枚見る。その中の好きな枚数を血廻に送り、残りを好きな順番でデッキの上に戻す。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。\n【固有】契告書エリアから赤緋血を1枚手札に加える。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。\n【固有】あなたのターン開始時、契告書エリアから「ブラッドカード」を3枚、ブラッドプールに加える。' 
            },
            { 
                name: '天球の蒼', type: CardType.Recall, attack: 0, cost: 5, level: 0, 
                description: '【共通】場に残る。\n【固有】あなたのターン開始時、契告書エリアから斬撃一閃を1枚手札に加える。「ブラッドカード」を1枚、ブラッドプールに加える。' 
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
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆ゲーム外から「斬撃」2枚を手札へ。' 
            },
            { 
                name: '超克の桜', type: CardType.Recall, attack: 0, cost: 7, level: 0, 
                description: '【共通】凱旋効果あり。場に出た時: 1ドロー＆ゲーム外から「斬撃一閃」1枚を手札へ。' 
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
                description: '【共通】ラムダを召喚。\n【固有】手札のLv1血アーツを【追憶強化】する。' 
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