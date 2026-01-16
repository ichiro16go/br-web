import React from 'react';
import { PlayerState, Phase } from '../../types';
import { Card } from '../Card';
import { Zone } from '../Zone';

interface IdentitySectionProps {
  player: PlayerState;
  isCurrentUser: boolean;
  isOpponent: boolean;
  phase: Phase;
  onRegaliaClick: () => void;
  onActivateBloodRecall: () => void;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  player,
  isCurrentUser,
  isOpponent,
  phase,
  onRegaliaClick,
  onActivateBloodRecall
}) => {
  // ブラッドリコール発動可能チェック
  // 1. 必殺技を持っている
  // 2. コスト(血廻枚数)が足りている
  // 3. 自分のターン(Mainフェイズ)である ※厳密なTimingチェックはEngine側だが、通知としてはこれで十分
  const canActivateRecall = isCurrentUser && 
                            player.bloodRecall && 
                            player.bloodCircuit.length >= player.bloodRecall.cost &&
                            phase === Phase.Main;

  return (
      <div className="w-20 md:w-28 flex flex-col gap-1 p-1 shrink-0 z-10 justify-center bg-black/20 border-r border-red-900/30">
          <Zone 
            title="神器" 
            className="bg-transparent border-none h-full"
            contentClassName="flex items-center justify-center h-full"
          >
             {player.regalia && (
                <div className={`transition-transform duration-500 relative ${player.regalia.isTapped ? 'rotate-90 opacity-75' : ''}`}>
                    <Card 
                        card={player.regalia} 
                        size="md" 
                        onClick={onRegaliaClick} 
                        isAwakened={player.isRegaliaAwakened}
                        className="scale-75 origin-center"
                    />
                    
                     {/* 既存のガイドテキスト */}
                     {isCurrentUser && !player.regalia.isTapped && (
                        <div className="text-[10px] text-red-400 text-center mt-1 cursor-pointer hover:underline" onClick={onRegaliaClick}>
                            詳細 / Action
                        </div>
                    )}

                    {/* ブラッドリコール発動可能通知 (緑色の丸) */}
                    {canActivateRecall && !player.regalia.isTapped && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping pointer-events-none border border-white z-20"></span>
                    )}
                    {canActivateRecall && !player.regalia.isTapped && (
                         <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full pointer-events-none border border-white z-20 flex items-center justify-center text-[8px] font-bold text-black">!</span>
                    )}
                </div>
             )}
          </Zone>
      </div>
  );
};
