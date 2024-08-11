import {Fragment, Schema} from 'prosemirror-model';
import {TextSelection, Transaction} from 'prosemirror-state';
import {Transform} from 'prosemirror-transform';

import {MARK_TEXT_SELECTION} from './MarkNames';
import {PARAGRAPH, TEXT} from './NodeNames';
import {applyMark} from './applyMark';
import {uuid} from './ui/uuid';

export type SelectionMemo = {
  schema: Schema;
  tr: Transform;
};

// Text used to create temporary selection.
// This assumes that no user could enter such string manually.
const PLACEHOLDER_TEXT = `[\u200b\u2800PLACEHOLDER_TEXT_${uuid()}\u2800\u200b]`;

// Perform the transform without losing the perceived text selection.
// The way it works is that this will annotate teh current selection with
// temporary marks and restores the selection with those marks after performing
// the transform.
function createTemporarySelection(
  tr: Transform,
  from: number,
  schema: Schema
): [Transform, number, number] {
  let fromOffset = 0;
  let toOffset = 0;
  let placeholderTextNode = null;

  const currentNode = tr.doc.nodeAt(from);
  const prevNode = tr.doc.nodeAt(from - 1);
  const nextNode = tr.doc.nodeAt(from + 1);

  if (
    !currentNode &&
    prevNode?.type.name === PARAGRAPH &&
    !prevNode.firstChild
  ) {
    placeholderTextNode = schema.text(PLACEHOLDER_TEXT);
    tr = tr.insert(from, Fragment.from(placeholderTextNode));
    toOffset = 1;
  } else if (!currentNode && prevNode?.type.name === TEXT) {
    fromOffset = -1;
  } else if (prevNode && currentNode && currentNode.type === prevNode.type) {
    fromOffset = -1;
  } else if (nextNode && currentNode && currentNode.type === nextNode.type) {
    toOffset = 1;
  } else if (nextNode) {
    toOffset = 1;
  } else if (prevNode) {
    fromOffset = -1;
  } else {
    return [tr, 0, 0];
  }

  tr = (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, from + fromOffset, from + toOffset)
  );

  return [tr, fromOffset, toOffset];
}

function findMarkRange(tr: Transform, id: ''): {from: number; to: number} {
  let markFrom = 0;
  let markTo = 0;
  tr.doc.descendants((node, pos) => {
    if (node?.marks.find((mark) => mark.attrs.id === id)) {
      markFrom = markFrom === 0 ? pos : markFrom;
      markTo = pos + node.nodeSize;
    }
    return true;
  });
  return {from: markFrom, to: markTo};
}

function removePlaceholderText(tr: Transform): Transform {
  tr.doc.descendants((node, pos) => {
    if (node.type.name === TEXT && node.text === PLACEHOLDER_TEXT) {
      tr = tr.delete(pos, pos + PLACEHOLDER_TEXT.length);
      return false;
    }
    return true;
  });
  return tr;
}

export function transformAndPreserveTextSelection(
  tr: Transform,
  schema: Schema,
  fn: (memo: SelectionMemo) => Transform
): Transform {
  if ((tr as Transaction).getMeta('dryrun')) {
    return fn({tr, schema});
  }

  const {selection, doc} = tr as Transaction;
  const markType = schema.marks[MARK_TEXT_SELECTION];
  if (!markType || !selection || !doc) {
    return tr;
  }

  const {from, to} = selection;
  let fromOffset = 0;
  let toOffset = 0;
  const placeholderTextNode = null;

  if (from === to) {
    if (from === 0) {
      return tr;
    }
    [tr, fromOffset, toOffset] = createTemporarySelection(tr, from, schema);
    if (fromOffset === 0 && toOffset === 0) {
      return tr;
    }
  }

  const id = '';
  tr = applyMark(tr, schema, markType, {id});
  tr = fn({tr, schema});

  const markRange = findMarkRange(tr, id);
  const selectionRange = {
    from: Math.max(0, markRange.from - fromOffset),
    to: Math.max(0, markRange.to - toOffset),
  };
  selectionRange.to = Math.max(0, selectionRange.from, selectionRange.to);

  tr = tr.removeMark(markRange.from, markRange.to, markType);

  if (placeholderTextNode) {
    tr = removePlaceholderText(tr);
  }

  tr = (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, selectionRange.from, selectionRange.to)
  );

  return tr;
}
