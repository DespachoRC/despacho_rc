import { getAuthUser } from '@/core/db/get-user';
import { UserRepository } from '@/core/repositories/usuarios.repository';

// Errores tipados para que las rutas /api/superadmin/* respondan con el status correcto
export class SuperadminUnauthorizedError extends Error {}
export class SuperadminForbiddenError extends Error {}
export class SuperadminNotFoundError extends Error {}
export class SuperadminValidationError extends Error {}

// Solo el rol `owner` puede usar el panel superadmin.
// 401 si no hay sesion valida, 403 si hay sesion pero el rol no es owner.
export async function requireOwner(request: Request) {
  let user;
  try {
    user = await getAuthUser(request);
  } catch {
    throw new SuperadminUnauthorizedError('Sesión inválida o expirada');
  }

  let role: string;
  try {
    role = await UserRepository.getRoleName(user.id);
  } catch {
    throw new SuperadminForbiddenError('No autorizado');
  }

  if (role.toLowerCase() !== 'owner') {
    throw new SuperadminForbiddenError('No autorizado');
  }
  return user;
}
