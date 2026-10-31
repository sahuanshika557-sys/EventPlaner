import React, { useState } from 'react';
import { Maximize2, Sparkles, Pin, Download } from 'lucide-react';
import { Modal } from './Modal';
import { sanitizeUrl } from '../../utils/sanitizer';

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ConceptImageViewerProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  title: string;
  promptText?: string;
  aspectRatio?: string;
  colorPalette?: ColorSwatch[];
  onPin?: () => void;
}

export const ConceptImageViewer: React.FC<ConceptImageViewerProps> = ({
  src,
  fallbackSrc,
  alt,
  title,
  promptText,
  colorPalette,
  onPin,
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailedPrimary, setHasFailedPrimary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Synchronize state during render when prop changes, avoiding effect cascade
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCurrentSrc(src);
    setHasFailedPrimary(false);
    setIsLoading(true);
  }

  const handleError = () => {
    if (!hasFailedPrimary && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasFailedPrimary(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handlePin = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPinned(!isPinned);
    if (onPin) onPin();
  };

  return (
    <>
      <div
        className="concept-image-container"
        tabIndex={0}
        role="button"
        aria-label={`View full moodboard for ${title}`}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: '100%',
          height: '12rem',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          backgroundColor: '#090d16',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {/* Shimmer Skeleton Placeholder while Loading */}
        {isLoading && (
          <div
            className="shimmer-loading"
            data-testid="concept-image-skeleton"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <Sparkles size={14} className="animate-spin" />
              <span>Rendering Visual Concept...</span>
            </div>
          </div>
        )}

        {/* Dynamic Image with Smooth Scale on Hover - uniform object-cover w-full h-48 rounded-xl */}
        <img
          src={sanitizeUrl(currentSrc)}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className="object-cover w-full h-48 rounded-xl"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: isLoading ? 0 : 1,
          }}
        />

        {/* Subtle Bottom Gradient Shade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.7) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        />

        {/* Single Unified Action Pill Button: [⤢ Expand Moodboard] */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          aria-label="Expand Moodboard Image"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(2, 6, 23, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(51, 65, 85, 0.6)',
            borderRadius: '9999px',
            padding: '0.35rem 0.75rem',
            color: '#f8fafc',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0.9,
            transform: isHovered ? 'translateY(0)' : 'translateY(-1px)',
            transition: 'all 0.2s ease',
            zIndex: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <Maximize2 size={12} />
          <span>⤢ Expand Moodboard</span>
        </button>
      </div>

      {/* Full-Screen High-Resolution Lightbox Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description="High-definition aesthetic concept moodboard rendered by the GenAI Studio."
        maxWidth="820px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Full-Resolution Preview of Setup */}
          <div
            style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              maxHeight: '460px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              backgroundColor: '#090d16',
            }}
          >
            <img
              src={sanitizeUrl(currentSrc)}
              alt={`Full size ${alt}`}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '460px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Curated Color Swatches */}
          {colorPalette && colorPalette.length > 0 && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                Curated Concept Color Swatches:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                {colorPalette.map((col) => (
                  <div
                    key={col.hex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      backgroundColor: '#090d16',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: col.hex,
                        display: 'inline-block',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 600 }}>{col.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({col.hex})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Creative Prompt Specification */}
          {promptText && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                <Sparkles size={14} />
                <span>AI Prompt Specification:</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.45, fontStyle: 'italic' }}>
                "{promptText}"
              </p>
            </div>
          )}

          {/* Action Toolbar: Direct Download / Pin to Moodboard */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handlePin}
              aria-label={isPinned ? 'Pinned to Moodboard' : 'Pin to Moodboard'}
              style={{
                padding: '0.55rem 1.1rem',
                backgroundColor: isPinned ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: isPinned ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: isPinned ? '#34d399' : '#f8fafc',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Pin size={14} />
              <span>{isPinned ? '📌 Pinned to Moodboard!' : '📌 Pin to Moodboard'}</span>
            </button>

            <a
              href={sanitizeUrl(currentSrc)}
              target="_blank"
              rel="noopener noreferrer"
              download={`${title.toLowerCase().replace(/\s+/g, '-')}-moodboard.jpg`}
              onClick={() => {
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 2500);
              }}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
              }}
            >
              <Download size={14} />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download High-Res'}</span>
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};
