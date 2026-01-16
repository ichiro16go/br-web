import { GameState, Card, PlayerState } from '../../types';
import { createMasterySlashFlash, createStarterBlood, createObotsuFragment } from '../../constants/index';
import { drawCard, recalculateAttackTotal } from '../gameLogic';
import { getUpgradedCard } from '../cardEffects';
import { shuffle } from '../../utils/common';
import { handleCleanup, handleProcessNextTurnStartEffect } from '../gameActions';

/**
 * Resolves the user's choice from a modal interaction.
 */
export const resolvePendingAction = (state: GameState, player: PlayerState, payload: any): GameState => {
    const pending = state.pendingResolution;
    if (!pending) return state;

    // --- 各種PendingResolutionごとの処理 ---
    if (pending.type === 'APOITAKARA_SELECTION') {
            const selectedIndex = payload.selectedIndex as number;
            if (selectedIndex !== -1) {
                const cards = pending.cards;
                const kept = cards[selectedIndex];
                const discarded = cards.filter((_, i) => i !== selectedIndex);
                player.hand.push(kept);
                player.discard.push(...discarded);
                state.log.push(`${player.name}はアポイタカラの効果で「${kept.name}」を手札に加え、残りを捨てた。`);
            } else {
                player.discard.push(...pending.cards);
                state.log.push(`${player.name}は選択をスキップし、カードを全て捨てた。`);
            }
    } 
    else if (pending.type === 'SHIRAGANE_HAND_SELECT') {
        const ids = payload.selectedIds as string[]; 
        const targetCards: Card[] = [];
        const remainingHand: Card[] = [];
        for (const c of player.hand) {
            if (ids.includes(c.id)) targetCards.push(c);
            else remainingHand.push(c);
        }
        player.hand = remainingHand;
        for (const target of targetCards) {
            const upgraded = getUpgradedCard(target);
            if (upgraded) {
                player.bloodCircuit.push(target);
                player.hand.push(upgraded);
                state.log.push(`${player.name}はシラガネの効果で${target.name}を${upgraded.name}に強化した。`);
            } else {
                player.hand.push(target);
            }
        }
    }
    else if (pending.type === 'OBOTSU_BASE_CHOICE') {
            if (payload.choice === 'fragment') {
                player.hand.push(createObotsuFragment());
                state.log.push(`${player.name}はオボツカグラの効果で「オボツの欠片」を得た。`);
            } else {
                player.hand.push(createStarterBlood());
                player.hand.push(createStarterBlood());
                state.log.push(`${player.name}はオボツカグラの効果で「赤血」2枚を得た。`);
            }
    }
    else if (pending.type === 'OBOTSU_AWAKENED_HAND_SELECT') {
            const ids = payload.selectedIds as string[];
            const toCircuit: Card[] = [];
            const newHand: Card[] = [];
            for(const c of player.hand) {
                if (ids.includes(c.id)) { toCircuit.push(c); } else { newHand.push(c); }
            }
            player.hand = newHand;
            player.bloodCircuit.push(...toCircuit);
            if (toCircuit.length > 0) {
                const drawn = drawCard(player, toCircuit.length);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                state.log.push(`${player.name}は手札を${toCircuit.length}枚血廻へ送り、同数引いた。`);
            }
    }
    else if (pending.type === 'BLUE_SPHERE_UPGRADE') {
            const cardId = payload.cardId;
            if (cardId) {
                const cardIndex = player.hand.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                    const targetCard = player.hand[cardIndex];
                    const upgraded = getUpgradedCard(targetCard);
                    if (upgraded) {
                        player.hand.splice(cardIndex, 1);
                        player.bloodCircuit.push(targetCard);
                        player.hand.push(upgraded);
                        state.log.push(`[天球の蒼] ${player.name}は${targetCard.name}を${upgraded.name}に強化した。`);
                    }
                }
            }
            if (state.pendingTurnStartEffects) state.pendingTurnStartEffects.shift();
    }
    else if (pending.type === 'BLUE_SPHERE_DECK_CONTROL') {
        const cards = pending.cards;
        const toCircuitIdxs = payload.toCircuitIndices as number[];
        const orderIdxs = payload.orderIndices as number[];
        
        const toCircuit = cards.filter((_, i) => toCircuitIdxs.includes(i));
        const toDeck = orderIdxs.map(i => cards[i]); 

        player.bloodCircuit.push(...toCircuit);
        player.deck.push(...toDeck); 
        
        state.log.push(`[天球の蒼] ${toCircuit.length}枚を血廻へ、${toDeck.length}枚をデッキトップに戻した。`);
        
        if (state.pendingTurnStartEffects) state.pendingTurnStartEffects.shift();
    }
    // --- 機翼の藍 Actions ---
    else if (pending.type === 'INDIGO_HAND_TO_CIRCUIT') {
        const ids = payload.selectedIds as string[];
        const toCircuit: Card[] = [];
        const newHand: Card[] = [];
        for (const c of player.hand) {
            if (ids.includes(c.id)) toCircuit.push(c);
            else newHand.push(c);
        }
        player.hand = newHand;
        player.bloodCircuit.push(...toCircuit);
        state.log.push(`[機翼の藍] ${toCircuit.length}枚を手札から血廻へ送った。`);
    }
    else if (pending.type === 'INDIGO_DECK_STRATEGY') {
        const { actions, deckOrder } = payload as { actions: Record<number, 'upgrade' | 'discard' | 'deck'>, deckOrder: number[] };
        const cards = pending.cards;
        const toDeck: Card[] = [];
        
        deckOrder.forEach(idx => {
            toDeck.push(cards[idx]);
        });

        cards.forEach((card, idx) => {
            const actionType = actions[idx];
            if (actionType === 'upgrade') {
                const upgraded = getUpgradedCard(card);
                if (upgraded) {
                    player.bloodCircuit.push(card);
                    player.discard.push(upgraded);
                    state.log.push(`[機翼の藍] ${card.name}を強化して捨て札に送った。`);
                } else {
                    player.discard.push(card);
                }
            } else if (actionType === 'discard') {
                player.discard.push(card);
                state.log.push(`[機翼の藍] ${card.name}を捨て札に送った。`);
            }
        });

        player.deck.push(...toDeck);
        if (toDeck.length > 0) state.log.push(`[機翼の藍] ${toDeck.length}枚をデッキトップに戻した。`);
    }
    else if (pending.type === 'INDIGO_UPGRADE_BLOOD') {
            const ids = payload.selectedIds as string[];
            if(ids.length > 0) {
                const cardId = ids[0];
                const cardIndex = player.hand.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                    const targetCard = player.hand[cardIndex];
                    const upgraded = getUpgradedCard(targetCard);
                    if (upgraded) {
                        player.hand.splice(cardIndex, 1);
                        player.bloodCircuit.push(targetCard);
                        player.hand.push(upgraded);
                        state.log.push(`[機翼の藍] ${targetCard.name}を${upgraded.name}に強化した。`);
                    }
                }
            }
    }
    else if (pending.type === 'INDIGO_HAND_TO_CIRCUIT_DRAW') {
        const ids = payload.selectedIds as string[];
        if (ids.length > 0) {
            const toCircuit: Card[] = [];
            const newHand: Card[] = [];
            for (const c of player.hand) {
                if (ids.includes(c.id)) toCircuit.push(c);
                else newHand.push(c);
            }
            player.hand = newHand;
            player.bloodCircuit.push(...toCircuit);
            const drawn = drawCard(player, 1);
            player.deck = drawn.deck;
            player.hand = drawn.hand;
            player.discard = drawn.discard;
            state.log.push(`[機翼の藍] ${toCircuit.length}枚を血廻へ送り、1枚引いた。`);
        }
    }
    else if (pending.type === 'INDIGO_CIRCUIT_TO_HAND') {
        const index = payload.selectedIndex as number;
        if (index !== -1 && index < player.bloodCircuit.length) {
            const card = player.bloodCircuit[index];
            player.bloodCircuit.splice(index, 1);
            player.hand.push(card);
            const drawn = drawCard(player, 2);
            player.deck = drawn.deck;
            player.hand = drawn.hand;
            player.discard = drawn.discard;
            state.log.push(`[機翼の藍] 血廻から${card.name}を手札に加え、2枚引いた。`);
        }
    }
    // --- 葬送の黒 (Burial Black) Actions ---
    else if (pending.type === 'BURIAL_PAYMENT') {
        const { paid, amount } = payload as { paid: boolean, amount: number };
        const cardId = pending.cardId;
        const targetCard = player.field.find(c => c.id === cardId);

        if (paid) {
            if (player.bloodPool.length >= amount) {
                const payment = player.bloodPool.splice(0, amount);
                state.log.push(`[葬送の黒] ブラッドを${amount}払い、固有効果を発動！`);
                
                if (amount === 1) { 
                    const drawn = drawCard(player, 1);
                    player.deck = drawn.deck;
                    player.hand = drawn.hand;
                    player.discard = drawn.discard;
                    state.log.push(`[葬送の黒] 1枚引いた。`);
                } else if (amount === 5) {
                    player.hand.push(createMasterySlashFlash());
                    state.log.push(`[葬送の黒] ゲーム外から「絶技【斬閃】」を手札に加えた。`);
                } else if (amount === 6) {
                    delete state.pendingResolution; 
                    state.pendingResolution = { type: 'BURIAL_SEARCH_DECK', cards: [...player.deck] };
                    return state;
                } else if (amount === 7) { 
                    delete state.pendingResolution;
                    const marketTops = state.market.recallPiles.map(pile => pile.length > 0 ? pile[pile.length-1] : null).filter(c => c !== null) as Card[];
                    if (marketTops.length === 0) {
                        state.log.push(`[葬送の黒] 想起可能なカードがない。`);
                        return state;
                    }
                    state.pendingResolution = { type: 'BURIAL_FREE_RECALL', marketCards: marketTops };
                    return state;
                } else { 
                    if (targetCard) {
                        targetCard.attack += amount;
                        recalculateAttackTotal(player);
                        state.log.push(`[葬送の黒] 攻撃力が+${amount}された (計${targetCard.attack})。`);
                    }
                }
            } else {
                state.log.push(`[System] ブラッド不足のため効果失敗。`);
            }
        } else {
            state.log.push(`[葬送の黒] 追加コストを支払わなかった。`);
        }
    }
    else if (pending.type === 'BURIAL_SEARCH_DECK') {
        const selectedIndex = payload.selectedIndex as number;
        if (selectedIndex !== -1) {
            if (selectedIndex < player.deck.length) {
                const card = player.deck.splice(selectedIndex, 1)[0];
                player.deck = shuffle(player.deck); 
                player.deck.push(card); 
                state.log.push(`[葬送の黒] デッキを探し、${card.name}をデッキトップに固定した。`);
            }
        } else {
            state.log.push(`[葬送の黒] デッキ操作をキャンセルした。`);
        }
    }
    else if (pending.type === 'BURIAL_FREE_RECALL') {
        const selectedIndex = payload.selectedIndex as number;
        const targetCard = pending.marketCards[selectedIndex];
        
        if (targetCard) {
            const pileIndex = state.market.recallPiles.findIndex(pile => pile.length > 0 && pile[pile.length - 1].id === targetCard.id);
            if (pileIndex !== -1) {
                const pile = state.market.recallPiles[pileIndex];
                const card = pile.pop();
                if (card) {
                    player.field.push(card);
                    recalculateAttackTotal(player);
                    state.log.push(`[葬送の黒] ${card.name}をコストを支払わず想起した！`);
                    // Note: Ideally call resolveFieldEntryEffects here but omitting for simplicity as noted in original file
                    recalculateAttackTotal(player);
                }
            }
        } else {
            state.log.push(`[葬送の黒] 想起をキャンセルした。`);
        }
    }
    // --- 超克の桜 (Cherry Victory) Actions ---
    else if (pending.type === 'CHERRY_VICTORY_SELECT') {
        const selectedIds = payload.selectedIds as string[];
        
        if (selectedIds.length > 0) {
            const newField: Card[] = [];
            const cardsToProcess: Card[] = [];

            for (const c of player.field) {
                if (selectedIds.includes(c.id)) {
                    cardsToProcess.push(c);
                } else {
                    newField.push(c);
                }
            }
            player.field = newField; 

            for (const target of cardsToProcess) {
                const upgraded = getUpgradedCard(target);
                if (upgraded) {
                    player.bloodCircuit.push(target);
                    player.hand.push(upgraded);
                    state.log.push(`[超克の桜] 凱旋：${target.name}を${upgraded.name}に【追憶強化】した。`);
                } else {
                    player.field.push(target);
                }
            }
            recalculateAttackTotal(player);
        } else {
            state.log.push(`[超克の桜] 凱旋効果を使用しなかった。`);
        }
        
        delete state.pendingResolution;
        // 処理完了後クリーンナップへ（再帰呼び出し）
        return handleCleanup(state);
    }

    delete state.pendingResolution;
    
    // 次のターン開始時効果があれば処理（再帰呼び出し）
    if (state.pendingTurnStartEffects && state.pendingTurnStartEffects.length > 0) {
        return handleProcessNextTurnStartEffect(state);
    }
    
    return state;
};
