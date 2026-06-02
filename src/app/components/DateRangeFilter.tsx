import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import type { DateRangeState } from '../types';

interface Props {
    from: string;
    to: string;
    onChange: (range: DateRangeState) => void;
    eventDates: string[];
}

export default function DateRangeFilter({ from, to, onChange, eventDates }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const hasFilter = from || to;
    const label = !hasFilter
        ? 'All dates'
        : `${from ? new Date(from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '…'} → ${to ? new Date(to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '…'}`;

    const minDate = eventDates[0];
    const maxDate = eventDates[eventDates.length - 1];

    const setPreset = (f: string, t: string) => onChange({ from: f, to: t });

    const thisWeek = () => {
        const today = new Date();
        const start = today.toISOString().slice(0, 10);
        const end = new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10);
        setPreset(start, end);
    };

    const nextWeek = () => {
        const today = new Date();
        const start = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
        const end = new Date(today.getTime() + 13 * 86400000).toISOString().slice(0, 10);
        setPreset(start, end);
    };

    return (
        <div className="relative" ref={ref}>
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen((v) => !v)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
                className={`inline-flex w-[260px] cursor-pointer select-none items-center gap-2 rounded-md border bg-card py-2 pl-3 pr-3 text-sm transition ${hasFilter ? 'border-primary/40 text-foreground' : 'border-border text-muted-foreground'} hover:border-primary/30`}
            >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left font-medium">{label}</span>
                {hasFilter && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange({ from: '', to: '' }); }}
                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                        aria-label="Clear date filter"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 opacity-60 transition ${open ? 'rotate-180' : ''}`} />
            </div>

            {open && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[340px] rounded-xl border border-border bg-card p-4 shadow-2xl">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Event date range</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs text-muted-foreground">From</span>
                            <input
                                type="date"
                                value={from}
                                min={minDate}
                                max={to || maxDate}
                                onChange={(e) => onChange({ from: e.target.value, to })}
                                className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs text-muted-foreground">To</span>
                            <input
                                type="date"
                                value={to}
                                min={from || minDate}
                                max={maxDate}
                                onChange={(e) => onChange({ from, to: e.target.value })}
                                className="mt-1 w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                            />
                        </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                        <button onClick={thisWeek} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground">This week</button>
                        <button onClick={nextWeek} className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground">Next week</button>
                        <button onClick={() => { setPreset('', ''); setOpen(false); }} className="ml-auto rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">Clear</button>
                    </div>
                </div>
            )}
        </div>
    );
}
