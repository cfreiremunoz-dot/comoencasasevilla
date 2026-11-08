import { Link } from '@/lib/router-compat';

const summaries = {
  community: 'El nombre y el contenido podrán verse públicamente si se aprueba la aportación. No incluyas datos personales de terceros.',
  chat: 'Las preguntas se envían a un servicio de IA y el historial se guarda en tu navegador. No incluyas información sensible.',
  handoff: 'Al enviar, el equipo recibe tu correo, el nombre opcional y un extracto de esta conversación para atender la consulta.',
  account: 'El correo y la contraseña se utilizan para gestionar tu cuenta y el acceso.',
};

export function PrivacyNotice({ context }: { context: keyof typeof summaries }) {
  return (
    <p className="text-xs leading-relaxed text-tinta-600">
      {summaries[context]}{' '}
      <Link to="/privacidad" className="text-terracota-600 underline underline-offset-2">Política de privacidad (borrador)</Link>.
    </p>
  );
}