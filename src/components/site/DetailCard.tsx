"use client";

import { useId, useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Icon } from "./icons";

/**
 * A flat tile in the grid whose whole surface opens a modal card with the details.
 * Built on the native <dialog>: focus moves into the card, Escape closes it, focus returns to the tile.
 * The tile itself never floats or casts a shadow (client rule). Only the modal sits above the page.
 */
export default function DetailCard({
  className = "",
  style,
  title,
  eyebrow,
  more = "See what is included",
  tile,
  children,
  reveal = true,
}: {
  className?: string;
  style?: CSSProperties;
  /** Heading of the modal card. */
  title: string;
  /** Small label above the modal heading. */
  eyebrow?: string;
  /** Label of the button that opens the card. */
  more?: string;
  /** What the tile shows in the grid. */
  tile: ReactNode;
  /** What the modal card shows. */
  children: ReactNode;
  reveal?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  const open = () => ref.current?.showModal();
  const close = () => ref.current?.close();

  // Close on a click on the dimmed backdrop, or on any link inside the card.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    const target = e.target as HTMLElement;
    if (target === ref.current || target.closest("a")) close();
  };

  return (
    <div className={`dc tile ${className}`} style={style} data-reveal={reveal ? "" : undefined}>
      {tile}
      <button type="button" className="dc-open" aria-haspopup="dialog" onClick={open}>
        {more}
        <Icon name="arrow" size={18} />
      </button>
      <dialog ref={ref} className="modal" aria-labelledby={`${id}-t`} onClick={onDialogClick}>
        <div className="modal-card">
          <div className="modal-top">
            <div>
              {eyebrow ? <p className="modal-eyebrow">{eyebrow}</p> : null}
              <h2 id={`${id}-t`}>{title}</h2>
            </div>
            <button type="button" className="modal-x" onClick={close}>
              Close
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </dialog>
    </div>
  );
}
