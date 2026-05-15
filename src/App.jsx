import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    RefreshCw,
    ExternalLink,
    Apple,
    Smartphone,
    CircleCheck,
    Clock,
    Eye,
    Ban,
    Minus,
    X,
    Calendar,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    RotateCcw,
} from 'lucide-react';

const OWNERS = ['Krystyna', 'Marina', 'Ilia'];

// Status options users can choose in the inline dropdown.
// Order matches the natural workflow: not built → in progress → in review → updated → license issue.
const STATUS_OPTIONS = [
    { value: '', label: 'Not built' },
    { value: 'In progress', label: 'In progress' },
    { value: 'In review', label: 'In review' },
    { value: 'Updated', label: 'Updated' },
    { value: 'License issue/no access to acc', label: 'License issue' },
];

// Bizzabo URL builders — adjust to actual domain in production.
const accountUrl = (accountId) => `https://accounts.bizzabo.com/${accountId}`;
const eventUrl   = (accountId, eventId) => `https://accounts.bizzabo.com/${accountId}/events/${eventId}`;


// Compute the current store version that a real App Store Connect / Play
// Developer API call would return. In production, replace with real data.
const storeVersionFor = (status, hasDev, version) => {
    if (!hasDev) return null;
    if (status === 'Updated') return version;
    if (status === 'License issue/no access to acc') return '7.0098';
    if (!status) return null;
    return '7.10042';
};

const STATUS_CONFIG = {
    'Updated': {
        label: 'Updated',
        icon: CircleCheck,
        classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        priority: 1,
    },
    'In review': {
        label: 'In review',
        icon: Eye,
        classes: 'bg-amber-50 text-amber-800 ring-amber-600/20',
        priority: 2,
    },
    'In progress': {
        label: 'In progress',
        icon: Clock,
        classes: 'bg-sky-50 text-sky-700 ring-sky-600/20',
        priority: 3,
    },
    'License issue/no access to acc': {
        label: 'License issue',
        icon: Ban,
        classes: 'bg-rose-50 text-rose-700 ring-rose-600/20',
        priority: 4,
    },
};

const NULL_STATUS = {
    label: 'Not built',
    icon: Minus,
    classes: 'bg-stone-100 text-stone-600 ring-stone-300/60',
    priority: 5,
};

const NO_DEV_PRIORITY = 6;

const CELL_BG = {
    'Updated':                       'bg-emerald-50/60',
    'In review':                     'bg-amber-50/70',
    'In progress':                   'bg-sky-50/70',
    'License issue/no access to acc':'bg-rose-50/70',
};

const cellBg = (status, hasDev) =>
    hasDev && status ? (CELL_BG[status] || '') : '';

const OWNER_COLORS = {
    Krystyna: 'bg-violet-100 text-violet-800 ring-violet-300/50',
    Marina: 'bg-teal-100 text-teal-800 ring-teal-300/50',
    Ilia: 'bg-orange-100 text-orange-800 ring-orange-300/50',
};

