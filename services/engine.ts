import { 
  GameState, PlayerState, ActionType, Phase, Card, CardType, RegaliaCard, BloodRecall 
} from '../types';
import { 
  INITIAL_LIFE, STARTER_DECK_BLOOD_COUNT, STARTER_DECK_SLASH_COUNT,
  createStarterBlood, createStarterSlash, createRecallCard, 
  createUpgradedSlash, createSlashFlash, createLambda,
  createMadness, createObotsuFragment, CRAFT_RECIPES,
  createRedScarletBlood, createMasterySlashFlash,
  BLOOD_RECALLS
} from '../constants';

// --- ユーティリティ ---
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// カードを引く処理
const drawCard = (player: PlayerState, count: number): PlayerState => {
  let newDeck = [...player.deck];
  let newHand = [...player.hand];
  let newDiscard = [...player.discard];

  for (let i = 0; i < count; i++) {
    if (newDeck.length === 0) {
      if (newDiscard.length === 0) break; // 山札も捨て札もなければ引けない
      // 捨て札をシャッフルして山札にする
      newDeck = shuffle(newDiscard);
      newDiscard = [];
    }
    const card = newDeck.pop();
    if (card) newHand.push(card);
  }

  return {
    ...player,
    deck: newDeck,
    hand: newHand,
    discard: newDiscard
  };
};

// 初期デッキ生成
export const createInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  for (let i = 0; i < STARTER_DECK_SLASH_COUNT; i++) deck.push(createStarterSlash());
  for (let i = 0; i < STARTER_DECK_BLOOD_COUNT; i++) deck.push(createStarterBlood());
  return shuffle(deck);
};

// プレイヤー生成
export const createPlayer = (id: string, name: string, isHuman: boolean, regalia: RegaliaCard, bloodRecallId: string): PlayerState => {
  const deck = createInitialDeck();
  const lifeCards = Array(INITIAL_LIFE).fill(null).map((_, i) => ({
    id: `life-${id}-${i}`,
    name: 'Life Essence',
    type: CardType.Blood, // プレースホルダータイプ
    attack: 0,
    cost: 0,
    level: 0,
    description: 'Life'
  }));

  const bloodRecall = BLOOD_RECALLS.find(br => br.id === bloodRecallId) || null;

  let player: PlayerState = {
    id,
    name,
    isHuman,
    life: INITIAL_LIFE,
    lifeCards,
    deck,
    hand: [],
    discard: [],
    field: [],
    bloodPool: [],
    regalia,
    bloodRecall, 
    isRegaliaAwakened: false,
    attackTotal: 0,
    hasPassed: false,
    remainingActions: regalia.bloodPact, // 初期行動回数
    activeBuffs: {}
  };
  
  // 初期手札のドロー
  player = drawCard(player, regalia.handSize);
  return player;
};

// 天球の蒼の効果処理ヘルパー
const applyBlueSphereEffect = (player: PlayerState, card: Card, log: string[]) => {
    // 固有効果の判定（descriptionに含まれるキーワードで判定）
    
    // 1. 手札のアーツ強化
    if (card.description.includes('手札にあるアーツカードを1枚選ぶ') || card.description.includes('【追憶強化】する')) {
        const artsIndex = player.hand.findIndex(c => c.type === CardType.Slash || c.type === CardType.Blood);
        if (artsIndex !== -1) {
            const target = player.hand[artsIndex];
            player.hand.splice(artsIndex, 1);
            // 簡易強化: レベル+1相当のカードに変換
            let upgraded: Card | null = null;
            if (target.name === '斬撃') upgraded = createSlashFlash();
            else if (target.name === '斬撃一閃') upgraded = createMasterySlashFlash();
            else if (target.name === '赤血') upgraded = createRedScarletBlood();
            
            if (upgraded) {
                player.hand.push(upgraded);
                log.push(`[天球の蒼] ${player.name}の手札の${target.name}が${upgraded.name}に強化された。`);
            } else {
                player.hand.push(target); // 戻す
                log.push(`[天球の蒼] ${player.name}の手札に強化可能なアーツがなかった。`);
            }
        } else {
            log.push(`[天球の蒼] ${player.name}の手札に強化対象がなかった。`);
        }
    }
    // 2. デッキ操作
    else if (card.description.includes('デッキの上から2枚見る')) {
        log.push(`[天球の蒼] ${player.name}はデッキトップを確認し操作した。`);
    }
    // 3. 赤緋血を手札へ
    else if (card.description.includes('赤緋血を1枚手札に加える')) {
        player.hand.push(createRedScarletBlood());
        log.push(`[天球の蒼] ${player.name}は赤緋血を手に入れた。`);
    }
    // 4. ブラッドカード3枚プール
    else if (card.description.includes('「ブラッドカード」を3枚')) {
        for(let i=0; i<3; i++) player.bloodPool.push(createStarterBlood());
        log.push(`[天球の蒼] ${player.name}のプールにブラッドカードが3枚追加された。`);
    }
    // 5. 斬撃一閃手札、ブラッドプール
    else if (card.description.includes('斬撃一閃') && card.description.includes('ブラッドプール')) {
        player.hand.push(createSlashFlash());
        player.bloodPool.push(createStarterBlood());
        log.push(`[天球の蒼] ${player.name}は斬撃一閃とブラッドを得た。`);
    }
};

