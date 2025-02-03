import { Transaction } from '@remirror/pm/state';
import { MarkType, Node, ResolvedPos, Schema } from 'prosemirror-model';
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

  const hasMarkInRanges = ranges.some(({ $from, $to }) =>
    tr.doc.rangeHasMark($from.pos, $to.pos, markType)
  );

  for (const { $from, $to } of ranges) {
    if (hasMarkInRanges && isCustomStyleApplied) {
      tr = addCustomMark(tr, $from.pos, markType, attrs);
    } else if (attrs) {
      tr = addMarkWithAttributes(
        tr,
        _schema,
        $from,
        $to,
        markType,
        attrs,
        isCustomStyleApplied
      );
    } else if (hasMarkInRanges && !isCustomStyleApplied && !attrs) {
      tr = tr.removeMark($from.pos, $to.pos, markType);
    }
  }

  return tr;
}

function addCustomMark(
  tr: Transform,
  pos: number,
  markType: MarkType,
  attrs?: Record<string, unknown>
): Transform {

  const node = tr.doc.nodeAt(pos);
  if (!node || !node.childCount) return tr; // Ensure the node exists and has children

  let from = pos + 1; // Start at first child
  node.forEach((child, offset) => {
    let to = from + child.nodeSize;
    const existingMark = child.marks.find((mark) => mark.type === markType);
    const newMark = existingMark ? markType.create({ ...existingMark.attrs }) : markType.create(attrs);
    tr = tr.addMark(from, to, newMark);
    from = to;
  });


  return tr;
}

export function addMarkWithAttributes(
  tr: Transform,
  _schema: Schema,
  $from: ResolvedPos,
  $to: ResolvedPos,
  markType: MarkType,
  attrs: Record<string, unknown>,
  isCustomStyleApplied: boolean
): Transform {
  const node = tr.doc.nodeAt($from.pos);

  if (markType.name === 'link') {
    if (node?.marks.some((mark) => mark.type.name === 'mark-text-color')) {
      tr = tr.removeMark($from.pos, $to.pos, _schema?.marks['mark-text-color']);
    }
    tr = tr.addMark($from.pos, $to.pos, markType.create(attrs));
  } else if (markType.name === 'mark-text-color') {
    tr = handleTextColorMark(tr, $from, markType, attrs, node, $to, isCustomStyleApplied);
  } else {
    tr = addMarksToNode(
      tr,
      $from.pos,
      $to.pos,
      markType,
      attrs,
      node,
      isCustomStyleApplied
    );
  }

  return tr;
}

function handleTextColorMark(
  tr: Transform,
  $from: ResolvedPos,
  markType: MarkType,
  attrs: Record<string, unknown>,
  node: Node | null,
  $to: ResolvedPos,
  isCustomStyleApplied?: boolean
): Transform {
  // Issue fix: Custom style not get applied after override the style in the paragraph.
  if (isCustomStyleApplied) {
    tr = tr.addMark($from.pos, $to.pos + 1, markType.create(attrs));
  }
  else if (node) {
    let from = $from.pos;
    if (0 === node.content.size) {
      tr = tr.addMark(from, $to.pos, markType.create(attrs));
    }
    node.descendants((child) => {
      const to = from + child.nodeSize + 1;

      if (!child.marks.some((mark) => mark.type.name === 'link')) {
        tr = tr.addMark(from, to, markType.create(attrs));
      }

      from = to + (child.childCount > 0 ? 1 : 0);
    });
  }
  return tr;
}

function addMarksToNode(
  tr: Transform,
  from: number,
  to: number,
  markType: MarkType,
  attrs: Record<string, unknown>,
  node: Node | null,
  isCustomStyleApplied?: boolean
): Transform {
  // Issue fix: Custom style not get applied after override the style in the paragraph.
  if (isCustomStyleApplied || isCustomStyleApplied === undefined) {
    tr = tr.addMark(from, to, markType.create(attrs));
  }
  else if (node) {
    if (0 === node.content.size) {
      tr = tr.addMark(from, to, markType.create(attrs));
    }
    node.descendants((child) => {
      const childTo = from + child.nodeSize + 1;

      if (!child.marks.some((mark) => mark.type.name === 'link')) {
        tr = tr.addMark(
          from,
          childTo + (child.childCount > 0 ? 1 : 0),
          markType.create(attrs)
        );
      }

      from = childTo + (child.childCount > 0 ? 1 : 0);
    });
  }
  return tr;
}
