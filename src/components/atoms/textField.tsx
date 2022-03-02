import * as React from 'react';

type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange:(text:string) => void
};

export function TextField(props: TextFieldProps) {

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    props.onChange(e.currentTarget.value);
  };

  const label = props.label ? 
    (<label className="form-label text-dark">{props.label}</label>) : ('');
  return (
    <div className="form-group">
      {label}
      <input className="form-input" type="text" placeholder={props.placeholder} value={props.value} onChange={onChange} />
    </div>
  );
}
