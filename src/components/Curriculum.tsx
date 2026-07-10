import React, { useState, useEffect } from 'react';
import { IMMERSION_CURRICULUM } from '../constants';
import { googleSignIn, logout, initAuth } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  ArrowRight, 
  HelpCircle, 
  Check, 
  AlertCircle,
  Coffee,
  Train,
  Camera,
  ArrowLeft,
  Loader2,
  CheckSquare,
  Square,
  TrendingUp
} from 'lucide-react';

interface CurriculumProps {
  selectedLang: 'EN' | 'ES';
  activeDay: number;
  onSelectDay: (day: number) => void;
  onAskVoyager: (text: string) => void;
  completedMissions: string[];
  onToggleMission: (missionId: string) => void;
}

interface CardData {
  dayNum: number;
  tag: string;
  tagEn: string;
  tagColor: string;
  icon: 'coffee' | 'subway' | 'camera' | 'sparkles';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  vocab: string[];
}

const CARDS: CardData[] = [
  {
    dayNum: 1,
    tag: "PRINCIPIANTE",
    tagEn: "BEGINNER",
    tagColor: "text-amber-700 bg-amber-50 border-amber-200",
    icon: "coffee",
    title: "Café en un Classic Diner",
    titleEn: "Coffee in a Classic Diner",
    description: "Aprende a ordenar café, huevos, panqueques y a entender la jerga de los meseros neoyorquinos.",
    descriptionEn: "Learn to order coffee, eggs, pancakes and understand the slang of NYC servers.",
    vocab: ["Sunny-side up (Huevo frito boca arriba)", "To go (Para llevar)", "Refill (Relleno/Rellenar)", "Pastrami on rye (Pastrami en centeno)", "Drizzle (Rociar/Lloviznar)"]
  },
  {
    dayNum: 2,
    tag: "INTERMEDIO",
    tagEn: "INTERMEDIATE",
    tagColor: "text-blue-700 bg-blue-50 border-blue-200",
    icon: "subway",
    title: "Aventuras en el Metro de NYC",
    titleEn: "NYC Subway Adventures",
    description: "Aprende cómo preguntar por líneas de metro (subway lines), comprar boletos y entender direcciones norte/sur.",
    descriptionEn: "Learn how to ask for subway lines, buy tickets and understand north/south directions.",
    vocab: ["MetroCard (Tarjeta del metro)", "Uptown / Downtown (Norte / Sur)", "Transfer (Transbordo)", "Platform (Andén)", "Express train (Tren rápido/expreso)"]
  },
  {
    dayNum: 3,
    tag: "PRINCIPIANTE",
    tagEn: "BEGINNER",
    tagColor: "text-amber-700 bg-amber-50 border-amber-200",
    icon: "camera",
    title: "Fotógrafo en Brooklyn Bridge",
    titleEn: "Brooklyn Bridge Photographer",
    description: "Frases útiles para pedirle cortésmente a un turista que te tome una foto y darle instrucciones de encuadre.",
    descriptionEn: "Useful phrases to politely ask a tourist to take your picture and give framing instructions.",
    vocab: ["Take a photo (Tomar una foto)", "Horizontal / Landscape (Horizontal/Apaisado)", "Frame (Encuadrar/Marco)", "Backlight (Contraluz)", "Press the button (Presionar el botón)"]
  },
  {
    dayNum: 4,
    tag: "AVANZADO",
    tagEn: "ADVANCED",
    tagColor: "text-purple-700 bg-purple-50 border-purple-200",
    icon: "sparkles",
    title: "Hustling en Broadway",
    titleEn: "Hustling on Broadway",
    description: "Negocia boletos de última hora (TKTS booth) y aprende a preguntar por los mejores asientos en el teatro.",
    descriptionEn: "Negotiate last-minute tickets (TKTS booth) and learn to ask for the best seats in the theater.",
    vocab: ["Matinee (Función vespertina)", "Orchestra seats (Butacas de platea)", "Mezzanine (Entresuelo/Mezanina)", "Sold out (Agotado)", "Standing room only (Solo espacio de pie)"]
  }
];

