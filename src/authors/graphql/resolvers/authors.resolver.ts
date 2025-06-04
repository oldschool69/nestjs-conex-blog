import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { Inject } from '@nestjs/common'
import { ListAuthorsUsecase } from '@/authors/usercases/list-authors.usecase'
import { SearchParamsArgs } from '../args/search-params.args'
import { SearchAuthorsResult } from '../models/search-authors-result'
import { CreateAuthorUsecase } from '@/authors/usercases/create-author.usecase'
import { CreateAuthorInput } from '../inputs/create-author.input'
import { GetAuthorUsecase } from '@/authors/usercases/get-author.usecase'
import { AuthorIdArgs } from '../args/author-id.args'
import { UpdateAuthorUsecase } from '@/authors/usercases/update-author.usecase'
import { UpdateAuthorInput } from '../inputs/update-author.input'

@Resolver(() => Author)
export class AuthorsResolver {
    @Inject(ListAuthorsUsecase.Usecase)
    private listAuthorsUseCase: ListAuthorsUsecase.Usecase

    @Inject(CreateAuthorUsecase.Usecase)
    private createAuthorUseCase: CreateAuthorUsecase.Usecase

    @Inject(GetAuthorUsecase.Usecase)
    private getAuthorUseCase: GetAuthorUsecase.Usecase

    @Inject(UpdateAuthorUsecase.Usecase)
    private updateAuthorUseCase: UpdateAuthorUsecase.Usecase

    @Query(() => SearchAuthorsResult)
    authors(
        @Args() { page, perPage, sort, sortDir, filter }: SearchParamsArgs,
    ) {
        return this.listAuthorsUseCase.execute({
            page,
            perPage,
            sort,
            sortDir,
            filter,
        })
    }

    @Query(() => Author)
    getAuthorById(@Args() { id }: AuthorIdArgs) {
        return this.getAuthorUseCase.execute({ id })
    }

    @Mutation(() => Author)
    async createAuthor(@Args('data') data: CreateAuthorInput) {
        return this.createAuthorUseCase.execute(data)
    }

    @Mutation(() => Author)
    async updateAuthor(
        @Args() { id }: AuthorIdArgs,
        @Args('data') data: UpdateAuthorInput,
    ) {
        return this.updateAuthorUseCase.execute({ id, ...data })
    }
}
