import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      setIsClosing(false);
      return;
    }

    if (!isRendered) {
      return;
    }

    setIsClosing(true);
    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [open, isRendered]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`login-modal-overlay ${isClosing ? 'is-closing' : 'is-opening'}`}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="login-modal-close"
          type="button"
          aria-label="Close login modal"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="login-modal-hero">
          <img
            src="/landing/people/3bd0f6c0f593e73cb81bfa10580fa46d0962f89f.jpg"
            alt=""
            aria-hidden="true"
          />
          <div className="login-modal-hero-copy">
            <p>ENJOY 20% OFF</p>
            <p>YOUR FIRST PURCHASE</p>
          </div>
          <div className="login-modal-dots" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="login-modal-content">
          <h2 id="login-modal-title">LOG IN OR CREATE YOUR ACCOUNT</h2>
          <p>
            Be the first one to know when the exclusive discounts and the new collections drops.
          </p>

          <form className="login-modal-form">
            <div className="login-modal-phone">
              <span>+62</span>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Input your phone number"
                onInput={(event) => {
                  const input = event.currentTarget;
                  input.value = input.value.replace(/\D/g, '');
                }}
              />
            </div>
            <button type="submit">Continue</button>
          </form>
        </div>
      </section>
    </div>
  );
}
