import { Transaction } from '@remirror/pm/state';
import { Mark, MarkType, Node, ResolvedPos, Schema } from 'prosemirror-model';
import { SelectionRange, TextSelection } from 'prosemirror-state';
import { Transform } from 'prosemirror-transform';

interface MyNode {
  inlineContent: boolean; // Assuming inlineContent is of type boolean
  type: {
    allowsMarkType: (type: MarkType) => boolean; // Assuming allowsMarkType returns a boolean
  };
}

function markApplies(
  doc: Node,
  ranges: readonly SelectionRange[],
  type: MarkType
) {
  for (const { $from, $to } of ranges) {
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
    doc.nodesBetween($from.pos, $to.pos, (node: MyNode) => {
      if (can) {
        return false;
      }
      can = node.inlineContent && node.type.allowsMarkType(type);
      return true;
    });
    if (can) {
      return true;
    }
  }
  return false;
}

function hasMark(marks: readonly Mark[], markType: string) {
  return marks.some(mark => mark.type.name === markType);
}

export function applyCustomStyleToNode(
  tr: Transform,
  markType: MarkType,
  $from: ResolvedPos,
  attrs?: Record<string, unknown>
): Transform {
  const nodeTr = tr.doc.nodeAt($from.pos);
  let from = $from.pos;

  if (nodeTr) {
    nodeTr.descendants((child) => {
      const nodeTr_1 = tr.doc.nodeAt(from);
      const to_add = nodeTr_1?.childCount > 0 ? 1 : 0;
      const to = from + child.nodeSize;

      if (child && child.marks.length > 0) {
        const existingMark = child.marks.find(mark => mark.type.name === markType.name);
        tr = tr.addMark(from, to + to_add, markType.create(existingMark ? existingMark.attrs : attrs));
      } else {
        tr = tr.addMark(from, to + to_add, markType.create(attrs));
      }

      from = to + to_add;
    });
  }
  return tr;
}

export function applyTextColorMark(
  tr: Transform,
  markType: MarkType,
  $from: ResolvedPos,
  $to: ResolvedPos,
  attrs?: Record<string, unknown>
): Transform {
  const nodeTr = tr.doc.nodeAt($from.pos);

  if (!nodeTr) return tr;

  if (nodeTr.marks.length > 0) {
    // If there are existing marks, check if 'link' is not applied
    if (!hasMark(nodeTr.marks, 'link')) {
      return tr.addMark($from.pos, $to.pos, markType.create(attrs));
    }
  } else if (nodeTr instanceof Node) {
    let from = $from.pos;
    let to = 0;

    // Iterate over descendants
    nodeTr.descendants((child) => {
      const nodeTr_1 = tr.doc.nodeAt(from);
      to = from + child.nodeSize;

      if (nodeTr_1.childCount > 0) {
        // Apply the mark if the child doesn't have a 'link' mark
        if (!hasMark(child.marks, 'link')) {
          tr = tr.addMark(from, to + 1, markType.create(attrs));
        }
        from = to + 1;
      } else {
        // Apply the mark if the child doesn't have a 'link' mark
        if (!hasMark(child.marks, 'link')) {
          tr = tr.addMark(from, to, markType.create(attrs));
        }
        from = to;
      }
    });
  }

  return tr;
}




function applyMarkToNode(
  tr: Transform,
  schema: Schema,
  markType: MarkType,
  $from: ResolvedPos,
  $to: ResolvedPos,
  attrs?: Record<string, unknown>,
  isCustomStyleApplied?: boolean
): Transform {
  const nodeTr = tr.doc.nodeAt($from.pos);

  if (!nodeTr) return tr;

  if (markType.name === 'link') {
    if (nodeTr.marks.length > 0 && hasMark(nodeTr.marks, 'mark-text-color')) {
      tr = tr.removeMark($from.pos, $to.pos, schema.marks['mark-text-color']);
    }
    return tr.addMark($from.pos, $to.pos, markType.create(attrs));
  }

  if (markType.name === 'mark-text-color') {
    tr = applyTextColorMark(tr, markType, $from, $to, attrs);
  }

  if (typeof isCustomStyleApplied === 'undefined') {
    return tr.addMark($from.pos, $to.pos, markType.create(attrs));
  } else {
    let from = $from.pos;
    let to = 0;
    nodeTr.descendants((child) => {
      const nodeTr_1 = tr.doc.nodeAt(from);
      to = from + child.nodeSize;
      if (nodeTr_1.childCount > 0) {
        tr = tr.addMark(from, to + 1, markType.create(attrs));
        from = to + 1;
      } else {
        tr = tr.addMark(from, to, markType.create(attrs));
        from = to;
      }
    });
  }
  return tr;
}

function hasMarkInRanges(
  tr: Transform,
  ranges,
  markType: MarkType
): boolean {
  for (const { $from, $to } of ranges) {
    if (tr.doc.rangeHasMark($from.pos, $to.pos, markType)) {
      return true;
    }
  }
  return false;
}


// https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.js
export function applyMark(
  tr: Transform,
  _schema: Schema,
  markType: MarkType,
  attrs?: Record<string, unknown>,
  isCustomStyleApplied?: boolean
): Transform {
  if (!(tr as Transaction).selection || !tr.doc || !markType) {
    return tr;
  }
  const { empty, $cursor, ranges } = (tr as Transaction)
    .selection as TextSelection;
  if ((empty && !$cursor) || !markApplies(tr.doc, ranges, markType)) {
    return tr;
  }
  if ($cursor) {
    tr = (tr as Transaction).removeStoredMark(markType);
    return (tr as Transaction).addStoredMark(markType.create(attrs));
  }
  const has = false;
  hasMarkInRanges(tr, ranges, markType);

  for (const { $from, $to } of ranges) {
    if (has && isCustomStyleApplied) {

      applyCustomStyleToNode( tr,markType,$from,attrs);
    }

    if (attrs) {
      tr = applyMarkToNode(tr, _schema, markType, $from, $to, attrs, isCustomStyleApplied);
    }
    else if (has && !isCustomStyleApplied && !attrs) {
      tr = tr.removeMark($from.pos, $to.pos, markType);
    }

  }
  return tr;
}
