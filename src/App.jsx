import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Search,
    RefreshCw,
    Hammer,
    Upload,
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

// Sample data extracted from the spreadsheet.
// Production sources:
//   - row data: BigQuery
//   - ios/android status & store version: App Store Connect API & Google Play Developer API
//   - tickets: Zendesk API (returns title + url + id)
const INITIAL_DATA = [
    { id: 1, eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 721214, accountId: 196489, eventName: 'AGILE 2026', accountName: 'Axxess Account', whiteLabel: 'AGILE 2025', appleDev: 'Axxess Consult, Inc,', googleDev: 'Axxess Technology Solutions, Inc', owner: 'Krystyna', ios: 'Updated', android: 'In review', tickets: [] },
    { id: 2, eventDate: '2026-05-04', endDate: '2026-05-07', eventId: 753372, accountId: 197638, eventName: '2026 RGA Gateway Conference', accountName: 'Reinsurance Group of America Account', whiteLabel: 'RGA USIL Events', appleDev: 'RGA Reinsurance Company', googleDev: null, owner: 'Krystyna', ios: 'In progress', android: 'In progress', tickets: [] },
    { id: 3, eventDate: '2026-05-04', endDate: '2026-05-06', eventId: 721214, accountId: 196489, eventName: 'AGILE 2026', accountName: 'Axxess Account', whiteLabel: 'AGILE 2026', appleDev: 'Axxess Consult, Inc,', googleDev: 'Axxess Technology Solutions, Inc', owner: null, ios: null, android: null, tickets: [] },
    { id: 4, eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 741261, accountId: 139690, eventName: 'The 2026 Payments Canada SUMMIT', accountName: 'Payments Canada Account', whiteLabel: 'Payments Canada', appleDev: 'Canadian Payments Association', googleDev: 'Payments Canada', owner: 'Marina', ios: 'Updated', android: 'Updated', tickets: [] },
    { id: 5, eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 780602, accountId: 211691, eventName: 'insideMOBILITY® New York City', accountName: 'Graebel', whiteLabel: 'Graebel Events', appleDev: null, googleDev: null, owner: 'Krystyna', ios: 'Updated', android: 'Updated', tickets: [] },
    { id: 6, eventDate: '2026-05-05', endDate: '2026-05-07', eventId: 768573, accountId: 149250, eventName: 'THE Europe Universities Summit 2026', accountName: 'Times Higher Education', whiteLabel: 'Times Higher Education Events', appleDev: 'THEWUR Limited', googleDev: 'THEWUI', owner: 'Ilia', ios: 'In review', android: 'Updated', tickets: [] },
    { id: 7, eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 739802, accountId: 203918, eventName: 'Music Biz 2026', accountName: 'Music Business Association Account', whiteLabel: 'Home', appleDev: null, googleDev: null, owner: 'Ilia', ios: 'License issue/no access to acc', android: 'License issue/no access to acc', tickets: [{ id: 215088, title: 'License renewal blocking dual-platform build', url: 'https://bizzabo.zendesk.com/agent/tickets/215088' }] },
    { id: 8, eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 744896, accountId: 147330, eventName: 'OPTIMIZE 2026', accountName: 'Aspen Technology', whiteLabel: 'AspenTech Events', appleDev: 'Aspen Technology, Inc', googleDev: 'Aspen Technology Inc', owner: 'Marina', ios: 'Updated', android: 'Updated', tickets: [{ id: 214847, title: 'App Store metadata review feedback', url: 'https://bizzabo.zendesk.com/agent/tickets/214847' }] },
    { id: 9, eventDate: '2026-05-11', endDate: '2026-05-14', eventId: 726101, accountId: 192903, eventName: 'Excelerate Finance 2026', accountName: 'Vena Solutions Account', whiteLabel: 'Excelerate Finance 2026', appleDev: null, googleDev: null, owner: 'Ilia', ios: null, android: null, tickets: [] },
    { id: 10, eventDate: '2026-05-12', endDate: '2026-05-13', eventId: 830109, accountId: 174763, eventName: '2026 Infrastructure Investor Summit', accountName: 'CBRE Group Account', whiteLabel: 'CBRE Events', appleDev: 'CBRE, Inc.', googleDev: 'CBRE', owner: null, ios: null, android: null, tickets: [] },
    { id: 11, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 741515, accountId: 149250, eventName: 'THE Latin America Universities Summit 2026', accountName: 'Times Higher Education', whiteLabel: 'Times Higher Education Events', appleDev: 'THEWUR Limited', googleDev: 'THEWUI', owner: 'Krystyna', ios: null, android: null, tickets: [] },
    { id: 12, eventDate: '2026-05-12', endDate: '2026-05-14', eventId: 750278, accountId: 188219, eventName: 'EDGE 2026', accountName: 'Trellance, Inc. Account', whiteLabel: 'EDGE', appleDev: 'Trellance Cooperative Holdings, Inc.', googleDev: 'Trellance, Inc.', owner: 'Krystyna', ios: null, android: null, tickets: [] },
    { id: 13, eventDate: '2026-05-12', endDate: '2026-05-16', eventId: 792241, accountId: 206865, eventName: 'UMB Sapphire Club', accountName: 'UMB', whiteLabel: 'UMB Events', appleDev: null, googleDev: null, owner: null, ios: null, android: null, tickets: [] },
    { id: 14, eventDate: '2026-05-12', endDate: '2026-05-12', eventId: 827977, accountId: 198667, eventName: 'Pastoral Development - May', accountName: 'NAD Adventist', whiteLabel: 'NAD Events', appleDev: 'North American division corporation of seventh day adventists', googleDev: 'North American Division of SDA', owner: null, ios: null, android: null, tickets: [] },
    { id: 15, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 856512, accountId: 201142, eventName: 'Imagine Dallas 2026', accountName: 'Automation Anywhere Inc. Account', whiteLabel: 'Automation Anywhere', appleDev: null, googleDev: null, owner: null, ios: null, android: null, tickets: [] },
    { id: 16, eventDate: '2026-05-18', endDate: '2026-05-20', eventId: 807979, accountId: 211905, eventName: 'Insider Summit 2026', accountName: 'ShipHero', whiteLabel: 'ShipHero Events', appleDev: null, googleDev: null, owner: null, ios: null, android: null, tickets: [] },
    { id: 17, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 820653, accountId: 166875, eventName: 'Business Line Critical Power, Sales, Service & execution Meeting', accountName: 'ABB Electrification Account', whiteLabel: 'ABB Electrification Events', appleDev: 'NJ PRODUCTION OU', googleDev: 'NJ Production', owner: null, ios: null, android: null, tickets: [] },
    { id: 18, eventDate: '2026-05-19', endDate: '2026-05-21', eventId: 765945, accountId: 197329, eventName: 'CamundaCon Amsterdam 2026', accountName: 'Camunda Account', whiteLabel: 'Camunda', appleDev: null, googleDev: null, owner: null, ios: null, android: null, tickets: [] },
    { id: 19, eventDate: '2026-05-20', endDate: '2026-05-21', eventId: 778287, accountId: 207554, eventName: 'Click. EMEA 2026', accountName: 'Booking.com', whiteLabel: 'Home', appleDev: null, googleDev: null, owner: 'Marina', ios: 'In review', android: 'In review', tickets: [] },
    { id: 20, eventDate: '2026-05-21', endDate: '2026-05-21', eventId: 798994, accountId: 208229, eventName: 'TORONTO LEADERSHIP SUMMIT', accountName: 'CDO Magazine', whiteLabel: 'CDO Magazine Events', appleDev: null, googleDev: null, owner: null, ios: null, android: null, tickets: [] },
    { id: 21, eventDate: '2026-05-22', endDate: '2026-05-23', eventId: 825035, accountId: 169960, eventName: 'GA and Forum of the Young Shareholders', accountName: 'Puratos Account', whiteLabel: 'Home', appleDev: 'Puratos NV', googleDev: 'Puratos NV', owner: null, ios: null, android: null, tickets: [] },
    { id: 22, eventDate: '2026-05-27', endDate: '2026-05-27', eventId: 764678, accountId: 200871, eventName: 'Unfold 2026', accountName: 'Mews Systems Ltd. Account', whiteLabel: 'Mews Events', appleDev: 'Mews Systems', googleDev: 'Mews Systems', owner: null, ios: null, android: null, tickets: [] },
    { id: 23, eventDate: '2026-05-30', endDate: '2026-05-31', eventId: 842322, accountId: 198667, eventName: 'Together As One Convocation - San Antonio', accountName: 'NAD Adventist', whiteLabel: 'NAD Events', appleDev: 'North American division corporation of seventh day adventists', googleDev: 'North American Division of SDA', owner: null, ios: null, android: null, tickets: [] },
];

