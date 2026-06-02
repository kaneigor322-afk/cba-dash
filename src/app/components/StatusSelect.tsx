import { Root, Trigger, Portal, Content, Viewport, Item, ItemText, ItemIndicator } from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { STATUS_CONFIG, STATUS_OPTIONS, NULL_STATUS } from '../constants';
import { cn } from './ui/utils';

const NONE = '__none__';

interface Props {
    status: string | null;
    onChange: (status: string | null) => void;
}

export default function StatusSelect({ status, onChange }: Props) {
    const cfg = status ? (STATUS_CONFIG[status] ?? NULL_STATUS) : NULL_STATUS;
    const Icon = cfg.icon;

    return (
        <Root
            value={status ?? NONE}
            onValueChange={(v) => onChange(v === NONE ? null : v)}
        >
            <Trigger
                className={cn(
                    'group inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition hover:opacity-90 focus:outline-none',
                    cfg.classes
                )}
            >
                <Icon className="h-3 w-3" strokeWidth={2.25} />
                <span>{cfg.label}</span>
                <ChevronDown className="h-3 w-3 opacity-50 transition group-hover:opacity-100" />
            </Trigger>

            <Portal>
                <Content
                    position="popper"
                    sideOffset={5}
                    className="z-50 min-w-[190px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl data-[state=open]:animate-slide-down"
                >
                    <Viewport className="p-1">
                        {STATUS_OPTIONS.map((opt) => {
                            const itemValue = opt.value || NONE;
                            const optCfg = opt.value ? (STATUS_CONFIG[opt.value] ?? NULL_STATUS) : NULL_STATUS;
                            const OptIcon = optCfg.icon;
                            return (
                                <Item
                                    key={itemValue}
                                    value={itemValue}
                                    className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-stone-50"
                                >
                                    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium', optCfg.classes)}>
                                        <OptIcon className="h-3 w-3" strokeWidth={2.25} />
                                        <ItemText>{opt.label}</ItemText>
                                    </span>
                                    <ItemIndicator className="ml-auto">
                                        <Check className="h-3 w-3 text-stone-400" />
                                    </ItemIndicator>
                                </Item>
                            );
                        })}
                    </Viewport>
                </Content>
            </Portal>
        </Root>
    );
}
