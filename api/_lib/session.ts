import crypto from 'crypto';

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function makeToken(data: Record<string, unknown>, secret: string, maxAgeSec: number): string {
  const payload = JSON.stringify({ ...data, exp: Date.now() + maxAgeSec * 1000 });
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${sign(b64, secret)}`;
}

export function verifyToken<T = Record<string, unknown>>(token: string | undefined, secret: string): T | null {
  if (!token) return null;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;

  const expected = sign(b64, secret);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  const data = JSON.parse(Buffer.from(b64, 'base64url').toString()) as T & { exp: number };
  if (Date.now() > data.exp) return null;
  return data;
}

export function readCookie(req: any, name: string): string | undefined {
  const header: string | undefined = req.headers?.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function setCookie(res: any, name: string, value: string, maxAgeSec: number): void {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  appendSetCookie(res, attrs.join('; '));
}

export function clearCookie(res: any, name: string): void {
  appendSetCookie(res, `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

function appendSetCookie(res: any, cookie: string): void {
  const existing = res.getHeader?.('Set-Cookie');
  const next = existing ? (Array.isArray(existing) ? [...existing, cookie] : [existing, cookie]) : [cookie];
  res.setHeader('Set-Cookie', next);
}

export function requireSession(req: any, secret: string): boolean {
  const token = readCookie(req, 'app_session');
  return verifyToken(token, secret) !== null;
}
