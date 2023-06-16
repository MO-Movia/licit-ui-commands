import TextLineSpacingCommand from './TextLineSpacingCommand';

describe('TextLineSpacingCommand', () => {
    let plugin!: TextLineSpacingCommand;
    beforeEach(() => {
        plugin = new TextLineSpacingCommand('tab');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});