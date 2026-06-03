import { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Search, ArrowUp, ArrowDown, Apple, Smartphone } from 'lucide-react';

import { patchRow, saveSetting } from './api';
import {
    DEFAULT_OWNERS,
    compareString,
} from './constants';
import type { Row, Ticket, ToastData, SortState, DateRangeState, BuildUpdate } from './types';

import { DashboardHeader } from './components/DashboardHeader';
import { AppCard }          from './components/AppCard';
import { AppDetailsModal }  from './components/AppDetailsModal';
import ManageTeam           from './components/ManageTeam';
import VersionBadge         from './components/VersionBadge';
import DateRangeFilter      from './components/DateRangeFilter';
import Toast                from './components/Toast';

const SORT_OPTIONS = [
    { value: '',       label: 'Event Date' },
    { value: 'cbaApp', label: 'App Name' },
    { value: 'owner',  label: 'Owner' },
];

export default function App() {
    const [data, setData]               = useState<Row[]>([]);
    const [loading, setLoading]         = useState(true);
    const [owners, setOwners]           = useState<string[]>(DEFAULT_OWNERS);
    const [iosVersion, setIosVersion]   = useState('7.10056');
    const [androidVersion, setAndroidVersion] = useState('7.10056');
    const [search, setSearch]           = useState('');
    const [dateRange, setDateRange]     = useState<DateRangeState>({ from: '', to: '' });
    const [sortBy, setSortBy]           = useState<SortState>({ column: null, direction: 'asc' });
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [toast, setToast]             = useState<ToastData | null>(null);
    const toastTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

    const selectedRow = selectedRowId !== null ? data.find((r) => r.id === selectedRowId) ?? null : null;

    useEffect(() => {
        Promise.all([
            fetch('/api/rows').then((r) => r.json()) as Promise<Row[]>,
            fetch('/api/settings').then((r) => r.json()) as Promise<Record<string, string>>,
        ]).then(([rows, settings]) => {
            setData(rows);
            if (settings.ios_version)     setIosVersion(settings.ios_version);
            if (settings.android_version) setAndroidVersion(settings.android_version);
            if (settings.owners)          setOwners(JSON.parse(settings.owners) as string[]);
        }).catch((err: unknown) => {
            console.error('Failed to load data:', err);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    // --- Owners ---
    const persistOwners = (next: string[]) => {
        setOwners(next);
        saveSetting('owners', JSON.stringify(next));
    };
    const addOwner    = (name: string) => { if (!owners.includes(name)) persistOwners([...owners, name]); };
    const removeOwner = (name: string) => {
        persistOwners(owners.filter((o) => o !== name));
        data.filter((r) => r.owner === name).forEach((r) => updateOwner(r.id, null));
    };

    // --- Row mutations ---
    const updateOwner = (rowId: number, newOwner: string | null) => {
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, owner: newOwner } : r)));
        patchRow(rowId, { owner: newOwner });
    };

    const updateStatus = (rowId: number, platform: string, newStatus: string | null) => {
        const key = platform === 'iOS' ? 'ios' : 'android';
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, [key]: newStatus } : r)));
        patchRow(rowId, { [key]: newStatus });
    };

    const updateTickets = (rowId: number, newTickets: Ticket[]) => {
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, tickets: newTickets } : r)));
        patchRow(rowId, { tickets: JSON.stringify(newTickets) });
    };

    const showToast = (title: string, message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ title, message });
        toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, 3500);
    };

    const updateBuild = (rowId: number, platform: string, { url, status, label }: BuildUpdate) => {
        const urlKey    = platform === 'ios' ? 'ios_build_url'    : 'android_build_url';
        const statusKey = platform === 'ios' ? 'ios_build_status' : 'android_build_status';
        const labelKey  = platform === 'ios' ? 'ios_build_label'  : 'android_build_label';
        const patch: Record<string, string | undefined> = {};
        if (url    !== undefined) patch[urlKey]    = url;
        if (status !== undefined) patch[statusKey] = status;
        if (label  !== undefined) patch[labelKey]  = label;
        setData((prev) => prev.map((r) => r.id === rowId ? { ...r, ...patch } : r));
        if (Object.keys(patch).length) patchRow(rowId, patch);
        if (label) showToast('Build triggered', `${label} was started.`);
    };

    // --- Derived data ---
    const eventDates = useMemo(
        () => [...new Set(data.map((d) => d.eventDate))].sort(),
        [data]
    );

    const filtered = useMemo(() => {
        return data.filter((d) => {
            if (search) {
                const q = search.toLowerCase();
                const hay = `${d.cbaApp} ${d.appleDev ?? ''} ${d.googleDev ?? ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
                return true;
            }
            if (dateRange.from && d.eventDate < dateRange.from) return false;
            if (dateRange.to   && d.eventDate > dateRange.to)   return false;
            return true;
        });
    }, [data, search, dateRange]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        if (!sortBy.column) {
            arr.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
            return arr;
        }
        const dir = sortBy.direction === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            let cmp = 0;
            switch (sortBy.column) {
                case 'cbaApp':
                    cmp = a.cbaApp.localeCompare(b.cbaApp);
                    break;
                case 'owner':
                    cmp = compareString(a.owner, b.owner);
                    break;
            }
            if (cmp === 0) cmp = a.eventDate.localeCompare(b.eventDate);
            return cmp * dir;
        });
        return arr;
    }, [filtered, sortBy]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
            Loading…
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            {/* Sticky toolbar */}
            <div className="sticky top-[73px] z-20 border-b border-border bg-background/85 backdrop-blur">
                <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-3">
                    <DateRangeFilter
                        from={dateRange.from}
                        to={dateRange.to}
                        onChange={setDateRange}
                        eventDates={eventDates}
                    />

                    <div className="relative min-w-[220px] max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => {
                                const q = e.target.value;
                                setSearch(q);
                                if (q && (dateRange.from || dateRange.to)) {
                                    const hasOutsider = data.some((d) => {
                                        const hay = `${d.cbaApp} ${d.appleDev ?? ''} ${d.googleDev ?? ''}`.toLowerCase();
                                        if (!hay.includes(q.toLowerCase())) return false;
                                        return (dateRange.from && d.eventDate < dateRange.from) || (dateRange.to && d.eventDate > dateRange.to);
                                    });
                                    if (hasOutsider) setDateRange({ from: '', to: '' });
                                }
                            }}
                            placeholder="Search by app name or developer account…"
                            className="w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm placeholder-muted-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-1.5">
                        <select
                            value={sortBy.column ?? ''}
                            onChange={(e) => setSortBy({ column: e.target.value || null, direction: 'asc' })}
                            className="rounded-md border border-border bg-card px-2 py-2 text-sm text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setSortBy((prev) => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                            className="rounded-md border border-border bg-card p-2 text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                            title={sortBy.direction === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortBy.direction === 'asc'
                                ? <ArrowUp className="h-4 w-4" />
                                : <ArrowDown className="h-4 w-4" />
                            }
                        </button>
                    </div>

                    <ManageTeam owners={owners} onAdd={addOwner} onRemove={removeOwner} />

                    {/* Version badges */}
                    <div className="flex items-center gap-3 border-l border-border pl-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Apple className="h-3 w-3" />
                            <VersionBadge version={iosVersion} onSave={(v) => { setIosVersion(v); saveSetting('ios_version', v); }} />
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Smartphone className="h-3 w-3" />
                            <VersionBadge version={androidVersion} onSave={(v) => { setAndroidVersion(v); saveSetting('android_version', v); }} />
                        </span>
                    </div>

                    <div className="ml-auto text-xs tabular-nums text-muted-foreground">
                        <span className="font-semibold text-foreground">{sorted.length}</span> / {data.length}
                    </div>
                </div>
            </div>

            {/* Card grid */}
            <main className="container mx-auto px-4 py-6">
                {sorted.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        No matches. Adjust your search or filters.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sorted.map((row) => (
                            <AppCard
                                key={row.id}
                                row={row}
                                owners={owners}
                                onClick={() => setSelectedRowId(row.id)}
                                onOwnerChange={(o) => updateOwner(row.id, o)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {selectedRow && (
                <AppDetailsModal
                    row={selectedRow}
                    owners={owners}
                    open
                    onClose={() => setSelectedRowId(null)}
                    onOwnerChange={(o) => updateOwner(selectedRow.id, o)}
                    onStatusChange={(platform, s) => updateStatus(selectedRow.id, platform, s)}
                    onTicketsChange={(t) => updateTickets(selectedRow.id, t)}
                    onBuildChange={(platform, u) => updateBuild(selectedRow.id, platform, u)}
                />
            )}

            <AnimatePresence>
                {toast && <Toast key="toast" toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}
