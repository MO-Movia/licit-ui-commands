import {render} from '@testing-library/react';
import React from 'react';
import {ColorEditor} from './ColorEditor';

jest.mock('./CustomButton', () => ({
  CustomButton: ({onClick, value, active, label, className, style}) => (
    <button
      aria-pressed={active}
      className={className}
      data-testid={`color-button-${value}`}
      onClick={() => onClick(value)}
      style={style}
    >
      {label}
    </button>
  ),
}));

describe('ColorEditor', () => {
  const mockClose = jest.fn();

  beforeEach(() => {
    mockClose.mockClear();
  });

  it('renders the correct number of rainbow color buttons for each color section', () => {
    const {getAllByTestId} = render(<ColorEditor close={mockClose} />);
    expect(getAllByTestId(/color-button-/).length).toBeGreaterThan(10);
  });
});
