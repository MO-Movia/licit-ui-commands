import toggleHeading from './toggleHeading';
import { doc, p } from 'prosemirror-test-builder';
import { Fragment, Node, NodeType, Schema, NodeSpec } from 'prosemirror-model';
import { TextSelection, Transaction, EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH, TEXT } from './NodeNames';
import * as isListNode from './isListNode'
import * as isInsideListItem from './isInsideListItem'

describe('toggleHeading', () => {
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
            attrs:{lineSpacing: { default: 'test' }},
            content: 'block+',
          },
          paragraph: {
            attrs:{lineSpacing: { default: 'test' }},
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
            attrs:{lineSpacing: { default: 'test' }},
            content: 'paragraph',
            defining: true,
          },
          blockquote: {
            attrs:{lineSpacing: { default: 'test' }},
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
        mySchema.node('heading',{ lineSpacing: 'test' }, [
          mySchema.text('Heading 1'),
        ]),
        mySchema.node('paragraph', { lineSpacing: 'test'}, [
          mySchema.text('This is a paragraph'),
        ]),
        mySchema.node('bullet_list', { lineSpacing: 'test'}, [
          mySchema.node('list_item',{ lineSpacing: 'test'}, [
            mySchema.node('paragraph', { lineSpacing: 'test'}, [
              mySchema.text('List item 1'),
            ]),
          ]),
          mySchema.node('list_item', { lineSpacing: 'test'}, [
            mySchema.node('paragraph', { lineSpacing: 'test'}, [
              mySchema.text('List item 2'),
            ]),
          ]),
        ]),
        mySchema.node('blockquote',  { lineSpacing: 'test' }, [
          mySchema.node('paragraph', { lineSpacing: 'test'}, [
            mySchema.text('This is a blockquote'),
          ]),
        ]),
      ]);


    it('should be return tr',()=>{



        const tr = {} as unknown as Transform;
        const sc = {nodes :{"blockquote":BLOCKQUOTE,'heading':HEADING, 'paragraph':PARAGRAPH,'list_item':LIST_ITEM}} as unknown as Schema

        const test = toggleHeading(tr,sc,1);
        expect(test).toStrictEqual({})

    })

    it('should be check the condition nodeType === blockquote',()=>{

        const tr = {selection:{from:2, to:4} ,doc:dummyDoc} as unknown as Transform;
        const sc = {nodes :{"blockquote":BLOCKQUOTE,'heading':HEADING, 'paragraph':PARAGRAPH,'list_item':LIST_ITEM}} as unknown as Schema

        const test = toggleHeading(tr,sc,1);
        expect(test).toBeDefined() 

    })

 

    it('should be check the condition isInsideListItem(tr.doc, pos)',()=>{

        const tr = {selection:{from:2, to:4} ,doc:dummyDoc,nodeAt:(a)=>{return undefined}} as unknown as Transform;
        const sc = {nodes :{'heading': HEADING,"blockquote":BLOCKQUOTE,'paragraph':PARAGRAPH,'list_item':LIST_ITEM}} as unknown as Schema;
        jest.spyOn(isListNode, 'default').mockReturnValueOnce(false ).mockReturnValueOnce(true ) as unknown as Node

        jest.spyOn(isInsideListItem, 'default').mockReturnValue(true)as unknown as Node

        const test = toggleHeading(tr,sc,0);
        expect(test).toBeDefined() 

    })
    it('should be check the condition level !== null',()=>{

        const tr = {selection:{from:2, to:4} ,doc:dummyDoc,nodeAt:(a)=>{return undefined},getMeta: (a) => { return 'dryrun'}} as unknown as Transform;
        const sc = {nodes :{'heading': HEADING,"blockquote":BLOCKQUOTE,'paragraph':PARAGRAPH,'list_item':LIST_ITEM}} as unknown as Schema;
        jest.spyOn(isInsideListItem, 'default').mockReturnValue(false)as unknown as Node
        jest.spyOn(isListNode, 'default').mockReturnValue(true ).mockReturnValue(true )as unknown as Node



        const test = toggleHeading(tr,sc,0);
        expect(test).toBeDefined() 

    })

    // xit('should be check the condition level !== null',()=>{

    //     const tr = {selection:{from:2, to:4} ,doc:dummyDoc,nodeAt:(a)=>{return undefined}} as unknown as Transform;
    //     const sc = {nodes :{'text':TEXT,'heading': HEADING,"blockquote":BLOCKQUOTE,'paragraph':PARAGRAPH,'list_item':LIST_ITEM}} as unknown as Schema;
     
    //     const test = toggleHeading(tr,sc,0);
    //     expect(test).toBeDefined() 

    // })

    // xit('should be check the condition !selection',()=>{
    //     const tr = {doc:dummyDoc,getMeta: (x) => { return 'dryrun' },delete:()=>{}} as unknown as Transform;
    //     const sc = {nodes:{'paragraph':PARAGRAPH, 'heading':HEADING,'blockquote':BLOCKQUOTE,'list_item':LIST_ITEM}} as unknown as Schema;
    //     const test = toggleHeading(tr,sc,0);
    //     expect(test).toBeDefined() 
    // })
  


})