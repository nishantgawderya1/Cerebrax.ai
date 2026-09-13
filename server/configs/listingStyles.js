// Scene styles for the Product Listing Studio (Phase 1: furniture).
// Each style provides prompts for the lifestyle scenes. Prompts avoid commas
// on purpose — commas are transformation separators in Cloudinary URLs, so the
// controller wraps each prompt in parentheses and keeps it comma-free.
export const listingStyles = {
  scandinavian: {
    label: 'Scandinavian',
    scenes: [
      'a bright minimalist Scandinavian living room with natural daylight and a light wooden floor',
      'a cozy Nordic interior corner with soft neutral tones beside a large window',
    ],
  },
  luxury: {
    label: 'Luxury',
    scenes: [
      'an elegant luxury living room with warm ambient lighting and marble accents',
      'a sophisticated upscale interior corner with designer decor and gentle shadows',
    ],
  },
  rustic: {
    label: 'Rustic',
    scenes: [
      'a cozy rustic interior with exposed wooden beams and warm ambient light',
      'a warm farmhouse style room with reclaimed wood and soft daylight',
    ],
  },
  minimal: {
    label: 'Minimal Studio',
    scenes: [
      'a clean minimal studio interior with a soft neutral background and gentle shadows',
      'a modern minimalist room with muted tones and diffused lighting',
    ],
  },
};
