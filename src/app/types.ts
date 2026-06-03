export interface Ticket {
    id: number;
    title: string;
    url: string;
}

export interface Row {
    id: number;
    eventDate: string;
    endDate: string;
    eventId: number;
    accountId: number;
    groupId: string | null;
    eventName: string;
    accountName: string;
    cbaApp: string;
    appleDev: string | null;
    googleDev: string | null;
    owner: string | null;
    ios: string | null;
    android: string | null;
    tickets: Ticket[];
    ios_build_url: string | null;
    android_build_url: string | null;
    ios_build_status: string | null;
    android_build_status: string | null;
    ios_build_label: string | null;
    android_build_label: string | null;
}

export interface ToastData {
    title: string;
    message: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
    column: string | null;
    direction: SortDirection;
}

export interface DateRangeState {
    from: string;
    to: string;
}

export interface BuildUpdate {
    url?: string;
    status?: string;
    label?: string;
}

export interface BuildType {
    value: string;
    label: string;
}
