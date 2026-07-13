import React, { useState, useEffect, useRef } from 'react';
import { SUGGESTIONS, IMMERSION_CURRICULUM } from '../constants';
import { base64ToBytes, createAudioBufferFromPCM, float32ToPcm16, bytesToBase64, resampleAudioBuffer } from '../services/audioUtils';
import NycMap, { MapMarker, RouteInfo } from './NycMap';
import { NycSubwayMap } from './NycSubwayMap';
import { Curriculum } from './Curriculum';
import { LessonGuide } from './LessonGuide';

import { ProgressDashboard } from './ProgressDashboard';
import voyagerRobot from '../assets/images/voyager_robot_1783082204380.png';
import slide1 from '../assets/images/voyager_slide_1.jpg';
import slide2 from '../assets/images/voyager_slide_2.jpg';
import slide3 from '../assets/images/voyager_slide_3.jpg';
import { Compass, MapPin, Languages, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

interface CanvasSlideshowProps {
  slides: { src: string; alt: string }[];
  slideIndex: number;
  transitionDuration: number;
}

const CanvasSlideshow: React.FC<CanvasSlideshowProps> = ({ slides, slideIndex, transitionDuration }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentSrc, setCurrentSrc] = useState(slides[slideIndex].src);
  const animationRef = useRef<number | null>(null);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  useEffect(() => {
    slides.forEach((slide) => {
      if (!imagesRef.current[slide.src]) {
        const img = new Image();
        img.src = slide.src;
        img.onload = () => {
          imagesRef.current[slide.src] = img;
          if (slide.src === slides[slideIndex].src && canvasRef.current) {
            drawStatic(img);
          }
        };
      }
    });
  }, [slides]);

  const drawStatic = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newSrc = slides[slideIndex].src;
    const startSrc = currentSrc;
    
    if (startSrc === newSrc) {
      const img = imagesRef.current[newSrc];
      if (img) drawStatic(img);
      return;
    }

    const startTime = performance.now();
    const halfDuration = transitionDuration / 2;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed < halfDuration) {
        const img = imagesRef.current[startSrc];
        if (img) {
          const phaseProgress = elapsed / halfDuration;
          const scale = 1.0 - phaseProgress * 0.97;
          drawPixelated(img, scale);
        }
      } else {
        const img = imagesRef.current[newSrc];
        if (img) {
          const phaseProgress = (elapsed - halfDuration) / halfDuration;
          const scale = 0.03 + phaseProgress * 0.97;
          drawPixelated(img, scale);
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentSrc(newSrc);
        const finalImg = imagesRef.current[newSrc];
        if (finalImg) drawStatic(finalImg);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [slideIndex]);

  const drawPixelated = (img: HTMLImageElement, scale: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const sw = Math.max(4, Math.round(w * scale));
    const sh = Math.max(4, Math.round(h * scale));

    ctx.imageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sw;
    tempCanvas.height = sh;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0, sw, sh);
    ctx.drawImage(tempCanvas, 0, 0, sw, sh, 0, 0, w, h);
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={286} 
      height={506} 
      className="w-full h-full object-cover" 
    />
  );
};

interface TravelDestination {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  subwayLines: string[];
  subwayDirections: string;
  subwayDirectionsEn: string;
  taxiTime: string;
  taxiFare: string;
  walkTime: string;
  walkDist: string;
  bikeTime: string;
  vocab: string[];
  phrases: { en: string; es: string }[];
}

const TRAVEL_PRESETS: TravelDestination[] = [
  {
    name: "Times Square",
    nameEn: "Times Square",
    lat: 40.758895,
    lng: -73.985131,
    subwayLines: ['1', '2', '3', 'N', 'Q', 'R', '7'],
    subwayDirections: "Toma las líneas N, Q, R o 1, 2, 3 directo a la estación Times Square - 42 St.",
    subwayDirectionsEn: "Take lines N, Q, R or 1, 2, 3 directly to Times Square - 42 St Station.",
    taxiTime: "8 mins",
    taxiFare: "$12.00",
    walkTime: "15 mins",
    walkDist: "0.7 mi",
    bikeTime: "6 mins",
    vocab: ["Crosswalk (Paso de peatones)", "Traffic light (Semáforo)", "Gridlock (Atascamiento)", "Broadway show (Show de Broadway)", "Double-decker bus (Autobús de dos pisos)"],
    phrases: [
      { en: "Excuse me, is this the right way to Times Square?", es: "Disculpe, ¿es este el camino correcto a Times Square?" },
      { en: "Where can I buy tickets for a Broadway show?", es: "¿Dónde puedo comprar boletos para un show de Broadway?" },
      { en: "How many blocks away is the nearest subway station?", es: "¿A cuántas cuadras está la estación de metro más cercana?" }
    ]
  },
  {
    name: "Puente de Brooklyn",
    nameEn: "Brooklyn Bridge",
    lat: 40.7061,
    lng: -73.9969,
    subwayLines: ['4', '5', '6', 'J', 'Z'],
    subwayDirections: "Toma la línea 4, 5, 6 hacia Brooklyn Bridge - City Hall.",
    subwayDirectionsEn: "Take the 4, 5, 6 train to Brooklyn Bridge - City Hall Station.",
    taxiTime: "22 mins",
    taxiFare: "$32.50",
    walkTime: "1h 15 mins",
    walkDist: "3.6 mi",
    bikeTime: "24 mins",
    vocab: ["Pedestrian path (Sendero peatonal)", "Suspension bridge (Puente colgante)", "Skyline (Horizonte urbano)", "East River (Río del Este)", "Boardwalk (Camino de madera)"],
    phrases: [
      { en: "Where is the entrance to the pedestrian path?", es: "¿Dónde está la entrada al camino peatonal?" },
      { en: "Can we walk across the Brooklyn Bridge?", es: "¿Podemos cruzar el puente de Brooklyn a pie?" },
      { en: "Is there a nice viewpoint of the skyline nearby?", es: "¿Hay algún buen mirador del horizonte urbano cerca?" }
    ]
  },
  {
    name: "Central Park (Strawberry Fields)",
    nameEn: "Central Park (Strawberry Fields)",
    lat: 40.7722,
    lng: -73.9747,
    subwayLines: ['A', 'B', 'C'],
    subwayDirections: "Toma la línea C o B hacia 72 St Station, Central Park West.",
    subwayDirectionsEn: "Take the B or C train to 72 St Station on Central Park West.",
    taxiTime: "12 mins",
    taxiFare: "$18.50",
    walkTime: "25 mins",
    walkDist: "1.2 mi",
    bikeTime: "10 mins",
    vocab: ["Pathway (Sendero)", "Meadow (Pradera/Claro)", "Reservoir (Embalse)", "Rowboat (Bote de remos)", "Conservatory (Invernadero)"],
    phrases: [
      { en: "Is it safe to walk through the park at night?", es: "¿Es seguro caminar por el parque de noche?" },
      { en: "Where can I rent a rowboat in Central Park?", es: "¿Dónde puedo alquilar un bote de remos en Central Park?" },
      { en: "Could you point me towards Strawberry Fields?", es: "¿Podría indicarme hacia dónde queda Strawberry Fields?" }
    ]
  },
  {
    name: "Empire State Building",
    nameEn: "Empire State Building",
    lat: 40.748440,
    lng: -73.985664,
    subwayLines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R'],
    subwayDirections: "Toma el tren N, R o B, D hacia 34 St - Herald Square.",
    subwayDirectionsEn: "Take the N, R or B, D train to 34 St - Herald Square.",
    taxiTime: "6 mins",
    taxiFare: "$9.50",
    walkTime: "10 mins",
    walkDist: "0.4 mi",
    bikeTime: "4 mins",
    vocab: ["Observation deck (Plataforma de observación)", "Skyscraper (Rascacielos)", "Lobby (Vestíbulo)", "Elevator ride (Viaje en ascensor)", "Ticket counter (Ventanilla de boletos)"],
    phrases: [
      { en: "Excuse me, where is the entrance for the observation deck?", es: "Disculpe, ¿dónde está la entrada para la plataforma de observación?" },
      { en: "How long is the wait for the elevator?", es: "¿Cuánto tiempo hay que esperar para el ascensor?" },
      { en: "Can I buy tickets at the ticket counter?", es: "¿Puedo comprar boletos en la ventanilla de boletos?" }
    ]
  },
  {
    name: "Estatua de la Libertad (Battery Park)",
    nameEn: "Statue of Liberty (Battery Park)",
    lat: 40.7036,
    lng: -74.0169,
    subwayLines: ['1', 'R', 'W', '4', '5'],
    subwayDirections: "Toma la línea 1 hacia South Ferry o el 4, 5 hacia Bowling Green.",
    subwayDirectionsEn: "Take the 1 train to South Ferry or 4, 5 train to Bowling Green.",
    taxiTime: "24 mins",
    taxiFare: "$35.00",
    walkTime: "1h 30 mins",
    walkDist: "4.2 mi",
    bikeTime: "28 mins",
    vocab: ["Ferry dock (Muelle de ferry)", "Harbor (Puerto)", "Pedestal (Pedestal)", "Crown access (Acceso a la corona)", "Security screening (Control de seguridad)"],
    phrases: [
      { en: "Which dock does the ferry to Liberty Island leave from?", es: "¿De qué muelle sale el ferry a la Isla de la Libertad?" },
      { en: "Do I need to book crown access tickets in advance?", es: "¿Necesito reservar boletos de acceso a la corona con anticipación?" },
      { en: "Where can I board the boat to the Statue of Liberty?", es: "¿Dónde puedo abordar el barco a la Estatua de la Libertad?" }
    ]
  }
];

interface LiveAgentProps {
  isWidgetMode: boolean;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'splash' | 'system';
  text: string;
  timestamp: string;
  timeMs: number;
  showForm?: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
  createdAt: string;
  chatTranscript: { sender: string; text: string; timestamp: string }[];
}

const translations = {
  EN: {
    standby: "EN ESPERA",
    connecting: "Conectando...",
    connect: "CONECTAR",
    active: "ACTIVO",
    disconnected: "Desconectado",
    session: "Sesión",
    disconnectBtn: "FINALIZAR",
    connectionError: "Error de Conexión",
    howToFix: "👉 How to fix this error:",
    step1: "Open the Settings panel (⚙️ gear icon) in AI Studio.",
    step2: "Input a valid GEMINI_API_KEY.",
    step3: "Save and retry connecting.",
    interactiveConsole: "Consola Interactiva",
    liveConversation: "Conversación en Vivo",
    leadsBtn: "Lugares Guardados",
    collectLeadBtn: "Añadir Notas de Viaje",
    databaseCapturedLeads: "Historial y Notas de Viaje en NYC",
    backToChat: "Volver al Chat",
    noLeads: "No travel notes saved yet.",
    fillFormTest: "Fill out the notes to save your favorite NYC spots and vocabulary learnings.",
    viewSavedTranscript: "Ver Transcripción Guardada",
    askPlaceholder: "Type your query or location here...",
    blueprintRegistered: "Travel Plan Saved!",
    proposalSuccessMsg: "Your NYC travel plan and chat history have been successfully saved to the server database.",
    backToConsole: "Volver al Panel de Voyager",
    secureAgentBlueprint: "Guardar Plan de Viaje",
    requestProposal: "Guardar Plan de Viaje en NYC",
    formInstructions: "Enter your details to save your customized NYC travel log, landmarks list, and practice transcript.",
    fullName: "Your Name *",
    fullNamePlaceholder: "e.g. Jane Doe",
    emailAddress: "Email Address *",
    emailPlaceholder: "e.g. jane@example.com",
    company: "Primary Interest",
    companyPlaceholder: "e.g. History, Food, Language",
    phone: "Mobile Number",
    phonePlaceholder: "e.g. +1 555-0199",
    customReqs: "Travel Notes & Landmark Favorites",
    textareaPlaceholder: "What neighborhoods or vocabulary topics do you want to keep in your travel log?",
    submitBtn: "Guardar Diario de Viaje",
    submittingBtn: "Guardando Diario...",
    nameEmailRequired: "Name and Email are required fields.",
    systemOnline: "Voyager language and travel guide system online.",
    welcomeMsg: "Hello! I'm VOYAGER, your bilingual NYC travel guide and language tutor. Let's practice English or Spanish while exploring New York! Click Connect to begin.",
    endConversation: "FINALIZAR",
    reviewChat: "Califica tu Sesión con Voyager",
    submitReview: "Enviar Calificación",
    reviewPlaceholder: "Tell us how your conversation went...",
    thankYouReview: "Thank you for practicing with Voyager!"
  },
  ES: {
    standby: "EN ESPERA",
    connecting: "Conectando...",
    connect: "CONECTAR",
    active: "ACTIVO",
    disconnected: "Desconectado",
    session: "Sesión",
    disconnectBtn: "FINALIZAR",
    connectionError: "Error de Conexión",
    howToFix: "👉 Cómo solucionar este error:",
    step1: "Abre el panel de Configuración (icono de engranaje ⚙️) en AI Studio.",
    step2: "Introduce una clave GEMINI_API_KEY válida.",
    step3: "Guarda los cambios y vuelve a intentar la conexión.",
    interactiveConsole: "Consola Interactiva",
    liveConversation: "Conversación en Vivo",
    leadsBtn: "Lugares Guardados",
    collectLeadBtn: "Añadir Notas de Viaje",
    databaseCapturedLeads: "Historial y Notas de Viaje en NYC",
    backToChat: "Volver al Chat",
    noLeads: "Aún no hay notas de viaje guardadas.",
    fillFormTest: "Completa tus notas para guardar tus lugares favoritos de NYC y las palabras aprendidas.",
    viewSavedTranscript: "Ver Transcripción Guardada",
    askPlaceholder: "Escribe tu consulta o lugar aquí...",
    blueprintRegistered: "¡Plan de Viaje Registrado!",
    proposalSuccessMsg: "Tu plan de viaje personalizado y tu historial de conversación se han guardado con éxito.",
    backToConsole: "Volver al Panel de Voyager",
    secureAgentBlueprint: "Guardar Plan de Viaje",
    requestProposal: "Guardar Plan de Viaje en NYC",
    formInstructions: "Completa tus datos para guardar tu diario de viaje por NYC, tu lista de monumentos y tu transcripción de práctica.",
    fullName: "Tu Nombre *",
    fullNamePlaceholder: "ej. Jane Doe",
    emailAddress: "Correo Electrónico *",
    emailPlaceholder: "ej. jane@ejemplo.com",
    company: "Interés Principal",
    companyPlaceholder: "ej. Historia, Comida, Idioma",
    phone: "Número de Teléfono",
    phonePlaceholder: "ej. +1 555-0199",
    customReqs: "Notas de Viaje y Monumentos Favoritos",
    textareaPlaceholder: "¿Qué vecindarios o temas de vocabulario deseas mantener en tu diario de viaje?",
    submitBtn: "Guardar Diario de Viaje",
    submittingBtn: "Guardando Diario...",
    nameEmailRequired: "El nombre y el correo electrónico son campos obligatorios.",
    systemOnline: "Sistema Voyager en línea. Tu tutor de inglés y guía de NYC está listo.",
    welcomeMsg: "¡Hola! Soy VOYAGER, tu guía de NYC y tutor de inglés. ¡Practiquemos inglés mientras exploramos Nueva York! Haz clic en Conectar para empezar.",
    endConversation: "FINALIZAR",
    reviewChat: "Califica tu Sesión con Voyager",
    submitReview: "Enviar Calificación",
    reviewPlaceholder: "Cuéntanos sobre tu experiencia de práctica...",
    thankYouReview: "¡Gracias por practicar con Voyager!"
  }
};

