import {Transaction} from 'prosemirror-state';
import {Schema} from 'prosemirror-model';
import {Transform} from 'prosemirror-transform';

import {BLOCKQUOTE, HEADING, LIST_ITEM, PARAGRAPH} from './NodeNames';
import {compareNumber} from './compareNumber';
import {isInsideListItem} from './isInsideListItem';
import {isListNode} from './isListNode';
import {clearMarks} from './clearMarks';
import {unwrapNodesFromList} from './toggleList';

export function toggleHeading(
  tr: Transform,
  schema: Schema,
  level: number
): Transform {
  const {nodes} = schema;
  const {selection, doc} = tr as Transaction;

  const blockquote = nodes[BLOCKQUOTE];
  const heading = nodes[HEADING];
  const listItem = nodes[LIST_ITEM];
  const paragraph = nodes[PARAGRAPH];

  if (
    !selection ||
    !doc ||
    !heading ||
    !paragraph ||
    !listItem ||
    !blockquote
  ) {
    return tr;
  }

  const {from, to} = (tr as Transaction).selection;
  let startWithHeadingBlock = null;
  const poses = [];
  doc.nodesBetween(from, to, (node, pos, parentNode) => {
    const nodeType = node.type;
    const parentNodeType = parentNode.type;

    if (startWithHeadingBlock === null) {
      startWithHeadingBlock =
        nodeType === heading && node.attrs.level === level;
    }

    if (parentNodeType !== listItem) {
      poses.push(pos);
    }
    return !isListNode(node);
  });
  // Update from the bottom to avoid disruptive changes in pos.
  [...poses]
    .sort(compareNumber)
    .reverse()
    .forEach((pos) => {
      tr = setHeadingNode(
        tr,
        schema,
        pos,
        startWithHeadingBlock ? null : level
      );
    });
  return tr;
}

export function setHeadingNode(
  tr: Transform,
  schema: Schema,
  pos: number,
  level?: number
): Transform {
  const {nodes} = schema;
  const heading = nodes[HEADING];
  const paragraph = nodes[PARAGRAPH];
  const blockquote = nodes[BLOCKQUOTE];
  if (pos >= tr.doc.content.size) {
    // Workaround to handle the edge case that pos was shifted caused by `toggleList`.
    return tr;
  }
  const node = tr.doc.nodeAt(pos);
  if (!node || !heading || !paragraph || !blockquote) {
    return tr;
  }
  const nodeType = node.type;
  if (isInsideListItem(tr.doc, pos)) {
    return tr;
  } else if (isListNode(node)) {
    // Toggle list
    if (level !== null) {
      tr = unwrapNodesFromList(tr, schema, pos, (paragraphNode) => {
        const {content, marks, attrs} = paragraphNode;
        const headingAttrs = {...attrs, level};
        return heading.create(headingAttrs, content, marks);
      });
    }
  } else if (nodeType === heading) {
    // Toggle heading
    if (level === null) {
      tr = tr.setNodeMarkup(pos, paragraph, node.attrs, node.marks);
    } else {
      tr = tr.setNodeMarkup(pos, heading, {...node.attrs, level}, node.marks);
    }
  } else if ((level && nodeType === paragraph) || nodeType === blockquote) {
    // [FS] IRAD-948 2020-05-22
    // Clear Header formatting
    tr = clearMarks(tr, schema);
    tr = tr.setNodeMarkup(pos, heading, {...node.attrs, level}, node.marks);
  }
  return tr;
}
