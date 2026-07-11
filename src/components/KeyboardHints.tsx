import { KEYBOARD_HINTS } from '../lib/keyboard';

export function KeyboardHints() {
  return (
    <div className="keyboard-hints">
      <h3>Keyboard shortcuts</h3>
      <div className="keyboard-grid">
        {KEYBOARD_HINTS.map((hint) => (
          <div key={hint.keys} className="keyboard-hint">
            <kbd>{hint.keys}</kbd>
            <span>{hint.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
