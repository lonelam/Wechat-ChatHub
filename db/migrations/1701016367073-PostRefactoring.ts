import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701016367073 implements MigrationInterface {
    name = 'PostRefactoring1701016367073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` CHANGE \`isOccupied\` \`isOccupied\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` CHANGE \`isOccupied\` \`isOccupied\` tinyint NOT NULL`);
    }

}
