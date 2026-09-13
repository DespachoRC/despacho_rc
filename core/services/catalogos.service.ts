import { createClient } from '@/core/db/server';

// tablas permitidas para el crud de catalogos — cualquier otro valor es rechazado
const TABLAS_PERMITIDAS = [
    'regimenes_fiscales',
    'especialidad_contador',
    'catalogo_actividades',
    'categoria_documentos',
] as const;

type TablaPermitida = typeof TABLAS_PERMITIDAS[number];

export class CatalogosService {

    // validamos que la tabla recibida sea una de las 4 permitidas
    private static validarTabla(tabla: string): TablaPermitida {
        if (!TABLAS_PERMITIDAS.includes(tabla as TablaPermitida)) {
            throw new Error(
                `Catalogo invalido: '${tabla}'. Los valores permitidos son: ${TABLAS_PERMITIDAS.join(', ')}`
            );
        }
        return tabla as TablaPermitida;
    }

    // retorna todos los registros del catalogo, con filtro opcional de activos
    static async getAll(tabla: string, soloActivos: boolean) {
        const supabase = await createClient();
        const tablaValida = this.validarTabla(tabla);

        let query = supabase.from(tablaValida).select('id, nombre, activo');

        if (soloActivos) {
            query = query.eq('activo', true);
        }

        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    // inserta un nuevo registro activo en el catalogo indicado
    static async create(tabla: string, nombre: string) {
        const supabase = await createClient();
        const tablaValida = this.validarTabla(tabla);

        const { data, error } = await supabase
            .from(tablaValida)
            .insert({ nombre, activo: true })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    // actualiza el campo activo — sirve para soft delete o para reactivar un registro
    static async toggleEstatus(tabla: string, id: string, activo: boolean) {
        const supabase = await createClient();
        const tablaValida = this.validarTabla(tabla);

        const { data, error } = await supabase
            .from(tablaValida)
            .update({ activo })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}
