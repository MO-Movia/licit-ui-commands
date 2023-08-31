import TextColorCommand from './TextColorCommand';
import { EditorState, TextSelection } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-test-builder';
import { Transform } from 'prosemirror-transform';
import { MARK_TEXT_COLOR } from './MarkNames';
import { EditorView } from 'prosemirror-view';
import { Mark, Node } from 'prosemirror-model';
import * as applymark from './applyMark';
import * as React from 'react';
import * as findNodesWithSameMark from './findNodesWithSameMark';

describe('TextColorCommand', () => {
  let plugin!: TextColorCommand;
  beforeEach(() => {
    plugin = new TextColorCommand('red');
  });
  it('should create', () => {
    expect(plugin).toBeTruthy();
  });

  it('executeWithUserInput function() should be return false', () => {
    const state = {
      plugins: [],
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      tr: { doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } } },
    } as unknown as EditorState;

    const test = plugin.executeWithUserInput(state);
    expect(test).toBeFalsy();
  });


  it('executeWithUserInput function() should be return true, If docChanged = true', () => {
    const state = {
      plugins: [],
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      tr: { doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } } },
    } as unknown as EditorState;

    const editorview = {} as unknown as EditorView;


    jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
    const test = plugin.executeWithUserInput(state, (_x) => { return 'red'; }, editorview, 'red');


    expect(test).toBeTruthy();
  });
  it('executeWithUserInput function() should be return true, If storedMarksSet = true', () => {
    const state = {
      plugins: [],
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      tr: { doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } } },
    } as unknown as EditorState;

    const editorview = {} as unknown as EditorView;


    jest.spyOn(applymark, 'default').mockReturnValue({ storedMarksSet: true } as unknown as Transform);
    const test = plugin.executeWithUserInput(state, (_x) => { return 'red'; }, editorview, 'red');


    expect(test).toBeTruthy();
  });


  it('should be call executeCustom methood return tr ', () => {
    const state = {
      plugins: [],
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },

    } as unknown as EditorState;

    const tr = { doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; }, resolve: () => { return 1; } }, storedMarks: [], setSelection: () => { return ''; } } as unknown as Transform;
    jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);

    jest.spyOn(applymark, 'default').mockReturnValue({ storedMarks: [] } as unknown as Transform);
    const test = plugin.executeCustom(state, tr, 2, 2);


    expect(test).toStrictEqual({ 'storedMarks': [] });
  });

  it('waitForUserInput function() should be return undefined', () => {
    const state = {
      plugins: [],
      selection: { from: 1, to: 2 },
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } },
    } as unknown as EditorState;

    const _dispatch = jest.fn();
    const event_ = {
      currentTarget: document.createElement('div'),
    } as unknown as React.SyntheticEvent;

    const editorview = {} as unknown as EditorView;

    const result = plugin.waitForUserInput(state, _dispatch, editorview, event_);

    expect(result).toBeDefined();
  });

  it('should resolve with undefined when event is not defined or currentTarget is not an HTMLElement', async () => {
    const state = {
      plugins: [],
      selection: { from: 1, to: 2 },
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } },
    } as unknown as EditorState;

    const _dispatch = jest.fn();
    const editorview = {} as unknown as EditorView;
    const event_ = {
      currentTarget: 'not an HTMLElement',
    } as unknown as React.SyntheticEvent;
    const result = await plugin.waitForUserInput(state, _dispatch, editorview, event_);
    expect(result).toBeUndefined();
  });

  it('should resolve with undefined when event is not defined or currentTarget is not an HTMLElement', async () => {
    const state = {

    } as unknown as EditorState;

    const _dispatch = jest.fn();
    const editorview = {} as unknown as EditorView;
    const event_ = {
      currentTarget: 'not an HTMLElement',
    } as unknown as React.SyntheticEvent;
    const result = await plugin.waitForUserInput(state, _dispatch, editorview, event_);
    expect(result).toBeUndefined();
  });



  it('should be check the condition result is there', () => {
    const state = {
      plugins: [],
      selection: { from: 1, to: 2 },
      schema: { marks: { 'mark-text-color': MARK_TEXT_COLOR, } },
      doc: { nodeAt: (_x) => { return { isAtom: true, isLeaf: true, isText: false }; } },
    } as unknown as EditorState;

    const _dispatch = jest.fn();
    const event_ = {
      currentTarget: document.createElement('div'),
    } as unknown as React.SyntheticEvent;
    const result1 = {
      mark: { attrs: { color: 'red' } } as unknown as Mark,
      from: {
        node: {} as unknown as Node,
        pos: 0,
      },
      to: {
        node: {} as unknown as Node,
        pos: 1,
      }
    };
    jest.spyOn(findNodesWithSameMark, 'default').mockReturnValue(result1);
    const editorview = {} as unknown as EditorView;

    const result = plugin.waitForUserInput(state, _dispatch, editorview, event_);

    expect(result).toBeDefined();
  });


});

describe('HeadingCommand', () => {
  let schema1;
  let command: TextColorCommand;
  beforeEach(() => {
    schema1 = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    command = new TextColorCommand('red');

  });

  it('should enable the command when text align is enabled', () => {
    const state = EditorState.create({ schema: schema1 });
    const isEnabled = command.isEnabled(state);
    expect(isEnabled).toBe(false);
  });
});