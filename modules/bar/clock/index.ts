import Gdk from 'gi://Gdk?version=3.0';
import GLib from 'gi://GLib';
import { openMenu } from '../utils.js';
import options from 'options';
import { DateTime } from 'types/@girs/glib-2.0/glib-2.0.cjs';
import { BarBoxChild } from 'lib/types/bar.js';
import Button from 'types/widgets/button.js';
import { Attribute, Child } from 'lib/types/widget.js';
import { runAsyncCommand, throttledScrollHandler } from 'customModules/utils.js';

const { format, icon, showIcon, showTime, rightClick, middleClick, scrollUp, scrollDown } = options.bar.clock;
const { style } = options.theme.bar.buttons;

// Set a constant for the time icon you want to use
const TIME_ICON = ' 󰃭'; // Replace with your desired time icon

const date = Variable(GLib.DateTime.new_now_local(), {
    poll: [1000, (): DateTime => GLib.DateTime.new_now_local()],
});
const time = Utils.derive([date, format], (c, f) => c.format(f) || '');

// Format date separately from time
const formattedDate = Utils.derive([date], (c) => c.format('%H:%M') || ''); // Adjust format as needed

const Clock = (): BarBoxChild => {
    const clockDate = Widget.Label({
        class_name: 'bar-button-label clock-date',
        label: formattedDate.bind(), // Use formatted date
    });

    const clockTime = Widget.Label({
        class_name: 'bar-button-label clock-time',
        label: time.bind(), // Use time
    });

    const clockIcon = Widget.Label({
        label: icon.bind('value'),
        class_name: 'bar-button-icon clock txt-icon bar',
    });

    const timeIconLabel = Widget.Label({
        label: TIME_ICON, // Use the constant time icon
        class_name: 'bar-button-icon clock txt-icon bar',
    });

    return {
        component: Widget.Box({
            className: Utils.merge(
                [style.bind('value'), showIcon.bind('value'), showTime.bind('value')],
                (btnStyle, shwIcn, shwLbl) => {
                    const styleMap = {
                        default: 'style1',
                        split: 'style2',
                        wave: 'style3',
                        wave2: 'style3',
                    };

                    return `clock-container ${styleMap[btnStyle]} ${!shwLbl ? 'no-label' : ''} ${!shwIcn ? 'no-icon' : ''}`;
                },
            ),
            children: Utils.merge([showIcon.bind('value'), showTime.bind('value')], (shIcn, shTm) => {
                const children = [];
                if (shIcn) {
                    children.push(clockIcon, clockDate);
                }
                if (shTm) {
                    children.push(timeIconLabel, clockTime); // Add date, time icon, and time label
                }
                return children;
            }),
        }),
        isVisible: true,
        boxClass: 'clock',
        props: {
            setup: (self: Button<Child, Attribute>): void => {
                self.hook(options.bar.scrollSpeed, () => {
                    const throttledHandler = throttledScrollHandler(options.bar.scrollSpeed.value);

                    self.on_secondary_click = (clicked: Button<Child, Attribute>, event: Gdk.Event): void => {
                        runAsyncCommand(rightClick.value, { clicked, event });
                    };
                    self.on_middle_click = (clicked: Button<Child, Attribute>, event: Gdk.Event): void => {
                        runAsyncCommand(middleClick.value, { clicked, event });
                    };
                    self.on_scroll_up = (clicked: Button<Child, Attribute>, event: Gdk.Event): void => {
                        throttledHandler(scrollUp.value, { clicked, event });
                    };
                    self.on_scroll_down = (clicked: Button<Child, Attribute>, event: Gdk.Event): void => {
                        throttledHandler(scrollDown.value, { clicked, event });
                    };
                });
            },
            on_primary_click: (clicked: Button<Child, Attribute>, event: Gdk.Event): void => {
                openMenu(clicked, event, 'calendarmenu');
            },
        },
    };
};

export { Clock };
