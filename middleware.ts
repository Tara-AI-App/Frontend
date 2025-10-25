// Middleware is not needed for client-side locale switching
// The locale is managed via LocaleContext and localStorage
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
