import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/PageHeader';

export const Route = createFileRoute('/privacidad')({
  head: () => ({
    meta: [
      { title: 'Política de privacidad · ComoEnCasa Sevilla' },
      { name: 'description', content: 'Borrador de información sobre los datos personales en Comunidad, el asistente y el acceso de ComoEnCasa.' },
      { property: 'og:title', content: 'Política de privacidad · ComoEnCasa Sevilla' },
      { property: 'og:description', content: 'Información de privacidad de ComoEnCasa pendiente de revisión por sus responsables.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div>
      <PageHeader eyebrow="Información del proyecto" title="Política de privacidad" />
      <div className="container-page pb-16">
        <article className="max-w-3xl space-y-10 text-base leading-relaxed text-tinta-600">
          <p className="border-l-4 border-terracota-500 pl-4 text-sm">
            Borrador pendiente de revisión y aprobación por las responsables. No es una política definitiva ni acredita el cumplimiento de la normativa. Quedan por concretar las bases jurídicas, los plazos de conservación y la información sobre proveedores y posibles transferencias internacionales.
          </p>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Responsables y contacto</h2>
            <p>ComoEnCasa es responsabilidad de Celia Freire Muñoz, Inés García Martín, Valle Ruda Vera, Andrea Márquez Becerra, Mariam Ahmed Díaz y Candela Portillo Fernández, no de la universidad.</p>
            <p className="mt-4">Para consultas de privacidad o solicitudes sobre vuestros datos: <a href="mailto:comoencasasev@gmail.com" className="break-all text-terracota-600 underline underline-offset-4">comoencasasev@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Comunidad</h2>
            <p>El formulario permite enviar reseñas, rutas y lugares favoritos, con un nombre de autor opcional, texto, valoración y fotografía opcional. También permite incluir dirección, teléfono, web e Instagram del establecimiento.</p>
            <p className="mt-4">Las aportaciones se envían para su revisión y posible publicación. Si se publican, el nombre aportado y el contenido podrán ser vistos por los visitantes. No incluyáis teléfonos o direcciones personales, datos sensibles ni imágenes de otras personas sin una autorización adecuada.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Asistente de inteligencia artificial</h2>
            <p>Las preguntas y el contexto de la conversación se envían a un servicio de inteligencia artificial para generar respuestas. El historial también se guarda en el navegador desde el que se utiliza el asistente; puede eliminarse desde la lista de conversaciones.</p>
            <p className="mt-4">No escribáis contraseñas, documentos de identidad, datos bancarios ni información sensible. Eliminar una conversación del navegador no equivale a borrar posibles registros de los servicios que la procesaron.</p>
            <p className="mt-4">Si se solicita hablar con una persona y se envía el formulario, se remiten al equipo el correo electrónico, el nombre opcional, la consulta y un extracto de la conversación para atenderla.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Acceso a las cuentas</h2>
            <p>El acceso y la creación de cuentas solicitan un correo electrónico y una contraseña para gestionar la identificación y el acceso al panel. La información de sesión puede almacenarse en el navegador.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Servicios externos y almacenamiento</h2>
            <p>La web utiliza servicios externos para el alojamiento, las cuentas, el almacenamiento de aportaciones y consultas y las respuestas del asistente. El proveedor de inteligencia artificial, los destinatarios concretos, sus condiciones, la ubicación del tratamiento y las posibles transferencias internacionales deben documentarse antes de aprobar esta política.</p>
            <p className="mt-4">Si se solicita la ubicación y se concede permiso en el navegador, se utiliza para mostrar lugares cercanos y orientar rutas. Al abrir indicaciones en Google Maps, el enlace puede incluir esa ubicación. Los mapas cargan imágenes de OpenStreetMap.</p>
            <p className="mt-4">También deben revisarse las conexiones a servicios de mapas, fuentes e imágenes y los datos técnicos que reciben al cargar la web. Los enlaces a Google Maps y redes sociales conducen a servicios con sus propias políticas de privacidad.</p>
            <p className="mt-4">La información sobre cookies y otros almacenamientos del navegador está pendiente de revisión. Este borrador no afirma que la web esté libre de cookies o seguimiento.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Base jurídica y conservación</h2>
            <p>Las responsables deben determinar y documentar la base jurídica de cada tratamiento: revisión y publicación de aportaciones, respuesta a consultas, uso del asistente y gestión de cuentas. La mera lectura de esta página no constituye consentimiento.</p>
            <p className="mt-4">Todavía no se han establecido ni aprobado plazos de conservación para aportaciones, fotografías, consultas y cuentas. Antes de publicar la versión definitiva deben fijarse los plazos o criterios de conservación, así como el procedimiento de eliminación y el tratamiento de copias y registros.</p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Solicitudes sobre datos personales</h2>
            <p>Podéis escribir al correo de contacto para solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad de vuestros datos, cuando corresponda. Identificad la aportación o consulta afectada, sin enviar de entrada documentos de identidad ni otros datos sensibles.</p>
            <p className="mt-4">También podéis presentar una reclamación ante la <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer" className="text-terracota-600 underline underline-offset-4">Agencia Española de Protección de Datos</a>.</p>
          </section>
        </article>
      </div>
    </div>
  );
}