import { ConversacionesRepository } from '../repositories/conversaciones.repository';
import { UserRepository } from '../repositories/usuarios.repository';
import { getAuthUser } from '../db/get-user';

export class ConversacionesService {
    
    // Obtener todas las conversaciones del usuario
    static async getConversaciones(request: Request) {
        const user = await getAuthUser(request);
        return await ConversacionesRepository.getConversaciones(user.id);
    }

    // Obtener mensajes de una conversacion
    static async getMensajes(conversacionId: string, request: Request) {
        // Al obtener el auth user, la base de datos aplicará RLS automáticamente 
        // para asegurarse de que el usuario es participante de la conversacion.
        await getAuthUser(request);
        return await ConversacionesRepository.getMensajes(conversacionId);
    }

    // Enviar mensaje
    static async enviarMensaje(conversacionId: string, contenido: string, request: Request) {
        const user = await getAuthUser(request);

        // Validamos que la conversacion exista y que el usuario sea participante
        const conversacion = await ConversacionesRepository.getConversacion(conversacionId);
        
        const mensajeCreado = await ConversacionesRepository.enviarMensaje({
            conversacion_id: conversacionId,
            remitente_id: user.id,
            contenido
        });

        // Determinar el destinatario del mensaje
        let destinatarioId: string | null = null;
        let urlDestino = '/cliente/dashboard/results';

        if (conversacion.cliente_id === user.id) {
            destinatarioId = conversacion.contador_id || conversacion.admin_id;
            urlDestino = `/contador/dashboard/clients/details?cliente_id=${user.id}`;
        } else {
            destinatarioId = conversacion.cliente_id;
            urlDestino = '/cliente/dashboard/results';
        }

        if (destinatarioId) {
            const { NotificacionesRepository } = await import('../repositories/notificaciones.repository');
            const { UserRepository } = await import('../repositories/usuarios.repository');
            const perfilRemitente = await UserRepository.getPerfil(user.id);
            const nombreRemitente = `${perfilRemitente.nombre || 'Usuario'} ${perfilRemitente.apellido_paterno || ''}`.trim();

            NotificacionesRepository.crearNotificacion({
                usuario_id: destinatarioId,
                titulo: `Mensaje de ${nombreRemitente}`,
                mensaje: contenido.length > 50 ? `${contenido.substring(0, 50)}...` : contenido,
                tipo: 'mensaje',
                url_destino: urlDestino,
            }).catch(console.error);
        }

        return mensajeCreado;
    }

    // Crear conversacion nueva
    static async crearConversacion(
        tipo: 'contador_cliente' | 'cliente_admin', 
        contraparteId: string, 
        request: Request
    ) {
        const user = await getAuthUser(request);
        const perfil = await UserRepository.getPerfil(user.id);
        const rol = Array.isArray(perfil.roles) ? perfil.roles[0]?.nombre : (perfil.roles as any)?.nombre;

        // Necesitamos asegurar de extraer el organizacion_id correctamente
        const userOrg = await UserRepository.get_org_id_repository(user.id);

        let cliente_id = '';
        let contador_id = undefined;
        let admin_id = undefined;

        if (tipo === 'contador_cliente') {
            if (rol === 'cliente') {
                cliente_id = user.id;
                contador_id = contraparteId; // contraparte es contador
            } else if (rol === 'contador') {
                contador_id = user.id;
                cliente_id = contraparteId; // contraparte es cliente
            } else {
                throw new Error('Solo clientes y contadores pueden crear conversaciones de este tipo');
            }
        } else if (tipo === 'cliente_admin') {
            if (rol === 'cliente') {
                cliente_id = user.id;
                admin_id = contraparteId; // contraparte es admin
            } else if (rol === 'admin' || rol === 'owner') {
                admin_id = user.id;
                cliente_id = contraparteId; // contraparte es cliente
            } else {
                throw new Error('Solo clientes y administradores pueden crear conversaciones de este tipo');
            }
        }

        return await ConversacionesRepository.crearConversacion({
            organizacion_id: userOrg,
            tipo,
            cliente_id,
            contador_id,
            admin_id
        });
    }
}
