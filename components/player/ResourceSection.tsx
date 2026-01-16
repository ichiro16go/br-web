import React from 'react';
import { PlayerState } from '../../types';
import { CRAFT_RECIPES } from '../../constants/index';

interface ResourceSectionProps {
    player: PlayerState;
    isCurrentUser: boolean;
    isOpponent: boolean;
    onCraftClick: () => void;
    onCircuitClick: () => void;
    onDeckClick: () => void;
    onDiscardClick: () => void;
}

export const ResourceSection: React.FC<ResourceSectionProps> = ({
    player,
    isCurrentUser,
    isOpponent,
    onCraftClick,
    onCircuitClick,
    onDeckClick,
    onDiscardClick
}) => {
  const canCraft = CRAFT_RECIPES.some(r => r.inputMatcher(player.hand) !== null) && player.remainingActions > 0;

  return (
      <div className="w-14 lg:w-20 flex flex-col gap-1 py-1 items-center bg-black/40 border-r border-red-900/30 z-20 shrink-0 text-center justify-start overflow-hidden">
          
          {isCurrentUser && (
              <button 
                onClick={onCraftClick}
                disabled={player.remainingActions <= 0}
                className={`
                    flex flex-col items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full border shadow-lg transition-all mb-1 mt-1 relative shrink-0 z-30
                    ${player.remainingActions > 0 
                        ? 'bg-purple-900 hover:bg-purple-700 border-purple-500 text-white hover:scale-110' 
                        : 'bg-gray-900 border-gray-700 text-gray-600 cursor-not-allowed'}
                `}
                title="Craft"
              >
                  <span className="text-base lg:text-xl">✦</span>
                  <span className="text-[7px] lg:text-[8px] font-bold leading-none">CRAFT</span>
                  {canCraft && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  )}
              </button>
          )}

          <div className="flex flex-col gap-1 w-full px-0.5 overflow-y-auto custom-scrollbar pb-2">
              <div className="flex flex-col items-center bg-purple-900/10 rounded pb-0.5 shrink-0">
                  <span className="text-[8px] text-purple-400 font-bold uppercase tracking-tighter scale-90">ACT</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.remainingActions > 0 ? 'text-white' : 'text-gray-600'}`}>
                      {player.remainingActions}
                  </span>
              </div>

              <div className="flex flex-col items-center bg-red-900/10 rounded pb-0.5 shrink-0">
                  <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter scale-90">BLOOD</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.bloodPool.length > 0 ? 'text-red-200' : 'text-gray-600'}`}>
                      {player.bloodPool.length}
                  </span>
              </div>

              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={onCircuitClick}
              >
                  <span className="text-[8px] text-purple-400 font-bold uppercase tracking-tighter underline decoration-purple-500/30 scale-90">CIRC</span>
                  <span className={`text-sm font-cinzel font-bold leading-none ${player.bloodCircuit.length > 0 ? 'text-purple-200' : 'text-gray-600'}`}>
                      {player.bloodCircuit.length}
                  </span>
              </div>

              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={() => !isOpponent && onDeckClick()}
              >
                  <span className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter underline decoration-blue-500/30 scale-90">DECK</span>
                  <span className="text-sm font-cinzel font-bold text-gray-300 leading-none">
                      {player.deck.length}
                  </span>
              </div>

              <div 
                className="flex flex-col items-center cursor-pointer hover:bg-white/10 rounded pb-0.5 transition-colors shrink-0"
                onClick={onDiscardClick}
              >
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter underline decoration-gray-500/30 scale-90">TRASH</span>
                  <span className="text-sm font-cinzel font-bold text-gray-400 leading-none">
                      {player.discard.length}
                  </span>
              </div>
          </div>
      </div>
  );
};
