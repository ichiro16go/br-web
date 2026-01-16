import React, { useReducer, useEffect, useState, useRef } from 'react';
import { gameReducer } from './services/engine';
import { createPlayer } from './services/gameLogic';
import { GameState, Phase, CardType } from './types';
import { REGALIA_LIST, RECALL_SETS, createRecallCard, BLOOD_RECALLS, getRegaliaTheme } from './constants/index';
import { PlayerArea } from './components/PlayerArea';
import { Market } from './components/Market';
import { 
    CardSelectionModal, SimpleChoiceModal, HandSelectionModal, 
    BlueSphereDeckControlModal, CircuitSelectionModal, IndigoDeckStrategyModal,
    BurialPaymentModal, FieldSelectionModal
} from './components/GameModals';
import { EntranceScreen } from './components/EntranceScreen';
import { GameLog } from './components/GameLog';

// ... (setupGame, App, GameView は基本的に維持、GameView内のモーダル分岐のみ追加)

// ... (中略: setupGame, App 定義など既存コード) ...
// setupGame関数は変更なしのため省略可能ですが、全体の整合性を保つためAppコンポーネント全体を再定義します。

const setupGame = (selectedRegaliaId: string, selectedBloodRecallId: string): GameState => {
  const p1Regalia = REGALIA_LIST.find(r => r.id === selectedRegaliaId) || REGALIA_LIST[0];
  
  const otherRegalias = REGALIA_LIST.filter(r => r.id !== selectedRegaliaId);
  const cpuRegalia = otherRegalias[Math.floor(Math.random() * otherRegalias.length)];
  
  const cpuRecalls = BLOOD_RECALLS.filter(br => br.regaliaId === cpuRegalia.id);
  const cpuBloodRecall = cpuRecalls[Math.floor(Math.random() * cpuRecalls.length)];

  const shuffledSets = [...RECALL_SETS].sort(() => Math.random() - 0.5);
  const selectedSets = shuffledSets.slice(0, 5);
  
  const recallPiles = selectedSets.map(set => {
      const cards = set.cards.map(tmpl => createRecallCard(tmpl));
      return cards.sort(() => Math.random() - 0.5);
  });

  return {
    phase: Phase.Main,
    turnPlayerId: 'p1', 
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
    ],
    cpuFailureCount: 0
  };
};

