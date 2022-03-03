import * as React from "react";

type LayoutColumnProps = {
    size?: number,
    children: React.ReactNode,
    align?: string,
    extraClasses?: Array<string>
};

export default function LayoutColumn(props:LayoutColumnProps) {
    const size = props.size ? props.size : 12;
    const classes = ["column", "col-" + size];
    switch (props.align) {
        case 'left':
            classes.push('col-mr-auto');
            break;
        case 'right':
            classes.push('col-ml-auto');
            break;
    }
    if (props.extraClasses) {
        props.extraClasses.forEach(c => classes.push(c));
    }
  return (
    <div className={classes.join(' ')}>{props.children}</div>
  );
}
