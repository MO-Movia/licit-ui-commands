import {Fragment, MarkType, Schema} from 'prosemirror-model';
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

export function transformAndPreserveTextSelection(
  tr: Transform,
  schema: Schema,
  fn: (memo: SelectionMemo) => Transform
): Transform {
  const transaction = tr as Transaction;

  if (transaction.getMeta('dryrun')) {
    return fn({ tr: transaction, schema });
  }

  const { selection, doc } = transaction;
  const markType = schema.marks[MARK_TEXT_SELECTION];
  if (!markType || !selection || !doc) {
    return tr;
  }

  const { from, to } = selection;

  if (from === to) {
    tr = handleCollapsedSelection(transaction, schema, from);
    if ((tr as Transaction).selection.from === (tr as Transaction).selection.to) {
      return tr;
    }
  }

  const id = {};
  const markRange = findAndApplyMarkRange(tr, schema, markType, id, fn);

  (tr as Transaction).setSelection(
    TextSelection.create(tr.doc, markRange.from, markRange.to)
  );

  return tr;
}

function handleCollapsedSelection(
  tr: Transaction,
  schema: Schema,
  from: number
): Transaction {
  const placeholderTextNode = createPlaceholderTextNode(tr, schema, from);

  if (placeholderTextNode) {
    tr = tr.insert(from, Fragment.from(placeholderTextNode));
    tr = setTextSelection(tr, from, 1);
  } else {
    const fromOffset = calculateFromOffset(tr, from);
    if (fromOffset !== 0) {
      tr = setTextSelection(tr, from, fromOffset);
    }
  }

  return tr;
}

function createPlaceholderTextNode(
  tr: Transaction,
  schema: Schema,
  from: number
) {
  const prevNode = tr.doc.nodeAt(from - 1);
  if (prevNode && prevNode.type.name === PARAGRAPH && !prevNode.firstChild) {
    return schema.text(PLACEHOLDER_TEXT);
  }
  return null;
}

export function calculateFromOffset(tr: Transaction, from: number): number {
  const prevNode = tr.doc.nodeAt(from - 1);
  const currentNode = tr.doc.nodeAt(from);
  const nextNode = tr.doc.nodeAt(from + 1);

  if (!currentNode) {
    if (prevNode && prevNode.type.name === TEXT) {
      return -1;
    } else if (nextNode) {
      return 1;
    }
  } else if (
    prevNode &&
    currentNode &&
    currentNode.type === prevNode.type
  ) {
    return -1;
  }

  return 0;
}

export function setTextSelection(
  tr: Transaction,
  from: number,
  offset: number
): Transaction {
  return tr.setSelection(
    TextSelection.create(tr.doc, from + offset, from + offset)
  );
}

export function findAndApplyMarkRange(
  tr: Transform,
  schema: Schema,
  markType: MarkType,
  id: object,
  fn: (memo: SelectionMemo) => Transform
): { from: number; to: number } {
  tr = applyMark(tr, schema, markType, { id });
  tr = fn({ tr, schema });

  const { from, to } = findMarkRange(tr, id);

  tr.removeMark(from, to, markType);
  removePlaceholderText(tr as Transaction);

  return { from, to };
}

function findMarkRange(tr: Transform, id: object): { from: number; to: number } {
  let markFrom = 0;
  let markTo = 0;
  tr.doc.descendants((node, pos) => {
    if (node?.marks.find((mark) => mark.attrs.id === id)) {
      markFrom = markFrom === 0 ? pos : markFrom;
      markTo = pos + node.nodeSize;
    }
    return true;
  });
  return { from: markFrom, to: markTo };
}

export function removePlaceholderText(tr: Transaction): void {
  tr.doc.descendants((node, pos) => {
    if (node.type.name === TEXT && node.text === PLACEHOLDER_TEXT) {
      tr.delete(pos, pos + PLACEHOLDER_TEXT.length);
      return false;
    }
    return true;
  });
}
