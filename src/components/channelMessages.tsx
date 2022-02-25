import React, { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { SharedServices, SharedServicesContext } from "../appcontext";
import { LayoutColumn } from "./atoms/layoutColumn";
import { LayoutRow } from "./atoms/layoutRow";
import * as stateUi from '../store/slices/uiState';
import { UserMessage } from "sendbird";

type ChannelMessage = {
    id: string,
    time: Date,
    text: string,
    author: string,  
}

type ChannelMessageProps = {
    message: ChannelMessage
};

function ChannelMessage(props:ChannelMessageProps) {
  return (
    <div className="card chat-message">
      <div className="card-header">
        <div className="tile-title">{props.message.author}</div>
      </div>
      <div className="card-body">
        <p >{props.message.text}</p>
      </div>
    </div>
  );
}

const allMessages:Array<ChannelMessage> = [];

export function ChannelMessages() {
  const [messages, setMessages] = useState([]);
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;

  useEffect(() => {
    console.log("Bla bla", uiState.inChannel, sharedServices.chat.hasMessageHandler());
    if (uiState.inChannel && !sharedServices.chat.hasMessageHandler()) {
      sharedServices.chat.loadMessages()
        .then((loadedMessages) => {
          loadedMessages.forEach(m => {
            if (m.isUserMessage) {
              const userMessage = m as UserMessage;
              allMessages.push({id: "" + userMessage.messageId, author: userMessage.sender.nickname, text: userMessage.message, time: new Date(userMessage.createdAt)});
            }
          });
          setMessages(allMessages.concat());
          sharedServices.chat.setMessageHandler((userId:string, nickname:string, text:string) => {
            allMessages.push({id: userId, time: new Date(), text, author: nickname});
            setMessages(allMessages.concat());
          });    
        });
    } else if (!uiState.inChannel) {
      sharedServices.chat.clearMessageHandler();
      allMessages.splice(0, allMessages.length);
      setMessages(allMessages.concat());
    }
  }, [uiState]);

  return (
      <div>
      { messages.map((m, i) => 
      <LayoutRow key={i}>
            <LayoutColumn size={11} align={i % 2 == 0 ? 'left' : 'right'}>
                <ChannelMessage message={m}/>
            </LayoutColumn>
        </LayoutRow>
      ) }
      </div>
  );
}
