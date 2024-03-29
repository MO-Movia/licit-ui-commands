import {isNodeSelectionForNodeType} from './isNodeSelectionForNodeType';
import {MATH} from './NodeNames';
import {EditorState} from 'prosemirror-state';
import {MARK_FONT_SIZE, MARK_TEXT_COLOR} from './MarkNames';

const VALID_MATH_MARK_NAMES = new Set([MARK_FONT_SIZE, MARK_TEXT_COLOR]);

// Whether the command for apply specific text style mark is enabled.
export function isTextStyleMarkCommandEnabled(
  state: EditorState,
  markName: string
): boolean {
  const {selection, schema, tr} = state;
  const markType = schema.marks[markName];
  if (!markType) {
    return false;
  }
  const mathNodeType = schema.nodes[MATH];
  if (
    mathNodeType &&
    VALID_MATH_MARK_NAMES.has(markName) &&
    isNodeSelectionForNodeType(selection, mathNodeType)
  ) {
    // A math node is selected.
    return true;
  }

  const {from, to} = state.selection;

  if (to === from + 1) {
    const node = tr.doc.nodeAt(from);
    if (node.isAtom && !node.isText && node.isLeaf) {
      // An atomic node (e.g. Image) is selected.
      return false;
    }
  }

  return true;
}
