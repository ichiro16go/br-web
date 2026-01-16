import { 
  GameState, ActionType, Phase, CardType, Card, PlayerState 
} from '../types';
import { 
  createStarterBlood, createUpgradedSlash, createSlashFlash, 
  createMasterySlashFlash, createMadness, createObotsuFragment, 
  CRAFT_RECIPES, createStarterSlash, createRedScarletBlood,
  createTorrentRedStarBlood
} from '../constants/index';
import { 
  drawCard, checkAwakening, resolveFieldEntryEffects, getRegaliaStats, executeRemembranceEnhancement, 
  recalculateAttackTotal, resolveStartOfTurnEffects, performCleanup, getUpgradedCard
} from './gameLogic';
import { decideCpuAction } from './ai';

export const gameReducer = (state: GameState, action: ActionType): GameState => {
  const cloneState = structuredClone(state) as GameState;
  
  switch (action.type) {
    case 'ACTIVATE_BLOOD_RECALL': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const opponent = cloneState.players[opponentKey];

        const recall = player.bloodRecall;
        if (!recall) return state;

        if (player.bloodCircuit.length < recall.cost) {
             cloneState.log.push(`[失敗] ${player.name}は必殺技コストが足りない (Circuit: ${player.bloodCircuit.length}/${recall.cost})。`);
             return state;
        }

        let paidCards: Card[] = player.bloodCircuit.splice(0, recall.cost);
        cloneState.log.push(`${player.name} は必殺技「${recall.name}」を発動！ (血廻消費: ${recall.cost})`);

        switch (recall.effectType) {
            case 'shiragane_mill_circuit':
                const milled = player.deck.splice(0, 4);
                player.bloodCircuit.push(...milled);
                cloneState.log.push(`デッキトップ4枚を血廻へ送った。`);
                break;
            case 'shiragane_deploy_slash':
                const slashInCircuit = player.bloodCircuit.filter(c => c.type === CardType.Slash);
                player.field.push(...slashInCircuit);
                player.bloodCircuit = player.bloodCircuit.filter(c => c.type !== CardType.Slash);
                recalculateAttackTotal(player);
                cloneState.log.push(`血廻にあった斬撃アーツ${slashInCircuit.length}枚を全て場に出した！`);
                break;
            case 'hihi_convert_blood':
                player.activeBuffs.hihiirokaneConvert = true;
                cloneState.log.push(`[継続] ヒヒイロカネの効果：自傷ダメージの代わりにゲーム外からブラッドを得る。`);
                break;
            case 'hihi_deploy_slash':
                const usedSlashes = paidCards.filter(c => c.type === CardType.Slash);
                player.field.push(...usedSlashes);
                recalculateAttackTotal(player);
                cloneState.log.push(`コストとして払った斬撃アーツ${usedSlashes.length}枚を場に出した！`);
                break;
            case 'totsuka_madness_deck':
                opponent.deck.push(createMadness());
                opponent.deck.push(createMadness());
                cloneState.log.push(`ゲーム外から「発狂」2枚を相手デッキトップへ送った。`);
                break;
            case 'totsuka_destroy_field':
                if (opponent.field.length > 0) {
                    const removed = opponent.field.pop();
                    if (removed) {
                        opponent.discard.push(removed);
                        recalculateAttackTotal(opponent);
                        cloneState.log.push(`相手の${removed.name}を破壊した。`);
                    }
                }
                break;
            case 'nirai_reduce_dmg':
                player.activeBuffs.damageReduction = (player.activeBuffs.damageReduction || 0) + 8;
                cloneState.log.push(`次のダメージを-8軽減する。`);
                break;
            case 'nirai_field_atk':
                const fieldCount = player.field.length;
                player.attackTotal += fieldCount;
                cloneState.log.push(`[攻撃]+${fieldCount} (場のカード数分)。`);
                break;
            case 'kutone_add_act':
                player.activeBuffs.kutonePactBonus = (player.activeBuffs.kutonePactBonus || 0) + 1;
                player.remainingActions += 1;
                cloneState.log.push(`[継続] 血継(Act)+1。`);
                break;
            case 'kutone_atk_6':
                player.attackTotal += 6;
                cloneState.log.push(`[攻撃]+6。`);
                break;
            case 'apoi_draw_2':
                const drawn = drawCard(player, 2);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`2枚引いた。`);
                break;
            case 'apoi_perm_atk':
                player.activeBuffs.permanentAtk = (player.activeBuffs.permanentAtk || 0) + 8;
                player.attackTotal += 8;
                cloneState.log.push(`[攻撃]+8 (永続)。`);
                break;
            case 'usugane_persistent_dmg':
                player.activeBuffs.usuganeBurn = true;
                cloneState.log.push(`[継続] バトルフェイズ終了時に相手に2ダメージ。`);
                break;
            case 'usugane_life_to_atk':
                if (player.life > 1) {
                    const lifeToSendCount = player.life - 1;
                    const removedLifeCards = player.lifeCards.splice(0, lifeToSendCount);
                    player.life = 1;
                    player.attackTotal += lifeToSendCount;
                    cloneState.log.push(`ライフを1にし、減らした分(${lifeToSendCount})だけ攻撃力を得た！`);
                } else {
                    cloneState.log.push(`ライフが既に1のため効果なし。`);
                }
                break;
            case 'obotsu_force_awaken':
                if (!player.isRegaliaAwakened) {
                    player.isRegaliaAwakened = true;
                    cloneState.log.push(`人器を強制覚醒させた！`);
                } else {
                    const obotsuDrawn = drawCard(player, 1);
                    player.deck = obotsuDrawn.deck;
                    player.hand = obotsuDrawn.hand;
                    player.discard = obotsuDrawn.discard;
                    cloneState.log.push(`既に覚醒しているため、1枚引いた。`);
                }
                break;
            case 'obotsu_fragment_burst':
                const fragmentCount = player.hand.filter(c => c.name === 'オボツの欠片').length 
                                    + player.field.filter(c => c.name === 'オボツの欠片').length;
                const atkBoost = fragmentCount * 2;
                player.attackTotal += atkBoost;
                cloneState.log.push(`[攻撃]+${atkBoost} (オボツの欠片x2)。`);
                break;
        }
        return cloneState;
    }

    case 'PLAY_CARD': {
      const { playerId, cardId } = action;
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
    }

    case 'CRAFT_CARD': {
        const { playerId, recipeId, paymentCardIds } = action;
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
    }

    case 'SELF_HARM': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const player = cloneState.players[playerKey];
        const opponent = cloneState.players[opponentKey];
        
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

        switch (player.regalia.id) {
            case 'regalia-shiragane':
                if (playerKey === 'cpu') {
                    executeRemembranceEnhancement(player, cloneState.log, (c) => c.level === 1, isAwakened ? 2 : 1);
                } else {
                    cloneState.pendingResolution = { 
                        type: 'SHIRAGANE_HAND_SELECT', 
                        count: isAwakened ? 2 : 1 
                    };
                }
                break;
            case 'regalia-hihiirokane':
                const cardToAdd = isAwakened ? createMasterySlashFlash() : createSlashFlash();
                player.hand.push(cardToAdd);
                cloneState.log.push(`${player.name}はヒヒイロカネを使用: ゲーム外から『${cardToAdd.name}』を手に入れた。`);
                break;
            case 'regalia-totsukamatsurugi':
                if (isAwakened) {
                    opponent.deck.push(createMadness());
                    opponent.deck.push(createMadness());
                    cloneState.log.push(`${player.name}はトツカマヂチを使用: 相手のデッキトップに『発狂』を置いた。`);
                } else {
                    opponent.discard.push(createMadness());
                    cloneState.log.push(`${player.name}はトツカマヂチを使用: 相手の捨て札に『発狂』を置いた。`);
                }
                break;
            case 'regalia-niraikanai':
                if (isAwakened) {
                    const options = [createStarterSlash(), createStarterBlood()];
                    const c1 = options[Math.floor(Math.random() * options.length)];
                    const c2 = options[Math.floor(Math.random() * options.length)];
                    player.bloodCircuit.push(c1, c2);
                    cloneState.log.push(`${player.name}はニライカナイを使用: ゲーム外からアーツ2枚を血廻へ送った。`);
                } else {
                    const milled = player.deck.splice(0, 2);
                    player.bloodCircuit.push(...milled); 
                    cloneState.log.push(`${player.name}はニライカナイを使用: 山札から${milled.length}枚を血廻へ送った。`);
                }
                break;
            case 'regalia-kutoneshirika':
                const bloodCount = isAwakened ? 3 : 1;
                for(let i=0; i<bloodCount; i++) player.bloodPool.push(createStarterBlood());
                cloneState.log.push(`${player.name}はクトネシリカを使用: ゲーム外から赤血を${bloodCount}枚追加した。`);
                break;
            case 'regalia-apoitakara':
                if (isAwakened) {
                    if (playerKey === 'cpu') {
                        const drawn = drawCard(player, 3);
                        player.deck = drawn.deck;
                        const newCards = drawn.hand.slice(-3);
                        const kept = newCards[0]; 
                        const discarded = newCards.slice(1);
                        player.hand = [...drawn.hand.slice(0, -3), kept];
                        player.discard = [...drawn.discard, ...discarded];
                        cloneState.log.push(`(CPU)${player.name}はアポイタカラを使用: 3枚見て1枚を手札に加え、残りを捨てた。`);
                    } else {
                        const deckTop3 = player.deck.splice(-3);
                        cloneState.pendingResolution = { type: 'APOITAKARA_SELECTION', cards: deckTop3 };
                    }
                } else {
                    const drawn = drawCard(player, 1);
                    player.deck = drawn.deck;
                    player.hand = drawn.hand;
                    player.discard = drawn.discard;
                    cloneState.log.push(`${player.name}はアポイタカラを使用: 1枚引いた。`);
                }
                break;
            case 'regalia-usuganeyoroi':
                const slashCount = isAwakened ? 2 : 1;
                for(let i=0; i<slashCount; i++) player.hand.push(createStarterSlash());
                cloneState.log.push(`${player.name}はウスガネヨロイを使用: ゲーム外から斬撃を${slashCount}枚手に入れた。`);
                break;
            case 'regalia-obotsukagura':
                if (!isAwakened) {
                    if (playerKey === 'cpu') {
                        if (Math.random() > 0.5) {
                            player.hand.push(createObotsuFragment());
                            cloneState.log.push(`(CPU)オボツカグラ: 欠片を入手。`);
                        } else {
                            player.hand.push(createStarterBlood());
                            player.hand.push(createStarterBlood());
                            cloneState.log.push(`(CPU)オボツカグラ: 赤血x2を入手。`);
                        }
                    } else {
                        cloneState.pendingResolution = { type: 'OBOTSU_BASE_CHOICE' };
                    }
                } else {
                    if (playerKey === 'cpu') {
                         const toCircuit = player.hand.slice(0, 2);
                         if (toCircuit.length > 0) {
                             player.hand = player.hand.slice(2);
                             player.bloodCircuit.push(...toCircuit);
                             const drawn = drawCard(player, toCircuit.length);
                             player.deck = drawn.deck;
                             player.hand = drawn.hand;
                             player.discard = drawn.discard;
                             cloneState.log.push(`(CPU)オボツカグラ: 手札を${toCircuit.length}枚血廻へ送り、同数引いた。`);
                         }
                    } else {
                        cloneState.pendingResolution = { type: 'OBOTSU_AWAKENED_HAND_SELECT' };
                    }
                }
                break;
            default:
                break;
        }

        checkAwakening(player, cloneState.log);
        return cloneState;
    }

    case 'PROCESS_NEXT_TURN_START_EFFECT': {
        if (!state.pendingTurnStartEffects || state.pendingTurnStartEffects.length === 0) {
             return state;
        }
        
        const currentPlayerKey = state.turnPlayerId === 'p1' ? 'player' : 'cpu';
        const currentPlayer = cloneState.players[currentPlayerKey];
        const card = state.pendingTurnStartEffects[0];
        const desc = card.description.replace(/\n/g, '');

        if (desc.includes('手札にあるアーツカードを1枚選ぶ')) {
             if (state.turnPlayerId === 'p1') {
                 cloneState.pendingResolution = { type: 'BLUE_SPHERE_UPGRADE' };
             } else {
                 executeRemembranceEnhancement(currentPlayer, cloneState.log);
                 cloneState.pendingTurnStartEffects.shift();
                 return gameReducer(cloneState, { type: 'PROCESS_NEXT_TURN_START_EFFECT' });
             }
        }
        else if (desc.includes('デッキの上から2枚見る')) {
             if (state.turnPlayerId === 'p1') {
                 const deckTop2 = currentPlayer.deck.splice(-2);
                 cloneState.pendingResolution = { type: 'BLUE_SPHERE_DECK_CONTROL', cards: deckTop2 };
             } else {
                 cloneState.log.push(`[天球の蒼] CPUはデッキトップを確認した。`);
                 cloneState.pendingTurnStartEffects.shift();
                 return gameReducer(cloneState, { type: 'PROCESS_NEXT_TURN_START_EFFECT' });
             }
        }
        
        if (cloneState.pendingTurnStartEffects.length > 0 && cloneState.pendingTurnStartEffects[0] === card) {
             cloneState.pendingTurnStartEffects.shift();
             return gameReducer(cloneState, { type: 'PROCESS_NEXT_TURN_START_EFFECT' });
        }
        
        return cloneState;
    }

    case 'RESOLVE_PENDING_ACTION': {
        const { payload } = action;
        const player = cloneState.players.player;
        const pending = state.pendingResolution;

        if (!pending) return state;

        if (pending.type === 'APOITAKARA_SELECTION') {
             const selectedIndex = payload.selectedIndex as number;
             const cards = pending.cards;
             const kept = cards[selectedIndex];
             const discarded = cards.filter((_, i) => i !== selectedIndex);
             player.hand.push(kept);
             player.discard.push(...discarded);
             cloneState.log.push(`${player.name}はアポイタカラの効果で「${kept.name}」を手札に加え、残りを捨てた。`);
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
                    cloneState.log.push(`${player.name}はシラガネの効果で${target.name}を${upgraded.name}に強化した。`);
                } else {
                    player.hand.push(target);
                }
            }
        }
        else if (pending.type === 'OBOTSU_BASE_CHOICE') {
             if (payload.choice === 'fragment') {
                 player.hand.push(createObotsuFragment());
                 cloneState.log.push(`${player.name}はオボツカグラの効果で「オボツの欠片」を得た。`);
             } else {
                 player.hand.push(createStarterBlood());
                 player.hand.push(createStarterBlood());
                 cloneState.log.push(`${player.name}はオボツカグラの効果で「赤血」2枚を得た。`);
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
                 cloneState.log.push(`${player.name}は手札を${toCircuit.length}枚血廻へ送り、同数引いた。`);
             }
        }
        else if (pending.type === 'BLUE_SPHERE_UPGRADE') {
             const cardId = payload.cardId;
             const cardIndex = player.hand.findIndex(c => c.id === cardId);
             if (cardIndex !== -1) {
                 const targetCard = player.hand[cardIndex];
                 const upgraded = getUpgradedCard(targetCard);
                 if (upgraded) {
                     player.hand.splice(cardIndex, 1);
                     player.bloodCircuit.push(targetCard);
                     player.hand.push(upgraded);
                     cloneState.log.push(`[天球の蒼] ${player.name}は${targetCard.name}を${upgraded.name}に強化した。`);
                 }
             }
             if (cloneState.pendingTurnStartEffects) cloneState.pendingTurnStartEffects.shift();
        }
        else if (pending.type === 'BLUE_SPHERE_DECK_CONTROL') {
            const cards = pending.cards;
            const toCircuitIdxs = payload.toCircuitIndices as number[];
            const orderIdxs = payload.orderIndices as number[];
            
            const toCircuit = cards.filter((_, i) => toCircuitIdxs.includes(i));
            const toDeck = orderIdxs.map(i => cards[i]); 

            player.bloodCircuit.push(...toCircuit);
            player.deck.push(...toDeck); 
            
            cloneState.log.push(`[天球の蒼] ${toCircuit.length}枚を血廻へ、${toDeck.length}枚をデッキトップに戻した。`);
            
            if (cloneState.pendingTurnStartEffects) cloneState.pendingTurnStartEffects.shift();
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
            cloneState.log.push(`[機翼の藍] ${toCircuit.length}枚を手札から血廻へ送った。`);
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
                        cloneState.log.push(`[機翼の藍] ${card.name}を強化して捨て札に送った。`);
                    } else {
                        player.discard.push(card);
                    }
                } else if (actionType === 'discard') {
                    player.discard.push(card);
                    cloneState.log.push(`[機翼の藍] ${card.name}を捨て札に送った。`);
                }
            });

            player.deck.push(...toDeck);
            if (toDeck.length > 0) cloneState.log.push(`[機翼の藍] ${toDeck.length}枚をデッキトップに戻した。`);
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
                         cloneState.log.push(`[機翼の藍] ${targetCard.name}を${upgraded.name}に強化した。`);
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
                
                // 送ったら1ドロー
                const drawn = drawCard(player, 1);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`[機翼の藍] ${toCircuit.length}枚を血廻へ送り、1枚引いた。`);
            }
        }
        else if (pending.type === 'INDIGO_CIRCUIT_TO_HAND') {
            const index = payload.selectedIndex as number;
            if (index !== -1 && index < player.bloodCircuit.length) {
                const card = player.bloodCircuit[index];
                player.bloodCircuit.splice(index, 1);
                player.hand.push(card);
                
                // 加えたら2ドロー
                const drawn = drawCard(player, 2);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`[機翼の藍] 血廻から${card.name}を手札に加え、2枚引いた。`);
            }
        }

        delete cloneState.pendingResolution;
        
        if (cloneState.pendingTurnStartEffects && cloneState.pendingTurnStartEffects.length > 0) {
            return gameReducer(cloneState, { type: 'PROCESS_NEXT_TURN_START_EFFECT' });
        }
        
        return cloneState;
    }

    case 'RECALL_CARD': {
        const { playerId, pileIndex } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];

        if (player.remainingActions <= 0) return state;

        const pile = cloneState.market.recallPiles[pileIndex];
        if (!pile || pile.length === 0) return state;

        const marketCard = pile[pile.length - 1];
        if (player.bloodPool.length < marketCard.cost) return state; 
        
        const paid = player.bloodPool.splice(0, marketCard.cost);
        pile.pop();
        
        player.field.push(marketCard); 
        recalculateAttackTotal(player);
        if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;
        
        const pending = resolveFieldEntryEffects(player, marketCard, cloneState.log, false);
        if (pending) {
            cloneState.pendingResolution = pending;
        }
        
        recalculateAttackTotal(player);
        if (player.activeBuffs.permanentAtk) player.attackTotal += player.activeBuffs.permanentAtk;

        player.remainingActions -= 1;
        cloneState.log.push(`${player.name} は ${marketCard.name} を購入 (Cost: ${marketCard.cost}, Act-1).`);
        return cloneState;
    }

    case 'PASS_TURN': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        cloneState.players[playerKey].hasPassed = true;
        cloneState.log.push(`${cloneState.players[playerKey].name} はパスした.`);

        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        if (cloneState.players[opponentKey].hasPassed) {
             return gameReducer(cloneState, { type: 'RESOLVE_BATTLE' });
        } else {
            cloneState.turnPlayerId = cloneState.players[opponentKey].id;
        }
        return cloneState;
    }

    case 'RESOLVE_BATTLE': {
        cloneState.phase = Phase.BloodBattle;
        const p1 = cloneState.players.player;
        const p2 = cloneState.players.cpu;

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

        if (winner && loser) {
            if (loser.activeBuffs.damageReduction && loser.activeBuffs.damageReduction > 0) {
                const originalDamage = damage;
                damage = Math.max(0, damage - loser.activeBuffs.damageReduction);
                cloneState.log.push(`${loser.name}はダメージを軽減した (${originalDamage} -> ${damage})`);
                loser.activeBuffs.damageReduction = 0;
            }

            cloneState.log.push(`${winner.name} の勝利! ${damage} ダメージを与える.`);
            const actualDamage = Math.min(damage, loser.lifeCards.length);
            const damagedCards = loser.lifeCards.splice(0, actualDamage);
            loser.bloodPool.push(...damagedCards);
            loser.life -= actualDamage;
            cloneState.firstPlayerId = winner.id;
            
            checkAwakening(loser, cloneState.log);

        } else {
            cloneState.log.push(`引き分け！ダメージなし.`);
        }

        if (cloneState.players.player.life <= 0 || cloneState.players.cpu.life <= 0) {
             cloneState.phase = Phase.GameOver;
             return cloneState;
        }

        return gameReducer(cloneState, { type: 'CLEANUP' });
    }

    case 'CLEANUP': {
        cloneState.phase = Phase.Cleanup;
        
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
            return gameReducer(cloneState, { type: 'PROCESS_NEXT_TURN_START_EFFECT' });
        }

        return cloneState;
    }

    case 'CPU_ACTION': {
        if (state.turnPlayerId !== state.players.cpu.id || state.phase !== Phase.Main) return state;
        
        const actionToTake = decideCpuAction(cloneState);
        let debugMsg = `[CPU] Thinking: ${actionToTake.type}`;
        if (actionToTake.type === 'CRAFT_CARD') debugMsg += ` (Recipe: ${actionToTake.recipeId})`;
        if (actionToTake.type === 'RECALL_CARD') debugMsg += ` (Pile: ${actionToTake.pileIndex})`;
        if (actionToTake.type === 'PLAY_CARD') debugMsg += ` (Card: ${actionToTake.cardId})`;
        cloneState.log.push(debugMsg);

        const nextState = gameReducer(cloneState, actionToTake);

        const hasProgressed = nextState.log.length > cloneState.log.length || 
                              nextState.phase !== cloneState.phase ||
                              nextState.turnPlayerId !== cloneState.turnPlayerId;

        if (!hasProgressed) {
             const failureCount = (state.cpuFailureCount || 0) + 1;
             nextState.cpuFailureCount = failureCount;
             nextState.log.push(`[System] CPU Action Failed (Count: ${failureCount})`);

             if (failureCount >= 3) {
                 nextState.log.push(`[System] CPU Stuck. Forcing PASS.`);
                 return gameReducer(nextState, { type: 'PASS_TURN', playerId: state.players.cpu.id });
             }
             return nextState;
        } else {
             nextState.cpuFailureCount = 0;
             return nextState;
        }
    }

    default:
      return state;
  }
};
