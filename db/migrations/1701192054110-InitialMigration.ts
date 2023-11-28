import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1701192054110 implements MigrationInterface {
    name = 'InitialMigration1701192054110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pad_local_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`isOccupied\` tinyint NOT NULL DEFAULT 0, \`wechat_account_id\` int NULL, UNIQUE INDEX \`IDX_91e5c9dbf40a24fd34de7ce940\` (\`token\`), UNIQUE INDEX \`REL_a5504bab2a94c4413fa40f642d\` (\`wechat_account_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wechat_accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`wechat_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`avatar_url\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`history_messages\` (\`id\` int NOT NULL AUTO_INCREMENT, \`wechatId\` varchar(255) NOT NULL, \`type\` int NOT NULL, \`text_content\` text NOT NULL, \`senderId\` varchar(255) NOT NULL, \`receiverId\` varchar(255) NOT NULL, \`source\` varchar(255) NOT NULL, \`send_time\` timestamp NOT NULL, \`chat_session_id\` int NOT NULL, \`replying_chat_session_id\` int NULL, UNIQUE INDEX \`REL_1116bc76b8619d77fc43663464\` (\`replying_chat_session_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`conversationId\` varchar(255) NOT NULL, \`summary_message\` text NOT NULL DEFAULT '', \`system_message\` text NOT NULL DEFAULT '', \`active_message\` text NOT NULL DEFAULT '', \`feature_flags\` int NOT NULL DEFAULT '0', \`wechat_account_id\` int NOT NULL, \`reply_owner_message_id\` int NULL, UNIQUE INDEX \`REL_3f80a94956eda98820128e82e6\` (\`reply_owner_message_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`friends\` (\`id\` int NOT NULL AUTO_INCREMENT, \`wechat_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`avatar_url\` varchar(255) NOT NULL, \`gender\` int NOT NULL, \`alias\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`open_ai_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_1dd22249b5af77d2cb0f6e4dd9\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_session_friends\` (\`chat_session_id\` int NOT NULL, \`friend_id\` int NOT NULL, INDEX \`IDX_28beeda244bbaacd84420ce8ad\` (\`chat_session_id\`), INDEX \`IDX_836d4b2504bda48d42d054ef23\` (\`friend_id\`), PRIMARY KEY (\`chat_session_id\`, \`friend_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` ADD CONSTRAINT \`pad_local_token_wechat_account_fk\` FOREIGN KEY (\`wechat_account_id\`) REFERENCES \`wechat_accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD CONSTRAINT \`fk_chat_session_history_message\` FOREIGN KEY (\`chat_session_id\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD CONSTRAINT \`fk_replying_chat_session_history_message\` FOREIGN KEY (\`replying_chat_session_id\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`fk_chat_session_wechat_account\` FOREIGN KEY (\`wechat_account_id\`) REFERENCES \`wechat_accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`fk_chat_session_reply_owner_message\` FOREIGN KEY (\`reply_owner_message_id\`) REFERENCES \`history_messages\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_session_friends\` ADD CONSTRAINT \`fk_chat_session_friends_chat_session\` FOREIGN KEY (\`chat_session_id\`) REFERENCES \`chat_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`chat_session_friends\` ADD CONSTRAINT \`fk_chat_session_friends_friend\` FOREIGN KEY (\`friend_id\`) REFERENCES \`friends\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat_session_friends\` DROP FOREIGN KEY \`fk_chat_session_friends_friend\``);
        await queryRunner.query(`ALTER TABLE \`chat_session_friends\` DROP FOREIGN KEY \`fk_chat_session_friends_chat_session\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`fk_chat_session_reply_owner_message\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`fk_chat_session_wechat_account\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP FOREIGN KEY \`fk_replying_chat_session_history_message\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP FOREIGN KEY \`fk_chat_session_history_message\``);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` DROP FOREIGN KEY \`pad_local_token_wechat_account_fk\``);
        await queryRunner.query(`DROP INDEX \`IDX_836d4b2504bda48d42d054ef23\` ON \`chat_session_friends\``);
        await queryRunner.query(`DROP INDEX \`IDX_28beeda244bbaacd84420ce8ad\` ON \`chat_session_friends\``);
        await queryRunner.query(`DROP TABLE \`chat_session_friends\``);
        await queryRunner.query(`DROP INDEX \`IDX_1dd22249b5af77d2cb0f6e4dd9\` ON \`open_ai_tokens\``);
        await queryRunner.query(`DROP TABLE \`open_ai_tokens\``);
        await queryRunner.query(`DROP TABLE \`friends\``);
        await queryRunner.query(`DROP INDEX \`REL_3f80a94956eda98820128e82e6\` ON \`chat_sessions\``);
        await queryRunner.query(`DROP TABLE \`chat_sessions\``);
        await queryRunner.query(`DROP INDEX \`REL_1116bc76b8619d77fc43663464\` ON \`history_messages\``);
        await queryRunner.query(`DROP TABLE \`history_messages\``);
        await queryRunner.query(`DROP TABLE \`wechat_accounts\``);
        await queryRunner.query(`DROP INDEX \`REL_a5504bab2a94c4413fa40f642d\` ON \`pad_local_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_91e5c9dbf40a24fd34de7ce940\` ON \`pad_local_tokens\``);
        await queryRunner.query(`DROP TABLE \`pad_local_tokens\``);
    }

}
