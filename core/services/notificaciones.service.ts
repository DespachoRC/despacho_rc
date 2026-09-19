import { NotificacionesRepository } from "../repositories/notificaciones.repository";
import { getAuthUser } from "../db/get-user";

export class NotificacionesService {
    
    public static async getMisNotificaciones(request: Request) {
        const user = await getAuthUser(request);
        return await NotificacionesRepository.getNotificaciones(user.id);
    }

    public static async marcarLeida(id: string, request: Request) {
        const user = await getAuthUser(request);
        return await NotificacionesRepository.marcarComoLeida(id, user.id);
    }

    public static async marcarTodasLeidas(request: Request) {
        const user = await getAuthUser(request);
        return await NotificacionesRepository.marcarTodasComoLeidas(user.id);
    }
}
