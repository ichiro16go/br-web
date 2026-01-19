
import React from 'react';

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
}

const tutorialMessages: { [key: number]: { title: string, text: string, position?: string, hideNext?: boolean } } = {
  0: { 
      title: "Welcome to Blood Recall", 
      text: "このチュートリアルでは、ゲームの基本的な流れとルールを説明します。\nまずは「Next」を押して進めてください。",
      position: "center"
  },
  1: {
      title: "画面の見方",
      text: "下が「あなたのエリア」、上が「相手のエリア」です。\n右側にあるのが「マーケット」で、ここから強力なカードを購入できます。",
      position: "center"
  },
  2: {
      title: "メインフェイズ",
      text: "ゲームは主に「メインフェイズ」で進行します。\nカードの強化、自傷、想起(購入)、プレイを好きな順番で行えます。",
      position: "center"
  },
  3: {
      title: "1. 強化 (Craft)",
      text: "手札にある弱いカードを素材にして、強力なカードを作り出せます。\n左下の「CRAFT」ボタンを見てください。\n(Nextを押して次へ)",
      position: "bottom-left"
  },
  4: {
      title: "実践：強化",
      text: "実際に強化を行ってみましょう。\n「CRAFT」ボタンを押し、「斬撃の強化(II)」を選んで実行してください。",
      position: "bottom-left",
      hideNext: true
  },
  5: {
      title: "血廻 (Circuit)",
      text: "強化に使った素材カードは捨て札ではなく、「血廻(Blood Circuit)」エリアに送られます。\nこれは後で必殺技のコストになります。",
      position: "bottom-left"
  },
  6: {
      title: "2. 自傷 (Self Harm)",
      text: "左にある「神器(Regalia)」カードはあなたの分身です。\nこれをタップしてライフを支払うことで、強力な効果と「ブラッド(お金)」を得られます。",
      position: "bottom-left"
  },
  7: {
      title: "実践：自傷",
      text: "神器をクリックし、「自傷して効果発動」を行ってください。\nシラガネの効果で、手札のカードをさらに強化できます。",
      position: "center",
      hideNext: true
  },
  8: {
      title: "ブラッドプール",
      text: "自傷で支払ったライフは「ブラッドプール」に移動しました。\nこれがカード購入のための通貨になります。",
      position: "bottom-left"
  },
  9: {
      title: "3. 想起 (Recall)",
      text: "右側のマーケットからカードを購入することを「想起」と呼びます。\nブラッドプールの枚数がコストになります。",
      position: "right"
  },
  10: {
      title: "実践：想起",
      text: "マーケットの一番上にある「廃滅の緋」(Cost 4)を購入してください。\n想起ボタンをクリックします。",
      position: "right",
      hideNext: true
  },
  11: {
      title: "4. カードのプレイ",
      text: "手札や購入したカードは、場に出す(プレイする)ことで攻撃力が加算されます。\n手札のカードは全て使い切るのが基本です。",
      position: "bottom"
  },
  12: {
      title: "実践：プレイ",
      text: "手札にあるカードをクリックして、すべて場に出してください。\n(災厄カード以外は全て出す必要があります)",
      position: "bottom",
      hideNext: true 
  },
  13: {
      title: "実践：プレイ継続",
      text: "残りの手札もすべてプレイしてください。",
      position: "bottom",
      hideNext: true
  },
  14: {
      title: "ターン終了",
      text: "やることがなくなったら、右下の「END Turn」ボタンを押してターンを終了します。",
      position: "bottom-right",
      hideNext: true
  },
  15: {
      title: "血戦フェイズ (Blood Battle)",
      text: "お互いがパスするとバトルが発生します。\n現在の総攻撃力(ATK)を比較してください。\n相手は10、あなたはこのターンのプレイ分です。",
      position: "center"
  },
  16: {
      title: "敗北とリソース",
      text: "攻撃力が低いプレイヤーは敗北し、差分のダメージを受けます。\nしかし、受けたダメージ分のライフは「ブラッドプール」へ移動します。\n負けたほうが次のターンの資金(ブラッド)を多く得られます。",
      position: "bottom-left"
  },
  17: {
      title: "先攻後攻の決定",
      text: "このバトルに勝利したプレイヤーが、次のターンの「先攻」になります。\n今回は相手(CPU)が勝ったので、次は相手から始まります。",
      position: "center"
  },
  18: {
      title: "クリンナップフェイズ",
      text: "場のカードは一部を除き捨て札になります。\n山札が尽きたら捨て札をシャッフルして再利用します。\n手札は上限まで補充されます。",
      position: "center"
  },
  19: {
      title: "覚醒 (Awakening)",
      text: "ライフが10以下になると「神器」が覚醒します！\n能力が強化され、条件を満たせば「必殺技」が使えます。\n(システム側であなたのライフを10、血廻を満タンにしました)",
      position: "center"
  },
  20: {
      title: "必殺技 (Blood Recall)",
      text: "血廻(Circuit)に十分なカードがあり、覚醒状態なら必殺技が使えます。\n神器をクリックし、下部の「Activate Blood Recall」でとどめを刺しましょう！",
      position: "center",
      hideNext: true
  }
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext }) => {
  const msg = tutorialMessages[step];
  if (!msg) return null;

  // 位置調整用のクラス
  let positionClass = "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"; // center
  if (msg.position === 'bottom-left') positionClass = "bottom-32 left-8 md:left-32";
  if (msg.position === 'bottom-right') positionClass = "bottom-32 right-8 md:right-32";
  if (msg.position === 'bottom') positionClass = "bottom-40 left-1/2 transform -translate-x-1/2";
  if (msg.position === 'right') positionClass = "top-1/2 right-24 md:right-64 transform -translate-y-1/2";
  if (msg.position === 'top') positionClass = "top-24 left-1/2 transform -translate-x-1/2";

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
        <div className={`absolute ${positionClass} pointer-events-auto bg-blue-900/90 border-2 border-blue-400 p-6 rounded-lg shadow-2xl max-w-sm animate-fade-in`}>
            <h3 className="text-xl font-bold text-blue-200 mb-2 font-cinzel">{msg.title}</h3>
            <p className="text-white text-sm whitespace-pre-wrap leading-relaxed mb-4">
                {msg.text}
            </p>
            {!msg.hideNext && (
                <div className="flex justify-end">
                    <button 
                        onClick={onNext}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold shadow-lg animate-pulse"
                    >
                        Next ▼
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};
