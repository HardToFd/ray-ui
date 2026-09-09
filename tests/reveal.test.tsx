import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from '../src';

// jsdom has no media-query or intersection engine. These controllable browser
// substitutes deliver the same external events without replacing Reveal logic.
function installMotionPreference(initiallyReduced: boolean) {
  let reduced = initiallyReduced;
  const changes = new EventTarget();
  const query = {
    media: '(prefers-reduced-motion: reduce)',
    get matches() { return reduced; },
    onchange: null,
    addEventListener: changes.addEventListener.bind(changes),
    removeEventListener: changes.removeEventListener.bind(changes),
    dispatchEvent: changes.dispatchEvent.bind(changes),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => query));

  return {
    setReduced(value: boolean) {
      reduced = value;
      const event = new Event('change');
      Object.defineProperties(event, {
        matches: { value },
        media: { value: query.media },
      });
      query.dispatchEvent(event);
    },
  };
}

function installIntersections() {
  const observers = new Set<ControlledObserver>();

  class ControlledObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin: string;
    readonly thresholds: readonly number[];
    readonly scrollMargin = '0px';
    readonly delay = 0;
    readonly trackVisibility = false;
    private readonly targets = new Set<Element>();

    constructor(private callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.rootMargin = options?.rootMargin ?? '0px';
      this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
      observers.add(this);
    }

    observe(target: Element) { this.targets.add(target); }
    unobserve(target: Element) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
    takeRecords(): IntersectionObserverEntry[] { return []; }

    notify(target: Element, isIntersecting: boolean) {
      if (!this.targets.has(target)) return;
      const bounds = target.getBoundingClientRect();
      this.callback([{
        time: performance.now(),
        target,
        rootBounds: null,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        isIntersecting,
        intersectionRatio: isIntersecting ? 1 : 0,
      }], this);
    }
  }

  vi.stubGlobal('IntersectionObserver', ControlledObserver);
  return {
    notify(target: Element, isIntersecting: boolean) {
      observers.forEach((observer) => observer.notify(target, isIntersecting));
    },
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Reveal progressive enhancement', () => {
  it('renders server content without an initial hidden state before hydration', () => {
    const markup = renderToStaticMarkup(<Reveal>Readable before JavaScript starts</Reveal>);
    const container = document.createElement('div');
    container.innerHTML = markup;
    const content = container.firstElementChild;

    expect(content?.textContent).toBe('Readable before JavaScript starts');
    expect(content?.getAttribute('data-visible')).not.toBe('false');
  });

  it('resumes repeatable reveals after reduced motion is disabled, including preference changes after mount', () => {
    const preference = installMotionPreference(true);
    const intersections = installIntersections();
    render(<Reveal once={false}>Repeatable content</Reveal>);
    const content = screen.getByText('Repeatable content');

    expect(content.getAttribute('data-visible')).toBe('true');
    act(() => preference.setReduced(false));
    act(() => intersections.notify(content, false));
    expect(content.getAttribute('data-visible')).toBe('false');
    act(() => intersections.notify(content, true));
    expect(content.getAttribute('data-visible')).toBe('true');

    act(() => preference.setReduced(true));
    act(() => intersections.notify(content, false));
    expect(content.getAttribute('data-visible')).toBe('true');
    act(() => preference.setReduced(false));
    act(() => intersections.notify(content, false));
    expect(content.getAttribute('data-visible')).toBe('false');
    act(() => intersections.notify(content, true));
    expect(content.getAttribute('data-visible')).toBe('true');
    act(() => intersections.notify(content, false));
    expect(content.getAttribute('data-visible')).toBe('false');
  });

  it('keeps content readable when IntersectionObserver is unavailable', () => {
    const preference = installMotionPreference(false);
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal once={false}>Fallback content</Reveal>);
    const content = screen.getByText('Fallback content');

    expect(content.getAttribute('data-visible')).toBe('true');
    act(() => preference.setReduced(true));
    act(() => preference.setReduced(false));
    expect(content.getAttribute('data-visible')).toBe('true');
  });
});
