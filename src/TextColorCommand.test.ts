import TextColorCommand from './TextColorCommand';

describe('TextColorCommand', () => {
    let plugin!: TextColorCommand;
    beforeEach(() => {
        plugin = new TextColorCommand('red');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});