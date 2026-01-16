import React, { useState } from 'react';
import { PlayerState, RegaliaCard, Phase, Card as CardType } from '../types';
import { RegaliaModal, CraftModal, CardListModal, DeckListModal, CardDetailModal } from './GameModals';
import { IdentitySection } from './player/IdentitySection';
import { ResourceSection } from './player/ResourceSection';
import { FieldSection } from './player/FieldSection';
import { HandSection } from './player/HandSection';

interface PlayerAreaProps {
  player: PlayerState;
  isCurrentUser: boolean;
  onPlayCard: (cardId: string) => void;
  onSelfHarm: () => void;
  onCraft: (recipeId: string, paymentCardIds: string[]) => void;
  onActivateBloodRecall: () => void;
  isOpponent?: boolean;
  phase: Phase; 
}

/**
 * プレイヤーエリアコンポーネント (Controller)
 * 各種サブコンポーネントの配置とモーダルの状態管理のみを行う
 */
export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
    player, 
    isCurrentUser, 
    onPlayCard, 
    onSelfHarm, 
    onCraft, 
    onActivateBloodRecall,
    isOpponent = false,
    phase
}) => {
  const [selectedRegalia, setSelectedRegalia] = useState<RegaliaCard | null>(null);
  const [showCraftModal, setShowCraftModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showCircuitModal, setShowCircuitModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [viewingCard, setViewingCard] = useState<CardType | null>(null);

  const handleRegaliaClick = () => {
      if (player.regalia) {
          setSelectedRegalia(player.regalia);
      }
  };

  const handleConfirmSelfHarm = () => {
      onSelfHarm();
      setSelectedRegalia(null);
  };

  return (
    <div className={`relative w-full h-full flex ${isOpponent ? 'flex-col-reverse' : 'flex-col'}`}>
        <div className="flex-1 flex w-full justify-start min-h-0 bg-black/10">
            <IdentitySection 
                player={player}
                isCurrentUser={isCurrentUser}
                isOpponent={isOpponent}
                onRegaliaClick={handleRegaliaClick}
                onActivateBloodRecall={onActivateBloodRecall}
            />
            
            <ResourceSection 
                player={player}
                isCurrentUser={isCurrentUser}
                isOpponent={isOpponent}
                onCraftClick={() => setShowCraftModal(true)}
                onCircuitClick={() => setShowCircuitModal(true)}
                onDeckClick={() => setShowDeckModal(true)}
                onDiscardClick={() => setShowDiscardModal(true)}
            />

            <FieldSection 
                player={player}
                isOpponent={isOpponent}
                phase={phase}
                setViewingCard={setViewingCard}
            />
        </div>

        <HandSection 
            player={player}
            isOpponent={isOpponent}
            onPlayCard={onPlayCard}
        />

        {/* プレイヤー名表示 */}
        <div className={`absolute right-4 ${isOpponent ? 'top-2' : 'bottom-20 lg:bottom-2'} pointer-events-none z-0`}>
             <div className="text-4xl lg:text-6xl font-cinzel font-bold text-white/5 select-none">
                {isOpponent ? 'OPPONENT' : 'PLAYER'}
            </div>
        </div>

        {/* --- Modals --- */}
        {selectedRegalia && (
            <RegaliaModal 
                regalia={selectedRegalia}
                player={player}
                isCurrentUser={isCurrentUser}
                onClose={() => setSelectedRegalia(null)}
                onSelfHarm={handleConfirmSelfHarm}
            />
        )}

        {showCraftModal && (
             <CraftModal 
                player={player}
                onClose={() => setShowCraftModal(false)}
                onCraft={onCraft}
             />
        )}

        {showDiscardModal && (
            <CardListModal 
                title="捨て札"
                cards={player.discard}
                colorTheme="gray"
                onClose={() => setShowDiscardModal(false)}
            />
        )}

        {showCircuitModal && (
            <CardListModal 
                title="血廻 (Blood Circuit)"
                cards={player.bloodCircuit}
                colorTheme="purple"
                onClose={() => setShowCircuitModal(false)}
            />
        )}

        {showDeckModal && !isOpponent && (
            <DeckListModal 
                title="山札 (残り)"
                cards={player.deck}
                onClose={() => setShowDeckModal(false)}
            />
        )}

        {viewingCard && (
            <CardDetailModal 
                card={viewingCard}
                onClose={() => setViewingCard(null)}
            />
        )}
    </div>
  );
};
