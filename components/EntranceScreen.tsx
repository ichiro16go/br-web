import React, { useState } from 'react';
import { Card } from './Card'; // 装飾用にCardコンポーネントを使用（必須ではないが雰囲気作りに）

interface EntranceScreenProps {
  onStartSolo: () => void;
  onStartVersus: () => void;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({ onStartSolo, onStartVersus }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0505] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
      
      {/* 背景装飾 */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-900 rounded-full blur-[128px] mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900 rounded-full blur-[128px] mix-blend-screen"></div>
      </div>

      <div className="z-10 flex flex-col items-center max-w-4xl w-full">
        {/* タイトルロゴエリア */}
        <div className="mb-16 text-center animate-fade-in-down">
          <h1 className="text-6xl lg:text-8xl font-cinzel text-red-600 tracking-wider drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] mb-2">
            BLOOD RECALL
          </h1>
          <p className="text-gray-400 font-cinzel tracking-[0.5em] text-sm lg:text-base uppercase">
            The Deck-Building Game
          </p>
        </div>

        {/* メニューボタンエリア */}
        <div className="flex flex-col gap-6 w-full max-w-lg animate-fade-in-up">
          <button 
            onClick={onStartSolo}
            className="group relative bg-gradient-to-r from-red-950 to-black border-2 border-red-800 p-6 rounded-lg overflow-hidden hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105"
          >
            <div className="absolute inset-0 bg-red-600/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
            <h2 className="text-2xl font-cinzel font-bold text-red-100 group-hover:text-white relative z-10 flex items-center justify-center gap-3">
              <span>⚔️</span> SOLO MODE <span className="text-xs opacity-60 font-sans tracking-normal bg-red-900/50 px-2 py-1 rounded">vs CPU</span>
            </h2>
          </button>

          <button 
            onClick={() => {}} 
            disabled
            className="group relative bg-gray-900 border-2 border-gray-700 p-6 rounded-lg opacity-60 cursor-not-allowed"
          >
            <h2 className="text-2xl font-cinzel font-bold text-gray-500 relative z-10 flex items-center justify-center gap-3">
              <span>👥</span> VERSUS MODE <span className="text-xs font-sans tracking-normal border border-gray-600 px-2 py-1 rounded">Coming Soon</span>
            </h2>
          </button>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent my-2"></div>

          <button 
            onClick={() => setShowRules(true)}
            className="text-gray-400 hover:text-red-400 font-cinzel transition-colors underline decoration-red-900/50 hover:decoration-red-500 decoration-2 underline-offset-4"
          >
            📖 RULE BOOK / 遊び方
          </button>
        </div>
      </div>

      {/* ルールブックモーダル */}
      {showRules && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowRules(false)}>
          <div className="bg-[#151010] border-2 border-red-900/50 rounded-lg max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
            {/* ヘッダー */}
            <div className="p-6 border-b border-red-900/30 flex justify-between items-center bg-black/20">
              <h2 className="text-3xl font-cinzel text-red-500">How to Play</h2>
              <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
            </div>

            {/* コンテンツエリア (スクロール可能) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 text-gray-300 leading-relaxed">
              
              {/* 1. ゲームの目的 */}
              <section>
                <h3 className="text-xl font-bold text-red-400 mb-3 border-l-4 border-red-600 pl-3">1. ゲームの目的</h3>
                <p className="mb-2">
                  『Blood Recall』はデッキ構築を行い、血戦での勝利を目指すカードゲームです。<br/>
                  お互いのプレイヤーは20のライフを持ってゲームを開始します。
                </p>
                <div className="bg-red-900/10 border border-red-900/30 p-4 rounded text-center">
                  <span className="block text-red-300 font-bold">勝利条件：相手のライフを0にする</span>
                  <span className="block text-gray-500 text-sm mt-1">敗北条件：自分のライフが0になる</span>
                </div>
              </section>

              {/* 2. ゲームの流れ */}
              <section>
                <h3 className="text-xl font-bold text-red-400 mb-3 border-l-4 border-red-600 pl-3">2. ターンの流れ</h3>
                <p className="mb-4">ゲームは以下の3つのフェイズを繰り返して進行します。</p>
                
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded border border-gray-800">
                    <h4 className="font-bold text-white mb-2">① メインフェイズ (Action)</h4>
                    <p className="text-sm">カードのプレイ、購入、強化を行うフェイズです。以下の行動を好きな順序で行えます。</p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-gray-400">
                      <li><strong className="text-gray-200">カードのプレイ:</strong> 手札からカードを場に出し、効果を発動します（攻撃力アップなど）。</li>
                      <li><strong className="text-gray-200">自傷 (Self Harm):</strong> 神器（キャラクターカード）をタップし、ライフを支払うことで強力な効果とブラッドを得ます。</li>
                      <li><strong className="text-gray-200">想起 (Recall):</strong> ブラッド（コスト）を支払い、マーケットから強力なカードを購入します。</li>
                      <li><strong className="text-gray-200">強化 (Craft):</strong> 手札のカードを素材（コスト）にして、上位のカードを作り出します。</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-4 rounded border border-gray-800">
                    <h4 className="font-bold text-red-300 mb-2">② 血戦フェイズ (Blood Battle)</h4>
                    <p className="text-sm">
                      お互いの<strong className="text-yellow-500">総攻撃力 (ATK)</strong> を比較します。<br/>
                      数値が高い方が勝者となり、<strong className="text-red-400">「差分」のダメージ</strong>を敗者に与えます。<br/>
                      ダメージを受けたプレイヤーは、ライフエリアからダメージ分のカードをブラッドプールへ送ります（これがリソースになります）。
                    </p>
                  </div>

                  <div className="bg-black/30 p-4 rounded border border-gray-800">
                    <h4 className="font-bold text-blue-300 mb-2">③ クリンナップフェイズ (Cleanup)</h4>
                    <p className="text-sm">
                      場のカードと手札をすべて捨て札にします（一部の永続カードを除く）。<br/>
                      その後、デッキから手札上限までカードを引きます。<br/>
                      ※デッキが尽きた場合、捨て札をシャッフルして新たなデッキとします。
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. 特殊ルール */}
              <section>
                <h3 className="text-xl font-bold text-red-400 mb-3 border-l-4 border-red-600 pl-3">3. 重要なシステム</h3>
                
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-purple-900/10 p-4 rounded border border-purple-900/30">
                    <h4 className="font-bold text-purple-300 mb-2">人器覚醒 (Awakening)</h4>
                    <p className="text-sm text-gray-400">
                      自分のライフが <strong className="text-white">10以下</strong> になると、所持している神器が「覚醒」します。<br/>
                      覚醒するとステータスが強化され、必殺技（ブラッドリコール）の使用が可能になります。
                    </p>
                  </div>
                  <div className="bg-red-900/10 p-4 rounded border border-red-900/30">
                    <h4 className="font-bold text-red-300 mb-2">ブラッドリコール (Ultimate)</h4>
                    <p className="text-sm text-gray-400">
                      各キャラクター固有の必殺技です。<br/>
                      <strong className="text-white">神器が覚醒</strong>しており、かつ<strong className="text-white">「血廻（Blood Circuit）」</strong>に十分なカードが溜まっている場合のみ発動できます。
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. 用語集 */}
              <section>
                <h3 className="text-xl font-bold text-red-400 mb-3 border-l-4 border-red-600 pl-3">4. 用語・エリア解説</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 border-b border-gray-800 pb-2">
                    <dt className="w-32 font-bold text-gray-200">ブラッドプール</dt>
                    <dd className="flex-1 text-gray-400">お金の役割。ダメージを受けたり、「赤血」などのカードを使用するとここにカードが溜まります。カード購入（Recall）に使用します。</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 border-b border-gray-800 pb-2">
                    <dt className="w-32 font-bold text-purple-300">血廻 (Circuit)</dt>
                    <dd className="flex-1 text-gray-400">魔力の充填場所。カードの強化（素材にしたカード）や、一部の効果によってここにカードが送られます。必殺技のコストとして消費します。</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 border-b border-gray-800 pb-2">
                    <dt className="w-32 font-bold text-yellow-300">追憶強化</dt>
                    <dd className="flex-1 text-gray-400">手札にある特定のカードを、ゲーム外にある強力なカードに入れ替える処理のことです。</dd>
                  </div>
                </dl>
              </section>

            </div>
            
            {/* フッター */}
            <div className="p-4 border-t border-red-900/30 bg-black/40 text-center">
              <button 
                onClick={() => setShowRules(false)}
                className="bg-red-800 hover:bg-red-700 text-white px-8 py-2 rounded font-bold transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
