import { LEVEL_LABELS, type Level } from '@/types/api';

export const LEVEL_ORDER: Level[] = [
  'prekinder',
  'kinder',
  'primero_basico',
  'segundo_basico',
  'tercero_basico',
  'cuarto_basico',
  'quinto_basico',
  'sexto_basico',
  'septimo_basico',
  'octavo_basico',
  'primero_medio',
  'segundo_medio',
  'tercero_medio',
  'cuarto_medio',
];

interface LevelMultiSelectProps {
  value: Level[];
  onChange: (levels: Level[]) => void;
  error?: string;
}

export function LevelMultiSelect({ value, onChange, error }: LevelMultiSelectProps) {
  function toggle(level: Level) {
    onChange(value.includes(level) ? value.filter((l) => l !== level) : [...value, level]);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Niveles</label>
      <div className="grid max-h-36 grid-cols-2 gap-1.5 overflow-y-auto rounded-md border p-2 sm:grid-cols-3">
        {LEVEL_ORDER.map((level) => (
          <label key={level} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(level)}
              onChange={() => toggle(level)}
              className="h-4 w-4 rounded border-gray-300"
            />
            {LEVEL_LABELS[level]}
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
