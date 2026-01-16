import React from 'react';
import { PlayerState } from '../../types';
import { Card } from '../Card';

interface HandSectionProps {
    player: PlayerState;
    isOpponent: boolean;
    onPlayCard: (cardId: string) => void;
}

export const HandSection: React.FC<HandSectionProps> = ({ player, isOpponent, onPlayCard }) => {
    return (
        <div className={`
          absolute left-0 right-0 flex justify-center z-50 pointer-events-none 
          ${isOpponent ?  'hidden lg:flex -top-5' :  '-bottom-12'}
        `}>
             <div className={`
                  inline-flex max-w-full gap-1 p-2 rounded-xl transition-transform duration-300 pointer-events-auto
                  ${isOpponent 
                      ? 'scale-75 hidden lg:flex' 
                      : 'hover:-translate-y-12 bg-black/60 backdrop-blur-sm border border-red-500/30 shadow-[0_0_20px_rgba(0,0,0,0.6)] translate-y-4'}
             `}>
                  {isOpponent ? (
                      player.hand.map((_, i) => (
                          <div key={i} className="w-16 h-24 bg-red-900 border border-red-800 rounded shadow-lg"></div>
                      ))
                  ) : (
                      player.hand.map((c, i) => (
                          <Card 
                              key={c.id} 
                              card={c} 
                              size="lg" 
                              onClick={() => onPlayCard(c.id)} 
                              className="animate-draw scale-75 lg:scale-90 origin-bottom hover:scale-100 hover:z-10 transition-transform"
                              style={{ animationDelay: `${i * 0.05}s` }}
                          />
                      ))
                  )}
             </div>
        </div>
    );
};
