import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * New routes must paint from the top immediately. Running this in a layout
 * effect prevents users from seeing the previous route's scroll offset for a
 * frame before the browser catches up.
 */
export function RouteViewportReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
