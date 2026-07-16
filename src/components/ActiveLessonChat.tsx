import React from 'react';
import { Sparkles, Volume2 } from 'lucide-react';
import { IMMERSION_CURRICULUM } from '../constants';

interface ActiveLessonChatProps {
  activeLessonDay: number;
  selectedLang: 'EN' | 'ES';
  activeLessonLevel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  lessonStage: 1 | 2 | 3;
  setLessonStage: (stage: 1 | 2 | 3) => void;
  isConnected: boolean;
  disconnect: () => void;
  connectToGemini: (prompt?: string, voice?: boolean) => void;
  chatMessages: any[];
  setInputText: (text: string) => void;
  completedMissions: string[];
  onToggleMission: (id: string) => void;
  setShowLessonCompletion: (day: number | null) => void;
  setActiveLessonDay: (day: number | null) => void;
  showHelpPortal: 'translate' | 'explain' | 'pronounce' | null;
  setShowHelpPortal: (portal: 'translate' | 'explain' | 'pronounce' | null) => void;
  isAiSpeaking: boolean;
  getTranslatedMessageText: (msg: any, lang: 'EN' | 'ES') => string;
}

export const ActiveLessonChat: React.FC<ActiveLessonChatProps> = ({
  activeLessonDay,
  selectedLang,
  activeLessonLevel,
  lessonStage,
  setLessonStage,
  isConnected,
  disconnect,
  connectToGemini,
  chatMessages,
  setInputText,
  completedMissions,
  onToggleMission,
  setShowLessonCompletion,
  setActiveLessonDay,
  showHelpPortal,
  setShowHelpPortal,
  isAiSpeaking,
  getTranslatedMessageText
}) => {
  const activeLesson = IMMERSION_CURRICULUM.find(l => l.dayNum === activeLessonDay);
  if (!activeLesson) return null;

  const lessonMissions = activeLesson.missions;
  const isEn = selectedLang === 'EN';

  return (
    <div className="flex-grow flex flex-col overflow-hidden h-full p-4 space-y-4 bg-[#f2ede4] font-sans text-neutral-900">
      {/* Wave CSS animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        .wave-bar {
          animation: wave 1.2s ease-in-out infinite;
          width: 4px;
        }
        .wave-bar:nth-child(2) { animation-delay: 0.15s; }
        .wave-bar:nth-child(3) { animation-delay: 0.3s; }
        .wave-bar:nth-child(4) { animation-delay: 0.45s; }
        .wave-bar:nth-child(5) { animation-delay: 0.6s; }
      `}} />

      {/* 1. SCENARIO HEADER */}
      <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-2xl p-3 flex flex-col gap-2.5 shadow-sm text-left">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[21.5px] md:text-[25px] font-black text-zinc-900 font-serif tracking-tight truncate flex items-center gap-2">
              <span className="text-[35px] md:text-[42px] leading-none inline-block flex-shrink-0">
                {activeLessonDay === 1 ? '☕' : activeLessonDay === 2 ? '🚇' : activeLessonDay === 3 ? '🌳' : '🎭'}
              </span>
              <span className="truncate">
                {activeLessonDay === 1 ? 'Coffee Shop Experience' : activeLessonDay === 2 ? 'Subway Platform' : activeLessonDay === 3 ? 'Central Park Adventure' : 'Broadway Ticket Booth'}
              </span>
            </div>
            <div className="text-[14px] md:text-[16px] text-black font-semibold font-serif pb-0.5">
              {isEn ? activeLesson.title : activeLesson.titleEs}
            </div>

            {/* 2. MINIMALIST STEPPER (ALIGNED LEFT DIRECTLY UNDER GOAL SUBHEADER) */}
            <div className="flex items-center gap-4 md:gap-6 pt-1 bg-transparent text-[9.5px] md:text-[10.5px] font-bold tracking-wider uppercase font-sans">
              <button 
                type="button"
                onClick={() => setLessonStage(1)} 
                className="flex items-center gap-1.5 cursor-pointer select-none border-none bg-transparent p-0"
              >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${lessonStage === 1 ? 'bg-emerald-500 shadow-sm' : 'bg-zinc-300'}`} />
                  <span style={{ fontFamily: "'Allerta', sans-serif" }} className={lessonStage === 1 ? 'text-black font-extrabold' : 'text-zinc-800 font-medium'}>
                      1. {isEn ? 'PREPARATION' : 'PREPARACIÓN'}
                  </span>
              </button>
              <button 
                type="button"
                onClick={() => setLessonStage(2)} 
                className="flex items-center gap-1.5 cursor-pointer select-none border-none bg-transparent p-0"
              >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${lessonStage === 2 ? 'bg-emerald-500 shadow-sm' : 'bg-zinc-300'}`} />
                  <span style={{ fontFamily: "'Allerta', sans-serif" }} className={lessonStage === 2 ? 'text-black font-extrabold' : 'text-zinc-800 font-medium'}>
                      2. {isEn ? 'SIMULATION' : 'SIMULACIÓN'}
                  </span>
              </button>
              <button 
                type="button"
                onClick={() => setLessonStage(3)} 
                className="flex items-center gap-1.5 cursor-pointer select-none border-none bg-transparent p-0"
              >
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${lessonStage === 3 ? 'bg-emerald-500 shadow-sm' : 'bg-zinc-300'}`} />
                  <span style={{ fontFamily: "'Allerta', sans-serif" }} className={lessonStage === 3 ? 'text-black font-extrabold' : 'text-zinc-800 font-medium'}>
                      3. {isEn ? 'FREE SPEAK' : 'CONVERSACIÓN LIBRE'}
                  </span>
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setShowLessonCompletion(activeLessonDay);
              setActiveLessonDay(null);
            }}
            className="text-[10px] font-mono font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer transition-all flex-shrink-0"
          >
            {isEn ? 'Finish' : 'Terminar'}
          </button>
        </div>
      </div>

      {/* STAGE 1: PREPARATION VIEW */}
      {lessonStage === 1 && (
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pb-4">
          <div className="bg-[#FAF6EE] border border-zinc-200/60 rounded-2xl p-4 text-left space-y-2.5 shadow-sm">

            <div className="space-y-2">
              {lessonMissions.map(m => {
                const isCompleted = completedMissions.includes(m.id);
                return (
                  <label key={m.id} className="flex items-start gap-2.5 text-[14.5px] text-black cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => onToggleMission(m.id)}
                      className="mt-[3px] accent-emerald-600 rounded cursor-pointer w-[17px] h-[17px] flex-shrink-0"
                    />
                    <span className={isCompleted ? 'line-through text-zinc-400' : ''}>
                      {isEn ? m.en : m.es}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[13.5px] font-black uppercase text-black font-mono tracking-widest text-left">
              {isEn ? "ESSENTIAL VOCABULARY" : "VOCABULARIO ESENCIAL"}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {activeLesson.vocabulary.map((v, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    const text = isEn 
                      ? `Explain the word "${v.word}" and read it.` 
                      : `Explícame la palabra "${v.word}" y léela.`;
                    setInputText(text);
                  }}
                  className="p-2.5 bg-[#FAF6EE] border border-zinc-200/60 hover:border-yellow-500 rounded-xl cursor-pointer hover:shadow-xs transition-all text-left"
                >
                  <span className="font-bold text-black block text-[17px] font-mono">{v.word}</span>
                  <span className="text-black/85 text-[14.5px] leading-snug block">
                    {isEn ? v.definition : v.definitionEs}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setLessonStage(2)}
            className="w-full py-2.5 bg-[#1e3a8a] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-900 transition-all cursor-pointer text-center"
          >
            {isEn ? 'START ROLEPLAY SIMULATION' : 'INICIAR SIMULACIÓN DE JUEGO'}
          </button>
        </div>
      )}

      {/* STAGE 2 & 3: SIMULATION & FREE TALK VIEW */}
      {lessonStage >= 2 && (
        <div className="flex-grow flex flex-col overflow-hidden h-full space-y-4">
          
          {/* 2. AI VOICE AGENT AREA (CENTER FOCUS) */}
          <div className="bg-[#FAF6EE] border border-zinc-200/60 rounded-3xl p-4 flex flex-col items-center justify-center relative shadow-sm h-36 md:h-44 flex-shrink-0">
            
            {/* Animated wave elements */}
            {isConnected && isAiSpeaking ? (
              <div className="flex items-center gap-1.5 h-10 mb-2">
                <span className="w-1 bg-[#1e3a8a] rounded-full wave-bar" style={{height: '24px'}} />
                <span className="w-1 bg-[#1e3a8a] rounded-full wave-bar" style={{height: '16px'}} />
                <span className="w-1 bg-[#1e3a8a] rounded-full wave-bar" style={{height: '32px'}} />
                <span className="w-1 bg-[#1e3a8a] rounded-full wave-bar" style={{height: '20px'}} />
                <span className="w-1 bg-[#1e3a8a] rounded-full wave-bar" style={{height: '28px'}} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full border-4 border-zinc-105 flex items-center justify-center bg-zinc-50 shadow-inner mb-2">
                <div className="w-6 h-6 rounded-full bg-[#1e3a8a]/20 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-[#1e3a8a]" />
                </div>
              </div>
            )}

            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                {isConnected 
                  ? isAiSpeaking 
                    ? (isEn ? 'AI is explaining...' : 'AI está explicando...') 
                    : (isEn ? 'AI is listening...' : 'AI está escuchando...')
                  : (isEn ? 'Disconnected' : 'Desconectado')}
              </span>
              <p className="text-xs font-bold text-neutral-800 mt-1">
                {isConnected 
                  ? isAiSpeaking 
                    ? (isEn ? 'Listening to Voyager guide' : 'Escuchando la guía de Voyager') 
                    : (isEn ? 'Your turn to speak' : 'Es tu turno de hablar')
                  : (isEn ? 'Connect voice to start simulation' : 'Conecta la voz para iniciar la simulación')}
              </p>
            </div>
          </div>

          {/* 3. CONVERSATION AREA (CHAT SUPPORT) */}
          {lessonStage === 2 ? (
            <div className="flex-1 p-3 bg-[#FAF6EE]/50 border border-zinc-200/40 rounded-2xl overflow-y-auto max-h-[140px] md:max-h-[180px] space-y-3">
              {chatMessages.filter(m => m.sender !== 'system').slice(-4).map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} text-left`}>
                    <div className={`p-2.5 rounded-xl text-xs max-w-[85%] ${isUser ? 'bg-yellow-100 text-black font-semibold' : 'bg-[#FAF6EE] border border-zinc-200/50 text-zinc-800'}`}>
                      <p className="font-serif">{getTranslatedMessageText(msg, selectedLang)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Stage 3: Minimal Chat focus */
            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-zinc-50 border border-zinc-200/40 rounded-2xl max-h-[80px]">
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                {isEn ? "IMMERSIVE AUDIO CHANNEL ACTIVE" : "CANAL DE AUDIO INMERSIVO ACTIVO"}
              </p>
            </div>
          )}

          {/* 4. STUDENT RESPONSE AREA (Microphone Actions & Help) */}
          <div className="flex items-center justify-between gap-3 bg-[#FAF6EE] p-3 border border-zinc-200/80 rounded-2xl shadow-inner">
            {/* AI Assistance Toggle Button */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowHelpPortal(showHelpPortal ? null : 'translate')}
                className="px-3.5 py-2 bg-[#FAF6EE] hover:bg-yellow-50 text-[#1e3a8a] border border-[#1e3a8a]/20 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
              >
                <span>💡 {isEn ? 'Need help?' : '¿Ayuda?'}</span>
              </button>

              {showHelpPortal && (
                <div className="absolute left-0 bottom-12 w-64 bg-[#FAF6EE] border border-zinc-200/85 rounded-2xl shadow-xl z-50 overflow-hidden p-3.5 text-left space-y-3 animate-fade-in">
                  <div className="flex border-b border-zinc-100 pb-1.5 text-[10px] font-bold text-zinc-400 gap-2.5">
                    <button 
                      type="button"
                      onClick={() => setShowHelpPortal('translate')}
                      className={`pb-1 cursor-pointer transition-colors ${showHelpPortal === 'translate' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : ''}`}
                    >
                      {isEn ? 'Translate' : 'Traducir'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowHelpPortal('explain')}
                      className={`pb-1 cursor-pointer transition-colors ${showHelpPortal === 'explain' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : ''}`}
                    >
                      {isEn ? 'Explain' : 'Explicar'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowHelpPortal('pronounce')}
                      className={`pb-1 cursor-pointer transition-colors ${showHelpPortal === 'pronounce' ? 'text-[#1e3a8a] border-b-2 border-[#1e3a8a]' : ''}`}
                    >
                      {isEn ? 'Pronounce' : 'Pronunciar'}
                    </button>
                  </div>

                  {showHelpPortal === 'translate' && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? "Spanish Hint" : "Idea en Español"}</span>
                      <p className="text-zinc-700 italic">"Me gustaría ordenar un café con leche, por favor."</p>
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold pt-1">{isEn ? "English Translation" : "Traducción al Inglés"}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setInputText("I would like a latte, please.");
                          setShowHelpPortal(null);
                        }}
                        className="w-full text-left font-mono font-bold text-[#1e3a8a] hover:underline cursor-pointer bg-transparent border-none p-0"
                      >
                        "I would like a latte, please."
                      </button>
                    </div>
                  )}

                  {showHelpPortal === 'explain' && (
                    <div className="text-[11px] leading-relaxed text-zinc-700 space-y-1">
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? "Cultural Explainer" : "Explicación Cultural"}</span>
                      <p>
                        {activeLessonDay === 1 
                          ? `En Nueva York, "For here or to go" es lo primero que preguntan. Si pides "to go", te darán vaso de cartón y bolsa.`
                          : `En el metro, "Uptown" significa dirección norte (hacia el Bronx/Harlem) y "Downtown" significa dirección sur (hacia Brooklyn/Lower Manhattan).`
                        }
                      </p>
                    </div>
                  )}

                  {showHelpPortal === 'pronounce' && (
                    <div className="text-xs space-y-1.5">
                      <span className="text-[9px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? "Pronunciation Helpers" : "Guía de Pronunciación"}</span>
                      <div className="space-y-1 font-mono text-[10.5px]">
                        <p><span className="font-bold text-yellow-800">Latte</span>: "lá-tei"</p>
                        <p><span className="font-bold text-yellow-800">Receipt</span>: "ri-sít" (la 'p' no suena)</p>
                        <p><span className="font-bold text-yellow-800">Water</span>: "uó-der"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Microphone Trigger Panel */}
            <div className="flex-1 flex justify-center">
              {isConnected ? (
                <button 
                  type="button"
                  onClick={disconnect}
                  className="w-10 h-10 rounded-full bg-red-650 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-95"
                  title={isEn ? "Disconnect" : "Desconectar"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => {
                    const starterPrompt = `[INICIA LECCIÓN: LECCIÓN ${activeLessonDay} - NIVEL ${activeLessonLevel}] Comencemos la lección.`;
                    connectToGemini(starterPrompt, true);
                  }}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black border-none text-[11px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>{isEn ? 'CONNECT' : 'CONECTAR'}</span>
                </button>
              )}
            </div>

            {/* Status Mode Badge */}
            <div className="flex flex-col gap-1 text-[8.5px] font-bold text-zinc-450">
              <span className="bg-[#FAF6EE] border border-zinc-200/60 px-2 py-0.5 rounded-md text-zinc-500 text-center font-mono">
                EN ↔ ES
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
