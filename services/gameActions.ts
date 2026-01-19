
import { GameState, Card, CardType, PlayerState, Phase } from '../types';
import { 
  createStarterBlood, createSlashFlash, createMasterySlashFlash, 
  CRAFT_RECIPES 
} from '../constants/index';
import { 
  drawCard, recalculateAttackTotal, getRegaliaStats, checkAwakening, performCleanup 
} from './gameLogic';
import { 
  resolveFieldEntryEffects, getUpgradedCard, executeRemembranceEnhancement, resolveStartOfTurnEffects 
} from './cardEffects';
import { applyBloodRecallEffect } from './logic/bloodRecallLogic';
import { applySelfHarmEffect } from './logic/selfHarmLogic';
import { resolvePendingAction } from './logic/pendingResolutionLogic';

/**
 * 必殺技（ブラッドリコール）発動処理
 */
export const handleActivateBloodRecall = (state: GameState, playerId: string): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    const player = cloneState.players[playerKey];

    const recall = player.bloodRecall;
    if (!recall) return state;

    if (player.bloodCircuit.length < recall.cost) {
            cloneState.log.push(`[失敗] ${player.name}は必殺技コストが足りない (Circuit: ${player.bloodCircuit.length}/${recall.cost})。`);
            return state;
    }

    let paidCards: Card[] = player.bloodCircuit.splice(0, recall.cost);
    cloneState.log.push(`${player.name} は必殺技「${recall.name}」を発動！ (血廻消費: ${recall.cost})`);

    applyBloodRecallEffect(cloneState, player, paidCards);

    return cloneState;
};

/**
 * カードプレイ処理
 */
export const handlePlayCard = (state: GameState, playerId: string, cardId: string): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    const player = cloneState.players[playerKey];
    
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return state;

    const card = player.hand[cardIndex];
    if (card.type === CardType.Calamity) return state;

    player.hand.splice(cardIndex, 1);
    player.field.push(card);
    
    recalculateAttackTotal(player);
    if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;
    
    cloneState.log.push(`${player.name} は ${card.name} をプレイ (ATK: ${card.attack}).`);

    const pending = resolveFieldEntryEffects(player, card, cloneState.log, true);
    if (pending) {
        cloneState.pendingResolution = pending;
    }
    
    recalculateAttackTotal(player);
    if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;

    // 特定カードの追加ブラッド生成（ここもEffectsに移せるが単純なので維持）
    if (['赤血', '赤緋血', '奔流【緋星血】', '桜流し'].includes(card.name)) {
        let amount = 1;
        if (card.name === '赤緋血') amount = 3;
        if (card.name === '奔流【緋星血】') amount = 6;
        
        for(let i=0; i<amount; i++) {
            const bloodToken: Card = {
                id: `gen-blood-${Math.random().toString(36).substr(2, 9)}`,
                name: 'Blood',
                type: CardType.Blood,
                attack: 0,
                cost: 0,
                level: 0,
                description: 'Generated Blood'
            };
            player.bloodPool.push(bloodToken);
        }
        cloneState.log.push(`${player.name} はブラッドを得た (+${amount} Poolへ)`);
    }

    return cloneState;
};

/**
 * カードクラフト（強化）処理
 */
export const handleCraftCard = (state: GameState, playerId: string, recipeId: string, paymentCardIds: string[]): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    const player = cloneState.players[playerKey];
    
    if (player.remainingActions <= 0) return state;

    const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return state;

    const removedCards: Card[] = [];
    for (const pid of paymentCardIds) {
        const idx = player.hand.findIndex(c => c.id === pid);
        if (idx !== -1) {
            removedCards.push(player.hand[idx]);
            player.hand.splice(idx, 1);
        }
    }

    if (removedCards.length !== paymentCardIds.length) return state;

    player.bloodCircuit.push(...removedCards);
    const resultCard = recipe.createResult();
    player.hand.push(resultCard);
    player.remainingActions -= 1;

    cloneState.log.push(`${player.name} は ${recipe.name} を実行 (Act-1, 素材を血廻へ).`);
    return cloneState;
};

/**
 * 自傷（Self Harm）処理
 */
