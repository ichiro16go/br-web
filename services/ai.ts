import { GameState, Card, ActionType, CardType } from '../types';
import { CRAFT_RECIPES } from '../constants/index';
import { getRegaliaStats } from './gameLogic';

/**
 * CPUの行動を決定する
 * @param state 現在のゲーム状態
 * @returns 実行すべきアクション
 */
export const decideCpuAction = (state: GameState): ActionType => {
    const cpu = state.players.cpu;
        
    // 1. 必殺技（ブラッドリコール）の発動チェック
    if (cpu.bloodRecall && cpu.bloodCircuit.length >= cpu.bloodRecall.cost) {
        // 条件を満たしていれば発動
        return { type: 'ACTIVATE_BLOOD_RECALL', playerId: cpu.id };
    }

    // 2. クラフト（強化）やリコール（購入）の実行
    if (cpu.remainingActions > 0) {
        // クラフト可能なレシピがあれば実行
        for (const recipe of CRAFT_RECIPES) {
            const matchIds = recipe.inputMatcher(cpu.hand);
            if (matchIds) {
                return { type: 'CRAFT_CARD', playerId: cpu.id, recipeId: recipe.id, paymentCardIds: matchIds };
            }
        }

        // 購入可能なカードがあれば購入
        const availablePiles = state.market.recallPiles;
        const affordablePiles = availablePiles.map((pile, index) => {
                if (pile.length === 0) return null;
                const card = pile[pile.length - 1];
                if (card.cost <= cpu.bloodPool.length) return { index, card };
                return null;
        }).filter(item => item !== null) as { index: number, card: Card }[];

        // 攻撃力の高い順にソートして購入
        affordablePiles.sort((a, b) => b.card.attack - a.card.attack);

        if (affordablePiles.length > 0) {
                return { 
                    type: 'RECALL_CARD', 
                    playerId: cpu.id, 
                    pileIndex: affordablePiles[0].index, 
                    paymentCardIds: [] 
            };
        }
    }

    // 3. 自傷アクション（コストが払え、かつ死なない場合のみ実行）
    const stats = getRegaliaStats(cpu);
    if (cpu.regalia && !cpu.regalia.isTapped && stats) {
        const cost = stats.selfHarmCost;
        // エンジンの判定と一致させる: ライフカードの枚数がコスト以上必要
        const canAfford = cpu.lifeCards.length >= cost;
        // AIは自殺しないようにする (残りライフがコストより多い場合のみ)
        const wontDie = cpu.life > cost;

        if (canAfford && wontDie) {
            return { type: 'SELF_HARM', playerId: cpu.id };
        }
    }

    // 4. 手札からカードをプレイ
    const attackCards = cpu.hand.filter(c => c.type !== CardType.Calamity).sort((a,b) => b.attack - a.attack);
    if (attackCards.length > 0) {
        return { type: 'PLAY_CARD', playerId: cpu.id, cardId: attackCards[0].id };
    }

    // 5. やることがなければパス
    return { type: 'PASS_TURN', playerId: cpu.id };
}