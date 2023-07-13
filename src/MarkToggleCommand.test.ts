import { MARK_FONT_TYPE } from './MarkNames';
import MarkToggleCommand from './MarkToggleCommand';
import { EditorState } from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';

describe('MarkToggleCommand', () => {
    let plugin!: MarkToggleCommand;
    beforeEach(() => {
        plugin = new MarkToggleCommand('bold');
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });


    it('should call when executeCustom function return first false',()=>{
        const state = {
           
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:{ 'mark-font-type': undefined,}},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

          const test = plugin.executeCustom(state,tr,2,2);
          expect(test).toBe(false)
    })

    it('should call when executeCustom function return second false',()=>{
        const state = {
           
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:"vlaue"},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

          const test = plugin.executeCustom(state,tr,1,2);
          expect(test).toBe(false)
    })

    it('should call when isActive function return false',()=>{
        const state = {
           
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 5,
              to: 2,
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:'value'},
          } as unknown as EditorState;

          const test = plugin.isActive(state);
          expect(test).toBe(false);

    })

    it('should call when excute function return false',()=>{
        const state = {
            doc: {
              
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
            schema: {marks:{ 'mark-font-type': undefined,}},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

         const test = plugin.execute(state);
         expect(test).toBe(false);
         

    })
    it('should call when excute function return false',()=>{
        const state = {
            doc: {
              
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
            schema: {marks:'value'},
          } as unknown as EditorState;

        //  const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

         const test = plugin.execute(state);
         expect(test).toBe(false);
         

    })

    it('should call when excute function return tr',()=>{
        const state = {
            doc: {
              
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
              empty:1,
              ranges:3,
              $cursor:6
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:"vlaue"},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

          const test = plugin.executeCustom(state,tr,2,2);
          expect(test).toBe(tr);
    })

    it('should call when excute function return false',()=>{
        const state = {
            doc: {
              type: {allowsMarkType:(x)=>{return false},},

              nodesBetween:(x,y,z:(node)=>{return })=>{},
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
              ranges:[{
                $from: {
                  pos: 1, 
                  depth: 0, 
                },
                $to: {
                  pos: 5, 
                },
                
                from: 1,
                to: 5, 
              }],
              $cursor:{parentOffset:0,marks:()=>{}}
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:"vlaue"},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}}as unknown as Transform ;

          const test = plugin.executeCustom(state,tr,1,21);
          expect(test).toBeDefined();
    })

    it('should call when excute function return true',()=>{
        const state = {
            doc: {
              type: {allowsMarkType:(x)=>{return true},},

              nodesBetween:(x,y,z:(node)=>{return })=>{},
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 1,
              to: 2,
              ranges:[{
                $from: {
                  pos: 1, 
                  depth: 0, 
                },
                $to: {
                  pos: 5, 
                },
                
                from: 1,
                to: 5, 
              }],
              $cursor:{parentOffset:0,marks:()=>{}}
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:{'bold':{create:(attributes)=>{return 'created_attrs'}}}},
          } as unknown as EditorState;

         const tr =  {doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}},addMark:(x,y,z)=>{return ''}}as unknown as Transform ;

          const test = plugin.executeCustom(state,tr,1,21);
          expect(test).toBeDefined();
    })
    it('should call when isActive function return false',()=>{
        const state = {
            doc: {
              nodeAt:(x)=>{return ''}
            },
            selection: {
              node: null,
              anchor: 0,
              head: 0,
              from: 2,
              to: 3,
            } ,
            plugins: [],
            tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
            schema: {marks:{'bold':{create:(attributes)=>{return 'created_attrs'}}}},
          } as unknown as EditorState;

          const test = plugin.isActive(state);
          expect(test).toBe(false);

    })
});