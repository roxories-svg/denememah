import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minus, Plus, X } from 'lucide-react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function getPointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export default function ImageLightbox({ src, alt, className = '', triggerClassName = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const movedRef = useRef(false);

  const close = useCallback(() => {
    setIsOpen(false);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
    pointersRef.current.clear();
    gestureRef.current = null;
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const changeZoom = (amount) => {
    const nextZoom = clampZoom(zoom + amount);
    setZoom(nextZoom);
    if (nextZoom === MIN_ZOOM) setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      gestureRef.current = {
        type: 'pan',
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: pan.x,
        originY: pan.y
      };
    } else if (pointers.size === 2) {
      const [first, second] = [...pointers.values()];
      gestureRef.current = {
        type: 'pinch',
        distance: getPointerDistance(first, second),
        startZoom: zoom
      };
    }
  };

  const handlePointerMove = (event) => {
    const pointers = pointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size > 1 && gestureRef.current?.type === 'pinch') {
      const [first, second] = [...pointers.values()];
      const distance = getPointerDistance(first, second);
      if (gestureRef.current.distance > 0) {
        const nextZoom = clampZoom(gestureRef.current.startZoom * distance / gestureRef.current.distance);
        setZoom(nextZoom);
        if (nextZoom === MIN_ZOOM) setPan({ x: 0, y: 0 });
      }
      movedRef.current = true;
      return;
    }

    const gesture = gestureRef.current;
    if (gesture?.type === 'pan' && gesture.pointerId === event.pointerId) {
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) movedRef.current = true;
      if (zoom > MIN_ZOOM) {
        setPan({ x: gesture.originX + deltaX, y: gesture.originY + deltaY });
      }
    }
  };

  const handlePointerUp = (event) => {
    const pointers = pointersRef.current;
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      const [pointerId, point] = [...pointers.entries()][0];
      gestureRef.current = {
        type: 'pan',
        pointerId,
        startX: point.x,
        startY: point.y,
        originX: pan.x,
        originY: pan.y
      };
    } else {
      gestureRef.current = null;
    }
  };

  const handleImageClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    if (zoom === MIN_ZOOM) changeZoom(1);
    else {
      setZoom(MIN_ZOOM);
      setPan({ x: 0, y: 0 });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group/image relative ${triggerClassName}`}
        aria-label={`${alt}: tam ekran görüntüle`}
      >
        <img src={src} alt={alt} className={className} />
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-white/20 bg-black/70 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100">
          <Maximize2 className="h-3 w-3" />
          Büyüt
        </span>
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[120] flex flex-col bg-black/85 p-3 backdrop-blur-md animate-fadeIn sm:p-6"
          onClick={(event) => {
            if (!event.target.closest('button, img')) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} büyük görünüm`}
        >
          <div className="flex shrink-0 justify-end gap-2 pb-3">
            <button
              type="button"
              onClick={() => changeZoom(-0.5)}
              disabled={zoom <= MIN_ZOOM}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-slate-900/90 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Uzaklaştır"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="flex min-w-16 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 px-2 text-sm font-semibold text-white">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => changeZoom(0.5)}
              disabled={zoom >= MAX_ZOOM}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-slate-900/90 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Yakınlaştır"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={close}
              className="ml-1 flex h-11 w-11 items-center justify-center rounded-xl border border-rose-300/40 bg-rose-600 text-white shadow-lg transition hover:bg-rose-500"
              aria-label="Görseli kapat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={(event) => {
              event.preventDefault();
              changeZoom(event.deltaY < 0 ? 0.25 : -0.25);
            }}
          >
            <img
              src={src}
              alt={alt}
              draggable="false"
              onClick={handleImageClick}
              className="max-h-full max-w-full cursor-zoom-in object-contain"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                cursor: zoom > MIN_ZOOM ? 'grab' : 'zoom-in'
              }}
            />
          </div>
          <p className="shrink-0 pt-3 text-center text-xs text-slate-300">
            Dokunarak veya kaydırarak yakınlaştırın · Yakınlaştırılmış görseli sürükleyerek kaydırın
          </p>
        </div>,
        document.body
      )}
    </>
  );
}
