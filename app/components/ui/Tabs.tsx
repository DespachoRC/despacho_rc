"use client";

interface Tab {
    label: string;
    count?: number;
    value: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (value: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
    return (
        <div className={`inline-flex items-center flex-wrap bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-300 dark:border-zinc-700/80 rounded-xl p-1.5 gap-1.5 shadow-xs ${className}`}>
            {tabs.map((tab) => {
                const isActive = tab.value === activeTab;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onChange(tab.value)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer select-none ${
                            isActive
                                ? "bg-navy-900 text-white dark:bg-navy-600 dark:text-white shadow-sm"
                                : "text-slate-700 dark:text-zinc-300 hover:text-navy-950 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-zinc-800"
                        }`}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                                    isActive
                                        ? "bg-navy-800/90 text-white dark:bg-navy-500/90"
                                        : "bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-300/40 dark:border-zinc-700"
                                }`}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
