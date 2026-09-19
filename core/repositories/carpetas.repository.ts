import { createClient } from '../db/server';

export class CarpetasRepository {
    public static async getCarpetasAdmin(orgId: string) {
        const supabase = await createClient();

        // 1. Obtener contadores
        const { data: contadores, error: errContadores } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido_paterno, roles!inner(nombre)')
            .eq('organizacion_id', orgId)
            .eq('roles.nombre', 'contador');

        if (errContadores) throw new Error(errContadores.message);

        // 2. Obtener clientes
        const { data: clientes, error: errClientes } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido_paterno, contador_id, regimenes_fiscales(nombre), roles!inner(nombre)')
            .eq('organizacion_id', orgId)
            .eq('roles.nombre', 'cliente');

        if (errClientes) throw new Error(errClientes.message);

        // 3. Obtener documentos generales (sin actividad asignada)
        const { data: documentos, error: errDocs } = await supabase
            .from('documentos')
            .select('id, nombre_archivo, ruta_archivo, cliente_id, categoria_documentos(nombre)')
            .eq('organizacion_id', orgId)
            .is('actividad_id', null);

        if (errDocs) throw new Error(errDocs.message);

        // 4. Obtener catálogo de categorías de documentos
        const { data: catDocs, error: errCats } = await supabase
            .from('categoria_documentos')
            .select('nombre')
            .eq('activo', true)
            .order('nombre');

        if (errCats) throw new Error(errCats.message);
        const catNames = catDocs.map(c => c.nombre);

        // Armar la estructura
        const result = contadores.map(contador => {
            const clientesAsignados = clientes.filter(c => c.contador_id === contador.id).map(cliente => {
                const docsCliente = documentos.filter(d => d.cliente_id === cliente.id);
                // Agrupar documentos por categoría dinámica
                const categories = catNames.map(cat => ({
                    nombre: cat,
                    archivos: [] as any[]
                }));
                const generalCat = { nombre: 'General', archivos: [] as any[] };

                docsCliente.forEach(doc => {
                    const docCatName = (doc.categoria_documentos as any)?.nombre;
                    const docItem = { nombre: doc.nombre_archivo, url: doc.ruta_archivo };
                    
                    const catTarget = categories.find(c => c.nombre === docCatName);
                    if (catTarget) {
                        catTarget.archivos.push(docItem);
                    } else {
                        generalCat.archivos.push(docItem);
                    }
                });

                if (generalCat.archivos.length > 0 || categories.length === 0) {
                    categories.push(generalCat);
                }

                return {
                    id: cliente.id,
                    nombre: `${cliente.nombre} ${cliente.apellido_paterno || ''}`.trim(),
                    regimen: (cliente.regimenes_fiscales as any)?.nombre || 'Sin régimen',
                    totalArchivos: docsCliente.length,
                    categories
                };
            });

            return {
                id: contador.id,
                nombre: `${contador.nombre} ${contador.apellido_paterno || ''}`.trim(),
                clientes: clientesAsignados
            };
        });

        // Agregar también a los clientes que no tienen contador asignado (opcional pero útil para el admin)
        const clientesSinContador = clientes.filter(c => !c.contador_id).map(cliente => {
            const docsCliente = documentos.filter(d => d.cliente_id === cliente.id);
            const categories = catNames.map(cat => ({ nombre: cat, archivos: [] as any[] }));
            const generalCat = { nombre: 'General', archivos: [] as any[] };
            
            docsCliente.forEach(doc => {
                const docCatName = (doc.categoria_documentos as any)?.nombre;
                const docItem = { nombre: doc.nombre_archivo, url: doc.ruta_archivo };
                const catTarget = categories.find(c => c.nombre === docCatName);
                if (catTarget) catTarget.archivos.push(docItem);
                else generalCat.archivos.push(docItem);
            });

            if (generalCat.archivos.length > 0 || categories.length === 0) {
                categories.push(generalCat);
            }

            return {
                id: cliente.id,
                nombre: `${cliente.nombre} ${cliente.apellido_paterno || ''}`.trim(),
                regimen: (cliente.regimenes_fiscales as any)?.nombre || 'Sin régimen',
                totalArchivos: docsCliente.length,
                categories
            };
        });

        if (clientesSinContador.length > 0) {
            result.push({
                id: 'unassigned',
                nombre: 'Sin Contador Asignado',
                clientes: clientesSinContador
            });
        }

        return result;
    }
}
