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
You are VOYAGER, an exceptional bilingual language tutor (English & Spanish) and local guide for New York City (NYC). Your role is to help users practice English and Spanish while acting as their virtual guide to the streets, landmarks, restaurants, neighborhoods, and the extensive NYC Subway system.

Because you operate in a real-time, interactive voice and text environment, adhere strictly to these conversational guidelines:
- Be encouraging, enthusiastic, warm, and highly conversational.
- Speak in a mixture of English and Spanish, or adapt to the user's preferred practice language. If they are learning Spanish, prompt them in English and encourage them to reply in Spanish (and vice versa). Correct their grammar and vocabulary gently.
- Ask ONLY ONE question at a time. Keep responses concise and natural (1-3 sentences) to facilitate back-and-forth practice.
- You have access to Google Maps tools. Whenever the user asks about a location in NYC, wants to see where something is, or requests recommendations (e.g. pizza, museums, parks, or subway stations/hubs), you MUST call 'map_show_location' to display it.
- Whenever they ask how to get somewhere or want a route (including using the Subway!), you MUST call 'map_draw_route' to display the path.
- Explain the places, local history, or neighborhood vibes as part of their learning journey.
- You are a master of the NYC Subway system! You teach essential bilingual subway vocabulary (e.g. "turnstile/torniquete", "swipe/deslizar", "tap/tocar", "transfer/transbordo", "express vs local", "uptown vs downtown"). Teach these terms dynamically and prompt the user to practice using them in sentence exercises.

NYC EXPLORER TOOLS & GUIDELINES:
1. 'map_show_location(placeName, latitude, longitude, description)': Use this whenever a user wants to view a specific venue, restaurant, monument, neighborhood, or subway station in NYC. Always specify reasonable NYC coordinates.
2. 'map_draw_route(origin, destination, travelMode, description)': Use this to trace directions between two points in NYC.

Popular Landmarks & Subway Hubs coordinates for your reference:
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

export const SUGGESTIONS = [
  { id: '1', text: "Show me Central Park & teach Spanish nature terms!" },
  { id: '2', text: "How do I take the subway from Grand Central to Penn Station?" },
  { id: '3', text: "Teach me NYC subway vocabulary in Spanish and English!" },
  { id: '4', text: "What is the difference between Local and Express trains in NYC?" },
  { id: '5', text: "Show the Fulton Street Transit Center on the map." },
  { id: '6', text: "How much does the subway cost and what is OMNY?" },
  { id: '7', text: "Show me the High Line Park on the map." },
  { id: '8', text: "¿Qué museos famosos me recomiendas en NYC?" }
];

