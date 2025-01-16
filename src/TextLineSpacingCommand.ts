import { UICommand } from '@modusoperandi/licit-doc-attrs-step';
import { Transaction, EditorState } from 'prosemirror-state';
import { BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH } from './NodeNames';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import {
  DOUBLE_LINE_SPACING,
  SINGLE_LINE_SPACING,
  LINE_SPACING_115,
  LINE_SPACING_150,
} from './ui/toCSSLineSpacing';
import * as React from 'react';

export function setTextLineSpacing(
  tr: Transform,
  schema: Schema,
  lineSpacing?: string
): Transform {
  const { selection, doc } = tr as Transaction;
  if (!selection || !doc) {
    return tr;
  }

  const { from, to } = selection;
  const paragraph = schema.nodes[PARAGRAPH];
  const heading = schema.nodes[HEADING];
  const listItem = schema.nodes[LIST_ITEM];
  const blockquote = schema.nodes[BLOCKQUOTE];
  if (!paragraph && !heading && !listItem && !blockquote) {
    return tr;
  }

  const tasks = [];
  const lineSpacingValue = lineSpacing || null;

  doc.nodesBetween(from, to, (node, pos, _parentNode) => {
    const nodeType = node.type;
    if (
      nodeType === paragraph ||
      nodeType === heading ||
      nodeType === listItem ||
      nodeType === blockquote
    ) {
      const lineSpacing = node.attrs.lineSpacing || null;
      if (lineSpacing !== lineSpacingValue) {
        tasks.push({
          node,
          pos,
          nodeType,
        });
      }
      return nodeType === listItem;
    }
    return true;
  });

  if (!tasks.length) {
    return tr;
  }

  tasks.forEach((job) => {
    const { node, pos, nodeType } = job;
    let { attrs } = node;
    if (lineSpacingValue) {
      attrs = {
        ...attrs,
        lineSpacing: lineSpacingValue,
      };
    } else {
      attrs = {
        ...attrs,
        lineSpacing: null,
      };
    }
    tr = tr.setNodeMarkup(pos, nodeType, attrs, node.marks);
  });

  return tr;
}

function createGroup(): Array<{ [key: string]: TextLineSpacingCommand }> {
  const group = {
    Single: new TextLineSpacingCommand(SINGLE_LINE_SPACING),
    '1.15': new TextLineSpacingCommand(LINE_SPACING_115),
    '1.5': new TextLineSpacingCommand(LINE_SPACING_150),
    Double: new TextLineSpacingCommand(DOUBLE_LINE_SPACING),
  };
  return [group];
}

export class TextLineSpacingCommand extends UICommand {
  _lineSpacing?: string;

  static readonly createGroup = createGroup;

  constructor(lineSpacing?: string) {
    super();
    this._lineSpacing = lineSpacing;
  }

  isActive = (state: EditorState): boolean => {
    const { selection, doc, schema } = state;
    const { from, to } = selection;
    const paragraph = schema.nodes[PARAGRAPH];
    const heading = schema.nodes[HEADING];
    let keepLooking = true;
    let active = false;
    doc.nodesBetween(from, to, (node, _pos) => {
      const nodeType = node.type;
      if (
        keepLooking &&
        (nodeType === paragraph || nodeType === heading) &&
        node.attrs.lineSpacing === this._lineSpacing
      ) {
        keepLooking = false;
        active = true;
      }
      return keepLooking;
    });
    return active;
  };

  isEnabled = (state: EditorState): boolean => {
    return this.isActive(state) || this.execute(state);
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
    dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    const { schema, selection } = state;
    let tr = setTextLineSpacing(
      state.tr.setSelection(selection),
      schema,
      this._lineSpacing
    );
    if (tr.docChanged) {
      // set the value of overriddenLineSpacing to true if the user override the line spacing style.
      if (
        selection.$head?.parent?.attrs?.lineSpacing !== this._lineSpacing
      ) {
        const nodePos = Math.max(0, selection.head - selection.$head.parentOffset - 1);
        const node = tr.doc.nodeAt(nodePos);
        if(node){
          const newAttrs = { 
            ...node.attrs, 
            overriddenLineSpacing: true, 
            overriddenLineSpacingValue: this._lineSpacing 
          };
         tr = tr.setNodeMarkup(nodePos, null, newAttrs);
      }
      dispatch?.(tr as Transaction);
    }
      return true;
    } else {
      return false;
    }
  };

  renderLabel() {
    return null;
  }

  executeCustom = (_state: EditorState, tr: Transform): Transform => {
    return tr;
  };
}
