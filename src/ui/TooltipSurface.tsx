import './czi-tooltip-surface.css';
import './czi-animations.css';

import * as React from 'react';
import createPopUp from './createPopUp';
import {atAnchorBottomCenter} from './PopUpPosition';
import uuid from './uuid';

export class TooltipView extends React.PureComponent {
  props: {
    tooltip: string;
  };
  render(): React.ReactNode {
    const {tooltip} = this.props;
    return (
      <div className="czi-tooltip-view czi-animation-fade-in">{tooltip}</div>
    );
  }
}

class TooltipSurface extends React.PureComponent {
  _id = uuid();
  _popUp = null;

  props: {
    tooltip: string;
    children?: React.ReactNode;
  };

  componentWillUnmount(): void {
    this._popUp && this._popUp.close();
  }

  render(): React.ReactNode {
    const {tooltip, children} = this.props;
    return (
      <span
        aria-label={tooltip}
        className="czi-tooltip-surface"
        data-tooltip={tooltip}
        id={this._id}
        onMouseDown={tooltip && this._onMouseLeave}
        onMouseEnter={tooltip && this._onMouseEnter}
        onMouseLeave={tooltip && this._onMouseLeave}
        role="tooltip"
      >
        {children}
      </span>
    );
  }

  _onMouseEnter = (): void => {
    if (!this._popUp) {
      const {tooltip} = this.props;
      this._popUp = createPopUp(
        TooltipView,
        {tooltip},
        {
          anchor: document.getElementById(this._id),
          onClose: this._onClose,
          position: atAnchorBottomCenter,
        }
      );
    }
  };

  _onMouseLeave = (): void => {
    this._popUp && this._popUp.close();
    this._popUp = null;
  };

  _onClose = (): void => {
    this._popUp = null;
  };
}

//export default TooltipSurface;
