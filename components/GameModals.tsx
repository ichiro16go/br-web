import React, { useState } from 'react';
import { Card as CardType, RegaliaCard, PlayerState, RegaliaStats } from '../types';
import { Card } from './Card';
import { CRAFT_RECIPES } from '../constants/index';

// ----------------------------------------------------------------------
// カード詳細表示モーダル (CardDetailModal)
// ----------------------------------------------------------------------
export const CardDetailModal: React.FC<{ card: CardType; onClose: () => void }> = ({ card, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
             <div className="bg-gray-900 border-2 border-gray-600 rounded-lg max-w-sm w-full p-6 flex flex-col items-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={onClose}>✕</button>
                <h3 className="text-xl font-cinzel text-gray-200 mb-4 border-b border-gray-700 pb-2 w-full text-center">
                    {card.name}
                </h3>
                
                <div className="mb-6 transform scale-110">
                    <Card card={card} size="md" />
                </div>

                <div className="bg-black/40 p-3 rounded border border-gray-800 w-full">
                    <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase font-bold border-b border-gray-800 pb-1">
                        <span>Type: {card.type}</span>
                        <span>Cost: {card.cost} / Atk: {card.attack}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {card.description}
                    </p>
                </div>
             </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 神器詳細モーダル (RegaliaModal)
// ----------------------------------------------------------------------
// 神器のステータス詳細を表示し、自傷アクションを行うためのモーダル
interface RegaliaModalProps {
    regalia: RegaliaCard;
    player: PlayerState;
    isCurrentUser: boolean;
    onClose: () => void;
    onSelfHarm: () => void;
}

export const RegaliaModal: React.FC<RegaliaModalProps> = ({ regalia, player, isCurrentUser, onClose, onSelfHarm }) => {
    const isAwakened = player.isRegaliaAwakened;
    
    // ステータスブロックのサブコンポーネント
    const StatsBlock = ({ title, stats, active }: { title: string, stats: RegaliaStats, active: boolean }) => (
        <div className={`p-3 rounded border transition-all ${active ? 'bg-red-900/30 border-red-500 shadow-lg' : 'bg-black/40 border-gray-700 opacity-60'}`}>
            <h4 className={`text-sm font-bold uppercase mb-2 ${active ? 'text-red-400' : 'text-gray-500'}`}>{title}</h4>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">手札</div>
                    <div className={`text-lg font-bold ${active ? 'text-blue-300' : 'text-gray-400'}`}>{stats.handSize}</div>
                </div>
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">自傷</div>
                    <div className={`text-lg font-bold ${active ? 'text-red-300' : 'text-gray-400'}`}>{stats.selfHarmCost}</div>
                </div>
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">行動</div>
                    <div className={`text-lg font-bold ${active ? 'text-purple-300' : 'text-gray-400'}`}>{stats.bloodPact}</div>
                </div>
            </div>
            <p className={`text-xs ${active ? 'text-gray-200' : 'text-gray-500'}`}>{stats.selfHarmEffectDesc}</p>
        </div>
    );

    const currentStats = isAwakened ? regalia.awakened : regalia.base;

    return (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border-2 border-red-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={onClose}>✕</button>
                <h3 className="text-2xl font-cinzel text-red-500 mb-1 border-b border-red-900 pb-2 flex justify-between items-end">
                    <span>{regalia.name}</span>
                    <span className="text-sm text-gray-500 font-sans">Year: {regalia.year}</span>
                </h3>
                <p className="text-gray-400 italic mb-6 text-sm">{regalia.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <StatsBlock title="通常形態 (Normal)" stats={regalia.base} active={!isAwakened} />
                    <StatsBlock title="覚醒形態 (Life <= 10)" stats={regalia.awakened} active={isAwakened} />
                </div>

                <div className="flex justify-end gap-3 items-center">
                    {!isAwakened && <span className="text-xs text-red-500 mr-auto font-bold animate-pulse">Life 10以下で覚醒</span>}
                    {isAwakened && <span className="text-xs text-red-500 mr-auto font-bold">覚醒済み (Awakened)</span>}

                    <button className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800" onClick={onClose}>閉じる</button>
                    {isCurrentUser && !player.regalia?.isTapped && (
                        <button 
                            className={`px-6 py-2 rounded font-bold shadow-lg flex flex-col items-center ${player.lifeCards.length >= currentStats.selfHarmCost ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                            onClick={onSelfHarm}
                            disabled={player.lifeCards.length < currentStats.selfHarmCost}
                        >
                            <span>自傷して効果発動</span>
                            {player.lifeCards.length < currentStats.selfHarmCost && <span className="text-[10px] font-normal">(ライフ不足)</span>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// クラフト（強化）モーダル (CraftModal)
// ----------------------------------------------------------------------
// 手札のカードを素材にして上位のカードを作成するモーダル
interface CraftModalProps {
    player: PlayerState;
    onClose: () => void;
    onCraft: (recipeId: string, paymentCardIds: string[]) => void;
}

export const CraftModal: React.FC<CraftModalProps> = ({ player, onClose, onCraft }) => {
    // 実行可能なレシピを優先表示するようにソート
    const sortedRecipes = [...CRAFT_RECIPES].sort((a, b) => {
        const aMatch = a.inputMatcher(player.hand) !== null;
        const bMatch = b.inputMatcher(player.hand) !== null;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
    });

    return (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border-2 border-purple-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar pb-32" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={onClose}>✕</button>
                <h3 className="text-2xl font-cinzel text-purple-400 mb-6 border-b border-purple-900 pb-2 flex justify-between items-center">
                    <span>アーツ強化 (Craft)</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-sans">残り行動回数:</span>
                        <span className={`text-lg font-bold ${player.remainingActions > 0 ? 'text-white' : 'text-red-500'}`}>{player.remainingActions}</span>
                    </div>
                </h3>
                
                <div className="space-y-4">
                    {sortedRecipes.map(recipe => {
                        const matchIds = recipe.inputMatcher(player.hand);
                        const hasAction = player.remainingActions > 0;
                        const canCraft = matchIds !== null && hasAction;
                        const resultPreview = recipe.createResult();
                        const isSpecial = recipe.id === 'craft-sakura'; 

                        return (
                            <div key={recipe.id} className={`
                                p-4 rounded border flex gap-4 items-center transition-colors
                                ${canCraft 
                                    ? (isSpecial ? 'bg-pink-900/20 border-pink-500' : 'bg-purple-900/20 border-purple-500') 
                                    : 'bg-gray-800/50 border-gray-700 opacity-60'}
                            `}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold text-lg ${isSpecial ? 'text-pink-300' : 'text-gray-200'}`}>
                                            {recipe.name}
                                        </span>
                                        {canCraft && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">可能</span>}
                                        {!hasAction && matchIds !== null && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">行動力不足</span>}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{recipe.description}</p>
                                    <div className={`text-xs ${isSpecial ? 'text-pink-400' : 'text-purple-300'}`}>
                                        生成: {resultPreview.name} {resultPreview.level > 0 && `(Lv.${resultPreview.level})`}
                                    </div>
                                </div>
                                <div>
                                    <button 
                                        onClick={() => {
                                            if (canCraft && matchIds) {
                                                onCraft(recipe.id, matchIds);
                                                onClose();
                                            }
                                        }}
                                        disabled={!canCraft}
                                        className={`px-4 py-2 rounded font-bold shadow-lg min-w-[100px] ${
                                            canCraft 
                                            ? (isSpecial ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white')
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        強化
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// カード一覧表示モーダル (CardListModal)
// ----------------------------------------------------------------------
// 捨て札や血廻エリアなどのカード一覧を表示する
interface CardListModalProps {
    title: string;
    cards: CardType[];
    colorTheme?: 'gray' | 'purple'; // 簡易テーマ
    onClose: () => void;
}

export const CardListModal: React.FC<CardListModalProps> = ({ title, cards, colorTheme = 'gray', onClose }) => {
    const themeClasses = colorTheme === 'purple' 
        ? { border: 'border-purple-700', text: 'text-purple-400', subText: 'text-purple-300' }
        : { border: 'border-gray-700', text: 'text-gray-400', subText: 'text-gray-600' };

    return (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className={`bg-gray-900 border-2 ${themeClasses.border} rounded-lg max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar`} onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={onClose}>✕</button>
                <h3 className={`text-2xl font-cinzel ${themeClasses.text} mb-6 border-b ${themeClasses.border} pb-2 flex justify-between items-center`}>
                    <span>{title}</span>
                    <span className={`text-sm font-sans ${themeClasses.subText}`}>枚数: {cards.length}</span>
                </h3>
                
                {cards.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">カードがありません。</div>
                ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {cards.map((c, i) => (
                            <div key={i} className="relative group">
                                    <Card card={c} size="sm" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// デッキ内容確認モーダル (DeckListModal)
// ----------------------------------------------------------------------
// デッキの内容を表示するが、実際の並び順は隠蔽する
interface DeckListModalProps {
    title: string;
    cards: CardType[];
    onClose: () => void;
}

export const DeckListModal: React.FC<DeckListModalProps> = ({ title, cards, onClose }) => {
    // 実際の並び順を隠すために、タイプ順＞名前順でソートしたコピーを作成して表示する
    const displayCards = [...cards].sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border-2 border-red-800 rounded-lg max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-white" onClick={onClose}>✕</button>
                <h3 className="text-2xl font-cinzel text-red-400 mb-2 border-b border-red-800 pb-2 flex justify-between items-center">
                    <span>{title}</span>
                    <span className="text-sm font-sans text-red-300">枚数: {cards.length}</span>
                </h3>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-2">
                    <span className="text-yellow-500">⚠</span>
                    <span>カード順は隠されています（種類/名前順で表示）。</span>
                </p>
                
                {displayCards.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">デッキにカードがありません。</div>
                ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {displayCards.map((c, i) => (
                            <div key={i} className="relative group">
                                <Card card={c} size="sm" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 汎用選択モーダル群
// ----------------------------------------------------------------------
// アクション実行時の各種選択UI (カード選択、コスト支払いなど)
interface ChoiceModalProps {
    title: string;
    description: string;
    onResolve: (payload: any) => void;
}

// 1. 単一カード選択モーダル (アポイタカラなど)
export const CardSelectionModal: React.FC<ChoiceModalProps & { cards: CardType[]; filter?: (c: CardType) => boolean }> = ({ title, description, cards, onResolve, filter }) => {
    const displayCards = cards.map((c, i) => ({ card: c, originalIndex: i }));
    const filteredCards = filter ? displayCards.filter(({ card }) => filter(card)) : displayCards;

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-2xl w-full p-6 text-center">
                <h3 className="text-2xl font-cinzel text-yellow-500 mb-2">{title}</h3>
                <p className="text-gray-400 mb-8">{description}</p>
                {filteredCards.length === 0 ? (
                    <div className="text-gray-500 mb-8">選択できるカードがありません。</div>
                ) : (
                    <div className="flex justify-center gap-4 flex-wrap">
                        {filteredCards.map(({ card, originalIndex }) => (
                            <div key={originalIndex} className="flex flex-col items-center gap-2">
                                <Card card={card} size="md" />
                                <button 
                                    onClick={() => onResolve({ selectedIndex: originalIndex })}
                                    className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1 rounded font-bold"
                                >
                                    選択
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                 {/* 選択候補がない場合のスキップボタン */}
                 <button 
                    onClick={() => onResolve({ selectedIndex: -1 })} 
                    className="mt-8 px-6 py-2 border border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-400"
                 >
                    キャンセル / スキップ
                 </button>
            </div>
        </div>
    );
};

// 2. 単純な二択モーダル (オボツカグラ覚醒前など)
export const SimpleChoiceModal: React.FC<ChoiceModalProps & { options: { label: string, value: string }[] }> = ({ title, description, options, onResolve }) => {
    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-blue-600 rounded-lg max-w-lg w-full p-6 text-center">
                <h3 className="text-2xl font-cinzel text-blue-400 mb-4">{title}</h3>
                <p className="text-gray-300 mb-8">{description}</p>
                <div className="flex justify-center gap-6">
                    {options.map((opt) => (
                        <button 
                            key={opt.value}
                            onClick={() => onResolve({ choice: opt.value })}
                            className="bg-blue-800 hover:bg-blue-700 border border-blue-500 text-white px-6 py-4 rounded-lg font-bold text-lg min-w-[120px]"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
             </div>
        </div>
    );
};

// 3. 手札複数選択モーダル (シラガネ、機翼の藍など)
interface HandSelectionModalProps extends ChoiceModalProps {
    hand: CardType[];
    minSelect?: number;
    maxSelect?: number;
    filter?: (c: CardType) => boolean;
}

export const HandSelectionModal: React.FC<HandSelectionModalProps> = ({ 
    title, description, hand, onResolve, minSelect = 0, maxSelect = 99, filter 
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // 選択可能なカードのみフィルタリング
    const selectableCards = filter ? hand.filter(filter) : hand;
    const unselectableCards = filter ? hand.filter(c => !filter(c)) : [];

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            if (selectedIds.length < maxSelect) {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };
    
    const isValid = selectedIds.length >= minSelect && selectedIds.length <= maxSelect;

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-blue-600 rounded-lg max-w-4xl w-full p-6 text-center max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-cinzel text-blue-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-2">{description}</p>
                <p className="text-sm text-blue-300 mb-6">
                    選択中: {selectedIds.length} 
                    {maxSelect < 99 && ` / ${maxSelect}`}
                    {minSelect > 0 && ` (最低: ${minSelect})`}
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {selectableCards.map((c) => {
                        const isSelected = selectedIds.includes(c.id);
                        return (
                            <div key={c.id} className="relative cursor-pointer" onClick={() => toggleSelect(c.id)}>
                                <div className={`transition-all ${isSelected ? 'transform -translate-y-4 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'opacity-80'}`}>
                                     <Card card={c} size="md" />
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold border border-white">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* 選択不可カードはグレーアウトして表示 */}
                    {unselectableCards.map((c) => (
                        <div key={c.id} className="relative opacity-30 grayscale cursor-not-allowed">
                             <Card card={c} size="md" />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => onResolve({ selectedIds })}
                        disabled={!isValid}
                        className={`px-8 py-3 rounded font-bold text-lg ${isValid ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        決定 ({selectedIds.length})
                    </button>
                    {/* 詰み防止用のCancelボタン */}
                    <button 
                        onClick={() => onResolve({ selectedIds: [] })}
                        className="px-6 py-3 rounded border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        キャンセル / スキップ
                    </button>
                </div>
             </div>
        </div>
    );
};

// 4. 血廻カード選択モーダル (機翼の藍など)
export const CircuitSelectionModal: React.FC<ChoiceModalProps & { circuit: CardType[] }> = ({ title, description, circuit, onResolve }) => {
    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 border-2 border-purple-600 rounded-lg max-w-3xl w-full p-6 text-center max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-cinzel text-purple-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-8">{description}</p>
                
                {circuit.length === 0 ? (
                     <div className="text-gray-500 mb-8">血廻にカードがありません。</div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {circuit.map((c, i) => (
                            <div key={c.id} className="flex flex-col items-center gap-2">
                                <Card card={c} size="md" />
                                <button 
                                    onClick={() => onResolve({ selectedIndex: i })}
                                    className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-1 rounded font-bold"
                                >
                                    選択
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                 {/* 詰み防止用ボタン */}
                 <button onClick={() => onResolve({ selectedIndex: -1 })} className="bg-gray-700 px-6 py-2 rounded text-gray-300 hover:bg-gray-600">閉じる / スキップ</button>
            </div>
        </div>
    );
};

// 5. 天球の蒼・機翼の藍：デッキ操作モーダル
export const BlueSphereDeckControlModal: React.FC<ChoiceModalProps & { cards: CardType[]; allowDiscard?: boolean }> = ({ 
    title, description, cards, onResolve, allowDiscard = false 
}) => {
    // 0: デッキ, 1: 血廻, 2: 捨て札(allowDiscard時)
    const [circuitIndices, setCircuitIndices] = useState<number[]>([]);
    const [deckIndices, setDeckIndices] = useState<number[]>(cards.map((_, i) => i)); 

    const toggleDestination = (index: number) => {
        if (circuitIndices.includes(index)) {
            setCircuitIndices(circuitIndices.filter(i => i !== index));
            setDeckIndices([...deckIndices, index]);
        } else {
            setDeckIndices(deckIndices.filter(i => i !== index));
            setCircuitIndices([...circuitIndices, index]);
        }
    };

    const moveDeckOrder = (index: number, direction: 'up' | 'down') => {
        const currentPos = deckIndices.indexOf(index);
        if (currentPos === -1) return;
        const newDeckIndices = [...deckIndices];
        if (direction === 'up' && currentPos > 0) {
            [newDeckIndices[currentPos], newDeckIndices[currentPos - 1]] = [newDeckIndices[currentPos - 1], newDeckIndices[currentPos]];
        } else if (direction === 'down' && currentPos < newDeckIndices.length - 1) {
            [newDeckIndices[currentPos], newDeckIndices[currentPos + 1]] = [newDeckIndices[currentPos + 1], newDeckIndices[currentPos]];
        }
        setDeckIndices(newDeckIndices);
    };

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-blue-600 rounded-lg max-w-3xl w-full p-6 text-center">
                <h3 className="text-2xl font-cinzel text-blue-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{description}</p>
                
                <div className="flex justify-center gap-8 mb-8">
                    {/* Circuit Zone */}
                    <div className="border border-purple-500/50 bg-purple-900/20 p-4 rounded min-w-[200px] min-h-[250px]">
                        <h4 className="text-purple-300 font-bold mb-4 border-b border-purple-500/30 pb-2">血廻へ送る</h4>
                        <div className="flex flex-col gap-2">
                            {circuitIndices.map(i => (
                                <div key={i} className="cursor-pointer hover:opacity-80" onClick={() => toggleDestination(i)}>
                                    <Card card={cards[i]} size="sm" />
                                </div>
                            ))}
                            {circuitIndices.length === 0 && <span className="text-xs text-gray-500 mt-8">カードをクリックして移動</span>}
                        </div>
                    </div>

                    {/* Deck Top Zone */}
                    <div className="border border-blue-500/50 bg-blue-900/20 p-4 rounded min-w-[200px] min-h-[250px]">
                        <h4 className="text-blue-300 font-bold mb-4 border-b border-blue-500/30 pb-2">デッキの上に戻す</h4>
                        <div className="flex flex-col gap-2 items-center">
                            <span className="text-[10px] text-gray-400 mb-1">上 (次に引く)</span>
                            {deckIndices.map((cardIndex, displayIndex) => (
                                <div key={cardIndex} className="flex items-center gap-2">
                                     <div className="cursor-pointer hover:opacity-80" onClick={() => toggleDestination(cardIndex)}>
                                        <Card card={cards[cardIndex]} size="sm" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                         {displayIndex > 0 && <button onClick={() => moveDeckOrder(cardIndex, 'up')} className="text-xs bg-gray-700 px-1 rounded">▲</button>}
                                         {displayIndex < deckIndices.length - 1 && <button onClick={() => moveDeckOrder(cardIndex, 'down')} className="text-xs bg-gray-700 px-1 rounded">▼</button>}
                                     </div>
                                </div>
                            ))}
                            <span className="text-[10px] text-gray-400 mt-1">下 (後で引く)</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => onResolve({ toCircuitIndices: circuitIndices, orderIndices: deckIndices })}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded font-bold text-lg"
                >
                    決定
                </button>
             </div>
        </div>
    );
};

// 6. 機翼の藍用デッキ操作モーダル
// 「デッキ上2枚を見て、1枚アーツ強化/破棄/戻す」
export const IndigoDeckStrategyModal: React.FC<ChoiceModalProps & { cards: CardType[] }> = ({ title, description, cards, onResolve }) => {
    // 状態: 各カードについて { action: 'upgrade' | 'discard' | 'deck', deckOrder: number }
    const [actions, setActions] = useState< Record<number, 'upgrade' | 'discard' | 'deck'> >(
        Object.fromEntries(cards.map((_, i) => [i, 'deck']))
    );
    const [deckOrder, setDeckOrder] = useState<number[]>(cards.map((_, i) => i));

    const handleActionChange = (index: number, action: 'upgrade' | 'discard' | 'deck') => {
        setActions(prev => ({ ...prev, [index]: action }));
        if (action === 'deck') {
            if (!deckOrder.includes(index)) setDeckOrder([...deckOrder, index]);
        } else {
            setDeckOrder(deckOrder.filter(i => i !== index));
        }
    };

    const moveOrder = (index: number, dir: 'up' | 'down') => {
        const pos = deckOrder.indexOf(index);
        if (pos === -1) return;
        const newOrder = [...deckOrder];
        if (dir === 'up' && pos > 0) {
            [newOrder[pos], newOrder[pos-1]] = [newOrder[pos-1], newOrder[pos]];
        } else if (dir === 'down' && pos < newOrder.length - 1) {
            [newOrder[pos], newOrder[pos+1]] = [newOrder[pos+1], newOrder[pos]];
        }
        setDeckOrder(newOrder);
    };

    const getDeckIndex = (index: number) => deckOrder.indexOf(index);

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-indigo-600 rounded-lg max-w-4xl w-full p-6 text-center max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-cinzel text-indigo-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{description}</p>
                
                <div className="flex justify-center gap-6 mb-8 flex-wrap">
                    {cards.map((card, i) => {
                         const isArt = card.type === 'SLASH' || card.type === 'BLOOD';
                         const currentAction = actions[i];
                         const deckIdx = getDeckIndex(i);

                         return (
                             <div key={i} className="flex flex-col items-center gap-2 p-3 border border-gray-700 rounded bg-black/20">
                                 <Card card={card} size="md" />
                                 <div className="flex flex-col gap-2 w-full">
                                     {isArt && (
                                         <button onClick={() => handleActionChange(i, 'upgrade')} className={`text-xs px-2 py-1 rounded border ${currentAction === 'upgrade' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>強化して捨てる</button>
                                     )}
                                     <button onClick={() => handleActionChange(i, 'discard')} className={`text-xs px-2 py-1 rounded border ${currentAction === 'discard' ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>捨てる</button>
                                     <button onClick={() => handleActionChange(i, 'deck')} className={`text-xs px-2 py-1 rounded border ${currentAction === 'deck' ? 'bg-blue-900/50 border-blue-500 text-blue-200' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>山札に戻す</button>
                                 </div>
                                 {currentAction === 'deck' && (
                                     <div className="flex items-center gap-2 mt-1">
                                         <span className="text-[10px] text-gray-400">順序: {deckIdx + 1}</span>
                                         <div className="flex gap-1">
                                             <button onClick={() => moveOrder(i, 'up')} className="text-xs bg-gray-700 w-5 h-5 rounded">▲</button>
                                             <button onClick={() => moveOrder(i, 'down')} className="text-xs bg-gray-700 w-5 h-5 rounded">▼</button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         );
                    })}
                </div>
                <button onClick={() => onResolve({ actions, deckOrder })} className="bg-indigo-700 hover:bg-indigo-600 text-white px-8 py-3 rounded font-bold text-lg">戦略決定</button>
             </div>
        </div>
    );
};

// 7. 葬送の黒: コスト支払いモーダル
interface BurialPaymentModalProps extends ChoiceModalProps {
    costType: 'fixed' | 'variable';
    costAmount: number; // variableの場合は最大値や計算用に使わず、単にX表示用などに使う
    poolSize: number;
}

export const BurialPaymentModal: React.FC<BurialPaymentModalProps> = ({ title, description, costType, costAmount, poolSize, onResolve }) => {
    const [variableCost, setVariableCost] = useState(0);
    const maxVariable = Math.min(10, poolSize);

    // 固定コストの場合の支払い可否
    const canPayFixed = costType === 'fixed' && poolSize >= costAmount;

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-stone-500 rounded-lg max-w-lg w-full p-6 text-center">
                <h3 className="text-2xl font-cinzel text-stone-300 mb-4">{title}</h3>
                <p className="text-gray-300 mb-2">{description}</p>
                <div className="text-sm text-red-400 mb-6 font-bold">現在のブラッドプール: {poolSize}</div>

                {costType === 'fixed' ? (
                    <div className="flex flex-col gap-4 items-center">
                        <p className="text-xl">コスト: <span className="text-red-500 font-bold">{costAmount} 血</span></p>
                        <div className="flex gap-4 mt-4">
                            <button 
                                onClick={() => onResolve({ paid: true, amount: costAmount })}
                                disabled={!canPayFixed}
                                className={`px-6 py-3 rounded font-bold ${canPayFixed ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                支払い & 発動
                            </button>
                            <button 
                                onClick={() => onResolve({ paid: false, amount: 0 })}
                                className="px-6 py-3 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 items-center w-full">
                        <p className="text-xl mb-2"><span className="text-red-500 font-bold">{variableCost}</span> 血を支払う (最大: {maxVariable})</p>
                        <input 
                            type="range" 
                            min="0" 
                            max={maxVariable} 
                            value={variableCost} 
                            onChange={(e) => setVariableCost(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between w-full text-xs text-gray-500 px-1">
                            <span>0</span>
                            <span>{maxVariable}</span>
                        </div>
                        
                        <div className="flex gap-4 mt-6">
                            <button 
                                onClick={() => onResolve({ paid: true, amount: variableCost })}
                                disabled={variableCost === 0}
                                className={`px-6 py-3 rounded font-bold ${variableCost > 0 ? 'bg-stone-700 hover:bg-stone-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                {variableCost} 支払い
                            </button>
                            <button 
                                onClick={() => onResolve({ paid: false, amount: 0 })}
                                className="px-6 py-3 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
             </div>
        </div>
    );
};

// 8. フィールドカード選択モーダル（超克の桜・凱旋用）
interface FieldSelectionModalProps extends ChoiceModalProps {
    field: CardType[];
    minSelect?: number;
    maxSelect?: number;
    filter?: (c: CardType) => boolean;
}

export const FieldSelectionModal: React.FC<FieldSelectionModalProps> = ({ 
    title, description, field, onResolve, minSelect = 0, maxSelect = 99, filter 
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // 選択可能なカードのみフィルタリング
    // fieldは手札と異なり、配列のインデックスではなくIDで管理することが多いが、
    // ここではIDを一意として扱う
    const selectableCards = filter ? field.filter(filter) : field;
    const unselectableCards = filter ? field.filter(c => !filter(c)) : [];

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            if (selectedIds.length < maxSelect) {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };
    
    const isValid = selectedIds.length >= minSelect && selectedIds.length <= maxSelect;

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-pink-500 rounded-lg max-w-4xl w-full p-6 text-center max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-cinzel text-pink-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-2">{description}</p>
                <p className="text-sm text-pink-300 mb-6">
                    選択中: {selectedIds.length} 
                    {maxSelect < 99 && ` / ${maxSelect}`}
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {selectableCards.map((c) => {
                        const isSelected = selectedIds.includes(c.id);
                        return (
                            <div key={c.id} className="relative cursor-pointer" onClick={() => toggleSelect(c.id)}>
                                <div className={`transition-all ${isSelected ? 'transform -translate-y-4 shadow-[0_0_15px_rgba(236,72,153,0.8)]' : 'opacity-80'}`}>
                                     <Card card={c} size="md" />
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-pink-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold border border-white">
                                        ✓
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {/* 選択不可カードはグレーアウト */}
                    {unselectableCards.map((c) => (
                        <div key={c.id} className="relative opacity-30 grayscale cursor-not-allowed">
                             <Card card={c} size="md" />
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <button 
                        onClick={() => onResolve({ selectedIds })}
                        disabled={!isValid}
                        className={`px-8 py-3 rounded font-bold text-lg ${isValid ? 'bg-pink-700 hover:bg-pink-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                        強化を実行 ({selectedIds.length})
                    </button>
                    {/* 詰み防止用ボタン */}
                    <button 
                        onClick={() => onResolve({ selectedIds: [] })} 
                        className="px-6 py-3 rounded border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        キャンセル / スキップ
                    </button>
                </div>
             </div>
        </div>
    );
};
