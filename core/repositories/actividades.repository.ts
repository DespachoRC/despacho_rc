// TODO: extraer aquí todas las queries de Supabase de actividades.service.ts
// Métodos esperados:
//   - getInsumos(actividadId)
//   - actualizarEstatus(actividadId, estatusId)
//   - insertarDocumento(data)
//   - getResultados(clienteId)
//   - getEstatusId(nombre)  ← helper de catálogo compartido, considerar moverlo a catalogos.repository.ts
import {createClient} from "@/core/db/server" 

const supabase = await createClient();
export class ActividadesRepository{
    //obtener datos de la actividad
    public static async get_actividad_data(id: string): Promise<any>{
        const { data,error } = await supabase
            .from("actividades")
            .select()
            .eq('id', id)
            .single();

        if (error || !data) throw new Error (`Actividad no encontrada`)
        return data as any;
}



}