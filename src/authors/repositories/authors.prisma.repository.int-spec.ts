import { Test, TestingModule } from "@nestjs/testing"
import { AuthorsPrismaRepository } from "./authors.prisma.repository"
import { PrismaClient } from "@prisma/client"
import { execSync } from "node:child_process"
import { NotFoundError } from "@/shared/errors/not-found.error"
import { AuthorDataBuilder } from "../helpers/author-data-builder"
import { time } from "node:console"

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
            new NotFoundError('Author ID xxxYYYzzzz not found')
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

    describe('search methos', () => {

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

            await prisma.author.createMany( { data } )

            const result = await repository.search({})

            expect(result.total).toBe(16)
            expect(result.items.length).toBe(15)
            result.items.forEach((item) => {
                expect(item.id).toBeDefined()
            })
        })

    })

})
