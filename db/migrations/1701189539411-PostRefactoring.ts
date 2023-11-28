import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701189539411 implements MigrationInterface {
    name = 'PostRefactoring1701189539411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` DROP FOREIGN KEY \`FK_84787bba29af276354efa6ac78f\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP FOREIGN KEY \`FK_515425af501dd9bfb6903f9201f\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`FK_b059782146942794c220377462c\``);
        await queryRunner.query(`DROP INDEX \`REL_84787bba29af276354efa6ac78\` ON \`wechat_accounts\``);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` DROP COLUMN \`pad_local_token_id\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`chatSessionId\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`chat_session_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`replying_chat_session_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD UNIQUE INDEX \`IDX_1116bc76b8619d77fc43663464\` (\`replying_chat_session_id\`)`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD \`reply_owner_message_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD UNIQUE INDEX \`IDX_3f80a94956eda98820128e82e6\` (\`reply_owner_message_id\`)`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`text_content\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`text_content\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` CHANGE \`wechat_account_id\` \`wechat_account_id\` int NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_1116bc76b8619d77fc43663464\` ON \`history_messages\` (\`replying_chat_session_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_3f80a94956eda98820128e82e6\` ON \`chat_sessions\` (\`reply_owner_message_id\`)`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD CONSTRAINT \`fk_chat_session_history_message\` FOREIGN KEY (\`chat_session_id\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD CONSTRAINT \`fk_replying_chat_session_history_message\` FOREIGN KEY (\`replying_chat_session_id\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`fk_chat_session_wechat_account\` FOREIGN KEY (\`wechat_account_id\`) REFERENCES \`wechat_accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`fk_chat_session_reply_owner_message\` FOREIGN KEY (\`reply_owner_message_id\`) REFERENCES \`history_messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`fk_chat_session_reply_owner_message\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`fk_chat_session_wechat_account\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP FOREIGN KEY \`fk_replying_chat_session_history_message\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP FOREIGN KEY \`fk_chat_session_history_message\``);
        await queryRunner.query(`DROP INDEX \`REL_3f80a94956eda98820128e82e6\` ON \`chat_sessions\``);
        await queryRunner.query(`DROP INDEX \`REL_1116bc76b8619d77fc43663464\` ON \`history_messages\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` CHANGE \`wechat_account_id\` \`wechat_account_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`text_content\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`text_content\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP INDEX \`IDX_3f80a94956eda98820128e82e6\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP COLUMN \`reply_owner_message_id\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP INDEX \`IDX_1116bc76b8619d77fc43663464\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`replying_chat_session_id\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`chat_session_id\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`chatSessionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` ADD \`pad_local_token_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_84787bba29af276354efa6ac78\` ON \`wechat_accounts\` (\`pad_local_token_id\`)`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`FK_b059782146942794c220377462c\` FOREIGN KEY (\`wechat_account_id\`) REFERENCES \`wechat_accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD CONSTRAINT \`FK_515425af501dd9bfb6903f9201f\` FOREIGN KEY (\`chatSessionId\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` ADD CONSTRAINT \`FK_84787bba29af276354efa6ac78f\` FOREIGN KEY (\`pad_local_token_id\`) REFERENCES \`pad_local_tokens\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
