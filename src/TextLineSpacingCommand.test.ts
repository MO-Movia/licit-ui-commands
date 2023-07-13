import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import TextLineSpacingCommand from './TextLineSpacingCommand';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import * as setTextLineSpacing from './TextLineSpacingCommand';
import { Transform } from 'prosemirror-transform';
const { schema } = require('prosemirror-schema-basic');
const { Schema } = require('prosemirror-model');

describe('TextLineSpacingCommand', () => {
    let plugin!: TextLineSpacingCommand;
    beforeEach(() => {
        plugin = new TextLineSpacingCommand('tab');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
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



    it('should be check condition !selection',()=>{
        const state = {
            selection:{to:2, from:1},
            schema: {nodes: {'heading':HEADING, 'paragraph': PARAGRAPH } },
            doc:{nodesBetween:(x,y,z:(a,b)=>{return})=>{return }},
            tr:{setSelection:(selection)=>{return true}}
        } as unknown as EditorState;
         
        const test = plugin.isEnabled(state);

        expect(test).toBeFalsy()
    })

    
    

    it('should be check condition !doc',()=>{
        const state = {
            selection:{to:2, from:1},
            schema: {nodes: {'heading':undefined, 'paragraph': undefined, 'list_item':undefined, 'blockquote':undefined } },
            doc:{nodesBetween:(x,y,z:(a,b)=>{return})=>{return }},
            tr:{setSelection:(selection)=>{return {doc:{nodesBetween:(x,y,z:(a,b)=>{return})=>{return }},selection:{from:1, to:2}}}}
        } as unknown as EditorState;
         
        const test = plugin.isEnabled(state);

        expect(test).toBe(false)
    })

    it('should be check the condition docChanged:false',()=>{
        
       
        const state = {
            selection:{to:2, from:1},
            schema: {nodes: {'heading':HEADING, 'paragraph': PARAGRAPH, 'list_item':LIST_ITEM, 'blockquote':BLOCKQUOTE } },
            doc:{nodesBetween:(x,y,z:(a,b)=>{return})=>{return }},
            tr:{setSelection:(selection)=>{return {doc:dummyDoc,selection:{from:1, to:2}}}}
        } as unknown as EditorState;
         
        const test = plugin.isEnabled(state);

        expect(test).toBeFalsy()
    })


    it('should be check the condition docChanged:true',()=>{

       
        const state = {
            selection:{to:2, from:1},
            schema: {nodes: {'heading':HEADING, 'paragraph': PARAGRAPH } },
            doc:dummyDoc,
            tr:{setSelection:(selection)=>{return {docChanged:true}}}
        } as unknown as EditorState;
         
        const test = plugin.isEnabled(state);

        expect(test).toBeTruthy()
    })

    xit('',()=>{

       
        const state = {
            selection:{to:2, from:1},
            schema: {nodes: {'heading':HEADING, 'paragraph': PARAGRAPH } },
            doc:dummyDoc,
            tr:{setSelection:(selection)=>{return true}}
        } as unknown as EditorState;
         
        const test = plugin.isEnabled(state);

        expect(test).toBeFalsy()
    })

});