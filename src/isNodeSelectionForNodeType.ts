import {Selection, NodeSelection} from 'prosemirror-state';
import {NodeType} from 'prosemirror-model';
import { CellSelection } from 'prosemirror-tables';

// Whether the selection is a node for the node type provided.
export function isNodeSelectionForNodeType(
  selection: Selection,
  nodeType: NodeType
): boolean {
  if (selection instanceof NodeSelection) {
    return selection.node.type === nodeType;
  }
  return false;
}

export function getSelectionRange(selection: Selection): { from: number; to: number } {
  if (selection instanceof CellSelection) {
    const $anchor = selection.$anchorCell;
    const $head = selection.$headCell;

    const firstCell = $anchor.pos < $head.pos ? $anchor : $head;
    const lastCell = $anchor.pos < $head.pos ? $head : $anchor;

    return {
      from: firstCell.pos,
      to: lastCell.pos + lastCell.nodeAfter.nodeSize,
    };
  }
  return { from: selection.from, to: selection.to };
}
