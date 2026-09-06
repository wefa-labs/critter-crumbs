import { createHmac, timingSafeEqual } from 'node:crypto';
import { parseAddress, type Address } from '@critter-crumbs/shared';
const COOKIE = '__Host-cc_session';
const ATTRIBUTES = 'Secure; HttpOnly; SameSite=Lax; Path=/';
export function sessionCookies(secret: string) {
  if (secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  const mac = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');
  return {
    issue(address: Address, now: number) {
      const payload = Buffer.from(JSON.stringify({ address: parseAddress(address), exp: now + 7 * 86400000 })).toString('base64url');
      return `${COOKIE}=${payload}.${mac(payload)}; Max-Age=604800; ${ATTRIBUTES}`;
    },
    read(cookie: string | undefined, now: number): Address | null {
      const value = cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
      if (!value || value.length > 1024) return null;
      const parts = value.split('.'); if (parts.length !== 2) return null;
      const [payload, signature] = parts as [string, string];
      const expected = Buffer.from(mac(payload)), supplied = Buffer.from(signature);
      if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
      try {
        const decoded: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        if (!decoded || typeof decoded !== 'object' || !('exp' in decoded) || !('address' in decoded)
          || typeof decoded.exp !== 'number' || !Number.isSafeInteger(decoded.exp) || decoded.exp <= now) return null;
        return parseAddress(decoded.address);
      } catch { return null; }
    },
    clear() { return `${COOKIE}=; Max-Age=0; ${ATTRIBUTES}`; },
  };
}
