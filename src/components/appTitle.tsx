import React, { useState } from "react";
import { LayoutColumn } from "./atoms/layoutColumn";
import { LayoutRow } from "./atoms/layoutRow";
import { EditAppSettingsModal } from "./modals/editAppSettings";

type AppTitleProps = {
  title: string;
};

export function AppTitleBar(props: AppTitleProps) {
  const [appSettingsVisible, setAppSettingsVisible] = useState(false);
  
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
    setAppSettingsVisible(false);
  };

  return (
    <div>
      {appSettingsVisible ? <EditAppSettingsModal onClose={onModalClose} onSave={onModalSave}/> : ""}
      <LayoutRow extraClasses={["app-titlebar"]}>
        <LayoutColumn size={8} extraClasses={["app-title"]}>
          <h5>{props.title}</h5>
        </LayoutColumn>
        <LayoutColumn size={4} extraClasses={["app-actions"]}>
          <a href="..." onClick={onClickAppSettings}>
            App settings
          </a>
        </LayoutColumn>
      </LayoutRow>
    </div>
  );
}
