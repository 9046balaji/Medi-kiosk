import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { ConversationTurn } from '../../../../types';
import { MessageSquare, Volume2 } from 'lucide-react';

interface VoiceIntakeCardProps {
  conversationHistory: ConversationTurn[];
  fallbackTranscript: string;
  onPlayTts: (text: string) => void;
}

export const VoiceIntakeCard: React.FC<VoiceIntakeCardProps> = ({
  conversationHistory,
  fallbackTranscript,
  onPlayTts
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2 font-black text-sm text-slate-100">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span><T text="Patient Speech Intake Dialogue" /></span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-700 text-teal-300 rounded-md">
          IndicConformer 600M
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50 text-xs">
        {conversationHistory.length > 0 ? (
          conversationHistory.map((turn, tIdx) => (
            <div key={tIdx} className={`flex flex-col ${turn.speaker === 'patient' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-bold">
                <span>{turn.speaker === 'patient' ? '🧑 Patient' : '🤖 MedGemma AI'}</span>
                <button onClick={() => onPlayTts(turn.text)} className="p-0.5 hover:text-teal-300 text-slate-400 cursor-pointer">
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
              <div className={`p-3 rounded-2xl leading-relaxed max-w-[90%] ${
                turn.speaker === 'patient'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none font-medium'
              }`}>
                {turn.text}
                {turn.translatedText && (
                  <div className="text-[11px] opacity-80 pt-1 border-t border-white/20 mt-1 font-semibold">
                    Translation: {turn.translatedText}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-slate-400 text-center font-medium">
            {fallbackTranscript || 'No voice transcript recorded.'}
          </div>
        )}
      </div>
    </div>
  );
};
