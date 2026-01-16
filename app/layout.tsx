import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VerifyFlow - Email Verification API | Real-Time Validation',
  description: 'Validate email addresses in real-time. Detect disposable emails, check syntax, DNS, and SMTP. Usage-based pricing from $9/mo. Start free.',
  keywords: ['email verification', 'email validation', 'API', 'disposable email', 'SMTP verification'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
