import { Selection, NodeSelection } from 'prosemirror-state';
import { NodeType } from 'prosemirror-model';
import { CellSelection, TableMap } from 'prosemirror-tables';

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

export function getSelectedCellPositions(selection: Selection): number[] {
  if (!(selection instanceof CellSelection)) {
    return [];
  }

  const positions: number[] = [];

  const table = selection.$anchorCell.node(-1); // The parent table node
  const map = TableMap.get(table);
  const start = selection.$anchorCell.start(-1); // Position where table content starts

  const rect = map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start);

  for (let row = rect.top; row < rect.bottom; row++) {
    for (let col = rect.left; col < rect.right; col++) {
      const cellIndex = row * map.width + col;
      const cellPos = map.map[cellIndex] + start;
      positions.push(cellPos);
    }
  }

  return positions;
}

export function isColumnCellSelected(selection: Selection): boolean {
  if (!(selection instanceof CellSelection)) {
    return false;
  }

  const $anchor = selection.$anchorCell;
  const $head = selection.$headCell;
  const table = $anchor.node(-1);
  const tableStart = $anchor.start(-1);
  const map = TableMap.get(table);

  const rect = map.rectBetween($anchor.pos - tableStart, $head.pos - tableStart);

  const isFullHeight = rect.top === 0 && rect.bottom === map.height;
  return isFullHeight;
}
