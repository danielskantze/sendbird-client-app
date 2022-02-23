import * as React from "react";
import { LayoutColumn } from "./atoms/layoutColumn";
import { LayoutRow } from "./atoms/layoutRow";

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

type ChannelMessagesProps = {
  messages: Array<ChannelMessage>;
};

export function ChannelMessages(props: ChannelMessagesProps) {
  return (
      <div>
      { props.messages.map((m, i) => 
      <LayoutRow key={i}>
            <LayoutColumn size={11} align={i % 2 == 0 ? 'left' : 'right'}>
                <ChannelMessage message={m}/>
            </LayoutColumn>
        </LayoutRow>
      ) }
      </div>
  );
}
