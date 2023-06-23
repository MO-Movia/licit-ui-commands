import Adapter from '@cfaester/enzyme-adapter-react-18';
import { configure, shallow } from 'enzyme';
import ColorEditor from './ColorEditor';
import CustomButton from './CustomButton';
import React from 'react';

configure({ adapter: new Adapter() });

describe('ColorEditor', () => {
  
  it('should call close callback when a color is selected', () => {
    const closeMock = jest.fn();
    const props = {
      close: closeMock,
      hex: '#FFFFFF',
    };

    const wrapper = shallow(<ColorEditor {...props} />);
    const greyColors = wrapper.find('.czi-color-editor-section').at(1).find(CustomButton);
    const firstGreyColor = greyColors.at(0);
    firstGreyColor.simulate('click');

    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});

