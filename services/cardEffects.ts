import { PlayerState, Card, CardType, PendingResolution } from '../types';
import { 
  createSlashFlash, createMasterySlashFlash, createRedScarletBlood, 
  createTorrentRedStarBlood, createStarterBlood, createObotsuFragment, createLambda 
} from '../constants/index';
import { drawCard } from './gameLogic';

/**
 * 追憶強化の変換ロジック
 * あるカードが強化されたとき、何に変化するかを定義する
 * @param card 強化元のカード
 * @returns 強化後のカード（存在しない場合はnull）
 */
export const getUpgradedCard = (card: Card): Card | null => {
    if (card.name === '斬撃') return createSlashFlash();
    if (card.name === '斬撃一閃') return createMasterySlashFlash();
    if (card.name === '赤血') return createRedScarletBlood();
    if (card.name === '赤緋血') return createTorrentRedStarBlood();
    return null;
};

/**
 * 追憶強化を実行する関数
 * 手札にある対象カードを探し、血廻へ送って強化後カードを手札に加える
 * @param player 対象プレイヤー
 * @param log ゲームログ
 * @param filter 強化対象を絞り込むフィルタ関数（省略時は全アーツ対象）
 * @param count 実行回数
 */
export const executeRemembranceEnhancement = (player: PlayerState, log: string[], filter?: (c: Card) => boolean, count: number = 1): void => {
    for (let k = 0; k < count; k++) {
        // 強化可能かつフィルタ条件を満たすカードを探す
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
            // 基本的にgetUpgradedCardがnullなら候補に入らないはずだが念のため
            log.push(`${player.name}の${targetCard.name}はこれ以上強化できない。`);
        }
    }
};

/**
 * カードが場に出た時の効果解決を行う関数
 * 即時効果はここで適用し、ユーザー選択が必要な効果はPendingResolutionを返す
 * @param player 対象プレイヤー
 * @param card プレイされたカード
 * @param log ゲームログ
 * @param fromHand 手札からプレイされたかどうか
 * @returns ユーザー選択が必要な場合はPendingResolutionオブジェクト、完了した場合はnull
 */
