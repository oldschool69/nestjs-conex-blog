import { Module } from '@nestjs/common'
import { AuthorsResolver } from './graphql/resolvers/authors.resolver'
import { DatabaseModule } from '@/database/database.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { AuthorsPrismaRepository } from './repositories/authors.prisma.repository'
import { ListAuthorsUsecase } from './usercases/list-authors.usecase'
import { GetAuthorUsecase } from './usercases/get-author.usecase'
import { CreateAuthorUsecase } from './usercases/create-author.usecase'
import { UpdateAuthorUsecase } from './usercases/update-author.usecase'
import { DeleteAuthorUsecase } from './usercases/delete-author.usecase'

@Module({
    imports: [DatabaseModule],
    providers: [
        AuthorsResolver,
        {
            provide: 'PrismaService',
            useClass: PrismaService,
        },
        {
            provide: 'AuthorsRepository',
            useFactory: (prisma: PrismaService) => {
                return new AuthorsPrismaRepository(prisma)
            },
            inject: ['PrismaService'],
        },
        {
            provide: ListAuthorsUsecase.Usecase,
            useFactory: (authorsRepository: AuthorsPrismaRepository) => {
                return new ListAuthorsUsecase.Usecase(authorsRepository)
            },
            inject: ['AuthorsRepository'],
        },
        {
            provide: GetAuthorUsecase.Usecase,
            useFactory: (authorsRepository: AuthorsPrismaRepository) => {
                return new GetAuthorUsecase.Usecase(authorsRepository)
            },
            inject: ['AuthorsRepository'],
        },
        {
            provide: CreateAuthorUsecase.Usecase,
            useFactory: (authorsRepository: AuthorsPrismaRepository) => {
                return new CreateAuthorUsecase.Usecase(authorsRepository)
            },
            inject: ['AuthorsRepository'],
        },
        {
            provide: UpdateAuthorUsecase.Usecase,
            useFactory: (authorsRepository: AuthorsPrismaRepository) => {
                return new UpdateAuthorUsecase.Usecase(authorsRepository)
            },
            inject: ['AuthorsRepository'],
        },
        {
            provide: DeleteAuthorUsecase.Usecase,
            useFactory: (authorsRepository: AuthorsPrismaRepository) => {
                return new DeleteAuthorUsecase.Usecase(authorsRepository)
            },
            inject: ['AuthorsRepository'],
        },
    ],
})
export class AuthorsModule {}
