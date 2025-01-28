import { Service } from 'typedi';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

import { Roles } from '../src/value-objects/enums/roles.enum';
import { Entities } from '../src/value-objects/enums/entities.enum';

@Service()
export class CreateUsersRolesAndInvoicesTables1737788798120 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        // Create the "roles" table
        await queryRunner.createTable(
            new Table({
                name: Entities.ROLE,
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
                uniques: [
                    {
                        name: 'UQ_ROLE_NAME',
                        columnNames: ['name'],
                    },
                ],
            })
        );

        // Create the "users" table
        await queryRunner.createTable(
            new Table({
                name: Entities.USER,
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
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
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
                indices: [
                    {
                        name: 'IDX_USER_EMAIL',
                        columnNames: ['email'],
                        isUnique: true,
                    },
                ],
            })
        );

        // Add foreign key between "users" and "roles"
        await queryRunner.createForeignKey(
            Entities.USER,
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['id'],
                referencedTableName: Entities.ROLE,
                onDelete: 'CASCADE',
            })
        );

        // Create the "invoices" table
        await queryRunner.createTable(
            new Table({
                name: Entities.INVOICE,
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'PENDING'",
                        isNullable: false,
                    },
                    {
                        name: 'approved_by_role',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'user_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            })
        );

        // Add foreign key between "invoices" and "users"
        await queryRunner.createForeignKey(
            Entities.INVOICE,
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: Entities.USER,
                onDelete: 'CASCADE',
            })
        );

        // Add foreign key between "invoices" and "roles"
        await queryRunner.createForeignKey(
            Entities.INVOICE,
            new TableForeignKey({
                columnNames: ['approved_by_role'],
                referencedColumnNames: ['id'],
                referencedTableName: Entities.ROLE,
                onDelete: 'SET NULL',
            })
        );

        // Add indexes to the "invoices" table
        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_INVOICE_USER',
                columnNames: ['user_id'],
            })
        );

        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_INVOICE_STATUS',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_INVOICE_ROLE',
                columnNames: ['approved_by_role'],
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
            ('admin@example.com', 'Alice', 'Admin', 'securepassword1', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.GlobalAdmin}'), NOW(), NOW()),
            ('manager@example.com', 'Bob', 'Manager', 'securepassword2', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Admin}'), NOW(), NOW()),
            ('editor@example.com', 'Charlie', 'Editor', 'securepassword3', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Contributor}'), NOW(), NOW()),
            ('user@example.com', 'Diana', 'User', 'securepassword4', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Standard}'), NOW(), NOW());
        `);

        // Insert sample data for invoices
        await queryRunner.query(`
            INSERT INTO "${Entities.INVOICE}" ("title", "amount", "description", "status", "approved_by_role", "user_id", "created_at", "updated_at")
            VALUES
            ('Invoice #001', 100.50, 'Payment for services rendered', 'APPROVED', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Admin}'), (SELECT id FROM "${Entities.USER}" WHERE email = 'admin@example.com'), NOW(), NOW()),
            ('Invoice #002', 250.00, 'Monthly subscription', 'PENDING', NULL, (SELECT id FROM "${Entities.USER}" WHERE email = 'manager@example.com'), NOW(), NOW()),
            ('Invoice #003', 500.00, 'Project milestone payment', 'REJECTED', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Contributor}'), (SELECT id FROM "${Entities.USER}" WHERE email = 'editor@example.com'), NOW(), NOW()),
            ('Invoice #004', 75.00, 'Service fees', 'APPROVED', (SELECT id FROM "${Entities.ROLE}" WHERE name = '${Roles.Standard}'), (SELECT id FROM "${Entities.USER}" WHERE email = 'user@example.com'), NOW(), NOW());
        `);
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_INVOICE_USER');
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_INVOICE_STATUS');
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_INVOICE_ROLE');
        await queryRunner.dropIndex(Entities.USER, 'IDX_USER_EMAIL');
        await queryRunner.dropIndex(Entities.ROLE, 'UQ_ROLE_NAME');

        // Remove foreign keys
        const userTable = await queryRunner.getTable(Entities.USER);
        const invoiceTable = await queryRunner.getTable(Entities.INVOICE);

        if (userTable && invoiceTable) {
            const userForeignKey = userTable.foreignKeys.find(fk => fk.columnNames.includes('role_id'));
            const invoiceUserForeignKey = invoiceTable.foreignKeys.find(fk => fk.columnNames.includes('user_id'));
            const invoiceRoleForeignKey = invoiceTable.foreignKeys.find(fk => fk.columnNames.includes('approved_by_role'));

            if (userForeignKey) await queryRunner.dropForeignKey(Entities.USER, userForeignKey);
            if (invoiceUserForeignKey) await queryRunner.dropForeignKey(Entities.INVOICE, invoiceUserForeignKey);
            if (invoiceRoleForeignKey) await queryRunner.dropForeignKey(Entities.INVOICE, invoiceRoleForeignKey);
        }

        // Drop tables
        await queryRunner.dropTable(Entities.INVOICE);
        await queryRunner.dropTable(Entities.USER);
        await queryRunner.dropTable(Entities.ROLE);
    }
}
