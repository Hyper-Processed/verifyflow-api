import dns from 'dns/promises';
import net from 'net';

// Email syntax validation
export function validateSyntax(email: string): {
  valid: boolean;
  message: string;
} {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    return { valid: false, message: 'Invalid email syntax' };
  }

  if (email.length > 320) {
    return { valid: false, message: 'Email too long (max 320 chars)' };
  }

  const [local, domain] = email.split('@');

  if (local.length > 64) {
    return { valid: false, message: 'Local part too long (max 64 chars)' };
  }

  return { valid: true, message: 'Valid email syntax' };
}

// DNS/MX record validation
export async function validateDomain(domain: string): Promise<{
  valid: boolean;
  message: string;
  mx_records?: string[];
  error?: string;
}> {
  try {
    const mxRecords = await dns.resolveMx(domain);

    if (mxRecords.length === 0) {
      return {
        valid: false,
        message: 'Domain has no MX records (cannot receive email)',
      };
    }

    // Sort by priority (lower = higher priority)
    mxRecords.sort((a, b) => a.priority - b.priority);

    return {
      valid: true,
      message: 'Domain exists and has MX records',
      mx_records: mxRecords.map((r) => r.exchange),
    };
  } catch (error: any) {
    return {
      valid: false,
      message: 'Domain does not exist or DNS lookup failed',
      error: error.code,
    };
  }
}

// SMTP mailbox verification
export async function verifySMTP(
  email: string,
  mxHost: string,
  timeout = 10000
): Promise<{
  valid: boolean;
  message: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxHost);
    let response = '';
    let step = 0;

    socket.setTimeout(timeout);

    socket.on('data', (data) => {
      response += data.toString();

      if (step === 0 && response.includes('220')) {
        step = 1;
        socket.write('HELO verifyflow.com\r\n');
      } else if (step === 1 && response.includes('250')) {
        step = 2;
        socket.write('MAIL FROM:<verify@verifyflow.com>\r\n');
      } else if (step === 2 && response.includes('250')) {
        step = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
      } else if (step === 3) {
        if (response.includes('250')) {
          socket.write('QUIT\r\n');
          socket.end();
          resolve({ valid: true, message: 'Mailbox exists and accepts mail' });
        } else if (response.includes('550') || response.includes('551')) {
          socket.write('QUIT\r\n');
          socket.end();
          resolve({ valid: false, message: 'Mailbox does not exist' });
        }
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        valid: false,
        message: 'SMTP verification timeout (assuming valid)',
      });
    });

    socket.on('error', (err) => {
      resolve({
        valid: false,
        message: 'SMTP connection failed (assuming valid)',
        error: err.message,
      });
    });
  });
}

// Role-based email detection
export function isRoleBased(email: string): {
  is_role: boolean;
  message: string;
} {
  const ROLE_PREFIXES = [
    'admin',
    'info',
    'support',
    'sales',
    'contact',
    'help',
    'noreply',
    'no-reply',
    'service',
    'team',
    'hello',
    'webmaster',
    'postmaster',
    'abuse',
  ];

  const local = email.split('@')[0].toLowerCase();
  const isRole = ROLE_PREFIXES.some((prefix) => local.startsWith(prefix));

  return {
    is_role: isRole,
    message: isRole
      ? 'Role-based address (not personal)'
      : 'Not a role-based address',
  };
}

// Risk scoring
export function calculateRiskScore(checks: {
  syntax: { valid: boolean };
  domain: { valid: boolean };
  smtp: { valid: boolean };
  disposable: { is_disposable: boolean };
  role_based: { is_role: boolean };
}): number {
  let score = 0;

  if (!checks.syntax.valid) score += 100;
  if (!checks.domain.valid) score += 80;
  if (!checks.smtp.valid) score += 60;
  if (checks.disposable.is_disposable) score += 70;
  if (checks.role_based.is_role) score += 20;

  return Math.min(score, 100);
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
