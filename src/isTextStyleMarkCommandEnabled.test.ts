import {EditorState, TextSelection} from 'prosemirror-state';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import {Schema} from 'prosemirror-model';
import {schema, builders} from 'prosemirror-test-builder';
import {EditorView} from 'prosemirror-view';
import {MATH} from './NodeNames';
describe('isTextStyleMarkCommandEnabled', () => {
  it('should return true if a math node is selected and the mark name is valid', () => {
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: {
        fontSize: {},
        textColor: {},
      },
    });
    const {doc, p} = builders(mySchema, {p: {nodeType: 'paragraph'}});
    const state = EditorState.create({
      doc: doc(p('Test Para')),
      schema: mySchema,
    });
    const dom = document.createElement('div');
    const view = new EditorView(
      {mount: dom},
      {
        state: state,
      }
    );
    const selection = TextSelection.create(view.state.doc, 7, 1);
    const tr = view.state.tr.setSelection(selection);
    view.dispatch(tr);
    const markName = 'fontSize';

    const result = isTextStyleMarkCommandEnabled(state, markName);

    expect(result).toBe(true);
  });

  it('should return false if an atomic node is selected', () => {
    const mySchema = new Schema({
      nodes: {
        doc: {
          content: 'block+',
        },
        math: {
          content: 'inline*',
          group: 'block',
          parseDOM: [{tag: 'div.custom-node'}],
          toDOM: () => ['div', {class: 'custom-node'}, 0],
        },
        text: {
          group: 'inline',
        },
      },
    });
    const state = EditorState.create({
      schema: mySchema,
      doc: mySchema.nodes.doc.create(
        {},
        mySchema.nodes.math.create({}, mySchema.text('Sample text'))
      ),
    });

    const view = new EditorView(document.createElement('div'), {
      state,
    });
    const {from, to} = view.state.selection;
    view.dispatch(
      view.state.tr.setSelection(
        new TextSelection(
          view.state.doc.resolve(from),
          view.state.doc.resolve(to)
        )
      )
    );
    const markName = MATH;
    const result = isTextStyleMarkCommandEnabled(state, markName);

    expect(result).toBe(false);
  });

  it('should return true in other cases', () => {
    const state = EditorState.create({schema});
    const markName = 'fontSize';
    const result = isTextStyleMarkCommandEnabled(state, markName);

    expect(result).toBe(false);
  });
});
