import { useRef } from "react";

export function useSwipeSidebar({ onOpen, onClose }) {
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    isSwiping.current = true;
  };

  const onTouchMove = (e) => {
    if (!isSwiping.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = Math.abs(touch.clientY - startY.current);

    // если вертикальный скролл — выходим
    if (dy > 30) {
      isSwiping.current = false;
      return;
    }

    // swipe вправо
    if (dx > 80) {
      onOpen();
      isSwiping.current = false;
    }

    // swipe влево
    if (dx < -80) {
      onClose();
      isSwiping.current = false;
    }
  };

  const onTouchEnd = () => {
    isSwiping.current = false;
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}