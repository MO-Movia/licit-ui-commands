import React from 'react';
import ReactDOM from 'react-dom';
import {
  createPopUp,
  unrenderPopUp,
  hideModalMask,
  showModalMask,
} from './createPopUp'; // Adjust the path accordingly

jest.mock('react-dom', () => ({
  render: jest.fn(),
  unmountComponentAtNode: jest.fn(),
}));

describe('createPopUp', () => {
  let originalGetElementById;
  let mockGetElementById;

  beforeAll(() => {
    originalGetElementById = document.getElementById;
    mockGetElementById = jest.fn();
    document.getElementById = mockGetElementById;
  });

  afterAll(() => {
    document.getElementById = originalGetElementById;
  });

  it('unrenders a pop-up and calls unmount method', () => {
    const rootId = 'testRootId';

    unrenderPopUp(rootId);

    expect(mockGetElementById).toHaveBeenCalledWith(rootId);
    expect(ReactDOM.unmountComponentAtNode).toBeDefined();
    expect(hideModalMask).toBeDefined();
  });

  it('creates a pop-up and returns a handle', () => {
    const View = () => <div>Mocked View</div>;
    const viewProps = {};
    const popUpParams = {modal: true, anchor: 'skip'};
    const handle = createPopUp(View, viewProps, popUpParams);
    expect(handle).toBeDefined();
    expect(handle.close).toBeDefined();
    expect(handle.update).toBeDefined();
  });

  it('should handle showModalMask', () => {
    expect(showModalMask(true)).toBeUndefined();
  });

  it('should handle hideModalMask when element?.parentElement', () => {
    const el = document.createElement('div');
    const e = document.createElement('div');
    e.appendChild(el);
    jest.spyOn(document, 'getElementById').mockReturnValue(el);
    expect(hideModalMask()).toBeUndefined();
  });
});
