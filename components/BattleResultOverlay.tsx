
import React, { useEffect, useState } from 'react';
import { BattleResult } from '../types';

interface BattleResultOverlayProps {
  result: BattleResult;
  onComplete: () => void;
}

export const BattleResultOverlay: React.FC<BattleResultOverlayProps> = ({ result, onComplete }) => {
  const [stage, setStage] = useState<'intro' | 'clash' | 'result'>('intro');

  useEffect(() => {
    // Stage 1: Intro (VS) -> 0.5s
    const t1 = setTimeout(() => setStage('clash'), 800);
    // Stage 2: Clash (Damage calculation) -> 1.5s
    const t2 = setTimeout(() => setStage('result'), 2500);
    // Complete -> total 4.5s
    const t3 = setTimeout(onComplete, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const p1Win = result.winnerId === 'p1';
  const draw = result.winnerId === null;
  const p1Color = "text-red-500";
  const p2Color = "text-blue-500";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto" onClick={onComplete}>
      <div className="relative w-full max-w-4xl h-64 flex items-center justify-center overflow-hidden cursor-pointer">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-blue-900/20" />
        
        {/* --- ATK Comparison --- */}
        <div className={`absolute left-4 md:left-20 flex flex-col items-center transition-all duration-700 ${stage !== 'intro' ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="text-sm md:text-xl font-bold text-red-300 mb-2 uppercase tracking-widest">Player</div>
            <div className="text-6xl md:text-8xl font-cinzel font-bold text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                {result.p1Atk}
            </div>
            <div className="text-xs text-red-400 mt-1">ATK</div>
        </div>

        <div className={`absolute right-4 md:right-20 flex flex-col items-center transition-all duration-700 ${stage !== 'intro' ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="text-sm md:text-xl font-bold text-blue-300 mb-2 uppercase tracking-widest">CPU</div>
            <div className="text-6xl md:text-8xl font-cinzel font-bold text-blue-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                {result.p2Atk}
            </div>
            <div className="text-xs text-blue-400 mt-1">ATK</div>
        </div>

        {/* --- Center Display --- */}
        <div className="flex flex-col items-center z-10 relative">
            
            {/* VS (Intro) */}
            {stage === 'intro' && (
                <div className="text-6xl font-cinzel font-bold text-white italic animate-pulse scale-150">
                    VS
                </div>
            )}

            {/* Clash / Result */}
            {(stage === 'clash' || stage === 'result') && (
                <div className="flex flex-col items-center animate-fade-in-up">
                    <div className="text-4xl md:text-6xl font-cinzel font-bold mb-4 tracking-wider">
                        {draw ? (
                            <span className="text-gray-400">DRAW</span>
                        ) : (
                            <span className={p1Win ? p1Color : p2Color}>
                                {p1Win ? "WINNER: PLAYER" : "WINNER: CPU"}
                            </span>
                        )}
                    </div>
                    
                    {!draw && stage === 'result' && (
                        <div className="bg-black/80 border border-white/20 px-8 py-4 rounded-lg shadow-2xl animate-bounce-in">
                            <div className="text-gray-400 text-sm uppercase tracking-widest mb-1 text-center">Damage Dealt</div>
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-bold text-white">{result.damage}</span>
                                <span className="text-xl text-red-500">dmg</span>
                                <span className="text-2xl text-gray-500">➔</span>
                                <span className={`text-2xl font-bold ${p1Win ? 'text-blue-400' : 'text-red-400'}`}>
                                    {p1Win ? "CPU" : "PLAYER"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* Click to skip hint */}
        <div className="absolute bottom-4 text-xs text-gray-500 animate-pulse">
            Click to continue
        </div>

      </div>
    </div>
  );
};
