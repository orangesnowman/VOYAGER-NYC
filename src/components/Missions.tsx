import React, { useState, useEffect } from 'react';
import { IMMERSION_CURRICULUM } from '../constants';
import { googleSignIn, logout, initAuth } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Coffee,
  Train,
  Camera
} from 'lucide-react';

interface MissionsProps {
  selectedLang: 'EN' | 'ES';
  activeDay: number;
  completedMissions: string[];
  onToggleMission: (missionId: string) => void;
  onAskVoyager: (text: string) => void;
}

interface GoogleTaskList {
  id: string;
  title: string;
}

interface MissionCard {
  id: string;
  level: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  levelEn: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  vocab: string[];
  iconType: 'coffee' | 'train' | 'camera' | 'sparkles';
  prompt: string;
}

const MISSION_CARDS: MissionCard[] = [
  {
    id: 'diner',
    level: 'PRINCIPIANTE',
    levelEn: 'BEGINNER',
    title: 'Café en un Classic Diner',
    titleEn: 'Coffee in a Classic Diner',
    description: 'Aprende a ordenar café, huevos, panqueques y a entender la jerga de los meseros neoyorquinos.',
    descriptionEn: 'Learn to order coffee, eggs, pancakes and understand the slang of New York servers.',
    vocab: ['Sunny-side up', 'To go', 'Refill', 'Pastrami on rye', 'Drizzle'],
    iconType: 'coffee',
    prompt: "Let's start the 'Coffee in a Classic Diner' scenario. Practice ordering breakfast at an authentic diner! Talk to me as the server, using local diner slang."
  },
  {
    id: 'subway',
    level: 'INTERMEDIO',
    levelEn: 'INTERMEDIATE',
    title: 'Aventuras en el Metro de NYC',
    titleEn: 'NYC Subway Adventures',
    description: 'Aprende cómo preguntar por líneas de metro (subway lines), comprar boletos y entender direcciones norte/sur.',
    descriptionEn: 'Learn how to ask for subway lines, buy tickets, and understand north/south directions.',
    vocab: ['MetroCard', 'Uptown / Downtown', 'Transfer', 'Platform', 'Express train'],
    iconType: 'train',
    prompt: "Let's start the 'NYC Subway Adventures' scenario. Practice navigating the subway, asking for route directions, and dealing with station gates. Treat me as a local station agent."
  },
  {
    id: 'bridge',
    level: 'PRINCIPIANTE',
    levelEn: 'BEGINNER',
    title: 'Fotógrafo en Brooklyn Bridge',
    titleEn: 'Photographer on Brooklyn Bridge',
    description: 'Frases útiles para pedirle cortésmente a un turista que te tome una foto y darle instrucciones de encuadre.',
    descriptionEn: 'Useful phrases to politely ask a tourist to take a photo of you and give framing instructions.',
    vocab: ['Take a photo', 'Horizontal / Landscape', 'Frame', 'Backlight', 'Press the button'],
    iconType: 'camera',
    prompt: "Let's start the 'Photographer on Brooklyn Bridge' scenario. Practice politely asking a nearby tourist to take your picture. Give specific styling/framing instructions!"
  },
  {
    id: 'broadway',
    level: 'AVANZADO',
    levelEn: 'ADVANCED',
    title: 'Hustling en Broadway',
    titleEn: 'Hustling on Broadway',
    description: 'Negocia boletos de última hora (TKTS booth) y aprende a preguntar por los mejores asientos en el teatro.',
    descriptionEn: 'Negotiate last-minute tickets (TKTS booth) and learn to ask for the best seats in the theater.',
    vocab: ['Matinee', 'Orchestra seats', 'Mezzanine', 'Sold out', 'Standing room only'],
    iconType: 'sparkles',
    prompt: "Let's start the 'Hustling on Broadway' scenario. Practice purchasing same-day rush tickets at the TKTS booth. Ask about seating sections, views, and discounts."
  }
];

