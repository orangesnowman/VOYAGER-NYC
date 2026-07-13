import React, { useState, useEffect } from 'react';
import { IMMERSION_CURRICULUM } from '../constants';
import { googleSignIn, logout, initAuth } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import voyagerRobot from '../assets/images/voyager_robot_1783082204380.png';
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
  onStartLesson: (day: number, level: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO') => void;
  selectedLevel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  setSelectedLevel: (level: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO') => void;
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
  onStartLesson,
  selectedLevel,
  setSelectedLevel
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

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
        const title = selectedLang === 'EN' ? `🎯 [Lesson ${activeDay}] ${m.en}` : `🎯 [Lección ${activeDay}] ${m.es}`;
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



  const renderTocRow = (lesson: any) => {
    return (
      <button 
        key={lesson.dayNum}
        onClick={() => onStartLesson(lesson.dayNum, selectedLevel)}
        className="w-full text-left bg-transparent border-b border-zinc-300/30 py-1.5 px-1 flex items-center justify-between transition-all duration-200 cursor-pointer active:opacity-85 group"
      >
        <div className="min-w-0 flex-1">
          <h3 
            style={{ fontFamily: "'American Typewriter', Courier, monospace", fontSize: "14pt", fontWeight: "normal" }}
            className="text-neutral-900 group-hover:text-blue-900 leading-tight tracking-tight truncate transform group-hover:translate-x-1 transition-all duration-250"
          >
            {lesson.dayNum}. {selectedLang === 'EN' ? lesson.title : lesson.titleEs}
          </h3>
        </div>
        <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-blue-900 transition-colors flex-shrink-0 ml-2" />
      </button>
    );
  };

  const currentDayData = IMMERSION_CURRICULUM.find(d => d.dayNum === activeDay) || IMMERSION_CURRICULUM[0];

  // Display all cards regardless of selected difficulty level
  const visibleLessons = IMMERSION_CURRICULUM;

  return (
    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl pt-2 px-3 pb-3 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60">
      <div className="space-y-6 pb-4">
        

        {/* Welcome Card from Voyager */}
        <div className="bg-[#FAF6EE] border border-zinc-200/80 p-5 rounded-3xl shadow-md flex items-start gap-4 text-left animate-fade-in">
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden flex items-center justify-center">
            <img 
              src={voyagerRobot} 
              alt="Voyager" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-850 leading-relaxed font-semibold">
              {selectedLang === 'EN' 
                ? "Welcome to the Lessons section, you will learn by speaking and interacting with me!"
                : "Bienvenido a la sección de Lecciones, ¡aprenderás hablando e interactuando conmigo!"}
            </p>
          </div>
        </div>

        {/* Lessons List - Table of Contents */}
        <div className="flex flex-col border-t border-zinc-300/30">
          {visibleLessons.map(renderTocRow)}
        </div>
      </div>
    </div>
  );
};
