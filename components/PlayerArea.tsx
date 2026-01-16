import React, { useState } from 'react';
import { PlayerState, RegaliaCard, Phase, Card as CardType } from '../types';
import { Card } from './Card';
import { Zone } from './Zone';
import { CRAFT_RECIPES } from '../constants/index';
import { RegaliaModal, CraftModal, CardListModal, DeckListModal, CardDetailModal } from './GameModals';
import { PlayEffect } from './PlayEffect';

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

/**
 * プレイヤーエリアコンポーネント
 */
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
  
  // フィールドカード詳細表示用
  const [viewingCard, setViewingCard] = useState<CardType | null>(null);

  // 神器クリック時の処理
  const handleRegaliaClick = () => {
      if (player.regalia) {
          setSelectedRegalia(player.regalia);
      }
  };

  // 自傷アクションの確定処理
  const handleConfirmSelfHarm = () => {
      onSelfHarm();
      setSelectedRegalia(null);
  };

  const totalCards = player.deck.length + player.hand.length + player.discard.length + player.field.length + player.bloodPool.length + player.bloodCircuit.length;
  const canCraft = CRAFT_RECIPES.some(r => r.inputMatcher(player.hand) !== null) && player.remainingActions > 0;

  // -- ゾーン定義 --

  // 1. 神器・必殺技ゾーン (左端)
  const IdentityZone = (
      <div className="w-20 md:w-28 flex flex-col gap-1 p-1 shrink-0 z-10 justify-center bg-black/20 border-r border-red-900/30">
          <Zone 
            title="神器" 
            className={`
                flex items-center justify-center bg-transparent border-none
                ${isOpponent ? 'h-full md:h-1/2' : 'h-1/2'}
            `}
          >
             {player.regalia && (
                <div className={`transition-transform duration-500 ${player.regalia.isTapped ? 'rotate-90 opacity-75' : ''}`}>
                    <Card 
                        card={player.regalia} 
                        size="md" 
                        onClick={handleRegaliaClick} 
                        isAwakened={player.isRegaliaAwakened}
                        className="scale-75 origin-center"
                    />
                     {isCurrentUser && !player.regalia.isTapped && (
                        <div className="text-[10px] text-red-400 text-center mt-1 cursor-pointer hover:underline" onClick={handleRegaliaClick}>
                            確認 / 自傷
                        </div>
                    )}
                </div>
             )}
          </Zone>
          
          <div className={`${isOpponent ? 'hidden md:block' : 'block'} h-1/2 w-full flex items-center justify-center`}>
                {player.bloodRecall ? (
                    isOpponent ? (
                        <div className="w-16 h-24 bg-red-950 border-2 border-red-800 rounded flex items-center justify-center shadow-lg">
                            <span className="text-red-500 font-cinzel text-xs">Secret</span>
                        </div>
                    ) : (
                        <div className="relative group scale-90">
                            <div className={`w-16 md:w-20 h-24 md:h-28 border-2 rounded flex flex-col p-1 shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform ${player.isRegaliaAwakened ? 'bg-red-900 border-red-500' : 'bg-gray-900 border-gray-700 opacity-80'}`}>
                                <div className="text-[8px] text-red-200 font-bold border-b border-red-500/50 text-center truncate">{player.bloodRecall.name}</div>
                                <div className="flex-1 text-[8px] text-gray-200 p-1 flex items-center justify-center leading-tight overflow-hidden text-center">
                                    {player.bloodRecall.description.substring(0, 30)}...
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-red-300">
                                    <span>Cost:{player.bloodRecall.cost}</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                {player.bloodCircuit.length >= player.bloodRecall.cost ? (
                                    <button onClick={onActivateBloodRecall} className="bg-red-600 hover:bg-red-500 text-white text-[10px] px-1 py-1 rounded font-bold">発動</button>
                                ) : (
                                    <span className="text-[10px] text-gray-500">不足</span>
                                )}
                            </div>
                        </div>
                    )
                ) : <div className="w-16 h-24 border border-dashed border-red-900/50 rounded"></div>}
          </div>
      </div>
  );

  // 2. リソースステータス列 (神器の右横)
  const ResourceColumn = (
      <div className="w-14 md:w-20 flex flex-col gap-1 py-1 items-center bg-black/40 border-r border-red-900/30 z-20 shrink-0 text-center justify-start overflow-hidden">
          
          {/* CRAFT Button (Player Only) - 上部に配置 */}
          {isCurrentUser && (
              <button 
                onClick={() => setShowCraftModal(true)}
                disabled={player.remainingActions <= 0}
                className={`
                    flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border shadow-lg transition-all mb-1 mt-1 relative shrink-0 z-30
                    ${player.remainingActions > 0 
                        ? 'bg-purple-900 hover:bg-purple-700 border-purple-500 text-white hover:scale-110' 
                        : 'bg-gray-900 border-gray-700 text-gray-600 cursor-not-allowed'}
                `}
                title="Craft"
              >
                  <span className="text-base md:text-xl">✦</span>
                  <span className="text-[7px] md:text-[8px] font-bold leading-none">CRAFT</span>
                  {canCraft && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  )}
              </button>
          )}

          <div className="flex flex-col gap-1 w-full px-0.5 overflow-y-auto custom-scrollbar pb-2">
              {/* ACT */}
              <div className="flex flex-col items-center bg-purple-900/10 rounded pb-0.5 shrink-0">
                  <span className="text-[8px] text-purple-400 font-bold uppercase tracking-tighter scale-90">ACT</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.remainingActions > 0 ? 'text-white' : 'text-gray-600'}`}>
                      {player.remainingActions}
                  </span>
              </div>

              {/* BLOOD */}
              <div className="flex flex-col items-center bg-red-900/10 rounded pb-0.5 shrink-0">
                  <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter scale-90">BLOOD</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.bloodPool.length > 0 ? 'text-red-200' : 'text-gray-600'}`}>
                      {player.bloodPool.length}
                  </span>
              </div>

              {/* CIRCUIT */}
              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={() => setShowCircuitModal(true)}
              >
                  <span className="text-[8px] text-purple-400 font-bold uppercase tracking-tighter underline decoration-purple-500/30 scale-90">CIRC</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.bloodCircuit.length > 0 ? 'text-purple-200' : 'text-gray-600'}`}>
                      {player.bloodCircuit.length}
                  </span>
              </div>

              {/* DECK */}
              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={() => !isOpponent && setShowDeckModal(true)}
              >
                  <span className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter underline decoration-blue-500/30 scale-90">DECK</span>
                  <span className="text-sm font-cinzel font-bold text-gray-300 leading-none">
                      {player.deck.length}
                  </span>
              </div>

              {/* TRASH */}
              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={() => setShowDiscardModal(true)}
              >
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter underline decoration-gray-500/30 scale-90">TRASH</span>
                  <span className="text-sm font-cinzel font-bold text-gray-400 leading-none">
                      {player.discard.length}
                  </span>
              </div>
          </div>
      </div>
  );

  // 3. メインアクションゾーン（フィールド、Life/Atk表示）
  const MainActionZone = (
      <div className="flex-1 flex flex-col p-1 gap-1 min-w-0 h-full relative">
          
          {/* フィールド */}
          <div className={`flex-1 flex flex-col min-h-0 relative ${isOpponent ? 'order-2' : 'order-1'}`}>
               <Zone title={isOpponent ? "相手の場" : "自分の場"} className="flex-1 bg-black/20 flex items-center justify-center border-red-500/20 overflow-hidden !p-1 relative">
                    {/* Life & Atk Overlay (右上) */}
                    <div className="absolute top-1 right-1 z-20 flex flex-col items-end pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-sm border border-red-500/20 rounded p-1.5 flex flex-col gap-1 shadow-lg">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] text-red-500 font-bold tracking-wider">LIFE</span>
                                <span className="text-xl font-cinzel font-bold text-red-100 leading-none">{player.life}</span>
                            </div>
                            <div className="w-full h-px bg-white/10"></div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-[10px] text-yellow-500 font-bold tracking-wider">ATK</span>
                                <span className="text-xl font-cinzel font-bold text-yellow-100 leading-none">{player.attackTotal}</span>
                            </div>
                        </div>
                    </div>

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
                            const animClass = phase === Phase.BloodBattle ? 'animate-shake' : 'animate-play-card';

                            return (
                                <div key={c.id} className="transition-all duration-300 relative transform" style={{ ...marginStyle, zIndex: i }}>
                                    <Card 
                                        card={c} 
                                        size="md" 
                                        className={`${animClass} scale-75 md:scale-90 origin-bottom`}
                                        onClick={() => setViewingCard(c)}
                                    />
                                    {phase === Phase.Main && (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <PlayEffect type={c.type} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
               </Zone>
          </div>

          {/* 下半分: ブラッドプール & 血廻のカード表示（カード置き場としての機能維持） */}
          <div className={`h-24 hidden md:flex gap-2 ${isOpponent ? 'order-1' : 'order-2'}`}>
              <div className="flex-1">
                  <Zone title="プール (Cards)" className="h-full bg-red-950/10 border-red-900/30 flex items-center justify-start overflow-hidden">
                      <div className="flex -space-x-8 px-4 overflow-x-auto w-full custom-scrollbar py-2 items-center">
                          {player.bloodPool.map(c => (
                              <Card key={c.id} card={c} size="sm" className="scale-75 origin-left" />
                          ))}
                      </div>
                  </Zone>
              </div>
          </div>
      </div>
  );

  // 4. 手札オーバーレイ (inline-flex, max-w-fitで余分な広がりをカット)
  const HandOverlay = (
      <div className={`
        absolute left-0 right-0 flex justify-center z-50 pointer-events-none 
        ${isOpponent ? (window.innerWidth < 768 ? 'hidden md:flex -top-12' : '-top-12') : '-bottom-12'}
      `}>
           <div className={`
                inline-flex max-w-full gap-1 p-2 rounded-xl transition-transform duration-300 pointer-events-auto
                ${isOpponent 
                    ? 'scale-75 hidden md:flex' 
                    : 'hover:-translate-y-12 bg-black/60 backdrop-blur-sm border border-red-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)] translate-y-4'}
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
                            className="animate-draw scale-75 md:scale-90 origin-bottom hover:scale-100 hover:z-10 transition-transform"
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))
                )}
           </div>
      </div>
  );

  return (
    <div className={`relative w-full h-full flex ${isOpponent ? 'flex-col-reverse' : 'flex-col'}`}>
        <div className="flex-1 flex w-full justify-start min-h-0 bg-black/10">
            {IdentityZone}
            {ResourceColumn}
            {MainActionZone}
        </div>

        {HandOverlay}

        {/* プレイヤー名表示 (シンプルに) */}
        <div className={`absolute right-4 ${isOpponent ? 'top-2' : 'bottom-20 md:bottom-2'} pointer-events-none z-0`}>
             <div className="text-4xl md:text-6xl font-cinzel font-bold text-white/5 select-none">
                {isOpponent ? 'OPPONENT' : 'PLAYER'}
            </div>
        </div>

        {/* 各種モーダル */}
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
                title="捨て札"
                cards={player.discard}
                colorTheme="gray"
                onClose={() => setShowDiscardModal(false)}
            />
        )}

        {showCircuitModal && (
            <CardListModal 
                title="血廻 (Blood Circuit)"
                cards={player.bloodCircuit}
                colorTheme="purple"
                onClose={() => setShowCircuitModal(false)}
            />
        )}

        {showDeckModal && !isOpponent && (
            <DeckListModal 
                title="山札 (残り)"
                cards={player.deck}
                onClose={() => setShowDeckModal(false)}
            />
        )}

        {viewingCard && (
            <CardDetailModal 
                card={viewingCard}
                onClose={() => setViewingCard(null)}
            />
        )}
    </div>
  );
};
