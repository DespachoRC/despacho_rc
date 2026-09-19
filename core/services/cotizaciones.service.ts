import { CreateCotizacionDTO, FijarPrecioDTO, ResponderCotizacionDTO } from '../schemas/cotizacion.schema';
import { CotizacionesRepository } from '../repositories/cotizaciones.repository';
import { UserRepository } from '../repositories/usuarios.repository';
import { getAuthUser } from '../db/get-user';

export class CotizacionesService {

    // admin obtiene las cotizaciones pendientes de su organizacion
    static async getPendientes(request: Request) {
        const user = await getAuthUser(request);
        const organizacionId = await UserRepository.get_org_id_repository(user.id);
        return await CotizacionesRepository.findPendientes(organizacionId);
    }

    // cliente crea una nueva cotizacion
    static async createCotizacion(dto: CreateCotizacionDTO, request: Request) {
        const user = await getAuthUser(request);
        const organizacionId = await UserRepository.get_org_id_repository(user.id);
        return await CotizacionesRepository.create(dto, user.id, organizacionId);
    }

    // admin fija el precio
    static async fijarPrecio(cotizacionId: string, dto: FijarPrecioDTO, request: Request) {
        await getAuthUser(request); // verifica que este autenticado
        return await CotizacionesRepository.fijarPrecio(cotizacionId, dto);
    }

    // admin rechaza directamente una cotizacion
    static async rechazarPorAdmin(cotizacionId: string, request: Request) {
        await getAuthUser(request);
        return await CotizacionesRepository.rechazarPorAdmin(cotizacionId);
    }

    // cliente acepta o rechaza
    static async responderCotizacion(cotizacionId: string, dto: ResponderCotizacionDTO, request: Request) {
        const user = await getAuthUser(request);
        return await CotizacionesRepository.responder(cotizacionId, dto.respuesta, user.id);
    }

    // cliente consulta el historial de sus propias cotizaciones
    static async getMisCotizaciones(request: Request) {
        const user = await getAuthUser(request);
        return await CotizacionesRepository.findByCliente(user.id);
    }

}
