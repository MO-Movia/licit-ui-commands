import {BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH} from './NodeNames';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import {EditorState} from 'prosemirror-state';
import {schema} from 'prosemirror-schema-basic';
import {Schema} from 'prosemirror-model';

describe('TextLineSpacingCommand', () => {
  let plugin!: TextLineSpacingCommand;
  let schema1;
  let command: TextLineSpacingCommand;
  let dispatch: jest.Mock;
  beforeEach(() => {
    plugin = new TextLineSpacingCommand('tab');
    schema1 = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    command = new TextLineSpacingCommand('right');
    dispatch = jest.fn();
  });
  it('should create', () => {
    expect(plugin).toBeTruthy();
  });

  const mySchema = new Schema({
    nodes: {
      doc: {
        attrs: {lineSpacing: {default: 'test'}},
        content: 'block+',
      },
      paragraph: {
        attrs: {lineSpacing: {default: 'test'}},
        content: 'text*',
        group: 'block',
      },
      heading: {
        attrs: {lineSpacing: {default: 'test'}},
        content: 'text*',
        group: 'block',
        defining: true,
      },
      bullet_list: {
        content: 'list_item+',
        group: 'block',
      },
      list_item: {
        attrs: {lineSpacing: {default: 'test'}},
        content: 'paragraph',
        defining: true,
      },
      blockquote: {
        attrs: {lineSpacing: {default: 'test'}},
        content: 'block+',
        group: 'block',
      },
      text: {
        inline: true,
      },
    },
  });

  // Create a dummy document using the defined schema
  const dummyDoc = mySchema.node('doc', null, [
    mySchema.node('heading', {lineSpacing: 'test'}, [
      mySchema.text('Heading 1'),
    ]),
    mySchema.node('paragraph', {lineSpacing: 'test'}, [
      mySchema.text('This is a paragraph'),
    ]),
    mySchema.node('bullet_list', {lineSpacing: 'test'}, [
      mySchema.node('list_item', {lineSpacing: 'test'}, [
        mySchema.node('paragraph', {lineSpacing: 'test'}, [
          mySchema.text('List item 1'),
        ]),
      ]),
      mySchema.node('list_item', {lineSpacing: 'test'}, [
        mySchema.node('paragraph', {lineSpacing: 'test'}, [
          mySchema.text('List item 2'),
        ]),
      ]),
    ]),
    mySchema.node('blockquote', {lineSpacing: 'test'}, [
      mySchema.node('paragraph', {lineSpacing: 'test'}, [
        mySchema.text('This is a blockquote'),
      ]),
    ]),
  ]);

  it('should enable the command when text align is enabled', () => {
    const state = EditorState.create({schema: schema1});
    const isEnabled = command.isActive(state);
    expect(isEnabled).toBe(false);
  });

  it('execute', () => {
    const state = EditorState.create({schema: schema1});
    const test = command.execute(state, dispatch);
    expect(test).toBeDefined();
  });

  it('should be check condition !selection', () => {
    const state = {
      selection: {to: 2, from: 1},
      schema: {nodes: {heading: HEADING, paragraph: PARAGRAPH}},
      doc: {
        nodesBetween: (_x, _y, _z: (a, b) => {return}) => {
          return;
        },
      },
      tr: {
        setSelection: (_selection) => {
          return true;
        },
      },
    } as unknown as EditorState;

    const test = plugin.isEnabled(state);

    expect(test).toBeFalsy();
  });

  it('should be check condition !doc', () => {
    const state = {
      selection: {to: 2, from: 1},
      schema: {
        nodes: {
          heading: undefined,
          paragraph: undefined,
          list_item: undefined,
          blockquote: undefined,
        },
      },
      doc: {
        nodesBetween: (_x, _y, _z: (a, b) => {return}) => {
          return;
        },
      },
      tr: {
        setSelection: (_selection) => {
          return {
            doc: {
              nodesBetween: (_x, _y, _z: (a, b) => {return}) => {
                return;
              },
            },
            selection: {from: 1, to: 2},
          };
        },
      },
    } as unknown as EditorState;

    const test = plugin.isEnabled(state);

    expect(test).toBe(false);
  });

  it('should be check the condition docChanged:false', () => {
    const state = {
      selection: {to: 2, from: 1},
      schema: {
        nodes: {
          heading: HEADING,
          paragraph: PARAGRAPH,
          list_item: LIST_ITEM,
          blockquote: BLOCKQUOTE,
        },
      },
      doc: {
        nodesBetween: (_x, _y, _z: (a, b) => {return}) => {
          return;
        },
      },
      tr: {
        setSelection: (_selection) => {
          return {doc: dummyDoc, selection: {from: 1, to: 2}};
        },
      },
    } as unknown as EditorState;

    const test = plugin.isEnabled(state);

    expect(test).toBeFalsy();
  });

  it('should be check the condition docChanged:true', () => {
    const state = {
      selection: {to: 2, from: 1},
      schema: {nodes: {heading: HEADING, paragraph: PARAGRAPH}},
      doc: dummyDoc,
      tr: {
        setSelection: (_selection) => {
          return {docChanged: true};
        },
      },
    } as unknown as EditorState;

    const test = plugin.isEnabled(state);

    expect(test).toBeTruthy();
  });
});
