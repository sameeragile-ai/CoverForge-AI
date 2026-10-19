export type GenreType = 'fantasy' | 'romance' | 'thriller' | 'scifi' | 'children' | 'mystery';

export type ArtStyle =
  | 'whimsical-3d-digital'
  | 'cinematic-photo'
  | 'epic-fantasy-oil'
  | 'digital-anime'
  | 'dark-noir-ink'
  | 'childrens-storybook-watercolor';

export interface CharacterSheetViews {
  frontView: string;
  sideView: string;
  threeQuarterView: string;
  expressionNeutral: string;
  expressionDetermined: string;
  expressionSmilingOrFierce: string;
}

export interface Character {
  id: string;
  name: string;
  tagline: string;
  age: string;
  genderOrArchetype: string;
  speciesOrEthnicity: string;
  hair: string;
  eyes: string;
  build: string;
  signatureClothing: string;
  distinguishingFeatures: string;
  personalityMood: string;
  artStyle: ArtStyle;
  lockedVisualPrompt: string;
  referenceImages: string[];
  characterSheet: CharacterSheetViews;
  createdAt: number;
}

export interface TypographyConfig {
  titleFont: string;
  subtitleFont: string;
  authorFont: string;
  titleColor: string;
  subtitleColor: string;
  authorColor: string;
  titleSize: number; // in percent or px
  subtitleSize: number;
  authorSize: number;
  titleTracking: number; // letter-spacing
  subtitleTracking: number;
  authorTracking: number;
  titleY: number; // 0-100 percentage from top
  subtitleY: number;
  authorY: number;
  titleCase: 'uppercase' | 'capitalize' | 'none';
  shadowColor: string;
  shadowBlur: number;
  strokeColor: string;
  strokeWidth: number;
  showSubtitle: boolean;
}

export interface ConsistencyReport {
  overallScore: number; // 0 - 100
  breakdown: {
    facialFidelity: number;
    featureDetails: number;
    clothingAccuracy: number;
    styleCohesion: number;
  };
  driftObservations: string[];
  verdict: 'Excellent Match' | 'Minor Drift' | 'Noticeable Drift' | 'Inconsistent';
  remedyPromptAdditions: string;
}

export interface BookCover {
  id: string;
  characterId: string;
  characterName: string;
  seriesId?: string;
  volumeNumber?: number;
  title: string;
  subtitle: string;
  authorName: string;
  genre: GenreType;
  scenePrompt: string;
  mood: string;
  lighting: string;
  pose: string;
  imageUrl: string;
  typography: TypographyConfig;
  consistencyReport: ConsistencyReport;
  createdAt: number;
}

export interface SeriesBookPlan {
  volume: number;
  title: string;
  subtitle: string;
  scene: string;
  setting: string;
  colorPalette: string;
  pose: string;
  coverId?: string;
  coverThumbnail?: string;
  consistencyScore?: number;
}

export interface SeriesPlan {
  id: string;
  characterId: string;
  characterName: string;
  seriesTitle: string;
  genre: GenreType;
  authorName: string;
  defaultTypography: TypographyConfig;
  books: SeriesBookPlan[];
  createdAt: number;
}
