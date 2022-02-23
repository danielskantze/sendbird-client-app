import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppTitleBar } from "./components/appTitleBar";
import { LayoutRow } from "./components/atoms/layoutRow";
import { LayoutColumn } from "./components/atoms/layoutColumn";
import { ChannelSettings } from "./components/channelSettings";
import { ChannelMessages } from "./components/channelMessages";
import { Button } from "./components/atoms/button";
import { Provider } from "react-redux";
import { store } from "./store/store";
class App extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="app">
        <div className="header-area">
          <AppTitleBar title="Sendbird Chat Client" />
          <ChannelSettings />
        </div>
        <div className="divider"></div>
        <div className="messages-area">
          <LayoutRow>
            <LayoutColumn>
              <ChannelMessages
                messages={[
                  {
                    id: "a",
                    text: "Hej hej",
                    author: "chatpro",
                    time: new Date(),
                  },
                  {
                    id: "b",
                    text: "Hello",
                    author: "chatnoob",
                    time: new Date(),
                  },
                  {
                    id: "c",
                    text: "Hello",
                    author: "chatnoob",
                    time: new Date(),
                  },
                  {
                    id: "d",
                    text: "Hello",
                    author: "chatnoob",
                    time: new Date(),
                  },
                  {
                    id: "e",
                    text: "Hello",
                    author: "chatnoob",
                    time: new Date(),
                  },
                ]}
              />
            </LayoutColumn>
          </LayoutRow>
        </div>
        <div className="divider"></div>
        <div className="write-area">
          <LayoutRow>
            <LayoutColumn size={10}>
              <div className="form-group">
                <textarea
                  className="form-input"
                  id="new-message"
                  placeholder="Textarea"
                  rows={3}
                ></textarea>
              </div>
            </LayoutColumn>
            <LayoutColumn size={2} extraClasses={["write-actions"]}>
              <Button title="Send" />
            </LayoutColumn>
          </LayoutRow>
        </div>
      </div>
    );
  }
}

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root")
  );
}

render();
