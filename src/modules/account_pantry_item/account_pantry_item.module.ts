import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountPantryItem } from './entities/account_pantry_item.entities';
import { AccountPantryItemService } from './account_pantry_item.service';
import { AccountPantryItemController } from './account_pantry_item.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountPantryItem])],
  controllers: [AccountPantryItemController],
  providers: [AccountPantryItemService],
  exports: [AccountPantryItemService],
})
export class AccountPantryItemModule {}
