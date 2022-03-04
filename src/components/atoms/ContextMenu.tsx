import React, { useRef, useState } from 'react';
import { cssCl } from '../../util/styling';
import MoreIcon from '../icons/MoreIcon';

export type ContextMenuItem = {
  id: string;
  title: string;
  danger?: boolean;
};

export enum MenuAlign {
  Left = 'left',
  Right = 'right',
}

type ContextMenuItemsProps = {
  items: Array<ContextMenuItem>,
  align: MenuAlign,
  onItem?: (item: ContextMenuItem) => void,
  onTrigger?: () => void,
};

export default function ContextMenu(props: ContextMenuItemsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [canHide, setCanHide] = useState(false);
  
  function createClickFn(item: ContextMenuItem) {
    return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();
      props.onItem(item);
      setIsVisible(false);
      setCanHide(false);
    };
  }
  function onTrigger(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(true);
    setCanHide(false);
  }

  function onMouseEnterClickArea(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (canHide) {
      setIsVisible(false);
    }
  }

  function onMouseEnterItems(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    setCanHide(true);
  }

  return (
    <div className={cssCl('message-menu', [[isVisible, 'visible'], [props.align === MenuAlign.Right, MenuAlign.Right]])}>
      <div className="menu-button text text-primary">
        <a href="#" onClick={onTrigger}>
          <MoreIcon />
        </a>
      </div>
      <div className="card" onMouseEnter={onMouseEnterItems}>
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
      <div className='click-area' onMouseEnter={onMouseEnterClickArea}></div>
    </div>
  );
}
