import {
  RuntimeService,
  getStyleByName,
  setCustomStyles,
  setRuntime,
} from './runtime.service';

describe('RuntimeService', () => {
  beforeEach(() => {
    RuntimeService.Runtime = null;
  });

  test('should set runtime correctly using setRuntime function', () => {
    const runtimeMock = {name: 'TestRuntime'};
    setRuntime(runtimeMock);
    expect(RuntimeService.Runtime).toBe(runtimeMock);
  });

  test('should get runtime correctly after setting it', () => {
    const runtimeMock = {name: 'AnotherRuntime'};

    RuntimeService.Runtime = runtimeMock;

    expect(RuntimeService.Runtime).toBe(runtimeMock);
  });

  test('should return null initially if runtime is not set', () => {
    expect(RuntimeService.Runtime).toBeNull();
  });

  test('should return style by name when custom styles contain a matching style', () => {
    setCustomStyles([
      {styleName: 'Heading 1', styles: {fontName: 'Arial'}},
      {styleName: 'Body', styles: {fontSize: '12pt'}},
    ]);

    expect(getStyleByName('Heading 1')).toEqual({
      styleName: 'Heading 1',
      styles: {fontName: 'Arial'},
    });
  });

  test('should return null when requested style name does not exist', () => {
    setCustomStyles([{styleName: 'Body', styles: {fontSize: '12pt'}}]);

    expect(getStyleByName('Missing')).toBeNull();
  });

  test('should return null when custom styles are reset to an empty list', () => {
    setCustomStyles();

    expect(getStyleByName('Anything')).toBeNull();
  });
});
