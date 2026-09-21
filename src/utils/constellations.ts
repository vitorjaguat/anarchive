import type { Token } from '../../types/tokens';

export const CONSTELLATIONS = [
  'The Sphere',
  'Esfera do Sul',
  'uint studio',
  'Cordata F.O.R.',
];

// Strips punctuation/diacritics-adjacent signals so 'Cordata F.O.R.' also
// matches a token whose From/To is 'Cordata For' (no dots), and generally
// makes matching resilient to how each token's From/To was typed.
const normalizeName = (value?: string): string =>
  value
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim() ?? '';

export const tokenMatchesConstellations = (
  token: Token,
  constellationsArr: string[],
): boolean => {
  if (!constellationsArr?.length) return true;

  const from = token.token.attributes?.find((att) => att.key === 'From')
    ?.value;
  const to = token.token.attributes?.find((att) => att.key === 'To')?.value;
  const normalizedFrom = normalizeName(from);
  const normalizedTo = normalizeName(to);

  return constellationsArr.some((constellation) => {
    const normalizedConstellation = normalizeName(constellation);
    return (
      normalizedFrom === normalizedConstellation ||
      normalizedTo === normalizedConstellation
    );
  });
};
