import React from 'react';

interface TurnNotificationProps {
  playerId: string;
  isVisible: boolean;
}

export const TurnNotification: React.FC<TurnNotificationProps> = ({ playerId, isVisible }) => {
  if (!isVisible) return null;

  const isPlayer = playerId === 'p1';
  const text = isPlayer ? "YOUR TURN" : "OPPONENT TURN";
  const subText = isPlayer ? "ACTION PHASE" : "PLEASE WAIT";
  
  // 色設定
  const mainColor = isPlayer ? "text-red-500" : "text-blue-500";
  const glowColor = isPlayer ? "drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]";
  const barColor = isPlayer ? "bg-gradient-to-r from-transparent via-red-900/80 to-transparent" : "bg-gradient-to-r from-transparent via-blue-900/80 to-transparent";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
      <div className={`w-full ${barColor} py-8 md:py-12 animate-turn-banner flex flex-col items-center justify-center`}>
          <h2 className={`text-5xl md:text-7xl font-cinzel font-bold tracking-widest ${mainColor} ${glowColor}`}>
            {text}
          </h2>
          <p className="text-white/80 font-cinzel text-sm md:text-xl tracking-[0.5em] mt-2 uppercase">
            {subText}
          </p>
      </div>
    </div>
  );
};
