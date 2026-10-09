import { LuEye, LuShieldAlert } from "react-icons/lu";

interface ReadOnlyBannerProps {
  mensaje?: string;
}

export function ReadOnlyBanner({
  mensaje = "Modo Solo Lectura (Superadmin) — Visualizando registros en tiempo real de todas las organizaciones.",
}: ReadOnlyBannerProps) {
  return (
    <div className="w-full bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl p-3.5 px-4 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-xs animate-in fade-in duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded-lg shrink-0">
          <LuShieldAlert className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold tracking-tight truncate">
          {mensaje}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/40 px-2.5 py-1 rounded-md shrink-0 border border-amber-200/60 dark:border-amber-800/40">
        <LuEye className="w-3.5 h-3.5" />
        <span>Sin edición</span>
      </div>
    </div>
  );
}
