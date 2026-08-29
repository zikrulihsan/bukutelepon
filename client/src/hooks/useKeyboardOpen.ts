import { useEffect, useState } from "react";

/** Below this fraction of the layout viewport, the shrinkage is a keyboard. */
const KEYBOARD_RATIO = 0.75;

/**
 * True while the on-screen keyboard covers part of the viewport.
 *
 * iOS Safari does not resize the layout viewport for the keyboard, so anything
 * pinned with `position: fixed` keeps its place in the layout and ends up
 * drawn in the middle of the screen, floating above the keyboard. Watching the
 * visual viewport lets those elements step aside instead.
 */
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      const viewport = window.visualViewport;
      if (!viewport) return;
      setOpen(viewport.height < window.innerHeight * KEYBOARD_RATIO);
    }

    update();
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, []);

  return open;
}
