import React from 'react';
import { PlayerState, Phase, Card as CardType } from '../../types';
import { Card } from '../Card';
import { Zone } from '../Zone';
import { PlayEffect } from '../PlayEffect';

interface FieldSectionProps {
    player: PlayerState;
    isOpponent: boolean;
    phase: Phase;
    setViewingCard: (card: CardType) => void;
}

export const FieldSection: React.FC<FieldSectionProps> = ({ player, isOpponent, phase, setViewingCard }) => {
    // フィールドのカードを行ごとに分割（6枚区切り）
    const fieldRows: CardType[][] = [];
    for (let i = 0; i < player.field.length; i += 6) {
        fieldRows.push(player.field.slice(i, i + 6));
    }
    if (fieldRows.length === 0) fieldRows.push([]);

    return (
        <div className="flex-1 flex flex-col p-1 gap-1 min-w-0 h-full relative">
            <div className={`flex-1 flex flex-col min-h-0 relative ${isOpponent ? 'order-2' : 'order-1'} max-w-9/10`}>
                 <Zone 
                      title={isOpponent ? "相手の場" : "自分の場"} 
                      className="flex-1 bg-black/20 border-red-500/20 overflow-hidden !p-1 relative"
                      contentClassName="w-full h-full relative"
                 >
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
  
                      <div className="flex flex-col items-center w-full h-full pt-6 md:pt-4">
                          {fieldRows.map((rowCards, rowIndex) => (
                              <div 
                                  key={rowIndex} 
                                  className="flex justify-center -space-x-6 md:-space-x-8 mb-[-4.5rem] md:mb-[-5.5rem] last:mb-0" 
                                  style={{ zIndex: rowIndex }}
                              >
                                  {rowCards.map((c, colIndex) => {
                                      const animClass = phase === Phase.BloodBattle ? 'animate-shake' : 'animate-play-card';
                                      return (
                                          <div key={c.id} className="transition-all duration-300 relative transform hover:z-20 hover:-translate-y-4 origin-top" style={{ zIndex: colIndex }}>
                                              <Card 
                                                  card={c} 
                                                  size="md" 
                                                  className={`${animClass} scale-75 md:scale-90 shadow-xl`}
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
                          ))}
                      </div>
                 </Zone>
            </div>
  
            <div className={`h-24 hidden lg:flex gap-2 ${isOpponent ? 'order-1' : 'order-2'}`}>
                <div className="flex-1">
                    <Zone title="プール (Cards)" className="h-full bg-red-950/10 border-red-900/30" contentClassName="flex items-center justify-start overflow-hidden">
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
};
