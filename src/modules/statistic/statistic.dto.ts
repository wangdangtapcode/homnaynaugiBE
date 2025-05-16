export class OverviewStatisticDto {
  totalRecipes: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
}

export class TimelineDataPointDto {
  label: string;
  value: number;
}

export class TimelineStatisticDto {
  data: TimelineDataPointDto[];
}

export enum TimeRange {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum StatisticType {
  VIEWS = 'views',
  LIKES = 'likes',
}

export enum SortBy {
  VIEWS = 'views',
  LIKES = 'likes',
  FAVORITES = 'favorites',
}

export class TopRecipeDto {
  id: string;
  name: string;
  imageUrl: string | null;
  likeCount: number;
  viewCount: number;
  favoriteCount: number;
  authorName?: string;
  authorAvatar?: string | null;
}

export class TopRecipesResponseDto {
  data: TopRecipeDto[];
}
