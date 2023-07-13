import { Schema ,Node } from 'prosemirror-model';
import { clearHeading, clearMarks } from './clearMarks';
import { EditorState, TextSelection } from 'prosemirror-state';
import { doc, p } from 'prosemirror-test-builder';
import { Transform } from 'prosemirror-transform';
import { MARK_EM, MARK_FONT_SIZE } from './MarkNames';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
describe('clearMarks', () => {
  const mySchema = new Schema({
    nodes: {
      doc: {
        attrs: { lineSpacing: { default: 'test' } },
        content: 'block+',
      },
      paragraph: {
        attrs: { lineSpacing: { default: 'test' } },
        content: 'text*',
        group: 'block',
      },
      heading: {
        attrs: { lineSpacing: { default: 'test' } },
        content: 'text*',
        group: 'block',
        defining: true,
      },
      bullet_list: {
        content: 'list_item+',
        group: 'block',
      },
      list_item: {
        attrs: { lineSpacing: { default: 'test' } },
        content: 'paragraph',
        defining: true,
      },
      blockquote: {
        attrs: { lineSpacing: { default: 'test' } },
        content: 'block+',
        group: 'block',
      },
      text: {
        inline: true,
      },

    },
  });
  
  // mockDoc.js

  
  const dummyDoc = mySchema.node('doc', null, [
    mySchema.node('heading', { marks: [] }, [
      mySchema.text('Heading 1',),
    ]),
    mySchema.node('paragraph', { marks: [] }, [
      mySchema.text('This is a paragraph', ),
    ]),
    mySchema.node('bullet_list', { marks: [] }, [
      mySchema.node('list_item', { marks: [] }, [
        mySchema.node('paragraph', { marks: [] }, [
          mySchema.text('List item 1', ),
        ]),
      ]),
      mySchema.node('list_item', { marks: [] }, [
        mySchema.node('paragraph', { marks: [] }, [
          mySchema.text('List item 2', ),
        ]),
      ]),
    ]),
    mySchema.node('blockquote', { marks: [] }, [
      mySchema.node('paragraph', { marks: [] }, [
        mySchema.text('This is a blockquote', ),
      ]),
    ]),
  ]);
  it('should push nodes with specific marks into tasks array', () => {
   
    const tr = { doc: dummyDoc, selection: { from: 0, to: 1 } } as unknown as Transform;
    const clearmarks = clearMarks(tr, mySchema)
    expect(clearmarks).toBe(tr);
  });

  it('it should return a transform when doc and selection are not present', () => {
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
      },
    });
    const state = EditorState.create({
      doc: doc(p('hello world')),
      schema: schema1,
    });
    const tr = {} as unknown as Transform;
    const clearmarks = clearMarks(tr, schema1)
    expect(clearmarks).toBe(tr);
  })

  it('it should return a transform', () => {
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
      },
    });
    const state = EditorState.create({
      doc: doc(p('hello world')),
      schema: schema1,
    });
    const tr = { doc: {}, selection: { from: 0, to: 1 } } as unknown as Transform;
    const clearmarks = clearMarks(tr, schema1)
    expect(clearmarks).toBe(tr);
  })


  describe('clearHeading', () => {

    it('should return the original transform if both selection and doc are null', () => {
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
        },
      });

      const state = EditorState.create({
        doc: doc(p('hello world')),
        schema: schema1,
      });
      const tr = {} as unknown as Transform;
      const transformedTr = clearHeading(tr, schema1);
      expect(transformedTr).toBe(tr);
    });

    it('should return the original transform if selection is empty', () => {
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
        },
      });

      const state = EditorState.create({
        doc: doc(p('hello world')),
        schema: schema1,
      });
      const tr = state.tr;
      const transformedTr = clearHeading(tr, schema1);
      expect(transformedTr).toBe(tr);
    });

    it('should return the original transform if selection is not empty', () => {
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
        },
      });

      const state = EditorState.create({
        doc: doc(p('hello world')),
        schema: schema1,
      });
      const tr = state.tr;
      tr.setSelection(TextSelection.create(state.doc, 0, 5));

      // Set a non-empty selection range
      const selectionState = EditorState.create({
        schema: state.schema,
        doc: state.doc,
        selection: TextSelection.create(state.doc, 0, 5),
      });
      const transformedTr = clearHeading(tr, schema1);

      expect(transformedTr).toBe(tr);
    });
    it('should push nodes of specified type into tasks array', () => {
      
      const state = {
        doc: doc(p('hello world')),

      } as unknown as EditorState;

      const tr = { doc: dummyDoc, selection: { from: 0, to: 1 }, setNodeMarkup: () => { return { key: 'mockTransaction' } } } as unknown as Transform;
      const clearheading = clearHeading(tr, mySchema)
      expect(clearheading).toStrictEqual({ key: 'mockTransaction' });
    });

    it('should check the condition !tasks.length', () => {
      
      const tr = { doc: dummyDoc, selection: { from: 1, to: 2 } } as unknown as Transform;

      const sc = {marks:{'mark-font-size':MARK_FONT_SIZE},nodes:{'blockquote':BLOCKQUOTE, 'heading':HEADING,'paragraph':PARAGRAPH, 'list_item':LIST_ITEM}} as unknown as Schema
      const clearmarks = clearMarks(tr, sc)
      expect(clearmarks).toBeTruthy();
    });

  });
});