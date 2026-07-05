import React, { useState } from 'react';
import { IMMERSION_CURRICULUM, CurriculumDay } from '../constants';
import { BookOpen, Sparkles, Award, ArrowRight, HelpCircle, Check, AlertCircle } from 'lucide-react';

interface CurriculumProps {
  selectedLang: 'EN' | 'ES';
  activeDay: number;
  onSelectDay: (day: number) => void;
  onAskVoyager: (text: string) => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({
  selectedLang,
  activeDay,
  onSelectDay,
  onAskVoyager
}) => {
  const [quizTerm, setQuizTerm] = useState<{ word: string; definition: string; definitionEs: string } | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const currentDayData = IMMERSION_CURRICULUM.find(d => d.dayNum === activeDay) || IMMERSION_CURRICULUM[0];

  const startQuiz = () => {
    const vocabList = currentDayData.vocabulary;
    if (vocabList.length === 0) return;
    
    const correct = vocabList[Math.floor(Math.random() * vocabList.length)];
    setQuizTerm(correct);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);

    // Create options (1 correct, 2 incorrect from other vocab items in this or other days)
    const optionsSet = new Set<string>();
    optionsSet.add(selectedLang === 'EN' ? correct.definition : correct.definitionEs);

    const allVocab = IMMERSION_CURRICULUM.flatMap(d => d.vocabulary);
    while (optionsSet.size < Math.min(3, allVocab.length)) {
      const randomVocab = allVocab[Math.floor(Math.random() * allVocab.length)];
      optionsSet.add(selectedLang === 'EN' ? randomVocab.definition : randomVocab.definitionEs);
    }
    
    setQuizOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  };

