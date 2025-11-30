export const basePath = process.env.NODE_ENV === "production" ? "/big5-player-comp" : ""

export function getAssetPath(path: string): string {
  return `${basePath}${path}`
}
