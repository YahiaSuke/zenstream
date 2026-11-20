const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev_insecure_auth_secret_key_minimum_32_characters';

class AuthService {
  // Hash password using PBKDF2 with unique salt
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verify password against stored hash
  verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  }

  // Create signed session token
  createSessionToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
    const signature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  // Verify and decode session token
  verifySessionToken(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }
      return decoded;
    } catch {
      return null;
    }
  }

  // Authorization check: Answers "can this user perform action on this resource"
  canUserAccess(authenticatedUserId, resourceOwnerUserId) {
    if (!authenticatedUserId || !resourceOwnerUserId) return false;
    return authenticatedUserId === resourceOwnerUserId;
  }

  // Format secure HTTP-only cookie header
  createSessionCookie(token) {
    const isProd = process.env.NODE_ENV === 'production';
    return `streamflow_session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${
      isProd ? '; Secure' : ''
    }`;
  }

  // Extract session token from cookie header
  getTokenFromCookie(cookieHeader) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/streamflow_session=([^;]+)/);
    return match ? match[1] : null;
  }
}

module.exports = new AuthService();
