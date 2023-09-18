import cx from 'classnames';
import * as React from 'react';

import preventEventDefault from './preventEventDefault';
import {EditorView} from 'prosemirror-view';

export type PointerSurfaceProps = {
  active?: boolean;
  children?;
  className?: string;
  disabled?: boolean;
  id?: string;
  onClick?: (val, e: React.SyntheticEvent) => void;
  onMouseEnter?: (val, e: React.SyntheticEvent) => void;
  style?: Record<string, unknown>;
  target?: string;
  title?: string;
  value?: string | number | Record<string, unknown> | EditorView;
};

export class PointerSurface extends React.PureComponent {
  props: PointerSurfaceProps;

  _clicked = false;
  _mul = false;
  _pressedTarget = null;

  state = {pressed: false};

  render(): React.ReactElement {
    const {className, disabled, active, id, style, title, children} =
      this.props;
    const {pressed} = this.state;

    const buttonClassName = cx(className, {
      active: active,
      disabled: disabled,
      pressed: pressed,
    });

    return (
      <span
        aria-disabled={disabled}
        aria-pressed={pressed}
        className={buttonClassName}
        id={id}
        onKeyPress={disabled ? preventEventDefault : this._onMouseUp}
        onMouseDown={disabled ? preventEventDefault : this._onMouseDown}
        onMouseEnter={disabled ? preventEventDefault : this._onMouseEnter}
        onMouseLeave={disabled ? null : this._onMouseLeave}
        onMouseUp={disabled ? preventEventDefault : this._onMouseUp}
        role="button"
        style={style}
        tabIndex={disabled ? null : 0}
        title={title}
      >
        {children}
      </span>
    );
  }

  componentWillUnmount(): void {
    if (this._mul) {
      this._mul = false;
      document.removeEventListener('mouseup', this._onMouseUpCapture, true);
    }
  }

  _onMouseEnter = (e: React.SyntheticEvent): void => {
    this._pressedTarget = null;
    e.preventDefault();
    const {onMouseEnter, value} = this.props;
    onMouseEnter?.(value, e);
  };

  _onMouseLeave = (e: React.MouseEvent): void => {
    this._pressedTarget = null;
    const mouseUpEvent: MouseEvent = e as unknown as MouseEvent; //TODO
    this._onMouseUpCapture(mouseUpEvent);
  };

  _onMouseDown = (e: React.MouseEvent): void => {
    e.preventDefault();

    this._pressedTarget = null;
    this._clicked = false;

    if (e['which'] === 3 || e.button == 2) {
      // right click.
      return;
    }

    this.setState({pressed: true});
    this._pressedTarget = e.currentTarget;
    this._clicked = false;

    if (!this._mul) {
      document.addEventListener('mouseup', this._onMouseUpCapture, true);
      this._mul = true;
    }
  };

  _onMouseUp = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    if (this._clicked || e.type === 'keypress') {
      const {onClick, value, disabled} = this.props;
      !disabled && onClick && onClick(value, e);
    }

    this._pressedTarget = null;
    this._clicked = false;
  };

  _onMouseUpCapture = (e: MouseEvent): void => {
    if (this._mul) {
      this._mul = false;
      document.removeEventListener('mouseup', this._onMouseUpCapture, true);
    }
    const target = e.target;
    this._clicked =
      this._pressedTarget instanceof HTMLElement &&
      target instanceof HTMLElement &&
      (target === this._pressedTarget ||
        target.contains(this._pressedTarget) ||
        this._pressedTarget.contains(target));
    this.setState({pressed: false});
  };
}
