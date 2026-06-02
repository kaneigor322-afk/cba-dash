import { useEffect, useState } from 'react';

interface Props {
    version: string;
    onSave: (version: string) => void;
}

export default function VersionBadge({ version, onSave }: Props) {
    const [draft, setDraft] = useState(version);

    useEffect(() => { setDraft(version); }, [version]);

    const commit = () => {
        const v = draft.trim();
        if (v && v !== version) onSave(v);
        else setDraft(version);
    };

    return (
        <span className="inline-flex items-center gap-0.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">v</span>
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') { setDraft(version); e.currentTarget.blur(); }
                }}
                className="w-16 rounded border border-border/50 bg-transparent px-1 py-px text-[11px] font-medium tracking-wider text-muted-foreground transition-all focus:border-primary/30 focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary/20"
                title="Click to edit version"
            />
        </span>
    );
}
