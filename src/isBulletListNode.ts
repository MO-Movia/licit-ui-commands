import {Node} from 'prosemirror-model';

import {BULLET_LIST} from './NodeNames';

export function isBulletListNode(node: Node): boolean {
  return node.type.name === BULLET_LIST;
}
