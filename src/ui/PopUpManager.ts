import {clamp} from './clamp';
import {fromHTMlElement, fromXY, isIntersected} from './rects';
import type {PositionHandler} from './PopUpPosition';
import type {Rect} from './rects';

export type PopUpDetails = {
  anchor?: HTMLElement;
  anchorRect?: Rect;
  autoDismiss: boolean;
  body?: HTMLElement;
  bodyRect?: Rect;
  close: (val) => void;
  modal: boolean;
  position: PositionHandler;
  popupId: string;
};

export type PopUpBridge = {
  getDetails: () => PopUpDetails;
};

const CLICK_INTERVAL = 350;
const DUMMY_RECT = {x: -10000, y: -10000, w: 0, h: 0};

export class PopUpManager {
  _bridges = new Map();
  _positions = new Map();
  isColorPicker = false;

  _mx = 0;
  _my = 0;
  _rafID = 0;

  register(bridge: PopUpBridge): void {
    this._bridges.set(bridge, Date.now());
    this._positions.set(bridge, null);
    if (this._bridges.size === 1) {
      this._observe();
    }
    this._rafID = requestAnimationFrame(this._syncPosition);
  }

  unregister(bridge: PopUpBridge): void {
    this._bridges.delete(bridge);
    this._positions.delete(bridge);
    this.isColorPicker = false;
    if (this._bridges.size === 0) {
      this._unobserve();
    }
    this._rafID && cancelAnimationFrame(this._rafID);
  }

  _observe(): void {
    this._unobserve();
    document.addEventListener('mousemove', this._onMouseChange, false);
    document.addEventListener('mouseup', this._onMouseChange, false);
    document.addEventListener('click', this._onClick, false);
    window.addEventListener('scroll', this._onScroll, true);
    window.addEventListener('resize', this._onResize, true);
  }

  _unobserve(): void {
    document.removeEventListener('mousemove', this._onMouseChange, false);
    document.removeEventListener('mouseup', this._onMouseChange, false);
    document.removeEventListener('click', this._onClick, false);
    window.removeEventListener('scroll', this._onScroll, true);
    window.removeEventListener('resize', this._onResize, true);
    this._rafID && cancelAnimationFrame(this._rafID);
  }

  _onScroll = (_e: Event): void => {
    this._rafID && cancelAnimationFrame(this._rafID);
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onResize = (_e: Event): void => {
    this._rafID && cancelAnimationFrame(this._rafID);
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onMouseChange = (e: MouseEvent): void => {
    this._mx = Math.round(e.clientX);
    this._my = Math.round(e.clientY);
    this._rafID && cancelAnimationFrame(this._rafID);
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onClick = (e: MouseEvent): void => {
    const now = Date.now();
    this.isColorPicker = false;

    const detailsWithModalToDismiss = this._findDetailsWithModalToDismiss(
      e,
      now
    );

    if (!detailsWithModalToDismiss) {
      return;
    }

    this._handleModalDismiss(e, detailsWithModalToDismiss);
  };

  _findDetailsWithModalToDismiss = (e: MouseEvent, now: number) => {
    let detailsWithModalToDismiss = null;

    for (const [bridge, registeredAt] of this._bridges) {
      if (this._isClickStale(now, registeredAt)) {
        const details = bridge.getDetails();

        if (this._shouldDismissModal(details, e)) {
          detailsWithModalToDismiss = details;
        }

        if (details.autoDismiss && details.popupId) {
          const targetName = (e.target as HTMLElement).className;
          if (targetName?.startsWith('mocp')) {
            this.isColorPicker = true;
            return;
          }
        }
      }
    }

    return detailsWithModalToDismiss;
  };

  _isClickStale = (now: number, registeredAt: number): boolean => {
    return now - registeredAt > CLICK_INTERVAL;
  };

  _shouldDismissModal = (details: any, e: MouseEvent): boolean => {
    return details.modal && details.autoDismiss;
  };

  _handleModalDismiss = (e: MouseEvent, details: any): void => {
    const {body, close} = details;
    const pointer = fromXY(e.clientX, e.clientY, 1);
    const bodyRect = body ? fromHTMlElement(body) : null;

    if (!bodyRect || !isIntersected(pointer, bodyRect)) {
      this.isColorPicker = false;
      close();
    }
  };

  _syncPosition = (): void => {
    this._rafID = 0;

    const bridgeToDetails = this._getBridgeDetails();
    const pointer = fromXY(this._mx, this._my, 2);
    const hoveredAnchors = new Set();
    for (const [bridge, details] of bridgeToDetails) {
      const {anchor, bodyRect, anchorRect, position, body} = details;
      if (!bodyRect && !anchorRect) {
        continue;
      }

      const {x, y} = position(anchorRect, bodyRect);
      const positionKey = `${x}-${y}`;

      if (body && bodyRect && this._positions.get(bridge) !== positionKey) {
        const ax = anchorRect
          ? clamp(
              0,
              anchorRect.x - x + anchorRect.w / 2,
              bodyRect.w - anchorRect.w / 2
            )
          : 0;
        this._positions.set(bridge, positionKey);
        const bodyStyle = body.style;
        bodyStyle.position = 'absolute';
        bodyStyle.left = `${x}px`;
        bodyStyle.top = `${y}px`;
        bodyRect.x = x;
        bodyRect.y = y;
        bodyStyle.setProperty('--czi-pop-up-anchor-offset-left', `${ax}px`);
      }

      if (
        isIntersected(pointer, bodyRect || DUMMY_RECT, 0) ||
        isIntersected(pointer, anchorRect || DUMMY_RECT, 0)
      ) {
        if (anchor) {
          hoveredAnchors.add(anchor);
        }
      }
    }

    let size;

    do {
      size = hoveredAnchors.size;

      for (const [, details] of bridgeToDetails) {
        const {anchor, body} = details;

        for (const ha of hoveredAnchors) {
          if (
            anchor &&
            body &&
            !hoveredAnchors.has(anchor) &&
            body.contains(ha)
          ) {
            hoveredAnchors.add(anchor);
          }
        }
      }
    } while (hoveredAnchors.size !== size);

    const now = Date.now();
    for (const [bridge, registeredAt] of this._bridges) {
      const details = bridgeToDetails.get(bridge);
      if (details) {
        const {autoDismiss, anchor, close, modal} = details;
        if (
          autoDismiss &&
          // Modal is handled separately at `onClick`
          !modal &&
          now - registeredAt > CLICK_INTERVAL &&
          !hoveredAnchors.has(anchor) &&
          !this.isColorPicker
        ) {
          close();
        }
      }
    }
  };
  _getBridgeDetails(): Map<any, any> {
    const bridgeToDetails = new Map();

    for (const [bridge] of this._bridges) {
      const details = bridge.getDetails();
      bridgeToDetails.set(bridge, details);
      this._setElementRects(details);
    }

    return bridgeToDetails;
  }

  _setElementRects(details: any): void {
    const {anchor, body} = details;

    if (body instanceof HTMLElement) {
      details.bodyRect = fromHTMlElement(body);
    }

    if (anchor instanceof HTMLElement) {
      details.anchorRect = fromHTMlElement(anchor);
    }
  }
}

const instance = new PopUpManager();

export default instance;
