import {applyMark} from './index';
import {EditorState} from 'prosemirror-state';
import {Mark, MarkType, Schema, Node} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {doc, p} from 'prosemirror-test-builder';

describe('applyMark', () => {
  let schema;
  let docs;
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

    docs = schema.node('doc', {}, [schema.text('Hello world')]);
    state = EditorState.create({schema, doc: docs});
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
  dummyDoc.rangeHasMark = () => {
    return true;
  };
  dummyDoc.nodeAt = () => {
    return dummyDoc;
  };

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
    const schema1 = new Schema({
      nodes: {
        doc: {content: 'paragraph+'},
        paragraph: {
          content: 'text*',
          toDOM() {
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
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr.steps).toStrictEqual([]);
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
  it('should handle applyMark when isCustomStyleApplied is true ', () => {
    const addMark = () => {
      return {addMark: addMark, doc: dummyDoc};
    };
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      addMark: addMark,
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
        $cursor: null,
        ranges: [{$from: {depth: 1, pos: 1}, $to: {depth: 1, pos: 2}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr).toBeTruthy();
  });
  it('should handle applyMark when nodeTr is null', () => {
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
    dummyDoc.rangeHasMark = () => {
      return true;
    };
    dummyDoc.nodeAt = () => {
      return null;
    };
    const addMark = () => {
      return {addMark: addMark};
    };
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      addMark: addMark,
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
        $cursor: null,
        ranges: [{$from: {depth: 1, pos: 1}, $to: {depth: 1, pos: 2}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr).toBeTruthy();
  });
  it('should handle applyMark', () => {
    const linkmark = new Mark();
    const mockschema = new Schema({
      nodes: {
        doc: {
          content: 'paragraph+',
        },
        paragraph: {
          content: 'text*',
          attrs: {
            styleName: {default: 'test'},
          },
          toDOM() {
            return ['p', 0];
          },
        },
        heading: {
          attrs: {level: {default: 1}, styleName: {default: ''}},
          content: 'inline*',
          marks: '',
          toDOM(node) {
            return [
              'h' + node.attrs.level,
              {'data-style-name': node.attrs.styleName},
              0,
            ];
          },
        },
        text: {
          group: 'inline',
        },
      },
      marks: {
        link: linkmark,
      },
    });
    const mockdoc = mockschema.nodeFromJSON({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: {level: 1, styleName: 'Normal'},
          content: [
            {
              type: 'text',
              text: 'Hello, ProseMirror!',
            },
          ],
          marks: [{type: 'link', attrs: {['overridden']: true}}],
        },
      ],
    });
    const addMark = () => {
      return {addMark: addMark};
    };
    const markType = schema.marks.bold;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      addMark: addMark,
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
      doc: mockdoc,
      selection: {
        $cursor: null,
        ranges: [{$from: {depth: 1, pos: 1}, $to: {depth: 1, pos: 2}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr).toBeTruthy();
  });

  it('should handle applyMark when has is null', () => {
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
    dummyDoc.rangeHasMark = () => {
      return false;
    };
    dummyDoc.nodeAt = () => {
      return {
        marks: [{type: {name: {name: 'link'} as unknown as MarkType}}],
      } as unknown as Node;
    };
    const addMark = () => {
      return {addMark: addMark};
    };
    const markType = {
      name: 'link',
      create: () => {
        return {};
      },
    } as unknown as MarkType;
    const attrs = {fontWeight: 'bold'};
    const tr = {
      addMark: addMark,
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
              return {};
            },
          },
        };
      },
      doc: dummyDoc,
      selection: {
        $cursor: null,
        ranges: [{$from: {depth: 1, pos: 1}, $to: {depth: 1, pos: 2}}],
      },
    } as unknown as Transform;
    const transformedTr = applyMark(tr, schema, markType, attrs, true);
    expect(transformedTr).toBeTruthy();
  });
});
