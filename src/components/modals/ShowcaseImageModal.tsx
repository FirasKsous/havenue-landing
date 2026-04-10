import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

interface ShowcaseImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageWebP: string;
  imageAlt: string;
}

export function ShowcaseImageModal({ isOpen, onClose, imageSrc, imageWebP, imageAlt }: ShowcaseImageModalProps) {
  // ESC to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged screenshot view"
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="w-full rounded-xl overflow-hidden border border-white/15 bg-[#111] shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_80px_rgba(47,143,78,0.1)]">
          <picture>
            <source srcSet={imageWebP} type="image/webp" />
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-auto block"
              decoding="async"
            />
          </picture>
        </div>

        {/* Floating Discover More CTA */}
        <div className="mt-5">
          <GlassButton
            href="#pricing"
            variant="primary"
            className="px-8 py-3 text-sm"
            onClick={onClose}
          >
            Discover More
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
