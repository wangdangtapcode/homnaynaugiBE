import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecipeCategory } from "./entities/recipe_categorie.entities";
import { CloudinaryModule } from "src/config/cloudinary/cloudinary.module";
import { RecipeCategoryController } from "./recipe_categorie.controller";
import { RecipeCategoryService } from "./recipe_categorie.service";




@Module({
    imports: [
        TypeOrmModule.forFeature([RecipeCategory]),
        CloudinaryModule,
    ],
    controllers: [RecipeCategoryController],
    providers: [RecipeCategoryService],
    exports: [RecipeCategoryService],
})
export class RecipeCategoryModule{}