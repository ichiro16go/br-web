import { 
  GameState, PlayerState, ActionType, Phase, Card, CardType, RegaliaCard, BloodRecall 
} from '../types';
import { 
  INITIAL_LIFE, STARTER_DECK_BLOOD_COUNT, STARTER_DECK_SLASH_COUNT,
  createStarterBlood, createStarterSlash, createRecallCard, 
  createUpgradedSlash, createSlashFlash, createLambda,
  createMadness, createObotsuFragment, CRAFT_RECIPES,
  createRedScarletBlood, createMasterySlashFlash,
  createTorrentRedStarBlood, BLOOD_RECALLS
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
    bloodCircuit: [], // 血廻エリア初期化
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

// --- 追憶強化ロジック ---
const getUpgradedCard = (card: Card): Card | null => {
    // 斬撃 (Lv1) -> 斬撃一閃 (Lv2)
    if (card.name === '斬撃') return createSlashFlash();
    // 斬撃一閃 (Lv2) -> 絶技【斬閃】 (Lv3)
    if (card.name === '斬撃一閃') return createMasterySlashFlash();
    
    // 赤血 (Lv1) -> 赤緋血 (Lv2)
    if (card.name === '赤血') return createRedScarletBlood();
    // 赤緋血 (Lv2) -> 奔流【緋星血】 (Lv3)
    if (card.name === '赤緋血') return createTorrentRedStarBlood();

    return null;
};

const executeRemembranceEnhancement = (player: PlayerState, log: string[], filter?: (c: Card) => boolean) => {
    // 手札から強化可能なカードを探す
    const candidates = player.hand.map((c, i) => ({ card: c, index: i }))
        .filter(({ card }) => (card.type === CardType.Slash || card.type === CardType.Blood));
    
    // フィルタ適用
    const validCandidates = filter ? candidates.filter(({ card }) => filter(card)) : candidates;

    if (validCandidates.length === 0) {
        log.push(`${player.name}の手札に【追憶強化】の対象がなかった。`);
        return;
    }

    // 強化対象の決定（簡易的に先頭の候補を選ぶ）
    const targetInfo = validCandidates[0];
    const targetCard = targetInfo.card;
    
    const upgradedCard = getUpgradedCard(targetCard);
    
    if (upgradedCard) {
        // 1. 元のカードを手札から削除
        player.hand.splice(targetInfo.index, 1);
        
        // 2. 元のカードを【血廻】へ送る
        player.bloodCircuit.push(targetCard);
        
        // 3. 強化後のカードを手札に加える
        player.hand.push(upgradedCard);
        
        log.push(`${player.name}は【追憶強化】を行った: ${targetCard.name} -> ${upgradedCard.name} (血廻へ)`);
    } else {
        log.push(`${player.name}の${targetCard.name}はこれ以上強化できない。`);
    }
};

// 場に出たときなどの効果処理（共通化）
const resolveFieldEntryEffects = (player: PlayerState, card: Card, log: string[]) => {
    // ドロー効果
    if (card.description.includes('ドロー') || card.description.includes('Draw')) {
         const drawCount = (card.description.includes('計2枚') || card.description.includes('2ドロー') || card.description.includes('2枚引く')) ? 2 : 1;
         const drawn = drawCard(player, drawCount);
         player.deck = drawn.deck;
         player.hand = drawn.hand;
         player.discard = drawn.discard;
         log.push(`${player.name}は${drawCount}枚引いた。`);
    }

    // ブラッド追加 (これはブラッドプールへ)
    if (card.description.includes('ブラッドプールに加える')) {
        let amount = 0;
        if (card.description.includes('4枚')) amount = 4;
        else if (card.description.includes('3枚')) amount = 3;
        else if (card.description.includes('1枚')) amount = 1;

        if (amount > 0) {
             for(let i=0; i<amount; i++) player.bloodPool.push(createStarterBlood());
             log.push(`${player.name}はブラッド(+${amount})を得た。`);
        }
    }

    // 特定カード獲得
    if (card.description.includes('手札に加える')) {
        if (card.description.includes('赤緋血')) player.hand.push(createRedScarletBlood());
        else if (card.description.includes('斬撃一閃')) player.hand.push(createSlashFlash());
        else if (card.description.includes('絶技【斬閃】')) player.hand.push(createMasterySlashFlash());
        else if (card.description.includes('オボツの欠片')) player.hand.push(createObotsuFragment());
    }

    // 追憶強化
    if (card.description.includes('【追憶強化】')) {
        let filter: ((c: Card) => boolean) | undefined = undefined;
        if (card.description.includes('Lv1アーツ')) {
            filter = (c) => c.level === 1;
        } else if (card.description.includes('Lv1血アーツ')) {
            filter = (c) => c.level === 1 && c.type === CardType.Blood;
        }
        executeRemembranceEnhancement(player, log, filter);
    }
    
    // 機翼の藍の共通効果: ラムダを場に出す
    if (card.name.includes('機翼の藍')) {
        const lambda = createLambda();
        player.field.push(lambda);
        player.attackTotal += lambda.attack;
        log.push(`${player.name} は「自律人器群【ラムダ】」を召喚した (+${lambda.attack} ATK)`);
    }
};

// 天球の蒼の効果処理ヘルパー
const applyBlueSphereEffect = (player: PlayerState, card: Card, log: string[]) => {
    if (card.description.includes('手札にあるアーツカードを1枚選ぶ') || card.description.includes('【追憶強化】する')) {
        executeRemembranceEnhancement(player, log);
    }
    else if (card.description.includes('デッキの上から2枚見る')) {
        log.push(`[天球の蒼] ${player.name}はデッキトップを確認し操作した。`);
    }
    else if (card.description.includes('赤緋血を1枚手札に加える')) {
        player.hand.push(createRedScarletBlood());
        log.push(`[天球の蒼] ${player.name}は赤緋血を手に入れた。`);
    }
    else if (card.description.includes('「ブラッドカード」を3枚')) {
        for(let i=0; i<3; i++) player.bloodPool.push(createStarterBlood());
        log.push(`[天球の蒼] ${player.name}のプールにブラッドカードが3枚追加された。`);
    }
    else if (card.description.includes('斬撃一閃') && card.description.includes('ブラッドプール')) {
        player.hand.push(createSlashFlash());
        player.bloodPool.push(createStarterBlood());
        log.push(`[天球の蒼] ${player.name}は斬撃一閃とブラッドを得た。`);
    }
};

// 共通: 覚醒チェック
const checkAwakening = (player: PlayerState, log: string[]) => {
    if (player.life <= 10 && !player.isRegaliaAwakened) {
        player.isRegaliaAwakened = true;
        log.push(`${player.name} の神器が覚醒した！ (Life <= 10)`);
    }
};

// --- Reducer ---
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

        // コスト確認 (血廻の枚数でチェック)
        if (player.bloodCircuit.length < recall.cost) return state;

        // --- コスト支払いロジック (血廻から消費) ---
        let paidCards: Card[] = [];

        // シラガネの「銀の乱舞」の場合、斬撃カードを優先してコストにする
        if (recall.effectType === 'shiragane_revive') {
             const slashes = player.bloodCircuit.filter(c => c.type === CardType.Slash);
             const others = player.bloodCircuit.filter(c => c.type !== CardType.Slash);
             
             const cost = recall.cost;
             const fromSlashes = slashes.slice(0, cost);
             const remainingCost = cost - fromSlashes.length;
             const fromOthers = others.slice(0, remainingCost); // 斬撃で足りない分を他から
             
             paidCards = [...fromSlashes, ...fromOthers];
             
             // 支払ったカードを血廻から削除 (IDベースでフィルタリング)
             const paidIds = new Set(paidCards.map(c => c.id));
             player.bloodCircuit = player.bloodCircuit.filter(c => !paidIds.has(c.id));
        } else {
             // 通常は先頭から支払う
             paidCards = player.bloodCircuit.splice(0, recall.cost);
        }

        cloneState.log.push(`${player.name} は必殺技「${recall.name}」を発動！ (血廻消費: ${recall.cost})`);

        // --- 効果適用 ---
        // 基本ルール: 必殺技コストとして支払われたカードは「ロストエリア（除外）」に行く。
        // 例外: シラガネ「銀の乱舞」は場に出るので、場を経由して捨て札に行く。

        switch (recall.effectType) {
            case 'shiragane_convert':
                player.activeBuffs.shiraganeConvert = true;
                cloneState.log.push(`[継続] シラガネの効果により自傷ダメージがプール追加に変換されます。`);
                // コストは除外 (何もしない = 消滅)
                break;
            case 'shiragane_revive':
                // コストとして使用した<斬アーツカード>を全て場に出す
                const revived = paidCards.filter(c => c.type === CardType.Slash);
                // 斬撃以外は除外
                
                player.field.push(...revived);
                revived.forEach(c => player.attackTotal += c.attack);
                
                cloneState.log.push(`血廻コストから斬撃カード${revived.length}枚が場に現れた！`);
                break;
            case 'hihi_madness':
                opponent.deck.push(createMadness());
                opponent.deck.push(createMadness());
                cloneState.log.push(`相手のデッキトップに発狂を2枚送り込んだ。`);
                // コストは除外
                break;
            case 'hihi_destroy':
                if (opponent.field.length > 0) {
                    const removed = opponent.field.pop();
                    if (removed) {
                        opponent.discard.push(removed);
                        opponent.attackTotal -= removed.attack;
                        cloneState.log.push(`相手の${removed.name}を破壊した。`);
                    }
                }
                break;
            case 'totsuka_mill':
                const milled = player.deck.splice(0, 4);
                // "血廻り（プール）に送る" -> ここは説明書に従い血廻へ
                player.bloodCircuit.push(...milled);
                cloneState.log.push(`デッキから4枚を血廻へ送った。`);
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
                player.remainingActions += 1;
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
                const lifeToSend = player.lifeCards.splice(0, player.lifeCards.length - 1);
                player.life = 1;
                // ラストスタンド: ライフを全て血廻へ（コストとして）
                player.bloodCircuit.push(...lifeToSend);
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
                                    + player.field.filter(c => c.name === 'オボツの欠片').length;
                const atkBoost = fragmentCount * 2;
                player.attackTotal += atkBoost;
                cloneState.log.push(`[攻撃]+${atkBoost} (欠片x2)`);
                break;
        }

        // コストとして支払われたカードは、原則として「ロスト（除外）」されるため、捨て札には送らない。
        // シラガネの蘇生効果で場に出たものだけが、後のクリーンナップで捨て札に行く。
        
        return cloneState;
    }

    case 'PLAY_CARD': {
      const { playerId, cardId } = action;
      const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
      const player = cloneState.players[playerKey];
      
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return state;

      const card = player.hand[cardIndex];
      if (card.type === CardType.Calamity) return state;

      player.hand.splice(cardIndex, 1);
      player.field.push(card);
      player.attackTotal += card.attack;
      
      cloneState.log.push(`${player.name} は ${card.name} をプレイ (ATK: ${card.attack}).`);

      resolveFieldEntryEffects(player, card, cloneState.log);

       if (card.name === '赤血' || card.name === '赤緋血' || card.name === '奔流【緋星血】' || card.name === '桜流し') {
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
          cloneState.log.push(`${player.name} はブラッドを得た (+${amount} Poolへ)`);
      }

      return cloneState;
    }

    case 'CRAFT_CARD': {
        const { playerId, recipeId, paymentCardIds } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];
        
        if (player.remainingActions <= 0) return state;

        const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return state;

        const removedCards: Card[] = [];
        for (const pid of paymentCardIds) {
            const idx = player.hand.findIndex(c => c.id === pid);
            if (idx !== -1) {
                removedCards.push(player.hand[idx]);
                player.hand.splice(idx, 1);
            }
        }

        if (removedCards.length !== paymentCardIds.length) return state;

        // 素材を血廻（Blood Circuit）へ送る
        player.bloodCircuit.push(...removedCards);

        const resultCard = recipe.createResult();
        player.hand.push(resultCard);
        
        player.remainingActions -= 1;

        cloneState.log.push(`${player.name} は ${recipe.name} を実行 (Act-1, 素材を血廻へ).`);
        return cloneState;
    }

    case 'SELF_HARM': {
        const { playerId } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const opponentKey = playerKey === 'player' ? 'cpu' : 'player';
        const player = cloneState.players[playerKey];
        const opponent = cloneState.players[opponentKey];
        
        if (!player.regalia || player.regalia.isTapped) return state;

        const damage = player.regalia.selfHarmCost;
        if (player.lifeCards.length < damage) return state;

        if (player.activeBuffs.shiraganeConvert) {
             for(let i=0; i<damage; i++) player.bloodPool.push(createStarterBlood());
             cloneState.log.push(`${player.name}はシラガネの効果で自傷ダメージを無効化し、血を得た！`);
        } else {
            const lostLife = player.lifeCards.splice(0, damage);
            player.bloodPool.push(...lostLife);
            player.life -= damage;
        }

        player.regalia.isTapped = true;
        
        // --- 神器ごとの効果 ---
        switch (player.regalia.id) {
            case 'regalia-shiragane':
                const slashIndex = player.hand.findIndex(c => c.name === '斬撃');
                if (slashIndex !== -1) {
                    player.hand.splice(slashIndex, 1);
                    player.hand.push(createUpgradedSlash(2));
                    cloneState.log.push(`${player.name}はシラガネを使用: 手札の斬撃を強化した。`);
                } else {
                    cloneState.log.push(`${player.name}はシラガネを使用: しかし強化対象がなかった。`);
                }
                break;
            case 'regalia-hihiirokane':
                player.hand.push(createSlashFlash());
                cloneState.log.push(`${player.name}はヒヒイロカネを使用: 『斬撃一閃』を手に入れた。`);
                break;
            case 'regalia-totsukamatsurugi':
                opponent.discard.push(createMadness());
                cloneState.log.push(`${player.name}はトツカマヂチを使用: 相手の捨て札に『発狂』を送り込んだ。`);
                break;
            case 'regalia-niraikanai':
                const milled = player.deck.splice(0, 2);
                player.bloodPool.push(...milled); // ニライカナイは「プールへ送る」とある
                cloneState.log.push(`${player.name}はニライカナイを使用: 山札から${milled.length}枚をプールへ送った。`);
                break;
            case 'regalia-kutoneshirika':
                player.bloodPool.push(createStarterBlood());
                cloneState.log.push(`${player.name}はクトネシリカを使用: プールに赤血を追加した。`);
                break;
            case 'regalia-apoitakara':
                const drawn = drawCard(player, 1);
                player.deck = drawn.deck;
                player.hand = drawn.hand;
                player.discard = drawn.discard;
                cloneState.log.push(`${player.name}はアポイタカラを使用: 1枚引いた。`);
                break;
            case 'regalia-usuganeyoroi':
                player.hand.push(createStarterSlash());
                cloneState.log.push(`${player.name}はウスガネヨロイを使用: 斬撃を手に入れた。`);
                break;
            case 'regalia-obotsukagura':
                player.hand.push(createObotsuFragment());
                cloneState.log.push(`${player.name}はオボツカグラを使用: 『オボツの欠片』を手に入れた。`);
                break;
            default:
                break;
        }

        checkAwakening(player, cloneState.log);

        return cloneState;
    }

    case 'RECALL_CARD': {
        const { playerId, pileIndex } = action;
        const playerKey = playerId === state.players.player.id ? 'player' : 'cpu';
        const player = cloneState.players[playerKey];

        if (player.remainingActions <= 0) return state;

        const pile = cloneState.market.recallPiles[pileIndex];
        if (!pile || pile.length === 0) return state;

        const marketCard = pile[pile.length - 1];

        // 想起（Recall）はブラッドプールを使用する
        if (player.bloodPool.length < marketCard.cost) return state; 
        
        // 支払い: プールから取り除く
        const paid = player.bloodPool.splice(0, marketCard.cost);
        
        // 修正: 支払いに使ったカードは「契告書エリアに戻る」=「デッキには戻らない（消滅）」
        // したがって、discardには送らず、paidは虚空へ消える。
        
        pile.pop();
        
        player.field.push(marketCard); 
        player.attackTotal += marketCard.attack; 

        resolveFieldEntryEffects(player, marketCard, cloneState.log);

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
            if (loser.activeBuffs.damageReduction && loser.activeBuffs.damageReduction > 0) {
                const originalDamage = damage;
                damage = Math.max(0, damage - loser.activeBuffs.damageReduction);
                cloneState.log.push(`${loser.name}はダメージを軽減した (${originalDamage} -> ${damage})`);
                loser.activeBuffs.damageReduction = 0;
            }

            cloneState.log.push(`${winner.name} の勝利! ${damage} ダメージを与える.`);
            const actualDamage = Math.min(damage, loser.lifeCards.length);
            const damagedCards = loser.lifeCards.splice(0, actualDamage);
            loser.bloodPool.push(...damagedCards);
            loser.life -= actualDamage;
            cloneState.firstPlayerId = winner.id;
            
            // ダメージを受けたので覚醒チェック
            checkAwakening(loser, cloneState.log);

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
            if (p.activeBuffs.usuganeBurn) {
                const opponentKey = p.id === 'p1' ? 'cpu' : 'player';
                const opponent = cloneState.players[opponentKey];
                if (opponent.life > 0) {
                     const burnDamage = Math.min(2, opponent.lifeCards.length);
                     const burned = opponent.lifeCards.splice(0, burnDamage);
                     opponent.bloodPool.push(...burned);
                     opponent.life -= burnDamage;
                     cloneState.log.push(`ウスガネヨロイの効果: ${opponent.name}に2ダメージ！`);
                     checkAwakening(opponent, cloneState.log);
                }
            }
            
            const remainingCards = [];
            const discardCards = [];
            
            for (const card of p.field) {
                if (card.name === '天球の蒼' || card.description.includes('場に残る')) {
                    remainingCards.push(card);
                } else {
                    discardCards.push(card);
                }
            }

            p.discard.push(...discardCards);
            p.field = remainingCards;

            // ブラッドプールはクリーンナップで消滅する（契告書エリアに戻るため、デッキには戻らない）
            p.bloodPool = [];
            
            // 血廻（Blood Circuit）は維持する
            
            p.attackTotal = 0;
            p.hasPassed = false;
            
            const pactBonus = p.activeBuffs.kutonePactBonus || 0;
            p.remainingActions = (p.regalia ? p.regalia.bloodPact : 1) + pactBonus;
            
            if (p.regalia) p.regalia.isTapped = false;
            
            // 手札の処理: 次のターンへ持ち越し不可。全て捨て札へ。
            // 修正: 「発狂」が含まれていた場合は捨て札に送らずに消滅させる。
            const handToDiscard: Card[] = [];
            for (const card of p.hand) {
                if (card.name === '発狂') {
                    cloneState.log.push(`${p.name}の手札の「発狂」は消滅した。`);
                    // 捨て札に追加しない = 消滅
                } else {
                    handToDiscard.push(card);
                }
            }
            p.discard.push(...handToDiscard);
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
        
        // 血廻の枚数で必殺技チェック
        if (cpu.bloodRecall && cpu.bloodCircuit.length >= cpu.bloodRecall.cost) {
            return gameReducer(state, { type: 'ACTIVATE_BLOOD_RECALL', playerId: cpu.id });
        }

        if (cpu.remainingActions > 0) {
            for (const recipe of CRAFT_RECIPES) {
                const matchIds = recipe.inputMatcher(cpu.hand);
                if (matchIds) {
                    return gameReducer(state, { type: 'CRAFT_CARD', playerId: cpu.id, recipeId: recipe.id, paymentCardIds: matchIds });
                }
            }

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

        if (cpu.regalia && !cpu.regalia.isTapped && cpu.life > 5) {
             return gameReducer(state, { type: 'SELF_HARM', playerId: cpu.id });
        }

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