export const handleSelfHarm = (state: GameState, playerId: string): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    const player = cloneState.players[playerKey];
    
    if (!player.regalia || player.regalia.isTapped) return state;

    const stats = getRegaliaStats(player);
    if (!stats) return state;

    const damage = stats.selfHarmCost;
    if (player.lifeCards.length < damage) return state;

    if (player.activeBuffs.hihiirokaneConvert) {
        for(let i=0; i<damage; i++) player.bloodPool.push(createStarterBlood());
            cloneState.log.push(`${player.name}はヒヒイロカネの効果で自傷の代わりにブラッドを得た！`);
    } else {
        const lostLife = player.lifeCards.splice(0, damage);
        player.bloodPool.push(...lostLife);
        player.life -= damage;
        cloneState.log.push(`${player.name}はライフを${damage}支払い、神器を起動した。`);
    }

    player.regalia.isTapped = true;
    const isAwakened = player.isRegaliaAwakened;

    applySelfHarmEffect(cloneState, player, isAwakened);

    checkAwakening(player, cloneState.log);
    return cloneState;
};

/**
 * リコール（カード購入）処理
 */
export const handleRecallCard = (state: GameState, playerId: string, pileIndex: number): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    const player = cloneState.players[playerKey];

    if (player.remainingActions <= 0) return state;

    const pile = cloneState.market.recallPiles[pileIndex];
    if (!pile || pile.length === 0) return state;

    const marketCard = pile[pile.length - 1];
    if (player.bloodPool.length < marketCard.cost) return state; 
    
    player.bloodPool.splice(0, marketCard.cost);
    pile.pop();
    
    // 「無間の紫」の特殊処理: 購入時、場ではなく相手のデッキトップへ行く
    if (marketCard.name.includes('無間の紫')) {
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const opponent = cloneState.players[opponentKey];
        opponent.deck.push(marketCard);
        
        recalculateAttackTotal(player); // 念のため再計算（変更なし）
        if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;

        cloneState.log.push(`${player.name} は ${marketCard.name} を購入 (Cost: ${marketCard.cost}, Act-1)。効果により相手のデッキトップへ送られた。`);
    } else {
        player.field.push(marketCard); 
        recalculateAttackTotal(player);
        if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;
        
        const pending = resolveFieldEntryEffects(player, marketCard, cloneState.log, false);
        if (pending) {
            cloneState.pendingResolution = pending;
        }
        
        recalculateAttackTotal(player);
        if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;

        cloneState.log.push(`${player.name} は ${marketCard.name} を購入 (Cost: ${marketCard.cost}, Act-1).`);
    }

    player.remainingActions -= 1;
    return cloneState;
};

/**
 * ターンパス処理
 */
export const handlePassTurn = (state: GameState, playerId: string): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
    cloneState.players[playerKey].hasPassed = true;
    cloneState.log.push(`${cloneState.players[playerKey].name} はパスした.`);

    const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
    // 両者パスなら戦闘解決へ
    if (cloneState.players[opponentKey].hasPassed) {
         return cloneState; 
    } else {
        cloneState.turnPlayerId = cloneState.players[opponentKey].id;
    }
    return cloneState;
};

/**
 * 戦闘解決処理
 */
