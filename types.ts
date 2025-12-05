export type ThemeColor = 'emerald' | 'sapphire' | 'ruby' | 'obsidian';

export interface TreeConfig {
  theme: ThemeColor;
  rotationSpeed: number;
  lightsOn: boolean;
  showParticles: boolean;
  isAssembled: boolean; // Controls the morph state (Scatter vs Tree)
}

export const THEME_COLORS: Record<ThemeColor, { body: string; ornament: string; glow: string }> = {
  emerald: {
    body: '#022c22', // Deepest Jungle Green
    ornament: '#FFD700', // Gold
    glow: '#10b981'
  },
  sapphire: {
    body: '#0f172a', // Midnight Blue
    ornament: '#e2e8f0', // Silver/Platinum
    glow: '#3b82f6'
  },
  ruby: {
    body: '#450a0a', // Dark Red
    ornament: '#fbbf24', // Gold
    glow: '#ef4444'
  },
  obsidian: {
    body: '#000000', // Pure Black
    ornament: '#FCD34D', // Bright Gold
    glow: '#ffffff'
  }
};
