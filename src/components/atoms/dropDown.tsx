import * as React from 'react';
import { Button } from './button';

export type DropDownItem = {
    title: string;
    value: string;
};

type DropDownProps = {
    buttonTitle: string;
    selectTitle: string;
    selectedValue?: DropDownItem;
    options: Array<DropDownItem>;
    onEdit?: () => void;
    onSelect?: (val: DropDownItem) => void;
};

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
    return (
        <div className="form-group">
            <div className="input-group">
                <select className="form-select" onChange={onChange} value={props.selectedValue ? props.selectedValue.value : ''}>
                    <option key={'--select--title--'}>{props.selectTitle}</option>
                    {props.options.map((o, i) => (
                        <option key={i} value={o.value}>
                            {o.title}
                        </option>
                    ))}
                </select>
                {button}
            </div>
        </div>
    );
}
