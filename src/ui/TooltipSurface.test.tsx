import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TooltipSurface } from './TooltipSurface';

describe('TooltipSurface', () => {
  it('renders the tooltip when hovered', () => {
    const tooltip = 'Example tooltip';
    const { getByRole, queryByText } = render(
      <TooltipSurface tooltip={tooltip}>Hover Me</TooltipSurface>
    );

    const tooltipSurface = getByRole('tooltip');
    expect(tooltipSurface).toBeDefined();

    fireEvent.mouseEnter(tooltipSurface);
    const tooltipView = queryByText((content, element) =>
      element?.textContent === tooltip
    );
    expect(tooltipView).toBeDefined();

    fireEvent.mouseLeave(tooltipSurface);
    expect(queryByText(tooltip)).toBeDefined();
  });

});
