import { Card, CardType, RegaliaCard, BloodRecall } from '../types';
import { generateId } from '../utils/common';

// --- 神器（Regalia）の定義 (全8種) ---
// base: 覚醒前, awakened: 覚醒後
export const REGALIA_LIST: RegaliaCard[] = [
    {
      id: 'regalia-shiragane',
      name: 'シラガネ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '1980年代に観測された神器。',
      year: 1980,
      base: {
          handSize: 3, bloodPact: 2, selfHarmCost: 2,
          selfHarmEffectDesc: '手札にある「斬撃」(Lv1) 1枚を「斬撃一閃」(Lv2) に強化する。'
      },
      awakened: {
          handSize: 3, bloodPact: 2, selfHarmCost: 2,
          selfHarmEffectDesc: '手札にある「斬撃」(Lv1) 2枚を「斬撃一閃」(Lv2) に強化する。'
      }
    },
    {
      id: 'regalia-hihiirokane',
      name: 'ヒヒイロカネ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '1920年代に観測。古の金属で作られた刃。',
      year: 1920,
      base: {
          handSize: 3, bloodPact: 2, selfHarmCost: 4,
          selfHarmEffectDesc: '契告書から『斬撃一閃』を1枚手札に加える。'
      },
      awakened: {
          handSize: 4, bloodPact: 2, selfHarmCost: 4,
          selfHarmEffectDesc: '契告書から『絶技【斬閃】』を1枚手札に加える。'
      }
    },
    {
      id: 'regalia-totsukamatsurugi',
      name: 'トツカマヂチ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '1950年代に観測。呪いをまき散らす剣。',
      year: 1950,
      base: {
          handSize: 4, bloodPact: 2, selfHarmCost: 2,
          selfHarmEffectDesc: '相手の捨て札に『発狂』を1枚置く。'
      },
      awakened: {
          handSize: 4, bloodPact: 2, selfHarmCost: 2,
          selfHarmEffectDesc: '相手のデッキの1枚目(トップ)に『発狂』を置く。'
      }
    },
    {
      id: 'regalia-niraikanai',
      name: 'ニライカナイ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '2000年代に観測。理想郷への扉。',
      year: 2000,
      base: {
          handSize: 3, bloodPact: 2, selfHarmCost: 3,
          selfHarmEffectDesc: '自分の山札の上から2枚をブラッドプールに送る。'
      },
      awakened: {
          handSize: 3, bloodPact: 2, selfHarmCost: 3,
          selfHarmEffectDesc: '契告書から段階1のアーツを2枚選び、血廻エリアに送る。'
      }
    },
    {
      id: 'regalia-kutoneshirika',
      name: 'クトネシリカ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '2020年代に観測。英雄の魂が宿る。',
      year: 2020,
      base: {
          handSize: 5, bloodPact: 1, selfHarmCost: 5,
          selfHarmEffectDesc: '契告書から「赤血」を1枚、ブラッドプールに加える。'
      },
      awakened: {
          handSize: 5, bloodPact: 1, selfHarmCost: 3,
          selfHarmEffectDesc: '契告書から「赤血」を3枚、ブラッドプールに加える。'
      }
    },
    {
      id: 'regalia-apoitakara',
      name: 'アポイタカラ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '2040年代に観測。アイヌの秘宝。',
      year: 2040,
      base: {
          handSize: 4, bloodPact: 2, selfHarmCost: 1,
          selfHarmEffectDesc: 'デッキからカードを1枚引く。'
      },
      awakened: {
          handSize: 4, bloodPact: 2, selfHarmCost: 2,
          selfHarmEffectDesc: 'デッキの上から3枚見る。そのうち1枚を手札に加え、残りを捨て札にする。'
      }
    },
    {
      id: 'regalia-usuganeyoroi',
      name: 'ウスガネヨロイ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '1940年代に観測。鉄壁の守りの中に刃を隠す。',
      year: 1940,
      base: {
          handSize: 4, bloodPact: 2, selfHarmCost: 3,
          selfHarmEffectDesc: '契告書から「斬撃」を1枚手札に加える。'
      },
      awakened: {
          handSize: 4, bloodPact: 2, selfHarmCost: 4,
          selfHarmEffectDesc: '契告書から「斬撃」を2枚手札に加える。'
      }
    },
    {
      id: 'regalia-obotsukagura',
      name: 'オボツカグラ',
      type: CardType.Regalia,
      attack: 0,
      cost: 0,
      level: 0,
      description: '2010年代に観測。天と地をつなぐ神楽。',
      year: 2010,
      base: {
          handSize: 3, bloodPact: 2, selfHarmCost: 1,
          selfHarmEffectDesc: '契告書から「オボツの欠片」を1枚手札に加える。'
      },
      awakened: {
          handSize: 3, bloodPact: 2, selfHarmCost: 3,
          selfHarmEffectDesc: '契告書から「オボツの欠片」を1枚手札に加える。その後、手札2枚まで血廻へ送り、送った数だけ引く。'
      }
    }
  ];
  
  // --- ブラッドリコール定義 (16種) ---
  export const BLOOD_RECALLS: BloodRecall[] = [
      // シラガネ
      { id: 'br-shiragane-1', name: '無垢なる痛み', regaliaId: 'regalia-shiragane', cost: 6, timing: 'Cleanup', description: '【継続】自傷ダメージを受ける代わりに、その数だけブラッドカードをプールに加える。', effectType: 'shiragane_convert' },
      { id: 'br-shiragane-2', name: '銀の乱舞', regaliaId: 'regalia-shiragane', cost: 10, timing: 'Main', description: 'コストとして使用した斬撃アーツを全て場に出す（今回は簡易的にLv1斬撃を3枚場に出す）。', effectType: 'shiragane_revive' },
      
      // ヒヒイロカネ
      { id: 'br-hihiirokane-1', name: '狂気の感染', regaliaId: 'regalia-hihiirokane', cost: 6, timing: 'Main', description: '契告書（マーケット）から「発狂」を2枚、相手のデッキの上に置く。', effectType: 'hihi_madness' },
      { id: 'br-hihiirokane-2', name: '存在の剥奪', regaliaId: 'regalia-hihiirokane', cost: 10, timing: 'BattleStart', description: '相手の場にあるカードを1枚選び、捨て札に送る。', effectType: 'hihi_destroy' },
  
      // トツカマヂチ
      { id: 'br-totsuka-1', name: '呪詛の深淵', regaliaId: 'regalia-totsukamatsurugi', cost: 2, timing: 'Main', description: 'デッキの上からカードを4枚、血廻り（プール）に送る。', effectType: 'totsuka_mill' },
      { id: 'br-totsuka-2', name: '殺意の波動', regaliaId: 'regalia-totsukamatsurugi', cost: 10, timing: 'BattleStart', description: '[攻撃]+10 (本来はコストXだが簡易化)。', effectType: 'totsuka_atk' },
  
      // ニライカナイ
      { id: 'br-niraikanai-1', name: '理想郷の守護', regaliaId: 'regalia-niraikanai', cost: 6, timing: 'OnDamage', description: '次のダメージを-8軽減する。', effectType: 'nirai_shield' },
      { id: 'br-niraikanai-2', name: '楽園の光', regaliaId: 'regalia-niraikanai', cost: 12, timing: 'BattleStart', description: '[攻撃]+X。Xは自分の場のカード数に等しい。', effectType: 'nirai_field_atk' },
  
      // クトネシリカ
      { id: 'br-kutone-1', name: '英雄の血脈', regaliaId: 'regalia-kutoneshirika', cost: 4, timing: 'Cleanup', description: '【継続】人器の血継(Act)を+1する。', effectType: 'kutone_pact' },
      { id: 'br-kutone-2', name: '神威', regaliaId: 'regalia-kutoneshirika', cost: 6, timing: 'BattleStart', description: '[攻撃]+10。', effectType: 'kutone_atk' },
  
      // アポイタカラ
      { id: 'br-apoi-1', name: '叡智の探求', regaliaId: 'regalia-apoitakara', cost: 8, timing: 'Main', description: 'デッキからカードを2枚引く。', effectType: 'apoi_draw' },
      { id: 'br-apoi-2', name: '秘宝の輝き', regaliaId: 'regalia-apoitakara', cost: 12, timing: 'Main', description: '[攻撃]+8。', effectType: 'apoi_atk' },
  
      // ウスガネヨロイ
      { id: 'br-usugane-1', name: '棘の鎧', regaliaId: 'regalia-usuganeyoroi', cost: 8, timing: 'Cleanup', description: '【継続】クリーンナップフェイズに相手に2ダメージを与える。', effectType: 'usugane_burn' },
      { id: 'br-usugane-2', name: '決死の覚悟', regaliaId: 'regalia-usuganeyoroi', cost: 10, timing: 'BattleStart', description: 'ライフが1になるようにプールへ送り、送った数だけATKを得る。', effectType: 'usugane_last_stand' },
  
      // オボツカグラ
      { id: 'br-obotsu-1', name: '神楽舞', regaliaId: 'regalia-obotsukagura', cost: 5, timing: 'Main', description: '即座に覚醒する。既に覚醒していれば1ドロー。', effectType: 'obotsu_awaken' },
      { id: 'br-obotsu-2', name: '天地の共鳴', regaliaId: 'regalia-obotsukagura', cost: 6, timing: 'BattleStart', description: '[攻撃]+X。Xは「オボツの欠片」の数×2。', effectType: 'obotsu_fragment_atk' }
  ];
  