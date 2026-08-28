import { authMiddleware, authMiddlewareConfig } from '@/core/middleware/auth.middleware'
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    return authMiddleware(request)
}

export const config = authMiddlewareConfig
