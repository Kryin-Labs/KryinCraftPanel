export const uploadChunkBytes = 2 * 1024 * 1024;
export const maxUploadBytes = 64 * 1024 * 1024;
export const maxTextFileBytes = 1024 * 1024;

export function validFileName(name: unknown): name is string {
  return typeof name === 'string' && name.length > 0 && name !== '.' && name !== '..' &&
    !name.startsWith('.kryin-upload-') &&
    !/[\\/\x00-\x1f\x7f]/.test(name) && new TextEncoder().encode(name).length <= 255;
}

export function validFilePath(path: unknown): path is string {
  return typeof path === 'string' && (path === '/' ||
    (path.startsWith('/') && path.slice(1).split('/').every(validFileName)));
}
