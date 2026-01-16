import { GameState, ActionType, Phase } from '../types';
import { decideCpuAction } from './ai';
import { 
    handleActivateBloodRecall,
    handlePlayCard,
    handleCraftCard,
    handleSelfHarm,
    handleRecallCard,
    handlePassTurn,
    handleResolveBattle,
    handleCleanup,
    handleProcessNextTurnStartEffect,
    handleResolvePendingAction
} from './gameActions';

/**
 * ゲームの状態遷移を管理するReducer関数
 * アクションタイプに応じて適切なハンドラ関数を呼び出す
 * @param state 現在のゲーム状態
 * @param action 実行するアクション
 * @returns 新しいゲーム状態
 */
export const gameReducer = (state: GameState, action: ActionType): GameState => {
  const cloneState = structuredClone(state) as GameState;
  
  switch (action.type) {
    case 'ACTIVATE_BLOOD_RECALL':
        return handleActivateBloodRecall(state, action.playerId);

    case 'PLAY_CARD':
        return handlePlayCard(state, action.playerId, action.cardId);

    case 'CRAFT_CARD':
        return handleCraftCard(state, action.playerId, action.recipeId, action.paymentCardIds);

    case 'SELF_HARM':
        return handleSelfHarm(state, action.playerId);

    case 'PROCESS_NEXT_TURN_START_EFFECT':
        return handleProcessNextTurnStartEffect(state);

    case 'RESOLVE_PENDING_ACTION':
        return handleResolvePendingAction(state, action.payload);

    case 'RECALL_CARD':
        return handleRecallCard(state, action.playerId, action.pileIndex);

    case 'PASS_TURN':
        {
            const nextState = handlePassTurn(state, action.playerId);
            // パス後に両者パス状態なら戦闘へ移行するロジックが必要
            // handlePassTurnはStateを返すが、相手もパス済みかどうかはState内のフラグで判断
            // ここで戦闘解決へ遷移させる
            const playerKey = action.playerId === state.players.player.id ? 'player' : 'cpu';
            const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
            if (nextState.players[playerKey].hasPassed && nextState.players[opponentKey].hasPassed) {
                return gameReducer(nextState, { type: 'RESOLVE_BATTLE' });
            }
            return nextState;
        }

    case 'RESOLVE_BATTLE':
        {
            const nextState = handleResolveBattle(state);
            // ゲーム終了でなければクリーンナップへ
            if (nextState.phase !== Phase.GameOver && nextState.phase === Phase.BloodBattle) {
                // handleResolveBattle内で勝利時効果のPendingResolutionがセットされた場合、
                // PhaseはBloodBattleのまま一旦戻り、ユーザー入力を待つ
                if (nextState.pendingResolution) {
                    return nextState;
                }
                return gameReducer(nextState, { type: 'CLEANUP' });
            }
            return nextState;
        }

    case 'CLEANUP':
        return handleCleanup(state);

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
                              nextState.turnPlayerId !== cloneState.turnPlayerId ||
                              !!nextState.pendingResolution; // Pending発生も進行とみなす

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
