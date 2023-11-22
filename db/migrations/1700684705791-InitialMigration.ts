import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1700684705791 implements MigrationInterface {
    name = 'InitialMigration1700684705791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`friends\` (\`id\` int NOT NULL AUTO_INCREMENT, \`wechat_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`avatar_url\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9b3aecd11d4fedace1d73cb66a\` (\`wechat_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chat_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`summary_message\` text NOT NULL, \`system_message\` text NOT NULL, \`wechat_account_id\` int NULL, \`friend_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wechat_accounts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`wechat_id\` varchar(255) NOT NULL, \`pad_local_token_id\` int NULL, UNIQUE INDEX \`IDX_aa68fa645a3df0f19555161793\` (\`wechat_id\`), UNIQUE INDEX \`REL_84787bba29af276354efa6ac78\` (\`pad_local_token_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`pad_local_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_91e5c9dbf40a24fd34de7ce940\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`open_ai_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_1dd22249b5af77d2cb0f6e4dd9\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`FK_b059782146942794c220377462c\` FOREIGN KEY (\`wechat_account_id\`) REFERENCES \`wechat_accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD CONSTRAINT \`FK_fedaa5aa83fb3057e47e4b680df\` FOREIGN KEY (\`friend_id\`) REFERENCES \`friends\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` ADD CONSTRAINT \`FK_84787bba29af276354efa6ac78f\` FOREIGN KEY (\`pad_local_token_id\`) REFERENCES \`pad_local_tokens\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` DROP FOREIGN KEY \`FK_84787bba29af276354efa6ac78f\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`FK_fedaa5aa83fb3057e47e4b680df\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP FOREIGN KEY \`FK_b059782146942794c220377462c\``);
        await queryRunner.query(`DROP INDEX \`IDX_1dd22249b5af77d2cb0f6e4dd9\` ON \`open_ai_tokens\``);
        await queryRunner.query(`DROP TABLE \`open_ai_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_91e5c9dbf40a24fd34de7ce940\` ON \`pad_local_tokens\``);
        await queryRunner.query(`DROP TABLE \`pad_local_tokens\``);
        await queryRunner.query(`DROP INDEX \`REL_84787bba29af276354efa6ac78\` ON \`wechat_accounts\``);
        await queryRunner.query(`DROP INDEX \`IDX_aa68fa645a3df0f19555161793\` ON \`wechat_accounts\``);
        await queryRunner.query(`DROP TABLE \`wechat_accounts\``);
        await queryRunner.query(`DROP TABLE \`chat_sessions\``);
        await queryRunner.query(`DROP INDEX \`IDX_9b3aecd11d4fedace1d73cb66a\` ON \`friends\``);
        await queryRunner.query(`DROP TABLE \`friends\``);
    }

}
