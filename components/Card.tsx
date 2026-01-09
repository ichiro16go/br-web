import React from 'react';
import { Card as CardType, CardType as CType, RegaliaCard } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isFaceDown?: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, size = 'md', isFaceDown = false }) => {
  const sizeClasses = {
    xs: 'w-10 h-14 text-[0.4rem]',
    sm: 'w-16 h-24 text-[0.5rem]',
    md: 'w-24 h-36 text-xs',
    lg: 'w-32 h-48 text-sm',
  };

  // スタイル決定ロジック
  const getCardStyles = (c: CardType) => {
    // 1. 名前による特殊判定
    if (c.name.includes('桜流し')) {
      return {
        outer: 'bg-pink-200 border-pink-400',
        header: 'bg-pink-600 text-white',
        inner: 'bg-pink-50',
        text: 'text-pink-900',
        badgeAtk: 'text-pink-700 border-pink-300 bg-pink-100',
        badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
        typeTag: 'bg-pink-100 text-pink-800'
      };
    }
    if (c.name.includes('ラムダ')) {
      return {
        outer: 'bg-indigo-200 border-indigo-500',
        header: 'bg-indigo-800 text-white',
        inner: 'bg-indigo-50',
        text: 'text-indigo-900',
        badgeAtk: 'text-indigo-700 border-indigo-300 bg-indigo-100',
        badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
        typeTag: 'bg-indigo-100 text-indigo-800'
      };
    }
    if (c.name === '発狂') {
       return {
        outer: 'bg-purple-300 border-purple-800',
        header: 'bg-purple-900 text-white',
        inner: 'bg-purple-100',
        text: 'text-purple-900',
        badgeAtk: 'text-purple-700 border-purple-300 bg-purple-100',
        badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
        typeTag: 'bg-purple-200 text-purple-900'
      };
    }

    // 2. タイプによる判定
    switch (c.type) {
      case CType.Blood:
        return {
          outer: 'bg-red-200 border-red-800',
          header: 'bg-red-900 text-white',
          inner: 'bg-red-50',
          text: 'text-red-900',
          badgeAtk: 'text-red-700 border-red-300 bg-red-100',
          badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
          typeTag: 'bg-red-100 text-red-800'
        };
      case CType.Slash:
        return {
          outer: 'bg-slate-300 border-slate-500', // 白・銀イメージ
          header: 'bg-slate-700 text-white',
          inner: 'bg-white',
          text: 'text-slate-900',
          badgeAtk: 'text-slate-800 border-slate-300 bg-slate-100',
          badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
          typeTag: 'bg-slate-200 text-slate-700'
        };
      case CType.Calamity:
        return {
          outer: 'bg-purple-300 border-purple-800',
          header: 'bg-purple-900 text-white',
          inner: 'bg-purple-100',
          text: 'text-purple-900',
          badgeAtk: 'text-purple-700 border-purple-300 bg-purple-100',
          badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
          typeTag: 'bg-purple-200 text-purple-900'
        };
      case CType.Recall:
          // Recallの簡易色判定
          if (c.name.includes('緋')) return { // 赤
              outer: 'bg-red-200 border-red-700', header: 'bg-red-800 text-white', inner: 'bg-red-50', text: 'text-red-900',
              badgeAtk: 'text-red-700 border-red-300 bg-red-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-red-100 text-red-800'
          };
          if (c.name.includes('紫')) return { // 紫
              outer: 'bg-purple-200 border-purple-700', header: 'bg-purple-800 text-white', inner: 'bg-purple-50', text: 'text-purple-900',
              badgeAtk: 'text-purple-700 border-purple-300 bg-purple-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-purple-100 text-purple-800'
          };
          if (c.name.includes('灰')) return { // 灰
              outer: 'bg-gray-300 border-gray-600', header: 'bg-gray-700 text-white', inner: 'bg-gray-50', text: 'text-gray-900',
              badgeAtk: 'text-gray-800 border-gray-300 bg-gray-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-gray-200 text-gray-800'
          };
          if (c.name.includes('蒼')) return { // 青
              outer: 'bg-blue-200 border-blue-600', header: 'bg-blue-800 text-white', inner: 'bg-blue-50', text: 'text-blue-900',
              badgeAtk: 'text-blue-700 border-blue-300 bg-blue-100', badgeCost: 'text-red-700 border-red-200 bg-red-50', typeTag: 'bg-blue-100 text-blue-800'
          };
          if (c.name.includes('黒')) return { // 黒
              outer: 'bg-stone-400 border-black', header: 'bg-black text-white', inner: 'bg-stone-100', text: 'text-black',
              badgeAtk: 'text-black border-stone-400 bg-stone-200', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-stone-300 text-black'
          };
          if (c.name.includes('桜')) return { // 桜
               outer: 'bg-pink-200 border-pink-400', header: 'bg-pink-600 text-white', inner: 'bg-pink-50', text: 'text-pink-900',
               badgeAtk: 'text-pink-700 border-pink-300 bg-pink-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-pink-100 text-pink-800'
          };
          if (c.name.includes('藍')) return { // 藍
              outer: 'bg-indigo-200 border-indigo-600', header: 'bg-indigo-800 text-white', inner: 'bg-indigo-50', text: 'text-indigo-900',
              badgeAtk: 'text-indigo-700 border-indigo-300 bg-indigo-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-indigo-100 text-indigo-800'
          };
          
          // デフォルトRecall
          return {
            outer: 'bg-amber-100 border-amber-600',
            header: 'bg-amber-700 text-white',
            inner: 'bg-amber-50',
            text: 'text-amber-900',
            badgeAtk: 'text-amber-800 border-amber-300 bg-amber-100',
            badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
            typeTag: 'bg-amber-100 text-amber-800'
          };

      default:
        return {
          outer: 'bg-neutral-200 border-gray-800',
          header: 'bg-gray-800 text-white',
          inner: 'bg-white',
          text: 'text-gray-800',
          badgeAtk: 'text-red-700 border-red-200 bg-red-50',
          badgeCost: 'text-blue-700 border-blue-200 bg-blue-50',
          typeTag: 'bg-gray-200 text-gray-600'
        };
    }
  };

  const styles = getCardStyles(card);

  if (isFaceDown) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-red-900 border border-red-950 rounded shadow-sm flex items-center justify-center cursor-default`}
      >
        <div className="w-4 h-4 rounded-full border border-red-800 bg-red-950"></div>
      </div>
    );
  }

  // 神器(Regalia)は変更なし
  if (card.type === CType.Regalia) {
     const regalia = card as RegaliaCard;
     return (
        <div 
        onClick={onClick}
        className={`
          ${sizeClasses[size]} 
          relative bg-gray-900 border-2 lg:border-4 border-red-800 rounded shadow-lg 
          flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl cursor-pointer select-none text-gray-200
          ${card.isTapped ? 'opacity-50 grayscale' : ''}
        `}
      >
        {/* カード名 */}
        <div className="bg-red-950 text-red-100 p-0.5 lg:p-1 font-bold truncate text-center leading-tight border-b border-red-900">
          {card.name}
        </div>

        {/* メインエリア */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-800">
             <div className="text-red-900/20 font-cinzel text-4xl absolute transform -rotate-45 select-none">
                 JINKI
             </div>
             
             {/* 左上: 年代 */}
             <div className="absolute top-1 left-1 flex flex-col items-center">
                 <span className="text-[0.4rem] text-gray-500 uppercase">Year</span>
                 <span className="text-xs font-cinzel text-gray-300 font-bold">{regalia.year}</span>
             </div>

             {/* 右上: 自傷ダメージ */}
             <div className="absolute top-1 right-1 flex flex-col items-center">
                 <span className="text-[0.4rem] text-red-500 uppercase">Dmg</span>
                 <div className="font-bold text-red-400 border border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {regalia.selfHarmCost}
                 </div>
             </div>

             {/* 左下: 手札枚数 */}
             <div className="absolute bottom-1 left-1 flex flex-col items-center">
                 <div className="font-bold text-blue-300 border border-blue-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {regalia.handSize}
                 </div>
                 <span className="text-[0.4rem] text-blue-500 uppercase">Hand</span>
             </div>

             {/* 右下: 血継回数 (Pact) */}
             <div className="absolute bottom-1 right-1 flex flex-col items-center">
                 <div className="font-bold text-purple-300 border border-purple-900/50 rounded-full w-5 h-5 flex items-center justify-center bg-black/40 text-[0.65rem]">
                    {regalia.bloodPact}
                 </div>
                 <span className="text-[0.4rem] text-purple-500 uppercase">Act</span>
             </div>
        </div>

        {/* タイプ表示 */}
        <div className="bg-gray-900 text-red-700 text-[0.4rem] text-center p-0.5 uppercase tracking-wider border-t border-red-900/30">
          {card.type}
        </div>
      </div>
     )
  }

  // 通常カードのレイアウト (スタイル適用)
  return (
    <div 
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        relative ${styles.outer} border-2 lg:border-4 rounded shadow-lg 
        flex flex-col overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl cursor-pointer select-none
        ${card.isTapped ? 'opacity-50 grayscale' : ''}
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