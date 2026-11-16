import type { Terminal, ITerminalAddon } from '@xterm/xterm';

/**
 * Pterodactyl-style scroll pinning helper addon for xterm.js
 * Tracks terminal buffer scroll position:
 * When at bottom (viewportY === baseY), stays pinned to new logs.
 * When user scrolls up to inspect history, pauses auto-scroll and displays a floating
 * "⬇ New logs below" pill button that returns to bottom on click.
 */
export class XtermScrollDownHelperAddon implements ITerminalAddon {
  private terminal: Terminal | null = null;
  private element?: HTMLDivElement;
  private onScrollDisposable?: { dispose: () => void };
  private onLineFeedDisposable?: { dispose: () => void };

  activate(terminal: Terminal): void {
    this.terminal = terminal;

    this.onScrollDisposable = this.terminal.onScroll(() => {
      if (this.isScrolledDown()) {
        this.hide();
      }
    });

    this.onLineFeedDisposable = this.terminal.onLineFeed(() => {
      if (!this.isScrolledDown()) {
        this.show();
      }
    });

    if (!this.isScrolledDown()) {
      this.show();
    } else {
      this.hide();
    }
  }

  dispose(): void {
    if (this.onScrollDisposable) {
      this.onScrollDisposable.dispose();
    }
    if (this.onLineFeedDisposable) {
      this.onLineFeedDisposable.dispose();
    }
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.element = undefined;
    this.terminal = null;
  }

  show(): void {
    if (!this.terminal || !this.terminal.element) {
      return;
    }

    if (this.element) {
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      this.element.style.pointerEvents = 'auto';
      return;
    }

    this.terminal.element.style.position = 'relative';

    this.element = document.createElement('div');
    this.element.className = 'xterm-scroll-down-helper';
    this.element.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background-color: #2563eb;
        color: #ffffff;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 11px;
        font-weight: 700;
        border-radius: 9999px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(147, 197, 253, 0.4);
        cursor: pointer;
        user-select: none;
        transition: transform 0.15s ease, background-color 0.15s ease;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
        <span>New logs below</span>
      </div>
    `;

    this.element.style.position = 'absolute';
    this.element.style.right = '1.5rem';
    this.element.style.bottom = '1rem';
    this.element.style.zIndex = '40';
    this.element.style.cursor = 'pointer';
    this.element.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    this.element.style.visibility = 'visible';
    this.element.style.opacity = '1';

    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (this.terminal) {
        this.terminal.scrollToBottom();
      }
      this.hide();
    });

    this.terminal.element.appendChild(this.element);
  }

  hide(): void {
    if (this.element) {
      this.element.style.visibility = 'hidden';
      this.element.style.opacity = '0';
      this.element.style.pointerEvents = 'none';
    }
  }

  isScrolledDown(): boolean {
    if (!this.terminal) return true;
    return this.terminal.buffer.active.viewportY === this.terminal.buffer.active.baseY;
  }
}
