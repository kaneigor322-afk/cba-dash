import { useEffect, useRef, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { Ticket } from '../types';

interface Props {
    tickets: Ticket[];
    onTicketsChange: (tickets: Ticket[]) => void;
}

export default function TicketLinks({ tickets, onTicketsChange }: Props) {
    const [inputVal, setInputVal] = useState('');
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const addTicket = () => {
        const raw = inputVal.trim();
        if (!raw) return;
        const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        const numMatch = url.match(/\/(\d+)\/?$/);
        const id = numMatch ? Number(numMatch[1]) : Date.now();
        const label = numMatch ? `#${numMatch[1]}` : url;
        onTicketsChange([...(tickets ?? []), { id, title: label, url }]);
        setInputVal('');
        setEditing(false);
    };

    const removeTicket = (ticketId: number) => {
        onTicketsChange((tickets ?? []).filter((t) => t.id !== ticketId));
    };

    return (
        <div className="flex flex-col gap-1.5">
            {(tickets ?? []).map((t) => (
                <div key={t.id} className="group inline-flex max-w-[360px] items-start gap-1.5">
                    <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-w-0 items-start gap-1.5 rounded-md text-xs text-foreground hover:text-foreground/80"
                        title={t.url}
                    >
                        <span className="mt-0.5 shrink-0 rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                            {t.title}
                        </span>
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-40 group-hover:opacity-90" />
                    </a>
                    <button
                        onClick={() => removeTicket(t.id)}
                        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                        title="Remove"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
            {editing ? (
                <input
                    ref={inputRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') addTicket();
                        if (e.key === 'Escape') { setEditing(false); setInputVal(''); }
                    }}
                    onBlur={() => { if (!inputVal.trim()) setEditing(false); }}
                    placeholder="Paste URL, Enter to add"
                    className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                />
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                    <span className="text-base leading-none">+</span> Add link
                </button>
            )}
        </div>
    );
}
