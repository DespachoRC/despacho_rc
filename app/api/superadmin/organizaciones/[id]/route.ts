import { NextResponse } from 'next/server';
import { SuperadminService } from '@/core/services/superadmin.service';
import { respuestaError } from '@/app/api/superadmin/_errores';

// GET /api/superadmin/organizaciones/[id]?seccion=resumen|usuarios|cotizaciones|actividades|carpetas
// Parametros opcionales: page, pageSize, rol (usuarios), filtro (cotizaciones/actividades)
// Solo lectura. Exclusivo del rol owner.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const query = new URL(request.url).searchParams;
    const data = await SuperadminService.detalleOrganizacion(request, id, query);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return respuestaError(error);
  }
}
