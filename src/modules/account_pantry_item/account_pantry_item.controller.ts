import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Delete,
  Param,
} from '@nestjs/common';
import { AccountPantryItemService } from './account_pantry_item.service';
import { CreateAccountPantryItemDto } from './account_pantry_item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Pantry')
@ApiBearerAuth()
@Controller('pantry')
export class AccountPantryItemController {
  constructor(
    private readonly accountPantryItemService: AccountPantryItemService,
  ) {}

  @Post('add')
  @ApiOperation({ summary: 'Add ingredient to user pantry' })
  @ApiResponse({ status: 201, description: 'Ingredient added successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async addIngredientToPantry(
    @Request() req,
    @Body() createDto: CreateAccountPantryItemDto,
  ) {
    return await this.accountPantryItemService.addIngredientToPantry(
      req.user.id,
      createDto,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all ingredients in user pantry' })
  @ApiResponse({ status: 200, description: 'Return list of pantry items.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyPantryItems(@Request() req) {
    return await this.accountPantryItemService.getAccountPantryItems(
      req.user.id,
    );
  }

  @Delete(':ingredientId')
  @ApiOperation({ summary: 'Remove ingredient from user pantry' })
  @ApiResponse({ status: 200, description: 'Ingredient removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Ingredient not found in pantry.' })
  async removeIngredientFromPantry(
    @Request() req,
    @Param('ingredientId') ingredientId: string,
  ) {
    return await this.accountPantryItemService.removeIngredientFromPantry(
      req.user.id,
      ingredientId,
    );
  }

  @Delete('delete-all')
  @ApiOperation({ summary: 'Remove all ingredients from user pantry' })
  @ApiResponse({ status: 200, description: 'All ingredients removed successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async removeAllIngredientsFromPantry(@Request() req) {
    return await this.accountPantryItemService.removeAllIngredientsFromPantry(req.user.id);
  }
}
