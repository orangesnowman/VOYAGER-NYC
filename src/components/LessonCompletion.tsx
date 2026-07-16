import React from 'react';
import { Trophy, Star, Award, Compass, MessageCircle, AlertCircle, ArrowRight, CheckCircle2, Volume2 } from 'lucide-react';
import { IMMERSION_CURRICULUM } from '../constants';

interface LessonCompletionProps {
  dayNum: number;
  selectedLang: 'EN' | 'ES';
  scores: { grammar: number; pronunciation: number; confidence: number; naturalness: number };
  onClose: () => void;
}

export const LessonCompletion: React.FC<LessonCompletionProps> = ({
  dayNum,
  selectedLang,
  scores,
  onClose
}) => {
  const lesson = IMMERSION_CURRICULUM.find(l => l.dayNum === dayNum);
  const isEn = selectedLang === 'EN';

  // Calculate stars based on scores or a default (e.g. 4/5 stars)
  const averageScore = ((scores.grammar || 80) + (scores.pronunciation || 85) + (scores.confidence || 90) + (scores.naturalness || 85)) / 4;
  const starCount = Math.min(5, Math.max(1, Math.round(averageScore / 20)));

  return (
    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl p-5 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60 text-left space-y-4 animate-fade-in">
      {/* Immersive Badge Celebration Header */}
      <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-sm relative overflow-hidden">
        {/* Decorative sparkles or background patterns */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-yellow-500/10 blur-xl"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>

        {/* Badge Icon Container */}
        <div className="w-16 h-16 rounded-full bg-yellow-550/15 border-2 border-yellow-500 flex items-center justify-center shadow-md animate-bounce">
          {dayNum === 1 && <span className="text-3xl">☕</span>}
          {dayNum === 2 && <span className="text-3xl">🚇</span>}
          {dayNum === 3 && <span className="text-3xl">🌳</span>}
          {dayNum === 4 && <span className="text-3xl">🎭</span>}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-zinc-900 font-serif uppercase tracking-tight">
            {isEn ? 'Lesson Completed!' : '¡Lección Completada!'}
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            {isEn ? `You earned the Day ${dayNum} Explorer Badge` : `Ganaste la insignia de Explorador del Día ${dayNum}`}
          </p>
        </div>

        {/* Star Rating System */}
        <div className="flex items-center gap-1.5 py-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star 
              key={s} 
              className={`w-5 h-5 ${s <= starCount ? 'text-yellow-550 fill-yellow-500' : 'text-zinc-300'}`} 
            />
          ))}
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-zinc-400 font-mono tracking-widest">
          {isEn ? 'PERFORMANCE METRICS' : 'MÉTRICAS DE RENDIMIENTO'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? 'Communication' : 'Comunicación'}</span>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-lg font-black text-zinc-900 font-serif">{scores.grammar || 82}%</span>
              <span className="text-[9px] text-zinc-450 font-bold">★ 4.2</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? 'Pronunciation' : 'Pronunciación'}</span>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-lg font-black text-zinc-900 font-serif">{scores.pronunciation || 86}%</span>
              <span className="text-[9px] text-zinc-450 font-bold">★ 4.5</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? 'Confidence' : 'Confianza'}</span>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-lg font-black text-zinc-900 font-serif">{scores.confidence || 90}%</span>
              <span className="text-[9px] text-zinc-450 font-bold">★ 4.8</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase font-bold">{isEn ? 'Naturalness' : 'Fluidez'}</span>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-lg font-black text-zinc-900 font-serif">{scores.naturalness || 85}%</span>
              <span className="text-[9px] text-zinc-450 font-bold">★ 4.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* feedback cards: Communication stars, pronunciation drill items, and coach tip */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase text-zinc-400 font-mono tracking-widest">
          {isEn ? 'COACH FEEDBACK REPORT' : 'REPORTE DEL COACH DE IA'}
        </h3>
        <div className="space-y-2">
          {/* Card 1: Communication Success */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 text-left">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg h-fit flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold text-emerald-900">
                {isEn ? 'Communication Stars' : 'Estrellas de la Comunicación'}
              </h4>
              <p className="text-[11px] text-emerald-700 leading-normal">
                {isEn 
                  ? 'Great job ordering your coffee! You successfully asked for a specific item and confirmed whether it was to go.'
                  : '¡Excelente trabajo ordenando tu café! Lograste pedir un producto específico y confirmaste si era para llevar.'}
              </p>
            </div>
          </div>

          {/* Card 2: Pronunciation Drill */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-left">
            <span className="p-1.5 bg-amber-100 text-amber-850 rounded-lg h-fit flex-shrink-0">
              <Volume2 className="w-4 h-4" />
            </span>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold text-amber-900">
                {isEn ? 'Pronunciation Drill Items' : 'Palabras para Seguir Practicando'}
              </h4>
              <p className="text-[11px] text-amber-700 leading-normal">
                {isEn 
                  ? 'Keep practicing: "Receipt" (silent p) and "Latte" (focus on the vowel speed).'
                  : 'Sigue practicando: "Receipt" (la p es muda) y "Latte" (enfócate en la velocidad de la vocal).'}
              </p>
            </div>
          </div>

          {/* Card 3: Coach Tip */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-left">
            <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg h-fit flex-shrink-0">
              <MessageCircle className="w-4 h-4" />
            </span>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-xs font-bold text-blue-900">
                {isEn ? 'Personal Coach Tip' : 'Consejo del Coach de Viaje'}
              </h4>
              <p className="text-[11px] text-blue-700 leading-normal">
                {isEn 
                  ? 'Next time, try using "Could I get a..." instead of "I want a..." to sound more polite in NYC coffee trucks.'
                  : 'La próxima vez, intenta usar "Could I get a..." en lugar de "I want a..." para sonar más cortés en los carritos de café de Nueva York.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Return to Curriculum Button */}
      <button 
        onClick={onClose}
        className="w-full py-3 bg-[#1e3a8a] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-900 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 font-sans"
      >
        <span>{isEn ? 'CONTINUE EXPLORING NYC' : 'CONTINUAR EXPLORANDO NYC'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
