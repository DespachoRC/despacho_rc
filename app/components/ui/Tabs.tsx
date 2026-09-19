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
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1">
            {tabs.map((tab) => {
                const isActive = tab.value === activeTab;
                const label = tab.count !== undefined
                    ? `${tab.label} (${tab.count})`
                    : tab.label;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onChange(tab.value)}
                        className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer ${
                            isActive
                                ? "bg-white shadow-sm text-navy-950"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
