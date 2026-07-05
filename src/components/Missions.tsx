import React, { useState, useEffect } from 'react';
import { IMMERSION_CURRICULUM } from '../constants';
import { googleSignIn, logout, initAuth } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import { 
  CheckSquare, 
  Square, 
  Sparkles, 
  Loader2, 
  CloudLightning,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  TrendingUp
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

      // 4. Create tasks for all missions of the current day
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
      setError(selectedLang === 'EN' ? 'Failed to sync with Google Tasks.' : 'Error al sincronizar con Google Tasks.');
      setSyncStatus('error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black/45 border border-white/10 rounded-2xl p-4 font-sans text-white overflow-hidden max-h-[380px] md:max-h-[440px]">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-yellow-500" />
          {selectedLang === 'EN' ? 'Real-Life Missions' : 'Misiones Reales'}
        </span>
        <span className="text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          {selectedLang === 'EN' ? `Day ${activeDay} Objectives` : `Objetivos Día ${activeDay}`}
        </span>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[290px] md:max-h-[350px]">
        
        {/* Sync / Authentication Bar */}
        <div className="bg-[#1f1f23]/60 border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-3">
          {needsAuth ? (
            <>
              <span className="text-[10px] text-neutral-400 leading-tight">
                {selectedLang === 'EN' 
                  ? 'Connect Google Tasks to save and track missions.' 
                  : 'Conecta Google Tasks para guardar y seguir tus misiones.'}
              </span>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-black text-[9px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
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
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-neutral-200 truncate max-w-[150px]">
                  {selectedLang === 'EN' ? `Syncing: ${user?.displayName}` : `Sincronizando: ${user?.displayName}`}
                </span>
                <span className="text-[8px] font-mono text-neutral-500 hover:text-red-400 cursor-pointer underline transition-colors" onClick={() => logout()}>
                  {selectedLang === 'EN' ? 'Disconnect Google Account' : 'Desconectar cuenta'}
                </span>
              </div>
              <button
                onClick={handleSyncToGoogleTasks}
                disabled={syncStatus === 'syncing'}
                className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  syncStatus === 'synced' 
                    ? 'bg-emerald-600 text-white'
                    : syncStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-yellow-500 text-black hover:bg-yellow-400'
                }`}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{selectedLang === 'EN' ? 'Syncing...' : 'Sincronizando...'}</span>
                  </>
                ) : syncStatus === 'synced' ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>{selectedLang === 'EN' ? 'Synced!' : '¡Sincronizado!'}</span>
                  </>
                ) : (
                  <span>{selectedLang === 'EN' ? 'Sync to Google Tasks' : 'Guardar en Google Tasks'}</span>
                )}
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-2.5 rounded-xl flex items-center gap-1.5 leading-tight">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Missions Checklist */}
        <div className="space-y-2">
          <span className="block text-[9px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
            ⚡ {selectedLang === 'EN' ? "TODAY'S CHALLENGES" : "DESAFÍOS DE HOY"}
          </span>
          <div className="grid gap-2">
            {currentDayData.missions.map((mission) => {
              const isCompleted = completedMissions.includes(mission.id);
              return (
                <div 
                  key={mission.id}
                  onClick={() => onToggleMission(mission.id)}
                  className={`border p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    isCompleted 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-neutral-400' 
                      : 'bg-white/5 border-white/10 hover:border-yellow-500/30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 transition-all scale-105" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500 group-hover:text-yellow-500 transition-all" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className={`text-xs font-bold leading-normal transition-all ${isCompleted ? 'line-through text-neutral-500' : 'text-neutral-200'}`}>
                      {selectedLang === 'EN' ? mission.en : mission.es}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskVoyager(selectedLang === 'EN' 
                          ? `Let's practice the mission: "${mission.en}". Help me prepare!` 
                          : `¡Practiquemos la misión: "${mission.es}". Ayúdame a prepararme!`);
                      }}
                      className="text-[9px] font-mono text-left font-bold text-yellow-400 hover:text-white underline mt-1"
                    >
                      {selectedLang === 'EN' ? 'Prepare for this with VOYAGER' : 'Preparar esto con VOYAGER'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informational Tip */}
        <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-[10px] text-yellow-400/80 leading-relaxed font-mono flex items-start gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0 text-yellow-500 mt-0.5" />
          <span>
            {selectedLang === 'EN'
              ? "Tip: As you converse with VOYAGER, speaking in English and practicing these prompts, VOYAGER will automatically detect successful completion and check off your missions!"
              : "Tip: Mientras hablas con VOYAGER en inglés y practicas estas frases, ¡VOYAGER detectará automáticamente cuando completes la misión y la marcará por ti!"}
          </span>
        </div>

      </div>
    </div>
  );
};
