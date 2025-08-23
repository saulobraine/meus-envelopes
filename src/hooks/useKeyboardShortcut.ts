import { useEffect } from "react";

interface KeyboardShortcutOptions {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
  onTrigger: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcut({
  ctrl = false,
  shift = false,
  alt = false,
  key,
  onTrigger,
  preventDefault = true,
}: KeyboardShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const ctrlPressed = event.ctrlKey || event.metaKey; // metaKey para Mac
      const shiftPressed = event.shiftKey;
      const altPressed = event.altKey;

      if (
        ctrlPressed === ctrl &&
        shiftPressed === shift &&
        altPressed === alt &&
        event.key.toLowerCase() === key.toLowerCase()
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        onTrigger();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ctrl, shift, alt, key, onTrigger, preventDefault]);
}
