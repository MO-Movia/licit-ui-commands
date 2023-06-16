import HeadingCommand from './HeadingCommand';

describe('HeadingCommand', () => {
    let plugin!: HeadingCommand;
    beforeEach(() => {
        plugin = new HeadingCommand(1);
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});