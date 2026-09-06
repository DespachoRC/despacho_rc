import { authMiddleware, authMiddlewareConfig } from '@/core/middleware/auth.middleware'
import { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    return authMiddleware(request)
}

export const config = {matcher:[
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};