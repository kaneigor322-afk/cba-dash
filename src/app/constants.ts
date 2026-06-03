import { CircleCheck, Clock, Eye, Ban, Minus, type LucideIcon } from 'lucide-react';
import type { BuildType } from './types';

export const DEFAULT_OWNERS: string[] = ['Krystyna', 'Marina', 'Ilia'];

export interface StatusOption {
    value: string;
    label: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
    { value: '',                               label: 'Not built' },
    { value: 'In progress',                    label: 'In progress' },
    { value: 'In review',                      label: 'In review' },
    { value: 'Updated',                        label: 'Updated' },
    { value: 'License issue/no access to acc', label: 'License issue' },
];

export interface StatusConfigEntry {
    label: string;
    icon: LucideIcon;
    classes: string;
    priority: number;
}

export const STATUS_CONFIG: Record<string, StatusConfigEntry> = {
    'Updated': {
        label: 'Updated',
        icon: CircleCheck,
        classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        priority: 1,
    },
    'In review': {
        label: 'In review',
        icon: Eye,
        classes: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20',
        priority: 2,
    },
    'In progress': {
        label: 'In progress',
        icon: Clock,
        classes: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
        priority: 3,
    },
    'License issue/no access to acc': {
        label: 'License issue',
        icon: Ban,
        classes: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
        priority: 4,
    },
};

export const NULL_STATUS: StatusConfigEntry = {
    label: 'Not built',
    icon: Minus,
    classes: 'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-300/60',
    priority: 5,
};

const OWNER_PALETTE: string[] = [
    'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300/50',
    'bg-teal-100 text-teal-800 ring-1 ring-inset ring-teal-300/50',
    'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-300/50',
    'bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-300/50',
    'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300/50',
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-300/50',
    'bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-300/50',
    'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-300/50',
];

export const ownerColor = (name: string | null, owners: string[]): string => {
    if (!name) return 'bg-white text-stone-500 ring-1 ring-inset ring-stone-300/60';
    const idx = owners.indexOf(name);
    return OWNER_PALETTE[(idx >= 0 ? idx : 0) % OWNER_PALETTE.length];
};

export const IOS_BUILD_TYPES: BuildType[] = [
    { value: 'regular',    label: 'Regular Build' },
    { value: 'cert',       label: 'Local Build' },
    { value: 'screenshot', label: 'Screenshot Upload Build' },
];

export const ANDROID_BUILD_TYPES: BuildType[] = [
    { value: 'appBundle', label: 'AAB Build' },
    { value: 'apk',       label: 'APK Build' },
];

export const mobileAppUrl = (accountId: number): string =>
    `https://accounts.bizzabo.com/${accountId}/mobileApp/storeSettings`;

export const formatDateRange = (start: string, end: string): string => {
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.toLocaleString('en-US', { month: 'short' });
    const eMonth = e.toLocaleString('en-US', { month: 'short' });
    if (start === end) return `${sMonth} ${s.getDate()}`;
    if (sMonth === eMonth) return `${sMonth} ${s.getDate()}–${e.getDate()}`;
    return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}`;
};

export const compareString = (a: string | null, b: string | null): number =>
    (a ?? 'zzz').toLowerCase().localeCompare((b ?? 'zzz').toLowerCase());

