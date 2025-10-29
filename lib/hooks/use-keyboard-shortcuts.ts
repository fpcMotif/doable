"use client";

import { useCallback, useEffect } from "react";

type KeyboardShortcutOptions = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void
) {
  const {
    key,
    ctrlKey,
    metaKey,
    shiftKey,
    altKey,
    preventDefault = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === !!ctrlKey &&
        event.metaKey === !!metaKey &&
        event.shiftKey === !!shiftKey &&
        event.altKey === !!altKey
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [key, ctrlKey, metaKey, shiftKey, altKey, preventDefault, callback]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Common keyboard shortcuts
export const useCommandPalette = (onOpen: () => void) => {
  useKeyboardShortcut({ key: "k", metaKey: true }, onOpen);
};

export const useCreateShortcut = (onCreate: () => void) => {
  useKeyboardShortcut({ key: "c", metaKey: true }, onCreate);
};

export const useEscapeShortcut = (onEscape: () => void) => {
  useKeyboardShortcut({ key: "Escape" }, onEscape);
};
