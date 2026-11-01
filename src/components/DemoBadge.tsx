interface DemoBadgeProps {
  className?: string;
  compact?: boolean;
}

// La web ya está publicada: la etiqueta de demostración se retira.
// Se conserva el componente para que las tarjetas no cambien de estructura.
export function DemoBadge({ className = '', compact = false }: DemoBadgeProps) {
  void className;
  void compact;
  return null;
}
