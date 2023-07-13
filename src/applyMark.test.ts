import applyMark from './applyMark';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {doc, p} from 'prosemirror-test-builder';

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
});
