import {
    Args,
    Mutation,
    Parent,
    Query,
    ResolveField,
    Resolver,
} from '@nestjs/graphql'
import { Post } from '../graphql/models/post'
import { CreatePostUseCase } from '../usecases/create-post.usecase'
import { Inject } from '@nestjs/common'
import { CreatePostInput } from '../graphql/inputs/create-post.input'
import { GetAuthorUsecase } from '@/authors/usercases/get-author.usecase'
import { GetPostUseCase } from '../usecases/get-post.usecase'
import { PostIdArgs } from '../graphql/args/post-id.args'
import { PublishPostUseCase } from '../usecases/publish-post.usecase'
import { UnpublishPostUseCase } from '../usecases/unpublish-post.usecase'

@Resolver(() => Post)
export class PostsResovler {
    @Inject(CreatePostUseCase.UseCase)
    private createPostUseCase: CreatePostUseCase.UseCase

    @Inject(GetAuthorUsecase.Usecase)
    private getAurhorUseCase: GetAuthorUsecase.Usecase

    @Inject(GetPostUseCase.UseCase)
    private getPostUseCase: GetPostUseCase.UseCase

    @Inject(PublishPostUseCase.UseCase)
    private publishPostUseCase: PublishPostUseCase.UseCase

    @Inject(UnpublishPostUseCase.UseCase)
    private unpublishPostUseCase: UnpublishPostUseCase.UseCase

    @Query(() => Post)
    getPostById(@Args() { id }: PostIdArgs) {
        return this.getPostUseCase.execute({ id })
    }

    @Mutation(() => Post)
    createPost(@Args('data') data: CreatePostInput) {
        return this.createPostUseCase.execute(data as CreatePostUseCase.Input)
    }

    @Mutation(() => Post)
    publishPost(@Args() { id }: PostIdArgs) {
        return this.publishPostUseCase.execute({ id })
    }

    @Mutation(() => Post)
    unpublishPost(@Args() { id }: PostIdArgs) {
        return this.unpublishPostUseCase.execute({ id })
    }

    @ResolveField()
    author(@Parent() post: Post) {
        return this.getAurhorUseCase.execute({ id: post.authorId })
    }
}
