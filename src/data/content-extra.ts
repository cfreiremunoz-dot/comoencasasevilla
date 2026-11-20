import type { Place, Route, Experience, RouteStop, StopType, ZoneId, BudgetLevel, CategoryId } from './types';

// Bares típicos, hoteles locales y rutas/experiencias adicionales.
const px = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`;
const I = {
  taberna: px('35550991'), tapas1: px('14009277'), tapas2: px('14009280'), tapas3: px('17166774'),
  gilda: px('38681146'), toast: px('5602720'), cafe: px('30923283'), terraza: px('14737215'), terraza2: px('34056723'),
  jamon: px('6142844'), fish: px('30811293'), patio: px('12838145'), naranjo: px('33707783'), calle: px('16380845'),
  empedrado: px('40244095'), giralda: px('27548551'), catedral: px('34900836'), alcazar: px('30643253'),
  alcazar2: px('36482036'), triana: px('16778487'), puente: px('16778473'), rio: px('30666336'), rioDia: px('39397693'),
  plaza: px('16643962'), plazaNoche: px('34946149'), maria: px('8560389'), setas: px('30741289'), ceramica: px('27905345'),
  barro: px('38723354'), mercado: px('34776483'), citricos: px('35874793'), aceite: px('31105190'), torre: px('30643272'),
  calleVida: px('31023826'), farolillos: px('5110037'), cafeManana: px('7138891'),
};

function bar(id: string, slug: string, name: string, zone: ZoneId, budget: BudgetLevel, image: string, excerpt: string, description: string, tips: string[], lat: number, lng: number): Place {
  return { id, slug, name, category: 'gastronomia', zone, budget, tags: ['gastronomia', 'noche'], image, imageAlt: `${name}, bar típico de Sevilla`, excerpt, description, tips, interests: ['gastronomia', 'parejas', 'solo'], isDemo: false, coords: { lat, lng } };
}
function hotel(id: string, slug: string, name: string, zone: ZoneId, budget: BudgetLevel, image: string, excerpt: string, description: string, tips: string[], lat: number, lng: number): Place {
  return { id, slug, name, category: 'alojamiento' as CategoryId, zone, budget, tags: ['parejas'], image, imageAlt: `${name}, alojamiento en Sevilla`, excerpt, description, tips, interests: ['parejas', 'familias', 'solo'], isDemo: false, coords: { lat, lng } };
}

export const extraPlaces: Place[] = [
  // ─── Bares típicos ───
  bar('p-rinconcillo', 'el-rinconcillo', 'El Rinconcillo', 'centro', 'economico', I.taberna, 'Taberna histórica del centro, conocida por su barra y su servicio tradicional.', 'Junto a la iglesia de Santa Catalina, El Rinconcillo es una taberna conocida por su barra y sus detalles tradicionales. La carta y las formas de servicio pueden cambiar; consulta qué tapas están disponibles y los precios vigentes en el propio local.', ['Pide en la barra y fíjate cómo te apuntan la cuenta con tiza.', 'Las espinacas con garbanzos son la tapa de la casa.'], 37.3946, -5.9893),
  bar('p-las-columnas', 'bodega-santa-cruz-las-columnas', 'Bodega Santa Cruz "Las Columnas"', 'centro', 'economico', I.tapas1, 'Tapeo de pie, rápido y sabroso en pleno barrio de Santa Cruz.', 'Conocida por todos como "Las Columnas", es uno de los bares más populares del barrio de Santa Cruz. Se tapea de pie, en la calle, con montaditos y tapas a precios de barrio a dos pasos de la Giralda.', ['Prueba el montadito de pringá.', 'Está lleno a casi cualquier hora: paciencia y buen humor.'], 37.3857, -5.9915),
  bar('p-casa-morales', 'casa-morales', 'Casa Morales', 'centro', 'economico', I.taberna, 'Bodega del centro con tinajas de barro y tapas de cocina andaluza.', 'Casa Morales es una bodega del centro con tinajas de barro y una carta de tapas, chacinas y vinos. La oferta y los precios pueden variar; comprueba la información actual en el local.', ['Las tapas se apuntan en la pizarra del fondo.', 'Ideal antes o después de ver la Catedral.'], 37.3876, -5.9963),
  bar('p-las-teresas', 'bar-las-teresas', 'Bar Las Teresas', 'centro', 'medio', I.jamon, 'Jamones colgados y mostrador antiguo en el corazón de Santa Cruz.', 'Un clásico del barrio de Santa Cruz desde 1870, con jamones colgados del techo, mostrador de madera y un ambiente que mezcla vecinos y viajeros curiosos.', ['El jamón y la chacina son su punto fuerte.', 'Mejor a media mañana, antes de la hora punta.'], 37.3852, -5.9890),
  bar('p-casa-placido', 'casa-placido', 'Casa Plácido', 'centro', 'economico', I.tapas2, 'Montaditos y jamón en una esquina de toda la vida.', 'Casa Plácido es un bar estrecho y antiguo de Santa Cruz, famoso por sus montaditos y su jamón. Rápido, sencillo y muy sevillano.', ['Pide un montadito de lomo y una manzanilla.'], 37.3856, -5.9888),
  bar('p-antonio-romero', 'bodeguita-antonio-romero', 'Bodeguita Antonio Romero', 'centro', 'medio', I.gilda, 'Una parada del Arenal donde se puede preguntar por el montadito piripi.', 'En el barrio de El Arenal, junto a la Maestranza, esta bodeguita es famosa por el piripi: un montadito de lomo, bacon, queso y tomate. Tapas bien hechas y ambiente taurino.', ['El piripi es obligatorio.', 'Muy animado en días de toros.'], 37.3870, -5.9990),
  bar('p-el-comercio', 'bar-el-comercio', 'Bar El Comercio', 'centro', 'economico', I.cafeManana, 'Churros con chocolate en una cafetería céntrica de la calle Lineros.', 'Bar El Comercio es conocido por servir churros con chocolate en la calle Lineros. Comprueba el horario, la disponibilidad y los precios directamente con el establecimiento.', ['Ve temprano por la mañana para los churros recién hechos.'], 37.3913, -5.9938),
  bar('p-casa-ruperto', 'casa-ruperto', 'Casa Ruperto', 'triana', 'economico', I.tapas3, 'Una parada en Santa Cecilia para consultar la carta del día.', 'En Santa Cecilia, Casa Ruperto es conocido por su propuesta de codorniz frita. La apertura y la disponibilidad del plato pueden variar; confirma con el establecimiento antes de desplazarte.', ['Pide las codornices y no tengas prisa.'], 37.3833, -6.0090),
  bar('p-las-golondrinas', 'las-golondrinas', 'Las Golondrinas', 'triana', 'economico', I.tapas1, 'Tapas a la plancha y ambiente trianero de verdad.', 'Un bar pequeño con azulejos en la fachada, famoso por la punta de solomillo y los champiñones a la plancha. Es uno de los bares favoritos de los propios trianeros.', ['La punta de solomillo es su tapa estrella.', 'Llega pronto: se llena enseguida.'], 37.3848, -6.0036),
  bar('p-blanca-paloma', 'blanca-paloma', 'Blanca Paloma', 'triana', 'medio', I.terraza, 'Taberna familiar en San Jacinto con cocina casera.', 'En plena calle San Jacinto, la Blanca Paloma es una taberna de las de siempre: barra con azulejos, tapas de cocina casera y buen producto.', ['Pregunta por las tapas del día.'], 37.3815, -6.0063),
  bar('p-alvaro-peregil', 'taberna-alvaro-peregil', 'Taberna Álvaro Peregil', 'centro', 'economico', I.taberna, 'Una diminuta taberna famosa por su vino de naranja.', 'En la calle Mateos Gago, a la sombra de la Giralda, esta pequeña taberna es conocida por su vino de naranja, un dulce tradicional sevillano, y por su ambiente de toda la vida.', ['Prueba el vino de naranja con una tapa de queso.'], 37.3862, -5.9902),
  bar('p-eslava', 'bar-eslava', 'Eslava', 'centro', 'medio', I.tapas2, 'Cocina creativa y tapas en el barrio de San Lorenzo.', 'En San Lorenzo, Eslava ofrece una propuesta de tapas y cocina creativa. Los platos destacados, la carta y las reservas pueden cambiar; consulta la información actual del restaurante.', ['Confirma horarios y opciones de reserva.', 'Consulta la carta y los platos disponibles ese día.'], 37.3988, -5.9973),
  bar('p-casa-vizcaino', 'casa-vizcaino', 'Casa Vizcaíno', 'macarena', 'economico', I.calleVida, 'Bar de barrio en la calle Feria, de cañas y conversación.', 'Uno de los bares más queridos de la calle Feria, de los de mostrador y cerveza bien tirada, donde el barrio se reúne al caer la tarde.', ['Los jueves, combínalo con el mercadillo del Jueves.'], 37.3985, -5.9915),
  bar('p-la-brunilda', 'la-brunilda', 'La Brunilda', 'centro', 'medio', I.tapas3, 'Tapas de cocina actual en El Arenal, muy valoradas por los sevillanos.', 'Un bar de tapas pequeño y luminoso cerca del río, con cocina de mercado y platos de temporada a precios razonables. Siempre lleno de gente de Sevilla.', ['Ve al abrir o espera turno en la barra.'], 37.3878, -5.9990),
  bar('p-dos-de-mayo', 'bodega-dos-de-mayo', 'Bodega Dos de Mayo', 'centro', 'medio', I.terraza2, 'Terraza clásica en la plaza de la Gavidia.', 'Una bodega antigua con terraza en la plaza de la Gavidia, con tapas tradicionales, vinos andaluces y ambiente relajado lejos de las rutas más turísticas.', ['La terraza es ideal en primavera y otoño.'], 37.3946, -5.9985),
  bar('p-puerta-carne', 'freiduria-puerta-de-la-carne', 'Freiduría Puerta de la Carne', 'centro', 'economico', I.fish, 'Pescaíto frito en cartucho, como siempre.', 'Junto a Santa María la Blanca, esta freiduría sirve el pescado frito en cartucho de papel: adobo, chocos, puntillitas y boquerones para comer de pie o en la terraza de al lado.', ['Pide un cartucho variado para compartir.'], 37.3870, -5.9862),
  bar('p-la-campana', 'confiteria-la-campana', 'Confitería La Campana', 'centro', 'economico', I.cafe, 'Confitería céntrica conocida por sus dulces tradicionales.', 'En el entorno de la plaza del Duque, La Campana ofrece dulces y pastelería. La disponibilidad de productos y el servicio pueden variar; consulta la carta y el horario vigentes.', ['Las yemas y los cortadillos de cidra son lo más típico.'], 37.3936, -5.9952),
  bar('p-casa-cuesta', 'casa-cuesta', 'Casa Cuesta', 'triana', 'medio', I.terraza, 'Taberna con terraza en la plaza del Altozano, puerta de Triana.', 'Abierta desde 1917 junto a la plaza del Altozano, Casa Cuesta es punto de encuentro de los trianeros. Cocina tradicional, buen ambiente y terraza con vida de barrio.', ['El rabo de toro es su plato más conocido.'], 37.3857, -6.0035),

  // ─── Hoteles locales de calidad ───
  hotel('p-casa-1800', 'hotel-casa-1800', 'Hotel Casa 1800', 'centro', 'alto', I.patio, 'Casa palacio del siglo XIX junto a la Catedral, con azotea y vistas a la Giralda.', 'Un hotel boutique sevillano en una casa señorial restaurada en el barrio de Santa Cruz. Patio central, habitaciones con techos altos, merienda por la tarde y una azotea con piscina frente a la Giralda.', ['La merienda de la tarde está incluida.', 'Pide habitación con vistas a la Giralda.'], 37.3855, -5.9915),
  hotel('p-corral-del-rey', 'corral-del-rey', 'Corral del Rey', 'centro', 'alto', I.alcazar2, 'Casa palacio del siglo XVII convertida en hotel de pocas habitaciones.', 'Un pequeño hotel de lujo familiar en una casa del siglo XVII del barrio de la Alfalfa, con patios, azotea con piscina y un trato muy cercano.', ['Muy pocas habitaciones: reserva con antelación.'], 37.3891, -5.9898),
  hotel('p-amadeus', 'hotel-amadeus-sevilla', 'Hotel Amadeus Sevilla', 'centro', 'medio', I.naranjo, 'Hotel familiar dedicado a la música, en la Judería.', 'Una casa sevillana del siglo XVIII llevada por una familia de músicos. Algunas habitaciones tienen piano y la azotea mira a la Giralda. Calidad y precio razonable en pleno Santa Cruz.', ['Si tocas, pide una habitación con piano.'], 37.3868, -5.9877),
  hotel('p-casas-juderia', 'las-casas-de-la-juderia', 'Las Casas de la Judería', 'centro', 'medio', I.patio, 'Varias casas palacio unidas por pasadizos y patios en la antigua Judería.', 'Un hotel sevillano formado por casas históricas conectadas por patios, fuentes y pasadizos. Piscina en la azotea y ambiente tranquilo en el barrio de Santa Cruz.', ['Piérdete por sus patios antes de salir a la calle.'], 37.3878, -5.9858),
  hotel('p-casa-poeta', 'hotel-casa-del-poeta', 'Hotel Casa del Poeta', 'centro', 'medio', I.patio, 'Casa del siglo XVII con patio y música en directo en Santa Cruz.', 'Un pequeño hotel con encanto en una calle tranquila de Santa Cruz, con patio porticado, azotea con vistas y conciertos de guitarra española por la noche.', ['Pregunta por los conciertos en el patio.'], 37.3857, -5.9878),
  hotel('p-sacristia-santa-ana', 'hotel-sacristia-de-santa-ana', 'Hotel Sacristía de Santa Ana', 'macarena', 'medio', I.terraza2, 'Hotel con encanto en una casa del siglo XVIII en la Alameda.', 'En plena Alameda de Hércules, una casa tradicional con patio, fuente y habitaciones decoradas con antigüedades. Perfecto para vivir la Sevilla de barrio.', ['La Alameda tiene vida nocturna: pide habitación interior si quieres silencio.'], 37.3992, -5.9947),
  hotel('p-palacio-alcazar', 'hotel-palacio-alcazar', 'Hotel Palacio Alcázar', 'centro', 'medio', I.alcazar, 'Pequeño hotel blanco frente a los muros del Alcázar.', 'Un hotel sencillo y cuidado en la plaza de la Alianza, uno de los rincones más bonitos de Santa Cruz, con terraza en la azotea con vistas a la Giralda.', ['Toma algo en su azotea al atardecer.'], 37.3848, -5.9910),
  hotel('p-dona-maria', 'hotel-dona-maria', 'Hotel Doña María', 'centro', 'medio', I.giralda, 'Hotel familiar clásico con piscina mirando a la Giralda.', 'Un hotel sevillano de toda la vida, a pocos metros de la Catedral, con decoración tradicional y una azotea con piscina frente a la Giralda.', ['La piscina de la azotea es un lujo en verano.'], 37.3860, -5.9925),
  hotel('p-mercer', 'hotel-mercer-sevilla', 'Hotel Mercer Sevilla', 'centro', 'alto', I.patio, 'Casa palacio del siglo XIX con patio de mármol y servicio exquisito.', 'Un hotel de lujo de pocas habitaciones en el barrio de El Arenal, con un precioso patio andaluz, azotea con piscina y una atención muy personal.', ['Ideal para una ocasión especial.'], 37.3880, -5.9985),
  hotel('p-alcoba-rey', 'hotel-alcoba-del-rey', 'Hotel Alcoba del Rey', 'macarena', 'medio', I.alcazar2, 'Hotel de inspiración andalusí junto a la Basílica de la Macarena.', 'Un hotel con patio de estilo mudéjar, celosías y fuentes, en el barrio de la Macarena. Tranquilo y muy cerca de la muralla almohade.', ['Visita la Basílica de la Macarena a primera hora.'], 37.4020, -5.9890),
  hotel('p-abanico', 'hotel-abanico', 'Hotel Abanico', 'centro', 'economico', I.calle, 'Casa sevillana con azulejos, buena relación calidad-precio.', 'Un hotel sencillo y bien cuidado en una casa tradicional del barrio de la Alfalfa, con patio de azulejos y a pocos minutos a pie de todo.', ['Muy buena base para ver la ciudad andando.'], 37.3894, -5.9887),
  hotel('p-patio-alameda', 'hotel-patio-de-la-alameda', 'Hotel Patio de la Alameda', 'macarena', 'economico', I.terraza, 'Casa con varios patios en la Alameda, cómodo y asequible.', 'Un hotel construido alrededor de varios patios andaluces en la Alameda de Hércules, con habitaciones amplias y precios razonables.', ['Perfecto si viajas en familia.'], 37.3985, -5.9940),
];

const s = (order: number, placeId: string, stopType: StopType, note: string, walk = 5): RouteStop => ({ order, placeId, stopType, note, whatToDo: note, walkMinutesFromPrevious: order === 1 ? 0 : walk });

function route(id: string, slug: string, title: string, subtitle: string, image: string, category: CategoryId, duration: string, distance: string, difficulty: Route['difficulty'], description: string, stops: RouteStop[], budgetNote?: string): Route {
  return { id, slug, title, subtitle, image, imageAlt: title, category, duration, distance, difficulty, description, stops, isDemo: false, authorDemo: 'Equipo ComoEnCasa', ...(budgetNote ? { budgetNote } : {}) };
}

export const extraRoutes: Route[] = [
  route('r-tabernas-centenarias', 'tabernas-centenarias', 'Barras con historia', 'Tabernas y cafeterías del centro', I.taberna, 'gastronomia', '3 horas', '2,5 km', 'facil', 'Un itinerario por tabernas y cafeterías del centro, con paradas para observar sus barras, cartas y formas de servicio. Las fechas de apertura y las especialidades deben confirmarse con cada negocio; la ruta propone una selección, no una clasificación de los locales más antiguos.', [
    s(1, 'p-rinconcillo', 'gastronomia', 'Empieza por El Rinconcillo y consulta qué tapas están disponibles ese día.'),
    s(2, 'p-el-comercio', 'gastronomia', 'Baja por Lineros hasta Bar El Comercio y consulta si hay churros disponibles.', 10),
    s(3, 'p-casa-morales', 'gastronomia', 'Haz una pausa entre las tinajas de barro de Casa Morales.', 10),
    s(4, 'p-las-teresas', 'gastronomia', 'Termina en Santa Cruz bajo los jamones colgados.', 8),
  ], 'El gasto depende de las consumiciones; comprueba precios actuales en cada local.'),
  route('r-santa-cruz-tapas', 'santa-cruz-de-tapas', 'Santa Cruz de tapas', 'Callejuelas, patios y barras', I.tapas1, 'gastronomia', '2-3 horas', '1,5 km', 'facil', 'Combina un paseo por Santa Cruz con paradas gastronómicas en Mateos Gago y calles cercanas. La zona es concurrida y los locales tienen aforos, precios y horarios distintos; comprueba la oferta del día y elige las paradas según tu ritmo.', [
    s(1, 'p-catedral-giralda', 'historia', 'Sal desde la Giralda.'),
    s(2, 'p-alvaro-peregil', 'gastronomia', 'Un vino de naranja en Mateos Gago.', 3),
    s(3, 'p-las-columnas', 'gastronomia', 'Montaditos de pie en Las Columnas.', 4),
    s(4, 'p-casa-placido', 'gastronomia', 'Jamón y montaditos en Casa Plácido.', 3),
    s(5, 'p-puerta-carne', 'gastronomia', 'Cierra con un cartucho de pescaíto.', 6),
  ], 'El gasto depende de las consumiciones; comprueba precios actuales en cada local.'),
  route('r-triana-barra', 'triana-de-barra-en-barra', 'Triana de barra en barra', 'Los bares favoritos de los trianeros', I.triana, 'gastronomia', '3 horas', '2 km', 'facil', 'Un recorrido de tapeo entre el Altozano, Santa Cecilia y San Jacinto, pensado para hacer a pie y compartir pequeñas raciones. La disponibilidad de platos y el servicio cambian por establecimiento; consulta menús, precios y horarios antes de decidir dónde parar.', [
    s(1, 'p-puente-isabel', 'barrio', 'Cruza el puente de Triana.'),
    s(2, 'p-casa-cuesta', 'gastronomia', 'Primera parada en el Altozano.', 3),
    s(3, 'p-las-golondrinas', 'gastronomia', 'Punta de solomillo en Las Golondrinas.', 5),
    s(4, 'p-blanca-paloma', 'gastronomia', 'Tapas caseras en San Jacinto.', 6),
    s(5, 'p-casa-ruperto', 'gastronomia', 'Termina con codornices fritas.', 10),
  ], 'El gasto depende de las consumiciones; comprueba precios actuales en cada local.'),
  route('r-arenal-toros', 'el-arenal-y-la-maestranza', 'El Arenal y la Maestranza', 'Río, toros y montaditos', I.torre, 'barrios', '2-3 horas', '2 km', 'facil', 'Pasea por el Arenal entre el frente del Guadalquivir, la plaza de toros y varias barras de tapas. El recorrido combina espacio público con negocios privados; consulta por separado las visitas interiores, la programación taurina y los horarios de los bares.', [
    s(1, 'p-torre-oro', 'historia', 'Empieza en la Torre del Oro.'),
    s(2, 'p-antonio-romero', 'gastronomia', 'Un piripi en la Bodeguita Antonio Romero.', 8),
    s(3, 'p-la-brunilda', 'gastronomia', 'Tapas de mercado en La Brunilda.', 3),
    s(4, 'p-casa-morales', 'gastronomia', 'Vino entre tinajas.', 6),
  ]),
  route('r-san-lorenzo', 'san-lorenzo-y-la-gavidia', 'San Lorenzo y la Gavidia', 'El barrio del Gran Poder', I.empedrado, 'barrios', '2 horas', '2 km', 'facil', 'Una caminata por San Lorenzo y la Gavidia que combina plazas, calles residenciales y bares de tapas. En las zonas habitadas, mantén el volumen bajo y comprueba si los locales requieren reserva o tienen horarios especiales.', [
    s(1, 'p-plaza-nueva', 'encuentro', 'Sal de la plaza Nueva.'),
    s(2, 'p-dos-de-mayo', 'gastronomia', 'Terraza en la plaza de la Gavidia.', 10),
    s(3, 'p-eslava', 'gastronomia', 'Tapas de autor en Eslava.', 6),
    s(4, 'p-alameda', 'barrio', 'Termina paseando por la Alameda.', 10),
  ]),
  route('r-macarena-feria', 'jueves-en-la-feria', 'Jueves en la Feria', 'Mercadillo, mercado y bares de barrio', I.mercado, 'mercados', 'Media mañana', '2 km', 'facil', 'Un paseo por la calle Feria que distingue el mercado municipal de abastos del mercadillo callejero semanal. La celebración, el recorrido y los horarios del mercadillo pueden cambiar; revisa la información municipal vigente antes de desplazarte y termina en un bar abierto de la zona.', [
    s(1, 'p-calle-feria', 'comercio', 'Recorre el mercadillo del Jueves.'),
    s(2, 'p-mercado-feria', 'mercado', 'Entra al mercado de la Feria.', 3),
    s(3, 'p-casa-vizcaino', 'gastronomia', 'Una caña en Casa Vizcaíno.', 3),
    s(4, 'p-alameda', 'barrio', 'Sigue hasta la Alameda.', 8),
  ]),
  route('r-dulce-sevilla', 'sevilla-dulce', 'Sevilla dulce', 'Churros, yemas y vino de naranja', I.cafe, 'tradiciones', '2 horas', '2 km', 'facil', 'Un paseo dulce que propone churros, confitería y una parada en el centro. La disponibilidad de productos y los horarios varían por temporada y establecimiento; confirma antes de ir y pregunta por ingredientes o alérgenos.', [
    s(1, 'p-el-comercio', 'gastronomia', 'Churros con chocolate para empezar.'),
    s(2, 'p-la-campana', 'gastronomia', 'Yemas y cortadillos en La Campana.', 8),
    s(3, 'p-setas-parasol', 'cultural', 'Paseo bajo las Setas.', 8),
    s(4, 'p-alvaro-peregil', 'gastronomia', 'Vino de naranja junto a la Giralda.', 12),
  ]),
  route('r-monumental', 'sevilla-monumental-en-un-dia', 'Sevilla monumental en un día', 'Lo imprescindible, a pie', I.catedral, 'cultura', 'Jornada completa', '5 km', 'moderado', 'Un itinerario a pie que enlaza la Catedral, el frente del río, el Parque de María Luisa y la Plaza de España. Incluye exteriores y posibles visitas interiores, que requieren comprobar entradas, horarios y tiempos de acceso por separado; deja margen para descansar y adaptar el orden.', [
    s(1, 'p-catedral-giralda', 'historia', 'Catedral y Giralda a primera hora.'),
    s(2, 'p-las-columnas', 'gastronomia', 'Un montadito para reponer.', 4),
    s(3, 'p-torre-oro', 'historia', 'Baja hasta el río y la Torre del Oro.', 10),
    s(4, 'p-maria-luisa', 'naturaleza', 'Atraviesa el parque de María Luisa.', 15),
    s(5, 'p-plaza-espana', 'historia', 'Termina en la plaza de España.', 8),
  ]),
  route('r-atardecer-rio', 'atardecer-junto-al-rio', 'Atardecer junto al río', 'La hora dorada del Guadalquivir', I.rio, 'naturaleza', '2 horas', '3 km', 'facil', 'Un recorrido de tarde por distintos tramos del Guadalquivir, con opciones para detenerse junto a los puentes y al paseo fluvial. La puesta de sol cambia según la estación; comprueba la hora local y elige un tramo compatible con tu movilidad y el tiempo disponible.', [
    s(1, 'p-torre-oro', 'historia', 'Sal de la Torre del Oro.'),
    s(2, 'p-guadalquivir', 'naturaleza', 'Camina junto al río.', 10),
    s(3, 'p-puente-isabel', 'barrio', 'Mira la puesta de sol desde el puente.', 10),
    s(4, 'p-casa-cuesta', 'gastronomia', 'Cena en el Altozano.', 3),
  ]),
  route('r-setas-alfalfa', 'de-las-setas-a-la-alfalfa', 'De las Setas a la Alfalfa', 'Mercado, miradores y plazas', I.setas, 'barrios', '2-3 horas', '2 km', 'facil', 'Una ruta breve entre el mercado de la Encarnación, el mirador de Metropol Parasol y la plaza de la Alfalfa. El mercado y el mirador tienen accesos y horarios distintos; consulta la web oficial de Setas y no des por hecho que la Alfalfa es un mercado de abastos.', [
    s(1, 'p-mercado-encarnacion', 'mercado', 'Desayuno en el mercado.'),
    s(2, 'p-setas-parasol', 'cultural', 'Sube al mirador de las Setas.', 2),
    s(3, 'p-plaza-alfalfa', 'encuentro', 'Baja hasta la plaza de la Alfalfa.', 8),
    s(4, 'p-rinconcillo', 'gastronomia', 'Vuelve hacia El Rinconcillo para tapear.', 8),
  ]),
  route('r-ceramica-azulejo', 'ruta-del-azulejo', 'Ruta del azulejo', 'De los hornos de Triana a la plaza de España', I.ceramica, 'tradiciones', 'Media jornada', '4 km', 'moderado', 'Un itinerario para observar la cerámica en Triana y en los espacios públicos de Sevilla, con una parada cultural y otra en la Plaza de España. No todos los talleres admiten visitas espontáneas ni todas las piezas son antiguas; verifica horarios y atribuciones antes de participar o comprar.', [
    s(1, 'p-calle-pureza', 'barrio', 'Empieza en la calle Pureza.'),
    s(2, 'p-ceramica-triana', 'comercio', 'Visita un taller de cerámica.', 4),
    s(3, 'p-azulejos-rincones', 'historia', 'Busca azulejos escondidos.', 15),
    s(4, 'p-plaza-espana', 'historia', 'Termina en los bancos de las provincias.', 20),
  ]),
  route('r-familias', 'sevilla-con-ninos', 'Sevilla con niños', 'Plazas, paseos y pausas al aire libre', I.maria, 'naturaleza', 'Media jornada', '3 km', 'facil', 'Una propuesta familiar que enlaza la Plaza de España, el Parque de María Luisa y el paseo hacia el río. El terreno, las sombras y la afluencia varían; evita alimentar a las aves, lleva agua y consulta las normas y servicios disponibles en el parque.', [
    s(1, 'p-plaza-espana', 'historia', 'Barcas en la plaza de España.'),
    s(2, 'p-maria-luisa', 'naturaleza', 'Observa la fauna sin alimentar a las aves y respeta las normas del parque.', 5),
    s(3, 'p-torre-oro', 'historia', 'Paseo hasta la Torre del Oro.', 15),
    s(4, 'p-puerta-carne', 'gastronomia', 'Pescaíto en cartucho para comer.', 15),
  ]),
  route('r-noche-sevillana', 'una-noche-sevillana', 'Una noche sevillana', 'Plazas iluminadas y cenas de barra', I.plazaNoche, 'barrios', '3 horas', '3 km', 'facil', 'Un paseo nocturno por plazas céntricas con opciones de cena en Santa Cruz. Los horarios de monumentos y restaurantes cambian y no todos los espacios tienen actividad de noche; verifica las aperturas y respeta el descanso de quienes viven en el barrio.', [
    s(1, 'p-plaza-nueva', 'encuentro', 'Empieza en la plaza Nueva.'),
    s(2, 'p-catedral-giralda', 'historia', 'La Giralda iluminada.', 8),
    s(3, 'p-las-teresas', 'gastronomia', 'Cena de tapas en Santa Cruz.', 6),
    s(4, 'p-alvaro-peregil', 'gastronomia', 'Una última copa de vino de naranja.', 3),
  ]),
  route('r-hoteles-patios', 'patios-con-encanto', 'Patios con encanto', 'Santa Cruz y sus casas palacio', I.patio, 'rincones', '2 horas', '1,5 km', 'facil', 'Un paseo exterior por calles de Santa Cruz con patios visibles desde espacios que permiten la entrada. Varias casas y hoteles son privados: no se debe acceder sin invitación o autorización; confirma con cada establecimiento si ofrece visitas.', [
    s(1, 'p-casa-1800', 'historia', 'Mira el patio de la Casa 1800.'),
    s(2, 'p-palacio-alcazar', 'historia', 'Sigue hasta la plaza de la Alianza.', 4),
    s(3, 'p-casa-poeta', 'historia', 'Busca la Casa del Poeta.', 5),
    s(4, 'p-casas-juderia', 'historia', 'Termina en Las Casas de la Judería.', 5),
  ]),
];

function exp(id: string, slug: string, title: string, subtitle: string, image: string, type: Experience['type'], duration: string, description: string, highlights: string[]): Experience {
  return { id, slug, title, subtitle, image, imageAlt: title, type, duration, description, highlights, isDemo: false };
}

export const extraExperiences: Experience[] = [
  exp('e-tiza-rinconcillo', 'cuenta-con-tiza', 'La cuenta con tiza', 'Tapa, barra e historia local', I.taberna, 'gastronomica', '1 hora', 'El Rinconcillo es una taberna histórica del centro, conocida por su barra y por una forma tradicional de llevar la cuenta. Si la cuenta con tiza sigue disponible el día de tu visita, fíjate en el gesto y pregunta por las tapas que se preparan entonces; la carta y el servicio pueden cambiar.', ['Pregunta por las tapas disponibles', 'Fíjate en los detalles de la barra', 'Comprueba si la cuenta se anota con tiza']),
  exp('e-pescaito', 'pescaito-en-cartucho', 'Pescaíto en cartucho', 'Fritura andaluza para comer de pie', I.fish, 'gastronomica', '45 min', 'Prueba una fritura de pescado en un establecimiento que la prepare al momento. El surtido —por ejemplo, adobo o chocos— depende de la oferta del día; pregunta por ingredientes, alérgenos y si se sirve en cartucho para llevar.', ['Pregunta por el surtido del día', 'Consulta los alérgenos', 'Pregunta por el formato para llevar']),
  exp('e-piripi', 'el-piripi', 'Probar el piripi', 'El montadito de El Arenal', I.gilda, 'gastronomica', '30 min', 'El piripi es un montadito asociado a la Bodeguita Antonio Romero, en el Arenal. La receta y la disponibilidad pueden cambiar; consulta la carta del local y considera esta parada una recomendación gastronómica, no una garantía de que esté disponible.', ['Consulta los ingredientes y alérgenos', 'Comprueba horario y disponibilidad', 'En el barrio del Arenal']),
  exp('e-codornices', 'codornices-en-triana', 'Codornices en Triana', 'Un clásico de barrio', I.tapas3, 'gastronomica', '1 hora', 'Casa Ruperto es una parada posible en Santa Cecilia para quien quiera probar codorniz frita. Comprueba que el establecimiento esté abierto y que el plato forme parte de la carta ese día; las recomendaciones no sustituyen la información del negocio.', ['Comprueba si el plato está en carta', 'Confirma horario de apertura', 'Consulta precios vigentes']),
  exp('e-tapa-autor', 'tapa-de-autor', 'Tapa de autor en San Lorenzo', 'La Sevilla más creativa', I.tapas2, 'gastronomica', '1-2 horas', 'Eslava ofrece una propuesta de cocina creativa en San Lorenzo. Los platos destacados y la forma de servicio pueden variar según temporada; consulta la carta y las opciones de reserva directamente con el restaurante.', ['Huevo sobre bizcocho de boletus', 'Cigarro para Bécquer', 'Ve temprano']),
  exp('e-yemas', 'yemas-y-cafe-en-la-campana', 'Yemas y café en La Campana', 'La confitería de los sevillanos', I.cafe, 'gastronomica', '30 min', 'Haz una pausa en la Confitería La Campana y pregunta por sus dulces disponibles, como yemas, tocino de cielo o cortadillos. La oferta puede cambiar por temporada y horario; comprueba la apertura del establecimiento antes de ir.', ['Yemas', 'Tocino de cielo', 'Cortadillos de cidra']),
  exp('e-vino-naranja', 'vino-de-naranja', 'Vino de naranja', 'El dulce sabor de los naranjos', I.citricos, 'gastronomica', '30 min', 'El vino de naranja es un vino aromatizado que puede encontrarse en algunas tabernas sevillanas. Pregunta por su procedencia, elaboración y graduación, y confirma si el local lo sirve; la recomendación es para personas adultas y el consumo de alcohol es opcional.', ['Vino dulce tradicional', 'Junto a la Giralda', 'Con un trozo de queso']),
  exp('e-jueves-mercadillo', 'mercadillo-del-jueves', 'Mercadillo del Jueves', 'Puestos y paseo por la calle Feria', I.mercado, 'cotidiana', '1-2 horas', 'El mercadillo callejero del jueves se asocia a la calle Feria y es distinto del mercado municipal de abastos. La celebración, el recorrido y el tipo de puestos pueden variar; verifica la información municipal vigente antes de desplazarte.', ['Paseo por la calle Feria', 'Consulta el horario y recorrido vigentes', 'Mercadillo y mercado de abastos son distintos']),
  exp('e-azotea-giralda', 'atardecer-en-una-azotea', 'Atardecer en una azotea', 'La Giralda a la altura de los ojos', I.giralda, 'cotidiana', '1 hora', 'Algunos establecimientos disponen de terrazas o azoteas con vistas a la Giralda, pero son espacios privados y su acceso depende de las normas, reservas y horarios de cada lugar. Elige un establecimiento abierto al público y confirma condiciones, consumo mínimo y accesibilidad antes de ir.', ['Vistas a la Giralda', 'Luz dorada', 'Una copa sin prisa']),
  exp('e-barca-plaza', 'barca-en-la-plaza-de-espana', 'Barca en la plaza de España', 'Remar entre puentes de azulejo', I.plaza, 'cotidiana', '30 min', 'El alquiler de barcas en el canal puede ser una actividad recreativa cuando el servicio está operativo. Consulta horarios, tarifas, condiciones meteorológicas, requisitos para menores y accesibilidad con el operador; no se garantiza disponibilidad todos los días.', ['Canal y puentes de la plaza', 'Consulta normas para menores', 'Comprueba horario y condiciones']),
  exp('e-paseo-rio', 'paseo-en-bici-por-el-rio', 'Paseo en bici por el río', 'Un paseo ciclista junto al Guadalquivir', I.rioDia, 'cotidiana', '2 horas', 'Un paseo en bicicleta por los tramos habilitados junto al Guadalquivir permite recorrer distintos barrios sin depender del coche. Antes de salir, revisa el mapa de carriles, obras y normas de circulación, y confirma la disponibilidad y condiciones de cualquier servicio de alquiler.', ['Revisa el mapa de carriles', 'Comprueba obras y desvíos', 'Confirma opciones de alquiler']),
  exp('e-flamenco-triana', 'flamenco-en-triana', 'Flamenco en Triana', 'Historia flamenca y programación local', I.triana, 'cultural', '2 horas', 'Triana mantiene una relación destacada con la historia y la práctica del flamenco. Para escuchar cante o guitarra, consulta la programación de peñas y salas abiertas al público; los espectáculos, horarios, precios y requisitos de reserva dependen de cada espacio.', ['Consulta salas y peñas abiertas al público', 'Comprueba cartel y reservas', 'Horarios y precios según espacio']),
  exp('e-patios-andaluces', 'patios-andaluces', 'Descubrir los patios', 'La vida de puertas adentro', I.patio, 'cultural', '1-2 horas', 'Los patios forman parte de la arquitectura de muchas casas sevillanas, pero la mayoría son espacios privados. Visita únicamente los que anuncien acceso público, jornadas de puertas abiertas o visitas concertadas y respeta siempre las indicaciones de cada propiedad.', ['Entra solo en espacios abiertos al público', 'Respeta las normas de cada propiedad', 'Confirma visitas concertadas']),
  exp('e-azahar', 'oler-el-azahar', 'Oler el azahar', 'La primavera sevillana', I.naranjo, 'cotidiana', 'Un paseo', 'Cuando florecen los naranjos, el azahar puede percibirse durante un paseo por zonas arboladas. La floración no tiene fechas fijas y varía con el clima; no arranques flores ni frutos de los árboles públicos.', ['Floración de fecha variable', 'Zonas arboladas', 'Paseo gratuito por espacio público']),
  exp('e-cruz-mayo', 'cruces-de-mayo', 'Cruces de mayo', 'La fiesta de los barrios', I.farolillos, 'cultural', 'Una tarde', 'Las Cruces de Mayo son celebraciones vecinales que pueden organizarse en distintos barrios y fechas. La programación no es uniforme cada año; consulta la agenda municipal y las indicaciones de cada evento, y respeta los espacios residenciales.', ['Consulta fechas y barrios participantes', 'Revisa la agenda municipal', 'Respeta las normas del evento']),
];