interface GoogleTaskList {
  id: string;
  title: string;
}

export const Curriculum: React.FC<CurriculumProps> = ({
  selectedLang,
  activeDay,
  onSelectDay,
  onAskVoyager,
  completedMissions,
  onToggleMission
}) => {
  const [viewState, setViewState] = useState<'list' | 'detail'>('list');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Quiz States
  const [quizTerm, setQuizTerm] = useState<{ word: string; definition: string; definitionEs: string } | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  const currentDayData = IMMERSION_CURRICULUM.find(d => d.dayNum === activeDay) || IMMERSION_CURRICULUM[0];

  // Initialize Auth state for Google Tasks
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        setUser(firebaseUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setSyncError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setSyncError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setSyncError(selectedLang === 'EN' ? 'Sign in failed.' : 'Error al iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSyncToGoogleTasks = async () => {
    if (!accessToken) return;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!listsRes.ok) throw new Error('Failed to fetch lists');
      const listsData = await listsRes.json();
      
      let voyagerList = (listsData.items || []).find((l: GoogleTaskList) => l.title === 'VOYAGER NYC Immersion');
      let listId = voyagerList?.id;

      if (!voyagerList) {
        const createRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ title: 'VOYAGER NYC Immersion' })
        });
        if (!createRes.ok) throw new Error('Failed to create task list');
        const createdList = await createRes.json();
        listId = createdList.id;
      }

      const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const tasksData = await tasksRes.json();
      const existingTaskTitles = new Set((tasksData.items || []).map((t: any) => t.title));

      const missionsToAdd = currentDayData.missions;
      for (const m of missionsToAdd) {
        const title = selectedLang === 'EN' ? `🎯 [Day ${activeDay}] ${m.en}` : `🎯 [Día ${activeDay}] ${m.es}`;
        if (!existingTaskTitles.has(title)) {
          const isCompleted = completedMissions.includes(m.id);
          await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              title,
              notes: 'Language Immersion Mission powered by VOYAGER NYC.',
              status: isCompleted ? 'completed' : 'needsAction'
            })
          });
        }
      }

      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncError(selectedLang === 'EN' ? 'Failed to sync with Google Tasks.' : 'Error al sincronizar con Google Tasks.');
      setSyncStatus('error');
    }
  };

  const startQuiz = () => {
    const vocabList = currentDayData.vocabulary;
    if (vocabList.length === 0) return;
    
    const correct = vocabList[Math.floor(Math.random() * vocabList.length)];
    setQuizTerm(correct);
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);

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
      onAskVoyager(`I got the vocabulary quiz correct for '${quizTerm.word}'! Explain its usage quickly.`);
    }
  };

  const handleOpenDetail = (dayNum: number) => {
    onSelectDay(dayNum);
    setQuizTerm(null);
    setViewState('detail');
  };

  const handleStartPractice = () => {
    const isEn = selectedLang === 'EN';
    const prompt = isEn
      ? `I am ready for the Day ${currentDayData.dayNum} lesson: "${currentDayData.title}". Let's start the immersion practice!`
      : `¡Estoy listo para la lección del Día ${currentDayData.dayNum}: "${currentDayData.titleEs}". ¡Comencemos la práctica de inmersión!`;
    onAskVoyager(prompt);
  };

  // Group cards by level
  const principianteLessons = CARDS.filter(c => c.tag === 'PRINCIPIANTE');
  const intermedioLessons = CARDS.filter(c => c.tag === 'INTERMEDIO');
  const avanzadoLessons = CARDS.filter(c => c.tag === 'AVANZADO');

  const renderCard = (card: CardData) => {
    const isActive = activeDay === card.dayNum;
    return (
      <div 
        key={card.dayNum}
        className={`bg-[#FAF6EE] border rounded-3xl p-5 flex flex-col justify-between shadow-sm transition-all duration-300 ${
          isActive 
            ? 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-md' 
            : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'
        }`}
      >
        <div>
          <div className="flex justify-start mb-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              card.icon === 'coffee' ? 'bg-yellow-50 text-amber-600' :
              card.icon === 'subway' ? 'bg-sky-50 text-sky-600' :
              card.icon === 'camera' ? 'bg-rose-50 text-rose-500' :
              'bg-purple-50 text-purple-600'
            }`}>
              {card.icon === 'coffee' && <Coffee className="w-7 h-7" />}
              {card.icon === 'subway' && <Train className="w-7 h-7" />}
              {card.icon === 'camera' && <Camera className="w-7 h-7" />}
              {card.icon === 'sparkles' && <Sparkles className="w-7 h-7" />}
            </div>
          </div>

          <h3 className="text-neutral-900 font-extrabold text-[13px] md:text-[14.5px] tracking-tight mb-2 leading-tight">
            {selectedLang === 'EN' ? card.titleEn : card.title}
          </h3>

          <p className="text-black text-[12.5px] md:text-[14.5px] leading-relaxed mb-4">
            {selectedLang === 'EN' ? card.descriptionEn : card.description}
          </p>

          <div className="bg-[#f0eada] border border-zinc-300/40 rounded-2xl p-3 mb-5">
            <span className="block text-[7.5px] font-mono font-bold text-neutral-400 tracking-wider mb-2">
              {selectedLang === 'EN' ? 'KEY VOCABULARY:' : 'VOCABULARIO CLAVE:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {card.vocab.map((v, i) => (
                <span 
                  key={i}
                  className="bg-[#ffffff] border border-zinc-200/80 text-zinc-700 text-[17px] font-normal px-2.5 py-0.5 rounded shadow-sm hover:border-zinc-300 transition-colors"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenDetail(card.dayNum)}
          className="w-full py-3 bg-[#e3ded4] hover:bg-[#d8d3c7] text-[#1c1917] border border-zinc-300/60 text-[10px] font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-sm active:scale-98 cursor-pointer"
        >
          {selectedLang === 'EN' ? 'START LESSON' : 'COMENZAR LECCIÓN'}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl pt-2 px-3 pb-3 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60">
      {viewState === 'list' ? (
        <div className="space-y-6 pb-4">
          
          {/* Principiante Section */}
          <div className="space-y-3">
            <span className="block text-[22px] font-mono font-bold tracking-widest text-amber-800 uppercase px-1 border-b border-amber-900/10 pb-1">
              🔰 {selectedLang === 'EN' ? 'BEGINNER' : 'PRINCIPIANTE'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {principianteLessons.map(renderCard)}
            </div>
          </div>

          {/* Intermedio Section */}
          <div className="space-y-3">
            <span className="block text-[22px] font-mono font-bold tracking-widest text-blue-800 uppercase px-1 border-b border-blue-900/10 pb-1">
              🚇 {selectedLang === 'EN' ? 'INTERMEDIATE' : 'INTERMEDIO'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {intermedioLessons.map(renderCard)}
            </div>
          </div>

          {/* Avanzado Section */}
          <div className="space-y-3">
            <span className="block text-[22px] font-mono font-bold tracking-widest text-purple-800 uppercase px-1 border-b border-purple-900/10 pb-1">
              ✨ {selectedLang === 'EN' ? 'ADVANCED' : 'AVANZADO'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {avanzadoLessons.map(renderCard)}
            </div>
          </div>

        </div>
      ) : (
        /* Detail View State */
        <div className="space-y-5 pb-6 text-left">
          {/* Back Navigation Bar */}
          <div className="flex justify-between items-center border-b border-zinc-300/40 pb-3 mb-2">
            <button
              onClick={() => setViewState('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {selectedLang === 'EN' ? 'Back to Lessons' : 'Volver a Lecciones'}
            </button>
            <span className="text-[10px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {selectedLang === 'EN' ? `Day ${currentDayData.dayNum}` : `Día ${currentDayData.dayNum}`}
            </span>
          </div>

          {/* Title Header */}
          <div className="bg-[#FAF6EE] border border-zinc-200/80 p-4 rounded-3xl shadow-sm space-y-3">
            <div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">
                {selectedLang === 'EN' ? 'ACTIVE LESSON' : 'LECCIÓN ACTIVA'}
              </span>
              <h2 className="text-neutral-950 font-extrabold text-[15px] md:text-[17px] leading-tight">
                {selectedLang === 'EN' ? currentDayData.title : currentDayData.titleEs}
              </h2>
            </div>
            
            <button
              onClick={handleStartPractice}
              className="w-full py-2.5 px-3 bg-yellow-500 hover:bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.25)] active:scale-98 transition-all cursor-pointer border-none"
            >
              {selectedLang === 'EN' ? 'Practice with VOYAGER' : 'Practicar con VOYAGER'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Objectives Section */}
          <div className="space-y-1.5 px-1">
            <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              🎯 {selectedLang === 'EN' ? 'IMMERSION OBJECTIVES' : 'OBJETIVOS DE INMERSIÓN'}
            </span>
            <ul className="space-y-1.5">
              {(selectedLang === 'EN' ? currentDayData.objectives : currentDayData.objectivesEs).map((obj, i) => (
                <li key={i} className="text-[10px] text-neutral-700 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges / Real-Life Missions (Missions Integration!) */}
          <div className="space-y-3 border-t border-zinc-300/40 pt-4 mt-2">
            <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              ⚡ {selectedLang === 'EN' ? "CHALLENGES & GOOGLE TASKS" : "DESAFÍOS Y GOOGLE TASKS"}
            </span>

            {/* Sync bar */}
            <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
              {needsAuth ? (
                <>
                  <span className="text-[10px] text-zinc-500 leading-tight">
                    {selectedLang === 'EN' 
                      ? 'Sync tasks to save objectives.' 
                      : 'Sincroniza tareas para guardar objetivos.'}
                  </span>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoggingIn}
                    className="px-2.5 py-1.5 bg-[#e3ded4] hover:bg-[#d8d3c7] text-[#1c1917] border border-zinc-300/40 text-[9px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isLoggingIn ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>{selectedLang === 'EN' ? 'Sync' : 'Sincronizar'}</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-neutral-800 truncate max-w-[130px]">
                      {user?.displayName}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 hover:text-red-600 cursor-pointer underline transition-colors" onClick={() => logout()}>
                      {selectedLang === 'EN' ? 'Disconnect' : 'Desconectar'}
                    </span>
                  </div>
                  <button
                    onClick={handleSyncToGoogleTasks}
                    disabled={syncStatus === 'syncing'}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      syncStatus === 'synced' 
                        ? 'bg-emerald-600 text-white'
                        : syncStatus === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-yellow-500 text-black hover:bg-yellow-400'
                    }`}
                  >
                    {syncStatus === 'syncing' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : syncStatus === 'synced' ? (
                      <span>{selectedLang === 'EN' ? 'Synced!' : '¡Guardado!'}</span>
                    ) : (
                      <span>{selectedLang === 'EN' ? 'Sync to Google Tasks' : 'Sincronizar tareas'}</span>
                    )}
                  </button>
                </>
              )}
            </div>

            {syncError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-[10px] p-2.5 rounded-xl flex items-center gap-1.5 leading-tight">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Checklist */}
            <div className="grid gap-2">
              {currentDayData.missions.map((mission) => {
                const isCompleted = completedMissions.includes(mission.id);
                return (
                  <div 
                    key={mission.id}
                    onClick={() => onToggleMission(mission.id)}
                    className={`border p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                      isCompleted 
                        ? 'bg-emerald-50/5 border-emerald-500/10 text-neutral-400' 
                        : 'bg-[#FAF6EE] border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 transition-all scale-105" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400 group-hover:text-yellow-600 transition-all" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className={`text-xs font-bold leading-normal transition-all ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                        {selectedLang === 'EN' ? mission.en : mission.es}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vocabulary Section */}
          <div className="space-y-2 border-t border-zinc-300/40 pt-4 mt-2">
            <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              📚 {selectedLang === 'EN' ? 'VOCABULARY LOG' : 'REGISTRO DE VOCABULARIO'}
            </span>
            <div className="grid gap-2">
              {currentDayData.vocabulary.map((vocab, i) => (
                <div 
                  key={i} 
                  onClick={() => onAskVoyager(selectedLang === 'EN' ? `Explain the vocabulary phrase "${vocab.word}" and give examples.` : `Explícame la frase de vocabulario "${vocab.word}" y dame ejemplos.`)}
                  className="bg-[#FAF6EE] border border-zinc-200/80 hover:border-zinc-300 p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-0.5 group shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-normal text-yellow-700 font-mono group-hover:text-yellow-600 transition-colors">{vocab.word}</span>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-500 transition-colors">
                      {selectedLang === 'EN' ? 'Tap to study' : 'Toca para estudiar'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-normal mt-0.5">
                    {selectedLang === 'EN' ? vocab.definition : vocab.definitionEs}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Quiz Section */}
          <div className="border-t border-zinc-300/40 pt-4 mt-2 space-y-2.5">
            <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
              {selectedLang === 'EN' ? 'RETENTION QUIZ' : 'PRUEBA DE RETENCIÓN'}
            </span>
            
            {!quizTerm ? (
              <button
                onClick={startQuiz}
                className="w-full py-2.5 bg-[#FAF6EE] border border-zinc-200/80 hover:border-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm text-neutral-800"
              >
                {selectedLang === 'EN' ? 'Start Vocabulary Quiz' : 'Iniciar Quiz de Vocabulario'}
              </button>
            ) : (
              <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-2xl p-4 space-y-3 shadow-sm animate-fade-in">
                <div className="flex justify-between items-start border-b border-zinc-300/30 pb-2">
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                    {selectedLang === 'EN' ? 'What does this mean?' : '¿Qué significa esto?'}
                  </span>
                  <span className="text-xs font-bold text-yellow-700 font-mono">{quizTerm.word}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {quizOptions.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectAnswer = option === (selectedLang === 'EN' ? quizTerm.definition : quizTerm.definitionEs);
                    
                    let btnStyle = "bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/50 text-neutral-800";
                    if (selectedAnswer !== null) {
                      if (isCorrectAnswer) {
                        btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800";
                      } else if (isSelected) {
                        btnStyle = "bg-red-50 border-red-300 text-red-800";
                      } else {
                        btnStyle = "bg-white border-zinc-200/30 opacity-55 text-neutral-400";
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
                        {selectedAnswer !== null && isCorrectAnswer && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 ml-1.5" />}
                        {selectedAnswer !== null && isSelected && !isCorrectAnswer && <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer !== null && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-300/30">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-neutral-700">
                      {isAnswerCorrect 
                        ? (selectedLang === 'EN' ? '🎉 Correct!' : '🎉 ¡Correcto!')
                        : (selectedLang === 'EN' ? '❌ Keep learning!' : '❌ ¡Sigue practicando!')}
                    </span>
                    <button
                      onClick={startQuiz}
                      className="text-[9px] font-mono font-bold tracking-wider text-yellow-700 hover:text-yellow-600 underline cursor-pointer"
                    >
                      {selectedLang === 'EN' ? 'Next Question' : 'Siguiente Pregunta'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
