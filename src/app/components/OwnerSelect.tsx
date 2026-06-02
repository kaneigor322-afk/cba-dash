import { Root, Trigger, Portal, Content, Viewport, Item, ItemText, ItemIndicator } from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { ownerColor } from '../constants';
import { cn } from './ui/utils';

const UNASSIGNED = '__unassigned__';

interface Props {
    value: string | null;
    onChange: (owner: string | null) => void;
    owners: string[];
}

export default function OwnerSelect({ value, onChange, owners }: Props) {
    const cls = ownerColor(value, owners);

    return (
        <Root
            value={value ?? UNASSIGNED}
            onValueChange={(v) => onChange(v === UNASSIGNED ? null : v)}
        >
            <Trigger
                className={cn(
                    'group inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-90 focus:outline-none',
                    cls
                )}
            >
                <span>{value ?? 'Unassigned'}</span>
                <ChevronDown className="h-3 w-3 opacity-50 transition group-hover:opacity-100 shrink-0" />
            </Trigger>

            <Portal>
                <Content
                    position="popper"
                    sideOffset={5}
                    className="z-50 min-w-[160px] overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl data-[state=open]:animate-slide-down"
                >
                    <Viewport className="p-1">
                        <Item
                            value={UNASSIGNED}
                            className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-stone-50"
                        >
                            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-stone-500 ring-1 ring-inset ring-stone-300/60">
                                <ItemText>Unassigned</ItemText>
                            </span>
                            <ItemIndicator className="ml-auto">
                                <Check className="h-3 w-3 text-stone-400" />
                            </ItemIndicator>
                        </Item>

                        {owners.map((o) => {
                            const oCls = ownerColor(o, owners);
                            return (
                                <Item
                                    key={o}
                                    value={o}
                                    className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 outline-none data-[highlighted]:bg-stone-50"
                                >
                                    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', oCls)}>
                                        <ItemText>{o}</ItemText>
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
