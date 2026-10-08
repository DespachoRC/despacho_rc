import { NextResponse } from 'next/server';
import {
  SuperadminForbiddenError,
  SuperadminNotFoundError,
  SuperadminUnauthorizedError,
  SuperadminValidationError,
} from '@/core/middleware/superadmin.guard';

// Archivo auxiliar (prefijo _ => no es una ruta). Traduce errores tipados a respuestas HTTP.
export function respuestaError(error: unknown) {
  if (error instanceof SuperadminUnauthorizedError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
  if (error instanceof SuperadminForbiddenError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 403 });
  }
  if (error instanceof SuperadminNotFoundError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
  if (error instanceof SuperadminValidationError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  console.error('[api/superadmin] error:', error);
  return NextResponse.json(
    { success: false, error: 'Error interno del servidor' },
    { status: 500 }
  );
}
