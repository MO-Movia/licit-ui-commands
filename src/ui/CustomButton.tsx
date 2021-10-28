import './czi-custom-button.css';
import PointerSurface from './PointerSurface';
import * as React from 'react';
import TooltipSurface from './TooltipSurface';
import cx from 'classnames';

import type {PointerSurfaceProps} from './PointerSurface';

class CustomButton extends React.PureComponent {
  props: PointerSurfaceProps & {
    icon?: string | React.ReactNode | null;
    label?: string | React.ReactNode | null;
  };

  render(): React.ReactNode {
    const {icon, label, className, title, ...pointerProps} = this.props;
    const klass = cx(className, 'czi-custom-button', {
      'use-icon': !!icon,
    });
    return (
      <TooltipSurface tooltip={title}>
        <PointerSurface {...pointerProps} className={klass}>
          {icon}
          {label}
        </PointerSurface>
      </TooltipSurface>
    );
  }
}

export default CustomButton;
