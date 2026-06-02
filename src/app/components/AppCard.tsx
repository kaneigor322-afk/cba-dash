import { Apple, Smartphone } from 'lucide-react';
import { formatDateRange, STATUS_CONFIG, NULL_STATUS } from '../constants';
import OwnerSelect from './OwnerSelect';
import type { Row } from '../types';

interface AppCardProps {
    row: Row;
    owners: string[];
    onClick: () => void;
    onOwnerChange: (owner: string | null) => void;
}

export function AppCard({ row, owners, onClick, onOwnerChange }: AppCardProps) {
    const iosCfg     = row.ios     ? (STATUS_CONFIG[row.ios]     ?? NULL_STATUS) : NULL_STATUS;
    const androidCfg = row.android ? (STATUS_CONFIG[row.android] ?? NULL_STATUS) : NULL_STATUS;
    const IosIcon     = iosCfg.icon;
    const AndroidIcon = androidCfg.icon;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => { if (!window.getSelection()?.toString()) onClick(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
            className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-primary/20 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
            {/* Header: event date badge + app name + date range */}
            <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-muted rounded-lg flex flex-col items-center justify-center shrink-0 gap-0.5">
                    <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground leading-none">
                        {new Date(row.eventDate).toLocaleString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-sm font-semibold leading-none">
                        {new Date(row.eventDate).getDate()}
                    </span>
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{row.cbaApp}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateRange(row.eventDate, row.endDate)}</p>
                </div>
            </div>

            {/* Fields */}
            <div className="space-y-2.5 mb-4">
                {row.groupId && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Group ID</span>
                        <span className="font-mono text-xs">{row.groupId}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Event dates</span>
                    <span className="text-xs">{formatDateRange(row.eventDate, row.endDate)}</span>
                </div>

                <div
                    className="flex items-center justify-between text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="text-muted-foreground">Owner</span>
                    <OwnerSelect value={row.owner} onChange={onOwnerChange} owners={owners} />
                </div>

                {row.appleDev && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Apple Dev</span>
                        <span className="text-xs truncate max-w-[160px] text-right">{row.appleDev}</span>
                    </div>
                )}

                {row.googleDev && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Google Dev</span>
                        <span className="text-xs truncate max-w-[160px] text-right">{row.googleDev}</span>
                    </div>
                )}
            </div>

            {/* Build status rows */}
            <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                    <Apple className="size-3.5 text-sky-500 shrink-0" />
                    <span className="text-xs text-muted-foreground w-12">iOS</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${iosCfg.classes}`}>
                        <IosIcon className="size-2.5" strokeWidth={2.25} />
                        {iosCfg.label}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Smartphone className="size-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs text-muted-foreground w-12">Android</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${androidCfg.classes}`}>
                        <AndroidIcon className="size-2.5" strokeWidth={2.25} />
                        {androidCfg.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
