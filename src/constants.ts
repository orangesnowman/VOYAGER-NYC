export const MODEL_NAME = "gemini-3.1-flash-live-preview";

export interface Landmark {
  id: string;
  name: string;
  nameEs: string;
  latitude: number;
  longitude: number;
  descriptionEn: string;
  descriptionEs: string;
  category: 'landmark' | 'park' | 'museum' | 'food' | 'station';
}

export const NYC_LANDMARKS: Landmark[] = [
  {
    id: 'times_square',
    name: 'Times Square',
    nameEs: 'Times Square',
    latitude: 40.758895,
    longitude: -73.985131,
    descriptionEn: 'The bustling, bright-light heart of the Broadway theater district.',
    descriptionEs: 'El bullicioso corazón de luces brillantes del distrito de teatros de Broadway.',
    category: 'landmark'
  },
  {
    id: 'central_park',
    name: 'Central Park',
    nameEs: 'Central Park',
    latitude: 40.785091,
    longitude: -73.968285,
    descriptionEn: 'The iconic 843-acre urban oasis in the center of Manhattan.',
    descriptionEs: 'El icónico oasis urbano de 843 acres en el centro de Manhattan.',
    category: 'park'
  },
  {
    id: 'empire_state',
    name: 'Empire State Building',
    nameEs: 'Edificio Empire State',
    latitude: 40.748440,
    longitude: -73.985664,
    descriptionEn: 'The legendary 102-story Art Deco skyscraper with 360-degree views.',
    descriptionEs: 'El legendario rascacielos Art Déco de 102 pisos con vistas de 360 grados.',
    category: 'landmark'
  },
  {
    id: 'statue_of_liberty',
    name: 'Statue of Liberty',
    nameEs: 'Estatua de la Libertad',
    latitude: 40.689249,
    longitude: -74.044500,
    descriptionEn: 'The colossal neoclassical sculpture on Liberty Island welcoming visitors.',
    descriptionEs: 'La colosal escultura neoclásica en la Isla de la Libertad que da la bienvenida a los visitantes.',
    category: 'landmark'
  },
  {
    id: 'brooklyn_bridge',
    name: 'Brooklyn Bridge',
    nameEs: 'Puente de Brooklyn',
    latitude: 40.706085,
    longitude: -73.996864,
    descriptionEn: 'The historic suspension bridge connecting Manhattan and Brooklyn over the East River.',
    descriptionEs: 'El histórico puente colgante que conecta Manhattan y Brooklyn sobre el East River.',
    category: 'landmark'
  },
  {
    id: 'high_line',
    name: 'The High Line',
    nameEs: 'The High Line (Parque Elevado)',
    latitude: 40.7480,
    longitude: -74.0048,
    descriptionEn: 'A public park built on a historic elevated freight rail line on Manhattan’s West Side.',
    descriptionEs: 'Un parque público construido sobre una histórica línea de ferrocarril de carga elevada en el West Side de Manhattan.',
    category: 'park'
  },
  {
    id: 'met_museum',
    name: 'The Metropolitan Museum of Art',
    nameEs: 'El Museo Metropolitano de Arte (The Met)',
    latitude: 40.7794,
    longitude: -73.9632,
    descriptionEn: 'One of the world’s largest and finest art museums, located on Museum Mile.',
    descriptionEs: 'Uno de los museos de arte más grandes y selectos del mundo, ubicado en Museum Mile.',
    category: 'museum'
  },
  {
    id: 'grand_central',
    name: 'Grand Central Terminal',
    nameEs: 'Terminal Grand Central',
    latitude: 40.752726,
    longitude: -73.977229,
    descriptionEn: 'The historic, beautifully restored Beaux-Arts transit hub in Midtown.',
    descriptionEs: 'La histórica y bellamente restaurada terminal de tránsito Beaux-Arts en Midtown.',
    category: 'station'
  },
  {
    id: 'joes_pizza',
    name: "Joe's Pizza",
    nameEs: "Pizzería Joe's Pizza",
    latitude: 40.7306,
    longitude: -74.0022,
    descriptionEn: 'A Greenwich Village institution serving classic, legendary New York style street slices.',
    descriptionEs: 'Una institución de Greenwich Village que sirve clásicas y legendarias porciones al estilo neoyorquino.',
    category: 'food'
  },
  {
    id: 'one_world_trade',
    name: 'One World Trade Center',
    nameEs: 'One World Trade Center',
    latitude: 40.7127,
    longitude: -74.0134,
    descriptionEn: 'The tallest building in the Western Hemisphere, offering breathtaking city vistas.',
    descriptionEs: 'El edificio más alto del hemisferio occidental, que ofrece vistas impresionantes de la ciudad.',
    category: 'landmark'
  },
  {
    id: 'rockefeller_center',
    name: 'Rockefeller Center',
    nameEs: 'Centro Rockefeller',
    latitude: 40.7587,
    longitude: -73.9787,
    descriptionEn: 'A large complex of commercial buildings famous for its Christmas Tree and ice rink.',
    descriptionEs: 'Un gran complejo de edificios comerciales famoso por su árbol de Navidad y pista de hielo.',
    category: 'landmark'
  },
  {
    id: 'moma',
    name: 'Museum of Modern Art (MoMA)',
    nameEs: 'Museo de Arte Moderno (MoMA)',
    latitude: 40.7614,
    longitude: -73.9776,
    descriptionEn: 'One of the most influential modern art museums in the world.',
    descriptionEs: 'Uno de los mueos de arte moderno más influyentes del mundo.',
    category: 'museum'
  },
  {
    id: 'penn_station',
    name: '34 St - Penn Station Hub',
    nameEs: 'Estación Penn Station (Calle 34)',
    latitude: 40.750580,
    longitude: -73.991102,
    descriptionEn: 'The busiest transit hub in North America, serving the 1, 2, 3, A, C, and E subway lines.',
    descriptionEs: 'El centro de tránsito más concurrido de América del Norte, con servicio de las líneas de metro 1, 2, 3, A, C y E.',
    category: 'station'
  },
  {
    id: 'fulton_transit_center',
    name: 'Fulton Street Transit Center',
    nameEs: 'Centro de Tránsito de Fulton Street',
    latitude: 40.710368,
    longitude: -74.007582,
    descriptionEn: 'A major modern subway hub in Lower Manhattan connecting the 2, 3, 4, 5, A, C, J, and Z lines.',
    descriptionEs: 'Un importante y moderno centro de metro en el Lower Manhattan que conecta las líneas 2, 3, 4, 5, A, C, J y Z.',
    category: 'station'
  },
  {
    id: 'atlantic_avenue_hub',
    name: 'Atlantic Av - Barclays Center Station',
    nameEs: 'Estación de Atlantic Av - Barclays Center',
    latitude: 40.683661,
    longitude: -73.978810,
    descriptionEn: 'The largest transit hub in Brooklyn, connecting the 2, 3, 4, 5, B, D, N, Q, and R lines.',
    descriptionEs: 'El centro de tránsito más grande de Brooklyn, que conecta las líneas 2, 3, 4, 5, B, D, N, Q y R.',
    category: 'station'
  },
  {
    id: 'columbus_circle_station',
    name: '59 St - Columbus Circle Station',
    nameEs: 'Estación de 59 St - Columbus Circle',
    latitude: 40.768250,
    longitude: -73.981928,
    descriptionEn: 'A bustling Midtown West subway complex at the corner of Central Park, serving the 1, A, B, C, and D lines.',
    descriptionEs: 'Un bullicioso complejo de metro en Midtown West junto a Central Park, con servicio de las líneas 1, A, B, C y D.',
    category: 'station'
  }
];

