import TextAlignCommand from './TextAlignCommand';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { schema, builders } from 'prosemirror-test-builder';
import { Transform } from 'prosemirror-transform';
import { MARK_TEXT_COLOR } from './MarkNames';
import * as applymark from './TextAlignCommand';
import { EditorView } from 'prosemirror-view';
import setTextAlign from './TextAlignCommand'

describe('TextAlignCommand', () => {
    let plugin!: TextAlignCommand;
    beforeEach(() => {
        plugin = new TextAlignCommand('left');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });


    it('should be isEnabled method true', () => {
        const state = {
            selection: { to: 2, from: 1 },
            schema: { nodes: {} },
            doc: { nodesBetween: (x, y, z: (a, b) => { return }) => { return } },
            tr: { setSelection: (selection) => { return true } }
        } as unknown as EditorState;

        const test = plugin.isEnabled(state);

        expect(test).toBeTruthy()
    })

    
   
});








describe('HeadingCommand', () => {
    let schema1;
    let command: TextAlignCommand;
    let dispatch: jest.Mock;

    beforeEach(() => {
        schema1 = new Schema({
            nodes: schema.spec.nodes,
            marks: schema.spec.marks,
        });
        command = new TextAlignCommand('right');
        dispatch = jest.fn();
    });

    it('should enable the command when text align is enabled', () => {
        const state = EditorState.create({ schema: schema1 });
        const isEnabled = command.isActive(state);
        expect(isEnabled).toBe(false);
    });

    it('execute ', () => {
        const state = EditorState.create({ schema: schema1 });
        command.execute(state, dispatch);
    });



});
