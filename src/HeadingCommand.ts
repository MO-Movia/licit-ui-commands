import { EditorState } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
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
}

export default HeadingCommand;
