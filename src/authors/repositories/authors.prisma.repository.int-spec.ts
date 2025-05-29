import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from './authors.prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { time } from 'node:console'

describe('AuthorsPrismaRepository Integration Tests', () => {
    let module: TestingModule
    let repository: AuthorsPrismaRepository
    const prisma = new PrismaClient()

    beforeAll(async () => {
        execSync('npm run prisma:migratetest')
        await prisma.$connect()
        module = await Test.createTestingModule({}).compile()
        repository = new AuthorsPrismaRepository(prisma as any)
    })

    beforeEach(async () => {
        await prisma.author.deleteMany()
    })

    afterAll(async () => {
        await module.close()
    })

    test('should throws an error when the id is not found', async () => {
        await expect(repository.findById('xxxYYYzzzz')).rejects.toThrow(
            new NotFoundError('Author ID xxxYYYzzzz not found'),
        )
    })

    test('should find an athor by id', async () => {
        const data = AuthorDataBuilder({})

        const author = await prisma.author.create({
            data,
        })

        const result = await repository.findById(author.id)
        expect(result).toStrictEqual(author)
    })

    test('should create an author', async () => {
        const data = AuthorDataBuilder({})

        const author = await repository.create(data)

        expect(author).toMatchObject(data)
    })

    test('should throws an error when updating an author not found', async () => {
        const data = AuthorDataBuilder({})
        const author = {
            id: 'xxxYYYzzzz',
            ...data,
        }
        await expect(repository.update(author)).rejects.toThrow(
            new NotFoundError('Author ID xxxYYYzzzz not found'),
        )
    })

    test('should update an author', async () => {
        const data = AuthorDataBuilder({})
        const author = await prisma.author.create({ data })

        const result = await repository.update({
            ...author,
            name: 'new name',
        })

        expect(result.name).toBe('new name')
    })

    test('should throws an error when deleting an author not found', async () => {
        await expect(repository.delete('xxxYYYzzzz')).rejects.toThrow(
            new NotFoundError('Author ID xxxYYYzzzz not found'),
        )
    })

    test('should delete an author', async () => {
        const data = AuthorDataBuilder({})

        const author = await prisma.author.create({ data })

        const result = await repository.delete(author.id)

        expect(result).toMatchObject(author)
    })

    test('should return null when does not find an author with the email provided', async () => {
        const result = await repository.findByEmail('a@a.com')
        expect(result).toBeNull()
    })

    test('should return an author from email search', async () => {
        const data = AuthorDataBuilder({ email: 'a@a.com' })

        const author = await prisma.author.create({ data })

        const result = await repository.findByEmail('a@a.com')

        expect(result).toMatchObject(author)
    })

    describe('search method', () => {
        test('should only apply pagination when the params are null', async () => {
            const createdAt = new Date()
            const data = []
            const arrange = Array(16).fill(AuthorDataBuilder({}))

            arrange.forEach((element, index) => {
                const timestamp = createdAt.getTime() + index
                data.push({
                    ...element,
                    email: `author${index}@gmail.com`,
                    createdAt: new Date(timestamp),
                })
            })

            await prisma.author.createMany({ data })

            const result = await repository.search({})

            expect(result.total).toBe(16)
            expect(result.items.length).toBe(15)
            result.items.forEach(item => {
                expect(item.id).toBeDefined()
            })

            for (let i = 0; i < result.items.length - 1; i++) {
                expect(result.items[i].email > result.items[i + 1].email)
            }
        })

        test('should apply pagination and ordering', async () => {
            const createdAt = new Date()
            const data = []
            const arrange = 'badec'

            arrange.split('').forEach((element, index) => {
                const timestamp = createdAt.getTime() + index
                data.push({
                    ...AuthorDataBuilder({ name: element }),
                    email: `author${index}@gmail.com`,
                    createdAt: new Date(timestamp),
                })
            })

            await prisma.author.createMany({ data })

            const result1 = await repository.search({
                page: 1,
                perPage: 2,
                sort: 'name',
                sortDir: 'asc',
            })

            expect(result1.items[0]).toMatchObject(data[1])
            expect(result1.items[1]).toMatchObject(data[0])

            const result2 = await repository.search({
                page: 2,
                perPage: 2,
                sort: 'name',
                sortDir: 'asc',
            })

            expect(result2.items[0]).toMatchObject(data[4])
            expect(result2.items[1]).toMatchObject(data[2])
        })

        test('should apply pagination.filter and ordering', async () => {
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

            const result1 = await repository.search({
                page: 1,
                perPage: 2,
                sort: 'name',
                sortDir: 'asc',
                filter: 'TEST',
            })

            expect(result1.items[0]).toMatchObject(data[0])
            expect(result1.items[1]).toMatchObject(data[4])

            const result2 = await repository.search({
                page: 2,
                perPage: 2,
                sort: 'name',
                sortDir: 'asc',
                filter: 'TEST',
            })

            expect(result2.items[0]).toMatchObject(data[2])
            expect(result2.items.length).toBe(1)
        })
    })
})
