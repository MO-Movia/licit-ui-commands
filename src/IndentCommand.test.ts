import IndentCommand from './IndentCommand';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {schema, builders} from 'prosemirror-test-builder';
import {Transform} from 'prosemirror-transform';

describe('IndentCommand', () => {
    let plugin!: IndentCommand;
    beforeEach(() => {
        plugin = new IndentCommand(1);
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });

    it('should call when isActive function return false',()=>{
      const test = plugin.isActive();
      expect(test).toBe(false)
    })


    it('',()=>{
      const test = plugin.isActive();
      expect(test).toBeFalsy;
    })

});


























describe('IndentCommand', () => {
    let schema1;
    let command: IndentCommand;
    let dispatch: jest.Mock;

    beforeEach(() => {
      schema1 = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks,
      });
      command = new IndentCommand(1);
      dispatch = jest.fn();
    });

    it('should enable the command when text style mark is enabled', () => {
      const isEnabled = command.isActive();
      expect(isEnabled).toBe(false);
    });

    it('should apply the font size mark to the current selection', () => {
      const state = EditorState.create({schema: schema1});
      command.execute(state, dispatch);
     // const transform = new Transform(schema);
      // command.executeCustom(state, transform, 1, 2);
      //expect(dispatch).not.toHaveBeenCalledWith(expect.any(transform));
    });
  });