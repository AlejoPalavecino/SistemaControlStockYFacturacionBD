export type StorageSchemaVersion = 'v1';

export interface PersistOptions<T> {
  key: string;
  version: StorageSchemaVersion;
  migrate?: (oldData: unknown) => T; // TODO: Implement migration logic if schema changes
}

/**
 * Triggers a browser download for a given Blob.
 * @param blob - The Blob object to download.
 * @param filename - The desired name for the downloaded file.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
