type StoredPayload<T> = {
  version: 1
  data: T
}

export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return safeJsonParse<T>(raw)
  } catch {
    return null
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function loadVersioned<T>(key: string): T | null {
  const payload = loadFromStorage<StoredPayload<T>>(key)
  if (!payload) return null
  if (payload.version !== 1) return null
  return payload.data
}

export function saveVersioned<T>(key: string, data: T): void {
  saveToStorage<StoredPayload<T>>(key, { version: 1, data })
}
