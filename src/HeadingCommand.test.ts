import HeadingCommand from './HeadingCommand';
import {EditorState, TextSelection} from 'prosemirror-state';
import * as prosmirrorutils from 'prosemirror-utils';
import { MARK_FONT_SIZE, MARK_FONT_TYPE } from './MarkNames';
import { HEADING } from './NodeNames';
import {Transform} from 'prosemirror-transform';
import {Schema} from 'prosemirror-model';
import {schema, builders} from 'prosemirror-test-builder';
import { ContentNodeWithPos } from 'prosemirror-utils';
describe('HeadingCommand', () => {
    let plugin!: HeadingCommand;
    beforeEach(() => {
        plugin = new HeadingCommand(1);
    });
    it('should create', () => {
        expect(plugin).toBeTruthy();
    });
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
    schema: { marks: { 'mark-font-type': MARK_FONT_TYPE, } },
  } as unknown as EditorState;



  it('should call when execute function return true', () => {
    const test = plugin.isActive(state);
    expect(test).toBe(true);
  });


  // it("should call when execute function return false",()=>{

  //   const state = {
  //     doc: {
  //       type: "doc",
  //       content: [
  //         {
  //           type: "paragraph",
  //           content: [
  //             {
  //               type: "text",
  //               text: "This is a mock Prosemirror state.",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     selection: {
  //       node: null,
  //       anchor: 0,
  //       head: 0,
  //     },
  //     plugins: [],
  //     schema: {marks:{  "mark-font-size": MARK_FONT_SIZE,}},
  //     tr:{doc:{nodeAt:(x)=>{return {isAtom:true,isLeaf:true,isText:false}}}},
  //   } as unknown as EditorState;


  //   const test = plugin.execute(state,(x)=>{return ''});
  //   expect(test).toBe(false)
  // })


});

describe('HeadingCommand', () => {
    let schema1;
    let command: HeadingCommand;
    let dispatch: jest.Mock;

    beforeEach(() => {
      schema1 = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks,
      });
      command = new HeadingCommand(1);
      dispatch = jest.fn();
    });

    it('should enable the command when text style mark is enabled', () => {
      const state = EditorState.create({schema: schema1});
      const isEnabled = command.isActive(state);
      expect(isEnabled).toBe(true);
    });

    it('should apply the font size mark to the current selection', () => {
      const state = EditorState.create({schema: schema1});
      command.execute(state, dispatch);
     // const transform = new Transform(schema);
      // command.executeCustom(state, transform, 1, 2);
      //expect(dispatch).not.toHaveBeenCalledWith(expect.any(transform));
    });
  });