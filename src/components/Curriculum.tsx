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
  onStartLesson: (day: number) => void;
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
  onToggleMission,
  onStartLesson
}) => {
  const [viewState, setViewState] = useState<'list' | 'detail'>('list');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);



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



  const handleOpenDetail = (dayNum: number) => {
    onSelectDay(dayNum);
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
              {selectedLang === 'EN' ? 'BEGINNER' : 'PRINCIPIANTE'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {principianteLessons.map(renderCard)}
            </div>
          </div>

          {/* Intermedio Section */}
          <div className="space-y-3">
            <span className="block text-[22px] font-mono font-bold tracking-widest text-blue-800 uppercase px-1 border-b border-blue-900/10 pb-1">
              {selectedLang === 'EN' ? 'INTERMEDIATE' : 'INTERMEDIO'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {intermedioLessons.map(renderCard)}
            </div>
          </div>

          {/* Avanzado Section */}
          <div className="space-y-3">
            <span className="block text-[22px] font-mono font-bold tracking-widest text-purple-800 uppercase px-1 border-b border-purple-900/10 pb-1">
              {selectedLang === 'EN' ? 'ADVANCED' : 'AVANZADO'}
            </span>
            <div className="grid grid-cols-1 gap-4">
              {avanzadoLessons.map(renderCard)}
            </div>
          </div>
        </div>
      ) : (
        /* Detail View State (Interactive Preview) */
        <div className="space-y-6 pb-6 text-left animate-fade-in">
          {/* Back Navigation Bar */}
          <div className="flex justify-between items-center border-b border-zinc-300/40 pb-3 mb-2">
            <button
              onClick={() => setViewState('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {selectedLang === 'EN' ? 'Back to Lessons' : 'Volver a Lecciones'}
            </button>
            <span className="text-[10px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {selectedLang === 'EN' ? `Day ${currentDayData.dayNum}` : `Día ${currentDayData.dayNum}`}
            </span>
          </div>

          {/* Interactive Lesson Card Preview */}
          <div className="bg-[#FAF6EE] border border-zinc-200/80 p-6 rounded-3xl shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24 text-yellow-600" />
            </div>
            
            <div>
              <span className="text-[9px] font-mono font-bold text-yellow-700 uppercase tracking-widest block mb-1">
                {selectedLang === 'EN' ? 'INTERACTIVE LESSON PREVIEW' : 'VISTA PREVIA DE LECCIÓN INTERACTIVA'}
              </span>
              <h2 className="text-neutral-950 font-extrabold text-lg md:text-xl leading-tight">
                {selectedLang === 'EN' ? currentDayData.title : currentDayData.titleEs}
              </h2>
              <p className="text-zinc-600 text-xs mt-2 leading-relaxed">
                {selectedLang === 'EN' 
                  ? "You will learn and practice key conversational skills by talking directly with Voyager. No typing or reading quizzes needed—just voice-and-chat interactions!"
                  : "Aprenderás y practicarás habilidades de conversación hablando directamente con Voyager. Sin exámenes escritos—¡todo mediante voz y chat interactivo!"}
              </p>
            </div>
            
            <button
              onClick={() => onStartLesson(currentDayData.dayNum)}
              className="w-full py-4 px-4 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-mono font-extrabold uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(234,179,8,0.3)] hover:shadow-[0_6px_25px_rgba(234,179,8,0.45)] active:scale-98 transition-all cursor-pointer border-none"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              {selectedLang === 'EN' ? 'START INTERACTIVE LESSON WITH VOYAGER' : 'COMENZAR LECCIÓN CON VOYAGER'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Objectives & Missions Preview */}
          <div className="space-y-3">
            <span className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-1">
              🎯 {selectedLang === 'EN' ? 'YOUR ACTIVE CHALLENGES' : 'TUS DESAFÍOS DE HOY'}
            </span>
            <div className="grid gap-2.5">
              {currentDayData.missions.map((mission) => (
                <div 
                  key={mission.id}
                  className="bg-[#FAF6EE] border border-zinc-200/80 p-3 rounded-2xl flex items-start gap-3 shadow-sm"
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-700 text-xs">
                    ⚡
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-neutral-800 leading-normal">
                      {selectedLang === 'EN' ? mission.en : mission.es}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Vocabulary Preview */}
          <div className="space-y-3 pt-2">
            <span className="block text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase px-1">
              📖 {selectedLang === 'EN' ? 'KEY VOCABULARY PREVIEW' : 'VOCABULARIO CLAVE'}
            </span>
            <div className="grid gap-2.5">
              {currentDayData.vocabulary.map((vocab, i) => (
                <div 
                  key={i} 
                  className="bg-[#FAF6EE] border border-zinc-200/80 p-3 rounded-2xl shadow-sm flex flex-col gap-0.5"
                >
                  <span className="text-sm font-bold text-yellow-800 font-mono">{vocab.word}</span>
                  <p className="text-[11px] text-neutral-600 leading-normal mt-0.5">
                    {selectedLang === 'EN' ? vocab.definition : vocab.definitionEs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
