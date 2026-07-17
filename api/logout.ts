import { clearCookie } from './_lib/session';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearCookie(res, 'app_session');
  return res.status(200).json({ ok: true });
}
