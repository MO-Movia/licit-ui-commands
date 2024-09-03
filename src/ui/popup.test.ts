import {PopUp, PopUpProps} from './PopUp';
import PopUpManager from './PopUpManager';

describe('popup', () => {
  it('should handle render', () => {
    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {viewProps: undefined} as unknown as PopUpProps;
    expect(test.render()).toBeDefined();
  });
  it('should handle _getDetails ', () => {
    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {
      popUpParams: {
        anchor: '',
        autoDismiss: true,
        modal: true,
        onClose: () => {'';},
        position: () => {
          return {};
        },
        IsChildDialog: true,
        popUpId: '',
      },
      viewProps: undefined,
    } as unknown as PopUpProps;
    expect(test._getDetails()).toBeDefined();
  });
  it('should handle _getDetails when autoDismiss === false ', () => {
    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {
      popUpParams: {
        anchor: '',
        autoDismiss: false,
        modal: true,
        onClose: () => {'';},
        position: undefined,
        IsChildDialog: true,
        popUpId: 'test',
      },
      viewProps: undefined,
    } as unknown as PopUpProps;
    expect(test._getDetails()).toBeDefined();
  });
  it('should handle _getDetails when autoDismiss === false and modal false', () => {
    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {
      popUpParams: {
        anchor: '',
        autoDismiss: false,
        modal: false,
        onClose: () => {'';},
        position: undefined,
        IsChildDialog: true,
        popUpId: 'test',
      },
      viewProps: undefined,
    } as unknown as PopUpProps;
    expect(test._getDetails()).toBeDefined();
  });

  it('should call componentWillUnmount method and unregister from PopUpManager if _bridge exists', () => {
    const unregisterSpy = jest.spyOn(PopUpManager, 'unregister');

    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {
      popUpParams: {
        anchor: '',
        autoDismiss: false,
        modal: false,
        onClose: () => {'';},
        position: undefined,
        IsChildDialog: true,
        popUpId: 'test',
      },
      viewProps: undefined,
    } as unknown as PopUpProps;


    // Mock the _bridge property to simulate it being set
    test._bridge = 'mockBridge' as unknown as HTMLElement;

    test.componentWillUnmount();

    expect(unregisterSpy).toHaveBeenCalledWith('mockBridge');
    expect(unregisterSpy).toHaveBeenCalledTimes(1);
  });

  it('should not call unregister from PopUpManager if _bridge does not exist', () => {
    const test = new PopUp({} as unknown as PopUpProps);
    test.props = {
      popUpParams: {
        anchor: '',
        autoDismiss: false,
        modal: false,
        onClose: () => {'';},
        position: undefined,
        IsChildDialog: true,
        popUpId: 'test',
      },
      viewProps: undefined,
    } as unknown as PopUpProps;

    const unregisterSpy = jest.spyOn(PopUpManager, 'unregister');
    // _bridge is undefined, so unregister should not be called
    test._bridge = undefined;

    test.componentWillUnmount();

    expect(unregisterSpy).not.toHaveBeenCalled();
  });
});
