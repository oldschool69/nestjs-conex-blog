import { Test, TestingModule } from "@nestjs/testing"
import { AuthorsPrismaRepository } from "./authors.prisma.repository"
import { PrismaClient } from "@prisma/client"
import { execSync } from "node:child_process"
import { NotFoundError } from "@/shared/errors/not-found.error"

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
        const data = {
            name: 'Flavio Oliveira',
            email: 'flavio@gmail.com'
        }

        const author = await prisma.author.create({
            data,
        })

        const result = await repository.findById(author.id)
        expect(result).toStrictEqual(author)
    })
})
