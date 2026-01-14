import { Card, CardType as CType, RegaliaCard } from '../types';

interface CardStyle {
  outer: string;
  header: string;
  inner: string;
  text: string;
  badgeAtk: string;
  badgeCost: string;
  typeTag: string;
}

/**
 * カードの種類や名前に基づいてスタイルクラスを生成する
 * @param card 対象のカード
 * @returns Tailwind CSSのクラスセット
 */
export const getCardStyles = (card: Card): CardStyle => {
  // 1. 名前による特殊判定（固有カードなど）
  if (card.name.includes('桜流し')) {//桜色
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
  if (card.name.includes('ラムダ')) {//藍
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
  if (card.name === '発狂') {//紫
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

  // 2. カードタイプによる判定
  switch (card.type) {
    case CType.Blood:
      return {
        outer: 'bg-red-200 border-red-800',//赤
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
        if (card.name.includes('緋')) return { // 赤
            outer: 'bg-red-200 border-red-700', header: 'bg-red-800 text-white', inner: 'bg-red-50', text: 'text-red-900',
            badgeAtk: 'text-red-700 border-red-300 bg-red-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-red-100 text-red-800'
        };
        if (card.name.includes('紫')) return { // 紫
            outer: 'bg-purple-200 border-purple-700', header: 'bg-purple-800 text-white', inner: 'bg-purple-50', text: 'text-purple-900',
            badgeAtk: 'text-purple-700 border-purple-300 bg-purple-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-purple-100 text-purple-800'
        };
        if (card.name.includes('灰')) return { // 灰
            outer: 'bg-gray-300 border-gray-600', header: 'bg-gray-700 text-white', inner: 'bg-gray-50', text: 'text-gray-900',
            badgeAtk: 'text-gray-800 border-gray-300 bg-gray-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-gray-200 text-gray-800'
        };
        if (card.name.includes('蒼')) return { // 青
            outer: 'bg-blue-200 border-blue-600', header: 'bg-blue-800 text-white', inner: 'bg-blue-50', text: 'text-blue-900',
            badgeAtk: 'text-blue-700 border-blue-300 bg-blue-100', badgeCost: 'text-red-700 border-red-200 bg-red-50', typeTag: 'bg-blue-100 text-blue-800'
        };
        if (card.name.includes('黒')) return { // 黒
            outer: 'bg-stone-400 border-black', header: 'bg-black text-white', inner: 'bg-stone-100', text: 'text-black',
            badgeAtk: 'text-black border-stone-400 bg-stone-200', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-stone-300 text-black'
        };
        if (card.name.includes('桜')) return { // 桜
             outer: 'bg-pink-200 border-pink-400', header: 'bg-pink-600 text-white', inner: 'bg-pink-50', text: 'text-pink-900',
             badgeAtk: 'text-pink-700 border-pink-300 bg-pink-100', badgeCost: 'text-blue-700 border-blue-200 bg-blue-50', typeTag: 'bg-pink-100 text-pink-800'
        };
        if (card.name.includes('藍')) return { // 藍
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