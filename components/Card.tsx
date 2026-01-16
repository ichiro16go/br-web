import React from 'react';
import { Card as CardType, RegaliaCard, CardType as CType } from '../types';
import { getCardStyles } from '../utils/cardStyles';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'lg' | 'lg';
  isFaceDown?: boolean;
  // Regalia専用: 覚醒状態フラグ
  isAwakened?: boolean; 
  className?: string;
  style?: React.CSSProperties;
}

/**
 * カードコンポーネント
 * カードの種類に応じた見た目をレンダリングする
 */
export const Card: React.FC<CardProps> = ({ card, onClick, size = 'lg', isFaceDown = false, isAwakened = false, className = '', style }) => {
  const sizeClasses = {
    xs: 'w-10 h-14 text-[0.4rem]',
    sm: 'w-16 h-24 text-[0.5rem]',
    md: 'w-24 h-36 text-xs',
    lg: 'w-24 h-36 text-xs',
  };

  // ユーティリティからスタイルを取得
  const styles = getCardStyles(card);

  // 裏向き表示
  if (isFaceDown) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-red-900 border border-red-950 rounded shadow-sm flex items-center justify-center cursor-default ${className}`}
        style={style}
      >
        <div className="w-4 h-4 rounded-full border border-red-800 bg-red-950"></div>
      </div>
    );
  }

  // 神器(Regalia)の表示
  if (card.type === CType.Regalia) {
     const regalia = card as RegaliaCard;
     // 覚醒状態に応じたステータスを取得
     const stats = isAwakened ? regalia.awakened : regalia.base;

     return (
        <div 
        onClick={onClick}
        style={style}
        className={`
          ${sizeClasses[size]} 
          relative bg-gray-900 border-2 lg:border-4 ${isAwakened ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-red-800 shadow-lg'} 
          rounded flex flex-col overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer select-none text-gray-200
          ${card.isTapped ? 'opacity-50 grayscale' : ''}
          ${className}
        `}
      >
        {/* カード名 */}
        <div className={`bg-red-950 ${isAwakened ? 'text-red-300 animate-pulse' : 'text-red-100'} p-0.5 lg:p-1 font-bold truncate text-center leading-tight border-b border-red-900`}>
          {card.name}
        </div>

        {/* メインエリア */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-800">
             <div className={`text-red-900/20 font-cinzel text-4xl absolute transform -rotate-45 select-none ${isAwakened ? 'text-red-600/20' : ''}`}>
                 JINKI
             </div>
             
             {/* Stats表示 (Year, Dmg, Hand, Act) */}
             <div className="absolute top-1 left-1 flex flex-col items-center">
                 <span className="text-[0.4rem] text-gray-500 uppercase">Year</span>
                 <span className="text-xs font-cinzel text-gray-300 font-bold">{regalia.year}</span>
             </div>

             <div className="absolute top-1 right-1 flex flex-col items-center">
                 <span className="text-[0.4rem] text-red-500 uppercase">Dmg</span>
                 <div className="font-bold text-red-400 border border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {stats.selfHarmCost}
                 </div>
             </div>

             <div className="absolute bottom-1 left-1 flex flex-col items-center">
                 <div className="font-bold text-blue-300 border border-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {stats.handSize}
                 </div>
                 <span className="text-[0.4rem] text-blue-500 uppercase">Hand</span>
             </div>

             <div className="absolute bottom-1 right-1 flex flex-col items-center">
                 <div className="font-bold text-purple-300 border border-purple-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {stats.bloodPact}
                 </div>
                 <span className="text-[0.4rem] text-purple-500 uppercase">Act</span>
             </div>
        </div>

        {/* タイプ表示 */}
        <div className={`bg-gray-900 ${isAwakened ? 'text-red-500 font-bold' : 'text-red-700'} text-[0.4rem] text-center p-0.5 uppercase tracking-wider border-t border-red-900/30`}>
          {isAwakened ? 'AWAKENED' : card.type}
        </div>
      </div>
     )
  }

  // 通常カードの表示
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        ${sizeClasses[size]} 
        relative ${styles.outer} border-2 lg:border-4 rounded shadow-lg 
        flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl cursor-pointer select-none
        ${card.isTapped ? 'opacity-50 grayscale' : ''}
        ${className}
      `}
    >
      <div className={`${styles.header} p-0.5 lg:p-1 font-bold truncate text-center leading-tight`}>
        {card.name}
      </div>
      <div className={`flex-1 p-0.5 lg:p-1 flex flex-col items-center justify-center ${styles.inner} relative`}>
        <div className={`absolute top-1 right-1 font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[0.6rem] lg:text-xs border ${styles.badgeAtk}`}>
          {card.attack}
        </div>
        {card.cost > 0 && (
           <div className={`absolute top-1 left-1 font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center text-[0.6rem] lg:text-xs border ${styles.badgeCost}`}>
            {card.cost}
          </div>
        )}
        <div className={`text-center leading-tight px-0.5 overflow-hidden h-full flex items-center ${styles.text}`}>
            {size !== 'xs' && card.description}
        </div>
      </div>
      <div className={`${styles.typeTag} text-[0.4rem] text-center p-0.5 uppercase tracking-wider`}>
        {card.type}
      </div>
    </div>
  );
};