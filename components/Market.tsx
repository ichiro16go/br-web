import React from 'react';
import { Card as CardType } from '../types';
import { Card } from './Card';

interface MarketProps {
  recallPiles: CardType[][]; // 山札の配列に変更
  onRecall: (pileIndex: number) => void;
  canRecall: boolean;
  playerPoolCount: number;
}

export const Market: React.FC<MarketProps> = ({ recallPiles, onRecall, canRecall, playerPoolCount }) => {
  return (
    <div className="flex flex-col h-full bg-black/50 p-2 overflow-y-auto custom-scrollbar">
      <h3 className="text-red-400 font-cinzel text-xs lg:text-sm mb-4 text-center border-b border-red-900/30 pb-2">
        Covenant Area
      </h3>
      <div className="flex flex-col gap-4 lg:gap-6 items-center pb-4">
        {recallPiles.map((pile, index) => {
            if (pile.length === 0) {
                 return (
                     <div key={index} className="w-16 h-24 lg:w-24 lg:h-36 border border-dashed border-gray-700 rounded flex items-center justify-center">
                         <span className="text-gray-600 text-[10px] lg:text-xs">Empty</span>
                     </div>
                 );
            }
            
            const card = pile[pile.length - 1]; // 一番上のカード
            const affordable = playerPoolCount >= card.cost;
            const remaining = pile.length;

            return (
                <div key={index} className="relative group w-full flex justify-center flex-col items-center">
                    {/* 山札の厚みを表現 */}
                    <div className="relative transform scale-90 lg:scale-100 origin-center">
                        {remaining > 1 && (
                            <div className="absolute top-1 left-1 w-full h-full bg-gray-800 rounded border border-gray-700 z-0"></div>
                        )}
                        {remaining > 2 && (
                            <div className="absolute top-2 left-2 w-full h-full bg-gray-800 rounded border border-gray-700 z-0"></div>
                        )}
                        
                        <div className="relative z-10">
                            <Card card={card} size="lg" />
                            {canRecall && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <div className="text-red-400 font-bold mb-1 text-xs">Cost: {card.cost}</div>
                                    {affordable ? (
                                        <button 
                                            onClick={() => onRecall(index)}
                                            className="bg-red-600 hover:bg-red-500 text-white text-[10px] px-3 py-1 rounded uppercase tracking-wider font-bold"
                                        >
                                            Recall
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 text-[10px]">Not enough blood</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-1 text-[10px] text-gray-500 bg-black/40 px-2 rounded-full border border-gray-800 scale-75 lg:scale-100 origin-center">
                        Remaining: {remaining}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
