import { GameState, Card, CardType, PlayerState } from '../../types';
import { createMadness } from '../../constants/index';
import { drawCard, recalculateAttackTotal } from '../gameLogic';

/**
 * Applies the effect of a specific Blood Recall.
 */
export const applyBloodRecallEffect = (state: GameState, player: PlayerState, paidCards: Card[]): void => {
    const recall = player.bloodRecall;
    if (!recall) return;

    const playerKey = player.id === state.players.player.id ? 'player' : 'cpu';
    const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
    const opponent = state.players[opponentKey];

    switch (recall.effectType) {
        case 'shiragane_mill_circuit':
            const milled = player.deck.splice(0, 4);
            player.bloodCircuit.push(...milled);
            state.log.push(`デッキトップ4枚を血廻へ送った。`);
            break;
        case 'shiragane_deploy_slash':
            const slashInCircuit = player.bloodCircuit.filter(c => c.type === CardType.Slash);
            player.field.push(...slashInCircuit);
            player.bloodCircuit = player.bloodCircuit.filter(c => c.type !== CardType.Slash);
            recalculateAttackTotal(player);
            state.log.push(`血廻にあった斬撃アーツ${slashInCircuit.length}枚を全て場に出した！`);
            break;
        case 'hihi_convert_blood':
            player.activeBuffs.hihiirokaneConvert = true;
            state.log.push(`[継続] ヒヒイロカネの効果：自傷ダメージの代わりにゲーム外からブラッドを得る。`);
            break;
        case 'hihi_deploy_slash':
            const usedSlashes = paidCards.filter(c => c.type === CardType.Slash);
            player.field.push(...usedSlashes);
            recalculateAttackTotal(player);
            state.log.push(`コストとして払った斬撃アーツ${usedSlashes.length}枚を場に出した！`);
            break;
        case 'totsuka_madness_deck':
            opponent.deck.push(createMadness());
            opponent.deck.push(createMadness());
            state.log.push(`ゲーム外から「発狂」2枚を相手デッキトップへ送った。`);
            break;
        case 'totsuka_destroy_field':
            if (opponent.field.length > 0) {
                const removed = opponent.field.pop();
                if (removed) {
                    opponent.discard.push(removed);
                    recalculateAttackTotal(opponent);
                    state.log.push(`相手の${removed.name}を破壊した。`);
                }
            }
            break;
        case 'nirai_reduce_dmg':
            player.activeBuffs.damageReduction = (player.activeBuffs.damageReduction || 0) + 8;
            state.log.push(`次のダメージを-8軽減する。`);
            break;
        case 'nirai_field_atk':
            const fieldCount = player.field.length;
            player.attackTotal += fieldCount;
            state.log.push(`[攻撃]+${fieldCount} (場のカード数分)。`);
            break;
        case 'kutone_add_act':
            player.activeBuffs.kutonePactBonus = (player.activeBuffs.kutonePactBonus || 0) + 1;
            player.remainingActions += 1;
            state.log.push(`[継続] 血継(Act)+1。`);
            break;
        case 'kutone_atk_6':
            player.attackTotal += 6;
            state.log.push(`[攻撃]+6。`);
            break;
        case 'apoi_draw_2':
            const drawn = drawCard(player, 2);
            player.deck = drawn.deck;
            player.hand = drawn.hand;
            player.discard = drawn.discard;
            state.log.push(`2枚引いた。`);
            break;
        case 'apoi_perm_atk':
            player.activeBuffs.permanentAtk = (player.activeBuffs.permanentAtk || 0) + 8;
            player.attackTotal += 8;
            state.log.push(`[攻撃]+8 (永続)。`);
            break;
        case 'usugane_persistent_dmg':
            player.activeBuffs.usuganeBurn = true;
            state.log.push(`[継続] バトルフェイズ終了時に相手に2ダメージ。`);
            break;
        case 'usugane_life_to_atk':
            if (player.life > 1) {
                const lifeToSendCount = player.life - 1;
                const removedLifeCards = player.lifeCards.splice(0, lifeToSendCount);
                player.life = 1;
                player.attackTotal += lifeToSendCount;
                state.log.push(`ライフを1にし、減らした分(${lifeToSendCount})だけ攻撃力を得た！`);
            } else {
                state.log.push(`ライフが既に1のため効果なし。`);
            }
            break;
        case 'obotsu_force_awaken':
            if (!player.isRegaliaAwakened) {
                player.isRegaliaAwakened = true;
                state.log.push(`人器を強制覚醒させた！`);
            } else {
                const obotsuDrawn = drawCard(player, 1);
                player.deck = obotsuDrawn.deck;
                player.hand = obotsuDrawn.hand;
                player.discard = obotsuDrawn.discard;
                state.log.push(`既に覚醒しているため、1枚引いた。`);
            }
            break;
        case 'obotsu_fragment_burst':
            const fragmentCount = player.hand.filter(c => c.name === 'オボツの欠片').length 
                                + player.field.filter(c => c.name === 'オボツの欠片').length;
            const atkBoost = fragmentCount * 2;
            player.attackTotal += atkBoost;
            state.log.push(`[攻撃]+${atkBoost} (オボツの欠片x2)。`);
            break;
    }
};
