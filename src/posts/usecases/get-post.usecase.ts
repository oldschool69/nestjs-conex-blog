import { PostOutput } from '../dto/post-output'
import { PostsPrismaRepository } from '../repositories/posts-prisma.repository'

export namespace GetPostUseCase {
    export type Input = {
        id: string
    }

    export type OutPut = PostOutput

    export class UseCase {
        constructor(private postsRepository: PostsPrismaRepository) {}

        async execute(input: Input): Promise<OutPut> {
            const post = await this.postsRepository.findById(input.id)
            return post as PostOutput
        }
    }
}