const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.toLocaleString('en-US', { month: 'short' });
    const eMonth = e.toLocaleString('en-US', { month: 'short' });
    if (start === end) return `${sMonth} ${s.getDate()}`;
    if (sMonth === eMonth) return `${sMonth} ${s.getDate()}–${e.getDate()}`;
    return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}`;
};

// Inline-editable status: styled wrapper around a native <select>.
// Visually identical to a status badge but with a chevron and a click target.
const StatusSelect = ({ status, onChange }) => {
    const cfg = status ? STATUS_CONFIG[status] || NULL_STATUS : NULL_STATUS;
    const Icon = cfg.icon;
    return (
        <label
            className={`group relative inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition hover:ring-stone-900/40 ${cfg.classes}`}
        >
            <Icon className="h-3 w-3" strokeWidth={2.25} />
            {cfg.label}
            <ChevronDown className="h-3 w-3 opacity-50 transition group-hover:opacity-100" />
            <select
                value={status || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Change status"
            >
                {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
};

// Inline-editable owner: styled wrapper around a native <select>.
const OwnerSelect = ({ value, onChange }) => {
    const cls = value
        ? OWNER_COLORS[value] || 'bg-stone-100 text-stone-700 ring-stone-300/50'
        : 'bg-white text-stone-500 ring-stone-300/60';
    const initials = value ? value.slice(0, 2).toUpperCase() : '·';
    return (
        <label className={`group relative inline-flex cursor-pointer items-center gap-2 rounded-full px-1 py-1 pr-2.5 ring-1 ring-inset transition hover:ring-stone-900/40 ${cls}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${value ? 'bg-white/60' : 'bg-stone-100'}`}>
                {initials}
            </span>
            <span className="text-xs font-medium">{value || 'Unassigned'}</span>
            <ChevronDown className="h-3 w-3 opacity-50 transition group-hover:opacity-100" />
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className="absolute inset-0 cursor-pointer opacity-0"
            >
                <option value="">Unassigned</option>
                {OWNERS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </label>
    );
};

const TicketLinks = ({ tickets, onTicketsChange }) => {
    const [inputVal, setInputVal] = useState('');
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

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
        onTicketsChange([...(tickets || []), { id, title: label, url }]);
        setInputVal('');
        setEditing(false);
    };

    const removeTicket = (ticketId) => {
        onTicketsChange((tickets || []).filter((t) => t.id !== ticketId));
    };

    return (
        <div className="flex flex-col gap-1.5">
            {(tickets || []).map((t) => (
                <div key={t.id} className="group inline-flex max-w-[360px] items-start gap-1.5">
                    <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-w-0 items-start gap-1.5 rounded-md text-xs text-stone-700 hover:text-stone-900"
                        title={t.url}
                    >
                        <span className="mt-0.5 shrink-0 rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                            {t.title}
                        </span>
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-40 group-hover:opacity-90" />
                    </a>
                    <button
                        onClick={() => removeTicket(t.id)}
                        className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition"
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
                    className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                />
            ) : (
                <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition"
                >
                    <span className="text-base leading-none">+</span> Add link
                </button>
            )}
        </div>
    );
};

const VersionBadge = ({ version, onSave }) => {
    const [draft, setDraft] = useState(version);

    useEffect(() => { setDraft(version); }, [version]);

    const commit = () => {
        const v = draft.trim();
        if (v && v !== version) onSave(v);
        else setDraft(version);
    };

    return (
        <span className="inline-flex items-center">
            <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">v</span>
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                    if (e.key === 'Escape') { setDraft(version); e.target.blur(); }
                }}
                className="w-16 rounded border border-stone-300/50 bg-transparent px-1 py-px text-[11px] font-medium tracking-wider text-stone-500 transition-all focus:border-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                title="Click to edit version"
            />
        </span>
    );
};

const IOS_BUILD_TYPES = [
    { value: 'regular', label: 'Regular Build' },
    { value: 'noCert',  label: 'No certificate build' },
];

const ANDROID_BUILD_TYPES = [
    { value: 'appBundle',  label: 'App Bundle Build' },
    { value: 'apk',        label: 'Apk Build' },
    { value: 'cert',       label: 'Certificate Build' },
    { value: 'screenshot', label: 'Screenshot Upload Build' },
];

// Per-platform action block: dev account + store version + status + build type picker + CircleCI Build button.
// When dev account is missing: shows "Not configured", "No status", and disables controls.
const PlatformCell = ({ icon: Icon, label, devAccount, status, onStatusChange, onBuild, buildTypes, version }) => {
    const [buildType, setBuildType] = useState('');
    const hasDev = Boolean(devAccount);
    const storeVersion = storeVersionFor(status, hasDev, version);
    const disabledTitle = `${label} developer account required`;
    const selectedBuild = buildTypes.find((b) => b.value === buildType);

    return (
        <div className="space-y-2">
            <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" strokeWidth={2} />
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
                        {label} dev account
                    </div>
                    <div
                        className={`truncate text-xs ${hasDev ? 'text-stone-700' : 'italic text-stone-400'}`}
                        title={devAccount || 'No developer account on file'}
                    >
                        {devAccount || 'Not configured'}
                    </div>
                    {hasDev && (
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-stone-500">
                            <span className="text-stone-400">Store version</span>
                            <span className="font-mono font-medium text-stone-700">
                                {storeVersion ? `v${storeVersion}` : '—'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {hasDev ? (
                <StatusSelect status={status} onChange={onStatusChange} />
            ) : (
                <span className="inline-flex items-center gap-1 text-xs italic text-stone-400">
                    <Minus className="h-3 w-3" />
                    No status
                </span>
            )}

            <div className="space-y-2 pt-3">
                <label className={`group relative inline-flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition ${selectedBuild ? 'bg-white text-stone-700 ring-stone-400' : 'bg-white text-stone-400 ring-stone-300/60 hover:ring-stone-400'}`}>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-50 transition group-hover:opacity-100" />
                    <span className="truncate">{selectedBuild ? selectedBuild.label : 'Select build type'}</span>
                    <select
                        value={buildType}
                        onChange={(e) => setBuildType(e.target.value)}
                        disabled={!hasDev}
                        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                        aria-label="Select build type"
                    >
                        <option value="" disabled hidden>Select build type</option>
                        {buildTypes.map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                    </select>
                </label>

                <button
                    onClick={() => onBuild(selectedBuild.label)}
                    disabled={!hasDev || !buildType}
                    title={!hasDev ? disabledTitle : !buildType ? 'Select a build type first' : `Start ${selectedBuild.label}`}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset transition ${
                        hasDev && buildType
                            ? 'bg-stone-900 text-white ring-stone-900 hover:bg-stone-700'
                            : 'cursor-not-allowed bg-stone-100 text-stone-400 ring-stone-200'
                    }`}
                >
                    CircleCI Build
                </button>
            </div>
        </div>
    );
};

