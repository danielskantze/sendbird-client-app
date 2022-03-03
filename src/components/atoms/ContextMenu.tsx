import React from 'react';
import { cssCl } from '../../util/styling';
import MoreIcon from '../icons/MoreIcon';

export type ContextMenuItem = {
  id: string;
  title: string;
  danger?: boolean;
};

type ContextMenuItemsProps = {
  isVisible: boolean;
  items: Array<ContextMenuItem>;
  onItem: (item: ContextMenuItem) => void;
  onTrigger: () => void;
};

export default function ContextMenu(props: ContextMenuItemsProps) {
  function createClickFn(item: ContextMenuItem) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      props.onItem(item);
    };
  }
  function onTrigger(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    console.log('onTrigger');
    e.preventDefault();
    e.stopPropagation();
    props.onTrigger();
  }

  return (
    <div className={cssCl('message-menu', [props.isVisible, 'visible'])}>
      <div className="menu-button text text-primary">
        <a href="#" onClick={onTrigger}>
          <MoreIcon />
        </a>
      </div>
      <div className="card">
        <ul className="card-body menu">
          {props.items.map(i => (
            <li key={i.id} className={cssCl('item menu-item text-dark', [!!i.danger, 'text-error'])}>
              <a href="#" onClick={createClickFn(i)}>
                {i.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
