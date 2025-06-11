import { AuthorsPrismaRepository } from '@/authors/repositories/authors.prisma.repository'
import { PostOutput } from '../dto/post-output'
import { PostsPrismaRepository } from '../repositories/posts-prisma.repository'
import { BadRequestError } from '@/shared/errors/bad-request.error'
import slugify from 'slugify'
import { ConflictError } from '@/shared/errors/conflict-error'

export namespace CreatePostUseCase {
    export type Input = {
        title: string
        content: string
        authorId: string
        slug: string
        publised: boolean
        createdAt: Date
    }

    export type OutPut = PostOutput

    export class UseCase {
        constructor(
            private postsRepository: PostsPrismaRepository,
            private authorRepository: AuthorsPrismaRepository,
        ) {}

        async execute(input: Input): Promise<OutPut> {
            const { title, authorId, content } = input

            if (!authorId || !title || !content) {
                throw new BadRequestError('Input data not provided')
            }
            await this.authorRepository.get(authorId)

            const slug = slugify(title, { lower: true })

            const slugExists = await this.postsRepository.findBySlug(slug)
            if (slugExists) {
                throw new ConflictError('Title used by other post')
            }
            const post = await this.postsRepository.create({
                ...input,
                published: false,
                slug,
            })

            return post as PostOutput
        }
    }
}
