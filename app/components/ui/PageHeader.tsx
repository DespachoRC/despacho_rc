import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-navy-950">{title}</h1>
                {subtitle && <p className="text-base text-slate-600">{subtitle}</p>}
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
