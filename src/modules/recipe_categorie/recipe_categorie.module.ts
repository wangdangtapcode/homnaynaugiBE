import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecipeCategory } from "./entities/recipe_categorie.entities";
import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";
import { RecipeCategoryController } from "./recipe_categorie.controller";
import { RecipeCategoryService } from "./recipe_categorie.service";
import { AdminRecipeCategoryController } from "./admin_recipe_categorie.controller";
import { Account } from "../account/entities/account.entities";
import { AuthModule } from "../auth/auth.module";




@Module({
    imports: [
        TypeOrmModule.forFeature([RecipeCategory, Account]),
        CloudinaryModule,
        AuthModule
    ],
    controllers: [RecipeCategoryController, AdminRecipeCategoryController],
    providers: [RecipeCategoryService],
    exports: [RecipeCategoryService],
})
export class RecipeCategoryModule{}