import React, { useState } from 'react';
import { PlayerState, RegaliaCard, Phase } from '../types';
import { Card } from './Card';
import { Zone } from './Zone';
import { CRAFT_RECIPES } from '../constants/index';
import { RegaliaModal, CraftModal, CardListModal, DeckListModal } from './GameModals';

interface PlayerAreaProps {
  player: PlayerState;
  isCurrentUser: boolean;
  onPlayCard: (cardId: string) => void;
  onSelfHarm: () => void;
  onCraft: (recipeId: string, paymentCardIds: string[]) => void;
  onActivateBloodRecall: () => void;
  isOpponent?: boolean;
  phase: Phase; // アニメーション制御のためにフェーズを受け取る
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
    player, 
    isCurrentUser, 
    onPlayCard, 
    onSelfHarm, 
    onCraft,
    onActivateBloodRecall,
    isOpponent = false,
    phase
}) => {
  const [selectedRegalia, setSelectedRegalia] = useState<RegaliaCard | null>(null);
  const [showCraftModal, setShowCraftModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showCircuitModal, setShowCircuitModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);

  const handleRegaliaClick = () => {
      if (player.regalia) {
          setSelectedRegalia(player.regalia);
      }
  };

  const handleConfirmSelfHarm = () => {
      onSelfHarm();
      setSelectedRegalia(null);
  };

  // 総枚数計算（循環カードのみ）
  const totalCards = player.deck.length + player.hand.length + player.discard.length + player.field.length + player.bloodPool.length + player.bloodCircuit.length;
  
  // -- ボード上のゾーン定義 --

  // 1. アイデンティティゾーン（左端）
  const IdentityZone = (
      <div className="w-24 md:w-32 flex flex-col gap-2 p-1">
          <Zone title="Regalia" className="h-1/2 flex items-center justify-center bg-black/40 border-red-900/50">
             {player.regalia && (
                <div className={`transition-transform duration-500 ${player.regalia.isTapped ? 'rotate-90 opacity-75' : ''}`}>
                    <Card 
                        card={player.regalia} 
                        size="md" 
                        onClick={handleRegaliaClick} 
                        isAwakened={player.isRegaliaAwakened}
                    />
                     {isCurrentUser && !player.regalia.isTapped && (
                        <div className="text-[10px] text-red-400 text-center mt-1 cursor-pointer hover:underline" onClick={handleRegaliaClick}>
                            確認 / 自傷
                        </div>
                    )}
                </div>
             )}
          </Zone>
          <Zone title="Blood Recall" className="h-1/2 flex items-center justify-center bg-black/40">
             {player.bloodRecall ? (
                 isOpponent ? (
                     <div className="w-24 h-36 bg-red-950 border-2 border-red-800 rounded flex items-center justify-center shadow-lg">
                        <span className="text-red-500 font-cinzel text-xs">Secret</span>
                     </div>
                 ) : (
                    <div className="relative group">
                         <div className={`w-24 h-36 border-2 rounded flex flex-col p-1 shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform ${player.isRegaliaAwakened ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-700 opacity-80'}`}>
                             <div className="text-[10px] text-red-200 font-bold border-b border-red-500/50 text-center">{player.bloodRecall.name}</div>
                             <div className="flex-1 text-[8px] text-gray-200 p-1 flex items-center justify-center leading-tight">
                                 {player.bloodRecall.description}
                             </div>
                             <div className="flex justify-between text-[8px] font-bold text-red-300">
                                 <span>Cost: {player.bloodRecall.cost}</span>
                                 <span>{player.bloodRecall.timing}</span>
                             </div>
                         </div>
                         {/* 発動ボタンオーバーレイ */}
                         <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             {player.bloodCircuit.length >= player.bloodRecall.cost ? (
                                <button 
                                    onClick={onActivateBloodRecall}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded font-bold"
                                >
                                    ACTIVATE
                                </button>
                             ) : (
                                <span className="text-xs text-gray-500">Need {player.bloodRecall.cost} Circuit</span>
                             )}
                         </div>
                    </div>
                 )
             ) : (
                 <div className="w-20 h-28 border border-dashed border-red-900/50 rounded"></div>
             )}
          </Zone>
      </div>
  );

  // 2. メインアクションゾーン（中央）
  const MainActionZone = (
      <div className="flex-1 flex flex-col p-1 gap-1 w-full max-w-4xl mx-auto px-4">
          {/* 上半分: フィールド */}
          <div className={`flex-1 flex flex-col ${isOpponent ? 'order-2' : 'order-1'}`}>
               <Zone title={isOpponent ? "Opponent Field" : "Your Field"} className="flex-1 bg-black/20 flex items-center justify-center border-red-500/20 overflow-hidden min-h-[160px]">
                    <div className="flex items-center justify-center w-full px-2 transition-all">
                        {player.field.map((c, i) => {
                            const count = player.field.length;
                            let marginStyle = {};
                            if (i > 0) {
                                if (count > 12) marginStyle = { marginLeft: '-4rem' }; 
                                else if (count > 9) marginStyle = { marginLeft: '-3rem' }; 
                                else if (count > 6) marginStyle = { marginLeft: '-2rem' };
                                else marginStyle = { marginLeft: '0.5rem' };
                            }
                            
                            // 戦闘フェイズならシェイク、メインフェイズならプレイ時スライドアップ
                            const animClass = phase === Phase.BloodBattle ? 'animate-shake' : 'animate-play-card';

                            return (
                                <div key={c.id} className="transition-all duration-300 relative transform" style={{ ...marginStyle, zIndex: i }}>
                                    <Card card={c} size="md" className={animClass} />
                                </div>
                            );
                        })}
                    </div>
               </Zone>
          </div>

          {/* 下半分: ブラッドプール & 血廻 (横並び) */}
          <div className={`h-28 flex gap-2 ${isOpponent ? 'order-1' : 'order-2'}`}>
              <div className="flex-1">
                  <Zone title="Blood Pool" count={player.bloodPool.length} className="h-full bg-red-950/10 border-red-900/30 flex items-center justify-start">
                      <div className="flex -space-x-8 px-4 overflow-x-auto w-full custom-scrollbar py-2 items-center">
                          {player.bloodPool.map(c => (
                              <Card key={c.id} card={c} size="sm" isFaceDown={false} className="animate-fade-in" />
                          ))}
                      </div>
                  </Zone>
              </div>
              <div className="w-32 md:w-48 border-l border-red-900/30 cursor-pointer hover:bg-purple-900/10 transition-colors" onClick={() => setShowCircuitModal(true)}>
                  <Zone title="Blood Circuit (Click)" count={player.bloodCircuit.length} className="h-full bg-purple-900/20 border-purple-500/30 flex items-center justify-center">
                      <div className="relative">
                          {player.bloodCircuit.map((c, i) => (
                              <div key={c.id} className="absolute top-0 left-0" style={{ transform: `translate(${i * 2}px, ${i * -2}px)` }}>
                                  <Card card={c} size="sm" isFaceDown={false} />
                              </div>
                          ))}
                          {player.bloodCircuit.length === 0 && (
                              <span className="text-xs text-purple-500/50">Empty</span>
                          )}
                          {player.bloodCircuit.length > 0 && (
                              <div className="relative" style={{ opacity: 0 }}>
                                  <Card card={player.bloodCircuit[0]} size="sm" />
                              </div>
                          )}
                      </div>
                  </Zone>
              </div>
          </div>
      </div>
  );

  // 3. ライブラリゾーン（右端）
  const LibraryZone = (
      <div className="w-24 md:w-32 flex flex-col gap-2 p-1">
          <Zone title="Discard" count={player.discard.length} className="h-1/2 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/60 transition-colors">
              <div onClick={() => setShowDiscardModal(true)} className="w-full h-full flex items-center justify-center">
                  {player.discard.length > 0 ? (
                      <Card card={player.discard[player.discard.length - 1]} size="sm" />
                  ) : (
                      <div className="text-xs text-gray-600">Empty</div>
                  )}
              </div>
          </Zone>
          <Zone title="Deck (Click)" className="h-1/2 flex items-center justify-center bg-black/40 relative group cursor-pointer hover:bg-black/60 transition-colors">
               <div onClick={() => !isOpponent && setShowDeckModal(true)} className="w-full h-full flex items-center justify-center">
                   {player.deck.length > 0 ? (
                       <div className="w-16 h-24 bg-red-900 rounded border-2 border-red-700 shadow-md flex items-center justify-center">
                           <span className="text-3xl font-cinzel font-bold text-red-200 drop-shadow-md">{player.deck.length}</span>
                       </div>
                   ) : (
                       <div className="text-xs text-gray-600">0</div>
                   )}
                   {/* Total枚数表示 */}
                   <div className="absolute -bottom-6 w-full text-center pointer-events-none">
                       <span className="text-xs text-gray-400 font-bold bg-black/80 px-2 py-0.5 rounded border border-gray-700">
                           Total: {totalCards}
                       </span>
                   </div>
                   {!isOpponent && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/80 text-[10px] px-2 py-1 rounded border border-gray-600">View</span>
                       </div>
                   )}
               </div>
          </Zone>
      </div>
  );

  // 4. 手札オーバーレイ
  const HandOverlay = (
      <div className={`absolute left-0 right-0 flex justify-center z-50 pointer-events-none ${isOpponent ? '-top-12' : '-bottom-12'}`}>
           <div className={`
                flex gap-2 p-2 rounded-xl transition-transform duration-300 pointer-events-auto
                ${isOpponent ? 'scale-75' : 'hover:-translate-y-12 bg-black/50 backdrop-blur-sm border border-red-500/30 shadow-[0_0_30px_rgba(0,0,0,0.8)] translate-y-4'}
           `}>
                {isOpponent ? (
                    player.hand.map((_, i) => (
                        <div key={i} className="w-16 h-24 bg-red-900 border border-red-800 rounded shadow-md"></div>
                    ))
                ) : (
                    player.hand.map((c, i) => (
                        <Card 
                            key={c.id} 
                            card={c} 
                            size="lg" 
                            onClick={() => onPlayCard(c.id)} 
                            className="animate-draw"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))
                )}
           </div>
      </div>
  );

  // 強化ボタン
  const CraftButton = isCurrentUser && (
      <div className="absolute bottom-32 right-4 z-40">
          <button 
              onClick={() => setShowCraftModal(true)}
              disabled={player.remainingActions <= 0}
              className={`
                 border px-4 py-2 rounded shadow-lg font-cinzel text-sm flex items-center gap-2 backdrop-blur-sm transition-all
                 ${player.remainingActions > 0 
                    ? 'bg-purple-900/80 hover:bg-purple-700 text-purple-100 border-purple-500 hover:scale-105 active:scale-95' 
                    : 'bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed opacity-70'}
              `}
          >
              <span className="text-lg">✦</span> Enhance
              {CRAFT_RECIPES.some(r => r.inputMatcher(player.hand) !== null) && player.remainingActions > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
              )}
          </button>
      </div>
  );

  return (
    <div className={`relative w-full h-full flex ${isOpponent ? 'flex-col-reverse' : 'flex-col'}`}>
        <div className="flex-1 flex w-full justify-center">
            {IdentityZone}
            {MainActionZone}
            {LibraryZone}
        </div>

        {HandOverlay}
        {CraftButton}

        {/* スタッツ表示 */}
        <div className={`absolute right-4 ${isOpponent ? 'top-4' : 'bottom-44'} pointer-events-none flex flex-col items-end gap-1`}>
            <div className="text-4xl font-cinzel font-bold text-white/10 drop-shadow-md">
                {isOpponent ? 'OPPONENT' : 'PLAYER'}
            </div>
            
            <div className="flex flex-col items-end bg-black/60 p-2 rounded border border-red-900/30 backdrop-blur-sm">
                
                <div className="flex items-center gap-6 mb-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-red-500 uppercase font-bold tracking-widest">LIFE</span>
                        <span className="text-3xl font-bold text-red-500 drop-shadow-md">{player.life}</span>
                    </div>
                    <div className="w-px h-10 bg-red-900/50"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-yellow-500 uppercase font-bold tracking-widest">ATK</span>
                        <span className="text-3xl font-bold text-yellow-500 drop-shadow-md">{player.attackTotal}</span>
                    </div>
                </div>
                
                <div className="w-full h-px bg-red-900/50 my-1"></div>
                
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-purple-400 uppercase">Act</span>
                        <span className={`text-lg font-bold ${player.remainingActions > 0 ? 'text-white' : 'text-gray-500'}`}>
                            {player.remainingActions}
                        </span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-red-400 uppercase">Blood</span>
                        <span className={`text-lg font-bold ${player.bloodPool.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                            {player.bloodPool.length}
                        </span>
                    </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] text-purple-400 uppercase">Circuit</span>
                        <span className={`text-lg font-bold ${player.bloodCircuit.length > 0 ? 'text-purple-300' : 'text-gray-500'}`}>
                            {player.bloodCircuit.length}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* モーダル群 */}
        {selectedRegalia && (
            <RegaliaModal 
                regalia={selectedRegalia}
                player={player}
                isCurrentUser={isCurrentUser}
                onClose={() => setSelectedRegalia(null)}
                onSelfHarm={handleConfirmSelfHarm}
            />
        )}

        {showCraftModal && (
             <CraftModal 
                player={player}
                onClose={() => setShowCraftModal(false)}
                onCraft={onCraft}
             />
        )}

        {showDiscardModal && (
            <CardListModal 
                title="Discard Pile"
                cards={player.discard}
                colorTheme="gray"
                onClose={() => setShowDiscardModal(false)}
            />
        )}

        {showCircuitModal && (
            <CardListModal 
                title="Blood Circuit"
                cards={player.bloodCircuit}
                colorTheme="purple"
                onClose={() => setShowCircuitModal(false)}
            />
        )}

        {showDeckModal && !isOpponent && (
            <DeckListModal 
                title="Remaining Deck"
                cards={player.deck}
                onClose={() => setShowDeckModal(false)}
            />
        )}
    </div>
  );
};