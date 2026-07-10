import React from 'react';
import { 
  Coffee, 
  Train, 
  Camera, 
  Sparkles 
} from 'lucide-react';

interface MissionsProps {
  selectedLang: 'EN' | 'ES';
  activeDay: number;
  onSelectDay: (day: number) => void;
  onAskVoyager: (text: string) => void;
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
    vocab: ["Sunny-side up", "To go", "Refill", "Pastrami on rye", "Drizzle"]
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
    vocab: ["MetroCard", "Uptown / Downtown", "Transfer", "Platform", "Express train"]
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
    vocab: ["Take a photo", "Horizontal / Landscape", "Frame", "Backlight", "Press the button"]
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
    vocab: ["Matinee", "Orchestra seats", "Mezzanine", "Sold out", "Standing room only"]
  }
];

export const Missions: React.FC<MissionsProps> = ({
  selectedLang,
  activeDay,
  onSelectDay,
  onAskVoyager
}) => {
  
  const handleStartLesson = (card: CardData) => {
    onSelectDay(card.dayNum);
    
    const prompt = selectedLang === 'EN'
      ? `I want to practice Day ${card.dayNum} lesson: "${card.titleEn}". Let's start the immersion!`
      : `Quiero practicar la lección del Día ${card.dayNum}: "${card.title}". ¡Comencemos la práctica!`;
      
    onAskVoyager(prompt);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#f2ede4] rounded-3xl p-4 font-sans text-neutral-900 overflow-y-auto max-h-[500px] md:max-h-[600px] shadow-inner border border-zinc-200/60">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        {CARDS.map((card) => {
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
                {/* Header Row */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${card.tagColor}`}>
                    {selectedLang === 'EN' ? card.tagEn : card.tag}
                  </span>
                  
                  {/* Circle Icon Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    card.icon === 'coffee' ? 'bg-yellow-50 text-amber-600' :
                    card.icon === 'subway' ? 'bg-sky-50 text-sky-600' :
                    card.icon === 'camera' ? 'bg-rose-50 text-rose-500' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {card.icon === 'coffee' && <Coffee className="w-4 h-4" />}
                    {card.icon === 'subway' && <Train className="w-4 h-4" />}
                    {card.icon === 'camera' && <Camera className="w-4 h-4" />}
                    {card.icon === 'sparkles' && <Sparkles className="w-4 h-4" />}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-neutral-900 font-extrabold text-base md:text-lg tracking-tight mb-2 leading-tight">
                  {selectedLang === 'EN' ? card.titleEn : card.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-500 text-xs md:text-sm leading-relaxed mb-4">
                  {selectedLang === 'EN' ? card.descriptionEn : card.description}
                </p>

                {/* Vocab Box */}
                <div className="bg-[#f0eada] border border-zinc-300/40 rounded-2xl p-3 mb-5">
                  <span className="block text-[9px] font-mono font-bold text-neutral-400 tracking-wider mb-2">
                    {selectedLang === 'EN' ? 'KEY VOCABULARY:' : 'VOCABULARIO CLAVE:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {card.vocab.map((v, i) => (
                      <span 
                        key={i}
                        className="bg-[#ffffff] border border-zinc-200/80 text-zinc-700 text-[10px] font-medium px-2.5 py-0.5 rounded shadow-sm hover:border-zinc-300 transition-colors"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleStartLesson(card)}
                className="w-full py-3 bg-[#030712] hover:bg-[#111827] text-white text-xs font-mono font-extrabold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md active:scale-98 cursor-pointer"
              >
                {selectedLang === 'EN' ? 'START LESSON' : 'COMENZAR LECCIÓN'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
