import {PointerSurface} from './PointerSurface';
import * as React from 'react';
import {TooltipSurface} from './TooltipSurface';
import cx from 'classnames';

import type {PointerSurfaceProps} from './PointerSurface';

type CustomButtonProps = PointerSurfaceProps & {
  icon?: string | React.ReactElement | null;
  label?: string | React.ReactElement | null;
};

export class CustomButton extends React.PureComponent<CustomButtonProps> {
  declare props: CustomButtonProps;
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

