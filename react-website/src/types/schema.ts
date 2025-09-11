// Type definitions copied from server schema to avoid cross-directory imports
export interface MovieLink {
  id: number;
  movieName: string;
  originalLink: string;
  shortId: string;
  views: number;
  dateAdded: Date;
  adsEnabled: boolean;
}

export interface InsertMovieLink {
  movieName: string;
  originalLink: string;
  shortId: string;
  adsEnabled: boolean;
}

export interface ApiToken {
  id: number;
  tokenName: string;
  tokenValue: string;
  tokenType: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface InsertApiToken {
  tokenName: string;
  tokenValue: string;
  tokenType: string;
  isActive: boolean;
}

export interface QualityMovieLink {
  id: number;
  movieName: string;
  shortId: string;
  quality480p?: string;
  quality720p?: string;
  quality1080p?: string;
  views: number;
  dateAdded: Date;
  adsEnabled: boolean;
}

export interface InsertQualityMovieLink {
  movieName: string;
  shortId: string;
  quality480p?: string;
  quality720p?: string;
  quality1080p?: string;
  adsEnabled: boolean;
}

export interface QualityEpisode {
  id: number;
  seriesName: string;
  shortId: string;
  startFromEpisode: number;
  episodes: Array<{
    episodeNumber: number;
    quality480p?: string;
    quality720p?: string;
    quality1080p?: string;
  }>;
  totalEpisodes: number;
  views: number;
  dateAdded: Date;
  adsEnabled: boolean;
}

export interface InsertQualityEpisode {
  seriesName: string;
  shortId: string;
  startFromEpisode: number;
  episodes: Array<{
    episodeNumber: number;
    quality480p?: string;
    quality720p?: string;
    quality1080p?: string;
  }>;
  totalEpisodes: number;
  adsEnabled: boolean;
}

export interface QualityZip {
  id: number;
  zipName: string;
  shortId: string;
  quality480p?: string;
  quality720p?: string;
  quality1080p?: string;
  views: number;
  dateAdded: Date;
  adsEnabled: boolean;
}

export interface InsertQualityZip {
  zipName: string;
  shortId: string;
  quality480p?: string;
  quality720p?: string;
  quality1080p?: string;
  adsEnabled: boolean;
}