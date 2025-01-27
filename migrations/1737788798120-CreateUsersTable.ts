import { Service } from 'typedi';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

import { Roles } from '../src/Enums/Roles.Enum';
import { Entities } from '../src/Enums/Entities.Enum';

@Service()
export class CreateUsersAndRolesTables1737788798120 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        // Create the "roles" table
        await queryRunner.createTable(
            new Table({
                name: Entities.ROLE,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'name',
                        type: 'enum',
                        enum: [Roles.GlobalAdmin, Roles.Admin, Roles.Contributor, Roles.Standard],
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            })
        );

        // Create an index on the "name" column of "roles" table
        await queryRunner.createIndex(
            Entities.ROLE,
            new TableIndex({
                name: 'IDX_ROLE_NAME',
                columnNames: ['name'],
                isUnique: true,
            })
        );

        // Create the "users" table
        await queryRunner.createTable(
            new Table({
                name: Entities.USER,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '128',
                        isNullable: false,
                    },
                    {
                        name: 'first_name',
                        type: 'varchar',
                        length: '128',
                        isNullable: false,
                    },
                    {
                        name: 'last_name',
                        type: 'varchar',
                        length: '64',
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        length: '256',
                        isNullable: false,
                    },
                    {
                        name: 'role_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            })
        );

        // Add foreign key constraint between "users" and "roles"
        await queryRunner.createForeignKey(
            Entities.USER,
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['id'],
                referencedTableName: Entities.ROLE,
                onDelete: 'CASCADE',
            })
        );

        // Create a unique index on the "email" column of "users" table
        await queryRunner.createIndex(
            Entities.USER,
            new TableIndex({
                name: 'IDX_USER_EMAIL',
                columnNames: ['email'],
                isUnique: true,
            })
        );

        // Insert sample data for roles
        await queryRunner.query(`
            INSERT INTO "${Entities.ROLE}" ("name", "created_at", "updated_at") VALUES
            ('${Roles.GlobalAdmin}', NOW(), NOW()),
            ('${Roles.Admin}', NOW(), NOW()),
            ('${Roles.Contributor}', NOW(), NOW()),
            ('${Roles.Standard}', NOW(), NOW());
        `);

        // Insert sample data for users
        await queryRunner.query(`
            INSERT INTO "${Entities.USER}" ("email", "first_name", "last_name", "password", "role_id", "created_at", "updated_at")
            VALUES
            ('user1@example.com', 'John', 'Doe', 'password1', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.GlobalAdmin}'), NOW(), NOW()),
            ('user2@example.com', 'Jane', 'Doe', 'password2', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Admin}'), NOW(), NOW()),
            ('user3@example.com', 'Alice', 'Smith', 'password3', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Contributor}'), NOW(), NOW()),
            ('user4@example.com', 'Bob', 'Johnson', 'password4', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Standard}'), NOW(), NOW());
        `);
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        // Remove the indexes created during the "up" method
        await queryRunner.dropIndex(Entities.USER, 'IDX_USER_EMAIL');
        await queryRunner.dropIndex(Entities.ROLE, 'IDX_ROLE_NAME');

        // Drop foreign key constraint between "users" and "roles"
        const foreignKey = await queryRunner.getTable(Entities.USER).then((table) => table?.foreignKeys.find(fk => fk.columnNames.indexOf('role_id') !== -1));
        if (foreignKey) {
            await queryRunner.dropForeignKey(Entities.USER, foreignKey);
        }

        // Drop the "users" table
        await queryRunner.dropTable(Entities.USER);

        // Drop the "roles" table
        await queryRunner.dropTable(Entities.ROLE);
    }
}
