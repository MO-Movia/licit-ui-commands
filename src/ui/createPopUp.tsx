import './czi-vars.css';
import './czi-pop-up.css';

import type {PopUpParams, ViewProps} from './PopUp';

import PopUp from './PopUp';
// eslint-disable-next-line no-unused-vars
import * as React from 'react';
import ReactDOM from 'react-dom';
import uuid from './uuid';

export type PopUpHandle = {
  close: (val) => void;
  update: (props: Record<string, unknown>) => void;
};

let modalsCount = 0;
let popUpsCount = 0;

const Z_INDEX_BASE = 9999;
const MODAL_MASK_ID = 'pop-up-modal-mask-' + uuid();

function showModalMask(IsChildDialog: boolean | undefined): void {
  const root = document.body || document.documentElement;
  let element = document.getElementById(MODAL_MASK_ID);
  if (!element) {
    element = document.createElement('div');
    element.id = MODAL_MASK_ID;
    // [FS] IRAD-1048 2020-10-07
    // To handle child dialog window
    if (IsChildDialog) {
      element.className = 'czi-pop-up-modal-mask child-modal';
      element.setAttribute(
        'data-mask-type',
        'czi-pop-up-modal-mask child-modal'
      );
    } else {
      element.className = 'czi-pop-up-modal-mask';
      element.setAttribute('data-mask-type', 'czi-pop-up-modal-mask');
    }

    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
  }

  if (root && !element.parentElement) {
    root.appendChild(element);
  }

  const selector = '.czi-pop-up-element[data-pop-up-modal]';
  const zIndex = Array.from(document.querySelectorAll(selector)).reduce(
    (zz, el) => Math.max(zz, Number((el as HTMLElement).style.zIndex)),
    0
  );

  element.style.zIndex = (zIndex - 1).toString();
}

function hideModalMask(): void {
  const element = document.getElementById(MODAL_MASK_ID);
  if (element && element.parentElement) {
    element.parentElement.removeChild(element);
  }
}

function getRootElement(
  id: string,
  forceCreation: boolean,
  popUpParams: PopUpParams | undefined
): HTMLElement {
  const root =
    (popUpParams && popUpParams.container) ||
    document.body ||
    document.documentElement;
  let element = document.getElementById(id);
  if (!element && forceCreation) {
    element = document.createElement('div');
  }

  if (!element) {
    return null;
  }

  if (popUpParams && popUpParams.modal) {
    element.setAttribute('data-pop-up-modal', 'y');
  }
  // [FS] IRAD-1048 2020-10-07
  // To handle child dialog window
  if (popUpParams && popUpParams.IsChildDialog) {
    element.className = 'czi-pop-up-element child-modal czi-vars';
  } else {
    element.className = 'czi-pop-up-element czi-vars';
  }

  element.id = id;
  const modalZIndexOffset = popUpParams && popUpParams.modal ? 1 : 0;
  if (!(popUpParams && popUpParams.container)) {
    element.style.zIndex = (Z_INDEX_BASE + popUpsCount * 3 + modalZIndexOffset).toString();
  }

  // Populates the default ARIA attributes here.
  // http://accessibility.athena-ict.com/aria/examples/dialog.shtml
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  if (root && !element.parentElement) {
    root.appendChild(element);
  }
  return element;
}

function renderPopUp(
  rootId: string,
  close: (val) => void,
  View: typeof React.PureComponent,
  viewProps: ViewProps,
  popUpParams: PopUpParams
): void {
  const rootNode = getRootElement(rootId, true, popUpParams);
  if (rootNode) {
    const component = (
      <PopUp
        View={View}
        close={close}
        popUpParams={popUpParams}
        viewProps={viewProps}
      />
    );
    ReactDOM.render(component, rootNode);
  }

  if (modalsCount > 0) {
    showModalMask(popUpParams.IsChildDialog);
  } else {
    hideModalMask();
  }
}

function unrenderPopUp(rootId: string): void {
  const rootNode = getRootElement(rootId, false, undefined);
  if (rootNode) {
    ReactDOM.unmountComponentAtNode(rootNode);
    rootNode.parentElement && rootNode.parentElement.removeChild(rootNode);
  }

  if (modalsCount === 0) {
    hideModalMask();
  }
}

export default function createPopUp(
  View: unknown, //to do
  viewProps?: ViewProps,
  popUpParams?: PopUpParams
): PopUpHandle {
  const rootId = uuid();

  let handle = null;
  let currentViewProps = viewProps;

  viewProps = viewProps || {};
  popUpParams = popUpParams || {};

  const modal = popUpParams.modal || !popUpParams.anchor;
  popUpParams.modal = modal;

  popUpsCount++;
  if (modal) {
    modalsCount++;
  }

  const closePopUp = (value) => {
    if (!handle) {
      return;
    }

    if (modal) {
      modalsCount--;
    }
    popUpsCount--;

    handle = null;
    unrenderPopUp(rootId);

    const onClose = popUpParams && popUpParams.onClose;
    onClose && onClose(value);
  };

  const render = renderPopUp.bind(null, rootId, closePopUp, View);
  const emptyObj = {};

  handle = {
    close: closePopUp,
    update: (nextViewProps) => {
      currentViewProps = nextViewProps;
      render(currentViewProps || emptyObj, popUpParams || emptyObj);
    },
  };

  render(currentViewProps || emptyObj, popUpParams);
  return handle;
}