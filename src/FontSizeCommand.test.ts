import FontSizeCommand from './FontSizeCommand';

describe('FontSizeCommand', () => {
    let plugin!: FontSizeCommand;
    beforeEach(() => {
        plugin = new FontSizeCommand(12);
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});