import {UICommand} from '@modusoperandi/licit-doc-attrs-step';
import {applyMark} from './applyMark';
import {isTextStyleMarkCommandEnabled} from './isTextStyleMarkCommandEnabled';
import {Transaction, EditorState, TextSelection} from 'prosemirror-state';
import {MARK_FONT_SIZE} from './MarkNames';
import {Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import * as React from 'react';

function setFontSize(tr: Transform, schema: Schema, pt: number, isCustomStyleApplied?: boolean): Transform {
  const markType = schema.marks[MARK_FONT_SIZE];
  if (!markType) {
    return tr;
  }
  const attrs = pt ? {pt} : null;
  tr = applyMark(tr, schema, markType, attrs,isCustomStyleApplied);
  return tr;
}

export class FontSizeCommand extends UICommand {
  _popUp = null;
  _pt = 0;

  constructor(pt: number) {
    super();
    this._pt = pt;
  }

  isEnabled = (state: EditorState): boolean => {
    return isTextStyleMarkCommandEnabled(state, MARK_FONT_SIZE);
  };

  waitForUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _event?: React.SyntheticEvent
  ): Promise<undefined> => {
    return Promise.resolve(undefined);
  };

  executeWithUserInput = (
    _state: EditorState,
    _dispatch?: (tr: Transform) => void,
    _view?: EditorView,
    _inputs?: string
  ): boolean => {
    return false;
  };

  cancel(): void {
    return null;
  }

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void
    // view?: EditorView
  ): boolean => {
    const {schema} = state;
    // commnted selection because selection removes the storedMarks;
    // {selection}
    // const tr = setFontSize(state.tr.setSelection(selection), schema, this._pt);
    const tr = setFontSize(state.tr, schema, this._pt);
    if (tr.docChanged || (tr as Transaction).storedMarksSet) {
      // If selection is empty, the color is added to `storedMarks`, which
      // works like `toggleMark`
      // (see https://prosemirror.net/docs/ref/#commands.toggleMark).
      dispatch?.(tr);
      return true;
    }
    return false;
  };
  // [FS] IRAD-1087 2020-10-01
  // Method to execute custom styling implementation of font size
  executeCustom = (
    state: EditorState,
    tr: Transform,
    from: number,
    to: number
  ): Transform => {
    const {schema} = state;
    tr = setFontSize(
      (tr as Transaction).setSelection(TextSelection.create(tr.doc, from, to)),
      schema,
      this._pt,
      true
    );
    return tr;
  };

  isActive(): boolean {
    return true;
  }

  renderLabel() {
    return null;
  }
}
