import { useEffect, useRef, useState } from 'react';
import { Users, X } from 'lucide-react';

interface Props {
    owners: string[];
    onAdd: (name: string) => void;
    onRemove: (name: string) => void;
}

export default function ManageTeam({ owners, onAdd, onRemove }: Props) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

    const commit = () => {
        const name = draft.trim();
        if (name && !owners.includes(name)) onAdd(name);
        setDraft('');
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition ${open ? 'border-primary/40 bg-muted text-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
            >
                <Users className="h-4 w-4" />
                Manage team
            </button>

            {open && (
                <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-card p-4 shadow-2xl">
                    <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Team members</div>
                    <ul className="space-y-1">
                        {owners.map((o) => (
                            <li key={o} className="group flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted/30">
                                <span className="text-sm">{o}</span>
                                <button
                                    onClick={() => onRemove(o)}
                                    className="text-muted-foreground/40 opacity-0 transition hover:text-destructive group-hover:opacity-100"
                                    title={`Remove ${o}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex gap-1.5 border-t border-border pt-3">
                        <input
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setOpen(false); }}
                            placeholder="Add person…"
                            className="min-w-0 flex-1 rounded-md border border-border bg-card px-2 py-1 text-xs focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                        <button
                            onClick={commit}
                            className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
