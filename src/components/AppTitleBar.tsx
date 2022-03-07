import React, { useContext, useState } from "react";
import LayoutColumn from "./atoms/LayoutColumn";
import LayoutRow from "./atoms/LayoutRow";
import EditAppSettingsModal from "./modals/EditAppSettings";
import { UIContext } from '../store/contexts/ui';

type AppTitleProps = {
  title: string;
};

export default function AppTitleBar(props: AppTitleProps) {
  const [appSettingsVisible, setAppSettingsVisible] = useState(false);
  const { setDisconnected } = useContext(UIContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onClickAppSettings = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setAppSettingsVisible(true);
  };

  const onModalClose = () => {
    setAppSettingsVisible(false);
  };

  const onModalSave = () => {
    setDisconnected();
    setAppSettingsVisible(false);
  };
  return (
    <div className="header-row">
      {appSettingsVisible ? <EditAppSettingsModal onClose={onModalClose} onSave={onModalSave}/> : ""}
      <LayoutRow extraClasses={["app-titlebar"]}>
        <LayoutColumn size={8} extraClasses={["app-title"]}>
          <h5>{props.title}</h5>
        </LayoutColumn>
        <LayoutColumn size={4} extraClasses={["app-actions"]}>
          <a className="text text-light" href="..." onClick={onClickAppSettings}>
            App settings
          </a>
        </LayoutColumn>
      </LayoutRow>
    </div>
  );
}
