import * as React from 'react';
import { Button } from './button';

export type DropDownItem = {
    title: string;
    value: string;
};

type DropDownProps = {
    maxLength?: number,
    buttonTitle: string | JSX.Element,
    selectTitle: string,
    selectedValue?: DropDownItem,
    options: Array<DropDownItem>,
    extraCssClasses?:Array<string>,
    onEdit?: () => void,
    onSelect?: (val: DropDownItem) => void,
};

function truncateToNChars(str:string, maxLength?:number) {
    if (!maxLength) {
        return str;
    }
    if (str.length -3 > maxLength) {
        return str.substring(0, maxLength - 3) + "...";
    }
    return str;
}

export function DropDown(props: DropDownProps) {
    const { buttonTitle } = props;
    const button = buttonTitle ? (
        <Button title={buttonTitle} extraClasses={['input-group-btn']} onClick={props.onEdit} />
    ) : (
        ''
    );
    const onChange = (e: React.FormEvent<HTMLSelectElement>) => {
      const index = e.currentTarget.selectedIndex;
        if (index > 0 && props.onSelect) {
            props.onSelect(props.options[index - 1]);
        }
    };
    const mainCssClasses = ["form-group"];
    if (props.extraCssClasses) {
        mainCssClasses.push(...props.extraCssClasses);
    }
    return (
        <div className={mainCssClasses.join(' ')}>
            <div className="input-group">
                <select className="form-select" onChange={onChange} value={props.selectedValue ? props.selectedValue.value : ''}>
                    <option key={'--select--title--'}>{props.selectTitle}</option>
                    {props.options.map((o, i) => (
                        <option key={i} value={o.value}>
                            {truncateToNChars(o.title, props.maxLength)}
                        </option>
                    ))}
                </select>
                {button}
            </div>
        </div>
    );
}
