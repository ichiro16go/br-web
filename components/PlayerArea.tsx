import React, { useState } from 'react';
import { PlayerState, Card as CardType, RegaliaCard } from '../types';
import { Card } from './Card';
import { Zone } from './Zone';
import { CRAFT_RECIPES } from '../constants';

interface PlayerAreaProps {
  player: PlayerState;
  isCurrentUser: boolean;
  onPlayCard: (cardId: string) => void;
  onSelfHarm: () => void;
  onCraft: (recipeId: string, paymentCardIds: string[]) => void;
  onActivateBloodRecall: () => void;
  isOpponent?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
    player, 
    isCurrentUser, 
    onPlayCard, 
    onSelfHarm, 
    onCraft,
    onActivateBloodRecall,
    isOpponent = false 
}) => {
  const [selectedRegalia, setSelectedRegalia] = useState<RegaliaCard | null>(null);
  const [showCraftModal, setShowCraftModal] = useState(false);

  const handleRegaliaClick = () => {
      if (player.regalia) {
          setSelectedRegalia(player.regalia);
      }
  };

  const handleConfirmSelfHarm = () => {
      onSelfHarm();
      setSelectedRegalia(null);
  };
  
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
                         <div className="w-24 h-36 bg-red-900 border-2 border-red-500 rounded flex flex-col p-1 shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
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
                             {player.bloodPool.length >= player.bloodRecall.cost ? (
                                 <button 
                                    onClick={onActivateBloodRecall}
                                    className="bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded font-bold"
                                 >
                                     ACTIVATE
                                 </button>
                             ) : (
                                 <span className="text-xs text-gray-500">Not enough Blood</span>
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

  // 2. ライフゾーン（中央左）
  const LifeZone = (
      <div className="w-48 flex flex-col p-1">
          <Zone title="Life Area" count={player.life} className="h-full bg-transparent border-none">
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <div className="flex -space-x-10 mb-4 z-10">
                      {player.lifeCards.slice(0, 10).map((c, i) => (
                           <div key={c.id} className="transform rotate-90 origin-center hover:z-20 transition-all">
                                <Card card={c} size="xs" isFaceDown={true} />
                           </div>
                      ))}
                      {player.lifeCards.length < 10 && Array(10 - player.lifeCards.length).fill(0).map((_,i) => (
                          <div key={i} className="w-8 h-12 border border-dashed border-red-900/30"></div>
                      ))}
                  </div>
                  
                  <div className="flex flex-col -space-y-12 z-0">
                      {player.lifeCards.slice(10).map((c, i) => (
                          <Card key={c.id} card={c} size="xs" isFaceDown={true} />
                      ))}
                  </div>
              </div>
          </Zone>
      </div>
  );

  // 3. メインアクションゾーン（中央）
  const MainActionZone = (
      <div className="flex-1 flex flex-col p-1 gap-1 w-full max-w-7/8 mx-auto">
          {/* 上半分: フィールド */}
          <div className={`flex-1 flex flex-col ${isOpponent ? 'order-2' : 'order-1'}`}>
               <Zone title={isOpponent ? "Opponent Field" : "Your Field"} className="flex-1 bg-black/20 flex items-center justify-center border-red-500/20 overflow-hidden">
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
                            return (
                                <div key={c.id} className="transition-all duration-300 relative transform" style={{ ...marginStyle, zIndex: i }}>
                                    <Card card={c} size="md" />
                                </div>
                            );
                        })}
                    </div>
               </Zone>
          </div>

          {/* 下半分: ブラッドプール */}
          <div className={`h-28 ${isOpponent ? 'order-1' : 'order-2'}`}>
              <Zone title="Blood Pool" count={player.bloodPool.length} className="h-full bg-red-950/10 border-red-900/30 flex items-center justify-start">
                  <div className="flex -space-x-8 px-4 overflow-x-auto w-full custom-scrollbar py-2 items-center">
                      {player.bloodPool.map(c => (
                          <Card key={c.id} card={c} size="sm" isFaceDown={true} />
                      ))}
                  </div>
              </Zone>
          </div>
      </div>
  );

  // 4. ライブラリゾーン（右端）
  const LibraryZone = (
      <div className="w-24 md:w-32 flex flex-col gap-2 p-1">
          <Zone title="Discard" count={player.discard.length} className="h-1/2 flex items-center justify-center bg-black/40">
              {player.discard.length > 0 ? (
                  <Card card={player.discard[player.discard.length - 1]} size="sm" />
              ) : (
                  <div className="text-xs text-gray-600">Empty</div>
              )}
          </Zone>
          <Zone title="Deck" count={player.deck.length} className="h-1/2 flex items-center justify-center bg-black/40">
               {player.deck.length > 0 ? (
                   <div className="w-16 h-24 bg-red-900 rounded border-2 border-red-700 shadow-md"></div>
               ) : (
                   <div className="text-xs text-gray-600">0</div>
               )}
          </Zone>
      </div>
  );

  // 5. 手札オーバーレイ
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
                    player.hand.map(c => (
                        <Card key={c.id} card={c} size="lg" onClick={() => onPlayCard(c.id)} />
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

  const sortedRecipes = [...CRAFT_RECIPES].sort((a, b) => {
      const aMatch = a.inputMatcher(player.hand) !== null;
      const bMatch = b.inputMatcher(player.hand) !== null;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
  });

  return (
    <div className={`relative w-full h-full flex ${isOpponent ? 'flex-col-reverse' : 'flex-col'}`}>
        <div className="flex-1 flex w-full justify-center">
            {IdentityZone}
            {LifeZone}
            {MainActionZone}
            {LibraryZone}
        </div>

        {HandOverlay}
        {CraftButton}

        {/* スタッツ (ATK, Actions, Blood) */}
        <div className={`absolute right-4 ${isOpponent ? 'top-4' : 'bottom-44'} pointer-events-none flex flex-col items-end gap-1`}>
            <div className="text-4xl font-cinzel font-bold text-white/10 drop-shadow-md">
                {isOpponent ? 'OPPONENT' : 'PLAYER'}
            </div>
            
            <div className="flex flex-col items-end bg-black/60 p-2 rounded border border-red-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500 uppercase font-bold">ATK</span>
                    <span className="text-2xl font-bold text-yellow-500 drop-shadow-md">{player.attackTotal}</span>
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
                </div>
            </div>
        </div>

        {/* 神器詳細モーダル */}
        {selectedRegalia && (
            <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedRegalia(null)}>
                <div className="bg-gray-900 border-2 border-red-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={() => setSelectedRegalia(null)}>✕</button>
                    <h3 className="text-2xl font-cinzel text-red-500 mb-4 border-b border-red-900 pb-2 flex justify-between items-end">
                        <span>{selectedRegalia.name}</span>
                        <span className="text-sm text-gray-500 font-sans">Year: {selectedRegalia.year}</span>
                    </h3>
                    <div className="space-y-4 mb-6">
                        <p className="text-gray-300 italic">{selectedRegalia.description}</p>
                        <div className="grid grid-cols-3 gap-2 text-center bg-black/40 p-3 rounded">
                             <div>
                                 <div className="text-xs text-gray-500 uppercase">Hand</div>
                                 <div className="text-xl font-bold text-blue-400">{selectedRegalia.handSize}</div>
                             </div>
                             <div>
                                 <div className="text-xs text-gray-500 uppercase">Self Harm</div>
                                 <div className="text-xl font-bold text-red-400">{selectedRegalia.selfHarmCost}</div>
                             </div>
                             <div>
                                 <div className="text-xs text-gray-500 uppercase">Action</div>
                                 <div className="text-xl font-bold text-purple-400">{selectedRegalia.bloodPact}</div>
                             </div>
                        </div>
                        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded">
                            <h4 className="text-red-400 font-bold mb-2 text-sm uppercase">自傷効果 (Self Harm Effect)</h4>
                            <p className="text-sm text-gray-200">{selectedRegalia.selfHarmEffectDesc}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800" onClick={() => setSelectedRegalia(null)}>閉じる</button>
                        {isCurrentUser && !player.regalia?.isTapped && (
                            <button 
                                className={`px-6 py-2 rounded font-bold shadow-lg flex flex-col items-center ${player.lifeCards.length >= selectedRegalia.selfHarmCost ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                                onClick={handleConfirmSelfHarm}
                                disabled={player.lifeCards.length < selectedRegalia.selfHarmCost}
                            >
                                <span>自傷して効果発動</span>
                                {player.lifeCards.length < selectedRegalia.selfHarmCost && <span className="text-[10px] font-normal">(ライフ不足)</span>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* 強化（Craft）モーダル */}
        {showCraftModal && (
             <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCraftModal(false)}>
                <div className="bg-gray-900 border-2 border-purple-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar pb-32" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={() => setShowCraftModal(false)}>✕</button>
                    <h3 className="text-2xl font-cinzel text-purple-400 mb-6 border-b border-purple-900 pb-2 flex justify-between items-center">
                        <span>Arts Enhancement</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-sans">Remaining Acts:</span>
                            <span className={`text-lg font-bold ${player.remainingActions > 0 ? 'text-white' : 'text-red-500'}`}>{player.remainingActions}</span>
                        </div>
                    </h3>
                    
                    <div className="space-y-4">
                        {sortedRecipes.map(recipe => {
                            const matchIds = recipe.inputMatcher(player.hand);
                            const hasAction = player.remainingActions > 0;
                            const canCraft = matchIds !== null && hasAction;
                            const resultPreview = recipe.createResult();
                            const isSpecial = recipe.id === 'craft-sakura'; 

                            return (
                                <div key={recipe.id} className={`
                                    p-4 rounded border flex gap-4 items-center transition-colors
                                    ${canCraft 
                                        ? (isSpecial ? 'bg-pink-900/20 border-pink-500' : 'bg-purple-900/20 border-purple-500') 
                                        : 'bg-gray-800/50 border-gray-700 opacity-60'}
                                `}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold text-lg ${isSpecial ? 'text-pink-300' : 'text-gray-200'}`}>
                                                {recipe.name}
                                            </span>
                                            {canCraft && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">READY</span>}
                                            {!hasAction && matchIds !== null && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">NO ACT</span>}
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{recipe.description}</p>
                                        <div className={`text-xs ${isSpecial ? 'text-pink-400' : 'text-purple-300'}`}>
                                            Result: {resultPreview.name} {resultPreview.level > 0 && `(Lv.${resultPreview.level})`}
                                        </div>
                                    </div>
                                    <div>
                                        <button 
                                            onClick={() => {
                                                if (canCraft && matchIds) {
                                                    onCraft(recipe.id, matchIds);
                                                    setShowCraftModal(false);
                                                }
                                            }}
                                            disabled={!canCraft}
                                            className={`px-4 py-2 rounded font-bold shadow-lg min-w-[100px] ${
                                                canCraft 
                                                ? (isSpecial ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white')
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Craft
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};