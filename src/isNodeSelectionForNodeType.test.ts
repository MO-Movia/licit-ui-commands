import { Selection, NodeSelection } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { isNodeSelectionForNodeType, getSelectionRange } from './isNodeSelectionForNodeType';

describe('isNodeSelectionForNodeType', () => {
  it('should return true if the selection is a NodeSelection for the provided node type', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          toDOM() {
            return ['p', 0];
          },
        },
        text: {},
      },
    });
    const doc = schema.nodes.doc.create(null, [
      schema.nodes.paragraph.create(null, [schema.text('Sample text')]),
    ]);
    const selection = NodeSelection.create(doc, 1);
    const result = isNodeSelectionForNodeType(
      selection,
      schema.nodes.paragraph
    );

    expect(result).not.toBe(true);
  });

  it('should return false if selection is null', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          toDOM() {
            return ['p', 0];
          },
        },
        text: {},
      },
    });
    const result = isNodeSelectionForNodeType(
      null as unknown as Selection,
      schema.nodes.paragraph
    );
    expect(result).toBe(false);
  });

  it('should return the from and to position of a selection', () => {
    const schema = new Schema({
      nodes: {
        doc: { content: 'paragraph+' },
        paragraph: {
          content: 'text*',
          toDOM() {
            return ['p', 0];
          },
        },
        text: {},
      },
    });
    const doc = schema.nodes.doc.create(null, [
      schema.nodes.paragraph.create(null, [schema.text('Sample text')]),
    ]);
    const selection = NodeSelection.create(doc, 1);
    const { from } = getSelectionRange(selection);
    expect(from).toBe(1);
  });
});
