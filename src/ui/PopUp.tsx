import * as React from 'react';

import PopUpManager from './PopUpManager';
import {atAnchorBottomLeft, atViewportCenter} from './PopUpPosition';
import uuid from './uuid';

import type {PopUpDetails} from './PopUpManager';
import type {Rect} from './rects';

type PositionHandler = (
  anchorRect: Rect | undefined,
  bodyRect: Rect | undefined
) => Rect;

export type ViewProps = Record<string, unknown>;

export type PopUpParams = {
  anchor?: Element;
  autoDismiss?: boolean;
  container?: Element;
  modal?: boolean;
  onClose?: (val) => void;
  position?: PositionHandler;
  IsChildDialog?: boolean;
};

export type PopUpProps = {
  View: typeof React.PureComponent; //TODO:
  close: (val) => void;
  popUpParams: PopUpParams;
  viewProps: Record<string, unknown>;
};

export type PopUpHandle = {
  close: (val) => void;
  update: (props: Record<string, unknown>) => void;
};

class PopUp extends React.PureComponent {
  props: PopUpProps;

  _bridge = null;
  _id = uuid();

  render(): React.ReactNode {
    const dummy = {};
    const {View, viewProps, close} = this.props;
    return (
      <div data-pop-up-id={this._id} id={this._id}>
        <View {...(viewProps || dummy)} close={close} />
      </div>
    );
  }

  componentDidMount(): void {
    this._bridge = {getDetails: this._getDetails};
    PopUpManager.register(this._bridge);
  }

  componentWillUnmount(): void {
    this._bridge && PopUpManager.unregister(this._bridge);
  }

  _getDetails = (): PopUpDetails => {
    const {close, popUpParams} = this.props;
    const {anchor, autoDismiss, position, modal} = popUpParams;
    return {
      anchor,
      autoDismiss: autoDismiss === false ? false : true,
      body: document.getElementById(this._id),
      close,
      modal: modal === true,
      position: position || (modal ? atViewportCenter : atAnchorBottomLeft),
    };
  };
}

export default PopUp;
