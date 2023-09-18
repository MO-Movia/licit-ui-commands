import * as React from 'react';
import ColorEditor from './ui/ColorEditor';
import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import applyMark from './applyMark';
import createPopUp from './ui/createPopUp';
import findNodesWithSameMark from './findNodesWithSameMark';
import isTextStyleMarkCommandEnabled from './isTextStyleMarkCommandEnabled';
import nullthrows from 'nullthrows';
import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {MARK_TEXT_COLOR} from './MarkNames';
import {Transform} from 'prosemirror-transform';

class TextColorCommand extends UICommand {
  _popUp = null;
  _color = '';

  constructor(color?: string) {
    super();
    this._color = color;
  }
  isEnabled = (state: EditorState): boolean => {
    return isTextStyleMarkCommandEnabled(state, MARK_TEXT_COLOR);
  };

  waitForUserInput = (
    state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    event?: React.SyntheticEvent
  ): Promise<undefined> => {
    if (this._popUp) {
      return Promise.resolve(undefined);
    }
    const target = nullthrows(event).currentTarget;
    if (!(target instanceof HTMLElement)) {
      return Promise.resolve(undefined);
    }

    const {doc, selection, schema} = state;
    const markType = schema.marks[MARK_TEXT_COLOR];
    const anchor = event ? event.currentTarget : null;
    const {from, to} = selection;
    const result = findNodesWithSameMark(doc, from, to, markType);
    const hex = result ? result.mark.attrs.color : null;
    return new Promise((resolve) => {
      this._popUp = createPopUp(
        ColorEditor,
        {hex},
        {
          anchor,
          popUpId: 'mo-menuList-child',
          onClose: (val) => {
            if (this._popUp) {
              this._popUp = null;
              resolve(val);
            }
          },
        }
      );
    });
  };

  executeWithUserInput = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    color?: string
  ): boolean => {
    if (dispatch && color !== undefined) {
      const {schema} = state;
      const markType = schema.marks[MARK_TEXT_COLOR];
      const attrs = color ? {color} : null;
      const tr = applyMark(state.tr, schema, markType, attrs);
      if (tr.docChanged || (tr as Transaction).storedMarksSet) {
        // If selection is empty, the color is added to `storedMarks`, which
        // works like `toggleMark`
        // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
        dispatch(tr);
        return true;
      }
    }
    return false;
  };
  // [FS] IRAD-1087 2020-09-30
  // Method to execute custom styling implementation of Text color
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform => {
    const {schema} = state;
    const markType = schema.marks[MARK_TEXT_COLOR];
    const attrs = {color: this._color};
    const storedmarks = (tr as Transaction).storedMarks;
    // [FS] IRAD-1043 2020-10-27
    // Issue fix on removing the  custom style if user click on the same style menu multiple times
    tr = applyMark(
      (tr as Transaction).setSelection(TextSelection.create(tr.doc, from, to)),
      schema,
      markType,
      attrs,
      true
    );
    (tr as Transaction).storedMarks = storedmarks;
    return tr;
  };
}

export default TextColorCommand;
