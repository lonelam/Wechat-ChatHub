import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701135493863 implements MigrationInterface {
    name = 'PostRefactoring1701135493863'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`text_content\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`text_content\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`text_content\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`text_content\` varchar(255) NOT NULL`);
    }

}
