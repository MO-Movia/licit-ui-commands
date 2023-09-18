import {applyMark} from './index';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';

describe('applyMark', () => {
  let schema;
  let doc;
  let state;

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

    doc = schema.node('doc', {}, [schema.text('Hello world')]);
    state = EditorState.create({schema, doc});
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

  it('should apply a mark to the given range', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = state.tr;
    const transformedTr = applyMark(tr, schema, markType, attrs);

    expect(transformedTr.docChanged).toBe(false);
  });

  it('should remove the mark from the given range if it already exists', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};

    const tr = state.tr
      .addMark(0, 5, markType.create(attrs))
      .addMark(6, 11, markType.create(attrs));

    const transformedTr = applyMark(tr, schema, markType, attrs);

    expect(transformedTr.docChanged).toBe(true);
    expect(transformedTr.steps).toHaveLength(2);
  });

  it('should apply a mark to the given range', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};

    const start = 5;
    const end = 10;
    const selection = TextSelection.create(doc, start, end);
    const tr = state.tr.setSelection(selection);
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr.steps).toHaveLength(1);
  });
  it('should be check the condition (empty && !$cursor)', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      doc: {
        rangeHasMark: () => {
          return true;
        },
      },
      selection: {empty: {}, ranges: {}},
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, false);
    expect(transformedTr).toBeTruthy();
  });
  it('should be check the condition !markApplies(tr.doc, ranges, markType)', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      doc: dummyDoc,
      selection: {
        $cursor: {},
        ranges: [{$from: {depth: 1, pos: 0}, $to: {depth: 1, pos: 0}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, false);
    expect(transformedTr).toBeTruthy();
  });
  it('should be check the condition !can', () => {
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      removeStoredMark: () => {
        return {
          addStoredMark: () => {
            return {};
          },
        };
      },
      addStoredMark: () => {
        return {
          doc: {
            rangeHasMark: () => {
              return true;
            },
          },
        };
      },
      doc: dummyDoc,
      selection: {
        $cursor: {},
        ranges: [{$from: {depth: 1, pos: 1}, $to: {depth: 1, pos: 2}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, false);
    expect(transformedTr).toBeTruthy();
  });
});
