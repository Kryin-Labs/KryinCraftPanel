export const permissionGroups = [
  { title: 'Server control', options: [['start', 'Start server'], ['stop_restart', 'Stop and restart'], ['console', 'Run console commands and player actions']] },
  { title: 'Monitoring', options: [['logs', 'View logs'], ['players', 'View players']] },
  { title: 'Configuration', options: [['settings', 'Edit server settings'], ['files', 'Manage server files']] },
] as const;

export type ServerPermission = typeof permissionGroups[number]['options'][number][0];
export const allServerPermissions = permissionGroups.flatMap(({ options }) => options.map(([permission]) => permission));

export function rolePermissions(role: string): ServerPermission[] {
  if (role === 'owner' || role === 'admin') return allServerPermissions;
  return role === 'operator' ? ['start', 'stop_restart', 'logs', 'players'] : ['logs', 'players'];
}

export function canVisitDashboardPage(pathname: string, permissions: readonly ServerPermission[], owner: boolean) {
  const section = pathname.split('/')[2];
  switch (section) {
    case 'console': return permissions.includes('console') || permissions.includes('logs');
    case 'logs': return permissions.includes('logs');
    case 'players': return permissions.includes('players');
    case 'control': return permissions.includes('start') || permissions.includes('stop_restart');
    case 'files': return permissions.includes('files');
    case 'settings': return permissions.includes('settings');
    case 'connections': return owner;
    default: return true;
  }
}
