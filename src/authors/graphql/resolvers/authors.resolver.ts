import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { Inject } from '@nestjs/common'
import { ListAuthorsUsecase } from '@/authors/usercases/list-authors.usecase'
import { SearchParamsArgs } from '../args/search-params.args'
import { SearchAuthorsResult } from '../models/search-authors-result'
import { CreateAuthorUsecase } from '@/authors/usercases/create-author.usecase'
import { CreateAuthorInput } from '../inputs/create-author.input'

@Resolver(() => Author)
export class AuthorsResolver {
    @Inject(ListAuthorsUsecase.Usecase)
    private listAuthorsUseCase: ListAuthorsUsecase.Usecase

    @Inject(CreateAuthorUsecase.Usecase)
    private createAuthorUseCase: CreateAuthorUsecase.Usecase

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

    @Mutation(() => Author)
    createAuthor(@Args('data') data: CreateAuthorInput) {
        return this.createAuthorUseCase.execute(data)
    }
}
