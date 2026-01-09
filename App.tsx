import React, { useReducer, useEffect, useState, useRef } from 'react';
import { gameReducer, createPlayer } from './services/engine';
import { GameState, Phase, RegaliaCard, PlayerState, CardType } from './types';
import { REGALIA_LIST, RECALL_SETS, createRecallCard, BLOOD_RECALLS } from './constants';
import { PlayerArea } from './components/PlayerArea';
import { Market } from './components/Market';

// --- 初期セットアップ用ヘルパー ---
const setupGame = (selectedRegaliaId: string, selectedBloodRecallId: string): GameState => {
  const p1Regalia = REGALIA_LIST.find(r => r.id === selectedRegaliaId) || REGALIA_LIST[0];
  
  // CPUはランダムに別の神器を選ぶ
  const otherRegalias = REGALIA_LIST.filter(r => r.id !== selectedRegaliaId);
  const cpuRegalia = otherRegalias[Math.floor(Math.random() * otherRegalias.length)];
  
  // CPUのブラッドリコールをランダムに選ぶ
  const cpuRecalls = BLOOD_RECALLS.filter(br => br.regaliaId === cpuRegalia.id);
  const cpuBloodRecall = cpuRecalls[Math.floor(Math.random() * cpuRecalls.length)];

  // マーケットデッキの初期化 (7色セットからランダムに5色選出)
  const shuffledSets = [...RECALL_SETS].sort(() => Math.random() - 0.5);
  const selectedSets = shuffledSets.slice(0, 5);
  
  // 各セットごとに山札を作成し、シャッフルして配置
  const recallPiles = selectedSets.map(set => {
      // セット内の5枚のカード定義を使って実体化
      const cards = set.cards.map(tmpl => createRecallCard(tmpl));
      // 山札内でシャッフル
      return cards.sort(() => Math.random() - 0.5);
  });

  return {
    phase: Phase.Main,
    turnPlayerId: 'p1', // デモのため常にP1から開始
    firstPlayerId: 'p1',
    players: {
      player: createPlayer('p1', 'Player 1', true, p1Regalia, selectedBloodRecallId),
      cpu: createPlayer('cpu', 'CPU', false, cpuRegalia, cpuBloodRecall.id)
    },
    market: {
      recallPiles: recallPiles,
      artsDeckSlash: [],
      artsDeckBlood: []
    },
    log: [
        'Game Start!', 
        `Player 1 uses ${p1Regalia.name}`, 
        `CPU uses ${cpuRegalia.name}`,
        `Market Colors: ${selectedSets.map(s => s.colorName).join(', ')}`
    ]
  };
};

