import {toggleList, wrapItemsWithListInternal} from './toggleList';
import {Node, NodeType, Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';

// import { ContentNodeWithPos } from 'prosemirror-utils/dist/types';
describe('toggleList', () => {
  let schema;
  let trr;
  beforeEach(() => {
    schema = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {},
      },
      marks: {
        bold: {},
      },
    });

    trr = document.createElement('tr');
    // Add some descendant nodes for testing
    trr.innerHTML = '<td>Cell 1</td><td>Cell 2</td><td>Cell 3</td>';
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

  it('should be selection is not there or doc is not there', () => {
    const tr = {
      selection: {from: 1, to: 2},
    } as unknown as Transform;
    const listNodeType = {} as unknown as NodeType;
    const test = toggleList(tr, schema, listNodeType, 'bold');
    expect(test).toBe(tr);
  });

  describe('wrapItemsWithListInternal', () => {
    const items = [
      {node: {id: 1, name: 'Node 1', marks: 'fg'} as unknown as Node, pos: 2},
    ];

    it('should wrap items with a list', () => {
      const tr = {} as unknown as Transform;
      const sc = {nodes: {}} as unknown as Schema;
      const list_node = {} as unknown as NodeType;

      const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

      expect(test).toBeDefined();
    });

    it('should return the transform  when paragraph is there ', () => {
      const tr = {} as unknown as Transform;
      const sc = {nodes: {paragraph: {}}} as unknown as Schema;
      const list_node = {} as unknown as NodeType;

      const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

      expect(test).toBeDefined();
    });

    it('should return the transform  when both paragraph and listitem is there', () => {
      const tr = {
        setNodeMarkup: (_a) => {
          return {
            setNodeMarkup: (_a) => {
              return {
                doc: {
                  nodeAt: (_b) => {
                    return;
                  },
                },
              };
            },
            doc: {
              nodeAt: (_b) => {
                return;
              },
            },
          };
        },
        doc: {
          nodeAt: (_b) => {
            return;
          },
        },
      } as unknown as Transform;
      const sc = {nodes: {paragraph: {}, list_item: {}}} as unknown as Schema;
      const list_node = {} as unknown as NodeType;

      const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

      expect(test).toBeDefined();
    });

    it('should return the transform if not equal to firstNode and lastNode', () => {
      const tr = {
        setNodeMarkup: (_a) => {
          return {
            setNodeMarkup: (_a) => {
              return {
                doc: {
                  nodeAt: (_b) => {
                    return;
                  },
                },
              };
            },
            doc: {
              nodeAt: (_b) => {
                return {attrs: {id: null}};
              },
            },
          };
        },
        doc: dummyDoc,
      } as unknown as Transform;
      const sc = {nodes: {paragraph: {}, list_item: {}}} as unknown as Schema;
      const list_node = {} as unknown as NodeType;

      const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

      expect(test).toBeDefined();
    });
    it('should return the transform if not equal to firstNode and lastNode', () => {
      const schema = new Schema({
        nodes: {
          doc: {content: 'block+'},
          paragraph: {content: 'inline*', group: 'block'},
          heading: {content: 'inline*', marks: '_', group: 'block'},
          text: {group: 'inline'},
        },
        marks: {},
      });

      // Sample document for testing
      const sampleDocument = schema.nodeFromJSON({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is a sample ProseMirror document with ',
              },
            ],
          },
          {
            type: 'heading',
            attrs: {id: {}},
            content: [{type: 'text', text: 'A Heading'}],
          },
        ],
      });

      // Create a document using the schema.

      const doc1 = sampleDocument;
      jest
        .spyOn(doc1, 'nodeAt')
        .mockReturnValueOnce({attrs: {id: {}}} as unknown as Node);
      const tr = {
        setNodeMarkup: (_a) => {
          return {
            setNodeMarkup: (_a) => {
              return {
                doc: {
                  nodeAt: (_b) => {
                    return;
                  },
                },
              };
            },
            doc: doc1,
          };
        },
        doc: dummyDoc,
      } as unknown as Transform;
      const sc = {nodes: {paragraph: {}, list_item: {}}} as unknown as Schema;
      const list_node = {} as unknown as NodeType;

      const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

      expect(test).toBeDefined();
    });
  });
});
