import { describe, expect, it } from 'vitest';
import { getCsrfTokenFromRequest } from './_utils';

describe('getCsrfTokenFromRequest', () => {
  it('prefers the _csrf cookie when the request header is stale', () => {
    const request = {
      headers: new Headers({ 'x-csrf-token': 'stale-header-token' }),
      cookies: {
        get: (name: string) => (name === '_csrf' ? { value: 'cookie-token' } : undefined),
      },
    };

    expect(getCsrfTokenFromRequest(request as never)).toBe('cookie-token');
  });

  it('falls back to the _csrf cookie when the header is absent', () => {
    const request = {
      headers: new Headers(),
      cookies: {
        get: (name: string) => (name === '_csrf' ? { value: 'cookie-token' } : undefined),
      },
    };

    expect(getCsrfTokenFromRequest(request as never)).toBe('cookie-token');
  });
});
