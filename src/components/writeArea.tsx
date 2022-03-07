import React, { useContext, useState } from 'react';
import { SharedServices, SharedServicesContext } from '../appcontext';
import Button from './atoms/Button';
import LayoutColumn from './atoms/LayoutColumn';
import LayoutRow from './atoms/LayoutRow';
import { Message } from '../services/chat';
import * as flashMessages from '../store/flashMessages';
import { ConnectionStatus, UIContext } from '../store/contexts/ui';
import { MessagesContext } from '../store/contexts/messages';

export default function WriteArea() {
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  const [text, setText] = useState('');
  const {connectionStatus, addFlashMessage } = useContext(UIContext);
  const { addMessage } = useContext(MessagesContext);
  console.log({connectionStatus});

  const canSend = () => {

    return connectionStatus === ConnectionStatus.JoinedChannel &&
      text.length > 0;
  }

  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setText(e.currentTarget.value);
  };

  const onClickSend = () => {
    const { chat } = sharedServices;
    if (canSend()) {
      chat.sendMessage(text)
        .then((message:Message) => {
          addMessage(message);
        })
        .catch((e) => {
          addFlashMessage(flashMessages.fromError(e, 'send-error'));
        });
      setText('');
    }
  };

  return (
    <LayoutRow>
      <LayoutColumn size={10}>
        <div className="form-group">
          <textarea className="form-input" id="new-message" rows={3} onChange={onChange} value={text}></textarea>
        </div>
      </LayoutColumn>
      <LayoutColumn size={2} extraClasses={['write-actions']}>
        <Button 
          title="Send" 
          type={canSend() ? 'primary': ''}
          disabled={!canSend()}
          onClick={onClickSend}
          />
      </LayoutColumn>
    </LayoutRow>
  );
}
