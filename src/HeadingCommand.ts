import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { ContentNodeWithPos, findParentNodeOfType } from 'prosemirror-utils';
import { EditorView } from 'prosemirror-view';

import { HEADING } from './NodeNames';
import noop from './noop';
import toggleHeading from './toggleHeading';
import { UICommand } from '@modusoperandi/licit-doc-attrs-step';

class HeadingCommand extends UICommand {
  _level: number;

  constructor(level: number) {
    super();
    this._level = level;
  }

  isActive = (_state: EditorState): boolean => {
    return true;
  };

  execute = (
    state: EditorState,
    dispatch?: (tr: Transform) => void,
    _view?: EditorView
  ): boolean => {
    dispatch = dispatch || noop;
    const { schema, selection } = state;
    const tr = toggleHeading(
      state.tr.setSelection(selection),
      schema,
      this._level
    );
    if (tr.docChanged) {
      dispatch(tr);
      return true;
    } else {
      return false;
    }
  };

  _findHeading(state: EditorState): ContentNodeWithPos | void {
    const heading = state.schema.nodes[HEADING];
    const fn = heading ? findParentNodeOfType(heading) : noop;
    return fn(state.selection);
  }
}

export default HeadingCommand;
