import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701278117578 implements MigrationInterface {
    name = 'PostRefactoring1701278117578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`open_ai_tokens\` ADD \`baseUrl\` varchar(255) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`open_ai_tokens\` DROP COLUMN \`baseUrl\``);
    }

}
