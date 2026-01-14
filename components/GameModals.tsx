import React, { useState } from 'react';
import { Card as CardType, RegaliaCard, PlayerState, RegaliaStats } from '../types';
import { Card } from './Card';
import { CRAFT_RECIPES } from '../constants/index';

// ----------------------------------------------------------------------
// 神器詳細モーダル
// ----------------------------------------------------------------------
interface RegaliaModalProps {
    regalia: RegaliaCard;
    player: PlayerState;
    isCurrentUser: boolean;
    onClose: () => void;
    onSelfHarm: () => void;
}

export const RegaliaModal: React.FC<RegaliaModalProps> = ({ regalia, player, isCurrentUser, onClose, onSelfHarm }) => {
    const isAwakened = player.isRegaliaAwakened;
    
    const StatsBlock = ({ title, stats, active }: { title: string, stats: RegaliaStats, active: boolean }) => (
        <div className={`p-3 rounded border transition-all ${active ? 'bg-red-900/30 border-red-500 shadow-lg' : 'bg-black/40 border-gray-700 opacity-60'}`}>
            <h4 className={`text-sm font-bold uppercase mb-2 ${active ? 'text-red-400' : 'text-gray-500'}`}>{title}</h4>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">Hand</div>
                    <div className={`text-lg font-bold ${active ? 'text-blue-300' : 'text-gray-400'}`}>{stats.handSize}</div>
                </div>
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">Dmg</div>
                    <div className={`text-lg font-bold ${active ? 'text-red-300' : 'text-gray-400'}`}>{stats.selfHarmCost}</div>
                </div>
                <div>
                    <div className="text-[10px] text-gray-500 uppercase">Act</div>
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
                    <StatsBlock title="Base Form (Normal)" stats={regalia.base} active={!isAwakened} />
                    <StatsBlock title="Awakened Form (Life <= 10)" stats={regalia.awakened} active={isAwakened} />
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
// クラフト（強化）モーダル
// ----------------------------------------------------------------------
interface CraftModalProps {
    player: PlayerState;
    onClose: () => void;
    onCraft: (recipeId: string, paymentCardIds: string[]) => void;
}

export const CraftModal: React.FC<CraftModalProps> = ({ player, onClose, onCraft }) => {
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
                    <span>Arts Enhancement</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-sans">Remaining Acts:</span>
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
                                        {canCraft && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">READY</span>}
                                        {!hasAction && matchIds !== null && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">NO ACT</span>}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{recipe.description}</p>
                                    <div className={`text-xs ${isSpecial ? 'text-pink-400' : 'text-purple-300'}`}>
                                        Result: {resultPreview.name} {resultPreview.level > 0 && `(Lv.${resultPreview.level})`}
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
                                        Craft
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
// カード一覧表示モーダル（捨て札・血廻共通）
// ----------------------------------------------------------------------
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
                    <span className={`text-sm font-sans ${themeClasses.subText}`}>Total: {cards.length}</span>
                </h3>
                
                {cards.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">No cards.</div>
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
// デッキ内容確認モーダル（順番を隠蔽）
// ----------------------------------------------------------------------
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
                    <span className="text-sm font-sans text-red-300">Total: {cards.length}</span>
                </h3>
                <p className="text-xs text-gray-500 mb-6 flex items-center gap-2">
                    <span className="text-yellow-500">⚠</span>
                    <span>Card order is hidden (Sorted by Type/Name).</span>
                </p>
                
                {displayCards.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">No cards in deck.</div>
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
// 選択ポップアップ（アポイタカラ・オボツカグラ用）
// ----------------------------------------------------------------------
interface ChoiceModalProps {
    title: string;
    description: string;
    onResolve: (payload: any) => void;
}

// 1. カード選択モーダル (アポイタカラ)
export const CardSelectionModal: React.FC<ChoiceModalProps & { cards: CardType[] }> = ({ title, description, cards, onResolve }) => {
    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-2xl w-full p-6 text-center">
                <h3 className="text-2xl font-cinzel text-yellow-500 mb-2">{title}</h3>
                <p className="text-gray-400 mb-8">{description}</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    {cards.map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Card card={c} size="md" />
                            <button 
                                onClick={() => onResolve({ selectedIndex: i })}
                                className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1 rounded font-bold"
                            >
                                Select
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// 2. 二択モーダル (オボツカグラ覚醒前)
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

// 3. 手札複数選択モーダル (オボツカグラ覚醒後)
export const HandSelectionModal: React.FC<ChoiceModalProps & { hand: CardType[] }> = ({ title, description, hand, onResolve }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            if (selectedIds.length < 2) {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };

    return (
        <div className="absolute inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-gray-900 border-2 border-blue-600 rounded-lg max-w-4xl w-full p-6 text-center max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-cinzel text-blue-400 mb-2">{title}</h3>
                <p className="text-gray-300 mb-2">{description}</p>
                <p className="text-sm text-blue-300 mb-6">Selected: {selectedIds.length} / 2</p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {hand.map((c) => {
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
                </div>

                <button 
                    onClick={() => onResolve({ selectedIds })}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded font-bold text-lg"
                >
                    Confirm ({selectedIds.length} cards)
                </button>
             </div>
        </div>
    );
};

// 4. 天球の蒼：デッキ操作モーダル
export const BlueSphereDeckControlModal: React.FC<ChoiceModalProps & { cards: CardType[] }> = ({ title, description, cards, onResolve }) => {
    // 0: デッキに戻す(1番目), 1: デッキに戻す(2番目), -1: 血廻へ送る
    // 初期状態はどちらも「デッキに戻す」で順不同
    const [actions, setActions] = useState<number[]>(cards.map(() => 0)); // 0: Top, 1: Bottom(if 3+), -1: Circuit. 
    // 今回は2枚なので、順番をつけるUIにする。
    // { index: number, destination: 'circuit' | 'deck', order?: number }
    
    const [circuitIndices, setCircuitIndices] = useState<number[]>([]);
    const [deckIndices, setDeckIndices] = useState<number[]>(cards.map((_, i) => i)); // 初期は全部デッキ

    const toggleDestination = (index: number) => {
        if (circuitIndices.includes(index)) {
            // Circuit -> Deck
            setCircuitIndices(circuitIndices.filter(i => i !== index));
            setDeckIndices([...deckIndices, index]);
        } else {
            // Deck -> Circuit
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
                        <h4 className="text-purple-300 font-bold mb-4 border-b border-purple-500/30 pb-2">To Blood Circuit</h4>
                        <div className="flex flex-col gap-2">
                            {circuitIndices.map(i => (
                                <div key={i} className="cursor-pointer hover:opacity-80" onClick={() => toggleDestination(i)}>
                                    <Card card={cards[i]} size="sm" />
                                </div>
                            ))}
                            {circuitIndices.length === 0 && <span className="text-xs text-gray-500 mt-8">Click card to move here</span>}
                        </div>
                    </div>

                    {/* Deck Top Zone */}
                    <div className="border border-blue-500/50 bg-blue-900/20 p-4 rounded min-w-[200px] min-h-[250px]">
                        <h4 className="text-blue-300 font-bold mb-4 border-b border-blue-500/30 pb-2">Return to Deck Top</h4>
                        <div className="flex flex-col gap-2 items-center">
                            <span className="text-[10px] text-gray-400 mb-1">Top (Draw 1st)</span>
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
                            <span className="text-[10px] text-gray-400 mt-1">Bottom (Draw later)</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => onResolve({ toCircuitIndices: circuitIndices, orderIndices: deckIndices })}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded font-bold text-lg"
                >
                    Confirm
                </button>
             </div>
        </div>
    );
};