// --- Reducer (ゲーム状態遷移ロジック) ---
export const gameReducer = (state: GameState, action: ActionType): GameState => {
  const cloneState = structuredClone(state) as GameState;
  
  switch (action.type) {
    case 'ACTIVATE_BLOOD_RECALL': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const player = cloneState.players[playerKey];
        const opponent = cloneState.players[opponentKey];

        const recall = player.bloodRecall;
        if (!recall) return state;

        // コスト確認
        if (player.bloodPool.length < recall.cost) return state;

        // コスト支払い
        player.bloodPool.splice(0, recall.cost);

        cloneState.log.push(`${player.name} は必殺技「${recall.name}」を発動！`);

        // 効果適用
        switch (recall.effectType) {
            case 'shiragane_convert':
                player.activeBuffs.shiraganeConvert = true;
                cloneState.log.push(`[継続] シラガネの効果により自傷ダメージがプール追加に変換されます。`);
                break;
            case 'shiragane_revive':
                for(let i=0; i<3; i++) {
                     player.field.push(createStarterSlash());
                     player.attackTotal += 1;
                }
                cloneState.log.push(`シラガネの効果で斬撃が場に現れた！`);
                break;
            case 'hihi_madness':
                opponent.deck.push(createMadness());
                opponent.deck.push(createMadness());
                cloneState.log.push(`相手のデッキトップに発狂を2枚送り込んだ。`);
                break;
            case 'hihi_destroy':
                if (opponent.field.length > 0) {
                    const removed = opponent.field.pop(); // 簡易的に末尾除去
                    if (removed) {
                        opponent.discard.push(removed);
                        opponent.attackTotal -= removed.attack;
                        cloneState.log.push(`相手の${removed.name}を破壊した。`);
                    }
                }
                break;
            case 'totsuka_mill':
                const milled = player.deck.splice(0, 4);
                player.bloodPool.push(...milled);
                cloneState.log.push(`デッキから4枚をブラッドプールへ送った。`);
                break;
            case 'totsuka_atk':
                player.attackTotal += 10;
                cloneState.log.push(`[攻撃]+10`);
                break;
            case 'nirai_shield':
                player.activeBuffs.damageReduction = (player.activeBuffs.damageReduction || 0) + 8;
                cloneState.log.push(`次のダメージを-8軽減する盾を得た。`);
                break;
            case 'nirai_field_atk':
                const fieldCount = player.field.length;
                player.attackTotal += fieldCount;
                cloneState.log.push(`[攻撃]+${fieldCount} (場のカード数)`);
                break;
            case 'kutone_pact':
                player.activeBuffs.kutonePactBonus = (player.activeBuffs.kutonePactBonus || 0) + 1;
                player.remainingActions += 1; // 即時反映
                cloneState.log.push(`[継続] 血継(Act)が+1された。`);
                break;
            case 'kutone_atk':
                player.attackTotal += 10;
                cloneState.log.push(`[攻撃]+10`);
                break;
            case 'apoi_draw':
                const drawn = drawCard(player, 2);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`2枚引いた。`);
                break;
            case 'apoi_atk':
                player.attackTotal += 8;
                cloneState.log.push(`[攻撃]+8`);
                break;
            case 'usugane_burn':
                player.activeBuffs.usuganeBurn = true;
                cloneState.log.push(`[継続] クリーンナップフェイズに相手にダメージを与える呪いをかけた。`);
                break;
            case 'usugane_last_stand':
                const lifeToSend = player.lifeCards.splice(0, player.lifeCards.length - 1); // 1枚残す
                player.life = 1;
                player.bloodPool.push(...lifeToSend);
                const boost = lifeToSend.length;
                player.attackTotal += boost;
                cloneState.log.push(`ライフを1にし、[攻撃]+${boost}を得た！`);
                break;
            case 'obotsu_awaken':
                player.isRegaliaAwakened = true;
                const obotsuDrawn = drawCard(player, 1);
                player.deck = obotsuDrawn.deck;
                player.hand = obotsuDrawn.hand;
                player.discard = obotsuDrawn.discard;
                cloneState.log.push(`即座に覚醒し、1枚引いた。`);
                break;
            case 'obotsu_fragment_atk':
                const fragmentCount = player.hand.filter(c => c.name === 'オボツの欠片').length 
                                    + player.field.filter(c => c.name === 'オボツの欠片').length; // 本来は場にある数のみだが手札からもカウント判定(簡易)
                const atkBoost = fragmentCount * 2;
                player.attackTotal += atkBoost;
                cloneState.log.push(`[攻撃]+${atkBoost} (欠片x2)`);
                break;
        }

        return cloneState;
    }

    case 'PLAY_CARD': {
      const { playerId, cardId } = action;
      const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
      const player = cloneState.players[playerKey];
      
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return state;

      // 手札からフィールドへ
      const card = player.hand[cardIndex];
      // 発狂などのCalamityはプレイできない
      if (card.type === CardType.Calamity) return state;

      player.hand.splice(cardIndex, 1);
      player.field.push(card);
      
      // 即時効果の適用
      player.attackTotal += card.attack;

      // 特殊カードロジック
      if (card.name === '赤血' || card.name === '赤緋血' || card.name === '奔流【緋星血】' || card.name === '桜流し') {
          // ブラッドカードの効果：ブラッドプールに追加
          let amount = 1;
          if (card.name === '赤緋血') amount = 3;
          if (card.name === '奔流【緋星血】') amount = 6;
          
          for(let i=0; i<amount; i++) {
            const bloodToken: Card = {
                id: `gen-blood-${Math.random().toString(36).substr(2, 9)}`,
                name: 'Blood',
                type: CardType.Blood,
                attack: 0,
                cost: 0,
                level: 0,
                description: 'Generated Blood'
            };
            player.bloodPool.push(bloodToken);
          }
          cloneState.log.push(`${player.name} はブラッドを得た (+${amount})`);
      }
      
      // ドロー効果
      if (card.description.includes('ドロー') || card.description.includes('Draw')) {
         const drawn = drawCard(player, 1);
         player.deck = drawn.deck;
         player.hand = drawn.hand;
         player.discard = drawn.discard;
      }
      
      // 機翼の藍の共通効果: ラムダを場に出す
      if (card.name === '機翼の藍') {
          const lambda = createLambda();
          player.field.push(lambda);
          player.attackTotal += lambda.attack;
          cloneState.log.push(`${player.name} は「自律人器群【ラムダ】」を召喚した (+${lambda.attack} ATK)`);
      }

      cloneState.log.push(`${player.name} は ${card.name} をプレイ (ATK: ${card.attack}).`);
      return cloneState;
    }

    case 'CRAFT_CARD': {
        const { playerId, recipeId, paymentCardIds } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];
        
        // 行動回数チェック
        if (player.remainingActions <= 0) {
            return state;
        }

        const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return state;

        // 素材カードを手札から削除し、ブラッドプール（血廻）へ送る
        const removedCards: Card[] = [];
        
        for (const pid of paymentCardIds) {
            const idx = player.hand.findIndex(c => c.id === pid);
            if (idx !== -1) {
                removedCards.push(player.hand[idx]);
                player.hand.splice(idx, 1);
            }
        }

        if (removedCards.length !== paymentCardIds.length) {
            return state;
        }

        // 血廻エリア（Blood Pool）へ送る
        player.bloodPool.push(...removedCards);

        // 新しいカードを生成して手札へ
        const resultCard = recipe.createResult();
        player.hand.push(resultCard);
        
        // 行動回数を消費
        player.remainingActions -= 1;

        cloneState.log.push(`${player.name} は ${recipe.name} を実行 (Act-1).`);
        return cloneState;
    }

    case 'SELF_HARM': {
        // 自傷アクション
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const player = cloneState.players[playerKey];
        const opponent = cloneState.players[opponentKey];
        
        if (!player.regalia || player.regalia.isTapped) return state;

        // コスト支払い
        const damage = player.regalia.selfHarmCost;
        if (player.lifeCards.length < damage) return state;

        // シラガネの継続効果: 自傷ダメージをプール追加に置換
        if (player.activeBuffs.shiraganeConvert) {
             for(let i=0; i<damage; i++) player.bloodPool.push(createStarterBlood());
             cloneState.log.push(`${player.name}はシラガネの効果で自傷ダメージを無効化し、血を得た！`);
        } else {
            // ライフからブラッドプールへカードを移動
            const lostLife = player.lifeCards.splice(0, damage);
            player.bloodPool.push(...lostLife);
            player.life -= damage;
        }

        // 神器をタップ（使用済み）にする
        player.regalia.isTapped = true;
        
        // --- 神器ごとの効果 ---
        switch (player.regalia.id) {
            case 'regalia-shiragane': // シラガネ: 斬撃 -> 斬撃一閃
                const slashIndex = player.hand.findIndex(c => c.name === '斬撃');
                if (slashIndex !== -1) {
                    player.hand.splice(slashIndex, 1);
                    player.hand.push(createUpgradedSlash(2));
                    cloneState.log.push(`${player.name}はシラガネを使用: 手札の斬撃を強化した。`);
                } else {
                    cloneState.log.push(`${player.name}はシラガネを使用: しかし強化対象がなかった。`);
                }
                break;

            case 'regalia-hihiirokane': // ヒヒイロカネ: 斬撃一閃を手札へ
                player.hand.push(createSlashFlash());
                cloneState.log.push(`${player.name}はヒヒイロカネを使用: 『斬撃一閃』を手に入れた。`);
                break;

            case 'regalia-totsukamatsurugi': // トツカマヂチ: 相手の捨て札に発狂を置く
                opponent.discard.push(createMadness());
                cloneState.log.push(`${player.name}はトツカマヂチを使用: 相手の捨て札に『発狂』を送り込んだ。`);
                break;

            case 'regalia-niraikanai': // ニライカナイ: デッキトップ2枚をプールへ
                const milled = player.deck.splice(0, 2);
                if (milled.length < 2 && player.discard.length > 0) {
                     // 簡易リシャッフル省略
                }
                player.bloodPool.push(...milled);
                cloneState.log.push(`${player.name}はニライカナイを使用: 山札から${milled.length}枚をプールへ送った。`);
                break;
            
            case 'regalia-kutoneshirika': // クトネシリカ: 赤血をプールへ
                player.bloodPool.push(createStarterBlood());
                cloneState.log.push(`${player.name}はクトネシリカを使用: プールに赤血を追加した。`);
                break;

            case 'regalia-apoitakara': // アポイタカラ: 1ドロー
                const drawn = drawCard(player, 1);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`${player.name}はアポイタカラを使用: 1枚引いた。`);
                break;

            case 'regalia-usuganeyoroi': // ウスガネヨロイ: 斬撃を手札へ
                player.hand.push(createStarterSlash());
                cloneState.log.push(`${player.name}はウスガネヨロイを使用: 斬撃を手に入れた。`);
                break;

            case 'regalia-obotsukagura': // オボツカグラ: オボツの欠片を手札へ
                player.hand.push(createObotsuFragment());
                cloneState.log.push(`${player.name}はオボツカグラを使用: 『オボツの欠片』を手に入れた。`);
                break;

            default:
                break;
        }

        // 覚醒チェック（ライフ10以下）
        if (player.life <= 10 && !player.isRegaliaAwakened) {
            player.isRegaliaAwakened = true;
            cloneState.log.push(`${player.name} の神器が覚醒した！`);
        }

        return cloneState;
    }

    case 'RECALL_CARD': {
        // マーケットからの購入 (pileIndex指定)
        const { playerId, pileIndex } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];

        // 行動回数チェック
        if (player.remainingActions <= 0) return state;

        const pile = cloneState.market.recallPiles[pileIndex];
        if (!pile || pile.length === 0) return state;

        const marketCard = pile[pile.length - 1]; // 一番上のカード

        // コスト確認（ブラッドプールの枚数）
        if (player.bloodPool.length < marketCard.cost) return state; 
        
        // コスト支払い（プールから削除）
        player.bloodPool.splice(0, marketCard.cost);
        
        // カード獲得 (山札からポップしてフィールドへ)
        pile.pop();
        
        player.field.push(marketCard); 
        player.attackTotal += marketCard.attack; 

        // 簡易的な効果処理の共通化
        if (marketCard.description.includes('ドロー') || marketCard.description.includes('Draw')) {
             const drawn = drawCard(player, 1);
             player.deck = drawn.deck;
             player.hand = drawn.hand;
             player.discard = drawn.discard;
        }

        // 機翼の藍の共通効果: ラムダを場に出す
        if (marketCard.name === '機翼の藍') {
            const lambda = createLambda();
            player.field.push(lambda);
            player.attackTotal += lambda.attack;
        }

        // 行動回数を消費
        player.remainingActions -= 1;

        cloneState.log.push(`${player.name} は ${marketCard.name} を購入 (Cost: ${marketCard.cost}, Act-1).`);
        return cloneState;
    }

    case 'PASS_TURN': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        cloneState.players[playerKey].hasPassed = true;
        cloneState.log.push(`${cloneState.players[playerKey].name} はパスした.`);

        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        
        if (cloneState.players[opponentKey].hasPassed) {
             return gameReducer(cloneState, { type: 'RESOLVE_BATTLE' });
        } else {
            cloneState.turnPlayerId = cloneState.players[opponentKey].id;
        }
        return cloneState;
    }

    case 'RESOLVE_BATTLE': {
        cloneState.phase = Phase.BloodBattle;
        const p1 = cloneState.players.player;
        const p2 = cloneState.players.cpu;

        cloneState.log.push(`--- ブラッドバトル ---`);
        cloneState.log.push(`${p1.name} ATK: ${p1.attackTotal} vs ${p2.name} ATK: ${p2.attackTotal}`);

        let winner: PlayerState | null = null;
        let loser: PlayerState | null = null;
        let damage = 0;

        if (p1.attackTotal > p2.attackTotal) {
            winner = p1;
            loser = p2;
            damage = p1.attackTotal - p2.attackTotal;
        } else if (p2.attackTotal > p1.attackTotal) {
            winner = p2;
            loser = p1;
            damage = p2.attackTotal - p1.attackTotal;
        }

        if (winner && loser) {
            // ダメージ軽減（ニライカナイ効果）
            if (loser.activeBuffs.damageReduction && loser.activeBuffs.damageReduction > 0) {
                const originalDamage = damage;
                damage = Math.max(0, damage - loser.activeBuffs.damageReduction);
                cloneState.log.push(`${loser.name}はダメージを軽減した (${originalDamage} -> ${damage})`);
                loser.activeBuffs.damageReduction = 0; // 消費
            }

            cloneState.log.push(`${winner.name} の勝利! ${damage} ダメージを与える.`);
            const actualDamage = Math.min(damage, loser.lifeCards.length);
            const damagedCards = loser.lifeCards.splice(0, actualDamage);
            loser.bloodPool.push(...damagedCards);
            loser.life -= actualDamage;
            cloneState.firstPlayerId = winner.id;
        } else {
            cloneState.log.push(`引き分け！ダメージなし.`);
        }

        if (cloneState.players.player.life <= 0 || cloneState.players.cpu.life <= 0) {
             cloneState.phase = Phase.GameOver;
             return cloneState;
        }

        return gameReducer(cloneState, { type: 'CLEANUP' });
    }

    case 'CLEANUP': {
        cloneState.phase = Phase.Cleanup;
        [cloneState.players.player, cloneState.players.cpu].forEach(p => {
            // ウスガネヨロイの継続ダメージ
            if (p.activeBuffs.usuganeBurn) {
                const opponentKey = p.id === 'p1' ? 'cpu' : 'player';
                const opponent = cloneState.players[opponentKey];
                if (opponent.life > 0) {
                     const burnDamage = Math.min(2, opponent.lifeCards.length);
                     const burned = opponent.lifeCards.splice(0, burnDamage);
                     opponent.bloodPool.push(...burned);
                     opponent.life -= burnDamage;
                     cloneState.log.push(`ウスガネヨロイの効果: ${opponent.name}に2ダメージ！`);
                }
            }
            
            // 場に残るカードを判定
            const remainingCards = [];
            const discardCards = [];
            
            for (const card of p.field) {
                // 場に残るカード条件: 
                // 1. 名前が「天球の蒼」
                // 2. 説明文に「場に残る」が含まれる
                if (card.name === '天球の蒼' || card.description.includes('場に残る')) {
                    remainingCards.push(card);
                } else {
                    discardCards.push(card);
                }
            }

            p.discard.push(...discardCards);
            p.field = remainingCards; // 場に残るカードだけ保持

            // ブラッドプールを捨て札へ
            p.discard.push(...p.bloodPool);
            p.bloodPool = [];
            
            p.attackTotal = 0;
            p.hasPassed = false;
            
            // 行動回数をリセット (クトネシリカ効果反映)
            const pactBonus = p.activeBuffs.kutonePactBonus || 0;
            p.remainingActions = (p.regalia ? p.regalia.bloodPact : 1) + pactBonus;
            
            if (p.regalia) p.regalia.isTapped = false;
            
            p.discard.push(...p.hand);
            p.hand = [];

            const drawCount = p.regalia?.handSize || 5;
            const drawn = drawCard(p, drawCount);
            p.deck = drawn.deck;
            p.hand = drawn.hand;
            p.discard = drawn.discard;
        });

        cloneState.phase = Phase.Main;
        cloneState.turnPlayerId = cloneState.firstPlayerId;
        cloneState.log.push(`--- ターン終了. 新しいラウンドの開始. 先攻: ${cloneState.firstPlayerId === 'p1' ? 'Player' : 'CPU'} ---`);

        // ターン開始時効果の処理 (天球の蒼の効果発動)
        const nextPlayerKey = cloneState.turnPlayerId === cloneState.players.player.id ? 'player' : 'cpu';
        const nextPlayer = cloneState.players[nextPlayerKey];
        
        for (const card of nextPlayer.field) {
            if (card.name === '天球の蒼') {
                applyBlueSphereEffect(nextPlayer, card, cloneState.log);
            }
        }

        return cloneState;
    }

    case 'CPU_ACTION': {
        if (state.turnPlayerId !== state.players.cpu.id || state.phase !== Phase.Main) return state;
        
        const cpu = cloneState.players.cpu;
        
        // ブラッドリコール発動チェック
        // CPUはプールが足りていれば適当に発動する（簡易ロジック）
        if (cpu.bloodRecall && cpu.bloodPool.length >= cpu.bloodRecall.cost) {
            // 戦闘フェイズ開始時やMainのものを発動
            return gameReducer(state, { type: 'ACTIVATE_BLOOD_RECALL', playerId: cpu.id });
        }

        // アクション権がある場合のみクラフトや購入を行う
        if (cpu.remainingActions > 0) {
            // 強化ロジック
            for (const recipe of CRAFT_RECIPES) {
                const matchIds = recipe.inputMatcher(cpu.hand);
                if (matchIds) {
                    return gameReducer(state, { type: 'CRAFT_CARD', playerId: cpu.id, recipeId: recipe.id, paymentCardIds: matchIds });
                }
            }

            // マーケット購入ロジック
            const availablePiles = cloneState.market.recallPiles;
            const affordablePiles = availablePiles.map((pile, index) => {
                 if (pile.length === 0) return null;
                 const card = pile[pile.length - 1];
                 if (card.cost <= cpu.bloodPool.length) return { index, card };
                 return null;
            }).filter(item => item !== null) as { index: number, card: Card }[];

            affordablePiles.sort((a, b) => b.card.attack - a.card.attack);

            if (affordablePiles.length > 0) {
                 return gameReducer(state, { 
                     type: 'RECALL_CARD', 
                     playerId: cpu.id, 
                     pileIndex: affordablePiles[0].index, 
                     paymentCardIds: [] 
                });
            }
        }

        // 自傷はアクション権を使わない（神器タップのみ）と仮定
        if (cpu.regalia && !cpu.regalia.isTapped && cpu.life > 5) {
             return gameReducer(state, { type: 'SELF_HARM', playerId: cpu.id });
        }

        // カードプレイはアクション権を使わない
        const attackCards = cpu.hand.filter(c => c.type !== CardType.Calamity).sort((a,b) => b.attack - a.attack);
        if (attackCards.length > 0) {
            return gameReducer(state, { type: 'PLAY_CARD', playerId: cpu.id, cardId: attackCards[0].id });
        }

        return gameReducer(state, { type: 'PASS_TURN', playerId: cpu.id });
    }

    default:
      return state;
  }
};