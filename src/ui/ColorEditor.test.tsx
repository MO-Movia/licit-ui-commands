import {ColorEditor} from './ColorEditor';

describe('ColorEditor', () => {
  it('should be defined', () => {
    const colEditor = new ColorEditor({});
    expect(colEditor).toBeDefined();
  });

  it('should render', () => {
    const colEditor = new ColorEditor({});
    expect(colEditor.render()).toBeDefined();
  });

  it('should render when props have hex', () => {
    const colEditor = new ColorEditor({});
    colEditor.props = {close: () => {}, hex: '#FFFFFF'};
    expect(colEditor.render()).toBeDefined();
  });

  it('should handle _onSelectColor and call close', () => {
    const colEditor = new ColorEditor({});
    colEditor.props = {close: () => {}, hex: '#FFFFFF'};
    const spy = jest.spyOn(colEditor.props, 'close');
    colEditor._onSelectColor('#FFFFFF');
    expect(spy).toHaveBeenCalled();
  });
});
