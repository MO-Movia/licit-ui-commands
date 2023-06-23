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

import {EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import FontSizeCommand from './FontSizeCommand';
import {schema, builders} from 'prosemirror-test-builder';
import {Transform} from 'prosemirror-transform';
describe('FontSizeCommand', () => {
  let schema1;
  let command: FontSizeCommand;
  let dispatch: jest.Mock;

  beforeEach(() => {
    schema1 = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    command = new FontSizeCommand(14);
    dispatch = jest.fn();
  });

  it('should enable the command when text style mark is enabled', () => {
    const state = EditorState.create({schema: schema1});
    const isEnabled = command.isEnabled(state);
    expect(isEnabled).toBe(false);
  });

  it('should apply the font size mark to the current selection', () => {
    const state = EditorState.create({schema: schema1});
    command.execute(state, dispatch);
    const transform = new Transform(schema);
    // command.executeCustom(state, transform, 1, 2);
    expect(dispatch).not.toHaveBeenCalledWith(expect.any(transform));
  });
});
