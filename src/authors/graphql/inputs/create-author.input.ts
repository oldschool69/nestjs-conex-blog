import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, isNotEmpty, IsString } from 'class-validator'

@InputType()
export class CreateAuthorInput {
    @IsString()
    @IsNotEmpty()
    @Field()
    name: string

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    @Field()
    email: string
}
