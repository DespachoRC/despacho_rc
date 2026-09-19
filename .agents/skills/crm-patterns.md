---
name: crm-dashboard-patterns
description: Patrones de diseño y layouts estándar para CRMs, tablas analíticas y métricas
---

Cuando el usuario pida componentes de CRM o Dashboard:
1. **KPI Cards:** Presenta siempre: título sutil, valor principal prominente, badge con delta porcentual (positivo/negativo) y micro-gráfica o icono Lucide en la esquina.
2. **Data Tables:** Estructura tablas con cabeceras limpias, paginación compacta, badges de estado semánticos (`active`, `pending`, `archived`) y acciones por fila en un menú desplegable (`MoreHorizontal`).
3. **Filtros:** Incluye barra de búsqueda rápida con debounce e inputs de filtro desplegables antes de la tabla.
4. **Empty & Loading States:** Si generas una vista, provee siempre su versión Skeleton o Empty State ilustrado.