import React from 'react';

interface LessonGuideProps {
  dayNum: number;
  selectedLang: 'EN' | 'ES';
  activeLevel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  onEndLesson: () => void;
  completedMissions: string[];
  onToggleMission: (id: string) => void;
}

export const LessonGuide: React.FC<LessonGuideProps> = ({
  dayNum,
  selectedLang,
  activeLevel,
  onEndLesson,
  completedMissions,
  onToggleMission
}) => {
  // Helper to check if mission is done
  const isMissionDone = (id: string) => completedMissions.includes(id);

  if (dayNum === 1) {
    return (
      <div className="w-full flex flex-col font-sans text-neutral-900 space-y-5 text-left pb-6">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
          <div>
            <h2 className="text-sm font-black text-amber-850 uppercase tracking-wide">
              {selectedLang === 'EN' ? 'Lesson 1: Ordering Coffee Like a New Yorker' : 'Lección 1: Ordenando café como un neoyorquino'}
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Level: {activeLevel} • Location: Manhattan Coffee Shop
            </p>
          </div>
          <button 
            onClick={onEndLesson}
            className="text-[10px] font-mono font-bold text-red-600 hover:text-red-700 underline border-none bg-transparent cursor-pointer"
          >
            {selectedLang === 'EN' ? 'End Lesson' : 'Terminar'}
          </button>
        </div>

        {/* AI Instructor Introduction */}
        <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
          <span className="block text-[8px] font-mono font-black tracking-wider text-yellow-800 uppercase">
            {selectedLang === 'EN' ? 'Instructor Intro' : 'Introducción del Instructor'}
          </span>
          <div className="text-[11.5px] leading-relaxed text-zinc-800 space-y-1.5">
            <p className="font-semibold italic">"Hello! Today we're visiting a coffee shop in Manhattan."</p>
            <p className="italic">"You'll practice ordering coffee just like a local. Don't worry about making mistakes."</p>
            <p className="italic">"I'll speak slowly, and after every sentence I'll give you time to repeat. Ready?"</p>
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Objectives' : 'Objetivos'}
          </h3>
          <ul className="list-disc pl-4 text-[11px] leading-relaxed text-zinc-700 space-y-1">
            <li>Greet a barista naturally.</li>
            <li>Order coffee confidently.</li>
            <li>Understand common questions (milk options, sizes).</li>
            <li>Pay and end the conversation politely.</li>
          </ul>
        </div>

        {/* Missions Checklist */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Missions Checklist' : 'Lista de Misiones'}
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'day1_coffee', text: "Order coffee using 'I'd like a...'" },
              { id: 'day1_togo', text: "Answer the barista: 'For here or to go?'" },
              { id: 'day1_pastry', text: "Order a croissant or muffin using 'to go with it'" },
              { id: 'day1_wifi', text: "Ask 'Excuse me, what is the Wi-Fi password?'" },
              { id: 'day1_napkins', text: "Ask counter staff: 'Could I get some napkins, please?'" },
              { id: 'day1_restroom', text: "Ask 'Excuse me, where's the restroom?'" },
              { id: 'day1_directions', text: "Ask for directions to the subway line" }
            ].map(m => (
              <label 
                key={m.id} 
                className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  isMissionDone(m.id) 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-400 line-through' 
                    : 'bg-zinc-50 border-zinc-200/60 text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={isMissionDone(m.id)}
                  onChange={() => onToggleMission(m.id)}
                  className="mt-0.5 accent-emerald-600 rounded cursor-pointer w-3.5 h-3.5"
                />
                <span className="font-semibold">{m.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vocabulary Table */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Essential Vocabulary' : 'Vocabulario Esencial'}
          </h3>
          <div className="border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200">
                  <th className="p-2.5 font-bold text-zinc-700 w-1/2">English</th>
                  <th className="p-2.5 font-bold text-zinc-700 w-1/2">Español</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { en: "Coffee", es: "Café" },
                  { en: "Latte / Cappuccino", es: "Latte / Capuchino" },
                  { en: "Small / Medium / Large", es: "Pequeño / Mediano / Grande" },
                  { en: "Hot / Iced", es: "Caliente / Frío" },
                  { en: "Whole milk / Oat milk", es: "Leche entera / Leche de avena" },
                  { en: "Almond milk / Cream", es: "Leche de almendra / Crema" },
                  { en: "Sugar / Napkins", es: "Azúcar / Servilletas" },
                  { en: "Receipt / Wi-Fi password", es: "Recibo / Contraseña del Wi-Fi" },
                  { en: "To go / For here", es: "Para llevar / Para comer aquí" }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="p-2.5 font-mono text-amber-850 font-bold">{item.en}</td>
                    <td className="p-2.5 text-zinc-600">{item.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Useful Expressions */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Useful Expressions' : 'Expresiones Útiles'}
          </h3>
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 space-y-2 text-[11px]">
            {[
              "Good morning!",
              "Hi! I'd like a coffee, please.",
              "Can I have a medium latte?",
              "For here or to go? — To go, please.",
              "Anything else? — That's all, thank you.",
              "How much is it?",
              "Can I pay with a credit card?",
              "Thank you! Have a great day!"
            ].map((exp, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="font-mono text-amber-600 font-bold">•</span>
                <span className="font-semibold text-zinc-800">{exp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Conversation Scenarios */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Dialogue Cheat Sheet' : 'Guión de Práctica'}
          </h3>
          <div className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-3 space-y-2 text-[11px] leading-relaxed">
            <p className="font-bold text-amber-900 border-b border-amber-200/60 pb-1 mb-1">Standard Cafe Dialogue</p>
            <div className="space-y-2">
              <div>
                <span className="text-yellow-800 font-bold block font-mono">Barista:</span>
                <span className="italic">"Hello! What can I get for you today?"</span>
              </div>
              <div>
                <span className="text-zinc-500 font-bold block font-mono">Student:</span>
                <span className="font-semibold">"Hi! I'd like a medium latte, please."</span>
              </div>
              <div>
                <span className="text-yellow-800 font-bold block font-mono">Barista:</span>
                <span className="italic">"Would you like it hot or iced?"</span>
              </div>
              <div>
                <span className="text-zinc-500 font-bold block font-mono">Student:</span>
                <span className="font-semibold">"Iced, with oat milk please."</span>
              </div>
              <div>
                <span className="text-yellow-800 font-bold block font-mono">Barista:</span>
                <span className="italic">"For here or to go?"</span>
              </div>
              <div>
                <span className="text-zinc-500 font-bold block font-mono">Student:</span>
                <span className="font-semibold">"To go. And could I get some napkins?"</span>
              </div>
              <div>
                <span className="text-yellow-800 font-bold block font-mono">Barista:</span>
                <span className="italic">"Sure, here is your receipt. Have a great day!"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listening Challenge */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Listening Practice' : 'Desafío Auditivo'}
          </h3>
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 text-[11px] space-y-2">
            <p className="font-semibold text-zinc-700">Listen to Voyager's statement:</p>
            <p className="italic font-mono bg-zinc-200/30 p-2 rounded border border-zinc-200 text-amber-950 font-bold">
              "I would like a large iced vanilla latte with oat milk."
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-semibold text-[10px] text-zinc-600">
              <div className="p-1.5 bg-white border border-zinc-100 rounded">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase">Size</span>
                Large
              </div>
              <div className="p-1.5 bg-white border border-zinc-100 rounded">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase">Temp</span>
                Iced
              </div>
              <div className="p-1.5 bg-white border border-zinc-100 rounded">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase">Milk</span>
                Oat milk
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Tip */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1.5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            🗽 Cultural Tip
          </h4>
          <p className="text-[10.5px] leading-relaxed text-zinc-700 font-medium">
            In Manhattan, coffee shops are fast-paced. Baristas will always ask: <strong>"For here or to go?"</strong>, <strong>"What kind of milk?"</strong>, and <strong>"Do you want room for cream?"</strong>. Answering quickly and politely keeps the line moving!
          </p>
        </div>
      </div>
    );
  }

  if (dayNum === 2) {
    return (
      <div className="w-full flex flex-col font-sans text-neutral-900 space-y-5 text-left pb-6">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
          <div>
            <h2 className="text-sm font-black text-amber-850 uppercase tracking-wide">
              {selectedLang === 'EN' ? 'Lesson 2: Navigating the Manhattan Subway' : 'Lección 2: Navegando por el metro de Manhattan'}
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Level: Beginner to Intermediate • Location: Manhattan Subway Station
            </p>
          </div>
          <button 
            onClick={onEndLesson}
            className="text-[10px] font-mono font-bold text-red-600 hover:text-red-700 underline border-none bg-transparent cursor-pointer"
          >
            {selectedLang === 'EN' ? 'End Lesson' : 'Terminar'}
          </button>
        </div>

        {/* AI Instructor Introduction */}
        <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
          <span className="block text-[8px] font-mono font-black tracking-wider text-yellow-800 uppercase">
            {selectedLang === 'EN' ? 'Instructor Intro' : 'Introducción del Instructor'}
          </span>
          <div className="text-[11.5px] leading-relaxed text-zinc-800 space-y-1.5">
            <p className="font-semibold italic">"Hello! Today we're going to ride the New York City Subway."</p>
            <p className="italic">"Don't worry if it looks confusing. I'll guide you step by step, just like a local friend."</p>
            <p className="italic">"Let's begin!"</p>
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Objectives' : 'Objetivos'}
          </h3>
          <ul className="list-disc pl-4 text-[11px] leading-relaxed text-zinc-700 space-y-1">
            <li>Ask for subway directions.</li>
            <li>Understand signs (Uptown vs Downtown, Local vs Express).</li>
            <li>Transfer between lines and exit stations.</li>
            <li>Understand station announcements.</li>
          </ul>
        </div>

        {/* Missions Checklist */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Missions Checklist' : 'Lista de Misiones'}
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { id: 'day2_pizza', text: "Ask 'Which train goes to Times Square?'" },
              { id: 'day2_omny', text: "Ask a local: 'Is this the Downtown train?'" },
              { id: 'day2_check', text: "Explain OMNY payment: 'Just tap your card/phone'" },
              { id: 'day2_cash_card', text: "Confirm if you need to transfer: 'Do I need to transfer?'" }
            ].map(m => (
              <label 
                key={m.id} 
                className={`flex items-start gap-2.5 p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  isMissionDone(m.id) 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-400 line-through' 
                    : 'bg-zinc-50 border-zinc-200/60 text-zinc-700 hover:border-zinc-300'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={isMissionDone(m.id)}
                  onChange={() => onToggleMission(m.id)}
                  className="mt-0.5 accent-emerald-600 rounded cursor-pointer w-3.5 h-3.5"
                />
                <span className="font-semibold">{m.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Essential Vocabulary */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Subway Vocabulary' : 'Vocabulario de Metro'}
          </h3>
          <div className="border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200">
                  <th className="p-2.5 font-bold text-zinc-700 w-1/2">English</th>
                  <th className="p-2.5 font-bold text-zinc-700 w-1/2">Español</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { en: "Subway / Station", es: "Metro / Estación" },
                  { en: "Platform / Train", es: "Andén / Tren" },
                  { en: "Uptown", es: "Hacia el norte / Uptown" },
                  { en: "Downtown", es: "Hacia el sur / Downtown" },
                  { en: "Local / Express", es: "Tren local / Tren expreso" },
                  { en: "Transfer / Next stop", es: "Transbordo / Próxima estación" },
                  { en: "Swipe / Tap", es: "Pasar la tarjeta / Tocar para pagar" },
                  { en: "OMNY", es: "Pago sin contacto en torniquetes" }
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="p-2.5 font-mono text-amber-850 font-bold">{item.en}</td>
                    <td className="p-2.5 text-zinc-600">{item.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Important Signs */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Subway Signs glossary' : 'Letreros del Metro'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-700">
            <div className="p-2 bg-zinc-50 border border-zinc-200/60 rounded-xl">
              <span className="block font-bold text-zinc-800 font-mono">Uptown</span>
              Train is traveling North.
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-200/60 rounded-xl">
              <span className="block font-bold text-zinc-800 font-mono">Downtown</span>
              Train is traveling South.
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-200/60 rounded-xl">
              <span className="block font-bold text-zinc-800 font-mono">Local</span>
              Stops at every station.
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-200/60 rounded-xl">
              <span className="block font-bold text-zinc-800 font-mono">Express</span>
              Skips many stations.
            </div>
          </div>
        </div>

        {/* Important Announcements */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
            {selectedLang === 'EN' ? 'Common Announcements' : 'Anuncios Comunes'}
          </h3>
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 space-y-2 text-[10.5px] leading-relaxed">
            <div>
              <p className="font-bold text-zinc-800 font-mono">"Stand clear of the closing doors, please."</p>
              <p className="text-zinc-500 text-[9.5px]">Por favor, manténgase alejado de las puertas que se cierran.</p>
            </div>
            <div>
              <p className="font-bold text-zinc-800 font-mono">"Watch the gap between the train and the platform."</p>
              <p className="text-zinc-500 text-[9.5px]">Cuidado con el espacio entre el tren y el andén.</p>
            </div>
          </div>
        </div>

        {/* Cultural Tip */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1.5">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
            🗽 Subway Tip
          </h4>
          <p className="text-[10.5px] leading-relaxed text-zinc-700 font-medium">
            NYC Subway stations have OMNY. You don't need a MetroCard; just tap your card or smartphone at the turnstile. Always confirm whether you need an <strong>Express</strong> or <strong>Local</strong> train before boarding!
          </p>
        </div>
      </div>
    );
  }

  // Default fallback for Lesson 3 and 4
  return (
    <div className="w-full flex flex-col font-sans text-neutral-900 space-y-5 text-left pb-6">
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
        <div>
          <h2 className="text-sm font-black text-amber-850 uppercase tracking-wide">
            {selectedLang === 'EN' ? `Lesson ${dayNum}` : `Lección ${dayNum}`}
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Level: {activeLevel}
          </p>
        </div>
        <button 
          onClick={onEndLesson}
          className="text-[10px] font-mono font-bold text-red-600 hover:text-red-700 underline border-none bg-transparent cursor-pointer"
        >
          {selectedLang === 'EN' ? 'End Lesson' : 'Terminar'}
        </button>
      </div>

      <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-2">
        <span className="block text-[8px] font-mono font-black tracking-wider text-yellow-800 uppercase">
          Lesson Goal
        </span>
        <p className="text-[11.5px] leading-relaxed text-zinc-800">
          This lesson helps you practice vocabulary and expressions regarding New York City landmarks, hotels, and tourist attractions. Use the chat window on the left to chat with Voyager!
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-amber-900">
          Missions Checklist
        </h3>
        <p className="text-[11px] text-zinc-500">
          Check off the active objectives in the HUD panel above the chat feed on the left panel as you complete them in conversation with Voyager!
        </p>
      </div>
    </div>
  );
};
