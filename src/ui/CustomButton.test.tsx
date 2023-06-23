import Adapter from '@cfaester/enzyme-adapter-react-18';
import { configure, shallow } from 'enzyme';
import CustomButton from './CustomButton';
import { PointerSurface } from './PointerSurface';
import { TooltipSurface } from './TooltipSurface';
import React from 'react';

configure({ adapter: new Adapter() });

describe('CustomButton', () => {
  it('should render the component with icon and label', () => {
    const props = {
      icon: <span className="icon">Icon</span>,
      label: 'Label',
      className: 'custom-button',
      title: 'Tooltip',
      active: true,
      onClick: jest.fn(),
    };

    const wrapper = shallow(<CustomButton {...props} />);
    const pointerSurface = wrapper.find(PointerSurface);
    const tooltipSurface = wrapper.find(TooltipSurface);

    expect(pointerSurface).toHaveLength(1);
    expect(tooltipSurface).toHaveLength(1);

    expect(pointerSurface.prop('active')).toBe(true);
    expect(pointerSurface.prop('onClick')).toBe(props.onClick);
    expect(pointerSurface.prop('className')).toContain('custom-button');

    expect(tooltipSurface.prop('tooltip')).toBe('Tooltip');

    const children = pointerSurface.children();
    expect(children).toHaveLength(2);
    expect(children.at(0).hasClass('icon')).toBe(true);
    expect(children.at(0).text()).toBe('Icon');
    expect(children.at(1).text()).toBe('Label');
  });

  it('should render the component without icon', () => {
    const props = {
      label: 'Label',
      title: 'Tooltip',
      onMouseEnter: jest.fn(),
      onMouseLeave: jest.fn(),
    };

    const wrapper = shallow(<CustomButton {...props} />);
    const pointerSurface = wrapper.find(PointerSurface);

    expect(pointerSurface).toHaveLength(1);

    expect(pointerSurface.prop('onMouseEnter')).toBe(props.onMouseEnter);
    expect(pointerSurface.prop('onMouseLeave')).toBe(props.onMouseLeave);

    const children = pointerSurface.children();
    expect(children).toHaveLength(1);
    expect(children.text()).toBe('Label');
  });
});
