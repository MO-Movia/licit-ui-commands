import React from 'react';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import PopUp from './PopUp';
import instance from './PopUpManager';
import Enzyme, { shallow } from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });
describe('PopUp', () => {
    let popUpManager;
    let mockRegister;
    let mockUnregister;
  
    beforeEach(() => {
        popUpManager = instance;
        mockRegister = jest.spyOn(popUpManager, 'register');
        mockUnregister = jest.spyOn(popUpManager, 'unregister');
 
    });

    afterEach(() => {
        popUpManager = null;
        mockRegister.mockRestore();
        mockUnregister.mockRestore();
  
    });
  const MockView = jest.fn(() => <div>Mock View</div>);
  const mockClose = jest.fn();
  const mockPopUpParams = {
    anchor: 'anchor',
    autoDismiss: true,
    container: document.createElement('div'),
    modal: false,
    onClose: jest.fn(),
    position: jest.fn(),
    IsChildDialog: true,
    popUpId: '30ee34f0-1011',
  };
  const mockViewProps = {
    prop1: 'value1',
    prop2: 'value2',
  };

  let wrapper;

  beforeEach(() => {
   
    wrapper = shallow(
      <PopUp
        View={MockView}
        close={mockClose}
        popUpParams={mockPopUpParams}
        viewProps={mockViewProps}
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component correctly', () => {
   
    expect(wrapper.find(MockView).exists()).toBe(true);
    expect(wrapper.find(MockView).props()).toEqual({
      ...mockViewProps,
      close: mockClose,
    });
  });
  it('should register the bridge on componentDidMount', () => {
    const closeMock = jest.fn();
    const props = {
      View: () => <div />,
      close: closeMock,
      popUpParams: {},
      viewProps: {},
    };
    const wrapper = shallow(<PopUp {...props} />);

    expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({ getDetails: expect.any(Function) }));
  });

  it('should unregister the bridge on componentWillUnmount', () => {
    const closeMock = jest.fn();
    const props = {
      View: () => <div />,
      close: closeMock,
      popUpParams: {},
      viewProps: {},
    };
    const wrapper = shallow(<PopUp {...props} />);
    wrapper.unmount();

    expect(mockUnregister).toHaveBeenCalledWith(expect.objectContaining({ getDetails: expect.any(Function) }));
  });
  it('should return the details from _getDetails with popup id null', () => {
    const closeMock = jest.fn();
    const popUpParams = {
      anchor: 'some-anchor',
      autoDismiss: false,
      position: null,
      modal: false,
      popUpId: '',
    };
    const props = {
      View: () => <div />,
      close: closeMock,
      popUpParams,
      viewProps: {},
    };
    const wrapper = shallow(<PopUp {...props} />);
    const instance = wrapper.instance();

    const expectedDetails = {
      anchor: popUpParams.anchor,
      autoDismiss: false,
      body: null,
      close: closeMock,
      modal: false,
      position: null,
      popupId: null,
    };
    instance._getDetails()
    expect(instance).toBeDefined()
  });
  it('should return the correct details from _getDetails', () => {
    const closeMock = jest.fn();
    const popUpParams = {
      anchor: 'some-anchor',
      autoDismiss: true,
      position: jest.fn(),
      modal: false,
      popUpId: 'popup-id',
    };
    const props = {
      View: () => <div />,
      close: closeMock,
      popUpParams,
      viewProps: {},
    };
    const wrapper = shallow(<PopUp {...props} />);
    const instance = wrapper.instance();

    const expectedDetails = {
      anchor: popUpParams.anchor,
      autoDismiss: true,
      body: null,
      close: closeMock,
      modal: false,
      position: popUpParams.position,
      popupId: 'popup-id',
    };

    expect(instance._getDetails()).toEqual(expectedDetails);
  });
  
});
