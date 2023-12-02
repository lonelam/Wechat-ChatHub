import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1701553509138 implements MigrationInterface {
    name = 'PostRefactoring1701553509138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles_users_users\` (\`rolesId\` int NOT NULL, \`usersId\` int NOT NULL, INDEX \`IDX_6baa1fce24dde516186c4f0269\` (\`rolesId\`), INDEX \`IDX_391282056f6da8665b38480a13\` (\`usersId\`), PRIMARY KEY (\`rolesId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_roles\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_472b25323af01488f1f66a06b6\` (\`userId\`), INDEX \`IDX_86033897c009fcca8b6505d6be\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` ADD \`puppetType\` varchar(255) NOT NULL DEFAULT 'wechaty-puppet-padlocal'`);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`friends\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`history_messages\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`open_ai_tokens\` ADD \`owner_id\` int NOT NULL DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE \`roles_users_users\` ADD CONSTRAINT \`FK_6baa1fce24dde516186c4f0269a\` FOREIGN KEY (\`rolesId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`roles_users_users\` ADD CONSTRAINT \`FK_391282056f6da8665b38480a131\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_472b25323af01488f1f66a06b67\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_86033897c009fcca8b6505d6be2\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_86033897c009fcca8b6505d6be2\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_472b25323af01488f1f66a06b67\``);
        await queryRunner.query(`ALTER TABLE \`roles_users_users\` DROP FOREIGN KEY \`FK_391282056f6da8665b38480a131\``);
        await queryRunner.query(`ALTER TABLE \`roles_users_users\` DROP FOREIGN KEY \`FK_6baa1fce24dde516186c4f0269a\``);
        await queryRunner.query(`ALTER TABLE \`open_ai_tokens\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`ALTER TABLE \`chat_sessions\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`ALTER TABLE \`history_messages\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`ALTER TABLE \`friends\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`ALTER TABLE \`wechat_accounts\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` DROP COLUMN \`puppetType\``);
        await queryRunner.query(`ALTER TABLE \`pad_local_tokens\` DROP COLUMN \`owner_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_86033897c009fcca8b6505d6be\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_472b25323af01488f1f66a06b6\` ON \`user_roles\``);
        await queryRunner.query(`DROP TABLE \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_391282056f6da8665b38480a13\` ON \`roles_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_6baa1fce24dde516186c4f0269\` ON \`roles_users_users\``);
        await queryRunner.query(`DROP TABLE \`roles_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }

}
