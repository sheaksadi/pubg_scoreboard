export function logout(req, res) {
    res.clearCookie('session', { path: '/', domain: process.env.COOKIE_DOMAIN || 'localhost' });
    res.json({ success: true });
}
