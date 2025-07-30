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
  _bridges = new Map<PopUpBridge, number>();
  _positions = new Map<PopUpBridge, unknown>();
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
    if (this._rafID) {
      cancelAnimationFrame(this._rafID);
    }
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
    if (this._rafID) {
      cancelAnimationFrame(this._rafID);
    }
  }

  _onScroll = (_e: Event): void => {
    if (this._rafID) {
      cancelAnimationFrame(this._rafID);
    }
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onResize = (_e: Event): void => {
    if (this._rafID) {
      cancelAnimationFrame(this._rafID);
    }
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onMouseChange = (e: MouseEvent): void => {
    this._mx = Math.round(e.clientX);
    this._my = Math.round(e.clientY);
    if (this._rafID) {
      cancelAnimationFrame(this._rafID);
    }
    this._rafID = requestAnimationFrame(this._syncPosition);
  };

  _onClick = (e: MouseEvent): void => {
    const now = Date.now();
    let detailsWithModalToDismiss;
    this.isColorPicker = false;
    for (const [bridge, registeredAt] of this._bridges) {
      if (now - registeredAt <= CLICK_INTERVAL) {
        continue;
      }
      const details = bridge.getDetails();
      if (details.modal && details.autoDismiss) {
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

    if (!detailsWithModalToDismiss) {
      return;
    }
    const {body, close} = detailsWithModalToDismiss;
    const pointer = fromXY(e.clientX, e.clientY, 1);
    const bodyRect = body ? fromHTMlElement(body) : null;
    if (!bodyRect || !isIntersected(pointer, bodyRect)) {
      this.isColorPicker = false;
      close();
    }
  };

  _syncPosition = (): void => {
    this._rafID = 0;

    const bridgeToDetails = this.createBridgeDetails();

    const pointer = fromXY(this._mx, this._my, 2);
    const hoveredAnchors = this.createHoveredAnchors(bridgeToDetails, pointer);

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

  private createBridgeDetails() {
    const bridgeToDetails = new Map();
    for (const [bridge] of this._bridges) {
      const details = bridge.getDetails();
      bridgeToDetails.set(bridge, details);
      const {anchor, body} = details;
      if (body instanceof HTMLElement) {
        details.bodyRect = fromHTMlElement(body);
      }
      if (anchor instanceof HTMLElement) {
        details.anchorRect = fromHTMlElement(anchor);
      }
    }
    return bridgeToDetails;
  }

  private createHoveredAnchors(
    bridgeToDetails: Map<PopUpBridge, number>,
    pointer: Rect
  ) {
    const hoveredAnchors = new Set<Node>();
    this.collectAnchors(bridgeToDetails, pointer, hoveredAnchors);
    this.correctAnchors(hoveredAnchors, bridgeToDetails);
    return hoveredAnchors;
  }

  private collectAnchors(
    bridgeToDetails: Map<PopUpBridge, number>,
    pointer: Rect,
    hoveredAnchors: Set<Node>
  ) {
    for (const [bridge] of bridgeToDetails) {
      const {anchor, bodyRect, anchorRect, position, body} =
        bridge.getDetails();
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
        anchor &&
        (isIntersected(pointer, bodyRect ?? DUMMY_RECT, 0) ||
          isIntersected(pointer, anchorRect ?? DUMMY_RECT, 0))
      ) {
        hoveredAnchors.add(anchor);
      }
    }
  }

  private correctAnchors(
    hoveredAnchors: Set<Node>,
    bridgeToDetails: Map<PopUpBridge, number>
  ) {
    let size: number;

    do {
      size = hoveredAnchors.size;

      for (const [bridge] of bridgeToDetails) {
        const {anchor, body} = bridge.getDetails();

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
  }
}

const instance = new PopUpManager();

export default instance;
