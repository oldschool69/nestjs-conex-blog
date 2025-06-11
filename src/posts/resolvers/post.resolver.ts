import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { Post } from '../graphql/models/post'
import { CreatePostUseCase } from '../usecases/create-post.usecase'
import { Inject } from '@nestjs/common'
import { CreatePostInput } from '../graphql/inputs/create-post.input'

@Resolver(() => Post)
export class PostsResovler {
    @Inject(CreatePostUseCase.UseCase)
    private createPostUseCase: CreatePostUseCase.UseCase

    @Mutation(() => Post)
    createPost(@Args('data') data: CreatePostInput) {
        return this.createPostUseCase.execute(data as CreatePostUseCase.Input)
    }
}
