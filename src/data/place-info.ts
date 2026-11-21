// Información práctica de cada lugar (dirección, precios, horarios, contacto)
// y, para lugares genéricos, sitios concretos para elegir.
// Datos orientativos: conviene revisarlos antes de publicar.

export interface PlaceOption {
  name: string;
  address: string;
  note: string;
  price?: string;
}

export interface PlaceInfo {
  address?: string;
  price?: string;
  hours?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  options?: PlaceOption[];
}

export const placeInfo: Record<string, PlaceInfo> = {
  'p-triana': { address: 'Barrio de Triana, entrando por el Puente de Isabel II', price: 'Gratis pasear', hours: 'Todo el día' },
  'p-alameda': { address: 'Alameda de Hércules, 41002 Sevilla', price: 'Gratis · cañas desde 2 €', hours: 'Todo el día; ambiente fuerte por la tarde-noche' },
  'p-mercado-triana': { address: 'Calle San Jorge, 6, 41010 Sevilla', price: 'Entrada libre; compras y consumiciones según el puesto', hours: 'Consulta horarios de puestos y servicios en la web oficial', website: 'https://www.mercadodetrianasevilla.com' },
  'p-mercado-feria': { address: 'Calle Feria, 61, 41003 Sevilla', price: 'Entrada libre; compras y consumiciones según el puesto', hours: 'Confirma horarios y puestos abiertos antes de desplazarte' },
  'p-bellas-artes': { address: 'Plaza del Museo, 9, 41001 Sevilla', price: 'Consulta tarifas y gratuidades vigentes', hours: 'Consulta horarios, salas abiertas y festivos en la web oficial', website: 'https://www.museosdeandalucia.es/web/museodebellasartesdesevilla' },
  'p-maria-luisa': { address: 'Paseo de las Delicias, 41013 Sevilla', price: 'Gratis', hours: 'Todos los días, aprox. 8:00–22:00 (24:00 en verano)' },
  'p-plaza-espana': { address: 'Av. de Isabel la Católica, 41004 Sevilla', price: 'Espacio exterior de acceso libre; actividades con coste propio', hours: 'Comprueba horarios y condiciones de alquiler de barcas' },
  'p-guadalquivir': { address: 'Paseo de Cristóbal Colón y calle Betis', price: 'Gratis', hours: 'Todo el día' },
  'p-bodeguita-casablanca': {
    price: 'Tapas 2,50–5 € · vino o caña 1,50–3 €',
    hours: 'Normalmente mediodía (13:00–16:00) y noche (20:30–24:00)',
    options: [
      { name: 'Bodeguita Casablanca', address: 'Calle Adolfo Rodríguez Jurado, 12', note: 'Famosa por su tortilla al whisky. Pequeña y siempre llena.', price: 'Tapas 3–5 €' },
      { name: 'Bodeguita Antonio Romero', address: 'Calle Antonia Díaz, 19 (El Arenal)', note: 'El sitio de la "pringá" y los montaditos, junto a la Maestranza.', price: 'Montaditos 2,50–4 €' },
      { name: 'Bodega Dos de Mayo', address: 'Plaza de la Gavidia, 6', note: 'Bodega de 1918 con chacinas, guisos y vino del Aljarafe.', price: 'Tapas 3–5 €' },
      { name: 'Las Columnas (Bodega Santa Cruz)', address: 'Calle Rodrigo Caro, 1', note: 'De pie, en la calle y con la cuenta apuntada con tiza.', price: 'Tapas 2,50–4 €' },
      { name: 'Casa Vizcaíno', address: 'Calle Feria, 27', note: 'Taberna de toda la vida: caña, aceitunas y gente del barrio.', price: 'Caña ~1,50 €' },
    ],
  },
  'p-tapeo-alameda': {
    address: 'Alameda de Hércules y alrededores',
    price: 'Tapas 3–6 € · 15–25 € por persona',
    hours: 'Mejor a partir de las 20:30',
    options: [
      { name: 'Casa Vizcaíno', address: 'Calle Feria, 27', note: 'Para empezar con una caña muy fría.' },
      { name: 'Bar Eslava', address: 'Calle Eslava, 3 (San Lorenzo)', note: 'Tapa de autor premiada: el huevo sobre bizcocho de boletus.', price: 'Tapas 3–5 €' },
      { name: 'La Brunilda', address: 'Calle Galera, 5 (El Arenal)', note: 'Cocina creativa a precio de tapa. Sin reservas.', price: 'Tapas 4–6 €' },
      { name: 'Mercado de la Feria', address: 'Calle Feria, 61', note: 'Gastrobares dentro del mercado, ideal a mediodía.' },
    ],
  },
  'p-ceramica-triana': {
    address: 'Calle Callao, 16, 41010 Sevilla',
    price: 'Consulta la tarifa vigente en la web municipal',
    hours: 'Consulta horarios y programación con el Ayuntamiento de Sevilla',
    website: 'https://www.sevilla.org/servicios/cultura',
  },
  'p-azulejos-rincones': {
    price: 'Gratis',
    options: [
      { name: 'Plaza de España', address: 'Av. de Isabel la Católica', note: 'Los bancos de azulejo de cada provincia.' },
      { name: 'Calle Alfarería y San Jorge', address: 'Triana', note: 'Fachadas y retablos de cerámica trianera.' },
      { name: 'Casa de Pilatos', address: 'Plaza de Pilatos, 1', note: 'Una de las mejores colecciones de azulejo del siglo XVI.', price: 'Entrada ~12 €' },
    ],
  },
  'p-naranjos': { price: 'Paseo por espacios públicos gratuito', hours: 'La floración depende de las condiciones de cada año', options: [
    { name: 'Patio de los Naranjos', address: 'Catedral de Sevilla', note: 'Comprueba el acceso y los horarios en la web oficial de la Catedral.' },
    { name: 'Plaza de Doña Elvira', address: 'Barrio de Santa Cruz', note: 'Plaza pública; respeta el descanso de residentes y el paso peatonal.' },
  ] },
  'p-puente-isabel': { address: 'Une Plaza de Cuba con el Altozano', price: 'Gratis', hours: 'Todo el día' },
  'p-calle-pureza': { address: 'Calle Pureza, Triana', price: 'Gratis', hours: 'Capilla de los Marineros abierta mañana y tarde' },
  'p-plaza-alfalfa': { address: 'Plaza de la Alfalfa, 41004 Sevilla', price: 'Gratis · tapas 3–5 €' },
  'p-plaza-pelique': { address: 'Plaza de San Leandro, 41003 Sevilla', price: 'Yemas de San Leandro ~8 € la caja' },
  'p-calle-feria': { address: 'Calle Feria, 41003 Sevilla', price: 'Acceso al espacio público gratuito', hours: 'Confirma por separado el horario del mercado municipal y del mercadillo semanal' },
  'p-mercado-encarnacion': { address: 'Plaza de la Encarnación, 41003 Sevilla', price: 'Entrada libre; compras y consumiciones según el puesto', hours: 'Consulta horarios del mercado; el mirador tiene acceso distinto', website: 'https://setasdesevilla.com/' },
  'p-torre-oro': { address: 'Paseo de Cristóbal Colón, s/n', price: 'Consulta tarifas vigentes antes de la visita', hours: 'Confirma horarios del museo y días festivos con la entidad responsable' },
  'p-catedral-giralda': { address: 'Av. de la Constitución, s/n', price: 'Consulta entradas, tarifas y visitas gratuitas en la web oficial', hours: 'Consulta horarios y excepciones por fecha en la web oficial', website: 'https://www.catedraldesevilla.es/visita-cultural/' },
  'p-plaza-nueva': { address: 'Plaza Nueva, 41001 Sevilla', price: 'Gratis' },
  'p-setas-parasol': { address: 'Plaza de la Encarnación, s/n', price: 'Consulta entradas y tarifas en la web oficial', hours: 'Consulta horarios y última entrada en la web oficial', website: 'https://setasdesevilla.com/' },

  // Bares
  'p-rinconcillo': { address: 'Calle Gerona, 40', price: 'Tapas 3–5 € · espinacas con garbanzos', hours: 'Todos los días 13:00–1:30', website: 'https://elrinconcillo.es' },
  'p-las-columnas': { address: 'Calle Rodrigo Caro, 1', price: 'Tapas 2,50–4 €', hours: 'Todos los días, mediodía y noche' },
  'p-casa-morales': { address: 'Calle García de Vinuesa, 11', price: 'Tapas 3–4 €', hours: 'Lun–sáb mediodía y noche' },
  'p-las-teresas': { address: 'Calle Santa Teresa, 2', price: 'Tapas 3–5 €' },
  'p-casa-placido': { address: 'Calle Mesón del Moro, 5', price: 'Montaditos 2,50–4 €' },
  'p-antonio-romero': { address: 'Calle Antonia Díaz, 19', price: 'Montaditos 2,50–4 €', website: 'https://bodeguitaantonioromero.com' },
  'p-el-comercio': { address: 'Calle Lineros, 9', price: 'Chocolate con churros ~4 €', hours: 'Desde primera hora de la mañana' },
  'p-casa-ruperto': { address: 'Av. de Santa Cecilia, 2 (Triana)', price: 'Codorniz frita ~5 €', hours: 'Tarde-noche' },
  'p-las-golondrinas': { address: 'Calle Antillano Campos, 26 (Triana)', price: 'Tapas 2,50–4 € · punta de solomillo' },
  'p-blanca-paloma': { address: 'Calle San Jacinto, 49 (Triana)', price: 'Tapas 3–5 €' },
  'p-alvaro-peregil': { address: 'Calle Mateos Gago, 20', price: 'Vino de naranja ~2,50 €' },
  'p-eslava': { address: 'Calle Eslava, 3', price: 'Tapas 3–5 €', hours: 'Mar–sáb mediodía y noche · dom mediodía', website: 'https://espacioeslava.com' },
  'p-casa-vizcaino': { address: 'Calle Feria, 27', price: 'Caña ~1,50 €' },
  'p-la-brunilda': { address: 'Calle Galera, 5', price: 'Tapas 4–6 €', hours: 'Mar–sáb mediodía y noche · sin reservas' },
  'p-dos-de-mayo': { address: 'Plaza de la Gavidia, 6', price: 'Tapas 3–5 €' },
  'p-puerta-carne': { address: 'Calle Santa María la Blanca, 36', price: 'Cartucho de pescaíto 6–10 €' },
  'p-la-campana': { address: 'Calle Sierpes, 1', price: 'Dulces 2–4 €', hours: 'Todos los días desde las 8:00', website: 'https://confiterialacampana.com' },
  'p-casa-cuesta': { address: 'Calle Castilla, 1 (Triana)', price: 'Raciones 8–15 €' },

  // Hoteles
  'p-casa-1800': { address: 'Calle Rodrigo Caro, 6', price: 'Desde ~180 €/noche', website: 'https://www.hotelcasa1800sevilla.com' },
  'p-corral-del-rey': { address: 'Corral del Rey, 12', price: 'Desde ~350 €/noche', website: 'https://www.corraldelrey.com' },
  'p-amadeus': { address: 'Calle Farnesio, 6', price: 'Desde ~110 €/noche', website: 'https://www.hotelamadeussevilla.com' },
  'p-casas-juderia': { address: 'Calle Santa María la Blanca, 5', price: 'Desde ~150 €/noche', website: 'https://www.casasypalacios.com' },
  'p-casa-poeta': { address: 'Calle Don Carlos Alonso Chaparro, 3', price: 'Desde ~140 €/noche', website: 'https://www.casadelpoeta.es' },
  'p-sacristia-santa-ana': { address: 'Alameda de Hércules, 22', price: 'Desde ~90 €/noche' },
  'p-palacio-alcazar': { address: 'Plaza de la Alianza, 12', price: 'Desde ~120 €/noche' },
  'p-dona-maria': { address: 'Calle Don Remondo, 19', price: 'Desde ~150 €/noche', website: 'https://www.hdmaria.com' },
  'p-mercer': { address: 'Calle Castelar, 26', price: 'Desde ~400 €/noche', website: 'https://www.mercersevilla.com' },
  'p-alcoba-rey': { address: 'Calle Bécquer, 9', price: 'Desde ~100 €/noche', website: 'https://www.alcobadelrey.com' },
  'p-abanico': { address: 'Calle Águilas, 17', price: 'Desde ~90 €/noche' },
  'p-patio-alameda': { address: 'Alameda de Hércules, 56', price: 'Desde ~80 €/noche' },
};

export function getPlaceInfo(id: string): PlaceInfo | undefined {
  return placeInfo[id];
}

export function mapsUrl(text: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text + ', Sevilla')}`;
}
