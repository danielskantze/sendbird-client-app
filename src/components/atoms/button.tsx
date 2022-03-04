import * as React from "react";

type ButtonProps = {
    type?: string,
    color?: string,
    title: string | JSX.Element,
    disabled?: boolean,
    extraClasses?: Array<string>,
    onClick?: () => void
};

export default function Button(props:ButtonProps) {
    const classes = ["btn"];
    if (props.type) {
        classes.push("btn-" + props.type);
    }
    if (props.extraClasses) {
        props.extraClasses.forEach(c => classes.push(c));
    }
    if (props.color) {
        classes.push('button-' + props.color);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onClick = (e:any) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.onClick) {
            props.onClick();
        }
    }
  return (
    <button className={classes.join(" ")} disabled={props.disabled} onClick={onClick}>{props.title}</button>
  );
}