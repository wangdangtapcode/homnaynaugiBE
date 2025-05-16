import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Recipe } from '../recipe/entities/recipe.entities';
import { Account } from '../account/entities/account.entities';
import { ViewHistory } from '../view_history/entities/view_history.entities';
import { RecipeLike } from '../recipe_like/entities/recipe_like.entities';
import { FavoriteRecipe } from '../favorite_recipe/entities/favorite_recipe.entities';
import { OverviewStatisticDto, TimelineStatisticDto, TimeRange, StatisticType, TimelineDataPointDto, SortBy, TopRecipeDto, TopRecipesResponseDto } from './statistic.dto';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
    @InjectRepository(RecipeLike)
    private recipeLikeRepository: Repository<RecipeLike>,
    @InjectRepository(FavoriteRecipe)
    private favoriteRecipeRepository: Repository<FavoriteRecipe>,
  ) {}

  async getOverviewStatistics(): Promise<OverviewStatisticDto> {
    // Lấy tổng số công thức
    const totalRecipes = await this.recipeRepository.count();
    
    // Lấy tổng số người dùng
    const totalUsers = await this.accountRepository.count();
    
    // Lấy tổng lượt xem
    const totalViews = await this.viewHistoryRepository.count();
    
    // Lấy tổng lượt thích
    const totalLikes = await this.recipeLikeRepository.count();

    return {
      totalRecipes,
      totalUsers,
      totalViews,
      totalLikes,
    };
  }

  async getTimelineStatistics(
    type: StatisticType,
    range: TimeRange,
  ): Promise<TimelineStatisticDto> {
    // Lấy ngày hiện tại
    const endDate = new Date();
    let startDate = new Date();
    let format: string;
    let labels: string[];

    // Thiết lập khoảng thời gian dựa vào range
    switch (range) {
      case TimeRange.WEEK:
        // 7 ngày gần nhất
        startDate.setDate(endDate.getDate() - 6);
        format = 'DD'; // Format: ngày (01-31)
        labels = this.generateDailyLabels(startDate, endDate);
        break;
      case TimeRange.MONTH:
        // 30 ngày gần nhất
        startDate.setDate(endDate.getDate() - 29);
        format = 'DD/MM'; // Format: ngày/tháng
        labels = this.generateDailyLabels(startDate, endDate);
        break;
      case TimeRange.YEAR:
        // 12 tháng gần nhất
        startDate.setMonth(endDate.getMonth() - 11);
        startDate.setDate(1); // Ngày đầu tiên của tháng
        format = 'MM/YY'; // Format: tháng/năm
        labels = this.generateMonthlyLabels(startDate, endDate);
        break;
      default:
        throw new Error('Invalid time range');
    }

    // Khởi tạo dữ liệu với giá trị 0
    const dataPoints: TimelineDataPointDto[] = labels.map(label => ({
      label,
      value: 0,
    }));

    // Lấy dữ liệu từ database dựa vào type
    let results: any[] = [];
    switch (type) {
      case StatisticType.VIEWS:
        // Nếu là biểu đồ theo tháng (YEAR)
        if (range === TimeRange.YEAR) {
          results = await this.getMonthlyViewStats(startDate, endDate);
        } else {
          // Nếu là biểu đồ theo ngày (WEEK, MONTH)
          results = await this.getDailyViewStats(startDate, endDate);
        }
        break;
      case StatisticType.LIKES:
        // Tương tự như views, triển khai nếu cần
        if (range === TimeRange.YEAR) {
          results = await this.getMonthlyLikeStats(startDate, endDate);
        } else {
          results = await this.getDailyLikeStats(startDate, endDate);
        }
        break;
      default:
        throw new Error('Invalid statistic type');
    }

    // Cập nhật giá trị cho dataPoints
    for (const result of results) {
      let labelIndex: number;
      if (range === TimeRange.YEAR) {
        // Cho dữ liệu theo tháng
        const month = result.month - 1; // Database trả về tháng bắt đầu từ 1, JS từ 0
        const year = result.year;
        const monthStr = String(month + 1).padStart(2, '0');
        const yearStr = String(year).slice(-2);
        labelIndex = dataPoints.findIndex(dp => dp.label === `${monthStr}/${yearStr}`);
      } else {
        // Cho dữ liệu theo ngày
        const date = new Date(result.date);
        let label: string;
        if (range === TimeRange.WEEK) {
          label = String(date.getDate()).padStart(2, '0');
        } else {
          // MONTH
          label = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        labelIndex = dataPoints.findIndex(dp => dp.label === label);
      }
      
      if (labelIndex !== -1) {
        dataPoints[labelIndex].value = result.count;
      }
    }

    return { data: dataPoints };
  }

  async getTopRecipes(
    limit: number = 5,
    sortBy: SortBy = SortBy.VIEWS,
    timeRange: TimeRange = TimeRange.WEEK
  ): Promise<TopRecipesResponseDto> {
    // Thiết lập khoảng thời gian
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case TimeRange.WEEK:
        startDate.setDate(endDate.getDate() - 7); // 7 ngày trước
        break;
      case TimeRange.MONTH:
        startDate.setDate(endDate.getDate() - 30); // 30 ngày trước
        break;
      case TimeRange.YEAR:
        startDate.setDate(endDate.getDate() - 365); // 365 ngày trước
        break;
      default:
        startDate.setDate(endDate.getDate() - 7); // Mặc định 7 ngày
    }

    let recipes: TopRecipeDto[] = [];
    let recipeIds: string[] = [];
    let primaryCountData: any[] = [];

    // Lấy danh sách món ăn dựa trên tiêu chí sắp xếp
    switch (sortBy) {
      case SortBy.VIEWS:
        // Lấy món ăn có nhiều lượt xem nhất
        const viewCounts = await this.viewHistoryRepository
          .createQueryBuilder('view')
          .select('view.recipeId', 'recipeId')
          .addSelect('COUNT(view.id)', 'count')
          .where('view.viewedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('view.recipeId')
          .orderBy('count', 'DESC')
          .limit(limit)
          .getRawMany();

        recipeIds = viewCounts.map(view => view.recipeId);
        primaryCountData = viewCounts.map(item => ({
          recipeId: item.recipeId,
          viewCount: parseInt(item.count)
        }));
        break;

      case SortBy.LIKES:
        // Lấy món ăn có nhiều lượt thích nhất
        const likeCounts = await this.recipeLikeRepository
          .createQueryBuilder('like')
          .select('like.recipeId', 'recipeId')
          .addSelect('COUNT(like.recipeId)', 'count')
          .where('like.likedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('like.recipeId')
          .orderBy('count', 'DESC')
          .limit(limit)
          .getRawMany();

        recipeIds = likeCounts.map(like => like.recipeId);
        primaryCountData = likeCounts.map(item => ({
          recipeId: item.recipeId,
          likeCount: parseInt(item.count)
        }));
        break;

      case SortBy.FAVORITES:
        // Lấy món ăn có nhiều lượt thêm vào yêu thích nhất
        const favoriteCounts = await this.favoriteRecipeRepository
          .createQueryBuilder('favorite')
          .select('favorite.recipeId', 'recipeId')
          .addSelect('COUNT(favorite.recipeId)', 'count')
          .where('favorite.savedAt BETWEEN :startDate AND :endDate', { startDate, endDate })
          .groupBy('favorite.recipeId')
          .orderBy('count', 'DESC')
          .limit(limit)
          .getRawMany();

        recipeIds = favoriteCounts.map(favorite => favorite.recipeId);
        primaryCountData = favoriteCounts.map(item => ({
          recipeId: item.recipeId,
          favoriteCount: parseInt(item.count)
        }));
        break;

      default:
        throw new Error('Invalid sort criteria');
    }

    if (recipeIds.length > 0) {
      // Lấy thông tin chi tiết về các món ăn
      const recipesData = await this.recipeRepository
        .createQueryBuilder('recipe')
        .leftJoinAndSelect('recipe.account', 'account')
        .leftJoinAndSelect('account.userProfile', 'userProfile')
        .where('recipe.id IN (:...recipeIds)', { recipeIds })
        .getMany();

      // Lấy số lượt view nếu chưa có
      const viewCounts = sortBy !== SortBy.VIEWS
        ? await this.viewHistoryRepository
            .createQueryBuilder('view')
            .select('view.recipeId', 'recipeId')
            .addSelect('COUNT(view.id)', 'viewCount')
            .where('view.recipeId IN (:...recipeIds)', { recipeIds })
            .groupBy('view.recipeId')
            .getRawMany()
        : [];

      // Lấy số lượt like nếu chưa có
      const likeCounts = sortBy !== SortBy.LIKES
        ? await this.recipeLikeRepository
            .createQueryBuilder('like')
            .select('like.recipeId', 'recipeId')
            .addSelect('COUNT(like.recipeId)', 'likeCount')
            .where('like.recipeId IN (:...recipeIds)', { recipeIds })
            .groupBy('like.recipeId')
            .getRawMany()
        : [];

      // Lấy số lượt favorite nếu chưa có
      const favoriteCounts = sortBy !== SortBy.FAVORITES
        ? await this.favoriteRecipeRepository
            .createQueryBuilder('favorite')
            .select('favorite.recipeId', 'recipeId')
            .addSelect('COUNT(favorite.recipeId)', 'favoriteCount')
            .where('favorite.recipeId IN (:...recipeIds)', { recipeIds })
            .groupBy('favorite.recipeId')
            .getRawMany()
        : [];
      
      // Map dữ liệu từ các truy vấn thành kết quả cuối cùng
      recipes = recipesData.map(recipe => {
        const primaryData = primaryCountData.find(item => item.recipeId === recipe.id);
        const viewData = sortBy === SortBy.VIEWS 
          ? primaryData 
          : viewCounts.find(view => view.recipeId === recipe.id);
        const likeData = sortBy === SortBy.LIKES 
          ? primaryData 
          : likeCounts.find(like => like.recipeId === recipe.id);
        const favoriteData = sortBy === SortBy.FAVORITES 
          ? primaryData 
          : favoriteCounts.find(favorite => favorite.recipeId === recipe.id);
        
        return {
          id: recipe.id,
          name: recipe.name,
          imageUrl: recipe.imageUrl,
          viewCount: sortBy === SortBy.VIEWS 
            ? primaryData.viewCount 
            : (viewData ? parseInt(viewData.viewCount) : 0),
          likeCount: sortBy === SortBy.LIKES 
            ? primaryData.likeCount 
            : (likeData ? parseInt(likeData.likeCount) : 0),
          favoriteCount: sortBy === SortBy.FAVORITES 
            ? primaryData.favoriteCount 
            : (favoriteData ? parseInt(favoriteData.favoriteCount) : 0),
          authorName: recipe.account?.userProfile?.fullName || 'Ẩn danh',
          authorAvatar: recipe.account?.userProfile?.avatarUrl,
        };
      });

      // Sắp xếp lại theo tiêu chí
      recipes.sort((a, b) => {
        if (sortBy === SortBy.VIEWS) {
          return b.viewCount - a.viewCount;
        } else if (sortBy === SortBy.LIKES) {
          return b.likeCount - a.likeCount;
        } else {
          return b.favoriteCount - a.favoriteCount;
        }
      });
    }

    return { data: recipes };
  }

  // Helper method để tạo labels cho biểu đồ theo ngày
  private generateDailyLabels(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];
    const currentDate = new Date(startDate);
    
    // Kiểm tra xem range có phải là week hay không
    const isWeekRange = endDate.getTime() - startDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
    
    while (currentDate <= endDate) {
      if (isWeekRange) {
        // Nếu là week, chỉ hiển thị ngày
        labels.push(String(currentDate.getDate()).padStart(2, '0'));
      } else {
        // Nếu là month, hiển thị ngày/tháng
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        labels.push(`${day}/${month}`);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return labels;
  }

  // Helper method để tạo labels cho biểu đồ theo tháng
  private generateMonthlyLabels(startDate: Date, endDate: Date): string[] {
    const labels: string[] = [];
    const currentDate = new Date(startDate);
    
    while (
      currentDate.getFullYear() < endDate.getFullYear() || 
      (currentDate.getFullYear() === endDate.getFullYear() && 
       currentDate.getMonth() <= endDate.getMonth())
    ) {
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = String(currentDate.getFullYear()).slice(-2);
      labels.push(`${month}/${year}`);
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return labels;
  }

  // Lấy thống kê lượt xem theo ngày
  private async getDailyViewStats(startDate: Date, endDate: Date): Promise<any[]> {
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const results = await this.viewHistoryRepository
      .createQueryBuilder('view')
      .select("DATE(view.viewedAt)", "date")
      .addSelect("COUNT(view.id)", "count")
      .where("view.viewedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate: nextDay,
      })
      .groupBy("DATE(view.viewedAt)")
      .getRawMany();
    
    return results;
  }

  // Lấy thống kê lượt xem theo tháng
  private async getMonthlyViewStats(startDate: Date, endDate: Date): Promise<any[]> {
    const nextMonth = new Date(endDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const results = await this.viewHistoryRepository
      .createQueryBuilder('view')
      .select("MONTH(view.viewedAt)", "month")
      .addSelect("YEAR(view.viewedAt)", "year")
      .addSelect("COUNT(view.id)", "count")
      .where("view.viewedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate: nextMonth,
      })
      .groupBy("MONTH(view.viewedAt)")
      .addGroupBy("YEAR(view.viewedAt)")
      .getRawMany();
    
    return results;
  }

  // Lấy thống kê lượt thích theo ngày
  private async getDailyLikeStats(startDate: Date, endDate: Date): Promise<any[]> {
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const results = await this.recipeLikeRepository
      .createQueryBuilder('like')
      .select("DATE(like.likedAt)", "date")
      .addSelect("COUNT(like.recipeId)", "count")
      .where("like.likedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate: nextDay,
      })
      .groupBy("DATE(like.likedAt)")
      .getRawMany();
    
    return results;
  }

  // Lấy thống kê lượt thích theo tháng
  private async getMonthlyLikeStats(startDate: Date, endDate: Date): Promise<any[]> {
    const nextMonth = new Date(endDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    const results = await this.recipeLikeRepository
      .createQueryBuilder('like')
      .select("MONTH(like.likedAt)", "month")
      .addSelect("YEAR(like.likedAt)", "year")
      .addSelect("COUNT(like.recipeId)", "count")
      .where("like.likedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate: nextMonth,
      })
      .groupBy("MONTH(like.likedAt)")
      .addGroupBy("YEAR(like.likedAt)")
      .getRawMany();
    
    return results;
  }
}
