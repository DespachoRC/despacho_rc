'use client';

import { ReactNode, useState, useEffect } from "react";
import { LuSearch, LuInbox } from "react-icons/lu";
import { Input } from "./Input";

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;
    emptyStateMessage?: string;
    keyExtractor: (item: T) => string;
}

export function DataTable<T>({
    data,
    columns,
    isLoading = false,
    searchPlaceholder = "Buscar...",
    onSearch,
    emptyStateMessage = "No hay resultados",
    keyExtractor
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (onSearch) onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, onSearch]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {onSearch && (
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        icon={<LuSearch />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        isLabelNeed={false}
                        className="max-w-md bg-white"
                    />
                </div>
            )}
            
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={`px-6 py-4 ${col.className || ""}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <LuInbox className="w-12 h-12 text-slate-300" />
                                        <p>{emptyStateMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={keyExtractor(item)} className="hover:bg-slate-50 transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`px-6 py-4 whitespace-nowrap ${col.className || ""}`}>
                                            {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : null)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
