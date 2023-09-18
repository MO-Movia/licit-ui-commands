import React from 'react';
import ReactDOM from 'react-dom';
import createPopUp, {unrenderPopUp, hideModalMask} from './createPopUp'; // Adjust the path accordingly

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
    const popUpParams = {};

    const handle = createPopUp(View, viewProps, popUpParams);

    expect(handle).toBeDefined();
    expect(handle.close).toBeDefined();
    expect(handle.update).toBeDefined();
  });
});
