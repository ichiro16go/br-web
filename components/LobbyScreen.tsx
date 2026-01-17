import React, { useState, useEffect } from 'react';

interface LobbyScreenProps {
  onBack: () => void;
  onMatchMade: (roomId: string, isHost: boolean) => void;
}

type LobbyMode = 'menu' | 'create' | 'join' | 'waiting';

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onBack, onMatchMade }) => {
  const [mode, setMode] = useState<LobbyMode>('menu');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // パスコードのバリデーション (2〜10文字)
  const validatePasscode = (code: string) => {
    return code.length >= 2 && code.length <= 10;
  };

  const handleCreateRoom = () => {
    if (!validatePasscode(passcode)) {
      setError('パスコードは2〜10文字で入力してください');
      return;
    }
    setError('');
    setIsConnecting(true);

    // TODO: ここでバックエンドに「ルーム作成」リクエストを送る
    // 今回はモックとして1秒後に待機画面へ遷移
    setTimeout(() => {
      setIsConnecting(false);
      setMode('waiting');
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!validatePasscode(passcode)) {
        setError('パスコードは2〜10文字で入力してください');
        return;
      }
      setError('');
      setIsConnecting(true);
  
      // TODO: ここでバックエンドに「ルーム入室」リクエストを送る
      // 今回はモックとして1.5秒後にマッチング成立とみなす
      setTimeout(() => {
        setIsConnecting(false);
        // マッチング成立！ (RoomID, isHost=false)
        onMatchMade(passcode, false); 
      }, 1500);
  };

  // 待機画面でのキャンセル
  const handleCancelWait = () => {
      // TODO: ルーム削除リクエスト
      setMode('menu');
      setPasscode('');
  };

  // 待機画面のシミュレーション（ホスト側）
  useEffect(() => {
    if (mode === 'waiting') {
        // TODO: ここでWebSocketやポーリングで「ゲストが入室したか」を監視する
        // 今回はデモ用に3秒後に誰かが入ってきたことにする
        const timer = setTimeout(() => {
            onMatchMade(passcode, true);
        }, 4000);
        return () => clearTimeout(timer);
    }
  }, [mode, passcode, onMatchMade]);

  return (
    <div className="min-h-screen bg-[#0f0808] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] flex flex-col items-center justify-center text-white p-4 font-sans">
        
        {/* 背景装飾 */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-900 rounded-full blur-[128px]"></div>
        </div>

        <div className="max-w-md w-full z-10">
            
            {/* Header */}
            <div className="text-center mb-10">
                <h2 className="text-4xl font-cinzel font-bold text-gray-200 tracking-widest mb-2">LOBBY</h2>
                <div className="h-px w-24 bg-red-800 mx-auto"></div>
            </div>

            {/* Menu Mode */}
            {mode === 'menu' && (
                <div className="flex flex-col gap-4 animate-fade-in-up">
                    <button 
                        onClick={() => { setMode('create'); setPasscode(''); setError(''); }}
                        className="p-6 border border-gray-700 bg-gray-900/80 hover:bg-gray-800 hover:border-red-500 rounded-lg transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-900/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                        <h3 className="text-xl font-bold text-red-100 mb-1 relative z-10">CREATE ROOM</h3>
                        <p className="text-xs text-gray-400 relative z-10">合言葉を決めて、対戦相手を待ちます。</p>
                    </button>

                    <button 
                        onClick={() => { setMode('join'); setPasscode(''); setError(''); }}
                        className="p-6 border border-gray-700 bg-gray-900/80 hover:bg-gray-800 hover:border-blue-500 rounded-lg transition-all group text-left relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-900/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                        <h3 className="text-xl font-bold text-blue-100 mb-1 relative z-10">JOIN ROOM</h3>
                        <p className="text-xs text-gray-400 relative z-10">合言葉を入力して、ルームに参加します。</p>
                    </button>

                    <button onClick={onBack} className="mt-8 text-gray-500 hover:text-white transition-colors text-sm">
                        ← Back to Title
                    </button>
                </div>
            )}

            {/* Create / Join Input Mode */}
            {(mode === 'create' || mode === 'join') && (
                <div className="bg-gray-900/90 border border-gray-700 p-8 rounded-lg shadow-2xl animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-6">
                        {mode === 'create' ? 'ROOM SETTINGS' : 'ENTER PASSCODE'}
                    </h3>

                    <div className="mb-6">
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Passcode (Room ID)</label>
                        <input 
                            type="text" 
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                            placeholder="SECRET123"
                            className="w-full bg-black/50 border border-gray-600 rounded p-3 text-center text-xl font-mono tracking-widest focus:border-red-500 outline-none transition-colors uppercase"
                            maxLength={10}
                        />
                        <p className="text-[10px] text-gray-500 mt-2 text-center">
                            2〜10文字の英数字を入力してください
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center mb-4 bg-red-950/30 p-2 rounded border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setMode('menu')}
                            className="flex-1 py-3 border border-gray-600 rounded text-gray-400 hover:bg-gray-800 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                            disabled={isConnecting}
                            className={`flex-1 py-3 rounded font-bold transition-all ${
                                mode === 'create' 
                                    ? 'bg-red-800 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(153,27,27,0.4)]' 
                                    : 'bg-blue-800 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(30,64,175,0.4)]'
                            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isConnecting ? 'Processing...' : (mode === 'create' ? 'CREATE' : 'JOIN')}
                        </button>
                    </div>
                </div>
            )}

            {/* Waiting Mode */}
            {mode === 'waiting' && (
                <div className="text-center animate-fade-in">
                    <div className="inline-block relative mb-8">
                         <div className="w-16 h-16 border-4 border-red-900 rounded-full animate-ping absolute top-0 left-0"></div>
                         <div className="w-16 h-16 border-4 border-t-red-500 border-r-transparent border-b-red-900 border-l-transparent rounded-full animate-spin relative z-10"></div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-200 mb-2">Waiting for Challenger...</h3>
                    <div className="bg-black/40 border border-gray-700 rounded px-6 py-3 inline-block mb-8">
                        <span className="text-xs text-gray-500 block mb-1">PASSCODE</span>
                        <span className="text-2xl font-mono tracking-widest text-red-400 font-bold">{passcode}</span>
                    </div>

                    <div>
                        <button 
                            onClick={handleCancelWait}
                            className="text-gray-500 hover:text-white underline text-sm"
                        >
                            Cancel Room
                        </button>
                    </div>

                    <p className="text-xs text-gray-600 mt-8 max-w-xs mx-auto">
                        ※この画面のままお待ちください。対戦相手が同じパスコードを入力するとゲームが開始されます。
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};