  const handleAnswerSubmit = (option: string) => {
    if (!quizTerm) return;
    setSelectedAnswer(option);
    const correctDef = selectedLang === 'EN' ? quizTerm.definition : quizTerm.definitionEs;
    const correct = option === correctDef;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      // Prompt VOYAGER to praise user
      onAskVoyager(`I got the vocabulary quiz correct for '${quizTerm.word}'! Explain its usage quickly.`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black/45 border border-white/10 rounded-2xl p-4 font-sans text-white overflow-hidden max-h-[380px] md:max-h-[440px]">
      
      {/* Day Selector Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-yellow-500" />
          {selectedLang === 'EN' ? 'Daily Lessons' : 'Lecciones Diarias'}
        </span>
        <div className="flex gap-1.5">
          {IMMERSION_CURRICULUM.map((day) => (
            <button
              key={day.dayNum}
              onClick={() => {
                onSelectDay(day.dayNum);
                setQuizTerm(null);
              }}
              className={`w-7 h-7 flex items-center justify-center text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                activeDay === day.dayNum
                  ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              D{day.dayNum}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[290px] md:max-h-[350px]">
        
        {/* Active Day Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent border-l-2 border-yellow-500 p-3 rounded-r-xl">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {selectedLang === 'EN' ? `Day ${currentDayData.dayNum}: ${currentDayData.title}` : `Día ${currentDayData.dayNum}: ${currentDayData.titleEs}`}
          </h3>
          
          <button
            onClick={() => {
              const isEn = selectedLang === 'EN';
              const prompt = isEn
                ? `I am ready for the Day ${currentDayData.dayNum} lesson: "${currentDayData.title}". Let's start the immersion practice!`
                : `¡Estoy listo para la lección del Día ${currentDayData.dayNum}: "${currentDayData.titleEs}". ¡Comencemos la práctica de inmersión!`;
              onAskVoyager(prompt);
            }}
            className="mt-2.5 w-full py-1.5 px-3 bg-yellow-500 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.3)] hover:bg-yellow-400 active:scale-98 transition-all cursor-pointer"
          >
            {selectedLang === 'EN' ? 'Practice Lesson with VOYAGER' : 'Practicar Lección con VOYAGER'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Objectives Section */}
        <div className="space-y-1.5">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
            🎯 {selectedLang === 'EN' ? 'IMMERSION OBJECTIVES' : 'OBJETIVOS DE INMERSIÓN'}
          </span>
          <ul className="space-y-1 pl-1">
            {(selectedLang === 'EN' ? currentDayData.objectives : currentDayData.objectivesEs).map((obj, i) => (
              <li key={i} className="text-xs text-neutral-300 flex items-start gap-1.5 leading-relaxed">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Vocabulary Section */}
        <div className="space-y-2">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
            📚 {selectedLang === 'EN' ? 'VOCABULARY LOG' : 'REGISTRO DE VOCABULARIO'}
          </span>
          <div className="grid gap-2">
            {currentDayData.vocabulary.map((vocab, i) => (
              <div 
                key={i} 
                onClick={() => onAskVoyager(selectedLang === 'EN' ? `Explain the vocabulary phrase "${vocab.word}" and give examples.` : `Explícame la frase de vocabulario "${vocab.word}" y dame ejemplos.`)}
                className="bg-white/5 border border-white/10 hover:border-yellow-500/40 p-2.5 rounded-xl transition-all cursor-pointer flex flex-col gap-0.5 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-yellow-400 font-mono group-hover:text-yellow-300 transition-colors">{vocab.word}</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-400 transition-colors">
                    {selectedLang === 'EN' ? 'Tap to study' : 'Toca para estudiar'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-normal">
                  {selectedLang === 'EN' ? vocab.definition : vocab.definitionEs}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary Quiz Section */}
        <div className="border-t border-white/10 pt-3.5 mt-2 space-y-2.5">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />
            {selectedLang === 'EN' ? 'RETENTION QUIZ' : 'PRUEBA DE RETENCIÓN'}
          </span>
          
          {!quizTerm ? (
            <button
              onClick={startQuiz}
              className="w-full py-2 bg-neutral-900 border border-white/10 hover:border-yellow-500/50 hover:bg-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {selectedLang === 'EN' ? 'Start Vocabulary Quiz' : 'Iniciar Quiz de Vocabulario'}
            </button>
          ) : (
            <div className="bg-black/35 border border-white/10 rounded-xl p-3 space-y-3 animate-fade-in">
              <div className="flex justify-between items-start">
                <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
                  {selectedLang === 'EN' ? 'What does this mean?' : '¿Qué significa esto?'}
                </span>
                <span className="text-xs font-bold text-yellow-400 font-mono">{quizTerm.word}</span>
              </div>

              <div className="flex flex-col gap-2">
                {quizOptions.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === (selectedLang === 'EN' ? quizTerm.definition : quizTerm.definitionEs);
                  
                  let btnStyle = "bg-neutral-900/60 border-white/5 hover:border-yellow-500/30 hover:bg-neutral-800/80";
                  if (selectedAnswer !== null) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
                    } else if (isSelected) {
                      btnStyle = "bg-red-500/20 border-red-500/40 text-red-300";
                    } else {
                      btnStyle = "bg-neutral-900/40 border-white/5 opacity-55";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerSubmit(option)}
                      className={`w-full p-2.5 text-left text-[11px] rounded-xl border flex items-center justify-between transition-all cursor-pointer leading-normal ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {selectedAnswer !== null && isCorrectAnswer && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1.5" />}
                      {selectedAnswer !== null && isSelected && !isCorrectAnswer && <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    {isAnswerCorrect 
                      ? (selectedLang === 'EN' ? '🎉 Correct!' : '🎉 ¡Correcto!')
                      : (selectedLang === 'EN' ? '❌ Keep learning!' : '❌ ¡Sigue practicando!')}
                  </span>
                  <button
                    onClick={startQuiz}
                    className="text-[9px] font-mono font-bold tracking-wider text-yellow-400 hover:text-white underline cursor-pointer"
                  >
                    {selectedLang === 'EN' ? 'Next Question' : 'Siguiente Pregunta'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
