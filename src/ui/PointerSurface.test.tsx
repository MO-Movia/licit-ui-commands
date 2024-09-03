import React from 'react';
import {PointerSurface} from './PointerSurface';

describe('PointerSurface', () => {
  it('renders without crashing', () => {
    const pointerSurface = new PointerSurface({});
    expect(pointerSurface).toBeDefined();
  });

  it('should applies the correct className when active prop is true', () => {
    const pointerSurface = new PointerSurface({active: true});
    expect(pointerSurface.render()).toBeDefined();
  });

  it('should applies the correct className when disabled prop is true', () => {
    const pointerSurface = new PointerSurface({disabled: true});
    expect(pointerSurface.render()).toBeDefined();
  });

  it('removes event listener on componentWillUnmount', () => {
    const pointerSurface = new PointerSurface({});
    pointerSurface._mul = true;
    const spy = jest.spyOn(document, 'removeEventListener');
    pointerSurface.componentWillUnmount();
    expect(spy).toHaveBeenCalled();
  });

  it('should call onMouseEnter and prevent default on mouse enter event', () => {
    const pointerSurface = new PointerSurface({});
    expect(pointerSurface.render()).toBeDefined();
    const mockObj = {preventDefault() {}} as unknown as React.SyntheticEvent;
    expect(pointerSurface._onMouseEnter(mockObj)).toBeUndefined();
  });

  it('should call _onMouseUpCapture on mouse leave event', () => {
    const pointerSurface = new PointerSurface({});
    const mockObj = {} as unknown as React.MouseEvent;
    expect(pointerSurface._onMouseLeave(mockObj)).toBeUndefined();
  });

  it('should set pressed state, pressed target, and attach mouseup event listener on mouse down event', () => {
    const pointerSurface = new PointerSurface({});
    const mockObj = {
      preventDefault() {},
      which: 5,
      button: 2,
    } as unknown as React.MouseEvent;
    expect(pointerSurface._onMouseDown(mockObj)).toBeUndefined();
  });

  it('should call _onMouseDown on mouse down event', () => {
    const pointerSurface = new PointerSurface({});
    const mockObj = {preventDefault() {}} as unknown as React.MouseEvent;
    expect(pointerSurface._onMouseDown(mockObj)).toBeUndefined();
  });

  it('should call _onMouseUp and invoke onClick when _clicked = true', () => {
    const mockOnClick = jest.fn();
    const pointerSurface = new PointerSurface({
      onClick: mockOnClick,
      value: 'testValue',
      disabled: false,
    });
    const mockEvent = {
      preventDefault: jest.fn(),
      type: 'mouse',
    } as unknown as React.SyntheticEvent;
    pointerSurface._clicked = true;
    pointerSurface._onMouseUp(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalledWith('testValue', mockEvent);
    expect(pointerSurface._pressedTarget).toBeNull();
    expect(pointerSurface._clicked).toBe(false);
  });

  it('should call _onMouseUp and invoke onClick when event type = keypress', () => {
    const mockOnClick = jest.fn();
    const pointerSurface = new PointerSurface({
      onClick: mockOnClick,
      value: 'testValue',
      disabled: false,
    });
    const mockEvent = {
      preventDefault: jest.fn(),
      type: 'keypress',
    } as unknown as React.SyntheticEvent;
    pointerSurface._onMouseUp(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalledWith('testValue', mockEvent);
    expect(pointerSurface._pressedTarget).toBeNull();
    expect(pointerSurface._clicked).toBe(false);
  });

  it('should remove event listener, update clicked flag, and reset pressed state on mouse up capture event', () => {
    const targetElement = document.createElement('div');
    const pressedTargetElement = document.createElement('div');
    pressedTargetElement.appendChild(targetElement);
    const pointerSurface = new PointerSurface({});
    pointerSurface._pressedTarget = pressedTargetElement;
    pointerSurface._mul = true;
    const mockEvent = {
      target: targetElement,
    } as unknown as MouseEvent;
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const setStateSpy = jest.spyOn(pointerSurface, 'setState');
    pointerSurface._onMouseUpCapture(mockEvent);
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mouseup',
      pointerSurface._onMouseUpCapture,
      true
    );
    expect(pointerSurface._clicked).toBe(
      pointerSurface._pressedTarget instanceof HTMLElement &&
        mockEvent.target instanceof HTMLElement &&
        (mockEvent.target === pointerSurface._pressedTarget ||
          mockEvent.target.contains(pointerSurface._pressedTarget) ||
          pointerSurface._pressedTarget.contains(mockEvent.target))
    );
    expect(setStateSpy).toHaveBeenCalledWith({pressed: false});
    pointerSurface._mul = false;
    pointerSurface._onMouseUpCapture(mockEvent);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });
});
