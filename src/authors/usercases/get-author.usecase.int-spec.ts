import { Test, TestingModule } from '@nestjs/testing'

import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { AuthorsPrismaRepository } from '../repositories/authors.prisma.repository'
import { GetAuthorUsecase } from './get-author.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'

describe('GetAuthorUserCase Integration Tests', () => {
    let module: TestingModule
    let repository: AuthorsPrismaRepository
    let usecase: GetAuthorUsecase.Usecase
    const prisma = new PrismaClient()

    beforeAll(async () => {
        execSync('npm run prisma:migratetest')
        await prisma.$connect()
        module = await Test.createTestingModule({}).compile()
        repository = new AuthorsPrismaRepository(prisma as any)
        usecase = new GetAuthorUsecase.Usecase(repository)
    })

    beforeEach(async () => {
        await prisma.author.deleteMany()
    })

    afterAll(async () => {
        await module.close()
    })

    test('should throws error when id is not found', async () => {
        await expect(() =>
            usecase.execute({ id: 'xyz001' }),
        ).rejects.toBeInstanceOf(NotFoundError)
    })

    test('should be able to get author by id', async () => {
        const data = AuthorDataBuilder({})
        const author = await prisma.author.create({ data })
        const result = await usecase.execute({ id: author.id })

        expect(result).toStrictEqual(author)
    })
})