const getTranslatedMessageText = (msg: ChatMessage, lang: 'EN' | 'ES') => {
  if (msg.id === 'system_1') {
    return translations[lang].systemOnline;
  }
  if (msg.id === 'welcome_1') {
    return translations[lang].welcomeMsg;
  }
  return msg.text;
};

const LiveAgent: React.FC<LiveAgentProps> = ({ isWidgetMode, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListenOnly, setIsListenOnly] = useState(false);
  const isListenOnlyRef = useRef(isListenOnly);
  
  const [isTranslateMode, setIsTranslateMode] = useState(false);
  const isTranslateModeRef = useRef(isTranslateMode);
  
  const [isBilingualMode, setIsBilingualMode] = useState(true);
  const isBilingualModeRef = useRef(true);
  
  const [isSpanishOnlyMode, setIsSpanishOnlyMode] = useState(false);
  const isSpanishOnlyModeRef = useRef(isSpanishOnlyMode);
  
  const [isEnglishOnlyMode, setIsEnglishOnlyMode] = useState(false);
  const isEnglishOnlyModeRef = useRef(isEnglishOnlyMode);
  
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const lastInteractionTimeRef = useRef(Date.now());
  
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Disconnected");

  // NYC Map State
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 40.758895, lng: -73.985131 }); // Default: Times Square
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'lessons' | 'trips'>('chat');
  const [viajesSubTab, setViajesSubTab] = useState<'planner' | 'subway' | 'google_map'>('planner');
  const [selectedTripDestination, setSelectedTripDestination] = useState<TravelDestination | null>(null);
  const [customDestinationText, setCustomDestinationText] = useState("");
  const [classroomSubTab, setClassroomSubTab] = useState<'map' | 'subway_map'>('map');
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeLessonDay, setActiveLessonDay] = useState<number | null>(null);
  const [activeLessonLevel, setActiveLessonLevel] = useState<'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO' | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'>('PRINCIPIANTE');
  const [isVocabHudOpen, setIsVocabHudOpen] = useState<boolean>(false);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [scores, setScores] = useState({ grammar: 0, pronunciation: 0, confidence: 0, naturalness: 0 });
  const [learnedWords, setLearnedWords] = useState<string[]>([]);
  const [accentPatterns, setAccentPatterns] = useState<string[]>([]);

  // Slideshow State
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeFullscreenSlide, setActiveFullscreenSlide] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    { src: slide1, alt: "Explora NYC, Aprende Inglés" },
    { src: slide2, alt: "Aprende antes de hablar" },
    { src: slide3, alt: "Practica conversaciones cotidianas" }
  ];



  // Keyboard navigation for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFullscreenSlide === null) return;
      if (e.key === 'Escape') {
        setActiveFullscreenSlide(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveFullscreenSlide((prev) => prev !== null ? (prev - 1 + slides.length) % slides.length : null);
      } else if (e.key === 'ArrowRight') {
        setActiveFullscreenSlide((prev) => prev !== null ? (prev + 1) % slides.length : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFullscreenSlide, slides.length]);

  const handleToggleMission = (missionId: string) => {
    setCompletedMissions(prev => 
      prev.includes(missionId) 
        ? prev.filter(id => id !== missionId) 
        : [...prev, missionId]
    );
  };

  const handleSelectPresetDestination = (dest: TravelDestination) => {
    setSelectedTripDestination(dest);
    setMapCenter({ lat: dest.lat, lng: dest.lng });
    setMarkers([{
      id: 'dest_marker',
      lat: dest.lat,
      lng: dest.lng,
      title: dest.name
    }]);
  };

  const handleCustomDestinationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDestinationText.trim()) return;
    
    const destName = customDestinationText.trim();
    const mockDest: TravelDestination = {
      name: destName,
      nameEn: destName,
      lat: 40.758895 + (Math.random() - 0.5) * 0.04,
      lng: -73.985131 + (Math.random() - 0.5) * 0.04,
      subwayLines: ['N', 'R', '1', '6'],
      subwayDirections: `Toma las líneas N/R o 1/6 hacia la estación más cercana a ${destName}.`,
      subwayDirectionsEn: `Take the N/R or 1/6 train to the station closest to ${destName}.`,
      taxiTime: `${Math.floor(Math.random() * 15) + 8} mins`,
      taxiFare: `$${(Math.random() * 15 + 10).toFixed(2)}`,
      walkTime: `${Math.floor(Math.random() * 40) + 15} mins`,
      walkDist: `${(Math.random() * 2 + 0.5).toFixed(1)} mi`,
      bikeTime: `${Math.floor(Math.random() * 12) + 5} mins`,
      vocab: ["Navigation (Navegación)", "Corner (Esquina)", "Subway entrance (Entrada del metro)", "Street sign (Letrero de la calle)", "Map routing (Ruta de mapa)"],
      phrases: [
        { en: `Excuse me, how do I get to ${destName}?`, es: `Disculpe, ¿cómo llego a ${destName}?` },
        { en: `Is ${destName} within walking distance from here?`, es: `¿Está ${destName} a una de distancia caminable desde aquí?` },
        { en: `Could you tell me which train goes to ${destName}?`, es: `¿Podrías decirme qué tren va a ${destName}?` }
      ]
    };
    setSelectedTripDestination(mockDest);
    setMapCenter({ lat: mockDest.lat, lng: mockDest.lng });
    setMarkers([{
      id: 'dest_marker',
      lat: mockDest.lat,
      lng: mockDest.lng,
      title: mockDest.name
    }]);
    setCustomDestinationText("");
  };

  const speakTravelPhrase = (phrase: string, lang: 'en-US' | 'es-ES') => {
    const speech = new SpeechSynthesisUtterance(phrase);
    speech.lang = lang;
    window.speechSynthesis.speak(speech);
  };

  const parseImmersionTags = (text: string) => {
    let cleaned = text;
    let newScores = null;
    let newLearnedWords: string[] = [];
    let newAccentPattern = null;
    let newCompletedMission = null;

    // 1. Scores
    const scoresMatch = cleaned.match(/\[SCORES:\s*grammar=(\d+),\s*pronunciation=(\d+),\s*confidence=(\d+),\s*naturalness=(\d+)\]/i);
    if (scoresMatch) {
      newScores = {
        grammar: parseInt(scoresMatch[1], 10),
        pronunciation: parseInt(scoresMatch[2], 10),
        confidence: parseInt(scoresMatch[3], 10),
        naturalness: parseInt(scoresMatch[4], 10)
      };
      cleaned = cleaned.replace(scoresMatch[0], "");
    }

    // 2. Learned Words
    const learnedMatch = cleaned.match(/\[LEARNED_WORDS:\s*([^\]]+)\]/i);
    if (learnedMatch) {
      newLearnedWords = learnedMatch[1].split(',').map(w => w.trim()).filter(Boolean);
      cleaned = cleaned.replace(learnedMatch[0], "");
    }

    // 3. Accent
    const accentMatch = cleaned.match(/\[ACCENT:\s*([^\]]+)\]/i);
    if (accentMatch) {
      newAccentPattern = accentMatch[1].trim();
      cleaned = cleaned.replace(accentMatch[0], "");
    }

    // 4. Mission
    const missionMatch = cleaned.match(/\[MISSION_COMPLETE:\s*([^\]]+)\]/i);
    if (missionMatch) {
      newCompletedMission = missionMatch[1].trim();
      cleaned = cleaned.replace(missionMatch[0], "");
    }

    return { cleaned, newScores, newLearnedWords, newAccentPattern, newCompletedMission };
  };

  const updateLearningState = (parsed: ReturnType<typeof parseImmersionTags>) => {
    if (parsed.newScores) {
      setScores(parsed.newScores);
    }
    if (parsed.newLearnedWords.length > 0) {
      setLearnedWords(prev => {
        const next = [...prev];
        parsed.newLearnedWords.forEach(w => {
          if (!next.includes(w)) next.push(w);
        });
        return next;
      });
    }
    if (parsed.newAccentPattern) {
      const pattern = parsed.newAccentPattern;
      setAccentPatterns(prev => {
        if (!prev.includes(pattern)) return [...prev, pattern];
        return prev;
      });
    }
    if (parsed.newCompletedMission) {
      const mId = parsed.newCompletedMission;
      setCompletedMissions(prev => {
        if (!prev.includes(mId)) return [...prev, mId];
        return prev;
      });
    }
  };

  // Chat & Leads State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [serverLeads, setServerLeads] = useState<Lead[]>([]);

  // Inline Lead Form State
  const [inlineLeadForm, setInlineLeadForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    meetingTime: "",
    consent: false,
    notes: ""
  });
  const [isSubmittingInlineLead, setIsSubmittingInlineLead] = useState(false);
  const [inlineLeadSuccess, setInlineLeadSuccess] = useState(false);
  const [inlineLeadError, setInlineLeadError] = useState<string | null>(null);
  const [inlineFormStep, setInlineFormStep] = useState<'details' | 'services'>('details');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [selectedCalendarTime, setSelectedCalendarTime] = useState("09:00");

  // Chat Review State
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Session Elapsed Time
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [selectedLang, setSelectedLang] = useState<'EN' | 'ES'>('ES');

  useEffect(() => {
    const wasListenOnly = isListenOnlyRef.current;
    isListenOnlyRef.current = isListenOnly;
    
    if (wasListenOnly !== isListenOnly) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msgText = isListenOnly 
          ? "[SYSTEM MESSAGE: Mode changed. You are now in Monitor/Listen-only mode. However, BEFORE you go fully silent, you MUST immediately speak and write a brief explanation in Spanish (only one warm sentence) explaining what this mode does (that you will listen only and offer tips in the text chat, and won't speak unless given permission). End your sentence by saying that you will now be quiet and listen. Do NOT say 'Understood' or 'Entendido'. after saying this explanation, you must remain silent for subsequent turns and only respond via text unless asked '¿Puedo hablar?'.]"
          : "[SYSTEM MESSAGE: Mode changed. Speak aloud a brief explanation in Spanish (one warm sentence) telling the user you are now back in normal voice mode and will speak and respond normally. Do NOT say 'Understood' or 'Entendido'.]";
        
        wsRef.current.send(JSON.stringify({ text: msgText }));
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_sys_listen_${Date.now()}`,
          sender: 'system',
          text: isListenOnly 
            ? (selectedLang === 'EN' 
              ? 'ℹ️ Monitor mode active: VOYAGER is listening only and will not speak. Feedback will be provided via text.'
              : 'ℹ️ Modo monitor activo: VOYAGER está solo escuchando y no hablará. Las correcciones se mostrarán por texto.')
            : (selectedLang === 'EN'
              ? 'ℹ️ Normal mode active: VOYAGER can speak and respond normally.'
              : 'ℹ️ Modo normal activo: VOYAGER hablará y responderá con voz.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
  }, [isListenOnly, selectedLang]);

  useEffect(() => {
    const wasTranslateMode = isTranslateModeRef.current;
    isTranslateModeRef.current = isTranslateMode;
    
    if (wasTranslateMode !== isTranslateMode) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msgText = isTranslateMode 
          ? "[SYSTEM MESSAGE: Mode changed. You are now in INSTANT TRANSLATION MODE. From now on, whatever you hear in English, you must translate to Spanish. If the user speaks in Spanish, you must translate to English. Output ONLY the translated words and absolutely nothing else, both in your voice and in your text transcription. Do NOT say 'Understood' or 'Entendido'. In this very first response, translate this message to Spanish: 'Instant Translation Mode is now active. I am ready to translate.']"
          : "[SYSTEM MESSAGE: Mode changed. Speak aloud a brief explanation in Spanish (one warm sentence) telling the user that you are now back in normal voice guide mode, guiding them through NYC and helping with vocabulary. Do NOT say 'Understood' or 'Entendido'.]";
        
        wsRef.current.send(JSON.stringify({ text: msgText }));
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_sys_translate_${Date.now()}`,
          sender: 'system',
          text: isTranslateMode 
            ? (selectedLang === 'EN' 
              ? 'ℹ️ Instant Translation Mode active: VOYAGER will translate what you say immediately.'
              : 'ℹ️ Modo Traducción Instantánea activo: VOYAGER traducirá lo que digas de inmediato.')
            : (selectedLang === 'EN'
              ? 'ℹ️ Normal mode active: VOYAGER is back as your NYC guide and tutor.'
              : 'ℹ️ Modo normal activo: VOYAGER vuelve a ser tu guía y tutor en NYC.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
  }, [isTranslateMode, selectedLang]);

  useEffect(() => {
    const wasBilingualMode = isBilingualModeRef.current;
    isBilingualModeRef.current = isBilingualMode;
    
    if (wasBilingualMode !== isBilingualMode) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msgText = isBilingualMode 
          ? "[SYSTEM MESSAGE: Mode changed. You are now in BILINGUAL TRANSLATION MODE. You must immediately speak and write a brief explanation in Spanish (only one warm sentence) explaining what this mode does (that you will say all your responses first in Spanish, and then repeat them in English). Do NOT say 'Understood' or 'Entendido'.]"
          : "[SYSTEM MESSAGE: Mode changed. Speak aloud a brief explanation in Spanish (one warm sentence) telling the user that you are now back in normal voice guide mode, guiding them through NYC and helping with vocabulary. Do NOT say 'Understood' or 'Entendido'.]";
        
        wsRef.current.send(JSON.stringify({ text: msgText }));
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_sys_bilingual_${Date.now()}`,
          sender: 'system',
          text: isBilingualMode 
            ? (selectedLang === 'EN' 
              ? 'ℹ️ Bilingual Mode active: VOYAGER will respond in Spanish and repeat in English.'
              : 'ℹ️ Modo Bilingüe activo: VOYAGER responderá en español y lo repetirá en inglés.')
            : (selectedLang === 'EN'
              ? 'ℹ️ Normal mode active: VOYAGER is back as your NYC guide and tutor.'
              : 'ℹ️ Modo normal activo: VOYAGER vuelve a ser tu guía y tutor en NYC.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
  }, [isBilingualMode, selectedLang]);

  useEffect(() => {
    const wasSpanishOnly = isSpanishOnlyModeRef.current;
    isSpanishOnlyModeRef.current = isSpanishOnlyMode;
    
    if (wasSpanishOnly !== isSpanishOnlyMode) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msgText = isSpanishOnlyMode 
          ? "[SYSTEM MESSAGE: Mode changed. You are now in SPANISH ONLY MODE. You must speak and write strictly and purely in Spanish from now on. Discuss information, landmarks, and details about New York City in Spanish. Do NOT teach English, evaluate grammar, or translate any text. Speak only in Spanish. Do NOT say 'Understood' or 'Entendido'.]"
          : "[SYSTEM MESSAGE: Mode changed. Speak aloud a brief explanation in Spanish (one warm sentence) telling the user that you are now back in normal voice guide mode, guiding them through NYC and helping with vocabulary. Do NOT say 'Understood' or 'Entendido'.]";
        
        wsRef.current.send(JSON.stringify({ text: msgText }));
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_sys_spanish_${Date.now()}`,
          sender: 'system',
          text: isSpanishOnlyMode 
            ? (selectedLang === 'EN' 
              ? 'ℹ️ Spanish Only Mode active: VOYAGER will converse with you strictly in Spanish to discuss city details.'
              : 'ℹ️ Modo Solo Español activo: VOYAGER conversará contigo estrictamente en español para hablar de la ciudad.')
            : (selectedLang === 'EN'
              ? 'ℹ️ Normal mode active: VOYAGER is back as your NYC guide and tutor.'
              : 'ℹ️ Modo normal activo: VOYAGER vuelve a ser tu guía y tutor en NYC.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
  }, [isSpanishOnlyMode, selectedLang]);

  useEffect(() => {
    const wasEnglishOnly = isEnglishOnlyModeRef.current;
    isEnglishOnlyModeRef.current = isEnglishOnlyMode;
    
    if (wasEnglishOnly !== isEnglishOnlyMode) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msgText = isEnglishOnlyMode 
          ? "[SYSTEM MESSAGE: Mode changed. You are now in ENGLISH ONLY MODE. You must speak and write strictly and purely in English. Do NOT provide any Spanish translations, hints, corrections, or bilingual tips. Speak naturally as a native English speaker from New York City. This is a pure immersion practice mode for advanced students. Speak only in English. Do NOT say 'Understood' or 'Entendido'.]"
          : "[SYSTEM MESSAGE: Mode changed. Speak aloud a brief explanation in Spanish (one warm sentence) telling the user that you are now back in normal voice guide mode, guiding them through NYC and helping with vocabulary. Do NOT say 'Understood' or 'Entendido'.]";
        
        wsRef.current.send(JSON.stringify({ text: msgText }));
      }
      
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg_sys_english_${Date.now()}`,
          sender: 'system',
          text: isEnglishOnlyMode 
            ? (selectedLang === 'EN' 
              ? 'ℹ️ English Only Mode active: VOYAGER will speak strictly in English for advanced practice.'
              : 'ℹ️ Modo Solo Inglés activo: VOYAGER hablará estrictamente en inglés para práctica avanzada.')
            : (selectedLang === 'EN'
              ? 'ℹ️ Normal mode active: VOYAGER is back as your NYC guide and tutor.'
              : 'ℹ️ Modo normal activo: VOYAGER vuelve a ser tu guía y tutor en NYC.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
  }, [isEnglishOnlyMode, selectedLang]);

  useEffect(() => {
    if (isTranslateMode) {
      setIsListenOnly(false);
      setIsBilingualMode(false);
      setIsSpanishOnlyMode(false);
      setIsEnglishOnlyMode(false);
    }
  }, [isTranslateMode]);

  useEffect(() => {
    if (isListenOnly) {
      setIsTranslateMode(false);
      setIsBilingualMode(false);
      setIsSpanishOnlyMode(false);
      setIsEnglishOnlyMode(false);
    }
  }, [isListenOnly]);

  useEffect(() => {
    if (isBilingualMode) {
      setIsListenOnly(false);
      setIsTranslateMode(false);
      setIsSpanishOnlyMode(false);
      setIsEnglishOnlyMode(false);
    }
  }, [isBilingualMode]);

  useEffect(() => {
    if (isSpanishOnlyMode) {
      setIsListenOnly(false);
      setIsTranslateMode(false);
      setIsBilingualMode(false);
      setIsEnglishOnlyMode(false);
    }
  }, [isSpanishOnlyMode]);

  useEffect(() => {
    if (isEnglishOnlyMode) {
      setIsListenOnly(false);
      setIsTranslateMode(false);
      setIsBilingualMode(false);
      setIsSpanishOnlyMode(false);
    }
  }, [isEnglishOnlyMode]);

  const hasInteracted = isConnected || statusText === "Connecting..." || chatMessages.length > 1;

  useEffect(() => {
    if (!isConnected) {
      setSecondsElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Scroll ref for chat feed
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Input Placeholder typing animation
  const [placeholderText, setPlaceholderText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const phrases = [
      "Empieza aca...",
      "Pregúntame cómo te puedo ayudar...",
      "Soy tu agente de voz y chat de IA..."
    ];
    let timer: any;
    const currentPhrase = phrases[placeholderIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        if (placeholderText.length + 1 === currentPhrase.length) {
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
        setTypingSpeed(90);
      } else {
        setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        if (placeholderText.length - 1 === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(400);
          return;
        }
        setTypingSpeed(45);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex, typingSpeed]);

  // Particle visualizer canvas refs & loop
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const volumeRef = useRef(0);
  volumeRef.current = volume;

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    // Initialize 900 ring particles concentrated in a band (yellow cab)
    const numParticles = 900;
    const particles: { angle: number; r: number; speed: number; pulsePhase: number; size: number }[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        angle: Math.random() * 2 * Math.PI,
        // Bell-curve concentration around radius 56
        r: 45 + Math.random() * 18 + (Math.random() - 0.5) * 8,
        speed: (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        pulsePhase: Math.random() * 2 * Math.PI,
        size: 0.6 + Math.random() * 1.4
      });
    }

    // Initialize orbiting circles (moons) rotating around the oval
    const numOrbiters = 8;
    const orbiters: { angle: number; speed: number; rx: number; ry: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < numOrbiters; i++) {
      let rxFactor = 1.35 + (i % 3) * 0.12;
      let ryFactor = 1.0 + (i % 3) * 0.08;
      orbiters.push({
        angle: (i * 2 * Math.PI) / numOrbiters + Math.random() * 0.5,
        speed: (0.007 + (i % 3) * 0.005) * (i % 2 === 0 ? 1 : -1),
        rx: 55 * rxFactor,
        ry: 55 * ryFactor,
        size: 1.8 + (i % 4) * 0.6,
        alpha: 0.55 + (i % 3) * 0.12
      });
    }

    const renderLoop = () => {
      const canvas = particleCanvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const currentVolume = volumeRef.current;

      ctx.clearRect(0, 0, width, height);

      // Radial background glow (yellow cab)
      let grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 60 + currentVolume * 0.65);
      grad.addColorStop(0, 'rgba(234, 179, 8, 0.2)');
      grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.06)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 95 + currentVolume * 0.5, 0, 2 * Math.PI);
      ctx.fill();

      // Outer ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 75, 54.6, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.05)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Shimmering dust particles
      time += 1;
      for (let i = 0; i < numParticles; i++) {
        let p = particles[i];
        let speedMultiplier = 1.0 + (currentVolume * 0.08);
        p.angle += p.speed * speedMultiplier;

        let radialJitter = Math.sin(p.pulsePhase + time * 0.05) * (1.2 + currentVolume * 0.08);
        let volumeJitter = (Math.random() - 0.5) * (currentVolume * 0.5);
        let finalRadius = p.r + radialJitter + volumeJitter;

        p.pulsePhase += 0.02;

        let px = centerX + Math.cos(p.angle) * finalRadius * 1.35;
        let py = centerY + Math.sin(p.angle) * finalRadius * 1.0;
        let opacity = 0.35 + Math.sin(p.pulsePhase + i) * 0.25 + (Math.random() * 0.25);
        
        ctx.fillStyle = `rgba(234, 179, 8, ${opacity})`;
        ctx.fillRect(px, py, p.size, p.size);
      }

      // Orbiting circles
      for (let i = 0; i < numOrbiters; i++) {
        let orb = orbiters[i];
        let speedMultiplier = 1.0 + (currentVolume * 0.08);
        orb.angle += orb.speed * speedMultiplier;

        let radialJitter = (Math.random() - 0.5) * (currentVolume * 0.35);
        let finalRx = orb.rx + radialJitter;
        let finalRy = orb.ry + radialJitter;

        let ox = centerX + Math.cos(orb.angle) * finalRx;
        let oy = centerY + Math.sin(orb.angle) * finalRy;

        ctx.beginPath();
        ctx.arc(ox, oy, orb.size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(234, 179, 8, ${orb.alpha})`;
        ctx.shadowBlur = 6 + (currentVolume / 100) * 8;
        ctx.shadowColor = '#eab308';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Fetch leads and set up welcome message
  useEffect(() => {
    fetchLeads();
    
    setChatMessages([
      {
        id: 'welcome_1',
        sender: 'splash',
        text: 'Hi! I\'m VOYAGER, your NYC guide and English tutor. Click Connect to start a voice-and-text conversation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
         const data = await response.json();
         setServerLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const adjustedStart = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay; i++) {
      days.push(i);
    }
    return days;
  };

  const handleInlineLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineLeadForm.name.trim() || !inlineLeadForm.email.trim() || !inlineLeadForm.phone.trim()) {
      setInlineLeadError(selectedLang === 'EN' ? "Name, email, and phone number are required." : "Se requiere nombre, correo y número telefónico.");
      return;
    }
    
    setIsSubmittingInlineLead(true);
    setInlineLeadError(null);

    try {
      let combinedNotes = inlineLeadForm.notes;
      if (chatMessages.length > 2) {
        const transcriptText = chatMessages
          .filter(m => m.id !== 'system_1' && m.id !== 'welcome_1')
          .map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${getTranslatedMessageText(m, selectedLang)}`)
          .join('\n');
        
        if (transcriptText) {
          combinedNotes = `${inlineLeadForm.notes}\n\n=== Live Chat Transcript ===\n${transcriptText}`;
        }
      }

      const payload = {
        name: inlineLeadForm.name,
        email: inlineLeadForm.email,
        company: inlineLeadForm.company,
        phone: inlineLeadForm.phone,
        notes: `Preferred Meeting Time: ${inlineLeadForm.meetingTime || "Not selected"}\nMarketing Consent Given: ${inlineLeadForm.consent ? "Yes" : "No"}\nServices of Interest: ${selectedServices.length > 0 ? selectedServices.join(", ") : "None selected"}\n\n${combinedNotes}`,
        chatTranscript: chatMessages
          .filter(m => m.id !== 'system_1' && m.id !== 'welcome_1')
          .map(m => ({
            sender: m.sender,
            text: getTranslatedMessageText(m, selectedLang),
            timestamp: m.timestamp
          }))
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setInlineLeadSuccess(true);
        fetchLeads();
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log("Form saved. Relaying lead details to Gemini Live to book meeting...");
          const triggerMsg = `[SYSTEM MESSAGE: The user has filled out the contact form. Name: ${inlineLeadForm.name}, Email: ${inlineLeadForm.email}, Phone: ${inlineLeadForm.phone || "Not provided"}, Selected Preferred Meeting Time: ${inlineLeadForm.meetingTime || "Not provided"}, Services of Interest: ${selectedServices.length > 0 ? selectedServices.join(", ") : "None selected"}. Please proceed to book the meeting using the calendar_book_meeting tool for this exact selected date/time now.]`;
          wsRef.current.send(JSON.stringify({ text: triggerMsg }));
        }
      } else {
        setInlineLeadError(data.error || "Failed to submit lead.");
      }
    } catch (err) {
      console.error("Error submitting inline lead:", err);
      setInlineLeadError("An error occurred while saving your lead.");
    } finally {
      setIsSubmittingInlineLead(false);
    }
  };

  const handleEndConversation = () => {
    disconnect();
    setShowReviewScreen(false);
    setChatMessages([
      {
        id: 'welcome_1',
        sender: 'splash',
        text: translations[selectedLang].welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) return;
    
    setIsSubmittingReview(true);
    try {
      const payload = {
        rating: reviewRating,
        comment: reviewText,
        chatTranscript: chatMessages
          .filter(m => m.id !== 'system_1' && m.id !== 'welcome_1')
          .map(m => ({
            sender: m.sender,
            text: getTranslatedMessageText(m, selectedLang),
            timestamp: m.timestamp
          }))
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Refs for Audio Logic
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const ensureAudioContexts = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
    }
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!inputAnalyserRef.current && inputAudioContextRef.current) {
      inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
      inputAnalyserRef.current.fftSize = 64;
    }

    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    if (inputAudioContextRef.current.state === 'suspended') inputAudioContextRef.current.resume();
  };

  useEffect(() => {
    let animationFrameId: number;
    const updateVolume = () => {
      let outputVol = 0;
      let inputVol = 0;

      if (isConnected) {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          outputVol = dataArray.reduce((a, b) => a + b) / dataArray.length;
        }
        if (inputAnalyserRef.current) {
          const dataArray = new Uint8Array(inputAnalyserRef.current.frequencyBinCount);
          inputAnalyserRef.current.getByteFrequencyData(dataArray);
          inputVol = dataArray.reduce((a, b) => a + b) / dataArray.length;
        }
      }
      
      const combinedVol = Math.max(outputVol, inputVol);
      setVolume(combinedVol);
      animationFrameId = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isConnected]);

  const pauseSession = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    setVolume(0);
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_sys_pause_${Date.now()}`,
        sender: 'system',
        text: 'ℹ️ Sesión en pausa. Escribe un mensaje en el campo de texto de abajo para reanudar la sesión.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);
  };

  const resumeSession = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    lastInteractionTimeRef.current = Date.now();
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_sys_resume_${Date.now()}`,
        sender: 'system',
        text: 'ℹ️ Sesión reanudada.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);
  };

  useEffect(() => {
    if (!isConnected || isPaused) return;
    const interval = setInterval(() => {
      const inactiveMs = Date.now() - lastInteractionTimeRef.current;
      if (inactiveMs > 60000) {
        console.log("Auto-pausing session due to 60s inactivity");
        pauseSession();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected, isPaused]);

  const connectToGemini = async (initialPrompt?: string, isVoiceConnection: boolean = false, langOverride?: 'EN' | 'ES') => {
    setError(null);
    setShowReviewScreen(false);
    setRightPanelTab('chat');
    setIsPaused(false);
    isPausedRef.current = false;
    lastInteractionTimeRef.current = Date.now();
    setScores({ grammar: 0, pronunciation: 0, confidence: 0, naturalness: 0 });
    setLearnedWords([]);
    setAccentPatterns([]);
    ensureAudioContexts();
    
    if (initialPrompt && !isVoiceConnection) {
      setChatMessages([
        {
          id: `msg_${Date.now()}`,
          sender: 'user',
          text: initialPrompt,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    } else {
      setChatMessages([
        {
          id: `msg_sys_${Date.now()}`,
          sender: 'system',
          text: (langOverride || selectedLang) === 'EN' ? '🎙️ Connecting to Voyager... Please speak clearly.' : '🎙️ Conectando con Voyager... Por favor habla claro.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeMs: Date.now()
        }
      ]);
    }
    
    try {
      setStatusText("Connecting...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const activeLang = langOverride || selectedLang;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live?lang=${activeLang}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText("Connected");
        console.log("WebSocket connection to server established");
        
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg_sys_open_${Date.now()}`,
            sender: 'system',
            text: '🟢 Connected! Speaking is active with SPLASH.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeMs: Date.now()
          }
        ]);

        if (!inputAudioContextRef.current) return;
        const ctx = inputAudioContextRef.current;
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          if (isPausedRef.current) return;
          // Update activity timer when audio is streaming from mic
          lastInteractionTimeRef.current = Date.now();
          const resampled = resampleAudioBuffer(e.inputBuffer, 16000);
          const pcm16 = float32ToPcm16(resampled);
          const pcmBytes = new Uint8Array(pcm16.buffer);
          const base64Data = bytesToBase64(pcmBytes);
          ws.send(JSON.stringify({ audio: base64Data }));
        };

        source.connect(processor);
        if (inputAnalyserRef.current) {
          source.connect(inputAnalyserRef.current);
        }
        processor.connect(ctx.destination);
        
        sourceRef.current = source;
        processorRef.current = processor;
      };

      ws.onmessage = async (event) => {
        try {
          // Reset inactivity timer when server sends any message/audio/text
          lastInteractionTimeRef.current = Date.now();
          const msg = JSON.parse(event.data);
          
          if (msg.status === "connected") {
            console.log("Gemini session is active on the backend. Dispatching welcome greeting.");
            let greeting = initialPrompt || (
              selectedLang === 'ES'
                ? "Por favor preséntate en español como VOYAGER, dime que estás muy emocionado de ser mi guía en Nueva York, y pregúntame cuál es mi nombre para saber cómo dirigirte a mí (y adaptar los adjetivos en español a mi género correctamente)."
                : "Please greet me in English as VOYAGER, say you are excited to guide me in NYC, and ask for my name so you can address me properly."
            );
            if (isBilingualModeRef.current) {
              greeting += "\n\n[SYSTEM MESSAGE: You are now in BILINGUAL TRANSLATION MODE. For EVERY SINGLE response, you must first speak and write your response in Spanish, and then immediately repeat the exact same response only in English. Separate the Spanish and English sentences with a slash '/'. Your entire response must consist of the Spanish version followed directly by the English translation, both in your voice output and in your text transcription.]";
            } else if (isTranslateModeRef.current) {
              greeting += "\n\n[SYSTEM MESSAGE: You are now in INSTANT TRANSLATION MODE. You must act strictly and purely as a speech translator. Do NOT hold a conversation, do NOT give tips, do NOT make small talk, and do NOT guide the user. Your ONLY job is to immediately translate whatever you hear: if you hear Spanish, translate it to English; if you hear English, translate it to Spanish. Output ONLY the translated words and absolutely nothing else, both in your voice and in your text transcription. Keep translations instantaneous, brief, and exact.]";
            } else if (isListenOnlyRef.current) {
              greeting += "\n\n[SYSTEM MESSAGE: You are now starting in Monitor/Listen-only mode. The user is practicing by talking to a real person. You must only listen and analyze their English interaction. Do NOT speak. You can only respond via text. In your text responses, offer helpful, subtle language corrections or tips about their conversation, and if you want to speak aloud, explicitly ask the user for permission to talk (e.g. '¿Puedo hablar?').]";
            } else if (isSpanishOnlyModeRef.current) {
              greeting += "\n\n[SYSTEM MESSAGE: You are now in SPANISH ONLY MODE. You must speak and write strictly and purely in Spanish from now on. Discuss information, landmarks, and details about New York City in Spanish. Do NOT teach English, evaluate grammar, or translate any text. Speak only in Spanish.]";
            } else if (isEnglishOnlyModeRef.current) {
              greeting += "\n\n[SYSTEM MESSAGE: You are now in ENGLISH ONLY MODE. You must speak and write strictly and purely in English. Do NOT provide any Spanish translations, hints, corrections, or bilingual tips. Speak naturally as a native English speaker from New York City. This is a pure immersion practice mode for advanced students. Speak only in English.]";
            }
            
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ text: greeting }));
            }
            return;
          }
          
          if (msg.error) {
             console.error("Server reported error:", msg.error);
             setError(msg.error);
             disconnect();
             return;
          }

          if (msg.meetingBooked) {
             console.log("Meeting booked successfully. Transitioning to end chat review screen.");
             handleEndConversation();
             return;
          }

          if (msg.languageSwitch) {
            setSelectedLang(msg.languageSwitch);
          }

          if (msg.progressUpdate) {
            console.log("Received progress update from tool:", msg.progressUpdate);
            const { scores, learnedWords, accentTips, completedMissionId } = msg.progressUpdate;
            
            if (scores) {
              setScores({
                grammar: scores.grammar || 0,
                pronunciation: scores.pronunciation || 0,
                confidence: scores.confidence || 0,
                naturalness: scores.naturalness || 0
              });
            }
            
            if (learnedWords && learnedWords.length > 0) {
              setLearnedWords(prev => {
                const updated = [...prev];
                learnedWords.forEach((w: string) => {
                  if (!updated.includes(w)) updated.push(w);
                });
                return updated;
              });
            }
            
            if (accentTips) {
              setAccentPatterns(prev => {
                if (!prev.includes(accentTips)) {
                  return [...prev, accentTips];
                }
                return prev;
              });
            }
            
            if (completedMissionId) {
              setCompletedMissions(prev => {
                if (!prev.includes(completedMissionId)) {
                  return [...prev, completedMissionId];
                }
                return prev;
              });
            }
            return;
          }

          if (msg.mapAction) {
            console.log("Received mapAction:", msg.mapAction, msg.data);
            if (msg.mapAction === "show_location") {
              const { placeName, latitude, longitude, description } = msg.data;
              setMapCenter({ lat: latitude, lng: longitude });
              setMapZoom(15);
              setMarkers(prev => [
                ...prev,
                {
                  id: `marker_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  lat: latitude,
                  lng: longitude,
                  title: placeName,
                  description: description
                }
              ]);
              setRouteInfo(null);
            } else if (msg.mapAction === "draw_route") {
              const { origin, destination, travelMode, description } = msg.data;
              setRouteInfo({ origin, destination, travelMode, description });
              setMarkers([]);
            }
          }

          if (msg.userTranscription) {
             setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.sender === 'user' && last.id.startsWith('msg_voice_trans_') && (Date.now() - last.timeMs < 6000)) {
                   const updated = [...prev];
                   updated[updated.length - 1] = {
                      ...last,
                      text: last.text + msg.userTranscription,
                      timeMs: Date.now()
                   };
                   return updated;
                } else {
                   return [...prev, {
                      id: `msg_voice_trans_${Date.now()}`,
                      sender: 'user',
                      text: msg.userTranscription,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      timeMs: Date.now()
                   }];
                }
             });
          }

          if (msg.text) {
             setChatMessages(prev => {
                const last = prev[prev.length - 1];
                const formPattern = /\[SHOW[-_ ]FORM\]|\(SHOW[-_ ]FORM\)/gi;
                if (last && last.sender === 'splash' && !last.id.startsWith('welcome_') && (Date.now() - last.timeMs < 10000)) {
                   const updated = [...prev];
                   const combinedText = last.text + msg.text;
                   
                   // Parse immersion tags
                   const parsed = parseImmersionTags(combinedText);
                   updateLearningState(parsed);

                   // Handle subway map routing
                   if (/(subway\s*map|metro\s*map|network\s*grid|subway\s*grid|subway\s*system|mapa\s*de\s*metro|mapa\s*del\s*metro|red\s*de\s*metro|transit\s*map|mapa\s*de\s*tr[aá]nsito)/i.test(parsed.cleaned)) {
                      setRightPanelTab('lessons');
                      setClassroomSubTab('subway_map');
                   }

                   const hasFormTag = formPattern.test(parsed.cleaned) || last.showForm || msg.showForm;
                   const cleanedText = parsed.cleaned.replace(formPattern, "");
                   updated[updated.length - 1] = {
                      ...last,
                      text: cleanedText,
                      showForm: hasFormTag,
                      timeMs: Date.now()
                   };
                   return updated;
                } else {
                   const parsed = parseImmersionTags(msg.text);
                   updateLearningState(parsed);

                   // Handle subway map routing
                   if (/(subway\s*map|metro\s*map|network\s*grid|subway\s*grid|subway\s*system|mapa\s*de\s*metro|mapa\s*del\s*metro|red\s*de\s*metro|transit\s*map|mapa\s*de\s*tr[aá]nsito)/i.test(parsed.cleaned)) {
                      setRightPanelTab('lessons');
                      setClassroomSubTab('subway_map');
                   }

                   const hasFormTag = formPattern.test(parsed.cleaned) || msg.showForm;
                   const cleanedText = parsed.cleaned.replace(formPattern, "");
                   return [...prev, {
                      id: `msg_${Date.now()}_${Math.random()}`,
                      sender: 'splash',
                      text: cleanedText,
                      showForm: hasFormTag,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      timeMs: Date.now()
                   }];
                }
             });
          }

          if (msg.audio && audioContextRef.current && !isListenOnlyRef.current && !isPausedRef.current) {
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
              ctx.resume();
            }
            const pcmData = new Int16Array(base64ToBytes(msg.audio).buffer);
            const audioBuffer = createAudioBufferFromPCM(ctx, pcmData, 24000);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            
            if (analyserRef.current) {
              source.connect(analyserRef.current);
              analyserRef.current.connect(ctx.destination);
            } else {
               source.connect(ctx.destination);
            }

            const now = ctx.currentTime;
            const startTime = Math.max(now, nextStartTimeRef.current);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
          }
        } catch (e) {
          console.error("Error reading message:", e);
        }
      };

      ws.onclose = () => {
         console.log("WebSocket connection closed");
         disconnect();
      };

      ws.onerror = (err) => {
         console.error("WebSocket error:", err);
         setError("Server connection error");
         disconnect();
      };

    } catch (err: any) {
        console.error("Connection Failed", err);
        setError(err.message || "Error connecting or accessing microphone. Please ensure microphone permissions are granted.");
        setStatusText("Disconnected");
    }
  };

  const disconnect = () => {
    if (statusText === "Disconnected" && !wsRef.current) return;
    setIsConnected(false);
    setStatusText("Disconnected");
    setVolume(0);
    setIsPaused(false);
    isPausedRef.current = false;
    
    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_sys_close_${Date.now()}`,
        sender: 'system',
        text: '🔴 Disconnected from VOYAGER Voice Agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);
    
    if (wsRef.current) {
       const ws = wsRef.current;
       wsRef.current = null;
       ws.onopen = null;
       ws.onmessage = null;
       ws.onerror = null;
       ws.onclose = null;

       if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
         try {
           ws.close();
         } catch (e) {
           console.error("Error closing WebSocket:", e);
         }
       }
    }

    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (processorRef.current && inputAudioContextRef.current) {
        processorRef.current.disconnect();
        if (sourceRef.current) sourceRef.current.disconnect();
    }
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    if (showReviewScreen) {
      disconnect();
    }
  }, [showReviewScreen]);

  const handleLanguageChange = (lang: 'EN' | 'ES') => {
    if (selectedLang === lang) return;
    
    setSelectedLang(lang);
    
    if (isConnected || statusText === "Connecting...") {
      disconnect();
      const isEn = lang === 'EN';
      const prompt = isEn 
        ? "Hello! Let's talk in English now. Please introduce yourself in English in one short sentence, and ask how you can help."
        : "¡Hola! Hablemos en español ahora. Por favor, preséntate en español en una frase corta y pregúntame cómo puedes ayudar.";
      
      setTimeout(() => {
        connectToGemini(prompt, true, lang);
      }, 150);
    }
  };
  
  const handleSuggestionClick = (text: string) => {
      setChatMessages(prev => {
        if (prev.some(m => m.text === text && m.sender === 'user')) return prev;
        return [
          ...prev,
          {
            id: `msg_suggest_${Date.now()}`,
            sender: 'user',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timeMs: Date.now()
          }
        ];
      });

      // Automatically transition tab on subway map keywords
      if (/(subway\s*map|metro\s*map|network\s*grid|subway\s*grid|subway\s*system|mapa\s*de\s*metro|mapa\s*del\s*metro|red\s*de\s*metro|transit\s*map|mapa\s*de\s*tr[aá]nsito)/i.test(text)) {
        setRightPanelTab('lessons');
        setClassroomSubTab('subway_map');
      }

      if (!isConnected) {
          connectToGemini(text);
      } else {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
             wsRef.current.send(JSON.stringify({ text }));
          }
      }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    lastInteractionTimeRef.current = Date.now();
    if (isPausedRef.current) {
      resumeSession();
    }

    const textToSend = inputText.trim();
    setInputText("");

    setChatMessages(prev => [
      ...prev,
      {
        id: `msg_text_${Date.now()}`,
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeMs: Date.now()
      }
    ]);

    // Automatically transition subtab on subway map keywords
    if (/(subway\s*map|metro\s*map|network\s*grid|subway\s*grid|subway\s*system|mapa\s*de\s*metro|mapa\s*del\s*metro|red\s*de\s*metro|transit\s*map|mapa\s*de\s*tr[aá]nsito)/i.test(textToSend)) {
      setClassroomSubTab('subway_map');
    }

    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
       wsRef.current.send(JSON.stringify({ text: textToSend }));
    } else {
       connectToGemini(textToSend, false);
    }
  };

     return (
       <div className={`
           relative flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden p-4 md:p-8
           ${isWidgetMode ? 'w-full h-full bg-black' : 'w-full min-h-screen bg-black'}
           text-zinc-900 font-sans transition-all duration-300
       `}>
        <style dangerouslySetInnerHTML={{__html: `
            @keyframes blackNeonPulse {
                0% {
                    text-shadow:
                        0 0 4px #000000,
                        0 0 8px #000000,
                        0 0 15px rgba(0, 0, 0, 0.9),
                        0 0 30px rgba(0, 0, 0, 0.7);
                }
                50% {
                    text-shadow:
                        0 0 6px #000000,
                        0 0 12px #000000,
                        0 0 25px rgba(0, 0, 0, 0.95),
                        0 0 50px rgba(0, 0, 0, 0.95),
                        0 0 80px rgba(0, 0, 0, 0.75);
                }
                100% {
                    text-shadow:
                        0 0 4px #000000,
                        0 0 8px #000000,
                        0 0 15px rgba(0, 0, 0, 0.9),
                        0 0 30px rgba(0, 0, 0, 0.7);
                }
            }
            .animate-black-neon-glow {
                animation: blackNeonPulse 2.5s ease-in-out infinite;
            }
            .theme-light {
                background-color: #f5efe6 !important;
            }
            .theme-light .bg-black\\/45 {
                background-color: transparent !important;
                color: #18181b !important;
            }
            .theme-light .border-white\\/10 {
                border: none !important;
            }
            .theme-light .text-white {
                color: #18181b !important;
            }
            .theme-light .text-neutral-100 {
                color: #18181b !important;
            }
            .theme-light .text-neutral-200 {
                color: #27272a !important;
            }
            .theme-light .text-neutral-300 {
                color: #3f3f46 !important;
            }
            .theme-light .text-neutral-400 {
                color: #71717a !important;
            }
            .theme-light .bg-zinc-100 {
                background-color: #faf9f6 !important;
            }
            .theme-light .bg-white\\/5 {
                background-color: #faf9f6 !important;
                border: none !important;
            }
            .theme-light .bg-\\[\\#1f1f23\\]\\/60 {
                background-color: #faf9f6 !important;
                border: none !important;
            }
            .theme-light .border-white\\/5 {
                border: none !important;
            }
            .theme-light .text-yellow-400 {
                color: #ca8a04 !important;
            }
            .theme-light .bg-yellow-500\\/10 {
                background-color: rgba(202, 138, 4, 0.1) !important;
            }
            .theme-light .border-yellow-500\\/30 {
                border: none !important;
            }
            .theme-light .text-emerald-400 {
                color: #059669 !important;
            }
            .theme-light .bg-white {
                background-color: #18181b !important;
                color: #ffffff !important;
            }
            .theme-light .text-neutral-500 {
                color: #71717a !important;
            }
            .theme-light button.bg-black {
                color: #ffffff !important;
            }
            .theme-light [class*="border"] {
                border: none !important;
            }
            .tab-content-area .text-xs,
            .tab-content-area .text-\\[12px\\],
            .tab-content-area .text-sm,
            .tab-content-area .text-\\[14px\\] {
                font-size: 18.5px !important;
                line-height: 1.6 !important;
            }
            .tab-content-area .text-\\[10px\\],
            .tab-content-area .text-\\[9px\\],
            .tab-content-area .text-neutral-400 {
                font-size: 14.5px !important;
            }
            .tab-content-area .text-lg,
            .tab-content-area .text-xl,
            .tab-content-area h3 {
                font-size: 22px !important;
            }
            .tab-content-area p {
                font-size: 18.5px !important;
                line-height: 1.6 !important;
            }
            .tab-content-area .chat-message-text {
                font-family: "American Typewriter", "Courier New", Courier, Georgia, serif !important;
                font-size: 12pt !important;
            }
            .tab-content-area .chat-message-english {
                font-size: 11pt !important;
                line-height: 1.25 !important;
                font-weight: normal !important;
                letter-spacing: -0.15px !important;
            }
            .tab-content-area input.chat-input-text {
                font-family: "American Typewriter", "Courier New", Courier, Georgia, serif !important;
                font-size: 12pt !important;
                font-weight: 600 !important;
                letter-spacing: 0.05em !important;
            }
            .tab-content-area input,
            .tab-content-area textarea,
            .tab-content-area select,
            .tab-content-area button {
                font-size: 14.5px !important;
            }
            .tab-content-area label {
                font-size: 14px !important;
            }
        `}} />
        {/* Background Image & Overlay */}
        {!isWidgetMode && (
             <div className="absolute inset-0 z-0 pointer-events-none bg-black">
                 <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
             </div>
        )}

        {/* Outer Grid Layout */}
        <div className={`relative z-10 flex flex-col md:flex-row items-stretch justify-center w-full ${isWidgetMode ? 'max-w-full h-full space-y-4 md:space-y-0 md:space-x-4' : 'max-w-6xl space-y-8 md:space-y-0 md:space-x-8 animate-fade-in'}`}>
            
            {/* Left Column */}
            <div className="w-full md:w-5/12 max-w-md mx-auto md:mx-0 flex flex-col items-center justify-between space-y-6 bg-[#0a192f] backdrop-blur-2xl rounded-3xl p-6 shadow-2xl relative border border-blue-900/60">
                
                {isWidgetMode && onClose && (
                    <button onClick={onClose} className="absolute top-2 right-2 text-white/50 hover:text-white cursor-pointer">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="text-center mt-4 flex flex-col items-center w-full">
                    <h1 className="font-tech uppercase text-4xl md:text-5xl font-black tracking-wider text-white animate-black-neon-glow">
                        YO SOY VOYAGER
                    </h1>
                    <p className="text-[10px] md:text-xs text-yellow-400 font-mono tracking-widest uppercase mt-1">
                        Guía de NYC y Tutor de Inglés
                    </p>
                </div>

                <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6 py-4 animate-fade-in">
                    <style dangerouslySetInnerHTML={{__html: `
                        @keyframes orbFluid {
                            0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
                            33% { border-radius: 70% 30% 52% 48% / 60% 40% 60% 40%; }
                            66% { border-radius: 50% 50% 30% 70% / 40% 60% 30% 70%; }
                        }
                        .animate-orb-fluid {
                            animation: orbFluid 10s ease-in-out infinite;
                        }
                        @keyframes zeroGFloat {
                            0% { transform: translateY(0px) rotate(0deg) scale(1); }
                            25% { transform: translateY(-6px) rotate(0.8deg) scale(1.008); }
                            50% { transform: translateY(-12px) rotate(-0.5deg) scale(1.015); }
                            75% { transform: translateY(-6px) rotate(-1deg) scale(1.008); }
                            100% { transform: translateY(0px) rotate(0deg) scale(1); }
                        }
                        @keyframes yellowGlowPulse {
                            0%, 100% { box-shadow: 0 0 10px rgba(234, 179, 8, 0.4), 0 0 5px rgba(234, 179, 8, 0.2); }
                            50% { box-shadow: 0 0 24px rgba(234, 179, 8, 0.85), 0 0 12px rgba(234, 179, 8, 0.5); }
                        }
                        .animate-yellow-glow-pulse {
                            animation: yellowGlowPulse 2.5s ease-in-out infinite;
                        }
                    `}} />

                    <div className="relative flex items-center justify-center w-64 h-[380px]">
                        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-yellow-500/10 via-amber-500/15 to-orange-500/10 blur-3xl animate-pulse duration-[3000ms]"></div>
                        
                        <div className="relative w-full h-full flex flex-col items-center justify-center -translate-y-[70px]">
                            <canvas 
                                ref={particleCanvasRef} 
                                width={360} 
                                height={360} 
                                className="z-20 transition-transform duration-75 animate-float-zero-g"
                            />
                        </div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
                            {isConnected ? (
                                <button
                                    onClick={handleEndConversation}
                                    className="px-7 py-2.5 text-[12.5px] font-mono font-bold tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] active:scale-95 shadow-md"
                                >
                                    {translations[selectedLang].disconnectBtn}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (statusText === "Connecting...") return;
                                        const isEn = selectedLang === 'EN';
                                        const prompt = isEn 
                                            ? "Hello! Please introduce yourself in one short sentence, and ask how you can help."
                                            : "¡Hola! Por favor, preséntate en una frase corta y pregúntame cómo te puedo ayudar.";
                                        connectToGemini(prompt, true);
                                    }}
                                    disabled={statusText === "Connecting..."}
                                    className={`px-7 py-2.5 text-[12.5px] font-mono font-bold tracking-widest uppercase rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap ${
                                        statusText === "Connecting..."
                                        ? 'bg-emerald-600 text-white animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                                        : 'bg-white text-black animate-yellow-glow-pulse hover:bg-zinc-100 hover:scale-[1.02] active:scale-95'
                                    }`}
                                >
                                    {statusText === "Connecting..." ? translations[selectedLang].connecting : translations[selectedLang].connect}
                                </button>
                            )}

                            {/* Session Status Display */}
                            {isConnected && (
                                <div className="flex items-center gap-1.5 mt-0.5 animate-fade-in">
                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" />
                                    <span className="text-[10px] font-sans font-bold text-neutral-300 uppercase tracking-widest">
                                        {`Sesión (${Math.floor(secondsElapsed / 60)}:${(secondsElapsed % 60).toString().padStart(2, '0')})`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
 
                {error && (
                    <div className="w-full bg-red-950/45 border border-red-500/35 rounded-xl p-3 text-center space-y-2 animate-fade-in max-w-sm shadow-lg backdrop-blur-md mb-2">
                        <div className="flex items-center justify-center space-x-2 text-red-400 font-semibold text-xs">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{translations[selectedLang].connectionError}</span>
                        </div>
                        <p className="text-[10px] text-neutral-200 leading-relaxed font-mono bg-black/30 p-2 rounded border border-white/5">{error}</p>
                        {(error.toLowerCase().includes('api') || error.toLowerCase().includes('key') || error.toLowerCase().includes('expired') || error.toLowerCase().includes('clave') || error.toLowerCase().includes('caducada')) && (
                            <div className="text-[10px] text-neutral-300 bg-black/55 p-2 rounded-lg text-left space-y-1 border border-white/5">
                                <p className="font-semibold text-yellow-500/90">{translations[selectedLang].howToFix}</p>
                                <ol className="list-decimal pl-4 space-y-0.5 text-neutral-400">
                                    <li>{translations[selectedLang].step1}</li>
                                    <li>{translations[selectedLang].step2}</li>
                                    <li>{translations[selectedLang].step3}</li>
                                </ol>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={`w-full md:w-7/12 mx-auto md:mx-0 flex-1 flex flex-col justify-start backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl min-h-[480px] md:min-h-[580px] font-tech relative transition-all duration-500 ${showReviewScreen ? 'bg-zinc-950 text-white shadow-[0_10px_35px_rgba(0,0,0,0.3)]' : 'bg-white text-zinc-900 shadow-[0_10px_35px_rgba(0,0,0,0.08)] theme-light'}`}>
                
                {isConnected && !showReviewScreen && (
                    <div className="px-4 pt-3 pb-2 z-20">
                        <div className="grid grid-cols-3 p-1 rounded-xl w-full gap-1 transition-all bg-zinc-100">
                            <button
                                onClick={() => setRightPanelTab('chat')}
                                className={`py-1.5 px-3 text-[16px] md:text-[18px] font-sans font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                                    rightPanelTab === 'chat'
                                    ? 'bg-black text-white font-extrabold shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                                }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => {
                                    setRightPanelTab('lessons');
                                    const text = `[SISTEMA: El usuario ingresó a la pestaña Lecciones. Di exactamente esto en español con voz natural y no escribas corchetes: "Bienvenido a la sección de Lecciones, ¡aprenderás hablando e interactuando conmigo!".]`;
                                    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                        wsRef.current.send(JSON.stringify({ text }));
                                    }
                                }}
                                className={`py-1.5 px-3 text-[16px] md:text-[18px] font-sans font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                                    rightPanelTab === 'lessons'
                                    ? 'bg-black text-white font-extrabold shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                                }`}
                            >
                                Lecciones
                            </button>
                            <button
                                onClick={() => {
                                    setRightPanelTab('trips');
                                    fetchLeads();
                                }}
                                className={`py-1.5 px-3 text-[16px] md:text-[18px] font-sans font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                                    rightPanelTab === 'trips'
                                    ? 'bg-black text-white font-extrabold shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                                }`}
                            >
                                Viajes
                            </button>
                        </div>
                    </div>
                )}

                {showReviewScreen ? (
                    <div className="flex-1 flex flex-col justify-between p-6 animate-fade-in bg-zinc-950 tab-content-area">
                        <div className="text-center mb-4">
                            <span className="text-xs tracking-widest uppercase text-yellow-500 font-mono">PROGRESO</span>
                            <h3 className="text-lg text-white font-bold uppercase tracking-wider mt-1">Estadísticas de tu Interacción</h3>
                        </div>
                        
                        <div className="flex-1 flex justify-center items-center overflow-hidden">
                            <div className="w-full max-w-[95%] md:max-w-[75%] transform scale-95 md:scale-75 origin-center my-auto">
                                <ProgressDashboard 
                                    selectedLang={selectedLang}
                                    scores={scores}
                                    learnedWords={learnedWords}
                                    accentPatterns={accentPatterns}
                                    onAskVoyager={(text) => {
                                        setShowReviewScreen(false);
                                        setChatMessages([
                                          {
                                            id: 'welcome_1',
                                            sender: 'splash',
                                            text: 'Hi! I\'m VOYAGER, your NYC guide and English tutor. Click Connect to start a voice-and-text conversation.',
                                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            timeMs: Date.now()
                                          }
                                        ]);
                                        connectToGemini(text, false);
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                ) : (
                    <>
                        {rightPanelTab === 'chat' ? (
                            <div className="flex-grow flex flex-col overflow-hidden h-full">
                                {hasInteracted && (
                                    <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-start bg-zinc-50/50 flex-shrink-0 z-10">
                                        {rightPanelTab === 'lessons' ? (
                                            <div className="flex items-center gap-3.5">
                                                {/* Principiante Option */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedLevel === 'PRINCIPIANTE'}
                                                        onChange={() => setSelectedLevel('PRINCIPIANTE')}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className={`text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                                                        selectedLevel === 'PRINCIPIANTE' ? 'text-neutral-950 font-extrabold' : 'text-zinc-600 hover:text-zinc-900'
                                                    }`}>
                                                        {selectedLang === 'EN' ? 'Beginner' : 'Principiante'}
                                                    </span>
                                                </label>

                                                {/* Intermedio Option */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedLevel === 'INTERMEDIO'}
                                                        onChange={() => setSelectedLevel('INTERMEDIO')}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className={`text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                                                        selectedLevel === 'INTERMEDIO' ? 'text-neutral-950 font-extrabold' : 'text-zinc-600 hover:text-zinc-900'
                                                    }`}>
                                                        {selectedLang === 'EN' ? 'Intermediate' : 'Intermedio'}
                                                    </span>
                                                </label>

                                                {/* Avanzado Option */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedLevel === 'AVANZADO'}
                                                        onChange={() => setSelectedLevel('AVANZADO')}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className={`text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                                                        selectedLevel === 'AVANZADO' ? 'text-neutral-950 font-extrabold' : 'text-zinc-600 hover:text-zinc-900'
                                                    }`}>
                                                        {selectedLang === 'EN' ? 'Advanced' : 'Avanzado'}
                                                    </span>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 md:gap-3.5 flex-wrap">
                                                {/* Bilingual Option Toggle */}
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isBilingualMode}
                                                        onChange={(e) => {
                                                            setIsBilingualMode(e.target.checked);
                                                            if (e.target.checked) {
                                                                setIsTranslateMode(false);
                                                                setIsListenOnly(false);
                                                                setIsSpanishOnlyMode(false);
                                                                setIsEnglishOnlyMode(false);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] md:text-[11px] font-serif font-bold text-zinc-700 uppercase tracking-wider hover:text-zinc-950 transition-colors">
                                                        BILINGÜE
                                                    </span>
                                                </label>

                                                {/* Translate Option Toggle */}
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isTranslateMode}
                                                        onChange={(e) => {
                                                            setIsTranslateMode(e.target.checked);
                                                            if (e.target.checked) {
                                                                setIsBilingualMode(false);
                                                                setIsListenOnly(false);
                                                                setIsSpanishOnlyMode(false);
                                                                setIsEnglishOnlyMode(false);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] md:text-[11px] font-serif font-bold text-zinc-700 uppercase tracking-wider hover:text-zinc-950 transition-colors">
                                                        TRADUCE
                                                    </span>
                                                </label>

                                                {/* Listen Only Option Toggle */}
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isListenOnly}
                                                        onChange={(e) => {
                                                            setIsListenOnly(e.target.checked);
                                                            if (e.target.checked) {
                                                                setIsBilingualMode(false);
                                                                setIsTranslateMode(false);
                                                                setIsSpanishOnlyMode(false);
                                                                setIsEnglishOnlyMode(false);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] md:text-[11px] font-serif font-bold text-zinc-700 uppercase tracking-wider hover:text-zinc-950 transition-colors">
                                                        ESCUCHA
                                                    </span>
                                                </label>

                                                {/* Spanish Option Toggle */}
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isSpanishOnlyMode}
                                                        onChange={(e) => {
                                                            setIsSpanishOnlyMode(e.target.checked);
                                                            if (e.target.checked) {
                                                                setIsBilingualMode(false);
                                                                setIsTranslateMode(false);
                                                                setIsListenOnly(false);
                                                                setIsEnglishOnlyMode(false);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] md:text-[11px] font-serif font-bold text-zinc-700 uppercase tracking-wider hover:text-zinc-950 transition-colors">
                                                        ESPAÑOL
                                                    </span>
                                                </label>

                                                {/* English Option Toggle */}
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox"
                                                        checked={isEnglishOnlyMode}
                                                        onChange={(e) => {
                                                            setIsEnglishOnlyMode(e.target.checked);
                                                            if (e.target.checked) {
                                                                setIsBilingualMode(false);
                                                                setIsTranslateMode(false);
                                                                setIsListenOnly(false);
                                                                setIsSpanishOnlyMode(false);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 accent-yellow-500 cursor-pointer"
                                                    />
                                                    <span className="text-[10px] md:text-[11px] font-serif font-bold text-zinc-700 uppercase tracking-wider hover:text-zinc-950 transition-colors">
                                                        ENGLISH
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activeLessonDay !== null && (() => {
                                    const activeLesson = IMMERSION_CURRICULUM.find(l => l.dayNum === activeLessonDay);
                                    if (!activeLesson) return null;
                                    
                                    const lessonMissions = activeLesson.missions;
                                    const completedMissionsForThisLesson = lessonMissions.filter(m => completedMissions.includes(m.id));
                                    const isAllMissionsCompleted = lessonMissions.length > 0 && completedMissionsForThisLesson.length === lessonMissions.length;

                                    return (
                                        <div className="mx-4 mt-1.5 mb-1 py-1.5 px-0 bg-transparent rounded-2xl space-y-1.5 animate-fade-in font-sans text-left z-10 relative">
                                            {/* Header */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping flex-shrink-0"></span>
                                                    <button 
                                                        onClick={() => setIsVocabHudOpen(prev => !prev)}
                                                        className="text-[11.5px] font-sans font-black text-neutral-850 tracking-wide truncate hover:text-amber-850 hover:underline cursor-pointer border-none bg-transparent flex items-center p-0"
                                                        title={selectedLang === 'EN' ? "Toggle Lesson Details" : "Mostrar/Ocultar detalles de la lección"}
                                                    >
                                                        {activeLessonDay}. {selectedLang === 'EN' ? activeLesson.title : activeLesson.titleEs}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-[9px] font-mono font-extrabold bg-transparent border border-amber-300/60 text-amber-850 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        {completedMissionsForThisLesson.length}/{lessonMissions.length}
                                                    </span>
                                                    <button 
                                                        onClick={() => setActiveLessonDay(null)}
                                                        className="text-[9px] font-mono font-bold text-red-600 hover:text-red-700 underline border-none bg-transparent cursor-pointer"
                                                    >
                                                        {selectedLang === 'EN' ? 'End' : 'Terminar'}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Celebration Alert if completed */}
                                            {isAllMissionsCompleted && (
                                                <div className="py-1 px-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[10px] rounded-lg font-semibold flex items-center justify-between animate-bounce">
                                                    <span>🎉 {selectedLang === 'EN' ? 'All missions completed! Good job!' : '¡Todas las misiones completadas! ¡Buen trabajo!'}</span>
                                                </div>
                                            )}

                                            {/* Collapsible Content */}
                                            {isVocabHudOpen && (
                                                <div className="pt-1.5 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                                                    {/* Missions Checklist */}
                                                    <div className="space-y-1.5">
                                                        <span className="block text-[8px] font-mono font-bold tracking-wider text-amber-800 uppercase">
                                                            {selectedLang === 'EN' ? 'Missions Checklist' : 'Lista de Misiones'}
                                                        </span>
                                                        <div className="space-y-1">
                                                            {lessonMissions.map(m => {
                                                                const isCompleted = completedMissions.includes(m.id);
                                                                return (
                                                                    <label 
                                                                        key={m.id}
                                                                        className={`flex items-start gap-2 text-[10px] cursor-pointer select-none py-0.5 ${isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}
                                                                    >
                                                                        <input 
                                                                            type="checkbox"
                                                                            checked={isCompleted}
                                                                            onChange={() => handleToggleMission(m.id)}
                                                                            className="mt-0.5 accent-yellow-600 rounded w-3 h-3 cursor-pointer"
                                                                        />
                                                                        <span>{selectedLang === 'EN' ? m.en : m.es}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Vocabulary Cheat Sheet */}
                                                    <div className="space-y-1.5">
                                                        <span className="block text-[8px] font-mono font-bold tracking-wider text-amber-800 uppercase">
                                                            {selectedLang === 'EN' ? 'Vocabulary Cheat Sheet' : 'Acordeón de Vocabulario'}
                                                        </span>
                                                        <div className="space-y-1 max-h-[110px] overflow-y-auto">
                                                            {activeLesson.vocabulary.map((v, i) => (
                                                                <div 
                                                                    key={i}
                                                                    onClick={() => {
                                                                        const promptText = selectedLang === 'EN' 
                                                                            ? `Explain the vocabulary term "${v.word}" and give examples.` 
                                                                            : `Explícame el término de vocabulario "${v.word}" y dame ejemplos de uso.`;
                                                                        setInputText(promptText);
                                                                    }}
                                                                    className="p-1.5 bg-white border border-amber-200/30 hover:border-yellow-500 rounded-lg text-[9.5px] cursor-pointer hover:shadow-xs transition-all"
                                                                    title="Tap to paste query / Toca para copiar al chat"
                                                                >
                                                                    <span className="font-bold text-yellow-800 block font-mono">{v.word}</span>
                                                                    <span className="text-zinc-500 text-[8.5px] leading-tight block">
                                                        {selectedLang === 'EN' ? v.definition : v.definitionEs}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                                <div className={`flex-1 p-4 pt-2 tab-content-area overflow-y-auto ${
                                    (hasInteracted || activeLessonDay !== null)
                                    ? 'max-h-[310px] md:max-h-[390px]' 
                                    : 'h-full flex flex-col items-center justify-center'
                                }`}>
                            {!hasInteracted && activeLessonDay === null ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-center animate-fade-in">
                                    {/* Slideshow Phone Mockup Wrapper */}
                                    <div 
                                        className="relative flex flex-col items-center justify-center"
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                    >
                                        {/* Slideshow Image Container (No Shadows, Max Size) */}
                                        <div 
                                            onClick={() => setActiveFullscreenSlide(slideIndex)}
                                            className="w-[235px] md:w-[286px] h-[418px] md:h-[506px] rounded-2xl md:rounded-3xl border border-zinc-200/80 bg-neutral-950 relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                                        >
                                            {/* Active Slide Canvas (Pixelated Transition) */}
                                            <CanvasSlideshow 
                                                slides={slides} 
                                                slideIndex={slideIndex} 
                                                transitionDuration={4000} 
                                            />
                                            
                                            {/* Hover Zoom Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 z-10">
                                                <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                </svg>
                                                <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider">
                                                    Ampliar
                                                </span>
                                            </div>
                                        </div>

                                        {/* Left Navigation Arrow */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
                                            }}
                                            className="absolute left-[-35px] md:left-[-45px] top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 hover:scale-105 active:scale-95 text-black flex items-center justify-center border border-yellow-400/50 shadow-sm transition-all cursor-pointer z-10"
                                            title="Anterior"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        {/* Right Navigation Arrow */}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSlideIndex((prev) => (prev + 1) % slides.length);
                                            }}
                                            className="absolute right-[-35px] md:right-[-45px] top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-500 hover:bg-yellow-400 hover:scale-105 active:scale-95 text-black flex items-center justify-center border border-yellow-400/50 shadow-sm transition-all cursor-pointer z-10"
                                            title="Siguiente"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-full flex flex-col justify-end space-y-4">
                                {chatMessages.map((msg, index) => {
                            if (msg.sender === 'system') {
                                return null;
                            }
                            if (msg.sender === 'user' && msg.text.startsWith('[')) {
                                return null;
                            }
                            if (isConnected && msg.id === 'welcome_1') {
                                return null;
                            }

                            const isUser = msg.sender === 'user';
                            
                            let showAvatar = true;
                            if (index > 0) {
                                let prevVisibleMsg = null;
                                for (let i = index - 1; i >= 0; i--) {
                                    const m = chatMessages[i];
                                    if (m.sender !== 'system' && !(isConnected && m.id === 'welcome_1')) {
                                        prevVisibleMsg = m;
                                        break;
                                    }
                                }
                                if (prevVisibleMsg && prevVisibleMsg.sender !== 'user') {
                                    showAvatar = false;
                                }
                            }

                            return (
                                <div key={msg.id} className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 animate-fade-in`}>
                                    {!isUser && (
                                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                            {showAvatar ? (
                                                <img 
                                                    src={voyagerRobot} 
                                                    alt="Voyager Guide" 
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-contain rounded-lg" 
                                                />
                                            ) : (
                                                <div className="w-full h-full" />
                                            )}
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] flex flex-col space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md transition-all
                                            ${isUser 
                                                ? 'bg-gradient-to-br from-yellow-500/85 to-yellow-600/90 border border-yellow-400/30 backdrop-blur-md text-black rounded-tr-none font-semibold' 
                                                : 'bg-zinc-100 border border-zinc-200/60 text-zinc-800 rounded-tl-none'
                                            }
                                        `}>
                                            <p className="chat-message-text whitespace-pre-line tracking-wider leading-relaxed">
                                                {(() => {
                                                    const rawText = getTranslatedMessageText(msg, selectedLang);
                                                    if (!isUser && rawText.includes(" / ")) {
                                                        const parts = rawText.split(" / ");
                                                        if (parts.length >= 2) {
                                                            return (
                                                                <>
                                                                    {parts[0]} <span className="chat-message-english text-zinc-600 inline-block mt-0.5">{parts.slice(1).join(" / ")}</span>
                                                                </>
                                                            );
                                                        }
                                                    }
                                                    return rawText;
                                                })()}
                                            </p>
                                            
                                            {!isUser && msg.showForm && (
                                                <div className="border-t border-white/10 pt-3 mt-3 space-y-2.5">
                                                    {inlineLeadSuccess ? (
                                                        <div className="text-center py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
                                                                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                                                {selectedLang === 'EN' ? "✓ Info Captured Successfully!" : "✓ ¡Datos Guardados Exitosamente!"}
                                                             </span>
                                                        </div>
                                                    ) : inlineFormStep === 'details' ? (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-2.5">
                                                                <div>
                                                                    <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                        {selectedLang === 'EN' ? "Full Name *" : "Nombre Completo *"}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={inlineLeadForm.name}
                                                                        onChange={(e) => setInlineLeadForm({...inlineLeadForm, name: e.target.value})}
                                                                        placeholder="e.g. Jane Doe"
                                                                        className="w-full px-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px]"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                        {selectedLang === 'EN' ? "Email Address *" : "Correo Electrónico *"}
                                                                    </label>
                                                                    <input
                                                                        type="email"
                                                                        value={inlineLeadForm.email}
                                                                        onChange={(e) => setInlineLeadForm({...inlineLeadForm, email: e.target.value})}
                                                                        placeholder="e.g. jane@company.com"
                                                                        className="w-full px-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2.5">
                                                                <div>
                                                                    <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                        {selectedLang === 'EN' ? "Company" : "Empresa"}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={inlineLeadForm.company}
                                                                        onChange={(e) => setInlineLeadForm({...inlineLeadForm, company: e.target.value})}
                                                                        placeholder="e.g. Acme Corp"
                                                                        className="w-full px-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px]"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                        {selectedLang === 'EN' ? "Phone Number *" : "Número Telefónico *"}
                                                                    </label>
                                                                    <input
                                                                        type="tel"
                                                                        value={inlineLeadForm.phone}
                                                                        onChange={(e) => setInlineLeadForm({...inlineLeadForm, phone: e.target.value})}
                                                                        placeholder="e.g. +1 555-0199"
                                                                        className="w-full px-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                    Agendar Reunión
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-2.5">
                                                                    <div className="relative">
                                                                        <div
                                                                            onClick={() => setShowCalendar(!showCalendar)}
                                                                            className="w-full px-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-neutral-200 cursor-pointer focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px] flex items-center gap-2"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-500 flex-shrink-0">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                                                            </svg>
                                                                            <span className="truncate text-yellow-400 font-mono font-semibold">
                                                                                {inlineLeadForm.meetingTime 
                                                                                    ? new Date(inlineLeadForm.meetingTime).toLocaleDateString([], { dateStyle: 'medium' }) 
                                                                                    : "Seleccione Fecha"}
                                                                            </span>
                                                                        </div>

                                                                        {showCalendar && (
                                                                            <div className="absolute left-0 mt-1.5 p-3 w-[240px] bg-neutral-950 border border-white/10 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.95)] backdrop-blur-md z-50 text-white select-none">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
                                                                                            setCalendarMonth(prev);
                                                                                        }}
                                                                                        className="p-1 hover:bg-white/10 rounded-lg text-yellow-400 cursor-pointer transition-all"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                                                                        </svg>
                                                                                    </button>
                                                                                    <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-300">
                                                                                        {calendarMonth.toLocaleString([], { month: 'long', year: 'numeric' })}
                                                                                    </span>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
                                                                                            setCalendarMonth(next);
                                                                                        }}
                                                                                        className="p-1 hover:bg-white/10 rounded-lg text-yellow-400 cursor-pointer transition-all"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>

                                                                                <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[8px] font-bold text-yellow-400">
                                                                                    <span>{selectedLang === 'EN' ? "MO" : "LU"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "TU" : "MA"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "WE" : "MI"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "TH" : "JU"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "FR" : "VI"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "SA" : "SÁ"}</span>
                                                                                    <span>{selectedLang === 'EN' ? "SU" : "DO"}</span>
                                                                                </div>

                                                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                                                    {getDaysInMonth(calendarMonth).map((day, idx) => {
                                                                                        if (day === null) {
                                                                                            return <div key={`empty-${idx}`} />;
                                                                                        }
                                                                                        const isSelected = selectedCalendarDay === day;
                                                                                        return (
                                                                                            <button
                                                                                                key={`day-${day}`}
                                                                                                type="button"
                                                                                                onClick={() => setSelectedCalendarDay(day)}
                                                                                                className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer transition-all ${
                                                                                                    isSelected 
                                                                                                        ? 'bg-yellow-500 text-black shadow-[0_0_8px_rgba(234,179,8,0.6)]' 
                                                                                                        : 'hover:bg-white/10 text-neutral-300'
                                                                                                }`}
                                                                                            >
                                                                                                {day}
                                                                                            </button>
                                                                                        );
                                                                                    })}
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    disabled={selectedCalendarDay === null}
                                                                                    onClick={() => {
                                                                                        if (selectedCalendarDay !== null) {
                                                                                            const yr = calendarMonth.getFullYear();
                                                                                            const mo = String(calendarMonth.getMonth() + 1).padStart(2, '0');
                                                                                            const dy = String(selectedCalendarDay).padStart(2, '0');
                                                                                            const formatted = `${yr}-${mo}-${dy}T${selectedCalendarTime}:00Z`;
                                                                                            setInlineLeadForm({ ...inlineLeadForm, meetingTime: formatted });
                                                                                            setShowCalendar(false);
                                                                                        }
                                                                                    }}
                                                                                    className="w-full mt-3 py-1 bg-black border border-yellow-500/40 text-yellow-400 text-[9px] font-mono font-bold tracking-widest rounded-full cursor-pointer hover:bg-yellow-500 hover:text-black transition-all uppercase text-center disabled:opacity-30 disabled:pointer-events-none"
                                                                                >
                                                                                    CONFIRMAR
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="relative">
                                                                        <select
                                                                            value={selectedCalendarTime}
                                                                            onChange={(e) => {
                                                                                setSelectedCalendarTime(e.target.value);
                                                                                if (selectedCalendarDay !== null) {
                                                                                    const yr = calendarMonth.getFullYear();
                                                                                    const mo = String(calendarMonth.getMonth() + 1).padStart(2, '0');
                                                                                    const dy = String(selectedCalendarDay).padStart(2, '0');
                                                                                    const formatted = `${yr}-${mo}-${dy}T${e.target.value}:00Z`;
                                                                                    setInlineLeadForm(prev => ({ ...prev, meetingTime: formatted }));
                                                                                }
                                                                            }}
                                                                            className="w-full pl-9 pr-3 py-1.5 bg-black/35 border border-white/10 hover:border-yellow-500 rounded-xl text-xs text-yellow-400 font-mono focus:outline-none focus:border-yellow-500 focus:bg-black/55 transition-all min-h-[36px] cursor-pointer appearance-none"
                                                                        >
                                                                            <option value="09:00">09:00 AM</option>
                                                                            <option value="10:00">10:00 AM</option>
                                                                            <option value="11:00">11:00 AM</option>
                                                                            <option value="12:00">12:00 PM</option>
                                                                            <option value="13:00">01:00 PM</option>
                                                                            <option value="14:00">02:00 PM</option>
                                                                            <option value="15:00">03:00 PM</option>
                                                                            <option value="16:00">04:00 PM</option>
                                                                            <option value="17:00">05:00 PM</option>
                                                                        </select>
                                                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-yellow-500">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {inlineLeadError && (
                                                                <span className="text-[10px] text-red-500 font-bold block mt-2.5 pl-1">{inlineLeadError}</span>
                                                            )}

                                                            <div className="flex items-center gap-4 mt-2.5 pl-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!inlineLeadForm.name.trim() || !inlineLeadForm.email.trim() || !inlineLeadForm.phone.trim()) {
                                                                            setInlineLeadError(selectedLang === 'EN' ? "Name, email, and phone number are required." : "Se requiere nombre, correo y número telefónico.");
                                                                            return;
                                                                        }
                                                                        setInlineLeadError(null);
                                                                        setInlineFormStep('services');
                                                                    }}
                                                                    className="flex-shrink-0 w-auto px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 border-none text-[10px] font-mono font-bold tracking-widest rounded-full transition-all duration-300 cursor-pointer shadow-md active:scale-95 min-h-[26px] uppercase text-center inline-flex items-center justify-center text-black"
                                                                >
                                                                    SIGUIENTE
                                                                </button>
                                                                <div className="flex items-center gap-2 select-none cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="marketingConsent"
                                                                        checked={inlineLeadForm.consent}
                                                                        onChange={(e) => setInlineLeadForm({...inlineLeadForm, consent: e.target.checked})}
                                                                        className="w-4 h-4 rounded border-white/20 text-yellow-500 focus:ring-yellow-500 focus:ring-opacity-25 bg-black/30 cursor-pointer"
                                                                    />
                                                                    <label htmlFor="marketingConsent" className="text-[9px] font-bold tracking-wider text-neutral-300 cursor-pointer leading-tight">
                                                                        Enviarme la info
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-2">
                                                                <label className="block text-[9px] font-bold tracking-wider text-neutral-400 mb-1">
                                                                    Seleccione los Servicios de Interés
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[
                                                                        { id: "AI Voice Agent", labelEn: "AI Voice Agent & Call Automation", labelEs: "Agente de Voz IA" },
                                                                        { id: "CRM Integration", labelEn: "Custom CRM Integration", labelEs: "Integración CRM" },
                                                                        { id: "Marketing Roadmap", labelEn: "Local Marketing Roadmap", labelEs: "Plan de Marketing Local" },
                                                                        { id: "Marketing Automations", labelEn: "SMS & Email Automations", labelEs: "Automatizaciones SMS/Email" }
                                                                    ].map(srv => {
                                                                        const isChecked = selectedServices.includes(srv.id);
                                                                        return (
                                                                            <label key={srv.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-black/25 border border-white/10 hover:border-yellow-500/50 rounded-xl cursor-pointer transition-all select-none min-h-[36px] hover:bg-black/40">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isChecked}
                                                                                    onChange={(e) => {
                                                                                        if (e.target.checked) {
                                                                                            setSelectedServices([...selectedServices, srv.id]);
                                                                                        } else {
                                                                                            setSelectedServices(selectedServices.filter(s => s !== srv.id));
                                                                                        }
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-white/20 text-yellow-500 focus:ring-yellow-500 focus:ring-opacity-25 bg-black/30 cursor-pointer"
                                                                                />
                                                                                <span className="text-[10px] text-neutral-200 font-medium leading-tight">
                                                                                    {selectedLang === 'EN' ? srv.labelEn : srv.labelEs}
                                                                                </span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {inlineLeadError && (
                                                                <span className="text-[10px] text-red-500 font-bold block mt-1">{inlineLeadError}</span>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-2.5 mt-3 pt-2 border-t border-white/10">
                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setInlineFormStep('details')}
                                                                        className="w-full py-1 bg-transparent border border-white/20 text-neutral-300 text-[10px] font-mono font-bold tracking-widest rounded-full transition-all hover:bg-white/5 min-h-[26px] uppercase text-center inline-flex items-center justify-center cursor-pointer"
                                                                    >
                                                                        ATRÁS
                                                                    </button>
                                                                </div>
                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleInlineLeadSubmit}
                                                                        disabled={isSubmittingInlineLead}
                                                                        className="w-full px-3.5 py-1 bg-yellow-500 text-black border-none text-[10px] font-mono font-bold tracking-widest rounded-full transition-all duration-300 cursor-pointer shadow-md hover:bg-yellow-600 active:scale-95 disabled:opacity-50 min-h-[26px] uppercase text-center inline-flex items-center justify-center font-bold"
                                                                    >
                                                                        {isSubmittingInlineLead ? "ENVIANDO..." : "ENVIAR"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Timestamp removed */}
                                    </div>
                                </div>
                            );
                        })}
                                <div ref={chatEndRef} />
                            </div>
                        )}
                            </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pt-1 px-4 pb-4 max-h-[390px] md:max-h-[440px] tab-content-area">
                                {rightPanelTab === 'lessons' && activeLessonDay === null && (
                                    <Curriculum 
                                        selectedLang={selectedLang}
                                        activeDay={activeDay}
                                        onSelectDay={setActiveDay}
                                        onAskVoyager={(text) => {
                                            setRightPanelTab('chat');
                                            setInputText(text);
                                            if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                                wsRef.current.send(JSON.stringify({ text }));
                                                setChatMessages(prev => [
                                                    ...prev,
                                                    {
                                                        id: `msg_lessons_${Date.now()}`,
                                                        sender: 'user',
                                                        text,
                                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        timeMs: Date.now()
                                                    }
                                                ]);
                                            } else {
                                                setChatMessages(prev => [
                                                    ...prev,
                                                    {
                                                        id: `msg_lessons_${Date.now()}`,
                                                        sender: 'user',
                                                        text,
                                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        timeMs: Date.now()
                                                    }
                                                ]);
                                                connectToGemini(text, false);
                                            }
                                        }}
                                        completedMissions={completedMissions}
                                        onToggleMission={handleToggleMission}
                                        onStartLesson={(day, level) => {
                                            setActiveLessonDay(day);
                                            setActiveLessonLevel(level);
                                            
                                            // Get lesson title
                                            const lesson = IMMERSION_CURRICULUM.find(l => l.dayNum === day);
                                            const lessonTitle = lesson ? (selectedLang === 'EN' ? lesson.title : lesson.titleEs) : '';
                                            
                                            // Build starter text message
                                            const text = `[INICIA LECCIÓN: LECCIÓN ${day} - NIVEL ${level}] Comencemos la lección ${day}: "${lessonTitle}" en el nivel de dificultad ${level}. Por favor, preséntate, explícame la lección and sus misiones en español adaptadas a este nivel de dificultad, e inicia el juego de rol interactivo.`;
                                            
                                            setInputText("");
                                            if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                                wsRef.current.send(JSON.stringify({ text }));
                                                setChatMessages(prev => [
                                                    ...prev,
                                                    {
                                                        id: `msg_lessons_start_${Date.now()}`,
                                                        sender: 'user',
                                                        text: selectedLang === 'EN' ? `Starting Lesson ${day} (${level === 'PRINCIPIANTE' ? 'Beginner' : level === 'INTERMEDIO' ? 'Intermediate' : 'Advanced'}) Interactive Practice...` : `Iniciando Lección ${day} (${level === 'PRINCIPIANTE' ? 'Principiante' : level === 'INTERMEDIO' ? 'Intermedio' : 'Avanzado'}) de Práctica Interactiva...`,
                                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        timeMs: Date.now()
                                                    }
                                                ]);
                                            } else {
                                                setChatMessages(prev => [
                                                    ...prev,
                                                    {
                                                        id: `msg_lessons_start_${Date.now()}`,
                                                        sender: 'user',
                                                        text: selectedLang === 'EN' ? `Starting Lesson ${day} (${level === 'PRINCIPIANTE' ? 'Beginner' : level === 'INTERMEDIO' ? 'Intermediate' : 'Advanced'}) Interactive Practice...` : `Iniciando Lección ${day} (${level === 'PRINCIPIANTE' ? 'Principiante' : level === 'INTERMEDIO' ? 'Intermedio' : 'Avanzado'}) de Práctica Interactiva...`,
                                                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        timeMs: Date.now()
                                                    }
                                                ]);
                                                connectToGemini(text, false);
                                            }
                                        }}
                                        selectedLevel={selectedLevel}
                                        setSelectedLevel={setSelectedLevel}
                                    />
                                )}
                                {rightPanelTab === 'lessons' && activeLessonDay !== null && (
                                    <LessonGuide 
                                        dayNum={activeLessonDay}
                                        selectedLang={selectedLang}
                                        activeLevel={activeLessonLevel || 'PRINCIPIANTE'}
                                        onEndLesson={() => setActiveLessonDay(null)}
                                        completedMissions={completedMissions}
                                        onToggleMission={handleToggleMission}
                                    />
                                )}
                                {rightPanelTab === 'trips' && viajesSubTab === 'planner' && (
                                    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl p-4 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60 text-left space-y-4">
                                        {/* Speech Bubble Header */}
                                        <div className="flex items-start gap-3 bg-[#FAF6EE] border border-zinc-200/80 p-3 rounded-2xl shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center flex-shrink-0">
                                                <Compass className="w-4 h-4 text-yellow-600 animate-spin-slow" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">VOYAGER TRAVEL PLANNER</span>
                                                <p className="text-xs text-neutral-800 leading-normal font-semibold">
                                                    {selectedLang === 'EN' 
                                                        ? 'Where do you want to go today? Enter a NYC spot or select a preset below to plan your trip (Subway, Taxi, or Walk).' 
                                                        : '¿A dónde quieres ir hoy? Ingresa un punto de NYC o selecciona un atajo para planificar tu viaje (Metro, Taxi o a pie).'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Search Input Box */}
                                        <form onSubmit={handleCustomDestinationSubmit} className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={customDestinationText}
                                                onChange={(e) => setCustomDestinationText(e.target.value)}
                                                placeholder={selectedLang === 'EN' ? 'Enter destination... (e.g. Central Park)' : 'Ingresa destino... (ej. Central Park)'}
                                                className="flex-1 px-4 py-2 text-xs border border-zinc-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                            />
                                            <button 
                                                type="submit"
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black border-none text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                                            >
                                                {selectedLang === 'EN' ? 'PLAN' : 'IR'}
                                            </button>
                                        </form>

                                        {/* Presets Grid */}
                                        <div className="space-y-1.5">
                                            <span className="block text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                                                📍 {selectedLang === 'EN' ? 'QUICK PRESETS:' : 'PUNTOS CLAVE:'}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {TRAVEL_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => handleSelectPresetDestination(preset)}
                                                        className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-all cursor-pointer ${
                                                            selectedTripDestination?.name === preset.name
                                                                ? 'bg-yellow-500 text-black border-yellow-600 shadow-sm font-bold'
                                                                : 'bg-[#FAF6EE] border-zinc-200/80 hover:border-zinc-300 text-neutral-700'
                                                        }`}
                                                    >
                                                        {selectedLang === 'EN' ? preset.nameEn : preset.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Active Plan Details Card */}
                                        {selectedTripDestination ? (
                                            <div className="bg-[#FAF6EE] border border-zinc-200/80 rounded-2xl p-4 space-y-4 shadow-sm animate-fade-in">
                                                <div className="flex justify-between items-center border-b border-zinc-300/30 pb-2">
                                                    <div>
                                                        <span className="text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">ROUTE & DIRECTIONS</span>
                                                        <h3 className="text-sm font-extrabold text-neutral-950 font-sans mt-0.5">
                                                            {selectedLang === 'EN' ? selectedTripDestination.nameEn : selectedTripDestination.name}
                                                        </h3>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTripDestination(null);
                                                            setMarkers([]);
                                                        }}
                                                        className="text-[9px] font-mono font-bold text-neutral-400 hover:text-red-500 cursor-pointer underline uppercase"
                                                    >
                                                        {selectedLang === 'EN' ? 'Clear' : 'Limpiar'}
                                                    </button>
                                                </div>

                                                {/* Transit Options Grid */}
                                                <div className="grid grid-cols-1 gap-3">
                                                    
                                                    {/* Subway (Metro) Option */}
                                                    <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-base">🚇</span>
                                                                <span className="text-xs font-extrabold text-neutral-900">{selectedLang === 'EN' ? 'Subway Route' : 'Ruta de Metro'}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => setViajesSubTab('subway')}
                                                                className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300/50 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer"
                                                            >
                                                                {selectedLang === 'EN' ? 'View Subway Map' : 'Ver Mapa de Metro'}
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-neutral-700 leading-normal">
                                                            {selectedLang === 'EN' ? selectedTripDestination.subwayDirectionsEn : selectedTripDestination.subwayDirections}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {selectedTripDestination.subwayLines.map(line => (
                                                                <span 
                                                                    key={line}
                                                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                                                                        line === '1' || line === '2' || line === '3' ? 'bg-red-600' :
                                                                        line === '4' || line === '5' || line === '6' ? 'bg-emerald-600' :
                                                                        line === '7' ? 'bg-purple-600' :
                                                                        line === 'A' || line === 'C' || line === 'E' ? 'bg-blue-600' :
                                                                        line === 'B' || line === 'D' || line === 'F' || line === 'M' ? 'bg-orange-500' :
                                                                        line === 'N' || line === 'Q' || line === 'R' || line === 'W' ? 'bg-yellow-400 text-black' :
                                                                        'bg-neutral-500'
                                                                    }`}
                                                                >
                                                                    {line}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Taxi Option */}
                                                    <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-base">🚕</span>
                                                                <span className="text-xs font-extrabold text-neutral-900">{selectedLang === 'EN' ? 'Yellow Cab (Taxi)' : 'Taxi de NYC'}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white/70 px-2 py-0.5 rounded-full border border-zinc-300/20">
                                                                {selectedTripDestination.taxiTime} • est. {selectedTripDestination.taxiFare}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white border border-zinc-200/50 p-2.5 rounded-lg flex items-center justify-between gap-2 group cursor-pointer"
                                                             onClick={() => speakTravelPhrase(`Can you take me to ${selectedTripDestination.nameEn}, please?`, 'en-US')}
                                                        >
                                                            <div className="text-left min-w-0">
                                                                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                                                    {selectedLang === 'EN' ? 'USEFUL PHRASE (TAP TO HEAR)' : 'FRASE ÚTIL (TOCA PARA ESCUCHAR)'}
                                                                </span>
                                                                <span className="text-[11px] text-yellow-800 font-bold block truncate mt-0.5">"Can you take me to {selectedTripDestination.nameEn}, please?"</span>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none group-hover:text-zinc-600">
                                                                {selectedLang === 'EN' ? '🗣️ SPEAK' : '🗣️ ESCUCHAR'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Walking Option */}
                                                    <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-base">🚶</span>
                                                                <span className="text-xs font-extrabold text-neutral-900">{selectedLang === 'EN' ? 'Walking (On Foot)' : 'A Pie (Caminando)'}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white/70 px-2 py-0.5 rounded-full border border-zinc-300/20">
                                                                {selectedTripDestination.walkTime} • {selectedTripDestination.walkDist}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white border border-zinc-200/50 p-2.5 rounded-lg flex items-center justify-between gap-2 group cursor-pointer"
                                                             onClick={() => speakTravelPhrase(`How do I walk to ${selectedTripDestination.nameEn}?`, 'en-US')}
                                                        >
                                                            <div className="text-left min-w-0">
                                                                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                                                    {selectedLang === 'EN' ? 'USEFUL PHRASE (TAP TO HEAR)' : 'FRASE ÚTIL (TOCA PARA ESCUCHAR)'}
                                                                </span>
                                                                <span className="text-[11px] text-yellow-800 font-bold block truncate mt-0.5">"How do I walk to {selectedTripDestination.nameEn}?"</span>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none group-hover:text-zinc-600">
                                                                {selectedLang === 'EN' ? '🗣️ SPEAK' : '🗣️ ESCUCHAR'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bicycle Option */}
                                                    <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-base">🚲</span>
                                                                <span className="text-xs font-extrabold text-neutral-900">{selectedLang === 'EN' ? 'Citi Bike (Bicycle)' : 'En Bicicleta (Citi Bike)'}</span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold text-neutral-600 bg-white/70 px-2 py-0.5 rounded-full border border-zinc-300/20">
                                                                {selectedTripDestination.bikeTime} • {selectedTripDestination.walkDist}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white border border-zinc-200/50 p-2.5 rounded-lg flex items-center justify-between gap-2 group cursor-pointer"
                                                             onClick={() => speakTravelPhrase(`Where is the nearest Citi Bike station?`, 'en-US')}
                                                        >
                                                            <div className="text-left min-w-0">
                                                                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                                                    {selectedLang === 'EN' ? 'USEFUL PHRASE (TAP TO HEAR)' : 'FRASE ÚTIL (TOCA PARA ESCUCHAR)'}
                                                                </span>
                                                                <span className="text-[11px] text-yellow-800 font-bold block truncate mt-0.5">"Where is the nearest Citi Bike station?"</span>
                                                            </div>
                                                            <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none group-hover:text-zinc-600">
                                                                {selectedLang === 'EN' ? '🗣️ SPEAK' : '🗣️ ESCUCHAR'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Google Maps / Live Map Option */}
                                                    <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 flex justify-between items-center">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-base">🗺️</span>
                                                            <span className="text-xs font-extrabold text-neutral-900">{selectedLang === 'EN' ? 'Interactive Google Maps' : 'Google Maps Interactivo'}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => setViajesSubTab('google_map')}
                                                            className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-300/50 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer shadow-sm"
                                                        >
                                                            {selectedLang === 'EN' ? 'View Google Maps' : 'Ver Google Maps'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Navigation Vocabulary Section */}
                                                <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                    <span className="block text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                                                        {selectedLang === 'EN' ? 'NAVIGATION VOCABULARY:' : 'VOCABULARIO DE NAVEGACIÓN:'}
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {selectedTripDestination.vocab.map((v, idx) => (
                                                            <span 
                                                                key={idx}
                                                                className="bg-white border border-zinc-200 text-neutral-700 text-[10px] font-medium px-2 py-0.5 rounded shadow-sm"
                                                            >
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Navigation Complete Phrases Section */}
                                                <div className="bg-[#f0eada] border border-zinc-300/30 rounded-xl p-3 space-y-2 text-left">
                                                    <span className="block text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                                                        🗣️ {selectedLang === 'EN' ? 'USEFUL TRAVEL PHRASES (TAP TO HEAR):' : 'FRASES ÚTILES DE VIAJE (TOCA PARA ESCUCHAR):'}
                                                    </span>
                                                    <div className="space-y-2 pt-1">
                                                        {selectedTripDestination.phrases.map((phrase, idx) => (
                                                            <div 
                                                                key={idx}
                                                                onClick={() => speakTravelPhrase(phrase.en, 'en-US')}
                                                                className="bg-white border border-zinc-200/50 p-2.5 rounded-lg flex items-center justify-between gap-2 group cursor-pointer hover:border-yellow-500/40 hover:shadow-sm transition-all"
                                                            >
                                                                <div className="text-left min-w-0">
                                                                    <span className="text-[11px] text-yellow-800 font-bold block leading-normal">{phrase.en}</span>
                                                                    <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">{phrase.es}</span>
                                                                </div>
                                                                <span className="text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none group-hover:text-zinc-600">
                                                                    {selectedLang === 'EN' ? '🗣️ SPEAK' : '🗣️ ESCUCHAR'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Ask Voyager Actions */}
                                                <button
                                                    onClick={() => {
                                                        const q = selectedLang === 'EN'
                                                            ? `Voyager, how do I get to ${selectedTripDestination.nameEn}? Please suggest the best way and teach me related vocabulary.`
                                                            : `Voyager, ¿cómo llego a ${selectedTripDestination.name}? Por favor sugiéreme la mejor forma de ir y enséñame vocabulario relacionado.`;
                                                        setRightPanelTab('chat');
                                                        setInputText(q);
                                                        if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                                            wsRef.current.send(JSON.stringify({ text: q }));
                                                            setChatMessages(prev => [
                                                                ...prev,
                                                                {
                                                                    id: `msg_trip_query_${Date.now()}`,
                                                                    sender: 'user',
                                                                    text: q,
                                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                                    timeMs: Date.now()
                                                                }
                                                            ]);
                                                        } else {
                                                            setChatMessages(prev => [
                                                                ...prev,
                                                                {
                                                                    id: `msg_trip_query_${Date.now()}`,
                                                                    sender: 'user',
                                                                    text: q,
                                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                                    timeMs: Date.now()
                                                                }
                                                            ]);
                                                            connectToGemini(q, false);
                                                        }
                                                    }}
                                                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black border-none text-xs font-mono font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                                                >
                                                    <span>{selectedLang === 'EN' ? 'Consult Voyager in Chat' : 'Consultar a Voyager en el Chat'}</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : null}

                                        {/* Saved Spots (Legacy List) */}
                                        <div className="space-y-3 pt-2 border-t border-zinc-300/40">
                                            <span className="block text-[8px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                                                📁 {selectedLang === 'EN' ? 'SAVED LUGARES:' : 'LUGARES GUARDADOS:'}
                                            </span>
                                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[160px] md:max-h-[220px]">
                                                {serverLeads.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-full space-y-2 text-center py-6">
                                                        <span className="text-3xl text-neutral-400">📁</span>
                                                        <p className="text-sm text-neutral-600 font-bold">{translations[selectedLang].noLeads}</p>
                                                        <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">{translations[selectedLang].fillFormTest}</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {serverLeads.map((lead) => (
                                                            <div key={lead.id} className="bg-[#FAF6EE] border border-zinc-200/80 shadow-sm rounded-2xl p-4 space-y-2 text-xs">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <p className="font-extrabold text-neutral-900 text-sm leading-tight">{lead.name}</p>
                                                                        <p className="text-neutral-500 font-mono mt-0.5">{lead.email}</p>
                                                                    </div>
                                                                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-zinc-200/40 px-2 py-0.5 rounded-full">
                                                                        {new Date(lead.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 border-t border-zinc-300/20 pt-2 text-[11px] text-neutral-600">
                                                                    {lead.company && <p>🏢 <strong className="text-neutral-500">{selectedLang === 'EN' ? 'Company' : 'Empresa'}:</strong> {lead.company}</p>}
                                                                    {lead.phone && <p>📞 <strong className="text-neutral-500">{selectedLang === 'EN' ? 'Phone' : 'Teléfono'}:</strong> {lead.phone}</p>}
                                                                </div>
                                                                {lead.notes && (
                                                                    <div className="bg-[#f0eada] p-2.5 rounded-xl border border-zinc-300/30 text-neutral-700 text-[11px] whitespace-pre-wrap leading-relaxed">
                                                                        <strong className="text-neutral-500">{selectedLang === 'EN' ? 'Requirements' : 'Requisitos'}:</strong> {lead.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {rightPanelTab === 'trips' && viajesSubTab === 'subway' && (
                                    <div className="w-full h-full flex flex-col space-y-3">
                                        <button 
                                            onClick={() => setViajesSubTab('planner')}
                                            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer self-start transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            {selectedLang === 'EN' ? 'Back to Planner' : 'Volver a Planificación'}
                                        </button>
                                        <div className="flex-1 min-h-[350px]">
                                            <NycSubwayMap 
                                                selectedLang={selectedLang}
                                                onAskVoyager={(text) => {
                                                    setRightPanelTab('chat');
                                                    setInputText(text);
                                                    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                                        wsRef.current.send(JSON.stringify({ text }));
                                                        setChatMessages(prev => [
                                                            ...prev,
                                                            {
                                                                id: `msg_subway_${Date.now()}`,
                                                                sender: 'user',
                                                                text,
                                                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                                timeMs: Date.now()
                                                            }
                                                        ]);
                                                    } else {
                                                        setChatMessages(prev => [
                                                            ...prev,
                                                            {
                                                                id: `msg_subway_${Date.now()}`,
                                                                sender: 'user',
                                                                text,
                                                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                                timeMs: Date.now()
                                                            }
                                                        ]);
                                                        connectToGemini(text, false);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {rightPanelTab === 'trips' && viajesSubTab === 'google_map' && (
                                    <div className="w-full h-full flex flex-col space-y-3">
                                        <button 
                                            onClick={() => setViajesSubTab('planner')}
                                            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer self-start transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            {selectedLang === 'EN' ? 'Back to Planner' : 'Volver a Planificación'}
                                        </button>
                                        <div className="h-[300px] md:h-[350px] w-full rounded-2xl overflow-hidden border border-zinc-300/60 shadow-md">
                                            <NycMap 
                                                center={mapCenter}
                                                zoom={mapZoom}
                                                markers={markers}
                                                routeInfo={routeInfo}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    {!showReviewScreen && (rightPanelTab === 'chat' || (rightPanelTab === 'lessons' && activeLessonDay !== null)) && hasInteracted && (
                        <div className="px-4 pb-4 bg-transparent flex items-start gap-2.5 w-full">
                            <div className="w-10 flex-shrink-0 bg-transparent" />
                            <form onSubmit={handleSendMessage} className="flex-1 max-w-[78%] relative rounded-3xl transition-all bg-[#fcd34d]">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={placeholderText}
                                    className="w-full pl-5 pr-12 py-2.5 focus:outline-none transition-all min-h-[44px] border-none rounded-3xl bg-[#fcd34d] text-[#854d0e] placeholder:text-[#854d0e]/60 font-serif text-[15px] chat-input-text"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-transparent border-none outline-none text-[#854d0e] hover:text-[#583106] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                                >
                                    <svg className="w-4.5 h-4.5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
        </div>

        {activeFullscreenSlide !== null && (
            <div 
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-4 md:p-6"
                onClick={() => setActiveFullscreenSlide(null)}
            >
                {/* Close button */}
                <button 
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-yellow-500 hover:text-black border border-white/10 flex items-center justify-center text-white cursor-pointer z-50 transition-all hover:scale-105"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveFullscreenSlide(null);
                    }}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Navigation inside modal */}
                <button 
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-yellow-500 hover:text-black border border-white/10 flex items-center justify-center text-white cursor-pointer z-50 transition-all hover:scale-105"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveFullscreenSlide((prev) => prev !== null ? (prev - 1 + slides.length) % slides.length : null);
                    }}
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button 
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-yellow-500 hover:text-black border border-white/10 flex items-center justify-center text-white cursor-pointer z-50 transition-all hover:scale-105"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveFullscreenSlide((prev) => prev !== null ? (prev + 1) % slides.length : null);
                    }}
                >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Image container */}
                <div 
                    className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={slides[activeFullscreenSlide].src} 
                        alt={slides[activeFullscreenSlide].alt}
                        className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                    />
                </div>

                {/* Fullscreen dots */}
                <div className="flex gap-2 mt-6 z-50">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveFullscreenSlide(idx);
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeFullscreenSlide ? 'bg-yellow-500 scale-125' : 'bg-neutral-500/50 hover:bg-neutral-400'}`}
                        />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default LiveAgent;
