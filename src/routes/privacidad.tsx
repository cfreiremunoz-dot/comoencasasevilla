import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad · ComoEnCasa Sevilla" },
      {
        name: "description",
        content:
          "Borrador de información sobre los datos personales en Comunidad, el asistente y el acceso de ComoEnCasa.",
      },
      { property: "og:title", content: "Política de privacidad · ComoEnCasa Sevilla" },
      {
        property: "og:description",
        content:
          "Información de privacidad de ComoEnCasa pendiente de revisión por sus responsables.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
            Borrador pendiente de revisión y aprobación final. El equipo confirma que las bases
            jurídicas están aprobadas, pero aún falta identificar en esta política cuál corresponde
            a cada finalidad. También están pendientes los plazos de conservación, la verificación
            de las condiciones y ubicaciones de algunos proveedores y la revisión final de cookies y
            almacenamiento. No es una política definitiva ni acredita por sí sola el cumplimiento de
            la normativa.
          </p>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Responsables y contacto
            </h2>
            <p>
              ComoEnCasa es responsabilidad de Celia Freire Muñoz, Inés García Martín, Valle Ruda
              Vera, Andrea Márquez Becerra, Mariam Ahmed Díaz y Candela Portillo Fernández, no de la
              universidad.
            </p>
            <p className="mt-4">
              Para consultas de privacidad o solicitudes sobre vuestros datos:{" "}
              <a
                href="mailto:comoencasasev@gmail.com"
                className="break-all text-terracota-600 underline underline-offset-4"
              >
                comoencasasev@gmail.com
              </a>
              .
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">Comunidad</h2>
            <p>
              El formulario permite enviar reseñas, rutas y lugares favoritos, con un nombre de
              autor opcional, texto, valoración y fotografía opcional. También permite incluir
              dirección, teléfono, web e Instagram del establecimiento.
            </p>
            <p className="mt-4">
              Las aportaciones se envían para su revisión y posible publicación. Si se publican, el
              nombre aportado y el contenido podrán ser vistos por los visitantes. Las fotografías
              se guardan en Supabase Storage; la migración del repositorio revisada define lectura
              pública de objetos del espacio de fotos y la aplicación genera enlaces firmados con
              validez de 24 horas. No incluyáis teléfonos o direcciones personales, datos sensibles
              ni imágenes de otras personas sin una autorización adecuada.
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Asistente de inteligencia artificial
            </h2>
            <p>
              Las preguntas y el contexto de la conversación se envían a Vercel AI Gateway para
              generar respuestas con modelos de terceros. La configuración actual prioriza modelos
              cuyo precio publicado en el catálogo de Gateway es de 0 USD por entrada y salida; aun
              así, pueden existir límites de uso y la disponibilidad o el precio pueden cambiar. Los
              proveedores externos pueden conservar los mensajes y utilizarlos para mejorar sus
              modelos, según sus propias condiciones. Para consultas generales se buscan en
              Wikipedia en español términos extraídos de la última pregunta; no se envía allí el
              historial completo. El historial se guarda en el almacenamiento local del navegador y
              puede eliminarse desde la lista de conversaciones. La eliminación local no borra los
              posibles registros conservados por los proveedores externos.
            </p>
            <p className="mt-4">
              No escribáis contraseñas, documentos de identidad, datos bancarios ni información
              sensible.
            </p>
            <p className="mt-4">
              Si se solicita hablar con una persona y se envía el formulario, se remiten al equipo
              el correo electrónico, el nombre opcional, la consulta y un extracto de la
              conversación para atenderla.
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Acceso a las cuentas
            </h2>
            <p>
              El acceso y la creación de cuentas solicitan un correo electrónico y una contraseña
              para gestionar la identificación y el acceso al panel. La autenticación se gestiona
              con Supabase Auth y la sesión se conserva en el almacenamiento local del navegador.
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Servicios externos y almacenamiento
            </h2>
            <p>
              El inventario técnico observado en el código incluye Vercel para alojar la aplicación;
              Supabase para autenticación, base de datos y almacenamiento de aportaciones y
              consultas; Vercel AI Gateway y los proveedores de modelos de IA para generar
              respuestas; y la API pública de Wikipedia en español para consultas externas
              generales. Antes de aprobar la política deben confirmarse las entidades proveedoras y
              subencargadas, sus condiciones de conservación, las ubicaciones del tratamiento y, si
              procede, las garantías aplicables a transferencias internacionales.
            </p>
            <p className="mt-4">
              Los mapas cargan mosaicos desde OpenStreetMap. Los enlaces de indicaciones abren
              Google Maps y pueden incluir las coordenadas del usuario si ha concedido acceso a su
              ubicación. La geolocalización se solicita desde el navegador y el código de la
              aplicación no guarda esas coordenadas en la base de datos. La web también carga
              fuentes de Google Fonts e imágenes alojadas en Pexels; al solicitarlas, el navegador
              se conecta con esos servicios y les transmite datos técnicos habituales de la
              conexión.
            </p>
            <p className="mt-4">
              El historial del asistente y la sesión de autenticación se guardan en el
              almacenamiento local del navegador. No se encontraron etiquetas de analítica o
              publicidad en el código revisado. Un componente reutilizable contiene una cookie
              técnica llamada <code>sidebar_state</code>, pero no se encontró que ese componente se
              use en las rutas de la aplicación. La configuración añadida desde el alojamiento u
              otras herramientas de despliegue no puede confirmarse desde el repositorio y debe
              revisarse antes de cerrar esta sección.
            </p>
            <p className="mt-4">
              La aplicación no incluye un panel de consentimiento de cookies en el código revisado.
              Queda pendiente confirmar las cookies y demás tecnologías activas en producción, su
              finalidad y si requieren consentimiento.
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Base jurídica y conservación
            </h2>
            <p>
              El equipo confirma que las bases jurídicas han sido aprobadas para los tratamientos
              descritos, pero falta indicar cuál se aplica a cada finalidad: aportaciones y
              publicación de fotos, respuesta a consultas con transcripción, uso del asistente y
              gestión de cuentas. Hasta consignar esa correspondencia, no se publica una base
              concreta como definitiva. La mera lectura de esta página no constituye consentimiento.
            </p>
            <p className="mt-4">
              El equipo confirma que aún no ha aprobado plazos de conservación. Como propuesta para
              revisión interna —no aprobada ni aplicable todavía— se plantean estos criterios:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li>
                Aportaciones y fotos pendientes o rechazadas: conservarlas solo durante la
                moderación y el plazo de revisión que el equipo establezca; después, eliminarlas.
                Las publicadas se revisarían periódicamente y se conservarían mientras sigan siendo
                pertinentes para la guía, con retirada cuando dejen de ser necesarias.
              </li>
              <li>
                Consultas y transcripciones: conservarlas mientras se atiende la solicitud y durante
                un periodo de seguimiento que se defina; después, eliminarlas o anonimizar los datos
                que ya no sean necesarios.
              </li>
              <li>
                Cuentas de administración: conservarlas mientras la persona tenga autorización de
                acceso; revocar el acceso cuando deje de ser necesario y borrar los datos de la
                cuenta cuando ya no exista una finalidad pendiente.
              </li>
              <li>
                Historial del asistente: permanece en el almacenamiento local hasta que la persona
                lo elimina desde la interfaz; actualmente no se configura una caducidad automática.
              </li>
              <li>
                Copias de seguridad y registros técnicos de los proveedores de IA y búsqueda
                externa: fijar los periodos según sus condiciones verificadas y eliminarlos mediante
                sus ciclos de borrado, evitando conservarlos más de lo necesario.
              </li>
            </ul>
            <p className="mt-4">
              Antes de retirar el aviso de borrador, el equipo debe aprobar o modificar estos
              criterios, asignar plazos donde correspondan y confirmar los procedimientos de borrado
              y las condiciones de los proveedores.
            </p>
          </section>
          <section>
            <h2 className="mb-4 font-serif text-2xl font-semibold text-tinta-800">
              Solicitudes sobre datos personales
            </h2>
            <p>
              Podéis escribir al correo de contacto para solicitar acceso, rectificación, supresión,
              oposición, limitación o portabilidad de vuestros datos, cuando corresponda.
              Identificad la aportación o consulta afectada, sin enviar de entrada documentos de
              identidad ni otros datos sensibles.
            </p>
            <p className="mt-4">
              También podéis presentar una reclamación ante la{" "}
              <a
                href="https://www.aepd.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracota-600 underline underline-offset-4"
              >
                Agencia Española de Protección de Datos
              </a>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
