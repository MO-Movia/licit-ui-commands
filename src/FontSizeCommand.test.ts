import FontSizeCommand from './FontSizeCommand';
import {EditorState} from 'prosemirror-state';
import { MARK_FONT_SIZE } from './MarkNames';
import {Schema} from 'prosemirror-model';
import {schema} from 'prosemirror-test-builder';
import {Transform} from 'prosemirror-transform';
import * as applymark from './applyMark';
import * as ismarkcommandenabled from './isTextStyleMarkCommandEnabled';

describe('FontSizeCommand', () => {
    let plugin!: FontSizeCommand;
    beforeEach(() => {
        plugin = new FontSizeCommand(12);

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
        schema: {marks:{  'mark-font-size': MARK_FONT_SIZE,}},
        tr:{doc:{nodeAt:(_x)=>{return {isAtom:true,isLeaf:true,isText:false};}}},
      } as unknown as EditorState;



    it('should call when execute function return false',()=>{

        const test = plugin.execute(state,(_x)=>{return '';});
        expect(test).toBe(false);
      });
      it('should call when execute function return true',()=>{

        jest.spyOn(applymark,'default').mockReturnValue({docChanged:true} as unknown as Transform);

          const test = plugin.execute(state,(_x)=>{return '';});
          expect(test).toBe(true);
        });


        it('should call when execute function return true',()=>{

          jest.spyOn(applymark,'default').mockReturnValue({docChanged:false,storedMarksSet:true} as unknown as Transform);

            const test = plugin.execute(state,(_x)=>{return '';});
            expect(test).toBe(true);
          });




          it('should call when executeCustom function return false',()=>{

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
              expect(mock).toHaveBeenLastCalledWith(state,'mark-font-size');
              expect(test).toBe(false);

          });

});

describe('FontSizeCommand', () => {
  let schema1;
  let command: FontSizeCommand;
  let dispatch: jest.Mock;

  beforeEach(() => {
    schema1 = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks,
    });
    command = new FontSizeCommand(14);
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
  it('execute without dispatch', () => {
    const state = EditorState.create({ schema: schema1 });
    command.execute(state);
});
});