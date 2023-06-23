import React from 'react';
import {shallow} from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import {configure} from 'enzyme';
import {PointerSurface} from './PointerSurface';

configure({adapter: new Adapter()});
describe('PointerSurface', () => {
  it('renders without crashing', () => {
    shallow(<PointerSurface />);
  });

  it('applies the correct className when active prop is true', () => {
    const wrapper = shallow(<PointerSurface active />);
    expect(wrapper.hasClass('active')).toBe(true);
  });

  it('applies the correct className when disabled prop is true', () => {
    const wrapper = shallow(<PointerSurface disabled />);
    expect(wrapper.hasClass('disabled')).toBe(true);
  });
  it('removes event listener on componentWillUnmount', () => {
    const addEventListenerMock = jest.spyOn(document, 'addEventListener');
    const removeEventListenerMock = jest.spyOn(document, 'removeEventListener');

    const wrapper = shallow(<PointerSurface />);
    const instance = wrapper.instance();
    instance['_mul'] = false;
    wrapper.unmount();

    expect(removeEventListenerMock).not.toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
      true
    );

    addEventListenerMock.mockRestore();
    removeEventListenerMock.mockRestore();
  });
  it('removes event listener on componentWillUnmount', () => {
    const addEventListenerMock = jest.spyOn(document, 'addEventListener');
    const removeEventListenerMock = jest.spyOn(document, 'removeEventListener');

    const wrapper = shallow(<PointerSurface />);
    const instance = wrapper.instance();
    instance['_mul'] = true;
    wrapper.unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
      true
    );

    addEventListenerMock.mockRestore();
    removeEventListenerMock.mockRestore();
  });

  it('should call onMouseEnter and prevent default on mouse enter event', () => {
    const onMouseEnterMock = jest.fn();
    const preventDefaultMock = jest.fn();
    const value = 'test value';

    const wrapper = shallow(<PointerSurface onMouseEnter={onMouseEnterMock} value={value} />);
    const instance = wrapper.instance();

    const syntheticEvent = { preventDefault: preventDefaultMock };

    instance._onMouseEnter(syntheticEvent);

    expect(onMouseEnterMock).toHaveBeenCalledWith(value, syntheticEvent);
    expect(preventDefaultMock).toHaveBeenCalled();
    expect(instance['_pressedTarget']).toBeNull();
  });

  it('should call _onMouseUpCapture on mouse leave event', () => {
    const _onMouseUpCaptureMock = jest.fn();
    const value = 'test value';

    const wrapper = shallow(<PointerSurface />);
    const instance = wrapper.instance();

    const mouseEvent = {} as React.MouseEvent;
    const mouseUpEvent = {} as MouseEvent;

    instance['_onMouseUpCapture'] = _onMouseUpCaptureMock;

    instance._onMouseLeave(mouseEvent);

    expect(instance['_pressedTarget']).toBeNull();
    expect(_onMouseUpCaptureMock).toHaveBeenCalledWith(mouseUpEvent);
  });

  it('should set pressed state, pressed target, and attach mouseup event listener on mouse down event', () => {
    const addEventListenerMock = jest.spyOn(document, 'addEventListener');
    const setCurrentTargetMock = jest.fn();
    const value = 'test value';

    const wrapper = shallow(<PointerSurface />);
    const instance = wrapper.instance();

    const mouseEvent = {
      preventDefault: jest.fn(),
      which: 1,
      button: 0,
      currentTarget: { setAttribute: setCurrentTargetMock },
    } as unknown as React.MouseEvent;

    instance._onMouseDown(mouseEvent);

    expect(mouseEvent.preventDefault).toHaveBeenCalled();
    expect(instance['_clicked']).toBe(false);
    expect(instance.state.pressed).toBe(true);
    expect(addEventListenerMock).toHaveBeenCalledWith('mouseup', instance._onMouseUpCapture, true);
    expect(instance['_mul']).toBe(true);
  });

  it('should call onClick callback and reset pressed state and clicked flag on mouse up event', () => {
    const onClickMock = jest.fn();
    const value = 'test value';

    const wrapper = shallow(<PointerSurface onClick={onClickMock} value={value} />);
    const instance = wrapper.instance();

    instance['_pressedTarget'] = document.createElement('div');
    instance['_clicked'] = true;
    instance.state.pressed = true;

    const mouseEvent = {
      preventDefault: jest.fn(),
      type: 'mouseup',
    } as unknown as React.SyntheticEvent;

    instance._onMouseUp(mouseEvent);

    expect(mouseEvent.preventDefault).toHaveBeenCalled();
    expect(onClickMock).toHaveBeenCalledWith(value, mouseEvent);
    expect(instance['_pressedTarget']).toBe(null);
    expect(instance['_clicked']).toBe(false);
  });

  it('should remove event listener, update clicked flag, and reset pressed state on mouse up capture event', () => {
    const removeEventListenerMock = jest.spyOn(document, 'removeEventListener');
    const containsMock = jest.fn(() => true);
    const value = 'test value';

    const wrapper = shallow(<PointerSurface />);
    const instance = wrapper.instance();

    instance['_mul'] = true;
    instance['_pressedTarget'] = document.createElement('div');
    instance.setState({ pressed: true });

    const mouseEvent = {
      target: document.createElement('div'),
    } as unknown as MouseEvent;

    instance._onMouseUpCapture(mouseEvent);

    expect(removeEventListenerMock).toHaveBeenCalledWith('mouseup', instance._onMouseUpCapture, true);
    expect(containsMock).not.toHaveBeenCalledWith(instance['_pressedTarget']);
    expect(instance['_clicked']).toBe(false);
    expect(instance.state.pressed).toBe(false);
  });
});
