import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA']);

/**
 * Web-only. true mientras un <input>/<textarea> tiene foco (el teclado virtual de
 * iOS está abierto). No se puede inferir del tamaño del viewport porque, con
 * interactive-widget=resizes-content (ver +html.tsx), el layout se achica junto con
 * el teclado a propósito — comparar alturas ya no distingue "teclado abierto" de
 * "layout reaccionando normalmente".
 */
export function useIsKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const update = () => {
      const el = document.activeElement;
      setOpen(!!el && EDITABLE_TAGS.has(el.tagName));
    };

    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);

  return open;
}
