import {CustomButton} from './CustomButton';
describe('CustomButton', () => {
  it('should render the component with icon and label', () => {
    const colEditor = new CustomButton({});
    expect(colEditor).toBeDefined();
  });

  it('should render the component without icon', () => {
    const colEditor = new CustomButton({label: 'Label', title: 'Tooltip'});
    expect(colEditor.render()).toBeDefined();
  });
});
