import * as React from 'react';

import { instance } from './PopUpManager';
import { atAnchorBottomLeft, atViewportCenter } from './PopUpPosition';
import { uuid } from './uuid';

import type { PopUpDetails } from './PopUpManager';
import type { Rect } from './rects';

type PositionHandler = (anchorRect?: Rect, bodyRect?: Rect) => Rect;

export type ViewProps = Record<string, unknown>;

export type PopUpParams = {
  anchor?;
  autoDismiss?: boolean;
  container?: Element;
  modal?: boolean;
  onClose?: (val) => void;
  position?: PositionHandler;
  IsChildDialog?: boolean;
  popUpId?: string;
};

export type PopUpProps = {
  View: typeof React.PureComponent;
  close: () => void;
  popUpParams: PopUpParams;
  viewProps: Record<string, unknown>;
};

export type PopUpHandle = {
  close: (val) => void;
  update: (props: Record<string, unknown>) => void;
};

export class PopUp extends React.PureComponent<PopUpProps> {
  declare props: PopUpProps;

  _bridge = null;
  _id = uuid();

  render(): React.ReactElement<HTMLDivElement> {
    const dummy = {};
    const { View, viewProps, close } = this.props;
    return (
      <div data-pop-up-id={this._id} id={this._id}>
        <View {...(viewProps || dummy)} close={close} />
      </div>
    );
  }

  componentDidMount(): void {
    this._bridge = { getDetails: this._getDetails };
    instance.register(this._bridge);
  }

  componentWillUnmount(): void {
    this._bridge && instance.unregister(this._bridge);
  }

  _getDetails = (): PopUpDetails => {
    const { close, popUpParams } = this.props;
    const { anchor, autoDismiss, position, modal, popUpId } = popUpParams;
    return {
      anchor,
      autoDismiss: autoDismiss !== false
      ,
      body: document.getElementById(this._id),
      close,
      modal: modal === true,
      position: position || (modal ? atViewportCenter : atAnchorBottomLeft),
      popupId: popUpId ? popUpId : null
    };
  };
}

