export const shirtPlaceholder = "/shirt-placeholder.svg";

export function productImage(pictureUrl?: string, imageUrls: string[] = []) {
  return pictureUrl || imageUrls.find(Boolean) || shirtPlaceholder;
}

export function useImageFallback(element: HTMLImageElement) {
  if (!element.src.endsWith(shirtPlaceholder)) {
    element.src = shirtPlaceholder;
  }
}
