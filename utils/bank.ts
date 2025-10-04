export const normalizeCBU = (s: string): string => {
  return (s || '').replace(/[^0-9]/g, '');
};

export const normalizeAlias = (s: string): string => {
  return (s || '').trim();
};

export const isValidCBU = (cbu: string): boolean => {
  const normalized = normalizeCBU(cbu);
  return normalized.length === 22;
};
