"use client";

import { useState, useEffect, useRef } from "react";
import { LuMessageSquare, LuSend, LuLoader } from "react-icons/lu";
import { useProfile } from "../layout/ProfileContext";

interface Mensaje {
    id: string;
    contenido: string;
    remitente_id: string;
    fecha_envio: string;
    usuarios?: {
        nombre: string;
        apellido_paterno: string;
        roles?: { nombre: string };
    };
}

interface ChatBoxProps {
    titulo: string;
    conversacionId: string | null;
    onStartConversacion?: (primerMensaje: string) => Promise<void>;
}

export function ChatBox({ titulo, conversacionId, onStartConversacion }: ChatBoxProps) {
    const { profile } = useProfile();
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMensajes = async () => {
        if (!conversacionId) return;
        try {
            const res = await fetch(`/api/conversaciones/${conversacionId}/mensajes`);
            const json = await res.json();
            if (json.success) {
                setMensajes(json.data ?? []);
            }
        } catch (error) {
            console.error("Error al obtener mensajes", error);
        }
    };

    useEffect(() => {
        if (conversacionId) {
            setLoading(true);
            fetchMensajes().finally(() => setLoading(false));
            
            // simple polling for new messages every 10s
            const interval = setInterval(() => fetchMensajes(), 10000);
            return () => clearInterval(interval);
        } else {
            setMensajes([]);
        }
    }, [conversacionId]);

    // auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const texto = inputValue.trim();
        if (!texto || sending) return;

        setSending(true);
        
        try {
            if (!conversacionId && onStartConversacion) {
                // si no hay conversacion, delegamos al padre crearla y enviar el mensaje
                await onStartConversacion(texto);
            } else if (conversacionId) {
                const res = await fetch(`/api/conversaciones/${conversacionId}/mensajes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contenido: texto })
                });
                const json = await res.json();
                if (json.success) {
                    setMensajes([...mensajes, json.data]);
                }
            }
            setInputValue("");
        } catch (error) {
            console.error("Error enviando mensaje", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-[350px]">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <LuMessageSquare className="w-5 h-5 text-navy-600" />
                    <span className="font-semibold text-navy-950 text-sm">{titulo}</span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {loading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <LuLoader className="w-5 h-5 text-slate-400 animate-spin" />
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="flex-1 flex justify-center items-center text-sm text-slate-400 italic">
                        {conversacionId ? "No hay mensajes aún. Escribe el primero." : "Aún no tienes un chat iniciado."}
                    </div>
                ) : (
                    mensajes.map((msg) => {
                        const isMe = msg.remitente_id === profile?.id;
                        const timeString = new Date(msg.fecha_envio).toLocaleTimeString("es-MX", {
                            hour: "2-digit", minute: "2-digit", hour12: false
                        });

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col max-w-[85%] gap-1 ${
                                    isMe ? "self-end items-end" : "self-start items-start"
                                }`}
                            >
                                {!isMe && msg.usuarios && (
                                    <span className="text-[10px] text-slate-500 font-medium px-1">
                                        {msg.usuarios.nombre} {msg.usuarios.apellido_paterno}
                                    </span>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                        isMe
                                            ? "bg-navy-700 text-white rounded-tr-none"
                                            : "bg-slate-100 text-slate-800 rounded-tl-none"
                                    }`}
                                >
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.contenido}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 px-1 font-medium">{timeString}</span>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={sending || (!conversacionId && !onStartConversacion)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={sending || !inputValue.trim()}
                    className="bg-navy-700 hover:bg-navy-800 disabled:bg-navy-400 text-white p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                >
                    {sending ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuSend className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}