export const handleResolveBattle = (state: GameState): GameState => {
    const cloneState = structuredClone(state) as GameState;
    cloneState.phase = Phase.BloodBattle;
    const p1 = cloneState.players.player;
    const p2 = cloneState.players.cpu;

    // ブラッドプールリセット (攻撃力計算前に空にする)
    p1.bloodPool = [];
    p2.bloodPool = [];

    recalculateAttackTotal(p1);
    if (p1.activeBuffs.permanentAtk) p1.attackTotal += p1.activeBuffs.permanentAtk;
    recalculateAttackTotal(p2);
    if (p2.activeBuffs.permanentAtk) p2.attackTotal += p2.activeBuffs.permanentAtk;

    cloneState.log.push(`--- ブラッドバトル ---`);
    cloneState.log.push(`${p1.name} ATK: ${p1.attackTotal} vs ${p2.name} ATK: ${p2.attackTotal}`);

    let winner: PlayerState | null = null;
    let loser: PlayerState | null = null;
    let damage = 0;

    if (p1.attackTotal > p2.attackTotal) {
        winner = p1;
        loser = p2;
        damage = p1.attackTotal - p2.attackTotal;
    } else if (p2.attackTotal > p1.attackTotal) {
        winner = p2;
        loser = p1;
        damage = p2.attackTotal - p1.attackTotal;
    }

    // BattleResultをセット（演出用）
    cloneState.lastBattleResult = {
        winnerId: winner ? winner.id : null,
        damage: 0, // 軽減前/後どちらを表示するかだが、ここでは実ダメージ（軽減前）を計算ベースにするか、軽減後を表示するか
        p1Atk: p1.attackTotal,
        p2Atk: p2.attackTotal
    };

    if (winner && loser) {
        // ダメージ軽減処理
        let actualDamage = damage;
        if (loser.activeBuffs.damageReduction && loser.activeBuffs.damageReduction > 0) {
            const originalDamage = damage;
            actualDamage = Math.max(0, damage - loser.activeBuffs.damageReduction);
            cloneState.log.push(`${loser.name}はダメージを軽減した (${originalDamage} -> ${actualDamage})`);
            loser.activeBuffs.damageReduction = 0;
        }

        // BattleResultのダメージを更新
        cloneState.lastBattleResult.damage = actualDamage;

        const damageToTake = Math.min(actualDamage, loser.lifeCards.length);
        
        if (damageToTake > 0) {
            cloneState.log.push(`${winner.name} の勝利! ${actualDamage} ダメージを与える.`);
            const damagedCards = loser.lifeCards.splice(0, damageToTake);
            loser.bloodPool.push(...damagedCards);
            loser.life -= damageToTake;
            checkAwakening(loser, cloneState.log);

            if (loser.life <= 0) {
                 cloneState.phase = Phase.GameOver;
                 return cloneState;
            }

            // --- 超克の桜【凱旋】チェック ---
            const hasCherry = winner.field.some(c => c.name.includes('超克の桜'));
            if (hasCherry) {
                const slashInField = winner.field.filter(c => c.type === CardType.Slash);
                if (slashInField.length > 0) {
                    if (winner.isHuman) {
                        cloneState.firstPlayerId = winner.id; 
                        cloneState.pendingResolution = { type: 'CHERRY_VICTORY_SELECT' };
                        // pendingResolutionがある場合でも、一旦stateを返して演出を挟む。
                        // UI側で演出終了後にpendingResolutionを処理するフローが必要。
                    } else {
                        // CPUの凱旋自動処理
                        const targets = slashInField.sort((a, b) => a.level - b.level).slice(0, 2);
                        const newField: Card[] = [];
                        const cardsToProcess: Card[] = [];
                        
                        for (const c of winner.field) {
                            if (targets.some(t => t.id === c.id)) cardsToProcess.push(c);
                            else newField.push(c);
                        }
                        winner.field = newField;

                        for (const target of cardsToProcess) {
                            const upgraded = getUpgradedCard(target);
                            if (upgraded) {
                                winner.bloodCircuit.push(target);
                                winner.hand.push(upgraded);
                                cloneState.log.push(`(CPU)超克の桜 凱旋：${target.name}を強化した。`);
                            } else {
                                winner.field.push(target);
                            }
                        }
                        recalculateAttackTotal(winner);
                    }
                }
            }
        } else {
            cloneState.log.push(`${winner.name} の勝利! しかしダメージは0だった。`);
        }
        cloneState.firstPlayerId = winner.id;

    } else {
        cloneState.log.push(`引き分け！ダメージなし.`);
    }

    if (cloneState.players.player.life <= 0 || cloneState.players.cpu.life <= 0) {
            cloneState.phase = Phase.GameOver;
            return cloneState;
    }

    // 即座にCLEANUPに遷移せず、演出表示のためにBLOOD_BATTLEフェイズのまま返す
    return cloneState;
};

/**
 * クリーンナップ処理
 */
