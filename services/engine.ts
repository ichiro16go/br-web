import { 
  GameState, ActionType, Phase, CardType, Card, PlayerState 
} from '../types';
import { 
  createStarterBlood, createUpgradedSlash, createSlashFlash, 
  createMasterySlashFlash, createMadness, createObotsuFragment, 
  CRAFT_RECIPES, createStarterSlash
} from '../constants/arts';
import { 
  drawCard, checkAwakening, resolveFieldEntryEffects, getRegaliaStats, executeRemembranceEnhancement, 
  recalculateAttackTotal, resolveStartOfTurnEffects, performCleanup
} from './gameLogic';
import { decideCpuAction } from './ai';

/**
 * ゲームステートを更新するメインリデューサー
 */
export const gameReducer = (state: GameState, action: ActionType): GameState => {
  const cloneState = structuredClone(state) as GameState;
  
  switch (action.type) {
    // ---------------------------------------------------------
    // 必殺技発動 (Blood Recall)
    // ---------------------------------------------------------
    case 'ACTIVATE_BLOOD_RECALL': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const opponent = cloneState.players[opponentKey];

        if (!player.isRegaliaAwakened) {
            cloneState.log.push(`[失敗] ${player.name}の神器はまだ覚醒していないため、必殺技は使えない。`);
            return state;
        }

        const recall = player.bloodRecall;
        if (!recall) return state;

        if (player.bloodCircuit.length < recall.cost) return state;

        // コスト支払い
        let paidCards: Card[] = [];
        if (recall.effectType === 'shiragane_revive') {
             const slashes = player.bloodCircuit.filter(c => c.type === CardType.Slash);
             const others = player.bloodCircuit.filter(c => c.type !== CardType.Slash);
             
             const cost = recall.cost;
             const fromSlashes = slashes.slice(0, cost);
             const remainingCost = cost - fromSlashes.length;
             const fromOthers = others.slice(0, remainingCost);
             
             paidCards = [...fromSlashes, ...fromOthers];
             const paidIds = new Set(paidCards.map(c => c.id));
             player.bloodCircuit = player.bloodCircuit.filter(c => !paidIds.has(c.id));
        } else {
             paidCards = player.bloodCircuit.splice(0, recall.cost);
        }

        cloneState.log.push(`${player.name} は必殺技「${recall.name}」を発動！ (血廻消費: ${recall.cost})`);

        // 効果適用
        switch (recall.effectType) {
            case 'shiragane_convert':
                player.activeBuffs.shiraganeConvert = true;
                cloneState.log.push(`[継続] シラガネの効果により自傷ダメージがプール追加に変換されます。`);
                break;
            case 'shiragane_revive':
                const revived = paidCards.filter(c => c.type === CardType.Slash);
                player.field.push(...revived);
                recalculateAttackTotal(player);
                cloneState.log.push(`血廻コストから斬撃カード${revived.length}枚が場に現れた！`);
                break;
            case 'hihi_madness':
                opponent.deck.push(createMadness());
                opponent.deck.push(createMadness());
                cloneState.log.push(`相手のデッキトップに発狂を2枚送り込んだ。`);
                break;
            case 'hihi_destroy':
                if (opponent.field.length > 0) {
                    const removed = opponent.field.pop();
                    if (removed) {
                        opponent.discard.push(removed);
                        recalculateAttackTotal(opponent);
                        cloneState.log.push(`相手の${removed.name}を破壊した。`);
                    }
                }
                break;
            case 'totsuka_mill':
                const milled = player.deck.splice(0, 4);
                player.bloodCircuit.push(...milled);
                cloneState.log.push(`デッキから4枚を血廻へ送った。`);
                break;
            case 'totsuka_atk':
                player.attackTotal += 10;
                cloneState.log.push(`[攻撃]+10`);
                break;
            case 'nirai_shield':
                player.activeBuffs.damageReduction = (player.activeBuffs.damageReduction || 0) + 8;
                cloneState.log.push(`次のダメージを-8軽減する盾を得た。`);
                break;
            case 'nirai_field_atk':
                const fieldCount = player.field.length;
                player.attackTotal += fieldCount;
                cloneState.log.push(`[攻撃]+${fieldCount} (場のカード数)`);
                break;
            case 'kutone_pact':
                player.activeBuffs.kutonePactBonus = (player.activeBuffs.kutonePactBonus || 0) + 1;
                player.remainingActions += 1;
                cloneState.log.push(`[継続] 血継(Act)が+1された。`);
                break;
            case 'kutone_atk':
                player.attackTotal += 10;
                cloneState.log.push(`[攻撃]+10`);
                break;
            case 'apoi_draw':
                const drawn = drawCard(player, 2);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`2枚引いた。`);
                break;
            case 'apoi_atk':
                player.attackTotal += 8;
                cloneState.log.push(`[攻撃]+8`);
                break;
            case 'usugane_burn':
                player.activeBuffs.usuganeBurn = true;
                cloneState.log.push(`[継続] クリーンナップフェイズに相手にダメージを与える呪いをかけた。`);
                break;
            case 'usugane_last_stand':
                const lifeToSend = player.lifeCards.splice(0, player.lifeCards.length - 1);
                player.life = 1;
                player.bloodCircuit.push(...lifeToSend);
                const boost = lifeToSend.length;
                player.attackTotal += boost;
                cloneState.log.push(`ライフを1にし、[攻撃]+${boost}を得た！`);
                break;
            case 'obotsu_awaken':
                player.isRegaliaAwakened = true;
                const obotsuDrawn = drawCard(player, 1);
                player.deck = obotsuDrawn.deck;
                player.hand = obotsuDrawn.hand;
                player.discard = obotsuDrawn.discard;
                cloneState.log.push(`即座に覚醒し、1枚引いた。`);
                break;
            case 'obotsu_fragment_atk':
                const fragmentCount = player.hand.filter(c => c.name === 'オボツの欠片').length 
                                    + player.field.filter(c => c.name === 'オボツの欠片').length;
                const atkBoost = fragmentCount * 2;
                player.attackTotal += atkBoost;
                cloneState.log.push(`[攻撃]+${atkBoost} (欠片x2)`);
                break;
        }
        return cloneState;
    }

    // ---------------------------------------------------------
    // カードプレイ
    // ---------------------------------------------------------
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
      
      // 攻撃力計算 (recalculateAttackTotalを使うことで整合性を保つ)
      recalculateAttackTotal(player);
      
      cloneState.log.push(`${player.name} は ${card.name} をプレイ (ATK: ${card.attack}).`);

      resolveFieldEntryEffects(player, card, cloneState.log);
      
      // ラムダ等が召喚された可能性があるため再計算
      recalculateAttackTotal(player);

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

    // ---------------------------------------------------------
    // カード強化 (Craft)
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 自傷アクション (Self Harm)
    // ---------------------------------------------------------
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

        if (player.activeBuffs.shiraganeConvert) {
             for(let i=0; i<damage; i++) player.bloodPool.push(createStarterBlood());
             cloneState.log.push(`${player.name}はシラガネの効果で自傷ダメージを無効化し、血を得た！`);
        } else {
            const lostLife = player.lifeCards.splice(0, damage);
            player.bloodPool.push(...lostLife);
            player.life -= damage;
        }

        player.regalia.isTapped = true;
        const isAwakened = player.isRegaliaAwakened;

        // 神器効果分岐
        switch (player.regalia.id) {
            case 'regalia-shiragane':
                executeRemembranceEnhancement(player, cloneState.log, (c) => c.name === '斬撃', isAwakened ? 2 : 1);
                break;
            case 'regalia-hihiirokane':
                const cardToAdd = isAwakened ? createMasterySlashFlash() : createSlashFlash();
                player.hand.push(cardToAdd);
                cloneState.log.push(`${player.name}はヒヒイロカネを使用: 『${cardToAdd.name}』を手に入れた。`);
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
                    player.bloodCircuit.push(createStarterSlash());
                    player.bloodCircuit.push(createStarterBlood());
                    cloneState.log.push(`${player.name}はニライカナイを使用: 契告書からアーツ2枚を血廻へ送った(簡易)。`);
                } else {
                    const milled = player.deck.splice(0, 2);
                    player.bloodCircuit.push(...milled); 
                    cloneState.log.push(`${player.name}はニライカナイを使用: 山札から${milled.length}枚を血廻へ送った。`);
                }
                break;
            case 'regalia-kutoneshirika':
                const bloodCount = isAwakened ? 3 : 1;
                for(let i=0; i<bloodCount; i++) player.bloodPool.push(createStarterBlood());
                cloneState.log.push(`${player.name}はクトネシリカを使用: プールに赤血を${bloodCount}枚追加した。`);
                break;
            case 'regalia-apoitakara':
                if (isAwakened) {
                    const drawn = drawCard(player, 3);
                    player.deck = drawn.deck;
                    const newCards = drawn.hand.slice(-3);
                    const kept = newCards[0];
                    const discarded = newCards.slice(1);
                    player.hand = [...drawn.hand.slice(0, -3), kept];
                    player.discard = [...drawn.discard, ...discarded];
                    cloneState.log.push(`${player.name}はアポイタカラを使用: 3枚見て1枚(${kept?.name})を手札に加え、残りを捨てた。`);
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
                cloneState.log.push(`${player.name}はウスガネヨロイを使用: 斬撃を${slashCount}枚手に入れた。`);
                break;
            case 'regalia-obotsukagura':
                player.hand.push(createObotsuFragment());
                cloneState.log.push(`${player.name}はオボツカグラを使用: 『オボツの欠片』を手に入れた。`);
                if (isAwakened) {
                     const toCircuit = player.hand.slice(0, 2);
                     if (toCircuit.length > 0) {
                         player.hand = player.hand.slice(2);
                         player.bloodCircuit.push(...toCircuit);
                         const drawn = drawCard(player, toCircuit.length);
                         player.deck = drawn.deck;
                         player.hand = drawn.hand;
                         player.discard = drawn.discard;
                         cloneState.log.push(`${player.name}は手札を${toCircuit.length}枚血廻へ送り、同数引いた。`);
                     }
                }
                player.isRegaliaAwakened = true;
                break;
            default:
                break;
        }

        checkAwakening(player, cloneState.log);
        return cloneState;
    }

    // ---------------------------------------------------------
    // カード購入 (Recall)
    // ---------------------------------------------------------
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
        
        resolveFieldEntryEffects(player, marketCard, cloneState.log);
        
        // 効果で何か召喚されたりした場合の再計算
        recalculateAttackTotal(player);

        player.remainingActions -= 1;
        cloneState.log.push(`${player.name} は ${marketCard.name} を購入 (Cost: ${marketCard.cost}, Act-1).`);
        return cloneState;
    }

    // ---------------------------------------------------------
    // ターンパス処理
    // ---------------------------------------------------------
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

    // ---------------------------------------------------------
    // 戦闘解決 (Blood Battle)
    // ---------------------------------------------------------
    case 'RESOLVE_BATTLE': {
        cloneState.phase = Phase.BloodBattle;
        const p1 = cloneState.players.player;
        const p2 = cloneState.players.cpu;

        // 念のため再計算
        recalculateAttackTotal(p1);
        recalculateAttackTotal(p2);

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

    // ---------------------------------------------------------
    // クリーンアップ
    // ---------------------------------------------------------
    case 'CLEANUP': {
        cloneState.phase = Phase.Cleanup;
        
        // 1. 各プレイヤーのクリーンアップ処理（ダメージ処理、リソースリセット、ドロー）
        [cloneState.players.player, cloneState.players.cpu].forEach(p => {
            // ウスガネの継続ダメージ処理
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
            
            // 共通クリーンナップ処理の呼び出し
            performCleanup(p, cloneState.log);
        });

        // 2. 次のフェーズ設定
        cloneState.phase = Phase.Main;
        cloneState.turnPlayerId = cloneState.firstPlayerId;
        cloneState.log.push(`--- ターン終了. 新しいラウンドの開始. 先攻: ${cloneState.firstPlayerId === 'p1' ? 'Player' : 'CPU'} ---`);

        // 3. ターン開始時効果（残留カードによる効果）
        const nextPlayerKey = cloneState.turnPlayerId === cloneState.players.player.id ? 'player' : 'cpu';
        const nextPlayer = cloneState.players[nextPlayerKey];
        
        resolveStartOfTurnEffects(nextPlayer, cloneState.log);

        return cloneState;
    }

    // ---------------------------------------------------------
    // CPUアクション実行
    // ---------------------------------------------------------
    case 'CPU_ACTION': {
        if (state.turnPlayerId !== state.players.cpu.id || state.phase !== Phase.Main) return state;
        
        const actionToTake = decideCpuAction(cloneState);
        return gameReducer(state, actionToTake);
    }

    default:
      return state;
  }
};