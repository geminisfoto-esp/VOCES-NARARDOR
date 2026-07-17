import { requireSession } from './_lib/session.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.SESSION_SECRET;
  const configured = Boolean(process.env.APP_USER && process.env.APP_PASSWORD && secret);

  if (!configured) {
    return res.status(200).json({ authenticated: true, configured: false });
  }

  const authenticated = requireSession(req, secret as string);
  return res.status(200).json({ authenticated, configured: true });
}
