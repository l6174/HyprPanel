import { openDropdownMenu } from '../../utils/menu';
import { bind, Variable } from 'astal';
import { onMiddleClick, onPrimaryClick, onScroll, onSecondaryClick } from 'src/lib/shared/eventHandlers';
import { Astal } from 'astal/gtk3';
import { systemTime } from 'src/lib/units/time';
import { BarBoxChild } from 'src/components/bar/types';
import options from 'src/configuration';
import { runAsyncCommand } from '../../utils/input/commandExecutor';
import { throttledScrollHandler } from '../../utils/input/throttle';

const { format, icon, showIcon, showTime, rightClick, middleClick, scrollUp, scrollDown } = options.bar.clock;
const { style } = options.theme.bar.buttons;

const time = Variable.derive([systemTime, format], (c, f) => c.format(f) || '');
const date = Variable.derive([systemTime], (c, f) => c.format('%H:%M') || '');

const Clock = (): BarBoxChild => {
    const clockTime = <label className={'bar-button-label clock bar'} label={bind(time)} />;
    const clockIcon = <label className={'bar-button-icon clock txt-icon bar'} label={bind(icon)} />;
    const calendarIcon = <label className={'bar-button-icon clock txt-icon bar'} label={' 󰃭'} />;
    const calendarDate = <label className={'bar-button-label clock bar'} label={bind(date)} />;

    const componentClassName = Variable.derive(
        [bind(style), bind(showIcon), bind(showTime)],
        (btnStyle, shwIcn, shwLbl) => {
            const styleMap = {
                default: 'style1',
                split: 'style2',
                wave: 'style3',
                wave2: 'style3',
            };
            return `clock-container ${styleMap[btnStyle]} ${!shwLbl ? 'no-label' : ''} ${!shwIcn ? 'no-icon' : ''}`;
        },
    );

    const componentChildren = Variable.derive([bind(showIcon), bind(showTime)], (shIcn, shTm) => {
        if (shIcn && !shTm) {
            return <ClockIcon />;
        } else if (shTm && !shIcn) {
            return <ClockTime />;
        }
        return [clockIcon, calendarDate, calendarIcon, clockTime];
    });

    const component = (
        <box
            className={componentClassName()}
            onDestroy={() => {
                componentClassName.drop();
                componentChildren.drop();
            }}
        >
            {componentChildren()}
        </box>
    );

    return {
        component,
        isVisible: true,
        boxClass: 'clock',
        props: {
            setup: (self: Astal.Button): void => {
                let disconnectFunctions: (() => void)[] = [];

                Variable.derive(
                    [
                        bind(rightClick),
                        bind(middleClick),
                        bind(scrollUp),
                        bind(scrollDown),
                        bind(options.bar.scrollSpeed),
                    ],
                    () => {
                        disconnectFunctions.forEach((disconnect) => disconnect());
                        disconnectFunctions = [];

                        const throttledHandler = throttledScrollHandler(options.bar.scrollSpeed.get());

                        disconnectFunctions.push(
                            onPrimaryClick(self, (clicked, event) => {
                                openDropdownMenu(clicked, event, 'calendarmenu');
                            }),
                        );

                        disconnectFunctions.push(
                            onSecondaryClick(self, (clicked, event) => {
                                runAsyncCommand(rightClick.get(), { clicked, event });
                            }),
                        );

                        disconnectFunctions.push(
                            onMiddleClick(self, (clicked, event) => {
                                runAsyncCommand(middleClick.get(), { clicked, event });
                            }),
                        );

                        disconnectFunctions.push(
                            onScroll(self, throttledHandler, scrollUp.get(), scrollDown.get()),
                        );
                    },
                );
            },
        },
    };
};

export { Clock };
