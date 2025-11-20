import { controlledProxy } from '@karmaniverous/controlled-proxy';

/**
 * Minimal logger wiring for the demo.
 *
 * We use console by default for simplicity. You can swap this for
 * your favorite structured logger (e.g., pino, winston) without
 * touching the rest of the codebase.
 */
export const logger = console;

/**
 * Proxy console to suppress "debug" logs from the Entity* stack while
 * keeping "error" visible. This keeps test output and examples quiet.
 *
 * Flip debug back on by changing defaultControls.debug to true.
 */
export const errorLogger = controlledProxy({
  defaultControls: { debug: false },
  target: logger,
});
