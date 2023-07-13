import { render } from 'enzyme';
import FontTypeCommand from './FontTypeCommand';
import * as ismarkcommandenabled from './isTextStyleMarkCommandEnabled';
import {EditorState, TextSelection} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {schema, builders} from 'prosemirror-test-builder';
import React from 'react';
import * as applymark from './applyMark';
import {Transform} from 'prosemirror-transform';

describe('FontSizeCommand', () => {
  let schema1;
  let command: FontTypeCommand;
  let dispatch: jest.Mock;

  beforeEach(() => {
    schema1 = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    command = new FontTypeCommand('Arial');
    dispatch = jest.fn();
  });


  it('should enable the command when text style mark is enabled', () => {
    const state = EditorState.create({schema: schema1});
    const isEnabled = command.isEnabled(state);
    expect(isEnabled).toBe(false);
  });


  it('should apply the font size mark to the current selection', () => {
    const state = EditorState.create({schema: schema1});
    command.execute(state, dispatch);
    const transform = new Transform(schema);
    // command.executeCustom(state, transform, 1, 2);
    expect(dispatch).not.toHaveBeenCalledWith(expect.any(transform));
  });

  
  it('should apply the font size mark to the current selection', () => {
    const state = EditorState.create({schema: schema1});
    command.execute(state, null);
    const transform = new Transform(schema);
    // command.executeCustom(state, transform, 1, 2);
    expect(dispatch).not.toHaveBeenCalledWith(expect.any(transform));
  });
});

describe('FontTypeCommand', () => {
    let plugin!: FontTypeCommand;
    beforeEach(() => {
        plugin = new FontTypeCommand('Arielle');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });

    const MARK_FONT_TYPE = {
      attrs: {
        fontType: { default: 'Arial' },
      },
      parseDOM: [
        {
          style: 'font-family',
          getAttrs: (value) => ({ fontType: value }),
        },
      ],
      toDOM: (mark) => ['span', { style: `font-family: ${mark.attrs.fontType}` }, 0],
    };


    it('should call isEnabled when mark-font-size undefined',()=>{
      const MARK_FONT_TYPE = {
        attrs: {
          fontType: { default: 'Arial' },
        },
        parseDOM: [
          {
            style: 'font-family',
            getAttrs: (value) => ({ fontType: value }),
          },
        ],
        toDOM: (mark) => ['span', { style: `font-family: ${mark.attrs.fontType}` }, 0],
      };

        const mock = jest.spyOn(ismarkcommandenabled,'default');

        const state = {
            doc: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'This is a mock Prosemirror state.',
                    },
                  ],
                },
              ],
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 0,
              to: 0,
            },
            plugins: [],
            schema: {marks:{'mark-font-size':undefined}},
          } as unknown as EditorState;

        const test = plugin.isEnabled(state);
        //expect(mock).toHaveBeenLastCalledWith(state,"mark-font-size");
        expect(test).toBe(false);
    });


    it('should call isEnabled when mark-font-size value is aviable',()=>{


        const mock_call = jest.spyOn(ismarkcommandenabled,'default');

        const state = {
            doc: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'This is a mock Prosemirror state.',
                    },
                  ],
                },
              ],
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
          } as unknown as EditorState;

          const test = plugin.isEnabled(state);
          plugin.execute(state, jest.fn());
          //expect(mock_call).toHaveBeenLastCalledWith(state,"mark-font-size");
          expect(test).toBe(false);
    });


    it("should call when isEnabled function return 'true' ",()=>{

      const state = {
        doc: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is a mock Prosemirror state.',
                },
              ],
            },
          ],
        },
        selection: {
          node: null,
          anchor: 0,
          head: 0,
        },
        plugins: [],
        schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
      } as unknown as EditorState;

      const test = plugin.isEnabled(state);
      expect(test).toBe(true);
    });


    it("should call when renderLabel function return 'null' ",()=>{
      const state = {
        doc: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is a mock Prosemirror state.',
                },
              ],
            },
          ],
        },
        selection: {
          node: null,
          anchor: 0,
          head: 0,
        },
        plugins: [],
        schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
      } as unknown as EditorState;

      const test = plugin.renderLabel(state);

      const htmlElement = '<span style={{"fontFamily": "Arielle"}}>Arielle</span>' as unknown as HTMLElement;
     // expect(test).toBe(htmlElement) TODO

    });


    it('should call when execute function return false',()=>{


      const state = {
        doc: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'This is a mock Prosemirror state.',
                },
              ],
            },
          ],
        },
        selection: {
          node: null,
          anchor: 0,
          head: 0,
        },
        plugins: [],
        schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
        tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
      } as unknown as EditorState;


      const test = plugin.execute(state,(x)=>{return '';});
      expect(test).toBe(false);
    });

    
    it('should call when execute function return true',()=>{
      jest.spyOn(applymark,'default').mockReturnValue({docChanged:true} as unknown as Transform);
        const state = {

          selection: {
            node: null,
            anchor: 0,
            head: 0,
          },
          plugins: [],
          schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
          tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
        } as unknown as EditorState;


        const test = plugin.execute(state,(x)=>{return '';});
        expect(test).toBe(true);
      });


      it('should call when execute function return true',()=>{
        jest.spyOn(applymark,'default').mockReturnValue({docChanged:false,storedMarksSet:true} as unknown as Transform);
          const state = {

            selection: {
              node: null,
              anchor: 0,
              head: 0,
            },
            plugins: [],
            schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
          } as unknown as EditorState;


          const test = plugin.execute(state,(x)=>{return '';});
          expect(test).toBe(true);
        });

    it('should handle executecustom',()=>{
      jest.spyOn(TextSelection,'create').mockReturnValue({} as unknown as TextSelection)
      const state = {

        selection: {
          node: null,
          anchor: 0,
          head: 0,
        },
        plugins: [],
        schema: {marks:{ 'mark-font-type': MARK_FONT_TYPE,}},
        tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
      } as unknown as EditorState;
      const tr = {setSelection:()=>{return {}},doc:{}} as unknown as Transform
      expect(plugin.executeCustom(state,tr,0,1)).toBeDefined();
    })
      });