export interface SubwayLine {
  code: string;
  color: string;
  name: string;
  stations: string[];
}

export interface SubwayTerm {
  en: string;
  es: string;
  definitionEn: string;
  definitionEs: string;
}

export interface SubwayInfo {
  farePrice: string;
  paymentMethods: string[];
  lines: SubwayLine[];
  vocabulary: SubwayTerm[];
  tipsEn: string[];
  tipsEs: string[];
}

export const NYC_SUBWAY_INFO: SubwayInfo = {
  farePrice: "$2.90",
  paymentMethods: ["OMNY (Contactless Tap to Pay with Card/Phone)", "MetroCard (Refillable Magnetic Card)"],
  lines: [
    { code: "1", color: "Red", name: "Broadway - 7th Av Local", stations: ["South Ferry", "Chambers St", "Penn Station", "Times Square", "Columbus Circle", "191st St"] },
    { code: "2", color: "Red", name: "Seventh Avenue Express", stations: ["Flatbush Av", "Atlantic Av", "Fulton St", "Chambers St", "Penn Station", "Times Square", "Bronx Park East"] },
    { code: "3", color: "Red", name: "Seventh Avenue Express", stations: ["Crown Heights", "Atlantic Av", "Fulton St", "Chambers St", "Penn Station", "Times Square", "Harlem-148 St"] },
    { code: "A", color: "Blue", name: "Eighth Avenue Express", stations: ["Far Rockaway", "JFK Airport (Airtrain)", "Broadway Junction", "Fulton St", "Penn Station", "Times Square", "Columbus Circle", "Inwood-207 St"] },
    { code: "C", color: "Blue", name: "Eighth Avenue Local", stations: ["Euclid Av", "Broadway Junction", "Fulton St", "Penn Station", "Times Square", "Columbus Circle", "168 St"] },
    { code: "E", color: "Blue", name: "Eighth Avenue Local", stations: ["World Trade Center", "Penn Station", "Times Square", "Lexington Av-53 St", "Jackson Hts-Roosevelt Av", "Jamaica Center"] },
    { code: "4", color: "Green", name: "Lexington Avenue Express", stations: ["Crown Heights", "Atlantic Av", "Fulton St", "Brooklyn Bridge-City Hall", "Grand Central", "86 St", "Woodlawn"] },
    { code: "5", color: "Green", name: "Lexington Avenue Express", stations: ["Flatbush Av", "Atlantic Av", "Fulton St", "Brooklyn Bridge-City Hall", "Grand Central", "86 St", "Eastchester-Dyre Av"] },
    { code: "6", color: "Green", name: "Lexington Avenue Local", stations: ["Brooklyn Bridge-City Hall", "Astor Pl", "Union Sq-14 St", "Grand Central", "86 St", "Pelham Bay Park"] },
    { code: "7", color: "Purple", name: "Flushing Local/Express", stations: ["34 St-Hudson Yards", "Times Square", "Fifth Av", "Grand Central", "Court Sq", "Queensboro Plaza", "Flushing-Main St"] },
    { code: "L", color: "Grey", name: "14th Street-Canarsie Local", stations: ["8 Av", "6 Av", "Union Sq-14 St", "1 Av", "Bedford Av", "Lorimer St", "Broadway Junction", "Canarsie-Rockaway Pkwy"] },
    { code: "N", color: "Yellow", name: "Broadway Express", stations: ["Coney Island-Stillwell Av", "Atlantic Av", "Canal St", "Union Sq-14 St", "Times Square", "Queensboro Plaza", "Astoria-Ditmars Blvd"] },
    { code: "Q", color: "Yellow", name: "Broadway Express", stations: ["Coney Island-Stillwell Av", "Atlantic Av", "Canal St", "Union Sq-14 St", "Times Square", "96 St (2nd Ave)"] },
    { code: "R", color: "Yellow", name: "Broadway Local", stations: ["Bay Ridge-95 St", "Atlantic Av", "Canal St", "Union Sq-14 St", "Times Square", "Queensboro Plaza", "Jackson Hts-Roosevelt Av", "Forest Hills-71 Av"] }
  ],
  vocabulary: [
    { en: "Swipe", es: "Deslizar", definitionEn: "Passing a MetroCard through a turnstile slot.", definitionEs: "Pasar la tarjeta MetroCard por la ranura del torniquete." },
    { en: "Tap", es: "Tocar / Aproximar", definitionEn: "Tapping a phone/contactless card on OMNY readers.", definitionEs: "Tocar con el móvil o tarjeta sin contacto en los lectores OMNY." },
    { en: "Turnstile", es: "Torniquete / Molinete", definitionEn: "The physical rotating barrier you walk through to enter the subway platform.", definitionEs: "La barrera giratoria física por la que pasas para entrar al andén del metro." },
    { en: "Transfer", es: "Transbordo / Transferencia", definitionEn: "Switching from one subway line to another within the same station for free.", definitionEs: "Cambiar de una línea de metro a otra dentro de la misma estación de forma gratuita." },
    { en: "Express Train", es: "Tren Expreso", definitionEn: "A subway train that skips smaller stations, stopping only at major hubs.", definitionEs: "Un tren de metro que se salta las estaciones más pequeñas, parando solo en los centros principales." },
    { en: "Local Train", es: "Tren Local", definitionEn: "A train that stops at every single station along the route.", definitionEs: "Un tren que se detiene en cada una de las estaciones a lo largo de la ruta." },
    { en: "Platform", es: "Andén / Plataforma", definitionEn: "The concrete waiting area next to the subway tracks.", definitionEs: "El área de espera de concreto junto a las vías del metro." },
    { en: "Tracks", es: "Vías / Rieles", definitionEn: "The steel rails on which the subway trains run.", definitionEs: "Los rieles de acero sobre los cuales corren los trenes del metro." },
    { en: "Uptown", es: "Dirección Norte / Uptown", definitionEn: "Trains going North (toward Upper Manhattan, Bronx, or Queens).", definitionEs: "Trenes que van hacia el Norte (hacia el norte de Manhattan, Bronx o Queens)." },
    { en: "Downtown", es: "Dirección Sur / Downtown", definitionEn: "Trains going South (toward Lower Manhattan or Brooklyn).", definitionEs: "Trenes que van hacia el Sur (hacia el sur de Manhattan o Brooklyn)." }
  ],
  tipsEn: [
    "Subway runs 24/7. Single ride fare is $2.90.",
    "Pay attention to the letter or number (e.g., 'A' or '1'), NOT just the color. Lines of the same color split and go to different final destinations!",
    "Check platform screens to verify if the next incoming train is 'Local' or 'Express'.",
    "OMNY has a weekly fare cap of $34. After 12 rides tapped with the same card/device from Monday-Sunday, subsequent rides are free!"
  ],
  tipsEs: [
    "El metro funciona las 24/7. La tarifa de viaje sencillo es de $2.90.",
    "Presta atención a la letra o número (ej. 'A' o '1'), NO solo al color. ¡Las líneas del mismo color se bifurcan hacia distintos destinos!",
    "Revisa las pantallas del andén para verificar si el siguiente tren es 'Local' o 'Express'.",
    "OMNY tiene un límite semanal de tarifa de $34. ¡Tras 12 viajes con el mismo dispositivo/tarjeta de lunes a domingo, el resto son gratis!"
  ]
};

