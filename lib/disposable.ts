import { kv } from '@vercel/kv';

// Check if domain is disposable
export async function isDisposable(domain: string): Promise<{
  is_disposable: boolean;
  message: string;
  provider?: string;
}> {
  try {
    const exists = await kv.sismember('disposable_domains', domain.toLowerCase());

    return {
      is_disposable: !!exists,
      message: exists
        ? 'Disposable/temporary email domain detected'
        : 'Not a disposable email domain',
      provider: exists ? domain : undefined,
    };
  } catch (error) {
    return {
      is_disposable: false,
      message: 'Unable to check disposable status',
    };
  }
}

// Load disposable domains list (run once on deployment)
export async function loadDisposableDomains(): Promise<void> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/domains.txt'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch disposable domains list');
    }

    const text = await response.text();
    const domains = text
      .split('\n')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    await kv.del('disposable_domains');

    if (domains.length > 0) {
      await kv.sadd('disposable_domains', ...domains);
    }

    console.log(`Loaded ${domains.length} disposable domains`);
  } catch (error) {
    console.error('Failed to load disposable domains:', error);
    throw error;
  }
}
