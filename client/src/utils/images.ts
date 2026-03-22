import { buildApiUrl } from "./api";

export function resolveImageUrl(imageUrl: string | null | undefined) {
      if (!imageUrl) {
            return null
      }

      if (/^https?:\/\//i.test(imageUrl)) {
            return imageUrl
      }

      return buildApiUrl(imageUrl);
}