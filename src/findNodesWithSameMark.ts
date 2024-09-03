import {Mark, MarkType, Node} from 'prosemirror-model';

type Result = {
  mark: Mark;
  from: {
    node: Node;
    pos: number;
  };
  to: {
    node: Node;
    pos: number;
  };
};

// If nodes within the same range have the same mark, returns
// the first node.
function findMarkInNode(node: Node | null, markType: MarkType): Mark | null {
  if (!node?.marks) return null;
  return node.marks.find((mark) => mark.type === markType) || null;
}

function extendPosition(doc: Node, start: number, end: number, markType: MarkType, mark: Mark, step: number): { node: Node | null, pos: number } {
  let pos = start;
  let node = doc.nodeAt(pos);
  while (node && pos !== end) {
    const foundMark = findMarkInNode(node, markType);
    if (!foundMark || foundMark !== mark) break;
    pos += step;
    node = doc.nodeAt(pos);
  }
  return { node, pos: pos - step };
}

export function findNodesWithSameMark(
  doc: Node,
  from: number,
  to: number,
  markType: MarkType
): Result | null {
  const firstNode = doc.nodeAt(from);
  const firstMark = findMarkInNode(firstNode, markType);
  if (!firstMark) return null;

  for (let ii = from; ii <= to; ii++) {
    const node = doc.nodeAt(ii);
    const mark = findMarkInNode(node, markType);
    if (!mark || mark !== firstMark) return null;
  }

  const { node: fromNode, pos: fromPos } = extendPosition(doc, from - 1, 0, markType, firstMark, -1);
  const { node: toNode, pos: toPos } = extendPosition(doc, to + 1, doc.nodeSize - 2, markType, firstMark, 1);

  return {
    mark: firstMark,
    from: { node: fromNode || firstNode, pos: fromNode ? fromPos : from },
    to: { node: toNode || doc.nodeAt(to), pos: toNode ? toPos : to },
  };
}
