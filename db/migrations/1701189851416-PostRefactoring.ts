import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701189851416 implements MigrationInterface {
    name = 'PostRefactoring1701189851416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_1116bc76b8619d77fc43663464\` ON \`history_messages\``);
        await queryRunner.query(`DROP INDEX \`IDX_3f80a94956eda98820128e82e6\` ON \`chat_sessions\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_3f80a94956eda98820128e82e6\` ON \`chat_sessions\` (\`reply_owner_message_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_1116bc76b8619d77fc43663464\` ON \`history_messages\` (\`replying_chat_session_id\`)`);
    }

}
