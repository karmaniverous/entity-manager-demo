import { controlledProxy } from '@karmaniverous/controlled-proxy';

// Proxy the console logger & disable debug logging.
export const logger = controlledProxy({
  defaultControls: { debug: false },
  target: console,
});
