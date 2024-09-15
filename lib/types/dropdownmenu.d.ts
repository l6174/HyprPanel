import { WindowProps } from 'types/widgets/window';
import { GtkWidget, Transition } from './widget';

export type DropdownMenuProps = {
    name: string;
    child: GtkWidget;
    layout?: string;
    transition?: Transition;
    exclusivity?: Exclusivity;
    fixed?: boolean;
} & WindowProps;