import { NextResponse } from 'next/server';
import { SuperadminService } from '@/core/services/superadmin.service';
import { respuestaError } from '@/app/api/superadmin/_errores';

// GET /api/superadmin/organizaciones?page=1&pageSize=12&q=texto
// Solo lectura. Exclusivo del rol owner.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const data = await SuperadminService.listarOrganizaciones(request, params);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    return respuestaError(error);
  }
}
