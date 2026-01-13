/**
 * 配列をシャッフルする（フィッシャー–イェーツのシャッフル）
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export const shuffle = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * 一意のIDを生成する
 * @param prefix IDの接頭辞
 * @returns 生成されたID文字列
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};