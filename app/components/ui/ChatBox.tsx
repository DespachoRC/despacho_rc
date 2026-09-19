"use client";

import { useState } from "react";
import { LuMessageSquare, LuSend } from "react-icons/lu";

interface Message {
    id: string;
    text: string;
    sender: "despacho" | "cliente";
    time: string;
}

interface ChatBoxProps {
    nombreCliente: string;
    initialMessages?: Message[];
}

export function ChatBox({ nombreCliente, initialMessages = [] }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const newMessage: Message = {
            id: String(messages.length + 1),
            text: inputValue,
            sender: "despacho",
            time: timeString,
        };

        setMessages([...messages, newMessage]);
        setInputValue("");
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-[350px]">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                <LuMessageSquare className="w-5 h-5 text-navy-600" />
                <span className="font-semibold text-navy-950 text-sm">
                    Chat con {nombreCliente}
                </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg) => {
                    const isDespacho = msg.sender === "despacho";
                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] gap-1 ${
                                isDespacho ? "self-end items-end" : "self-start items-start"
                            }`}
                        >
                            <div
                                className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    isDespacho
                                        ? "bg-navy-700 text-white rounded-tr-none"
                                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                                }`}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 px-1 font-medium">{msg.time}</span>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex gap-2 bg-slate-50">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                />
                <button
                    type="submit"
                    className="bg-navy-700 hover:bg-navy-800 text-white p-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center shadow-sm"
                >
                    <LuSend className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
