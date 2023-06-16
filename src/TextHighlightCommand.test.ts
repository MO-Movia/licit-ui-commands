import TextHighlightCommand from './TextHighlightCommand';

describe('TextHighlightCommand', () => {
    let plugin!: TextHighlightCommand;
    beforeEach(() => {
        plugin = new TextHighlightCommand('yellow');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});