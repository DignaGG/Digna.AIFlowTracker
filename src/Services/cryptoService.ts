const SALT_KEY = 'pipeline-salt'
const ENC_KEY = 'pipeline-encryption'
const STORAGE_KEY = 'pipeline-steps'
const ITERATIONS = 100000
const KEY_LENGTH = 256

let cachedKey: CryptoKey | null = null

export class DecryptionError extends Error {
  constructor() {
    super('Hatalı parola')
    this.name = 'DecryptionError'
  }
}

export function isEncryptedBlob(
  data: unknown,
): data is { cipherText: string; iv: string } {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.cipherText === 'string' &&
    typeof obj.iv === 'string' &&
    Object.keys(obj).length === 2
  )
}

function getStoredSalt(): Uint8Array<ArrayBuffer> | null {
  const raw = localStorage.getItem(SALT_KEY)
  if (!raw) return null
  const arr: number[] = JSON.parse(raw)
  const salt = createBuffer(arr.length)
  salt.set(arr)
  return salt
}

function storeSalt(salt: Uint8Array): void {
  localStorage.setItem(SALT_KEY, JSON.stringify(Array.from(salt)))
}

function createBuffer(size: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(size))
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = createBuffer(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptWithKey(
  plainText: string,
  key: CryptoKey,
): Promise<{ cipherText: string; iv: string }> {
  const enc = new TextEncoder()
  const iv = createBuffer(12)
  crypto.getRandomValues(iv)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText),
  )
  return {
    cipherText: bytesToBase64(new Uint8Array(encrypted) as Uint8Array<ArrayBuffer>),
    iv: bytesToBase64(iv),
  }
}

async function decryptWithKey(
  data: { cipherText: string; iv: string },
  key: CryptoKey,
): Promise<string> {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(data.iv) },
      key,
      base64ToBytes(data.cipherText),
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    throw new DecryptionError()
  }
}

export function isUnlocked(): boolean {
  return cachedKey !== null
}

export function lock(): void {
  cachedKey = null
}

export function isPasswordSetupComplete(): boolean {
  return localStorage.getItem(SALT_KEY) !== null
}

export function isEncryptionActive(): boolean {
  return localStorage.getItem(ENC_KEY) === 'enabled'
}

export function skipEncryption(): void {
  localStorage.setItem(ENC_KEY, 'disabled')
}

export async function validateAndSetPassword(
  password: string,
): Promise<boolean> {
  const salt = getStoredSalt()
  if (!salt) return false
  const key = await deriveKey(password, salt)
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    cachedKey = key
    return true
  }
  try {
    const parsed = JSON.parse(raw)
    if (isEncryptedBlob(parsed)) {
      await decryptWithKey(parsed, key)
    }
    cachedKey = key
    return true
  } catch {
    cachedKey = null
    return false
  }
}

export async function setupPassword(password: string): Promise<void> {
  const salt = createBuffer(16)
  crypto.getRandomValues(salt)
  cachedKey = await deriveKey(password, salt)
  storeSalt(salt)
  localStorage.setItem(ENC_KEY, 'enabled')

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const encrypted = await encryptWithKey(
          JSON.stringify(parsed),
          cachedKey,
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted))
        return
      }
    } catch {
      // ignore migration errors
    }
  }
  // Ensure an encrypted empty array exists for future validation
  const empty = await encryptWithKey('[]', cachedKey)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(empty))
}

export async function setKeyFromPassword(password: string): Promise<void> {
  const salt = getStoredSalt()
  if (!salt) throw new Error('Salt bulunamadı')
  cachedKey = await deriveKey(password, salt)
}

export async function encryptData(
  plainText: string,
): Promise<{ cipherText: string; iv: string }> {
  if (!cachedKey) throw new Error('Kilit açık değil')
  return encryptWithKey(plainText, cachedKey)
}

export async function decryptData(
  data: { cipherText: string; iv: string },
): Promise<string> {
  if (!cachedKey) throw new Error('Kilit açık değil')
  return decryptWithKey(data, cachedKey)
}