const App: React.FC = () => {
  const [selectedRegalia, setSelectedRegalia] = useState<string | null>(null);
  const [selectedBloodRecall, setSelectedBloodRecall] = useState<string | null>(null);

  // ステップ1: 神器選択
  if (!selectedRegalia) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4 overflow-y-auto">
        <h1 className="text-4xl font-cinzel text-red-600 mb-8 mt-8">Blood Recall</h1>
        <h2 className="text-xl mb-4">Choose your Regalia (Jinki)</h2>
        <div className="flex gap-4 flex-wrap justify-center max-w-6xl pb-8">
          {REGALIA_LIST.map(r => (
            <div 
              key={r.id} 
              className="bg-gray-800 p-3 rounded border-2 border-red-900 hover:border-red-500 cursor-pointer transition-all hover:scale-105 w-full sm:w-64 flex flex-col"
              onClick={() => setSelectedRegalia(r.id)}
            >
              <h3 className="text-xl font-bold text-red-400 mb-1">{r.name}</h3>
              <p className="text-xs mb-2 text-gray-500 italic">{r.description.split('。')[0]}</p>
              
              <div className="bg-black/30 p-2 rounded mb-2 flex-1">
                 <p className="text-xs text-gray-300 font-bold mb-1">[Stats]</p>
                 <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400 text-center">
                    <div className="bg-gray-900/50 p-1 rounded">
                        <div className="text-white font-bold">{r.handSize}</div>
                        <div>Hand</div>
                    </div>
                    <div className="bg-gray-900/50 p-1 rounded">
                        <div className="text-red-400 font-bold">{r.selfHarmCost}</div>
                        <div>Dmg</div>
                    </div>
                    <div className="bg-gray-900/50 p-1 rounded">
                        <div className="text-blue-400 font-bold">{r.bloodPact}</div>
                        <div>Pact</div>
                    </div>
                 </div>
              </div>

              <div className="text-xs space-y-1 text-gray-400 bg-red-950/20 p-2 rounded border border-red-900/20">
                 <p className="font-bold text-red-300">Self Harm Effect:</p>
                 <p className="leading-tight">{r.selfHarmEffectDesc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ステップ2: ブラッドリコール選択
  if (!selectedBloodRecall) {
      const availableRecalls = BLOOD_RECALLS.filter(br => br.regaliaId === selectedRegalia);
      const regaliaName = REGALIA_LIST.find(r => r.id === selectedRegalia)?.name;

      return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-3xl font-cinzel text-red-600 mb-2">Select Blood Recall</h1>
            <h2 className="text-lg text-gray-400 mb-8">for {regaliaName}</h2>
            <div className="flex gap-6 flex-wrap justify-center">
                {availableRecalls.map(br => (
                    <div 
                        key={br.id}
                        className="bg-gray-800 p-6 rounded border-2 border-red-700 hover:border-red-400 hover:bg-gray-700 cursor-pointer transition-all w-80 flex flex-col items-center text-center group"
                        onClick={() => setSelectedBloodRecall(br.id)}
                    >
                        <h3 className="text-2xl font-bold text-red-200 mb-2">{br.name}</h3>
                        <div className="w-full h-px bg-red-900 my-4"></div>
                        <div className="text-sm text-gray-300 mb-4 flex-1">{br.description}</div>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className="bg-black/40 px-3 py-1 rounded text-red-400 border border-red-900">
                                Cost: {br.cost}
                            </div>
                            <div className="bg-black/40 px-3 py-1 rounded text-blue-400 border border-blue-900">
                                {br.timing}
                            </div>
                        </div>
                        <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-cinzel font-bold">
                            SELECT
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className="mt-12 text-gray-500 hover:text-white underline"
                onClick={() => setSelectedRegalia(null)}
            >
                Back to Regalia Selection
            </button>
        </div>
      );
  }

  return <GameView key={`${selectedRegalia}-${selectedBloodRecall}`} initialState={setupGame(selectedRegalia, selectedBloodRecall)} />;
};

// ゲームコンポーネント
const GameView: React.FC<{ initialState: GameState }> = ({ initialState }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.log]);

  // AIループ
  useEffect(() => {
    if (state.phase === Phase.Main && state.turnPlayerId === 'cpu') {
      const timer = setTimeout(() => {
        dispatch({ type: 'CPU_ACTION' });
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [state]);

  // アクションハンドラ
  const handlePlayCard = (cardId: string) => {
    if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
    dispatch({ type: 'PLAY_CARD', playerId: 'p1', cardId });
  };

  const handleSelfHarm = () => {
    if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
    dispatch({ type: 'SELF_HARM', playerId: 'p1' });
  };

  const handlePass = () => {
    if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
    dispatch({ type: 'PASS_TURN', playerId: 'p1' });
  };

  const handleRecall = (pileIndex: number) => {
    if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
    dispatch({ type: 'RECALL_CARD', playerId: 'p1', pileIndex, paymentCardIds: [] });
  };

  const handleCraft = (recipeId: string, paymentCardIds: string[]) => {
    if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
    dispatch({ type: 'CRAFT_CARD', playerId: 'p1', recipeId, paymentCardIds });
  };

  const handleActivateBloodRecall = () => {
      if (state.turnPlayerId !== 'p1' || state.phase !== Phase.Main) return;
      dispatch({ type: 'ACTIVATE_BLOOD_RECALL', playerId: 'p1' });
  };

  const isPlayerTurn = state.turnPlayerId === 'p1' && state.phase === Phase.Main;
  const remainingActions = state.players.player.remainingActions;

  return (
    <div className="h-screen w-full bg-[#1a0b0b] text-gray-200 flex overflow-hidden font-sans select-none">
      
      {/* 左サイドバー: ログ & ステータス */}
      <div className="w-48 bg-black/60 border-r border-red-900/30 flex flex-col hidden lg:flex z-20">
        <div className="p-2 bg-red-950/20 border-b border-red-900/30 text-center font-cinzel text-red-500">
           Round Log
        </div>
        <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-2 custom-scrollbar" ref={scrollRef}>
             {state.log.map((msg, i) => (
                <div key={i} className="border-b border-white/5 pb-1 text-gray-400 last:text-white">{msg}</div>
            ))}
        </div>
        <div className="p-4 border-t border-red-900/30 bg-black/40">
            <div className="text-xs text-gray-500 uppercase mb-1">Turn</div>
            <div className={`text-sm font-bold ${state.turnPlayerId === 'p1' ? 'text-red-400' : 'text-blue-400'}`}>
                {state.turnPlayerId === 'p1' ? 'YOUR TURN' : 'CPU TURN'}
            </div>
            <div className="mt-2 text-xs text-gray-500 uppercase mb-1">Phase</div>
            <div className="text-sm font-bold text-white">{state.phase}</div>
        </div>
      </div>

      {/* 中央: ゲームボード */}
      <div className="flex-1 flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        
        {/* 相手側 (上半分) */}
        <div className="flex-1 border-b border-red-900/20 relative">
             <PlayerArea 
                player={state.players.cpu} 
                isCurrentUser={false} 
                onPlayCard={() => {}} 
                onSelfHarm={() => {}} 
                onCraft={() => {}} 
                onActivateBloodRecall={() => {}}
                isOpponent={true}
              />
        </div>

        {/* プレイヤー側 (下半分) */}
        <div className="flex-1 relative">
             <PlayerArea 
                player={state.players.player} 
                isCurrentUser={true} 
                onPlayCard={handlePlayCard} 
                onSelfHarm={handleSelfHarm} 
                onCraft={handleCraft}
                onActivateBloodRecall={handleActivateBloodRecall}
                isOpponent={false}
              />
        </div>

        {/* アクションバー (右下フローティング) */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-30">
             {state.phase === Phase.GameOver ? (
                  <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 font-bold rounded hover:bg-gray-200 shadow-lg">
                      Play Again
                  </button>
              ) : (
                  <button 
                    onClick={handlePass}
                    disabled={!isPlayerTurn}
                    className={`
                        h-16 w-32 rounded-lg font-cinzel font-bold text-lg transition-all transform active:scale-95 flex flex-col items-center justify-center border-2
                        ${isPlayerTurn 
                            ? 'bg-red-900 hover:bg-red-700 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                            : 'bg-gray-900 text-gray-600 border-gray-700 cursor-not-allowed'}
                    `}
                  >
                    <span>{isPlayerTurn ? 'END' : 'WAIT'}</span>
                    <span className="text-xs font-sans font-normal opacity-70">Turn</span>
                  </button>
              )}
        </div>
        
        {/* モバイル用ログトグル (モバイルのみ表示) */}
        <div className="lg:hidden absolute top-2 left-2 z-30">
             <div className="bg-black/60 text-[10px] text-white/50 p-1 rounded border border-white/10 max-w-[200px] truncate">
                 {state.log[state.log.length - 1]}
             </div>
        </div>

      </div>

      {/* 右サイドバー: マーケット (契約エリア) */}
      <div className="w-40 md:w-56 bg-black/80 border-l border-red-900/30 flex flex-col z-20">
         <Market 
            recallPiles={state.market.recallPiles} 
            onRecall={handleRecall} 
            canRecall={isPlayerTurn && remainingActions > 0} 
            playerPoolCount={state.players.player.bloodPool.length}
         />
      </div>

      {/* ゲームオーバーモーダル */}
      {state.phase === Phase.GameOver && (
          <div className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center animate-fade-in">
              <h1 className="text-6xl font-cinzel text-red-600 mb-4 animate-pulse">GAME OVER</h1>
              <p className="text-2xl mb-8 text-gray-300">
                  {state.players.player.life <= 0 && state.players.cpu.life <= 0 
                    ? "Mutual Destruction" 
                    : state.players.player.life <= 0 
                        ? "You Died" 
                        : "Victory"}
              </p>
              <button onClick={() => window.location.reload()} className="bg-red-700 px-8 py-4 rounded text-xl hover:bg-red-600 border border-red-500 shadow-lg text-white">
                  Return to Title
              </button>
          </div>
      )}
    </div>
  );
};

export default App;