// Sortable column header.
const SortableTh = ({ children, column, sortBy, onSort, style, align = 'left' }) => {
    const isActive = sortBy.column === column;
    const Icon = !isActive ? ArrowUpDown : sortBy.direction === 'asc' ? ArrowUp : ArrowDown;
    return (
        <th className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : ''}`} style={style}>
            <button
                onClick={() => onSort(column)}
                className={`group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider transition ${isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'}`}
            >
                {children}
                <Icon
                    className={`h-3 w-3 transition ${isActive ? 'opacity-100' : 'opacity-30 group-hover:opacity-70'}`}
                    strokeWidth={2.5}
                />
            </button>
        </th>
    );
};

// Date range picker with calendar dropdown.
const DateRangeFilter = ({ from, to, onChange, eventDates }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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

    const setPreset = (f, t) => onChange({ from: f, to: t });

    const thisWeek = () => {
        const today = new Date('2026-05-04'); // demo "today"
        const start = today.toISOString().slice(0, 10);
        const end = new Date(today.getTime() + 6 * 86400000).toISOString().slice(0, 10);
        setPreset(start, end);
    };

    const nextWeek = () => {
        const today = new Date('2026-05-04');
        const start = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);
        const end = new Date(today.getTime() + 13 * 86400000).toISOString().slice(0, 10);
        setPreset(start, end);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex w-[260px] items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm transition ${hasFilter ? 'border-stone-900 text-stone-900' : 'border-stone-300 text-stone-700'} hover:border-stone-900`}
            >
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left font-medium">{label}</span>
                {hasFilter && (
                    <span
                        onClick={(e) => { e.stopPropagation(); onChange({ from: '', to: '' }); }}
                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-200 text-stone-700 hover:bg-stone-300"
                    >
                        <X className="h-3 w-3" />
                    </span>
                )}
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 opacity-60 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[340px] rounded-xl border border-stone-200 bg-white p-4 shadow-2xl">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                        Event date range
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-xs text-stone-600">From</span>
                            <input
                                type="date"
                                value={from}
                                min={minDate}
                                max={to || maxDate}
                                onChange={(e) => onChange({ from: e.target.value, to })}
                                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                            />
                        </label>
                        <label className="block">
                            <span className="text-xs text-stone-600">To</span>
                            <input
                                type="date"
                                value={to}
                                min={from || minDate}
                                max={maxDate}
                                onChange={(e) => onChange({ from, to: e.target.value })}
                                className="mt-1 w-full rounded-md border border-stone-300 px-2 py-1.5 text-sm outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                            />
                        </label>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-100 pt-3">
                        <button
                            onClick={thisWeek}
                            className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-900 hover:text-white"
                        >
                            This week
                        </button>
                        <button
                            onClick={nextWeek}
                            className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-900 hover:text-white"
                        >
                            Next week
                        </button>
                        <button
                            onClick={() => setPreset(minDate, maxDate)}
                            className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-900 hover:text-white"
                        >
                            All
                        </button>
                        <button
                            onClick={() => { setPreset('', ''); setOpen(false); }}
                            className="ml-auto rounded-md px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-900"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 shadow-xl">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900">
                <CircleCheck className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 text-sm">
                <div className="font-medium text-stone-900">{toast.title}</div>
                <div className="text-stone-600">{toast.message}</div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

const StatCard = ({ label, value, hint, tone = 'stone' }) => {
    const accent = {
        stone: 'text-stone-900',
        emerald: 'text-emerald-700',
        sky: 'text-sky-700',
        rose: 'text-rose-700',
    }[tone];
    return (
        <div className="bg-white px-5 py-4">
            <div className="text-[11px] font-medium uppercase tracking-wider text-stone-500">{label}</div>
            <div className={`mt-1 font-serif text-3xl leading-none tracking-tight ${accent}`}>{value}</div>
            <div className="mt-1 text-xs text-stone-500">{hint}</div>
        </div>
    );
};

// Sort comparators.
const compareString = (a, b) => (a || 'zzz').toLowerCase().localeCompare((b || 'zzz').toLowerCase());

const statusPriority = (status, devAccount) => {
    if (!devAccount) return NO_DEV_PRIORITY;
    if (!status) return NULL_STATUS.priority;
    return STATUS_CONFIG[status]?.priority ?? NULL_STATUS.priority;
};

export default function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [iosVersion, setIosVersion] = useState('7.10056');
    const [androidVersion, setAndroidVersion] = useState('7.10056');
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [sortBy, setSortBy] = useState({ column: null, direction: 'asc' });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/rows').then((r) => r.json()),
            fetch('/api/settings').then((r) => r.json()),
        ]).then(([rows, settings]) => {
            setData(rows);
            if (settings.ios_version) setIosVersion(settings.ios_version);
            if (settings.android_version) setAndroidVersion(settings.android_version);
            setLoading(false);
        });
    }, []);

    const saveVersion = (key, value) => {
        fetch(`/api/settings/${key}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
        });
    };

    const showToast = (title, message) => {
        setToast({ title, message });
        setTimeout(() => setToast(null), 3500);
    };

    const patchRow = (rowId, fields) => {
        fetch(`/api/rows/${rowId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fields),
        });
    };

    const updateOwner = (rowId, newOwner) => {
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, owner: newOwner } : r)));
        patchRow(rowId, { owner: newOwner });
    };

    const updateStatus = (rowId, platform, newStatus) => {
        const key = platform === 'iOS' ? 'ios' : 'android';
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, [key]: newStatus } : r)));
        patchRow(rowId, { [key]: newStatus });
    };

    const updateTickets = (rowId, newTickets) => {
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, tickets: newTickets } : r)));
        patchRow(rowId, { tickets: JSON.stringify(newTickets) });
    };

    const handleBuild = (_row, _platform, buildTypeLabel) => {
        showToast('Build started', `The ${buildTypeLabel} was started.`);
    };

    const handleSort = (column) => {
        setSortBy((prev) =>
            prev.column === column
                ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
                : { column, direction: 'asc' }
        );
    };

    const resetSort = () => setSortBy({ column: null, direction: 'asc' });

    const eventDates = useMemo(
        () => [...new Set(data.map((d) => d.eventDate))].sort(),
        [data]
    );

    const filtered = useMemo(() => {
        return data.filter((d) => {
            if (search) {
                const q = search.toLowerCase();
                const hay = `${d.eventName} ${d.accountName} ${d.whiteLabel} ${d.owner || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
                // search bypasses date filter — range was already reset in onChange if needed
                return true;
            }
            if (dateRange.from && d.eventDate < dateRange.from) return false;
            if (dateRange.to && d.eventDate > dateRange.to) return false;
            return true;
        });
    }, [data, search, dateRange]);

    // Stats reflect the *currently filtered* events, not all data.
    const stats = useMemo(() => {
        let updated = 0, inProgress = 0, issues = 0, notBuilt = 0;
        filtered.forEach((d) => {
            [['ios', d.appleDev], ['android', d.googleDev]].forEach(([key, dev]) => {
                // Skip platforms with no dev account — they don't have a real status.
                if (!dev) return;
                const s = d[key];
                if (s === 'Updated') updated++;
                else if (s === 'In progress' || s === 'In review') inProgress++;
                else if (s && s.startsWith('License')) issues++;
                else if (!s) notBuilt++;
            });
        });
        return { updated, inProgress, issues, notBuilt, total: filtered.length };
    }, [filtered]);

    const isFiltered = Boolean(dateRange.from || dateRange.to || search);

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
                case 'eventName':
                case 'accountName':
                case 'whiteLabel':
                case 'owner':
                case 'groupId':
                    cmp = compareString(a[sortBy.column], b[sortBy.column]);
                    break;
                case 'ios':
                    cmp = statusPriority(a.ios, a.appleDev) - statusPriority(b.ios, b.appleDev);
                    break;
                case 'android':
                    cmp = statusPriority(a.android, a.googleDev) - statusPriority(b.android, b.googleDev);
                    break;
                case 'tickets':
                    cmp = (a.tickets?.length || 0) - (b.tickets?.length || 0);
                    break;
                default:
                    cmp = 0;
            }
            // Tiebreaker: keep chronological order stable.
            if (cmp === 0) cmp = a.eventDate.localeCompare(b.eventDate);
            return cmp * dir;
        });
        return arr;
    }, [filtered, sortBy]);

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-500 text-sm">
            Loading…
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900" style={{ fontFeatureSettings: '"cv11", "ss01"' }}>
            {/* Header */}
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto max-w-[1700px] px-8 py-6">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Custom Branded App Dashboard
                            </div>
                            <h1 className="mt-2 font-serif text-[34px] leading-tight tracking-tight text-stone-900">
                                CBA Events
                            </h1>
                            <p className="mt-1 text-sm text-stone-600">
                                ...
                            </p>
                        </div>
                        <button
                            onClick={() => showToast('Refresh queued', 'Pulling latest from BigQuery, App Store Connect, and Play Console')}
                            className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Sync data
                        </button>
                    </div>

                </div>
            </header>

            {/* Toolbar */}
            <div className="sticky top-0 z-20 border-b border-stone-200 bg-stone-50/85 backdrop-blur">
                <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-3 px-8 py-3">
                    {/* Date range — primary filter */}
                    <DateRangeFilter
                        from={dateRange.from}
                        to={dateRange.to}
                        onChange={setDateRange}
                        eventDates={eventDates}
                    />

                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            value={search}
                            onChange={(e) => {
                                const q = e.target.value;
                                setSearch(q);
                                if (q && (dateRange.from || dateRange.to)) {
                                    const hasOutsider = data.some((d) => {
                                        const hay = `${d.eventName} ${d.accountName} ${d.whiteLabel} ${d.owner || ''}`.toLowerCase();
                                        if (!hay.includes(q.toLowerCase())) return false;
                                        return (dateRange.from && d.eventDate < dateRange.from) || (dateRange.to && d.eventDate > dateRange.to);
                                    });
                                    if (hasOutsider) setDateRange({ from: '', to: '' });
                                }
                            }}
                            placeholder="Search events, accounts, white-label apps…"
                            className="w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-stone-400 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                        {sortBy.column && (
                            <button
                                onClick={resetSort}
                                className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-stone-700"
                                title="Reset to chronological order"
                            >
                                <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
                                Default sort order
                            </button>
                        )}
                        <div className="text-xs tabular-nums text-stone-500">
                            Showing <span className="font-semibold text-stone-900">{sorted.length}</span> / {data.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <main className="mx-auto max-w-[1700px] px-4 py-6 sm:px-8">
                <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
                        <table className="w-full min-w-[1100px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-stone-200 bg-stone-50/60">
                                    <SortableTh column="eventName" sortBy={sortBy} onSort={handleSort}>Event</SortableTh>
                                    <SortableTh column="accountName" sortBy={sortBy} onSort={handleSort}>Bizzabo Account</SortableTh>
                                    <SortableTh column="whiteLabel" sortBy={sortBy} onSort={handleSort}>White Label App</SortableTh>
                                    <SortableTh column="owner" sortBy={sortBy} onSort={handleSort}>Owner</SortableTh>
                                    <SortableTh column="groupId" sortBy={sortBy} onSort={handleSort}>Group ID</SortableTh>
                                    <th className="px-4 py-3" style={{ minWidth: 260 }}>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                                            <Apple className="h-3 w-3" /> iOS ·
                                            <VersionBadge version={iosVersion} onSave={(v) => { setIosVersion(v); saveVersion('ios_version', v); }} />
                                        </span>
                                    </th>
                                    <th className="px-4 py-3" style={{ minWidth: 260 }}>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                                            <Smartphone className="h-3 w-3" /> Android ·
                                            <VersionBadge version={androidVersion} onSave={(v) => { setAndroidVersion(v); saveVersion('android_version', v); }} />
                                        </span>
                                    </th>
                                    <th className="px-4 py-3" style={{ minWidth: 320 }}>
                                        <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Tickets</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((row, idx) => (
                                    <tr
                                        key={row.id}
                                        className={`group border-b border-stone-100 last:border-0 transition hover:bg-stone-50/70 ${idx % 2 === 1 ? 'bg-stone-50/30' : ''}`}
                                    >
                                        {/* Event */}
                                        <td className="px-4 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-stone-200 bg-white text-center">
                                                    <span className="text-[9px] font-medium uppercase tracking-wider text-stone-500">
                                                        {new Date(row.eventDate).toLocaleString('en-US', { month: 'short' })}
                                                    </span>
                                                    <span className="font-serif text-base leading-none text-stone-900">
                                                        {new Date(row.eventDate).getDate()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 max-w-[260px]">
                                                    <a
                                                        href={eventUrl(row.accountId, row.eventId)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block truncate text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-900"
                                                        title={row.eventName}
                                                    >
                                                        {row.eventName}
                                                    </a>
                                                    <div className="mt-0.5 text-xs text-stone-500">
                                                        {formatDateRange(row.eventDate, row.endDate)} · Event ID {row.eventId} · Account ID {row.accountId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Bizzabo Account */}
                                        <td className="px-4 py-4 align-top">
                                            <a
                                                href={accountUrl(row.accountId)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group inline-flex max-w-[200px] items-center gap-1 truncate text-sm text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-stone-900 hover:decoration-stone-900"
                                                title={`${row.accountName} · Account ID ${row.accountId}`}
                                            >
                                                <span className="truncate">{row.accountName}</span>
                                                <ExternalLink className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100" />
                                            </a>
                                        </td>

                                        {/* White Label App */}
                                        <td className="px-4 py-4 align-top">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-900/5 px-2 py-0.5 font-mono text-[11px] text-stone-700 ring-1 ring-inset ring-stone-900/10">
                                                {row.whiteLabel}
                                            </span>
                                        </td>

                                        {/* Owner */}
                                        <td className="px-4 py-4 align-top">
                                            <OwnerSelect
                                                value={row.owner}
                                                onChange={(o) => updateOwner(row.id, o)}
                                            />
                                        </td>

                                        {/* Group ID */}
                                        <td className="px-4 py-4 align-top">
                                            <span className="font-mono text-xs text-stone-600">
                                                {row.groupId || <span className="text-stone-300">—</span>}
                                            </span>
                                        </td>

                                        {/* iOS */}
                                        <td className={`border-l border-stone-100 px-4 py-4 align-top transition-colors ${cellBg(row.ios, row.appleDev)}`}>
                                            <PlatformCell
                                                icon={Apple}
                                                label="iOS"
                                                devAccount={row.appleDev}
                                                status={row.ios}
                                                onStatusChange={(s) => updateStatus(row.id, 'iOS', s)}
                                                onBuild={(buildTypeLabel) => handleBuild(row, 'iOS', buildTypeLabel)}
                                                buildTypes={IOS_BUILD_TYPES}
                                                version={iosVersion}
                                            />
                                        </td>

                                        {/* Android */}
                                        <td className={`border-l border-stone-100 px-4 py-4 align-top transition-colors ${cellBg(row.android, row.googleDev)}`}>
                                            <PlatformCell
                                                icon={Smartphone}
                                                label="Android"
                                                devAccount={row.googleDev}
                                                status={row.android}
                                                onStatusChange={(s) => updateStatus(row.id, 'Android', s)}
                                                onBuild={(buildTypeLabel) => handleBuild(row, 'Android', buildTypeLabel)}
                                                buildTypes={ANDROID_BUILD_TYPES}
                                                version={androidVersion}
                                            />
                                        </td>

                                        {/* Tickets */}
                                        <td className="border-l border-stone-100 px-4 py-4 align-top">
                                            <TicketLinks
                                                tickets={row.tickets}
                                                onTicketsChange={(t) => updateTickets(row.id, t)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {sorted.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center text-sm text-stone-500">
                                            No matches. Adjust your search or filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                </div>

                <p className="mt-4 text-xs text-stone-500">
                    ____    
            </p>
            </main>

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}