export const handleCleanup = (state: GameState): GameState => {
    const cloneState = structuredClone(state) as GameState;
    cloneState.phase = Phase.Cleanup;
    
    // バトル結果演出をクリア
    delete cloneState.lastBattleResult;
    
    [cloneState.players.player, cloneState.players.cpu].forEach(p => {
        if (p.activeBuffs.usuganeBurn) {
            const opponentKey = p.id === 'p1' ? 'cpu' : 'player';
            const opponent = cloneState.players[opponentKey];
            if (opponent.life > 0) {
                    const burnDamage = Math.min(2, opponent.lifeCards.length);
                    const burned = opponent.lifeCards.splice(0, burnDamage);
                    opponent.bloodPool.push(...burned);
                    opponent.life -= burnDamage;
                    cloneState.log.push(`ウスガネヨロイの効果: ${opponent.name}に2ダメージ！`);
                    checkAwakening(opponent, cloneState.log);
            }
        }
        performCleanup(p, cloneState.log);
    });

    cloneState.phase = Phase.Main;
    cloneState.turnPlayerId = cloneState.firstPlayerId;
    cloneState.log.push(`--- ターン終了. 新しいラウンドの開始. 先攻: ${cloneState.firstPlayerId === 'p1' ? 'Player' : 'CPU'} ---`);

    const nextPlayerKey = cloneState.turnPlayerId === cloneState.players.player.id ? 'player' : 'cpu';
    const nextPlayer = cloneState.players[nextPlayerKey];
    
    const pendingEffects = resolveStartOfTurnEffects(nextPlayer, cloneState.log);
    if (pendingEffects.length > 0) {
        cloneState.pendingTurnStartEffects = pendingEffects;
    }

    return cloneState;
};

/**
 * ターン開始時効果の処理
 */
export const handleProcessNextTurnStartEffect = (state: GameState): GameState => {
    const cloneState = structuredClone(state) as GameState;
    if (!state.pendingTurnStartEffects || state.pendingTurnStartEffects.length === 0) {
            return state;
    }
    
    const currentPlayerKey = state.turnPlayerId === 'p1' ? 'player' : 'cpu';
    const currentPlayer = cloneState.players[currentPlayerKey];
    const card = state.pendingTurnStartEffects[0];
    const desc = card.description.replace(/\n/g, '');

    if (desc.includes('手札にあるアーツカードを1枚選ぶ')) {
            const upgradeable = currentPlayer.hand.filter(c => getUpgradedCard(c) !== null);
            if (upgradeable.length === 0) {
                cloneState.log.push(`[天球の蒼] 手札に強化可能なアーツがないためスキップした。`);
                cloneState.pendingTurnStartEffects.shift();
                return cloneState; 
            }

            if (state.turnPlayerId === 'p1') {
                cloneState.pendingResolution = { type: 'BLUE_SPHERE_UPGRADE' };
                return cloneState; 
            } else {
                executeRemembranceEnhancement(currentPlayer, cloneState.log);
                cloneState.pendingTurnStartEffects.shift();
                return cloneState;
            }
    }
    else if (desc.includes('デッキの上から2枚見る')) {
            if (currentPlayer.deck.length === 0) {
                cloneState.log.push(`[天球の蒼] デッキがないためスキップした。`);
                cloneState.pendingTurnStartEffects.shift();
                return cloneState;
            }

            if (state.turnPlayerId === 'p1') {
                const deckTop2 = currentPlayer.deck.splice(-2);
                cloneState.pendingResolution = { type: 'BLUE_SPHERE_DECK_CONTROL', cards: deckTop2 };
                return cloneState; 
            } else {
                cloneState.log.push(`[天球の蒼] CPUはデッキトップを確認した。`);
                cloneState.pendingTurnStartEffects.shift();
                return cloneState;
            }
    }
    
    if (cloneState.pendingTurnStartEffects.length > 0 && cloneState.pendingTurnStartEffects[0] === card) {
            cloneState.pendingTurnStartEffects.shift();
            return cloneState;
    }
    
    return cloneState;
};

/**
 * 保留中のユーザー選択解決処理
 */
export const handleResolvePendingAction = (state: GameState, payload: any): GameState => {
    const cloneState = structuredClone(state) as GameState;
    const player = cloneState.players.player;
    
    return resolvePendingAction(cloneState, player, payload);
};
