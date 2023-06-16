import FontTypeCommand from './FontTypeCommand';

describe('FontTypeCommand', () => {
    let plugin!: FontTypeCommand;
    beforeEach(() => {
        plugin = new FontTypeCommand('Arielle');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});