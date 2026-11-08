import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';

export const Route = createFileRoute('/aviso-legal')({
  head: () => ({
    meta: [
      { title: 'Aviso legal · ComoEnCasa Sevilla' },
      { name: 'description', content: 'Responsables y contacto del proyecto universitario y periodístico ComoEnCasa Sevilla.' },
      { property: 'og:title', content: 'Aviso legal · ComoEnCasa Sevilla' },
      { property: 'og:description', content: 'Responsables y contacto del proyecto universitario y periodístico ComoEnCasa Sevilla.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: LegalNoticePage,
});

function LegalNoticePage() {
  return (
    <div>
      <PageHeader eyebrow="Información del proyecto" title="Aviso legal" />
      <div className="container-page pb-16">
        <article className="max-w-3xl space-y-10 text-base leading-relaxed text-tinta-600">
          <p className="border-l-4 border-terracota-500 pl-4 text-sm">
            Borrador pendiente de revisión legal. Esta información no acredita el cumplimiento de todas las obligaciones aplicables al proyecto.
          </p>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Responsables de la web</h2>
            <p>ComoEnCasa es un proyecto universitario de carácter periodístico sobre Sevilla, gestionado bajo la responsabilidad de sus integrantes:</p>
            <ul className="mt-4 list-disc space-y-1 pl-6">
              <li>Celia Freire Muñoz</li>
              <li>Inés García Martín</li>
              <li>Valle Ruda Vera</li>
              <li>Andrea Márquez Becerra</li>
              <li>Mariam Ahmed Díaz</li>
              <li>Candela Portillo Fernández</li>
            </ul>
            <p className="mt-4">La responsabilidad del proyecto corresponde a sus integrantes, no a la universidad.</p>
            <p className="mt-4">Contacto: <a href="mailto:comoencasasev@gmail.com" className="break-all text-terracota-600 underline underline-offset-4">comoencasasev@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Objeto del proyecto</h2>
            <p>ComoEnCasa reúne noticias, crónicas y reportajes sobre barrios, junto con información sobre lugares, rutas y experiencias locales. La sección Noticias es publicada por las administradoras del proyecto.</p>
            <p className="mt-4">La web no es una agencia de viajes y no vende ni gestiona reservas. Para reservar o contratar una actividad o alojamiento, hay que contactar directamente con su responsable.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Información y enlaces</h2>
            <p>Los precios, horarios y demás datos prácticos son orientativos y pueden cambiar. Se recomienda confirmarlos con el establecimiento antes de una visita o reserva.</p>
            <p className="mt-4">Los enlaces a webs de establecimientos, mapas y redes sociales conducen a servicios de terceros, con sus propias condiciones. Para comunicar un dato incorrecto, podéis escribir al correo de contacto.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Textos, fotografías y autoría</h2>
            <p>La publicación de un texto o imagen en esta web no implica que pueda reutilizarse libremente. Antes de reproducir contenido, debe comprobarse su autoría, licencia y, cuando corresponda, obtener permiso de quien tenga los derechos.</p>
            <p className="mt-4">Las consultas sobre autoría o derechos de los contenidos pueden dirigirse al correo de contacto.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Actividad económica y revisión</h2>
            <p>La publicidad, los patrocinios u otras vías de ingresos se contemplan para una etapa posterior. Antes de incorporarlos, deberá revisarse y actualizarse la información legal del proyecto.</p>
            <p className="mt-4">Está pendiente determinar qué datos identificativos adicionales, como domicilio y número de identificación fiscal, resultan exigibles según la titularidad y actividad de la web. También debe completarse por separado la información de privacidad relativa a los datos personales recogidos.</p>
          </section>
        </article>
      </div>
    </div>
  );
}