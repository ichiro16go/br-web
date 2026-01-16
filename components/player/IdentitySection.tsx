import React from 'react';
import { PlayerState } from '../../types';
import { Card } from '../Card';
import { Zone } from '../Zone';

interface IdentitySectionProps {
  player: PlayerState;
  isCurrentUser: boolean;
  isOpponent: boolean;
  onRegaliaClick: () => void;
  onActivateBloodRecall: () => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  player,
  isCurrentUser,
  isOpponent,
  onRegaliaClick,
  onActivateBloodRecall
}) => {
  return (
      <div className="w-20 md:w-28 flex flex-col gap-1 p-1 shrink-0 z-10 justify-center bg-black/20 border-r border-red-900/30">
          <Zone 
            title="神器" 
            className={`
                bg-transparent border-none
                ${isOpponent ? 'h-full md:h-1/2' : 'h-1/2'}
            `}
            contentClassName="flex items-center justify-center"
          >
             {player.regalia && (
                <div className={`transition-transform duration-500 ${player.regalia.isTapped ? 'rotate-90 opacity-75' : ''}`}>
                    <Card 
                        card={player.regalia} 
                        size="md" 
                        onClick={onRegaliaClick} 
                        isAwakened={player.isRegaliaAwakened}
                        className="scale-75 origin-center"
                    />
                     {isCurrentUser && !player.regalia.isTapped && (
                        <div className="text-[10px] text-red-400 text-center mt-1 cursor-pointer hover:underline" onClick={onRegaliaClick}>
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
};
