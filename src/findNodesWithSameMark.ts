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
export function findNodesWithSameMark(
  doc: Node,
  from: number,
  to: number,
  markType: MarkType
): Result | null {
  let ii = from;
  const finder = (mark) => mark.type === markType;
  let firstMark = null;
  let fromNode = null;
  let toNode = null;

  while (ii <= to) {
    const node = doc.nodeAt(ii);
    if (!node?.marks) {
      return null;
    }
    const mark = node.marks.find(finder);
    if (!mark) {
      return null;
    }
    if (firstMark && mark !== firstMark) {
      return null;
    }
    fromNode = fromNode || node;
    firstMark = firstMark || mark;
    toNode = node;
    ii++;
  }

  let fromPos = from;
  let toPos = to;

  let jj = 0;
  ii = from - 1;
  while (ii > jj) {
    const node = doc.nodeAt(ii);
    const mark = node?.marks.find(finder);
    if (!mark || mark !== firstMark) {
      break;
    }
    fromPos = ii;
    fromNode = node;
    ii--;
  }

  ii = to + 1;
  jj = doc.nodeSize - 2;
  while (ii < jj) {
    const node = doc.nodeAt(ii);
    const mark = node?.marks.find(finder);
    if (!mark || mark !== firstMark) {
      break;
    }
    toPos = ii;
    toNode = node;
    ii++;
  }

  return {
    mark: firstMark,
    from: {
      node: fromNode,
      pos: fromPos,
    },
    to: {
      node: toNode,
      pos: toPos,
    },
  };
}
