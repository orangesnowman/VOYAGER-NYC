import React, { useState } from 'react';
import { 
  Award, 
  Compass, 
  MapPin, 
  Milestone, 
  TrendingUp, 
  Trophy, 
  User, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  Lock,
  Flame,
  Globe
} from 'lucide-react';
import { IMMERSION_CURRICULUM } from '../constants';

interface ProfileProps {
  selectedLang: 'EN' | 'ES';
  completedMissions: string[];
  scores: { grammar: number; pronunciation: number; confidence: number; naturalness: number };
  learnedWords: string[];
  accentPatterns: string[];
  onStartLesson: (day: number, level: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO') => void;
  onSwitchToChat: (initialText?: string) => void;
  travelerType: string;
  setTravelerType: (type: string) => void;
}

const TRAVELER_TYPES = [
  { id: 'tourist', labelEn: '🗽 NYC Explorer / Tourist', labelEs: '🗽 Explorador NYC / Turista' },
  { id: 'business', labelEn: '💼 Business Traveler', labelEs: '💼 Viajero de Negocios' },
  { id: 'family', labelEn: '👨‍👩‍👧 Family Trip', labelEs: '👨‍👩‍👧 Viaje en Familia' },
  { id: 'student', labelEn: '🎓 International Student', labelEs: '🎓 Estudiante Internacional' },
  { id: 'frequent', labelEn: '🌎 Frequent Flyer', labelEs: '🌎 Viajero Frecuente' },
  { id: 'explorer', labelEn: '✈️ Globe Trotter', labelEs: '✈️ Explorador Global' }
];

export const Profile: React.FC<ProfileProps> = ({
  selectedLang,
  completedMissions,
  scores,
  learnedWords,
  accentPatterns,
  onStartLesson,
  onSwitchToChat,
  travelerType,
  setTravelerType
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('journey');

  const isEn = selectedLang === 'EN';

  // Calculate stats
  const totalScenarios = IMMERSION_CURRICULUM.length;
  // A scenario is completed if any of its mission IDs are in completedMissions
  const completedScenariosCount = IMMERSION_CURRICULUM.filter(day => 
    day.missions.some(m => completedMissions.includes(m.id))
  ).length;

  const progressPercent = Math.min(
    100,
    Math.round(
      (completedMissions.length / 
        (IMMERSION_CURRICULUM.reduce((acc, curr) => acc + curr.missions.length, 0) || 1)) * 100
    )
  );

  // Dynamic user level text
  const getUserLevel = () => {
    if (progressPercent < 20) return isEn ? 'Beginner Explorer' : 'Explorador Principiante';
    if (progressPercent < 60) return isEn ? 'Intermediate Adventurer' : 'Aventurero Intermedio';
    return isEn ? 'Advanced Navigator' : 'Navegante Avanzado';
  };

  // Badge checklist mapping
  const BADGES_CONFIG = [
    { 
      id: 'coffee', 
      titleEn: '☕ Coffee Explorer', 
      titleEs: '☕ Coffee Explorer', 
      descEn: 'Master ordering in a classic NYC cafe.',
      descEs: 'Dominó ordenar en un café clásico neoyorquino.',
      unlocked: completedMissions.includes('day1_coffee') || completedMissions.some(m => m.includes('coffee'))
    },
    { 
      id: 'subway', 
      titleEn: '🚇 Subway Navigator', 
      titleEs: '🚇 Subway Navigator', 
      descEn: 'Navigate subway platforms and stations.',
      descEs: 'Navegó las estaciones y andenes del metro.',
      unlocked: completedMissions.includes('day1_directions') || completedMissions.some(m => m.includes('subway') || m.includes('togo') || m.includes('directions'))
    },
    { 
      id: 'hotel', 
      titleEn: '🏨 Hotel Expert', 
      titleEs: '🏨 Hotel Expert', 
      descEn: 'Check-in and make reception requests.',
      descEs: 'Completó check-in de hotel y peticiones.',
      unlocked: completedMissions.includes('day4_hotel') || completedMissions.some(m => m.includes('hotel'))
    },
    { 
      id: 'restaurant', 
      titleEn: '🍽 Restaurant Pro', 
      titleEs: '🍽 Restaurant Pro', 
      descEn: 'Order meals and ask for recommendations.',
      descEs: 'Ordenó platos y pidió recomendaciones.',
      unlocked: completedMissions.includes('day1_pastry') || completedMissions.some(m => m.includes('pastry') || m.includes('food'))
    },
    { 
      id: 'shopping', 
      titleEn: '🛍 Shopping Pro', 
      titleEs: '🛍 Shopping Pro', 
      descEn: 'Ask details and check out at Fifth Ave stores.',
      descEs: 'Consultó detalles y compró en tiendas.',
      unlocked: completedMissions.includes('day1_napkins') || completedMissions.some(m => m.includes('napkins') || m.includes('shopping'))
    },
    { 
      id: 'park', 
      titleEn: '🌳 Central Park Rider', 
      titleEs: '🌳 Central Park Rider', 
      descEn: 'Rent items and navigate scenic spots.',
      descEs: 'Rentó bicicletas e indagó rutas escénicas.',
      unlocked: completedMissions.includes('day1_wifi') || completedMissions.some(m => m.includes('wifi') || m.includes('restroom'))
    }
  ];

  // Next recommended mission finder
  const getNextMission = () => {
    // Find first day where not all missions are completed
    const nextDay = IMMERSION_CURRICULUM.find(day => 
      day.missions.some(m => !completedMissions.includes(m.id))
    ) || IMMERSION_CURRICULUM[0];

    const nextUncompletedMission = nextDay.missions.find(m => !completedMissions.includes(m.id)) || nextDay.missions[0];

    return {
      dayNum: nextDay.dayNum,
      title: isEn ? nextDay.title : nextDay.titleEs,
      missionText: isEn ? nextUncompletedMission.en : nextUncompletedMission.es,
      missionId: nextUncompletedMission.id
    };
  };

  const nextMission = getNextMission();

  const handleStartNextMission = () => {
    onStartLesson(nextMission.dayNum, 'PRINCIPIANTE');
  };

  const handlePracticeWord = (word: string) => {
    const text = isEn 
      ? `Hey Voyager, let's practice pronunciation for the word "${word}".`
      : `Hola Voyager, practiquemos la pronunciación de la palabra "${word}".`;
    onSwitchToChat(text);
  };

  const currentTypeLabel = TRAVELER_TYPES.find(t => t.id === travelerType || t.labelEs === travelerType || t.labelEn === travelerType)?.labelEs 
    || travelerType 
    || (isEn ? '🗽 NYC Explorer / Tourist' : '🗽 Explorador NYC / Turista');

  return (
    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl p-4 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60 text-left space-y-5">
      
      {/* SECTION 1: Identidad del Viajero (Passport Header) */}
      <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-[28px] p-5 shadow-md relative overflow-hidden flex flex-col sm:flex-row gap-5 items-center">
        {/* Decorative Passport Ribbon */}
        <div className="absolute top-0 right-0 h-full w-2 bg-yellow-500/80" />
        
        {/* Avatar Area */}
        <div className="w-20 h-20 rounded-full border-2 border-zinc-300 overflow-hidden flex-shrink-0 bg-yellow-50 flex items-center justify-center shadow-inner">
          <User className="w-10 h-10 text-zinc-400" />
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-950 font-serif">
              Carlos
            </h2>
            <div className="relative">
              <button 
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="px-3 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm mx-auto sm:mx-0"
              >
                <span>{currentTypeLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute right-0 sm:left-0 mt-1.5 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  {TRAVELER_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTravelerType(t.id);
                        setShowTypeDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors font-medium block"
                    >
                      {isEn ? t.labelEn : t.labelEs}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-1">
            <span className="bg-yellow-100 border border-yellow-200 text-yellow-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {getUserLevel()}
            </span>
            <div className="flex items-center gap-1 text-amber-700 font-bold text-xs">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>12 {isEn ? 'Days Active' : 'Días Activo'}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
              <span>{isEn ? 'PASSPORT COMPLETION' : 'PROGRESO DEL PASAPORTE'}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Panels for Clean Layout */}
      <div className="space-y-3.5">
        
        {/* SECTION 4: Próxima Misión (Single Objective Focus) */}
        <div className="bg-white border border-zinc-200/70 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 font-serif">
              {isEn ? 'NEXT ADVENTURE MISSION' : 'PRÓXIMA MISIÓN RECOMENDADA'}
            </h3>
          </div>
          
          <div className="bg-[#fcfbf9] border border-zinc-100 rounded-2xl p-4 space-y-3 text-left">
            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
              {isEn ? `Day ${nextMission.dayNum}` : `Día ${nextMission.dayNum}`} • {nextMission.title}
            </span>
            <p className="text-xs font-semibold text-zinc-800 leading-relaxed">
              "{nextMission.missionText}"
            </p>
          </div>

          <button 
            onClick={handleStartNextMission}
            className="w-full py-3 bg-[#0A0D14] hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'CONTINUE JOURNEY' : 'CONTINUAR MISIÓN'}</span>
          </button>
        </div>

        {/* SECTION 2: Mis Logros (Badges Container) */}
        <div className="bg-white border border-zinc-200/70 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 font-serif">
                {isEn ? 'TRAVEL LOG EXPERIENCES (BADGES)' : 'MIS LOGROS (INSIGNIAS)'}
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-bold">
              {BADGES_CONFIG.filter(b => b.unlocked).length} / {BADGES_CONFIG.length}
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BADGES_CONFIG.map(b => (
              <div 
                key={b.id}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                  b.unlocked 
                    ? 'bg-amber-50/50 border-amber-200/70 text-zinc-850 shadow-sm' 
                    : 'bg-zinc-50 border-zinc-200/50 text-zinc-400 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  b.unlocked ? 'bg-amber-100 shadow-sm' : 'bg-zinc-200/60'
                }`}>
                  {b.unlocked ? (
                    <Award className="w-5 h-5 text-amber-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-[10.5px] font-black tracking-tight truncate max-w-full">
                    {isEn ? b.titleEn : b.titleEs}
                  </h4>
                  <p className="text-[9px] text-zinc-500 leading-tight mt-0.5 max-h-7 overflow-hidden line-clamp-2">
                    {isEn ? b.descEn : b.descEs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accordion headers for Journey and Stats */}
        <div className="space-y-2.5">
          {/* Journey Accordion */}
          <div className="bg-white border border-zinc-200/70 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'journey' ? null : 'journey')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 font-serif">
                  {isEn ? 'NEW YORK CITY JOURNEY MAP' : 'MI VIAJE (TRAVEL JOURNEY)'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'journey' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeAccordion === 'journey' && (
              <div className="px-5 pb-5 pt-1 border-t border-zinc-100 text-left space-y-4">
                <div className="relative pl-6 border-l border-zinc-200 space-y-5 py-2">
                  {IMMERSION_CURRICULUM.map((day, idx) => {
                    const isCompleted = day.missions.every(m => completedMissions.includes(m.id));
                    const isStarted = day.missions.some(m => completedMissions.includes(m.id));
                    
                    return (
                      <div key={day.dayNum} className="relative">
                        {/* Dot indicator */}
                        <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : isStarted 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : 'bg-white border-zinc-300 text-zinc-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </span>
                        
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                            {isEn ? `STAGE ${day.dayNum}` : `ETAPA ${day.dayNum}`}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-800">
                            {isEn ? day.title : day.titleEs}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {day.missions.map(m => (
                              <span 
                                key={m.id}
                                className={`text-[8.5px] font-semibold px-2 py-0.5 rounded-md ${
                                  completedMissions.includes(m.id)
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                    : 'bg-zinc-50 border border-zinc-200 text-zinc-400'
                                }`}
                              >
                                {isEn ? m.en : m.es}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stats Accordion */}
          <div className="bg-white border border-zinc-200/70 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'stats' ? null : 'stats')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 font-serif">
                  {isEn ? 'PERSONAL PERFORMANCE METRICS' : 'ESTADÍSTICAS PERSONALES'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'stats' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeAccordion === 'stats' && (
              <div className="px-5 pb-5 pt-1 border-t border-zinc-100 text-left space-y-4">
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 bg-[#FAF6EE] border border-zinc-200/60 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{isEn ? 'SCENARIOS BEATEN' : 'ESCENARIOS COMPLETADOS'}</span>
                    <p className="text-xl font-black text-zinc-800">{completedScenariosCount} / {totalScenarios}</p>
                  </div>
                  <div className="p-3 bg-[#FAF6EE] border border-zinc-200/60 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{isEn ? 'VOCABULARY WORDS' : 'PALABRAS APRENDIDAS'}</span>
                    <p className="text-xl font-black text-zinc-800">{learnedWords.length}</p>
                  </div>
                  <div className="p-3 bg-[#FAF6EE] border border-zinc-200/60 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{isEn ? 'MINUTES COMMUNICATED' : 'MINUTOS HABLANDO'}</span>
                    <p className="text-xl font-black text-zinc-800">42 min</p>
                  </div>
                  <div className="p-3 bg-[#FAF6EE] border border-zinc-200/60 rounded-2xl space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{isEn ? 'SPEAKING CONFIDENCE' : 'NIVEL DE CONFIANZA'}</span>
                    <p className="text-xl font-black text-zinc-800">{scores.confidence ? `${scores.confidence * 20}%` : 'N/A'}</p>
                  </div>
                </div>

                {/* Score bars details */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{isEn ? 'COACH FEEDBACK RATING' : 'DESGLOSE DE HABILIDADES DEL AI COACH'}</h4>
                  <div className="space-y-2.5">
                    {[
                      { label: isEn ? 'Pronunciation' : 'Pronunciación', score: scores.pronunciation },
                      { label: isEn ? 'Grammar Accuracy' : 'Gramática', score: scores.grammar },
                      { label: isEn ? 'Natural Expressions' : 'Naturalidad', score: scores.naturalness }
                    ].map((s, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10.5px] font-semibold text-zinc-700">
                          <span>{s.label}</span>
                          <span>{s.score ? `${s.score * 20}%` : 'N/A'}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-150 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-zinc-800 transition-all duration-300"
                            style={{ width: s.score ? `${s.score * 20}%` : '0%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pronunciation Accordion */}
          <div className="bg-white border border-zinc-200/70 rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'pronunciation' ? null : 'pronunciation')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 font-serif">
                  {isEn ? 'PRONUNCIATION & SPEAKING DRILLS' : 'PRONUNCIACIÓN Y MEJORA PERSONAL'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeAccordion === 'pronunciation' ? 'rotate-180' : ''}`} />
            </button>
            
            {activeAccordion === 'pronunciation' && (
              <div className="px-5 pb-5 pt-1 border-t border-zinc-100 text-left space-y-4">
                <p className="text-[11px] text-zinc-500 leading-relaxed pt-1.5">
                  {isEn 
                    ? 'The AI Coach monitors your live speaking accent and highlights words to practice. Click any word below to start a dynamic voice drill.'
                    : 'El AI Coach analiza tus grabaciones de voz y resalta palabras clave que puedes mejorar. Toca cualquier palabra para iniciar una práctica rápida.'}
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {(learnedWords.length > 0 ? learnedWords.slice(0, 6) : ['Receipt', 'Subway', 'Thirty', 'Croissant', 'Latte', 'Schedule']).map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePracticeWord(word)}
                      className="bg-zinc-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-zinc-200 text-zinc-700 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5 opacity-70" />
                      <span>{word}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Dynamic AI Coach Welcome Note */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-3xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-yellow-700" />
        </div>
        <div className="space-y-1">
          <span className="block text-[9px] font-mono font-black text-yellow-800 uppercase tracking-widest">
            {isEn ? 'AI PERSONAL COACH SUGGESTION' : 'INTEGRACIÓN CON TU COACH PERSONAL'}
          </span>
          <p className="text-[11px] leading-relaxed text-zinc-800 font-medium">
            {isEn 
              ? `Ready to explore, Carlos? As a "${currentTypeLabel}", practicing Daily Missions is key. I'll automatically adapt dialogs and repeat vocabulary related to your goals.`
              : `¿Listo para explorar, Carlos? Como tu perfil de "${currentTypeLabel}" está activo, tus lecciones tendrán un enfoque práctico orientado a tus intereses de viaje. ¡Vamos a darle!`
            }
          </p>
        </div>
      </div>
      
    </div>
  );
};
