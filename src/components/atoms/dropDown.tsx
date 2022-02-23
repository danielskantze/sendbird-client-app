import * as React from "react";
import { Button } from "./button";

export type DropDownItem = {
  title: string,
  value: string
};

type DropDownProps = {
    buttonTitle: string,
    selectTitle: string,
    options: Array<DropDownItem>,
    onEdit?: () => void
}

export function DropDown(props:DropDownProps) {
    const { buttonTitle } = props;
    const button = buttonTitle ? 
      <Button title={buttonTitle} extraClasses={['input-group-btn']} onClick={props.onEdit}/> : '';
    return (
        <div className="form-group">
        <div className="input-group">
          <select className="form-select">
            <option>{props.selectTitle}</option>
            {props.options.map(o => 
                <option key={o.value}>{o.title}</option>
            )}
          </select>
          {button}
        </div>
      </div>
    );
}