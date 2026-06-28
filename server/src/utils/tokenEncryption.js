import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;   // 256 bits
const IV_BYTES = 12;    // 96 bits — recommended for GCM
const TAG_BYTES = 16;   // 128-bit auth tag

function deriveKey() {
  const secret = process.env.TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable must be set to encrypt OAuth tokens.');
  }
  // scrypt: slow by design — brute-force resistant even if the env var is weak
  return crypto.scryptSync(secret, 'hyperone-token-salt-v1', KEY_BYTES);
}

/**
 * Encrypts a plaintext string (e.g. an OAuth access or refresh token) with
 * AES-256-GCM. Each call uses a unique random IV so the same plaintext
 * produces a different ciphertext every time.
 *
 * Format: <ivHex>:<authTagHex>:<ciphertextHex>
 * Store the returned string in MongoDB; never log or return it to the client.
 */
export function encryptToken(plaintext) {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a token previously encrypted with encryptToken().
 * The GCM auth tag is verified automatically — any tampering throws.
 */
export function decryptToken(ciphertext) {
  const [ivHex, tagHex, encHex] = ciphertext.split(':');
  if (!ivHex || !tagHex || !encHex) {
    throw new Error('Malformed encrypted token.');
  }

  const key = deriveKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Refreshes an OAuth access token using a stored encrypted refresh token.
 * Call this before making any external API call when the access token may
 * have expired. Re-encrypt and persist the new tokens before returning.
 *
 * @param {string} encryptedRefreshToken - The encrypted refresh token from MongoDB.
 * @param {string} provider - 'google' | 'spotify' | 'plaid' etc.
 * @returns {{ encryptedAccessToken: string, encryptedRefreshToken: string, expiresAt: Date }}
 */
export async function refreshAccessToken(encryptedRefreshToken, provider) {
  const refreshToken = decryptToken(encryptedRefreshToken);

  const providerEndpoints = {
    google: 'https://oauth2.googleapis.com/token',
    spotify: 'https://accounts.spotify.com/api/token',
  };

  const endpoint = providerEndpoints[provider];
  if (!endpoint) throw new Error(`Unsupported OAuth provider: ${provider}`);

  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    throw new Error(`Missing ${provider.toUpperCase()}_CLIENT_ID or ${provider.toUpperCase()}_CLIENT_SECRET env vars.`);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error('Token refresh failed.');
  }

  const data = await res.json();

  return {
    encryptedAccessToken: encryptToken(data.access_token),
    // Providers don't always issue a new refresh token — fall back to the original
    encryptedRefreshToken: data.refresh_token
      ? encryptToken(data.refresh_token)
      : encryptedRefreshToken,
    expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
  };
}
