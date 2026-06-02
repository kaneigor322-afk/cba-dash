import * as Dialog from '@radix-ui/react-dialog';
import { X, Apple, Smartphone } from 'lucide-react';
import PlatformCell from './PlatformCell';
import OwnerSelect from './OwnerSelect';
import TicketLinks from './TicketLinks';
import { IOS_BUILD_TYPES, ANDROID_BUILD_TYPES, formatDateRange, mobileAppUrl } from '../constants';
import type { Row, Ticket, BuildUpdate } from '../types';

interface Props {
    row: Row;
    owners: string[];
    open: boolean;
    onClose: () => void;
    onOwnerChange: (owner: string | null) => void;
    onStatusChange: (platform: string, status: string | null) => void;
    onTicketsChange: (tickets: Ticket[]) => void;
    onBuildChange: (platform: string, update: BuildUpdate) => void;
}

export function AppDetailsModal({ row, owners, open, onClose, onOwnerChange, onStatusChange, onTicketsChange, onBuildChange }: Props) {
    return (
        <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
                <Dialog.Content
                    className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card shadow-2xl border border-border focus:outline-none data-[state=open]:animate-modal-in"
                    aria-describedby={undefined}
                >
                    <div className="max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-card flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                            <div>
                                <Dialog.Title asChild>
                                    <a
                                        href={mobileAppUrl(row.accountId)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-base font-semibold hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {row.cbaApp}
                                    </a>
                                </Dialog.Title>
                                <div className="mt-0.5 text-sm text-muted-foreground">
                                    {formatDateRange(row.eventDate, row.endDate)}
                                </div>
                            </div>
                            <Dialog.Close className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground">
                                <X className="h-4 w-4" />
                            </Dialog.Close>
                        </div>

                        <div className="space-y-5 px-6 py-5">
                            {/* Owner */}
                            <div>
                                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Owner</div>
                                <OwnerSelect value={row.owner} onChange={onOwnerChange} owners={owners} />
                            </div>

                            {/* Platform cells */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-border bg-muted/20 p-4">
                                    <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Apple className="h-3 w-3" /> iOS
                                    </div>
                                    <PlatformCell
                                        status={row.ios}
                                        onStatusChange={(s) => onStatusChange('iOS', s)}
                                        buildTypes={IOS_BUILD_TYPES}
                                        buildUrl={row.ios_build_url}
                                        buildStatus={row.ios_build_status}
                                        buildLabel={row.ios_build_label}
                                        onBuildChange={(u) => onBuildChange('ios', u)}
                                        rowId={row.id}
                                        platform="ios"
                                    />
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 p-4">
                                    <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        <Smartphone className="h-3 w-3" /> Android
                                    </div>
                                    <PlatformCell
                                        status={row.android}
                                        onStatusChange={(s) => onStatusChange('Android', s)}
                                        buildTypes={ANDROID_BUILD_TYPES}
                                        buildUrl={row.android_build_url}
                                        buildStatus={row.android_build_status}
                                        buildLabel={row.android_build_label}
                                        onBuildChange={(u) => onBuildChange('android', u)}
                                        rowId={row.id}
                                        platform="android"
                                    />
                                </div>
                            </div>

                            {/* Tickets */}
                            <div>
                                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tickets</div>
                                <TicketLinks tickets={row.tickets} onTicketsChange={onTicketsChange} />
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs">
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Event ID</span>
                                    <span className="font-mono">{row.eventId}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground">Account ID</span>
                                    <span className="font-mono">{row.accountId}</span>
                                </div>
                                {row.groupId && (
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Group ID</span>
                                        <span className="font-mono">{row.groupId}</span>
                                    </div>
                                )}
                                {row.appleDev && (
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Apple Dev</span>
                                        <span className="truncate">{row.appleDev}</span>
                                    </div>
                                )}
                                {row.googleDev && (
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Google Dev</span>
                                        <span className="truncate">{row.googleDev}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