export const resolveFieldEntryEffects = (player: PlayerState, card: Card, log: string[], fromHand: boolean = false): PendingResolution | null => {
    // ターン開始時効果や永続効果を持つカードはここでは発動しない
    if (['天球の蒼', '自律人器群【ラムダ】', 'オボツの欠片'].includes(card.name)) return null;

    // 雷霆の灰 (Gray): 手札からプレイされた時のみ固有効果が発動する
    if (card.name.includes('雷霆の灰') && !fromHand) {
        log.push(`[System] ${card.name}は手札から置かれていないため、固有効果は発動しない。`);
        return null;
    }

    // --- 即時解決系エフェクト ---

    // ドロー効果
    if (card.description.includes('ドロー') || card.description.includes('Draw')) {
         // 機翼の藍、葬送の黒(コスト条件)のドローはここでは処理しない
         if (!card.name.includes('機翼の藍') && !card.name.includes('葬送の黒')) {
             const drawCount = (card.description.includes('計2枚') || card.description.includes('2ドロー') || card.description.includes('2枚引く')) ? 2 : 1;
             const drawn = drawCard(player, drawCount);
             player.deck = drawn.deck;
             player.hand = drawn.hand;
             player.discard = drawn.discard;
             log.push(`${player.name}は${drawCount}枚引いた。`);
         }
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
    if (card.description.includes('手札に加える') && !card.name.includes('機翼の藍') && !card.name.includes('葬送の黒')) {
        if (card.description.includes('赤緋血')) player.hand.push(createRedScarletBlood());
        else if (card.description.includes('斬撃一閃')) player.hand.push(createSlashFlash());
        else if (card.description.includes('絶技【斬閃】')) player.hand.push(createMasterySlashFlash());
        else if (card.description.includes('オボツの欠片')) player.hand.push(createObotsuFragment());
    }

    // 追憶強化 (雷霆の灰など、即時実行可能な単純なもの)
    if (card.description.includes('【追憶強化】') && !card.name.includes('機翼の藍')) {
        let filter: ((c: Card) => boolean) | undefined = undefined;
        if (card.description.includes('Lv1アーツ')) {
            filter = (c) => c.level === 1;
        } else if (card.description.includes('Lv1血アーツ')) {
            filter = (c) => c.level === 1 && c.type === CardType.Blood;
        }
        executeRemembranceEnhancement(player, log, filter);
    }
    
    // --- 機翼の藍 (Indigo Wing) ---
    if (card.name.includes('機翼の藍')) {
        const lambda = createLambda();
        player.field.push(lambda);
        player.attackTotal += lambda.attack; // 攻撃力即時反映（Recalculate前だが表示用に）
        log.push(`${player.name} は「自律人器群【ラムダ】」を召喚した (+${lambda.attack} ATK)`);
        
        const desc = card.description;
        if (player.isHuman) {
            if (desc.includes('手札を任意枚数血廻へ送る')) {
                // 手札が0枚ならスキップ
                if (player.hand.length === 0) {
                    log.push(`[機翼の藍] 手札がないため、血廻への送付をスキップした。`);
                    return null;
                }
                return { type: 'INDIGO_HAND_TO_CIRCUIT' };
            }
            if (desc.includes('デッキ上2枚を見て')) {
                 if (player.deck.length === 0) {
                     log.push(`[機翼の藍] デッキがないため効果をスキップした。`);
                     return null;
                 }
                 const deckTop2 = player.deck.splice(-2);
                 return { type: 'INDIGO_DECK_STRATEGY', cards: deckTop2 };
            }
            if (desc.includes('Lv1血アーツを【追憶強化】')) {
                // 手札に対象があるか確認
                const hasTarget = player.hand.some(c => c.type === CardType.Blood && c.level === 1 && getUpgradedCard(c) !== null);
                if (!hasTarget) {
                    log.push(`[機翼の藍] 手札に対象となるLv1血アーツがないためスキップした。`);
                    return null;
                }
                return { type: 'INDIGO_UPGRADE_BLOOD' };
            }
            if (desc.includes('手札2枚まで血廻へ送る')) {
                if (player.hand.length === 0) {
                    log.push(`[機翼の藍] 手札がないため効果をスキップした。`);
                    return null;
                }
                return { type: 'INDIGO_HAND_TO_CIRCUIT_DRAW' };
            }
            if (desc.includes('血廻にあるカードを1枚選び手札に加えてもよい')) {
                if (player.bloodCircuit.length === 0) {
                    log.push(`[機翼の藍] 血廻にカードがないため効果をスキップした。`);
                    return null;
                }
                return { type: 'INDIGO_CIRCUIT_TO_HAND' };
            }
        }
    }

    // --- 葬送の黒 (Burial Black) ---
    if (card.name.includes('葬送の黒')) {
        const desc = card.description;
        let costAmount = 0;
        let costType: 'fixed' | 'variable' = 'fixed';

        if (desc.includes('1血払う')) costAmount = 1;
        else if (desc.includes('5血払う')) costAmount = 5;
        else if (desc.includes('6血払う')) costAmount = 6;
        else if (desc.includes('7血払う')) costAmount = 7;
        else if (desc.includes('X血払う')) {
            costAmount = 0;
            costType = 'variable';
        }

        if (player.isHuman) {
            // 6血: デッキ探索 -> デッキが空ならスキップ
            if (costAmount === 6 && player.deck.length === 0) {
                log.push(`[葬送の黒] デッキが空のため効果を発動できない。`);
                return null;
            }
            // 7血: 無料想起 -> マーケットチェックは次のステップで
            
            return { type: 'BURIAL_PAYMENT', cardId: card.id, costType, costAmount };
        }
    }

    return null;
};

/**
 * ターン開始時の効果をまとめて解決する関数
 * 天球の蒼やラムダ、オボツの欠片の効果を処理する
 * @param player 対象プレイヤー
 * @param log ゲームログ
 * @returns ユーザー選択が必要な効果を持つカードの配列
 */
export const resolveStartOfTurnEffects = (player: PlayerState, log: string[]): Card[] => {
    const pendingCards: Card[] = [];

    // 1. 天球の蒼の効果
    const blueSpheres = player.field.filter(c => c.name === '天球の蒼');
    for (const card of blueSpheres) {
        const desc = card.description.replace(/\n/g, '');

        if (desc.includes('手札にあるアーツカードを1枚選ぶ')) {
            pendingCards.push(card);
        }
        else if (desc.includes('デッキの上から2枚見る')) {
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
