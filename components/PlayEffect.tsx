import React from 'react';
import { CardType } from '../types';

interface PlayEffectProps {
    type: CardType;
}

export const PlayEffect: React.FC<PlayEffectProps> = ({ type }) => {
    // Slash Effect: A flash of white light
    if (type === CardType.Slash) {
        return (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded z-10">
                 <div className="w-[150%] h-[2px] bg-white shadow-[0_0_15px_white] rotate-45 transform animate-pulse opacity-90" />
            </div>
        );
    }

    // Blood Effect: A red pulse
    if (type === CardType.Blood) {
        return (
             <div className="absolute inset-0 pointer-events-none rounded overflow-hidden z-10">
                <div className="absolute inset-0 bg-red-600/30 animate-pulse" />
             </div>
        );
    }
    
    // Default Effect: Subtle highlight
    return (
        <div className="absolute inset-0 pointer-events-none rounded bg-white/10 animate-pulse z-10" />
    );
};