export const SYSTEM_INSTRUCTION = `
You are VOYAGER, a bilingual companion guiding a Spanish-speaking user through New York City. Your primary and main conversational language is Spanish. You must conduct all conversations and guide dialogue with the user in Spanish. You simultaneously act as the user's Tour Guide, English Teacher, Pronunciation Coach, Conversation Partner, Cultural Interpreter, Navigation Assistant, Real-time Translator, and Personal Tutor. You teach English by translating terms, sharing key phrases, and gently correcting their attempts, but you must speak to the user in Spanish as your default language.

CONVERSATIONAL GUIDELINES:
- Be encouraging, enthusiastic, warm, and highly conversational.
- Speak strictly in Spanish as your default, main conversational language. Do NOT translate your own Spanish conversational dialogue, responses, or sentences into English. Keep the dialogue entirely in Spanish. Only use English when correcting the user's grammar, teaching specific English vocabulary words (e.g. day lessons), or when the user explicitly asks for a translation.
- Ask ONLY ONE question at a time. Keep responses concise and natural (1-3 sentences) to facilitate back-and-forth practice.
- CRITICAL: When speaking English, please speak a bit slower and clearer than usual. Pronounce your words deliberately and use short pauses between clauses to ensure the language learner can easily follow.
- CRITICAL NAME PRONUNCIATION: Whenever you say your name "VOYAGER", you must pronounce it in English (e.g. "voy-uh-jer"). Never pronounce it with a Spanish accent or try to adapt it to Spanish phonetics. The name must always be pronounced strictly in English.
- CRITICAL CONVERSATIONAL CONSTRAINT: Never mention scores, grades, numbers, or ratings in your spoken voice output or in the conversational text. You must act 100% like a natural companion during the dialogue. Never write bracketed text tags like [SCORES: ...] or similar structures in your text output, as the Text-to-Speech engine will read them aloud.
- Do NOT call the 'update_user_progress' tool or output progress metrics in your initial greeting or welcome response. Only call it on subsequent conversational turns after the user has spoken and you are evaluating their input.
- You have access to Google Maps tools. Whenever the user asks about a location in NYC, wants to see where something is, or requests recommendations (e.g. pizza, museums, parks, or subway stations/hubs), you MUST call 'map_show_location' to display it.
- Whenever they ask how to get somewhere or want a route, you MUST call 'map_draw_route' to display the path.

THE IMMERSION LEARNING LOOP:
1. PREPARE: Before the user walks into a scenario (e.g., ordering coffee, entering a museum, buying tickets), prepare them with natural English phrases. E.g., teach them "I'd like a latte, please" and explain that "I'd like" is much more polite than "I want".
2. PRONUNCIATION COACH: Analyze the user's pronunciation, stress, rhythm, and intonation. Give them accent coaching tips (e.g., softening the 't' in 'latte', or explaining word linking: "I'd like a bah-dl uhv wah-ter").
3. GRAMMAR IN CONTEXT: Correct errors immediately but gently. E.g., if they say "Yesterday I go to Central Park", correct it to "I went" and explain why, then practice two more examples.
4. ACCENT REDUCTION: Focus on common Spanish-speaker difficulties (e.g., ship/sheep, live/leave, beach/bitch, v/b, thirty/dirty). Suggest targeted practice if you notice these.
5. TWO-WAY TRANSLATOR: Translate what a waiter, cashier, or driver might say in NYC (e.g. "For here or to go?"), explain the cultural/idiomatic meaning in Spanish, and teach it.
6. PROGRESS METRICS (CRITICAL): At the end of every evaluation or feedback turn (but NEVER during the initial greeting or welcome response), you MUST silently call the 'update_user_progress' tool to record their progress metrics (grammar, pronunciation, confidence, and naturalness from 1 to 5), newly learned vocabulary words, accent coaching tips, or completed mission IDs. Do NOT write these metrics in your text transcription or speak them aloud.

NYC MAP TOOLS:
1. 'map_show_location(placeName, latitude, longitude, description)': Focus map on specific venue, landmarks, or subway stations.
2. 'map_draw_route(origin, destination, travelMode, description)': Traces walking, driving, bicycling, or transit directions.

Landmarks for reference:
- Times Square: 40.758895, -73.985131
- Central Park: 40.785091, -73.968285
- Empire State Building: 40.748440, -73.985664
- Statue of Liberty: 40.689249, -74.044500
- Brooklyn Bridge: 40.706085, -73.996864
- High Line (Chelsea): 40.7480, -74.0048
- Metropolitan Museum of Art (Met): 40.7794, -73.9632
- Joe's Pizza (Greenwich Village): 40.7306, -74.0022
- Grand Central Terminal: 40.752726, -73.977229
- 34 St - Penn Station Hub: 40.750580, -73.991102
- Fulton Street Transit Center: 40.710368, -74.007582
- Atlantic Av - Barclays Center Station: 40.683661, -73.978810
- 59 St - Columbus Circle Station: 40.768250, -73.981928
`;

