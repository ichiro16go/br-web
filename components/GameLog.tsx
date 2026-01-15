import React, { useRef, useEffect, useState } from 'react';
import { Phase } from '../types';

interface GameLogProps {
  logs: string[];
  turnPlayerId: string;
  phase: Phase;
}

export const GameLog: React.FC<GameLogProps> = ({ logs, turnPlayerId, phase }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // 新しいログが追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = () => {
    const logText = logs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }).catch(err => {
      console.error('Failed to copy logs:', err);
    });
  };

  return (
    <div className="w-48 bg-black/60 border-r border-red-900/30 flex flex-col hidden lg:flex z-20 h-full pointer-events-auto">
      {/* ヘッダー & コピーボタン */}
      <div className="p-2 bg-red-950/20 border-b border-red-900/30 flex justify-between items-center shrink-0">
         <span className="font-cinzel text-red-500 text-sm">Round Log</span>
         <button 
            onClick={handleCopy} 
            className={`
                text-[10px] px-2 py-0.5 rounded border transition-all duration-200
                ${copyFeedback 
                    ? 'bg-green-900/50 text-green-300 border-green-700' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500'}
            `}
            title="Copy logs to clipboard"
         >
            {copyFeedback ? 'Copied!' : 'Copy'}
         </button>
      </div>
      
      {/* ログ本文エリア (選択可能にするため select-text を適用) */}
      <div 
        className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-2 custom-scrollbar select-text cursor-text" 
        ref={scrollRef}
      >
           {logs.map((msg, i) => (
              <div key={i} className="border-b border-white/5 pb-1 text-gray-400 last:text-white break-words">
                  {msg}
              </div>
          ))}
      </div>

      {/* ステータス表示エリア */}
      <div className="p-4 border-t border-red-900/30 bg-black/40 shrink-0">
          <div className="text-xs text-gray-500 uppercase mb-1">Turn</div>
          <div className={`text-sm font-bold ${turnPlayerId === 'p1' ? 'text-red-400' : 'text-blue-400'}`}>
              {turnPlayerId === 'p1' ? 'YOUR TURN' : 'CPU TURN'}
          </div>
          <div className="mt-2 text-xs text-gray-500 uppercase mb-1">Phase</div>
          <div className="text-sm font-bold text-white">{phase}</div>
      </div>
    </div>
  );
};