import IndentCommand from './IndentCommand';

describe('IndentCommand', () => {
    let plugin!: IndentCommand;
    beforeEach(() => {
        plugin = new IndentCommand(1);
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});