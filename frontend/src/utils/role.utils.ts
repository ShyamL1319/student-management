/* eslint-disable @typescript-eslint/no-explicit-any */
export const hasRole = (user: any, roleName: string): boolean => {
  if (!user) return false;

  const names = new Set<string>();

  if (user.roles && Array.isArray(user.roles)) {
    user.roles.forEach((r: any) => {
      if (typeof r === 'string') names.add(r);
      else if (r && typeof r.name === 'string') names.add(r.name);
    });
  }

  if (user.role) {
    if (typeof user.role === 'string') names.add(user.role);
    else if (user.role.name) names.add(user.role.name);
  }

  if (user.roleType) {
    names.add(user.roleType);
  }

  if (names.has('SUPER_ADMIN')) return true;

  return names.has(roleName);
};

export const hasAnyRole = (user: any, roleNames: string[]): boolean => {
  if (!user) return false;
  return roleNames.some(roleName => hasRole(user, roleName));
};

export const hasAllRoles = (user: any, roleNames: string[]): boolean => {
  if (!user) return false;
  return roleNames.every(roleName => hasRole(user, roleName));
};