type AppView = 'entrance' | 'regalia_select' | 'blood_recall_select' | 'game';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('entrance');
  const [selectedRegalia, setSelectedRegalia] = useState<string | null>(null);
  const [selectedBloodRecall, setSelectedBloodRecall] = useState<string | null>(null);

  if (currentView === 'entrance') {
      return (
          <EntranceScreen 
            onStartSolo={() => setCurrentView('regalia_select')}
            onStartVersus={() => { /* Future Impl */ }}
          />
      );
  }

  if (currentView === 'regalia_select') {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4 overflow-y-auto">
        <button 
            onClick={() => setCurrentView('entrance')}
            className="absolute top-4 left-4 text-gray-500 hover:text-white flex items-center gap-2"
        >
            ← Back to Title
        </button>
        <h1 className="text-4xl font-cinzel text-red-600 mb-8 mt-8">Blood Recall</h1>
        <h2 className="text-xl mb-4">Choose your Regalia (Jinki)</h2>
        <div className="flex gap-4 flex-wrap justify-center max-w-6xl pb-8">
          {REGALIA_LIST.map(r => {
            const theme = getRegaliaTheme(r.id);
            return (
                <div 
                    key={r.id} 
                    className={`
                        p-3 rounded border-2 cursor-pointer transition-all hover:scale-105 w-full sm:w-64 flex flex-col shadow-lg
                        ${theme.bg} ${theme.border} ${theme.hover}
                    `}
                    onClick={() => {
                        setSelectedRegalia(r.id);
                        setCurrentView('blood_recall_select');
                    }}
                >
                    <h3 className={`text-xl font-bold mb-1 ${theme.title}`}>{r.name}</h3>
                    <p className={`text-xs mb-2 italic ${theme.subText}`}>{r.description.split('。')[0]}</p>
                    
                    <div className={`${theme.statsBg} p-2 rounded mb-2 flex-1 flex flex-col gap-2`}>
                        {/* Normal Stats */}
                        <div>
                            <div className={`text-[10px] font-bold border-b border-white/10 mb-1 ${theme.subText}`}>Normal</div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400 text-center">
                                <div className="bg-black/30 p-1 rounded">
                                    <div className="text-white font-bold">{r.base.handSize}</div>
                                    <div>Hand</div>
                                </div>
                                <div className="bg-black/30 p-1 rounded">
                                    <div className="text-red-400 font-bold">{r.base.selfHarmCost}</div>
                                    <div>Dmg</div>
                                </div>
                                <div className="bg-black/30 p-1 rounded">
                                    <div className="text-blue-400 font-bold">{r.base.bloodPact}</div>
                                    <div>Pact</div>
                                </div>
                            </div>
                        </div>

                        {/* Awakened Stats */}
                        <div>
                            <div className={`text-[10px] font-bold border-b ${theme.awakenedBorder} mb-1 ${theme.accentText}`}>Awakened (Life≤10)</div>
                            <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-400 text-center">
                                <div className={`bg-black/30 p-1 rounded border ${theme.awakenedBorder}`}>
                                    <div className="text-white font-bold">{r.awakened.handSize}</div>
                                    <div>Hand</div>
                                </div>
                                <div className={`bg-black/30 p-1 rounded border ${theme.awakenedBorder}`}>
                                    <div className="text-red-400 font-bold">{r.awakened.selfHarmCost}</div>
                                    <div>Dmg</div>
                                </div>
                                <div className={`bg-black/30 p-1 rounded border ${theme.awakenedBorder}`}>
                                    <div className="text-blue-400 font-bold">{r.awakened.bloodPact}</div>
                                    <div>Pact</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`text-xs space-y-2 p-2 rounded border flex-1 ${theme.descriptionBg} ${theme.descriptionBorder} ${theme.subText}`}>
                        <div>
                            <p className="font-bold opacity-70 text-[10px] uppercase mb-0.5">Normal Effect:</p>
                            <p className="leading-tight">{r.base.selfHarmEffectDesc}</p>
                        </div>
                        <div className={`border-t pt-1 ${theme.descriptionBorder}`}>
                            <p className={`font-bold text-[10px] uppercase mb-0.5 ${theme.accentText}`}>Awakened Effect:</p>
                            <p className="leading-tight opacity-90">{r.awakened.selfHarmEffectDesc}</p>
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentView === 'blood_recall_select' && selectedRegalia) {
      const availableRecalls = BLOOD_RECALLS.filter(br => br.regaliaId === selectedRegalia);
      const regaliaName = REGALIA_LIST.find(r => r.id === selectedRegalia)?.name;
      const theme = getRegaliaTheme(selectedRegalia);

      return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white p-4">
            <h1 className={`text-3xl font-cinzel mb-2 ${theme.title}`}>Select Blood Recall</h1>
            <h2 className="text-lg text-gray-400 mb-8">for {regaliaName}</h2>
            <div className="flex gap-6 flex-wrap justify-center">
                {availableRecalls.map(br => (
                    <div 
                        key={br.id}
                        className={`
                            p-6 rounded border-2 cursor-pointer transition-all w-80 flex flex-col items-center text-center group
                            ${theme.bg} ${theme.border} ${theme.hover}
                        `}
                        onClick={() => {
                            setSelectedBloodRecall(br.id);
                            setCurrentView('game');
                        }}
                    >
                        <h3 className={`text-2xl font-bold mb-2 ${theme.title}`}>{br.name}</h3>
                        <div className={`w-full h-px my-4 ${theme.descriptionBorder.replace('border-', 'bg-')}`}></div>
                        <div className={`text-sm mb-4 flex-1 ${theme.subText}`}>{br.description}</div>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                            <div className="bg-black/40 px-3 py-1 rounded text-red-400 border border-red-900/50">
                                Cost: {br.cost}
                            </div>
                            <div className="bg-black/40 px-3 py-1 rounded text-blue-400 border border-blue-900/50">
                                {br.timing}
                            </div>
                        </div>
                        <div className={`mt-6 opacity-0 group-hover:opacity-100 transition-opacity font-cinzel font-bold ${theme.title}`}>
                            SELECT
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className="mt-12 text-gray-500 hover:text-white underline"
                onClick={() => {
                    setSelectedRegalia(null);
                    setCurrentView('regalia_select');
                }}
            >
                Back to Regalia Selection
            </button>
        </div>
      );
  }

  if (currentView === 'game' && selectedRegalia && selectedBloodRecall) {
      return <GameView key={`${selectedRegalia}-${selectedBloodRecall}`} initialState={setupGame(selectedRegalia, selectedBloodRecall)} />;
  }

  return null;
};

const GameView: React.FC<{ initialState: GameState }> = ({ initialState }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ... (useEffect, Handlers 省略... 変更なし)
  useEffect(() => {
    if (state.phase === Phase.Main && state.turnPlayerId === 'cpu') {
      const timer = setTimeout(() => {
        dispatch({ type: 'CPU_ACTION' });
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [state]);

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
    const hand = state.players.player.hand;
    const playableCards = hand.filter(c => c.type !== CardType.Calamity);
    if (playableCards.length > 0) {
        alert("手札にカードが残っています。\nルール上、手札のカードは全てプレイする必要があります。\n(災厄カードを除く)");
        return;
    }
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

  const handleResolvePending = (payload: any) => {
      dispatch({ type: 'RESOLVE_PENDING_ACTION', payload });
  };

  const isPlayerTurn = state.turnPlayerId === 'p1' && state.phase === Phase.Main;
  const remainingActions = state.players.player.remainingActions;

  return (
    <div className="h-screen w-full bg-[#1a0b0b] text-gray-200 flex overflow-hidden font-sans select-none">
      
      <GameLog 
        logs={state.log} 
        turnPlayerId={state.turnPlayerId} 
        phase={state.phase} 
      />

      <div className="flex-1 flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        
        <div className="flex-1 border-b border-red-900/20 relative">
             <PlayerArea 
                player={state.players.cpu} 
                isCurrentUser={false} 
                onPlayCard={() => {}} 
                onSelfHarm={() => {}} 
                onCraft={() => {}} 
                onActivateBloodRecall={() => {}}
                isOpponent={true}
                phase={state.phase}
              />
        </div>

        <div className="flex-1 relative">
             <PlayerArea 
                player={state.players.player} 
                isCurrentUser={true} 
                onPlayCard={handlePlayCard} 
                onSelfHarm={handleSelfHarm} 
                onCraft={handleCraft}
                onActivateBloodRecall={handleActivateBloodRecall}
                isOpponent={false}
                phase={state.phase}
              />
        </div>

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
        
        <div className="lg:hidden absolute top-2 left-2 z-30">
             <div className="bg-black/60 text-[10px] text-white/50 p-1 rounded border border-white/10 max-w-[200px] truncate">
                 {state.log[state.log.length - 1]}
             </div>
        </div>

      </div>

      <div className="w-40 md:w-56 bg-black/80 border-l border-red-900/30 flex flex-col z-20">
         <Market 
            recallPiles={state.market.recallPiles} 
            onRecall={handleRecall} 
            canRecall={isPlayerTurn && remainingActions > 0} 
            playerPoolCount={state.players.player.bloodPool.length}
         />
      </div>

      {state.pendingResolution && (
          <>
            {/* ... (既存のモーダル分岐は維持) ... */}
            {state.pendingResolution.type === 'APOITAKARA_SELECTION' && (
                <CardSelectionModal 
                    title="Apoitakara's Vision"
                    description="Choose one card to add to your hand. The rest will be discarded."
                    cards={state.pendingResolution.cards}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'SHIRAGANE_HAND_SELECT' && (
                <HandSelectionModal 
                    title="Remembrance (Shiragane)"
                    description={`Select ${state.pendingResolution.count} Art card(s) to upgrade.`}
                    hand={state.players.player.hand}
                    minSelect={state.pendingResolution.count}
                    maxSelect={state.pendingResolution.count}
                    filter={(c) => c.type === CardType.Slash || c.type === CardType.Blood}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'OBOTSU_BASE_CHOICE' && (
                <SimpleChoiceModal 
                    title="Obotsukagura's Choice"
                    description="Select which blessing to receive."
                    options={[
                        { label: 'Obotsu Fragment', value: 'fragment' },
                        { label: '2 Blood Cards', value: 'blood' }
                    ]}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'OBOTSU_AWAKENED_HAND_SELECT' && (
                <HandSelectionModal 
                    title="Sacrifice for Knowledge"
                    description="Select up to 2 cards to send to Blood Circuit. You will draw an equal amount."
                    hand={state.players.player.hand}
                    onResolve={handleResolvePending}
                    maxSelect={2}
                />
            )}
            {state.pendingResolution.type === 'BLUE_SPHERE_UPGRADE' && (
                <CardSelectionModal 
                    title="Blue Sphere: Remembrance"
                    description="Choose an Art card in your hand to upgrade (Remembrance Enhancement)."
                    cards={state.players.player.hand}
                    filter={(c) => c.type === CardType.Slash || c.type === CardType.Blood}
                    onResolve={(payload) => {
                         const card = state.players.player.hand[payload.selectedIndex];
                         handleResolvePending({ cardId: card.id });
                    }}
                />
            )}
            {state.pendingResolution.type === 'BLUE_SPHERE_DECK_CONTROL' && (
                <BlueSphereDeckControlModal 
                    title="Blue Sphere: Deck Control"
                    description="Look at top 2 cards. Send any to Blood Circuit, return rest to Deck top."
                    cards={state.pendingResolution.cards}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'INDIGO_HAND_TO_CIRCUIT' && (
                <HandSelectionModal 
                    title="Indigo Wing: Offerings"
                    description="Send any number of cards from your hand to Blood Circuit."
                    hand={state.players.player.hand}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'INDIGO_DECK_STRATEGY' && (
                <IndigoDeckStrategyModal 
                    title="Indigo Wing: Strategy"
                    description="Top 2 cards of Deck. Upgrade 1 Art, discard others, or return to deck."
                    cards={state.pendingResolution.cards}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'INDIGO_UPGRADE_BLOOD' && (
                <HandSelectionModal 
                    title="Indigo Wing: Blood Upgrade"
                    description="Select 1 Level 1 Blood Art to upgrade."
                    hand={state.players.player.hand}
                    minSelect={1}
                    maxSelect={1}
                    filter={(c) => c.type === CardType.Blood && c.level === 1}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'INDIGO_HAND_TO_CIRCUIT_DRAW' && (
                <HandSelectionModal 
                    title="Indigo Wing: Exchange"
                    description="Send up to 2 cards to Blood Circuit. If you send any, Draw 1."
                    hand={state.players.player.hand}
                    maxSelect={2}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'INDIGO_CIRCUIT_TO_HAND' && (
                <CircuitSelectionModal 
                    title="Indigo Wing: Retrieval"
                    description="Select 1 card from Blood Circuit to add to hand. If you do, Draw 2."
                    circuit={state.players.player.bloodCircuit}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'BURIAL_PAYMENT' && (
                <BurialPaymentModal 
                    title="Burial Black: Additional Cost"
                    description="Choose to pay blood to activate the unique effect."
                    costType={state.pendingResolution.costType}
                    costAmount={state.pendingResolution.costAmount}
                    poolSize={state.players.player.bloodPool.length}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'BURIAL_SEARCH_DECK' && (
                <CardSelectionModal 
                    title="Burial Black: Search"
                    description="Select a card to place on top of your deck (Deck will be shuffled)."
                    cards={state.pendingResolution.cards}
                    onResolve={handleResolvePending}
                />
            )}
            {state.pendingResolution.type === 'BURIAL_FREE_RECALL' && (
                <CardSelectionModal 
                    title="Burial Black: Free Recall"
                    description="Select a Recall card from the Market to recall for FREE."
                    cards={state.pendingResolution.marketCards}
                    onResolve={handleResolvePending}
                />
            )}

            {/* --- 新規追加: 超克の桜【凱旋】 モーダル --- */}
            {state.pendingResolution.type === 'CHERRY_VICTORY_SELECT' && (
                <FieldSelectionModal 
                    title="Cherry: Victory"
                    description="Select up to 2 Slash Arts on your field to Remembrance Enhance."
                    field={state.players.player.field}
                    maxSelect={2}
                    filter={(c) => c.type === CardType.Slash}
                    onResolve={handleResolvePending}
                />
            )}
          </>
      )}

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
