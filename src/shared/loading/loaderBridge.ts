let begin: (() => void) | undefined;
let end: (() => void) | undefined;

export function registerLoaderHandlers(handlers: { beginLoading: () => void; endLoading: () => void }) {
  begin = handlers.beginLoading;
  end = handlers.endLoading;
}

export function beginGlobalLoading() {
  begin?.();
}

export function endGlobalLoading() {
  end?.();
}


