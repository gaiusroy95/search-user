export function readStringParam(
  params: URLSearchParams,
  key: string,
  defaultValue = ''
): string {
  return params.get(key) ?? defaultValue
}

export function readEnumParam<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: readonly T[],
  defaultValue: T
): T {
  const value = params.get(key)
  return value && allowed.includes(value as T) ? (value as T) : defaultValue
}

export function readBooleanParam(
  params: URLSearchParams,
  key: string,
  defaultValue = false
): boolean {
  const value = params.get(key)
  if (value === '1' || value === 'true') return true
  if (value === '0' || value === 'false') return false
  return defaultValue
}

export function writeStringParam(
  params: URLSearchParams,
  key: string,
  value: string,
  defaultValue = ''
): void {
  const trimmed = value.trim()
  if (trimmed && trimmed !== defaultValue) {
    params.set(key, trimmed)
  } else {
    params.delete(key)
  }
}

export function writeEnumParam<T extends string>(
  params: URLSearchParams,
  key: string,
  value: T,
  defaultValue: T
): void {
  if (value !== defaultValue) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
}

export function writeBooleanParam(
  params: URLSearchParams,
  key: string,
  value: boolean,
  defaultValue = false
): void {
  if (value !== defaultValue) {
    params.set(key, value ? '1' : '0')
  } else {
    params.delete(key)
  }
}
