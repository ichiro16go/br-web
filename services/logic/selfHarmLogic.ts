import { GameState, Card, PlayerState } from '../../types';
import { 
  createSlashFlash, createMasterySlashFlash, createMadness, 
  createStarterSlash, createStarterBlood, createObotsuFragment 
} from '../../constants/index';
import { drawCard } from '../gameLogic';
import { getUpgradedCard, executeRemembranceEnhancement } from '../cardEffects';

/**
 * Applies the specific effect of Regalia Self Harm.
 */
export const applySelfHarmEffect = (state: GameState, player: PlayerState, isAwakened: boolean): void => {
    if (!player.regalia) return;
    
    const playerKey = player.id === state.players.player.id ? 'player' : 'cpu';
    const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
    const opponent = state.players[opponentKey];

    switch (player.regalia.id) {
        case 'regalia-shiragane':
            const upgradeableCards = player.hand.filter(c => getUpgradedCard(c) !== null);
            if (upgradeableCards.length === 0) {
                state.log.push(`${player.name}はシラガネの効果を発動したが、手札に強化対象がなかった。`);
            } else {
                if (playerKey === 'cpu') {
                    executeRemembranceEnhancement(player, state.log, (c) => c.level === 1, isAwakened ? 2 : 1);
                } else {
                    state.pendingResolution = { 
                        type: 'SHIRAGANE_HAND_SELECT', 
                        count: isAwakened ? 2 : 1 
                    };
                }
            }
            break;
        case 'regalia-hihiirokane':
            const cardToAdd = isAwakened ? createMasterySlashFlash() : createSlashFlash();
            player.hand.push(cardToAdd);
            state.log.push(`${player.name}はヒヒイロカネを使用: ゲーム外から『${cardToAdd.name}』を手に入れた。`);
            break;
        case 'regalia-totsukamatsurugi':
            if (isAwakened) {
                opponent.deck.push(createMadness());
                opponent.deck.push(createMadness());
                state.log.push(`${player.name}はトツカマヂチを使用: 相手のデッキトップに『発狂』を置いた。`);
            } else {
                opponent.discard.push(createMadness());
                state.log.push(`${player.name}はトツカマヂチを使用: 相手の捨て札に『発狂』を置いた。`);
            }
            break;
        case 'regalia-niraikanai':
            if (isAwakened) {
                const options = [createStarterSlash(), createStarterBlood()];
                const c1 = options[Math.floor(Math.random() * options.length)];
                const c2 = options[Math.floor(Math.random() * options.length)];
                player.bloodCircuit.push(c1, c2);
                state.log.push(`${player.name}はニライカナイを使用: ゲーム外からアーツ2枚を血廻へ送った。`);
            } else {
                const milled = player.deck.splice(0, 2);
                player.bloodCircuit.push(...milled); 
                state.log.push(`${player.name}はニライカナイを使用: 山札から${milled.length}枚を血廻へ送った。`);
            }
            break;
        case 'regalia-kutoneshirika':
            const bloodCount = isAwakened ? 3 : 1;
            for(let i=0; i<bloodCount; i++) player.bloodPool.push(createStarterBlood());
            state.log.push(`${player.name}はクトネシリカを使用: ゲーム外から赤血を${bloodCount}枚追加した。`);
            break;
        case 'regalia-apoitakara':
            if (isAwakened) {
                if (player.deck.length === 0) {
                    state.log.push(`${player.name}はアポイタカラを使用したが、デッキが空だった。`);
                } else {
                    if (playerKey === 'cpu') {
                        const drawn = drawCard(player, 3);
                        player.deck = drawn.deck;
                        const newCards = drawn.hand.slice(-3);
                        const kept = newCards[0]; 
                        const discarded = newCards.slice(1);
                        player.hand = [...drawn.hand.slice(0, -3), kept];
                        player.discard = [...drawn.discard, ...discarded];
                        state.log.push(`(CPU)${player.name}はアポイタカラを使用: 3枚見て1枚を手札に加え、残りを捨てた。`);
                    } else {
                        const deckTop3 = player.deck.splice(-3);
                        state.pendingResolution = { type: 'APOITAKARA_SELECTION', cards: deckTop3 };
                    }
                }
            } else {
                const drawn = drawCard(player, 1);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                state.log.push(`${player.name}はアポイタカラを使用: 1枚引いた。`);
            }
            break;
        case 'regalia-usuganeyoroi':
            const slashCount = isAwakened ? 2 : 1;
            for(let i=0; i<slashCount; i++) player.hand.push(createStarterSlash());
            state.log.push(`${player.name}はウスガネヨロイを使用: ゲーム外から斬撃を${slashCount}枚手に入れた。`);
            break;
        case 'regalia-obotsukagura':
            if (!isAwakened) {
                if (playerKey === 'cpu') {
                    if (Math.random() > 0.5) {
                        player.hand.push(createObotsuFragment());
                        state.log.push(`(CPU)オボツカグラ: 欠片を入手。`);
                    } else {
                        player.hand.push(createStarterBlood());
                        player.hand.push(createStarterBlood());
                        state.log.push(`(CPU)オボツカグラ: 赤血x2を入手。`);
                    }
                } else {
                    state.pendingResolution = { type: 'OBOTSU_BASE_CHOICE' };
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
                            state.log.push(`(CPU)オボツカグラ: 手札を${toCircuit.length}枚血廻へ送り、同数引いた。`);
                        }
                } else {
                    if (player.hand.length === 0) {
                        state.log.push(`${player.name}はオボツカグラを使用したが、手札がなかった。`);
                    } else {
                        state.pendingResolution = { type: 'OBOTSU_AWAKENED_HAND_SELECT' };
                    }
                }
            }
            break;
    }
};
