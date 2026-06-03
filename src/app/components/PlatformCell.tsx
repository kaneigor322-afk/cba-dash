import { useEffect, useRef, useState } from 'react';
import { Root, Trigger, Portal, Content, Viewport, Item, ItemText, ItemIndicator, Value } from '@radix-ui/react-select';
import { ChevronDown, Check, ExternalLink } from 'lucide-react';
import StatusSelect from './StatusSelect';
import type { BuildType, BuildUpdate } from '../types';

const TERMINAL = new Set(['success', 'fixed', 'failed', 'timedout', 'canceled', 'not_run']);

const STATUS_LABEL: Record<string, string> = {
    triggered: 'Triggered',
    queued:    'Queued',
    scheduled: 'Scheduled',
    running:   'Running',
    success:   'Success',
    fixed:     'Fixed',
    failed:    'Failed',
    timedout:  'Timed out',
    canceled:  'Canceled',
};

interface StatusDotsProps {
    buildStatus: string | null;
}

function StatusDots({ buildStatus }: StatusDotsProps) {
    if (!buildStatus) return null;
    const done    = TERMINAL.has(buildStatus);
    const isGreen = buildStatus === 'success' || buildStatus === 'fixed';

    if (done) {
        const color = isGreen ? 'bg-emerald-500' : 'bg-rose-500';
        return <span className={`h-3 w-3 rounded-full ${color}`} title={STATUS_LABEL[buildStatus]} />;
    }

    return (
        <span className="inline-flex items-center gap-0.5" title={STATUS_LABEL[buildStatus]}>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: '300ms' }} />
        </span>
    );
}

interface Props {
    status: string | null;
    onStatusChange: (status: string | null) => void;
    buildTypes: BuildType[];
    buildUrl: string | null;
    buildStatus: string | null;
    buildLabel: string | null;
    onBuildChange: (update: BuildUpdate) => void;
    rowId: number;
    platform: string;
}

export default function PlatformCell({ status, onStatusChange, buildTypes, buildUrl, buildStatus, buildLabel, onBuildChange, rowId, platform }: Props) {
    const [buildType, setBuildType] = useState('');
    const selectedBuild = buildTypes.find((b) => b.value === buildType);

    const onBuildChangeRef = useRef(onBuildChange);
    useEffect(() => { onBuildChangeRef.current = onBuildChange; }, [onBuildChange]);

    const testTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current); }, []);

    useEffect(() => {
        if (!buildStatus || TERMINAL.has(buildStatus)) return;
        const poll = async () => {
            try {
                const res  = await fetch(`/api/rows/${rowId}/build-status?platform=${platform}`);
                const data = await res.json() as { status?: string };
                if (data.status && data.status !== buildStatus) onBuildChangeRef.current({ status: data.status });
            } catch {}
        };
        const id = setInterval(poll, 30000);
        return () => clearInterval(id);
    }, [buildStatus, rowId, platform]);

    const handleBuildClick = () => {
        if (!selectedBuild) return;
        const url = `https://app.circleci.com/pipelines/github/org/app/job/${Math.floor(Math.random() * 90000) + 10000}`;
        onBuildChange({ url, status: 'triggered', label: selectedBuild.label });

        if (testTimeoutRef.current) clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = setTimeout(() => {
            testTimeoutRef.current = null;
            onBuildChangeRef.current({ status: Math.random() > 0.5 ? 'success' : 'failed' });
        }, 5000);
    };

    const linkText = buildLabel ? `${buildLabel} Job` : 'View Build Job';

    return (
        <div className="space-y-3">
            <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Status</div>
                <StatusSelect status={status} onChange={onStatusChange} />
            </div>

            <div>
                <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Build</div>
                <Root value={buildType || undefined} onValueChange={setBuildType}>
                    <Trigger
                        className={`group inline-flex w-full cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium transition focus:outline-none focus:ring-1 focus:ring-primary/30 ${buildType ? 'bg-card text-foreground' : 'bg-card text-muted-foreground hover:border-primary/30'}`}
                    >
                        <ChevronDown className="h-3 w-3 shrink-0 opacity-50 transition group-hover:opacity-100" />
                        <Value placeholder="Select build type" />
                    </Trigger>
                    <Portal>
                        <Content
                            position="popper"
                            sideOffset={5}
                            className="z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-card shadow-xl"
                        >
                            <Viewport className="p-1">
                                {buildTypes.map((b) => (
                                    <Item
                                        key={b.value}
                                        value={b.value}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-xs text-foreground outline-none data-[highlighted]:bg-muted/50"
                                    >
                                        <ItemText>{b.label}</ItemText>
                                        <ItemIndicator className="ml-auto">
                                            <Check className="h-3 w-3 text-muted-foreground" />
                                        </ItemIndicator>
                                    </Item>
                                ))}
                            </Viewport>
                        </Content>
                    </Portal>
                </Root>

                <button
                    onClick={handleBuildClick}
                    disabled={!buildType}
                    title={!buildType ? 'Select a build type first' : `Start ${selectedBuild?.label}`}
                    className={`mt-1.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                        buildType
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'cursor-not-allowed bg-muted text-muted-foreground'
                    }`}
                >
                    CircleCI Build
                </button>

                {buildUrl && (
                    <div className="mt-3 flex items-center justify-between gap-2">
                        <a
                            href={buildUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-w-0 items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 hover:underline"
                        >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{linkText}</span>
                        </a>
                        <StatusDots buildStatus={buildStatus} />
                    </div>
                )}
            </div>
        </div>
    );
}
