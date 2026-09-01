import React from 'react';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import {
  MessageSquare,
  Sparkles,
  Volume2,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Radio,
  Send
} from 'lucide-react';

interface PatientMedGemmaTabProps {
  expandedConsultationId: string | null;
  setExpandedConsultationId: (id: string | null) => void;
  patientAiMessages: { speaker: 'patient' | 'ai'; text: string; time: string }[];
  aiChatInput: string;
  setAiChatInput: (val: string) => void;
  aiChatLoading: boolean;
  isListening: boolean;
  activeSpeakingText: string | null;
  onPlayTts: (text: string) => void;
  onToggleSpeechRecognition: () => void;
  onAskMedGemma: (prompt?: string) => void;
}

export const PatientMedGemmaTab: React.FC<PatientMedGemmaTabProps> = ({
  expandedConsultationId,
  setExpandedConsultationId,
  patientAiMessages,
  aiChatInput,
  setAiChatInput,
  aiChatLoading,
  isListening,
  activeSpeakingText,
  onPlayTts,
  onToggleSpeechRecognition,
  onAskMedGemma
}) => {
  const state = useMediKiosk();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
      {/* Consultation History (7 cols on XL screens) */}
      <div className="xl:col-span-7 space-y-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <span><T text="Past AI Voice Consultations & Logs" /></span>
            </h3>
            <span className="text-xs font-mono font-bold text-teal-900 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
              {state.savedConsultations.length} Consultations Saved
            </span>
          </div>

          <div className="space-y-3">
            {state.savedConsultations.map((consult) => {
              const isExpanded = expandedConsultationId === consult.id;

              return (
                <div
                  key={consult.id}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 overflow-hidden shadow-xs w-full"
                >
                  <div
                    onClick={() => setExpandedConsultationId(isExpanded ? null : consult.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-black text-slate-900 text-base">{consult.visitDate}</span>
                        <span className="text-xs font-mono px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md font-bold border border-amber-300">
                          Token {consult.opdToken}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-md capitalize border border-emerald-300">
                          {consult.mode}
                        </span>
                      </div>
                      <div className="text-sm text-slate-700 font-semibold truncate max-w-md">
                        {consult.chiefComplaint}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-slate-600 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {consult.conversationHistory.length} Turns
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-700" /> : <ChevronDown className="w-5 h-5 text-slate-700" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-white border-t border-slate-200 space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-teal-900 uppercase tracking-wider block">
                            <T text="Exact Speech Dialogue & Translation" />
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-semibold">
                            <Volume2 className="w-4 h-4 text-teal-600" />
                            <T text="Tap 🔊 on any message to listen" />
                          </span>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          {consult.conversationHistory.map((turn, tIdx) => (
                            <div
                              key={tIdx}
                              className={`flex flex-col ${turn.speaker === 'patient' ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-xs text-slate-600 font-extrabold">
                                  {turn.speaker === 'patient' ? '🧑 Patient' : '🤖 MedGemma AI'}
                                </span>
                                <button
                                  onClick={() => onPlayTts(turn.text)}
                                  className="p-1 hover:bg-slate-200 rounded text-teal-700 cursor-pointer"
                                  title="Listen with Neural TTS"
                                >
                                  <Volume2
                                    className={`w-3.5 h-3.5 ${
                                      activeSpeakingText === turn.text ? 'animate-bounce text-emerald-600' : ''
                                    }`}
                                  />
                                </button>
                              </div>

                              <div
                                className={`p-4 rounded-2xl text-sm max-w-[85%] space-y-1 shadow-xs ${
                                  turn.speaker === 'patient'
                                    ? 'bg-teal-700 text-white rounded-tr-none'
                                    : 'bg-white border-2 border-slate-200 text-slate-900 rounded-tl-none font-medium'
                                }`}
                              >
                                <p className="leading-relaxed">{turn.text}</p>
                                {turn.translatedText && (
                                  <p className="text-xs opacity-90 pt-1 border-t border-white/20 font-semibold">
                                    <strong>Translation:</strong> {turn.translatedText}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {consult.soapSummary && (
                        <div className="p-4 bg-teal-50/70 rounded-2xl border-2 border-teal-200 text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-teal-950 block text-base"><T text="Doctor Clinical Summary" />:</span>
                            <button
                              onClick={() =>
                                onPlayTts(
                                  `Assessment: ${consult.soapSummary.assessment}. Plan: ${consult.soapSummary.plan}`
                                )
                              }
                              className="px-3 py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-teal-300"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-teal-800" />
                              <span><T text="Listen" /></span>
                            </button>
                          </div>
                          <p className="text-slate-800 font-medium"><strong>Assessment:</strong> {consult.soapSummary.assessment}</p>
                          <p className="text-slate-800 font-medium"><strong>Plan:</strong> {consult.soapSummary.plan}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Interactive Assistant with ASR Mic & TTS Playback (5 cols on XL screens) */}
      <div className="xl:col-span-5 space-y-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4 flex flex-col justify-between h-full min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900"><T text="Ask MedGemma AI Assistant" /></h3>
                  <p className="text-xs text-slate-500 font-medium"><T text="Voice ASR & Neural TTS enabled in all Indian languages." /></p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full border border-purple-300">
                ASR + TTS Ready
              </span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3.5 py-4 max-h-[380px] overflow-y-auto">
              {patientAiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.speaker === 'patient' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-4 rounded-2xl text-sm space-y-2 shadow-xs max-w-[90%] ${
                      msg.speaker === 'patient'
                        ? 'bg-purple-700 text-white rounded-tr-none font-medium'
                        : 'bg-slate-100 text-slate-900 rounded-tl-none border-2 border-slate-200 font-medium'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-between pt-1.5 text-xs opacity-80 border-t border-slate-200/50">
                      <span>{msg.time}</span>
                      <button
                        onClick={() => onPlayTts(msg.text)}
                        className="flex items-center gap-1.5 hover:opacity-100 cursor-pointer font-bold"
                      >
                        <Volume2
                          className={`w-3.5 h-3.5 ${activeSpeakingText === msg.text ? 'animate-bounce text-yellow-300' : ''}`}
                        />
                        <span>Listen 🔊</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {aiChatLoading && (
                <div className="p-4 bg-purple-50 rounded-2xl text-sm text-purple-900 font-bold flex items-center gap-2.5 animate-pulse border-2 border-purple-200">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
                  <span>MedGemma AI analyzing clinical context...</span>
                </div>
              )}

              {isListening && (
                <div className="p-4 bg-red-50 rounded-2xl text-sm text-red-900 flex items-center gap-2.5 animate-pulse border-2 border-red-400">
                  <Radio className="w-5 h-5 text-red-600 animate-spin" />
                  <span className="font-black">Listening to your speech in {state.language}... speak now!</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Input with ASR Microphone and Send Button */}
          <div className="pt-3 border-t border-slate-200 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleSpeechRecognition}
              className={`p-3.5 rounded-2xl cursor-pointer transition-all shadow-md flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak using Microphone (ASR)'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder="Speak via Mic 🎙️ or type your medical question..."
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAskMedGemma()}
              className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm outline-none focus:ring-2 ring-purple-500 font-semibold"
            />

            <button
              onClick={() => onAskMedGemma()}
              disabled={!aiChatInput.trim() || aiChatLoading}
              className="p-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl cursor-pointer disabled:opacity-50 transition-colors shadow-md shrink-0"
              title="Send Question"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
