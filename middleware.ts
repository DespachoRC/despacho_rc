import { authMiddleware } from '@/core/middleware/auth.middleware'
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return authMiddleware(request)
}

// next.js requiere que config sea un objeto literal estatico, no una referencia importada
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
