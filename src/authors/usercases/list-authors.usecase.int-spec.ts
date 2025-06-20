import { Test, TestingModule } from '@nestjs/testing'

import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { AuthorsPrismaRepository } from '../repositories/authors.prisma.repository'
import { ListAuthorsUsecase } from './list-authors.usecase'
import { AuthorDataBuilder } from '../helpers/author-data-builder'

describe('ListAurhorsUserCase Integration Tests', () => {
    let module: TestingModule
    let repository: AuthorsPrismaRepository
    let usecase: ListAuthorsUsecase.Usecase
    const prisma = new PrismaClient()

    beforeAll(async () => {
        execSync('npm run prisma:migratetest')
        await prisma.$connect()
        module = await Test.createTestingModule({}).compile()
        repository = new AuthorsPrismaRepository(prisma as any)
        usecase = new ListAuthorsUsecase.Usecase(repository)
    })

    beforeEach(async () => {
        await prisma.author.deleteMany()
    })

    afterAll(async () => {
        await module.close()
    })

    test('should only apply pagination when the params are null', async () => {
        const createdAt = new Date()
        const data = []
        const arrange = Array(3).fill(AuthorDataBuilder({}))

        arrange.forEach((element, index) => {
            const timestamp = createdAt.getTime() + index
            data.push({
                ...element,
                email: `a${index}@gmail.com`,
                createdAt: new Date(timestamp),
            })
        })

        await prisma.author.createMany({ data })

        const result = await usecase.execute({})

        expect(result).toMatchObject({
            items: data.reverse(),
            total: 3,
            currentPage: 1,
            perPage: 15,
            lastPage: 1,
        })
    })

    test('should apply pagination, filter and ordering', async () => {
        const createdAt = new Date()
        const data = []
        const arrange = ['test', 'a', 'TEST', 'b', 'Test']

        arrange.forEach((element, index) => {
            const timestamp = createdAt.getTime() + index
            data.push({
                ...AuthorDataBuilder({ name: element }),
                email: `author${index}@gmail.com`,
                createdAt: new Date(timestamp),
            })
        })

        await prisma.author.createMany({ data })

        const result1 = await usecase.execute({
            page: 1,
            perPage: 2,
            sort: 'name',
            sortDir: 'asc',
            filter: 'TEST',
        })

        expect(result1).toMatchObject({
            items: [data[0], data[4]],
            total: 3,
            currentPage: 1,
            perPage: 2,
            lastPage: 2,
        })

        const result2 = await usecase.execute({
            page: 2,
            perPage: 2,
            sort: 'name',
            sortDir: 'asc',
            filter: 'TEST',
        })

        expect(result2).toMatchObject({
            items: [data[2]],
            total: 3,
            currentPage: 2,
            perPage: 2,
            lastPage: 2,
        })
    })
})
