import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateRecipeCategoryDto{
    @ApiProperty({
        description: "tên danh mục món ăn",
        example: "Ăn sáng",
    })
    @IsString()
    @IsNotEmpty({message: 'Tên danh mục không được để trống'})
    name:string;

    @ApiProperty({
        description: "URL hình ảnh danh mục",
        example: "https://example.com/images/anSang.png",
        required:false,
    })
    @IsString()
    @IsOptional()
    imageUrl?:string;
}