import { NextRequest } from 'next/server';
import { proxyLoginRequest } from '../_utils';

export async function POST(request: NextRequest) {
  return proxyLoginRequest(request, 'api/auth/login');
}
