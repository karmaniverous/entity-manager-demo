import { controlledProxy } from '@karmaniverous/controlled-proxy';

// Use the console logger. This could easily be replaced with a
// custom logger like winston.
export const logger = console;

// Proxy the logger & disable debug logging.
export const errorLogger = controlledProxy({
  defaultControls: { debug: false },
  target: logger,
});
