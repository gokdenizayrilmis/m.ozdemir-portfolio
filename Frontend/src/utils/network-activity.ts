export type NetworkActivityKind =
  | 'read'
  | 'write'
  | 'delete'
  | 'upload'
  | 'auth';

export interface NetworkActivitySnapshot {
  activeCount: number;
  currentKind: NetworkActivityKind;
}

const SERVER_SNAPSHOT: NetworkActivitySnapshot = {
  activeCount: 0,
  currentKind: 'read',
};

let activeKinds: NetworkActivityKind[] = [];
let snapshot: NetworkActivitySnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(): void {
  snapshot = {
    activeCount: activeKinds.length,
    currentKind:
      activeKinds.length > 0
        ? activeKinds[activeKinds.length - 1]
        : 'read',
  };
  listeners.forEach((listener) => listener());
}

export function resolveActivityKind(
  endpoint: string,
  method?: string
): NetworkActivityKind {
  if (endpoint.includes('/media/upload')) {
    return 'upload';
  }
  if (endpoint.includes('/auth/refresh')) {
    return 'auth';
  }

  const upperMethod = (method || 'GET').toUpperCase();
  if (upperMethod === 'DELETE') {
    return 'delete';
  }
  if (
    upperMethod === 'POST' ||
    upperMethod === 'PUT' ||
    upperMethod === 'PATCH'
  ) {
    return 'write';
  }

  return 'read';
}

export const networkActivity = {
  startRequest(kind: NetworkActivityKind): void {
    activeKinds = [...activeKinds, kind];
    emit();
  },

  endRequest(): void {
    if (activeKinds.length === 0) return;
    activeKinds = activeKinds.slice(0, -1);
    emit();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): NetworkActivitySnapshot {
    return snapshot;
  },

  getServerSnapshot(): NetworkActivitySnapshot {
    return SERVER_SNAPSHOT;
  },
};
