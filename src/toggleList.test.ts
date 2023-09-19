import toggleList from './toggleList';
import { Fragment, Node, NodeType, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import * as prossermirror_utlites from 'prosemirror-utils';
import { ContentNodeWithPos } from 'prosemirror-utils';
import { HEADING, PARAGRAPH } from './NodeNames';
import { MARK_TEXT_SELECTION } from './MarkNames';
import * as applymark from './applyMark';
import * as consolidateListNodes from './consolidateListNodes';
import * as isListNode from './isListNode';
import { wrapItemsWithListInternal } from './toggleList';




describe('toggleList', () => {
    let schema;
    let trr;

    beforeEach(() => {

        schema = new Schema({
            nodes: {
                doc: { content: 'text*' },
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

    const mock_schema = new Schema({
        nodes: {
            doc: { content: 'paragraph*' },
            paragraph: { content: 'text*' },
            text: {},

        },
        marks: {
            bold: {},
        },
    });
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

    // Create a dummy document using the defined schema
    const dummyDoc = mySchema.node('doc', null, [
        mySchema.node('heading', { lineSpacing: 'test' }, [
            mySchema.text('Heading 1'),
        ]),
        mySchema.node('paragraph', { lineSpacing: 'test' }, [
            mySchema.text('This is a paragraph'),
        ]),
        mySchema.node('bullet_list', { lineSpacing: 'test' }, [
            mySchema.node('list_item', { lineSpacing: 'test' }, [
                mySchema.node('paragraph', { lineSpacing: 'test' }, [
                    mySchema.text('List item 1'),
                ]),
            ]),
            mySchema.node('list_item', { lineSpacing: 'test' }, [
                mySchema.node('paragraph', { lineSpacing: 'test' }, [
                    mySchema.text('List item 2'),
                ]),
            ]),
        ]),
        mySchema.node('blockquote', { lineSpacing: 'test' }, [
            mySchema.node('paragraph', { lineSpacing: 'test' }, [
                mySchema.text('This is a blockquote'),
            ]),
        ]),
    ]);


    it('should be selection is not there or doc is not there', () => {
        const tr = {
            selection: { from: 1, to: 2 }
        } as unknown as Transform;
        const listNodeType = {} as unknown as NodeType;
        const test = toggleList(tr, schema, listNodeType, 'bold');
        expect(test).toBe(tr);


    });
    it('should be 0 === from && 0 != to', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return 'uu'; } }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const test = toggleList(tr, schema, listNodeType, 'bold');

        expect(test).toBeDefined();



    });
    it('should be 0 === from && 0 != to', () => {

        const mock_schema = new Schema({
            nodes: {
                doc: { content: 'paragraph*' },
                paragraph: { content: 'text*' },
                text: {},

            },
            marks: {
                bold: {},
            },
        });
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

        // Create a dummy document using the defined schema
        const dummyDoc = mySchema.node('doc', null, [
            mySchema.node('heading', { lineSpacing: 'test' }, [
                mySchema.text('Heading 1'),
            ]),
            mySchema.node('paragraph', { lineSpacing: 'test' }, [
                mySchema.text('This is a paragraph'),
            ]),
            mySchema.node('bullet_list', { lineSpacing: 'test' }, [
                mySchema.node('list_item', { lineSpacing: 'test' }, [
                    mySchema.node('paragraph', { lineSpacing: 'test' }, [
                        mySchema.text('List item 1'),
                    ]),
                ]),
                mySchema.node('list_item', { lineSpacing: 'test' }, [
                    mySchema.node('paragraph', { lineSpacing: 'test' }, [
                        mySchema.text('List item 2'),
                    ]),
                ]),
            ]),
            mySchema.node('blockquote', { lineSpacing: 'test' }, [
                mySchema.node('paragraph', { lineSpacing: 'test' }, [
                    mySchema.text('This is a blockquote'),
                ]),
            ]),
        ]);
        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return 'dryrun'; }, selection: { from: 0, to: 1 }, doc: dummyDoc }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);

        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType')
            .mockReturnValueOnce(() => { return undefined as unknown as ContentNodeWithPos; })
            .mockReturnValueOnce(() => { return { pos: 1, start: 2, depth: 4, node: '' } as unknown as ContentNodeWithPos; })
            .mockReturnValueOnce(() => { return { pos: 1, start: 2, depth: 4, node: '' } as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const test = toggleList(tr, mock_schema, listNodeType, 'bold');
        expect(test).toBeDefined();
    });

    it('transformAndPreserveTextSelection without schema {marks}', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return ''; } }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const test = toggleList(tr, schema, listNodeType, 'bold');
        expect(test).toBeDefined();

    });

    it('transformAndPreserveTextSelection without setSelection {selection}', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return ''; }, selection: null, doc: {} }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeDefined();


    });
    it('transformAndPreserveTextSelection without setSelection {doc}', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return ''; }, selection: {}, doc: null }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeDefined();


    });
    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition from === 0', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => { return { getMeta: (_x) => { return ''; }, selection: { from: 0, to: 0 }, doc: { nodeAt: (_a) => { return 0; } } }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeTruthy();


    });
    it('transformAndPreserveTextSelection calling with scehema, selection, doc checking condition !currentNode && prevNode && prevNode.type.name === TEXT', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: {
                descendants: (_x, _y) => { return ''; },
                nodeAt: (a) => {
                    if (a == 2) {
                        return { type: 'hh' };
                    } else if (a == 1) {
                        return { type: 'hh' };
                    }
                    return null;
                }
            },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        descendants: (_a) => { return ''; },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return { type: 'hh' };
                            } else if (a == 1) {
                                return { type: 'hh' };
                            }
                            return null;
                        }
                    }
                };
            }
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);

        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;

        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});
    });


    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition prevNode && currentNode && currentNode.type === prevNode.type', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: {
                descendants: (_a, _b) => { return ''; },
                nodeAt: (a) => {
                    if (a == 2) {
                        return { type: 'hh' };
                    } else if (a == 1) {
                        return { type: 'hh' };
                    }
                    return null;
                }
            },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        descendants: (_a) => { return ''; },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return null;
                            } else if (a == 1) {
                                return { type: 'hh' };
                            }
                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});
    });


    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition nextNode && currentNode && currentNode.type === nextNode.type', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        nodeAt: (a) => {
                            if (a == 2) {
                                return { type: 'hh' };
                            } else if (a == 1) {
                                return null;
                            } else if (a == 3) {
                                return { type: 'hh' };
                            }
                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;


        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});

    });
    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition nextNode', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: {
                descendants: (_a, _b) => { return ''; },
                nodeAt: (a) => {
                    if (a == 2) {
                        return null;
                    } else if (a == 1) {
                        return null;
                    } else if (a == 3) {
                        return { type: 'hh' };
                    }
                    return null;
                }
            },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        descendants: (_a) => { return ''; },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return null;
                            } else if (a == 1) {
                                return null;
                            } else if (a == 3) {
                                return { type: 'hh' };
                            }

                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});
    });

    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition prevNode', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: (_x, _y) => { return ''; } },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        descendants: (node, callback) => {
                            node.descendants((descendant, pos, parent, index) => {
                                callback(descendant, pos, parent, index);
                            });
                        },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return null;
                            } else if (a == 1) {
                                return { type: 'hh' };
                            } else if (a == 3) {
                                return null;
                            }

                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;



        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});

    });



    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition return tr', () => {

        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: ((_x, _y) => { return ''; }) },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; }, selection: { from: 2, to: 2 }, doc: {
                        nodeAt: (_a) => {
                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeTruthy();

    });
    it('transformAndPreserveTextSelection calling with scehema,selection,doc checking condition !currentNode && prevNode && prevNode.type.name === PARAGRAPH & !prevNode.firstChild', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: { descendants: (_x, _y) => { return ''; } },
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; },
                    selection: { from: 2, to: 2 },
                    insert: (_a, _h) => { return { setSelection: (_a) => { return { doc: dummyDoc }; } }; },
                    setSelection: (_a) => { return { doc: dummyDoc }; },
                    doc: {
                        descendants: (node, callback) => {
                            node.descendants((descendant, pos, parent, index) => {
                                callback(descendant, pos, parent, index);
                            });
                        },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return null;
                            } else if (a == 1) {
                                return { type: { name: 'paragraph' }, firstChild: null };
                            }
                            return null;
                        }
                    }
                };
            },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        jest.spyOn(Fragment, 'from').mockReturnValue({} as unknown as Fragment);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING }, text: (_x) => { return 'placeholder_text'; } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeDefined();
    });


    it('toggleList function() should be return object', () => {

        const tr = {
            selection: { from: 0, to: 1000 },
            doc: dummyDoc,
            setSelection: (_a) => {
                return {
                    getMeta: (_x) => { return ''; }, selection: { from: 2, to: 2 }, setSelection: (_a) => { return { doc: dummyDoc }; }, doc: {
                        descendants: (node: Node, callback: (descendant: Node, pos: number, parent: Node, index: number) => void) => {
                            node.descendants((descendant, pos, parent, index) => {
                                callback(descendant, pos, parent, index);
                            });
                        },
                        nodeAt: (a) => {
                            if (a == 2) {
                                return null;
                            } else if (a == 1) {
                                return { type: 'hh' };
                            } else if (a == 3) {
                                return null;
                            }
                            return null;
                        }

                    }
                };
            },

        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({} as unknown as TextSelection).mockReturnValueOnce({ doc: dummyDoc } as unknown as TextSelection);
        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType').mockReturnValue(() => { return {} as unknown as ContentNodeWithPos; });
        jest.spyOn(applymark, 'default').mockReturnValue({ docChanged: true } as unknown as Transform);
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue({ doc: dummyDoc, removeMark: () => { return { doc: dummyDoc, setSelection: () => { return {}; } }; } } as unknown as Transform);
        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'heading': HEADING } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toStrictEqual({});

    });
    it('toggleList function() should be return defined value, If setNodeMarkup is not there', () => {
        const tr = {
            selection: { from: 0, to: 1 },
            doc: dummyDoc,
            setSelection: (_a) => { return { getMeta: (_x) => { return 'dryrun'; }, selection: { from: 0, to: 1, 'heading': HEADING }, doc: dummyDoc }; },
        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({ from: 0, to: 1 } as unknown as TextSelection);


        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType')
            .mockReturnValueOnce(() => { return undefined as unknown as ContentNodeWithPos; })
            .mockReturnValueOnce(() => { return { pos: 1, start: 2, depth: 4, node: '' } as unknown as ContentNodeWithPos; });
        const listNodeType = {} as unknown as NodeType;
        const test = toggleList(tr, mock_schema, listNodeType, 'bold');
        expect(test).toBeDefined();
    });
    it('toggleList function() should be return defined value, If setNodeMarkup is there', () => {


        const tr = {
            selection: { from: 0, to: 1 },
            doc: dummyDoc,
            setSelection: (_a) => { return { getMeta: (_x) => { return 'dryrun'; }, selection: { from: 0, to: 1 }, doc: dummyDoc, setNodeMarkup: (_a) => { return 1; } }; },

        } as unknown as Transform;

        jest.spyOn(TextSelection, 'create').mockReturnValue({ from: 0, to: 1 } as unknown as TextSelection);
        jest.spyOn(isListNode, 'default').mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(false) as unknown as Node;

        jest.spyOn(prossermirror_utlites, 'findParentNodeOfType')
            .mockReturnValueOnce(() => { return undefined as unknown as ContentNodeWithPos; })
            .mockReturnValueOnce(() => { return { pos: 1, start: 2, depth: 4, node: '' } as unknown as ContentNodeWithPos; });

        const listNodeType = {} as unknown as NodeType;
        const sc = { marks: { 'mark-text-selection': MARK_TEXT_SELECTION }, nodes: { 'paragraph': PARAGRAPH, 'heading': HEADING }, text: (_x) => { return 'placeholder_text'; } } as unknown as Schema;
        const test = toggleList(tr, sc, listNodeType, 'bold');

        expect(test).toBeDefined();

    });


    describe('wrapItemsWithListInternal', () => {
        const items = [
            { node: { id: 1, name: 'Node 1', marks: 'fg' } as unknown as Node, pos: 1 },

        ];

        it('should wrap items with a list', () => {

            const tr = {} as unknown as Transform;
            const sc = { nodes: {} } as unknown as Schema;
            const list_node = {} as unknown as NodeType;

            const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

            expect(test).toBeDefined();
        });

        it('should return the transform  when paragraph is there ', () => {

            const tr = {} as unknown as Transform;
            const sc = { nodes: { 'paragraph': {} } } as unknown as Schema;
            const list_node = {} as unknown as NodeType;

            const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

            expect(test).toBeDefined();
        });

        it('should return the transform  when both paragraph and listitem is there', () => {

            const tr = { setNodeMarkup: (_a) => { return { setNodeMarkup: (_a) => { return { doc: { nodeAt: (_b) => { return; } } }; }, doc: { nodeAt: (_b) => { return; } } }; }, doc: { nodeAt: (_b) => { return; } } } as unknown as Transform;
            const sc = { nodes: { 'paragraph': {}, 'list_item': {} } } as unknown as Schema;
            const list_node = {} as unknown as NodeType;

            const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

            expect(test).toBeDefined();
        });

        it('should return the transform if not equal to firstNode and lastNode', () => {

            const tr = { setNodeMarkup: (_a) => { return { setNodeMarkup: (_a) => { return { doc: { nodeAt: (_b) => { return; } } }; }, doc: { nodeAt: (_b) => { return { attrs: { id: null } }; } } }; }, doc: dummyDoc } as unknown as Transform;
            const sc = { nodes: { 'paragraph': {}, 'list_item': {} } } as unknown as Schema;
            const list_node = {} as unknown as NodeType;

            const test = wrapItemsWithListInternal(tr, sc, list_node, items, '');

            expect(test).toBeDefined();
        });
    });

});



