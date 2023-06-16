import TextAlignCommand from './TextAlignCommand';

describe('TextAlignCommand', () => {
    let plugin!: TextAlignCommand;
    beforeEach(() => {
        plugin = new TextAlignCommand('left');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
});