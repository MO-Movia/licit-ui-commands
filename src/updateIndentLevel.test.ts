import updateIndentLevel from './updateIndentLevel';
import { doc, p } from 'prosemirror-test-builder';
import { Fragment, Node, NodeType, Schema, NodeSpec } from 'prosemirror-model';
import { TextSelection, Transaction, EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import * as prossermirror_utlites from 'prosemirror-utils'
import { ContentNodeWithPos } from 'prosemirror-utils';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import { MARK_TEXT_SELECTION } from './MarkNames';
import * as applymark from './applyMark';
import * as consolidateListNodes from './consolidateListNodes'
import * as isListNode from './isListNode'
import { EditorView } from 'prosemirror-view';



describe('updateIndentLevel', () => {
    let schema;
    let doc;
    let state;
    let trr;
    let schemaa: Schema;
    let listNodeType: NodeType;

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


        doc = schema.node('doc', {}, [schema.text('Hello world')]);
        state = EditorState.create({ schema, doc });

        trr = document.createElement("tr");
        // Add some descendant nodes for testing
        trr.innerHTML = "<td>Cell 1</td><td>Cell 2</td><td>Cell 3</td>";



    });
    const mySchema = new Schema({
        nodes: {
            doc: {
                attrs: { indent: { default: 'test' } },
                content: 'block+',
            },
            paragraph: {
                attrs: { indent: { default: 'test' } },
                content: 'text*',
                group: 'block',
            },
            heading: {
                attrs: { indent: { default: 'test' } },
                content: 'text*',
                group: 'block',
                defining: true,
            },
            bullet_list: {
                content: 'list_item+',
                group: 'block',
            },
            list_item: {
                attrs: { indent: { default: 'test' } },
                content: 'paragraph',
                defining: true,
            },
            blockquote: {
                attrs: { indent: { default: 'test' } },
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
        mySchema.node('heading', { indent: 'test' }, [
            mySchema.text('Heading 1'),
        ]),
        mySchema.node('paragraph', { indent: 'test' }, [
            mySchema.text('This is a paragraph'),
        ]),
        mySchema.node('bullet_list', { indent: 'test' }, [
            mySchema.node('list_item', { indent: 'test' }, [
                mySchema.node('paragraph', { indent: 'test' }, [
                    mySchema.text('List item 1'),
                ]),
            ]),
            mySchema.node('list_item', { indent: 'test' }, [
                mySchema.node('paragraph', { indent: 'test' }, [
                    mySchema.text('List item 2'),
                ]),
            ]),
        ]),
        mySchema.node('blockquote', { indent: 'test' }, [
            mySchema.node('paragraph', { indent: 'test' }, [
                mySchema.text('This is a blockquote'),
            ]),
        ]),
    ]);



    it('should be check the condition !doc',()=>{
        const state = {} as unknown as EditorState;
        const tr = {selection:{from:1,to:2}} as unknown as Transform;
        const sc = {} as unknown as Schema;
        const view = {} as unknown as EditorView

        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    });
    it('should be check the condition !selection',()=>{
        const state = {} as unknown as EditorState;
        const tr = {doc:dummyDoc} as unknown as Transform;
        const sc = {} as unknown as Schema;
        const view = {} as unknown as EditorView

        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    })
    it('should be check the condition !listNodePoses.length',()=>{
        const state = {} as unknown as EditorState;
        const tr = {doc:dummyDoc,selection:{from:1,to:2}} as unknown as Transform;
        const sc = {nodes:{'paragraph':PARAGRAPH, 'heading':HEADING,'blockquote':BLOCKQUOTE}} as unknown as Schema;
        const view = {} as unknown as EditorView

        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    })

    it('should be check the condition inside setListNodeIndent function() !listItem',()=>{
        const state = {} as unknown as EditorState;
        const tr = {doc:dummyDoc,selection:{from:1,to:2},getMeta: (x) => { return 'dryrun' }} as unknown as Transform;
        const sc = {nodes:{'paragraph':PARAGRAPH, 'heading':HEADING,'blockquote':BLOCKQUOTE}} as unknown as Schema;
        const view = {} as unknown as EditorView
        jest.spyOn(isListNode, 'default').mockReturnValue(true) as unknown as Node
        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    })

    it('should be return tr inside setListNodeIndent function()',()=>{
        const state = {} as unknown as EditorState;
        const tr = {doc:dummyDoc,selection:{from:1,to:2},getMeta: (x) => { return 'dryrun' },delete:()=>{}} as unknown as Transform;
        const sc = {nodes:{'paragraph':PARAGRAPH, 'heading':HEADING,'blockquote':BLOCKQUOTE,'list_item':LIST_ITEM}} as unknown as Schema;
        const view = {} as unknown as EditorView
        jest.spyOn(isListNode, 'default').mockReturnValue(true) as unknown as Node
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue( tr as unknown as Transform ) 
        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    })
    xit('should be return tr inside setListNodeIndent function()',()=>{
        const state = {} as unknown as EditorState;
        const tr = {doc:dummyDoc,selection:{from:1,to: 2},getMeta: (x) => { return 'dryrun' },delete:()=>{}} as unknown as Transform;
        const sc = {nodes:{'paragraph':PARAGRAPH, 'heading':HEADING,'blockquote':BLOCKQUOTE,'list_item':LIST_ITEM}} as unknown as Schema;
        const view = {} as unknown as EditorView
        jest.spyOn(isListNode, 'default').mockReturnValue(true) as unknown as Node
        jest.spyOn(consolidateListNodes, 'default').mockReturnValue( tr as unknown as Transform ) 
        const test = updateIndentLevel(state,tr,sc,5,view);
        expect(test).toBeTruthy()

    })

})