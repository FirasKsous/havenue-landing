import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { trackEvent } from '../../lib/analytics';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const hasTrackedOpen = useRef(false);

  const handleClose = useCallback(() => {
    trackEvent({ event: 'video_modal_closed' });
    onClose();
  }, [onClose]);

  // Track modal open
  useEffect(() => {
    if (isOpen && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackEvent({ event: 'video_modal_opened' });
    }
    if (!isOpen) {
      hasTrackedOpen.current = false;
    }
  }, [isOpen, handleClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Listen for postMessage events from YouTube/Vimeo iframes
  useEffect(() => {
    if (!isOpen || !videoUrl) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // YouTube iframe API events
        if (data.event === 'onStateChange') {
          if (data.info === 1) {
            trackEvent({ event: 'video_played' });
          } else if (data.info === 0) {
            trackEvent({ event: 'video_completed' });
          }
        }

        // Vimeo player events
        if (data.event === 'play') {
          trackEvent({ event: 'video_played' });
        }
        if (data.event === 'ended') {
          trackEvent({ event: 'video_completed' });
        }
      } catch {
        // Not a JSON message or not from our iframe — ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, videoUrl]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      handleClose();
    }
  };

  // Build embed URL with API tracking enabled
  const embedUrl = videoUrl ? buildEmbedUrl(videoUrl) : undefined;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Product Demo Video"
    >
      <div
        className={cn(
          'relative w-full max-w-4xl bg-[#111] rounded-lg overflow-hidden transition-all duration-300',
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Product Demo</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Container */}
        <div className="aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Havenue Product Demo"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-white/50">
              <p className="text-sm">Video coming soon</p>
              <p className="text-xs mt-2">Demo placeholder — actual video will be embedded here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Add API enablement params to YouTube/Vimeo embed URLs */
function buildEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // YouTube: enable JS API for postMessage events
    if (parsed.hostname.includes('youtube')) {
      parsed.searchParams.set('enablejsapi', '1');
      parsed.searchParams.set('origin', window.location.origin);
    }
    // Vimeo: enable event API
    if (parsed.hostname.includes('vimeo')) {
      parsed.searchParams.set('api', '1');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