export interface CurriculumDay {
  dayNum: number;
  title: string;
  titleEs: string;
  objectives: string[];
  objectivesEs: string[];
  vocabulary: { word: string; definition: string; definitionEs: string }[];
  missions: { id: string; en: string; es: string }[];
}

export const IMMERSION_CURRICULUM: CurriculumDay[] = [
  {
    dayNum: 1,
    title: "Greetings, Coffee & Directions",
    titleEs: "Saludos, Café y Direcciones",
    objectives: [
      "Learn polite, natural greetings and ordering expressions (e.g. 'I'd like' instead of 'I want').",
      "Understand the difference between 'for here' and 'to go'.",
      "Ask for directions to landmarks and subway platforms."
    ],
    objectivesEs: [
      "Aprender saludos naturales y expresiones corteses para ordenar (ej. 'I'd like' en lugar de 'I want').",
      "Entender la diferencia entre 'for here' y 'to go'.",
      "Preguntar por direcciones hacia lugares emblemáticos y andenes del metro."
    ],
    vocabulary: [
      { word: "I'd like a...", definition: "Polite way to order food or drink, short for 'I would like'.", definitionEs: "Forma cortés de ordenar comida o bebida, abreviación de 'I would like'." },
      { word: "For here / To go", definition: "Expressions cashiers use to ask if you will eat in the shop or take it away.", definitionEs: "Expresiones que los cajeros usan para preguntar si vas a consumir en el local o para llevar." },
      { word: "Excuse me, where's...", definition: "Standard polite greeting used to get someone's attention for directions.", definitionEs: "Saludo cortés estándar usado para llamar la atención de alguien al pedir direcciones." },
      { word: "Platform / Tracks", definition: "The area where you wait for trains / the steel rails the train runs on.", definitionEs: "El área donde esperas el tren / los rieles de acero sobre los que corre el tren." }
    ],
    missions: [
      { id: "day1_coffee", en: "Order coffee using 'I'd like a...'", es: "Ordenar café usando 'I'd like a...'" },
      { id: "day1_togo", en: "Answer the cashier's question 'For here or to go?'", es: "Responder a la pregunta del cajero 'For here or to go?'" },
      { id: "day1_restroom", en: "Ask 'Excuse me, where's the restroom?'", es: "Preguntar 'Excuse me, where's the restroom?'" },
      { id: "day1_directions", en: "Ask a local for directions to a subway line", es: "Preguntar a un local direcciones para una línea de metro" }
    ]
  },
  {
    dayNum: 2,
    title: "Restaurants, Shopping & Money",
    titleEs: "Restaurantes, Compras y Dinero",
    objectives: [
      "Learn restaurant ordering and requesting the check.",
      "Understand how to ask for prices and deal with retail transactions.",
      "Get familiar with tipping vocabulary and local payment methods (like OMNY tap)."
    ],
    objectivesEs: [
      "Aprender a ordenar en restaurantes y pedir la cuenta.",
      "Entender cómo preguntar por precios y realizar transacciones de compra.",
      "Familiarizarse con el vocabulario de propinas y métodos de pago locales (como OMNY tap)."
    ],
    vocabulary: [
      { word: "Could we get...", definition: "Polite opening to request items from a waiter (e.g. 'Could we get the check?').", definitionEs: "Apertura cortés para pedir cosas a un mesero (ej. 'Could we get the check?')." },
      { word: "Keep the change", definition: "Telling a taxi driver or server they can keep the change as a tip.", definitionEs: "Decirle a un taxista o mesero que puede quedarse con el cambio como propina." },
      { word: "How much is...", definition: "Standard question to inquire about the price of an item.", definitionEs: "Pregunta estándar para averiguar el precio de un artículo." },
      { word: "OMNY tap", definition: "Tapping your credit card or phone at turnstiles to pay transit fares.", definitionEs: "Tocar con tu tarjeta de crédito o teléfono en los torniquetes para pagar tarifas de tránsito." }
    ],
    missions: [
      { id: "day2_pizza", en: "Order a classic NYC street slice of pizza", es: "Ordenar una rebanada de pizza clásica de NY" },
      { id: "day2_omny", en: "Pay for transit or shopping using contactless tap", es: "Pagar el tránsito o compras usando tap sin contacto" },
      { id: "day2_check", en: "Ask a waiter 'Could we get the check, please?'", es: "Preguntar a un mesero 'Could we get the check, please?'" },
      { id: "day2_cash_card", en: "Ask a cashier 'Do you accept cash or card?'", es: "Preguntar a un cajero 'Do you accept cash or card?'" }
    ]
  },
  {
    dayNum: 3,
    title: "Museums, Opinions & Past Tense",
    titleEs: "Museos, Opiniones y Pasado",
    objectives: [
      "Learn to purchase tickets and ask about guides or audio guides at attractions.",
      "Express opinions using rich vocabulary (e.g. 'breathtaking', 'masterpiece').",
      "Practice describing past events naturally using the past tense."
    ],
    objectivesEs: [
      "Aprender a comprar boletos y preguntar por guías o audioguías en atracciones.",
      "Expresar opiniones usando vocabulario rico (ej. 'breathtaking', 'masterpiece').",
      "Practicar la descripción de eventos pasados de forma natural usando el tiempo pasado."
    ],
    vocabulary: [
      { word: "Yesterday I went...", definition: "Standard opening for past descriptions (correcting common 'Yesterday I go').", definitionEs: "Apertura estándar para descripciones en pasado (corrigiendo el común 'Yesterday I go')." },
      { word: "Breathtaking", definition: "Extremely beautiful or amazing (e.g. 'The view from the top is breathtaking').", definitionEs: "Extremadamente hermoso o sorprendente (ej. 'La vista desde arriba es impresionante')." },
      { word: "Admission / Ticket", definition: "Fee charged to enter a museum, gallery, or site.", definitionEs: "Tarifa cobrada para ingresar a un museo, galería o sitio." },
      { word: "Audio guide", definition: "A recorded tour device providing explanations of art or landmarks.", definitionEs: "Un dispositivo de tour grabado que proporciona explicaciones de arte o lugares de interés." }
    ],
    missions: [
      { id: "day3_ticket", en: "Purchase a museum ticket in English", es: "Comprar un boleto de museo en inglés" },
      { id: "day3_past_tense", en: "Explain your yesterday trip in past tense to VOYAGER", es: "Explicar tu viaje de ayer en tiempo pasado a VOYAGER" },
      { id: "day3_photo", en: "Ask a stranger 'Excuse me, could you take my picture?'", es: "Preguntar a un extraño 'Excuse me, could you take my picture?'" },
      { id: "day3_audioguide", en: "Ask a museum counter 'Do you have audio guides in Spanish?'", es: "Preguntar en el mostrador del museo 'Do you have audio guides in Spanish?'" }
    ]
  },
  {
    dayNum: 4,
    title: "Broadway, Hotels & Small Talk",
    titleEs: "Broadway, Hoteles y Charla Informal",
    objectives: [
      "Master hotel receptionist check-in and check-out scenarios.",
      "Learn to ask about theater timings, seating options, and discounts (like TKTS).",
      "Engage in brief, friendly small talk with cashiers or locals."
    ],
    objectivesEs: [
      "Dominar los escenarios de check-in y check-out con el recepcionista del hotel.",
      "Aprender a preguntar por horarios de teatro, opciones de asientos y descuentos (como TKTS).",
      "Entablar una breve y amistosa charla informal con cajeros o lugareños."
    ],
    vocabulary: [
      { word: "Check in / Check out", definition: "The process of arriving at / departing from a hotel.", definitionEs: "El proceso de llegar a / salir de un hotel." },
      { word: "TKTS booth", definition: "The famous red steps in Times Square selling discounted Broadway tickets.", definitionEs: "La famosa taquilla de escalones rojos en Times Square que vende boletos de Broadway con descuento." },
      { word: "How's your day going?", definition: "Friendly, casual greeting used with cashiers to initiate small talk.", definitionEs: "Saludo amistoso e informal usado con cajeros para iniciar una charla rápida." },
      { word: "Have a good one!", definition: "A very common American farewell, meaning 'Have a good day'.", definitionEs: "Una despedida estadounidense muy común, que significa 'Que pases un buen día'." }
    ],
    missions: [
      { id: "day4_broadway", en: "Ask about Broadway tickets at the TKTS booth", es: "Preguntar sobre boletos de Broadway en la taquilla TKTS" },
      { id: "day4_hotel", en: "Practice checking out of a hotel with VOYAGER", es: "Practicar la salida de un hotel con VOYAGER" },
      { id: "day4_smalltalk", en: "Have a one-minute friendly small-talk with VOYAGER", es: "Tener una charla amistosa de un minuto con VOYAGER" },
      { id: "day4_goodone", en: "Say goodbye to a cashier using 'Have a good one!'", es: "Despedirse de un cajero usando 'Have a good one!'" }
    ]
  }
];

export const SUGGESTIONS = [
  { id: '1', text: "Let's practice ordering coffee for Day 1!" },
  { id: '2', text: "Prepare me for Ordering Pizza in Greenwich Village." },
  { id: '3', text: "Ask me a vocabulary quiz for Day 1 terms." },
  { id: '4', text: "How do I say '¿Lo quiere para comer aquí o para llevar?' in English?" },
  { id: '5', text: "Correct my grammar: 'Yesterday I go to Central Park and I see the bridge.'" },
  { id: '6', text: "Review my pronunciation for 'I would like a bottle of water.'" },
  { id: '7', text: "Teach me accent reduction tips for the 'v' and 'b' sounds." },
  { id: '8', text: "Generate my End-of-Day progress review!" }
];