export const Missions: React.FC<MissionsProps> = ({
  selectedLang,
  activeDay,
  completedMissions,
  onToggleMission,
  onAskVoyager
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const currentDayData = IMMERSION_CURRICULUM.find(d => d.dayNum === activeDay) || IMMERSION_CURRICULUM[0];

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        setUser(firebaseUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setError(null);
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
    setError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(selectedLang === 'EN' ? 'Sign in failed.' : 'Error al iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSyncToGoogleTasks = async () => {
    if (!accessToken) return;
    setSyncStatus('syncing');
    setError(null);

    try {
      // 1. Fetch user's task lists to check if "VOYAGER NYC Immersion" exists
      const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!listsRes.ok) throw new Error('Failed to fetch lists');
      const listsData = await listsRes.json();
      
      let voyagerList = (listsData.items || []).find((l: GoogleTaskList) => l.title === 'VOYAGER NYC Immersion');
      let listId = voyagerList?.id;

      // 2. If it does not exist, create it
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

      // 3. Fetch existing tasks in that list to avoid duplicates
      const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const tasksData = await tasksRes.json();
      const existingTaskTitles = new Set((tasksData.items || []).map((t: any) => t.title));

      // 4. Create tasks for our active missions
      for (const m of MISSION_CARDS) {
        const title = selectedLang === 'EN' ? `🎯 [Scenario] ${m.titleEn}` : `🎯 [Escenario] ${m.title}`;
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
              notes: `Vocabulary list: ${m.vocab.join(', ')}`,
              status: isCompleted ? 'completed' : 'needsAction'
            })
          });
        }
      }

      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(selectedLang === 'EN' ? 'Failed to sync with Google Tasks.' : 'Error al sincronizar con Google Tasks.');
      setSyncStatus('error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F4F3EF] text-zinc-900 rounded-2xl p-4 font-sans overflow-hidden max-h-[380px] md:max-h-[440px] tab-content-area">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-2.5 mb-3 flex-shrink-0">
        <span className="text-sm font-sans font-extrabold tracking-wider uppercase text-zinc-800 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-zinc-800" />
          {selectedLang === 'EN' ? 'Real-Life Missions' : 'Misiones Reales'}
        </span>
        <span className="text-[10px] font-sans bg-zinc-800 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {selectedLang === 'EN' ? `Day ${activeDay}` : `Día ${activeDay}`}
        </span>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        
        {/* Sync / Authentication Bar */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm flex-shrink-0">
          {needsAuth ? (
            <>
              <span className="text-[10px] font-sans font-bold text-zinc-500 leading-tight text-left">
                {selectedLang === 'EN' 
                  ? 'Connect Google Tasks to save and track missions.' 
                  : 'Conecta Google Tasks para guardar y seguir tus misiones.'}
              </span>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="px-3 py-1.5 bg-[#0A0D14] hover:bg-zinc-800 text-white text-[10px] font-sans font-bold uppercase rounded-xl flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>{selectedLang === 'EN' ? 'Connect' : 'Conectar'}</span>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-sans font-extrabold text-zinc-800 truncate max-w-[150px]">
                  {selectedLang === 'EN' ? `Syncing: ${user?.displayName}` : `Sincronizando: ${user?.displayName}`}
                </span>
                <span className="text-[9px] font-sans text-zinc-400 hover:text-red-500 cursor-pointer underline transition-colors" onClick={() => logout()}>
                  {selectedLang === 'EN' ? 'Disconnect Google Account' : 'Desconectar cuenta'}
                </span>
              </div>
              <button
                onClick={handleSyncToGoogleTasks}
                disabled={syncStatus === 'syncing'}
                className={`px-3 py-1.5 text-[9px] font-sans font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  syncStatus === 'synced' 
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : syncStatus === 'error'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-zinc-100 border border-zinc-200 text-zinc-800 hover:bg-zinc-200 shadow-sm'
                }`}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{selectedLang === 'EN' ? 'Syncing...' : 'Sincronizando...'}</span>
                  </>
                ) : syncStatus === 'synced' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                    <span>{selectedLang === 'EN' ? 'Synced!' : '¡Sincronizado!'}</span>
                  </>
                ) : (
                  <span>{selectedLang === 'EN' ? 'Sync' : 'Sincronizar'}</span>
                )}
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[10px] p-2.5 rounded-xl flex items-center gap-1.5 leading-tight shadow-sm text-left font-sans">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2x2 Responsive Grid of Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {MISSION_CARDS.map((card) => {
            // Determine icon and theme colors
            let iconElement = <Coffee size={20} />;
            let iconBg = "bg-[#FFF9E6] text-amber-500";
            let badgeBg = "bg-[#FEF5D1] text-[#B27F11]";

            if (card.iconType === 'train') {
              iconElement = <Train size={20} />;
              iconBg = "bg-[#EBF3FF] text-blue-500";
              badgeBg = "bg-[#EBF3FF] text-blue-800";
            } else if (card.iconType === 'camera') {
              iconElement = <Camera size={20} />;
              iconBg = "bg-[#FFF0F2] text-rose-500";
              badgeBg = "bg-[#FFF0F2] text-rose-800";
            } else if (card.iconType === 'sparkles') {
              iconElement = <Sparkles size={20} />;
              iconBg = "bg-[#F5F0FF] text-purple-500";
              badgeBg = "bg-[#F5F0FF] text-purple-800";
            }

            const isEn = selectedLang === 'EN';

            return (
              <div 
                key={card.id} 
                className="bg-white border border-zinc-200/70 shadow-sm p-6 rounded-[32px] flex flex-col justify-between transition-all hover:shadow-md hover:border-zinc-300 duration-300"
              >
                <div>
                  {/* Card Header (Badge + Icon Circle) */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-sans font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md ${badgeBg}`}>
                      {isEn ? card.levelEn : card.level}
                    </span>
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>
                      {iconElement}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-extrabold font-sans text-zinc-900 tracking-tight mt-5 text-left">
                    {isEn ? card.titleEn : card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-zinc-500 leading-relaxed mt-2 text-left font-sans">
                    {isEn ? card.descriptionEn : card.description}
                  </p>

                  {/* Key Vocabulary Container */}
                  <div className="bg-[#F8F7F4]/95 rounded-2xl p-4 mt-5 text-left">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 font-sans block mb-3">
                      {isEn ? 'KEY VOCABULARY:' : 'VOCABULARIO CLAVE:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {card.vocab.map((v, idx) => (
                        <span 
                          key={idx} 
                          className="bg-white border border-zinc-200/80 text-zinc-700 px-3 py-1 rounded-xl text-xs font-mono font-medium shadow-sm transition-all hover:bg-zinc-50/50 hover:border-zinc-300"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit/Action Button */}
                <button
                  onClick={() => onAskVoyager(card.prompt)}
                  className="w-full py-3.5 bg-[#0A0D14] hover:bg-zinc-800 active:scale-[0.98] text-white text-xs font-sans font-extrabold uppercase tracking-widest rounded-2xl transition-all shadow-sm mt-6 cursor-pointer"
                >
                  {isEn ? 'START LESSON' : 'COMENZAR LECCIÓN'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
