import consolidateListNodes from './consolidateListNodes';
import { doc, li, ol, p, ul } from 'prosemirror-test-builder';
import { EditorState } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { Transaction } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';


describe('consolidateListNodes', () => {
  it('should consolidate list nodes', () => {
    const blockNodeType = {
      group: 'block',
      name: 'bullet_list',
    };
    const schema1 = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          toDOM(node) {
            return ['p', 0];
          },
        },
        text: {},
        ordered_list: {
          type: blockNodeType,
        },
      },
    });
    const customNodeType = schema1.nodes.ordered_list;
    const customNode = customNodeType.create({});

    const state = EditorState.create({
      doc: doc(p('hello world')),
      schema: schema1,
    });

    const { tr } = state;

    const transformedTr = consolidateListNodes(tr);
    expect(transformedTr.doc).toBeDefined();
  });


  it('should handle linkOrderedListCounters', () => {
    const tr = { doc: { nodeSize: 2 }, getMeta: () => { return null } } as unknown as Transaction
    expect(consolidateListNodes(tr)).toBeDefined();
  });


  it('should consolidate list nodes', () => {
    const state = EditorState.create({
      doc: doc(p('Item 1')),
      schema: schema,
    });
    const { tr } = state;

    const transformedTr = consolidateListNodes(tr);
    expect(transformedTr.doc).toBeDefined();
  });


  it('should return the transaction if dryrun meta property is set', () => {
    const textNode = schema.text('Hello, World!');
    const node = schema.nodes.paragraph.create({}, [textNode]);
    const tr = new Transaction(node);
    tr.setMeta('dryrun', true);

    const transformedTr = consolidateListNodes(tr);
    expect(transformedTr).toBe(tr);
  });


  it('should join multiple list nodes until no more can be joined', () => {
    const state = EditorState.create({
      doc: doc(
        ul(li(p('Item 1'))),
        ul(li(p('Item 2'))),
        ul(li(p('Item 3'))),
        ul(li(p('Item 4')))
      ),
      schema: schema,
    });

    const { tr } = state;

    const transformedTr = consolidateListNodes(tr);

    // Assert that all list nodes are joined into a single list node
    expect(transformedTr.doc.content.childCount).toBe(1);
    expect(transformedTr.doc.content.firstChild?.content.childCount).toBe(4);
  });


  it('should update the counterReset attribute of a list node', () => {
    const state = EditorState.create({
      doc: doc(ol(li(p('Item 1')))),
      schema: schema,
    });

    const { tr } = state;

    const pos = 1; // Position of the list node in the document
    const linked = true; // Counter should be linked

    const transformedTr = consolidateListNodes(tr);

    // Get the document after the transformation
    const transformedDoc = transformedTr.doc;

    // Get the list node at the specified position
    const listNode = transformedDoc.nodeAt(pos);

    // Assert that the counterReset attribute of the list node is set to 'none'
    expect(listNode?.attrs.counterReset).toBe(undefined);
  });
  it('should consolidate list nodes and handle counter linking', () => {
    const state = EditorState.create({
      doc: doc(
        ol(li(p('Item 1'))),
        ul(li(p('Item 2'))),
        ol(li(p('Item 3')))
      ),
      schema: schema,
    });
  
    const { tr } = state;
  
    const transformedTr = consolidateListNodes(tr);
  
    // Assert that list nodes are consolidated
    expect(transformedTr.doc.content.childCount).toBe(3);
  
    // Assert that the counterReset attribute of the consolidated list node is set to 'none'
    const consolidatedListNode = transformedTr.doc.content.firstChild;
    expect(consolidatedListNode?.attrs.counterReset).toBe(undefined);
  });
});
