import * as React from 'react';

type MessageProps = {
  id:string,
  type: string,
  message: string,
  onClear: (id:string) => void,
};

export default function FlashMessage(props: MessageProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onClick = (e:any) => {
    e.stopPropagation();
    e.preventDefault();
    props.onClear(props.id);
  }
  return (
    <div className={['toast', 'toast-' + props.type].join(' ')}>
      <button className="btn btn-clear float-right" onClick={onClick}></button>
      {props.message}
    </div>
  );
}
