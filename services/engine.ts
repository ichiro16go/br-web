
import { GameState, ActionType, Phase, CardType } from '../types';
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
import { createStarterBlood } from '../constants/index';

/**
 * ゲームの状態遷移を管理するReducer関数
 * アクションタイプに応じて適切なハンドラ関数を呼び出す
 * @param state 現在のゲーム状態
 * @param action 実行するアクション
 * @returns 新しいゲーム状態
 */
export const gameReducer = (state: GameState, action: ActionType): GameState => {
  const cloneState = structuredClone(state) as GameState;
  
  // チュートリアル進行チェック用のヘルパー
  const checkTutorialAdvance = (s: GameState, currentStep: number, nextStep: number) => {
      if (s.isTutorial && s.tutorialStep === currentStep) {
          s.tutorialStep = nextStep;
      }
  };

  switch (action.type) {
    case 'TUTORIAL_NEXT_STEP':
        if (state.isTutorial) {
            const nextStep = (cloneState.tutorialStep || 0) + 1;
            cloneState.tutorialStep = nextStep;

            // Step 19 (旧17): 覚醒説明へ進む際、裏でクリンナップを実行し、状況をセットアップする
            // チュートリアル進行フロー:
            // 14: End Turn -> 15: Battle結果 -> 16: リソース説明 -> 17: 先攻後攻説明 -> 18: クリンナップ説明 -> Next -> 19: 覚醒
            if (nextStep === 19) {
                // ここでクリンナップを実行
                const afterCleanup = handleCleanup(cloneState);
                
                // 次のステップを19に設定（handleCleanupで状態が変わっても強制）
                afterCleanup.tutorialStep = 19;
                
                // 覚醒状態のセットアップ
                const p1 = afterCleanup.players.player;
                p1.life = 10; // 覚醒ライン
                p1.isRegaliaAwakened = true;
                
                // 血廻を満タンにする（必殺技用）
                p1.bloodCircuit = [];
                for(let i=0; i<10; i++) {
                    p1.bloodCircuit.push({ ...createStarterBlood(), id: `tut-circ-${i}` });
                }
                
                afterCleanup.log.push('[Tutorial] ライフが10になり、神器が覚醒しました！血廻も満たされています。');
                return afterCleanup;
            }
        }
        return cloneState;

    case 'ACTIVATE_BLOOD_RECALL':
        const afterRecall = handleActivateBloodRecall(state, action.playerId);
        // チュートリアル: 必殺技発動(Step 20) -> 終了へ
        // チュートリアル補正: CPUを即死させる
        if (state.isTutorial && state.tutorialStep === 20 && action.playerId === 'p1') {
            afterRecall.players.cpu.life = 1; // 次のバトルで確実に死ぬように
            afterRecall.players.player.attackTotal += 99; // オーバーキル
            afterRecall.tutorialStep = 21; // 終了状態へ
        }
        return afterRecall;

    case 'PLAY_CARD':
        const afterPlay = handlePlayCard(state, action.playerId, action.cardId);
        
        if (state.isTutorial) {
             const p1 = afterPlay.players.player;
             const hasPlayable = p1.hand.some(c => c.type !== CardType.Calamity);

             // Step 12: 初めてのプレイ
             if (state.tutorialStep === 12) {
                 if (!hasPlayable) {
                     afterPlay.tutorialStep = 14; 
                 } else {
                     afterPlay.tutorialStep = 13;
                 }
             } 
             // Step 13: 継続プレイ
             else if (state.tutorialStep === 13) {
                 if (!hasPlayable) {
                     afterPlay.tutorialStep = 14;
                 }
             }
        }
        return afterPlay;

    case 'CRAFT_CARD':
        const afterCraft = handleCraftCard(state, action.playerId, action.recipeId, action.paymentCardIds);
        checkTutorialAdvance(afterCraft, 4, 5);
        return afterCraft;

    case 'SELF_HARM':
        const afterHarm = handleSelfHarm(state, action.playerId);
        checkTutorialAdvance(afterHarm, 7, 8);
        return afterHarm;

    case 'PROCESS_NEXT_TURN_START_EFFECT':
        return handleProcessNextTurnStartEffect(state);

    case 'RESOLVE_PENDING_ACTION':
        return handleResolvePendingAction(state, action.payload);

    case 'RECALL_CARD':
        const afterRecallCard = handleRecallCard(state, action.playerId, action.pileIndex);
        checkTutorialAdvance(afterRecallCard, 10, 11);
        return afterRecallCard;

    case 'PASS_TURN':
        {
            const nextState = handlePassTurn(state, action.playerId);
            
            // チュートリアル Step 14: プレイヤーパス後
            if (state.isTutorial && state.tutorialStep === 14 && action.playerId === 'p1') {
                // CPUの攻撃力を10に設定して、強制的にバトルへ
                nextState.players.cpu.attackTotal = 10;
                nextState.players.cpu.hasPassed = true;
                
                // バトル解決を実行
                return gameReducer(nextState, { type: 'RESOLVE_BATTLE' });
            }

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
            
            // チュートリアル: バトル解決後
            if (state.isTutorial) {
                // Step 14 -> 15 (バトル結果画面で停止)
                if (state.tutorialStep === 14) {
                    nextState.tutorialStep = 15;
                    // 自動でクリンナップへ行かせずに、Overlayで説明させる
                    return nextState;
                }
            }

            // ゲーム終了でなければクリーンナップへ
            if (nextState.phase !== Phase.GameOver && nextState.phase === Phase.BloodBattle) {
                if (nextState.pendingResolution) {
                    return nextState;
                }
                return gameReducer(nextState, { type: 'CLEANUP' });
            }
            return nextState;
        }

    case 'CLEANUP':
        const afterCleanup = handleCleanup(state);
        return afterCleanup;

    case 'CPU_ACTION': {
        // チュートリアル中はCPUは何もしない（パスのみ）
        if (state.isTutorial) {
             if (state.turnPlayerId === 'cpu' && state.phase === Phase.Main) {
                 return gameReducer(state, { type: 'PASS_TURN', playerId: 'cpu' });
             }
             return state;
        }

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
                              !!nextState.pendingResolution; 

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
