import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Global mock setups for browser environment APIs
if (typeof window !== 'undefined') {
  // Window matchMedia mock for responsive breakpoint tests
  window.matchMedia =
    window.matchMedia ||
    function (query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: function () {},
        removeListener: function () {},
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () {
          return false;
        },
      };
    };

  // ResizeObserver mock for responsive SVG & layout containers
  globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  // HTML5 Canvas 2D Context mock for cinematic video renderer
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = function (contextType: string) {
      if (contextType === '2d') {
        return {
          clearRect: () => {},
          fillRect: () => {},
          drawImage: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          scale: () => {},
          rotate: () => {},
          beginPath: () => {},
          closePath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          bezierCurveTo: () => {},
          quadraticCurveTo: () => {},
          rect: () => {},
          arc: () => {},
          fill: () => {},
          stroke: () => {},
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createRadialGradient: () => ({ addColorStop: () => {} }),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    } as unknown as typeof HTMLCanvasElement.prototype.getContext;
  }

  // Web Audio Context Mock for UtsavOS sound synthesizers
  const MockAudioContext = class {
    state = 'running';
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
      };
    }
    createBiquadFilter() {
      return {
        type: 'lowpass',
        frequency: { setValueAtTime: () => {} },
        connect: () => {},
      };
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
    currentTime = 0;
    destination = {};
  };

  (window as unknown as Record<string, unknown>).AudioContext = MockAudioContext;
  (window as unknown as Record<string, unknown>).webkitAudioContext = MockAudioContext;
}
