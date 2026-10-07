import { MOOD_LIST } from '../data/moods';

export interface GuardResult {
  isValid: boolean;
  warnings: string[];
}

export function validateOutfit(outfitId: string, currentColors: Record<string, string>, currentMood: string | null): GuardResult {
  const warnings: string[] = [];

  // Rule 1: Ngu Sac logic (Neon colors are historically inaccurate for most traditional contexts unless Modern mood is set)
  // Simplified color parsing. If it's pure RGB neon like #00FF00, it's a warning for non-modern moods.
  const isModern = currentMood ? MOOD_LIST.find(m => m.id === currentMood)?.isModern : false;

  if (!isModern) {
    const neonRegex = /^(#FF00FF|#00FF00|#00FFFF)$/i;
    Object.values(currentColors).forEach(color => {
      if (neonRegex.test(color)) {
        warnings.push('Màu sắc quá rực rỡ (neon) không phù hợp với chuẩn màu tự nhiên thời phong kiến. Cân nhắc chuyển sang nhóm màu "Tôn Màu Phá Cách".');
      }
    });
  }

  // Rule 2: Outfit-specific logic. Example: "ao-tac" usually shouldn't use pure black for the main robe unless it's for specific mourning contexts.
  if (outfitId === 'ao-tac' && currentColors['layer-robe'] === '#000000') {
    warnings.push('Áo Tấc màu đen tuyền thường chỉ dùng trong các nghi thức trang trọng hoặc tang lễ. Hãy lưu ý khi sử dụng.');
  }

  // Deduplicate warnings
  const uniqueWarnings = Array.from(new Set(warnings));

  return {
    isValid: uniqueWarnings.length === 0,
    warnings: uniqueWarnings,
  };
}
