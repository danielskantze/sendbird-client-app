import React, { useContext, useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { SharedServices, SharedServicesContext } from "../appcontext";
import { LayoutColumn } from "./atoms/layoutColumn";
import { LayoutRow } from "./atoms/layoutRow";
import * as stateUi from '../store/slices/uiState';

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

let hasJoined = false;
const allMessages:Array<ChannelMessage> = [];

export function ChannelMessages() {
  const [messages, setMessages] = useState([]);
  const uiState: stateUi.UIState = useAppSelector(stateUi.selector);
  const sharedServices = useContext(SharedServicesContext) as SharedServices;
  useEffect(() => {
    if (uiState.inChannel && !hasJoined) {
      hasJoined = true;
      sharedServices.chat.setMessageHandler((userId:string, nickname:string, text:string) => {
        allMessages.push({id: userId, time: new Date(), text, author: nickname});
        console.log("Updating messages", allMessages.length);
        setMessages(allMessages.concat());
      });  
    } else if (uiState.inChannel && hasJoined) {
      hasJoined = false;
      allMessages.splice(0, allMessages.length);
      setMessages(allMessages.concat());
    }
  }, [uiState]);
  console.log(messages.length);
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
