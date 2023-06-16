import MarkToggleCommand from './MarkToggleCommand';

describe('MarkToggleCommand', () => {
    let plugin!: MarkToggleCommand;
    beforeEach(() => {
        plugin = new MarkToggleCommand('bold');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});