const APP_VERSION = '7.10056';
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
const storeVersionFor = (status, hasDev) => {
    if (!hasDev) return null;
    if (status === 'Updated') return APP_VERSION;
    if (status === 'License issue/no access to acc') return '7.0098';
    if (!status) return null; // never built
    return '7.10042'; // older version still live while new one is in flight
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

const TicketLinks = ({ tickets }) => {
    if (!tickets || tickets.length === 0) return <span className="text-stone-300">—</span>;
    return (
        <div className="flex flex-col gap-1.5">
            {tickets.map((t) => (
                <a
                    key={t.id}
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex max-w-[360px] items-start gap-1.5 rounded-md text-xs text-stone-700 hover:text-stone-900"
                    title={t.url}
                >
                    <span className="mt-0.5 shrink-0 rounded bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                        #{t.id}
                    </span>
                    <span className="line-clamp-2 font-medium underline decoration-stone-300 underline-offset-2 group-hover:decoration-stone-900">
                        {t.title}
                    </span>
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-40 group-hover:opacity-90" />
                </a>
            ))}
        </div>
    );
};

// Per-platform action block: dev account + store version + status + Build + Update buttons.
// When dev account is missing: shows "Not configured", "No status", and disables BOTH buttons.
const PlatformCell = ({ icon: Icon, label, devAccount, status, onStatusChange, onBuild, onUpdate }) => {
    const hasDev = Boolean(devAccount);
    const storeVersion = storeVersionFor(status, hasDev);
    const disabledTitle = `${label} developer account required`;

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

            <div className="flex flex-wrap gap-1.5">
                <button
                    onClick={onBuild}
                    disabled={!hasDev}
                    title={hasDev ? `Run a fresh build for ${label}` : disabledTitle}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset transition ${hasDev
                            ? 'bg-white text-stone-800 ring-stone-300 hover:bg-stone-50 hover:ring-stone-400'
                            : 'cursor-not-allowed bg-stone-100 text-stone-400 ring-stone-200'
                        }`}
                >
                    <Hammer className="h-3 w-3" strokeWidth={2.5} />
                    Build
                </button>
                <button
                    onClick={onUpdate}
                    disabled={!hasDev}
                    title={hasDev ? `Push v${APP_VERSION} to ${label} store` : disabledTitle}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ring-1 ring-inset transition ${hasDev
                            ? 'bg-stone-900 text-white ring-stone-900 hover:bg-stone-700'
                            : 'cursor-not-allowed bg-stone-100 text-stone-400 ring-stone-200'
                        }`}
                >
                    <Upload className="h-3 w-3" strokeWidth={2.5} />
                    Update store
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
    const [data, setData] = useState(INITIAL_DATA);
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [sortBy, setSortBy] = useState({ column: null, direction: 'asc' });
    const [toast, setToast] = useState(null);

    const showToast = (title, message) => {
        setToast({ title, message });
        setTimeout(() => setToast(null), 3500);
    };

    const updateOwner = (rowId, newOwner) => {
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, owner: newOwner } : r)));
    };

    const updateStatus = (rowId, platform, newStatus) => {
        const key = platform === 'iOS' ? 'ios' : 'android';
        setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, [key]: newStatus } : r)));
    };

    const handleBuild = (row, platform) => {
        showToast('Build queued', `${platform} build started for ${row.whiteLabel}`);
    };

    const handleUpdate = (row, platform) => {
        const store = platform === 'iOS' ? 'App Store' : 'Play Store';
        showToast('Store update queued', `Submitting ${row.whiteLabel} v${APP_VERSION} to ${store}`);
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

    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900" style={{ fontFeatureSettings: '"cv11", "ss01"' }}>
            {/* Header */}
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto max-w-[1700px] px-8 py-6">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                White Label Build Console
                            </div>
                            <h1 className="mt-2 font-serif text-[34px] leading-tight tracking-tight text-stone-900">
                                Event apps · v{APP_VERSION}
                            </h1>
                            <p className="mt-1 text-sm text-stone-600">
                                Track build & store-release status.
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

                    {/* Stats strip — reflects current filter */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                            {isFiltered ? (
                                <>
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-900" />
                                    Showing for current filter
                                </>
                            ) : (
                                <>
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-300" />
                                    Showing all events
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-stone-200 sm:grid-cols-5">
                            <StatCard label="Events" value={stats.total} hint="in selection" />
                            <StatCard label="Updated" value={stats.updated} hint="builds live" tone="emerald" />
                            <StatCard label="In flight" value={stats.inProgress} hint="building / reviewing" tone="sky" />
                            <StatCard label="Issues" value={stats.issues} hint="needs attention" tone="rose" />
                            <StatCard label="Not started" value={stats.notBuilt} hint="awaiting build" tone="stone" />
                        </div>
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
                            onChange={(e) => setSearch(e.target.value)}
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
                                    <th className="px-4 py-3" style={{ minWidth: 260 }}>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                                            <Apple className="h-3 w-3" /> iOS · v{APP_VERSION}
                                        </span>
                                    </th>
                                    <th className="px-4 py-3" style={{ minWidth: 260 }}>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                                            <Smartphone className="h-3 w-3" /> Android · v{APP_VERSION}
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

                                        {/* iOS */}
                                        <td className="border-l border-stone-100 px-4 py-4 align-top">
                                            <PlatformCell
                                                icon={Apple}
                                                label="iOS"
                                                devAccount={row.appleDev}
                                                status={row.ios}
                                                onStatusChange={(s) => updateStatus(row.id, 'iOS', s)}
                                                onBuild={() => handleBuild(row, 'iOS')}
                                                onUpdate={() => handleUpdate(row, 'iOS')}
                                            />
                                        </td>

                                        {/* Android */}
                                        <td className="border-l border-stone-100 px-4 py-4 align-top">
                                            <PlatformCell
                                                icon={Smartphone}
                                                label="Android"
                                                devAccount={row.googleDev}
                                                status={row.android}
                                                onStatusChange={(s) => updateStatus(row.id, 'Android', s)}
                                                onBuild={() => handleBuild(row, 'Android')}
                                                onUpdate={() => handleUpdate(row, 'Android')}
                                            />
                                        </td>

                                        {/* Tickets */}
                                        <td className="border-l border-stone-100 px-4 py-4 align-top">
                                            <TicketLinks tickets={row.tickets} />
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
                    Test    
            </p>
            </main>

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    );
}