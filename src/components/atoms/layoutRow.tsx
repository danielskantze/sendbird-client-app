import * as React from "react";

type LayoutRowProps = {
  children: React.ReactNode;
  extraClasses?: Array<string>;
};

export default function LayoutRow(props: LayoutRowProps) {
  const classes = ["columns"];
  if (props.extraClasses) {
    props.extraClasses.forEach((c) => classes.push(c));
  }
  return (
    <div className="container grid-md">
      <div className={classes.join(' ')}>{props.children}</div>
    </div>
  );
}
