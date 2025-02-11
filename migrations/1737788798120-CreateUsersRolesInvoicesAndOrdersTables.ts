import { Service } from 'typedi';
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

import { Entities } from '../src/domain/enums/entities.enum';
import { InvoiceStatus } from '../src/domain/enums/invoice-status.enum';
import { OrderStatus } from '../src/domain/enums/order-status.enum';

@Service()
export class CreateUsersRolesInvoicesAndOrdersTables1737788798120 implements MigrationInterface {
    public async up (queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.createTable(new Table({
            name: Entities.ROLE,
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'name', type: 'varchar', length: '255', isUnique: true, isNullable: false },
                { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'deleted_at', type: 'timestamptz', isNullable: true }
            ]
        }));

        // Create users table
        await queryRunner.createTable(new Table({
            name: Entities.USER,
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'email', type: 'varchar', length: '128', isUnique: true, isNullable: false },
                { name: 'first_name', type: 'varchar', length: '128', isNullable: false },
                { name: 'last_name', type: 'varchar', length: '64', isNullable: false },
                { name: 'password', type: 'varchar', length: '256', isNullable: false },
                { name: 'role_id', type: 'int', isNullable: false },
                { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'deleted_at', type: 'timestamptz', isNullable: true }
            ]
        }));

        // Create invoices table
        await queryRunner.createTable(new Table({
            name: Entities.INVOICE,
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'title', type: 'varchar', length: '255', isNullable: false },
                { name: 'amount', type: 'decimal', precision: 10, scale: 2, isNullable: false },
                { name: 'description', type: 'varchar', length: '500', isNullable: true },
                { name: 'status', type: 'varchar', length: '50', default: `'${InvoiceStatus.PENDING}'`, isNullable: false },
                { name: 'approved_by_role', type: 'int', isNullable: true },
                { name: 'user_id', type: 'int', isNullable: false },
                { name: 'order_id', type: 'int', isNullable: true },
                { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'deleted_at', type: 'timestamptz', isNullable: true }
            ]
        }));

        // Create orders table
        await queryRunner.createTable(new Table({
            name: Entities.ORDER,
            columns: [
                { name: 'id', type: 'serial', isPrimary: true },
                { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, isNullable: false },
                { name: 'status', type: 'varchar', length: '50', default: `'${OrderStatus.PENDING}'`, isNullable: false },
                { name: 'user_id', type: 'int', isNullable: false },
                { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'updated_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP', isNullable: false },
                { name: 'deleted_at', type: 'timestamptz', isNullable: true }
            ]
        }));

        // Create foreign keys
        await queryRunner.createForeignKeys(Entities.USER, [
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedTableName: Entities.ROLE,
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        ]);

        await queryRunner.createForeignKeys(Entities.INVOICE, [
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: Entities.USER,
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            }),
            new TableForeignKey({
                columnNames: ['approved_by_role'],
                referencedTableName: Entities.ROLE,
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            }),
            new TableForeignKey({
                columnNames: ['order_id'],
                referencedTableName: Entities.ORDER,
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        ]);

        await queryRunner.createForeignKey(Entities.ORDER, new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: Entities.USER,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
        }));

        // Add indexes to the "invoices" table
        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_invoice_user',
                columnNames: ['user_id'],
            })
        );

        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_invoice_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            Entities.INVOICE,
            new TableIndex({
                name: 'IDX_invoice_role',
                columnNames: ['approved_by_role'],
            })
        );

        await queryRunner.createIndex(
            Entities.ORDER,
            new TableIndex({
                name: 'IDX_order_user',
                columnNames: ['user_id'],
            })
        );

        await queryRunner.createIndex(
            Entities.ORDER,
            new TableIndex({
                name: 'IDX_order_status',
                columnNames: ['status'],
            })
        );

        // Insert sample data into "roles" table
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "created_at", "updated_at")
            VALUES
                ('Global Admin', NOW(), NOW()),
                ('Admin', NOW(), NOW()),
                ('Contributor', NOW(), NOW()),
                ('Standard', NOW(), NOW());
        `);

        // Insert sample data into "users" table
        await queryRunner.query(`
            INSERT INTO "users" ("email", "first_name", "last_name", "password", "role_id", "created_at", "updated_at")
            VALUES
                ('global_admin@example.com', 'Alice', 'Global Admin', '$2b$10$8OG/d5Uk8h45FtcnhlP33eHknL0NCwYe1FikPbER8gd/YJgKZBm6S', 
                    (SELECT id FROM "roles" WHERE name = 'Global Admin'), NOW(), NOW()),
                ('admin@example.com', 'Bob', 'Admin', '$2b$10$8OG/d5Uk8h45FtcnhlP33eHknL0NCwYe1FikPbER8gd/YJgKZBm6S', 
                    (SELECT id FROM "roles" WHERE name = 'Admin'), NOW(), NOW()),
                ('contributor@example.com', 'Charlie', 'Contributor', '$2b$10$8OG/d5Uk8h45FtcnhlP33eHknL0NCwYe1FikPbER8gd/YJgKZBm6S', 
                    (SELECT id FROM "roles" WHERE name = 'Contributor'), NOW(), NOW()),
                ('standard@example.com', 'Diana', 'Standard', '$2b$10$8OG/d5Uk8h45FtcnhlP33eHknL0NCwYe1FikPbER8gd/YJgKZBm6S', 
                    (SELECT id FROM "roles" WHERE name = 'Standard'), NOW(), NOW());
        `);

        // Insert sample data into "invoices" table
        await queryRunner.query(`
            INSERT INTO "invoices" ("title", "amount", "description", "status", "approved_by_role", "user_id", "created_at", "updated_at")
            VALUES
                ('Invoice #1', 100.50, 'Payment for services rendered', 'paid', 
                    (SELECT id FROM "roles" WHERE name = 'Global Admin'), 
                    (SELECT id FROM "users" WHERE email = 'global_admin@example.com'), NOW(), NOW()),
                ('Invoice #2', 250.00, 'Monthly subscription', 'pending', NULL, 
                    (SELECT id FROM "users" WHERE email = 'admin@example.com'), NOW(), NOW()),
                ('Invoice #3', 500.00, 'Project milestone payment', 'cancelled', 
                    (SELECT id FROM "roles" WHERE name = 'Contributor'), 
                    (SELECT id FROM "users" WHERE email = 'contributor@example.com'), NOW(), NOW()),
                ('Invoice #4', 75.99, 'One-time fee', 'pending', NULL, 
                    (SELECT id FROM "users" WHERE email = 'standard@example.com'), NOW(), NOW());
        `);

        // Insert sample data into "orders" table
        await queryRunner.query(`
            INSERT INTO "orders" ("total_amount", "status", "user_id", "created_at", "updated_at")
            VALUES
                (500.00, 'PENDING', (SELECT id FROM "users" WHERE email = 'global_admin@example.com'), NOW(), NOW()),
                (250.00, 'COMPLETED', (SELECT id FROM "users" WHERE email = 'admin@example.com'), NOW(), NOW()),
                (150.75, 'PENDING', (SELECT id FROM "users" WHERE email = 'contributor@example.com'), NOW(), NOW()),
                (100.00, 'CANCELLED', (SELECT id FROM "users" WHERE email = 'standard@example.com'), NOW(), NOW());
        `);

        // Update "invoices" to associate each with an order
        await queryRunner.query(`
            UPDATE "invoices"
            SET "order_id" = (SELECT id FROM "orders" WHERE user_id = invoices.user_id LIMIT 1)
            WHERE "order_id" IS NULL;
        `);
    }

    public async down (queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_invoice_user');
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_invoice_status');
        await queryRunner.dropIndex(Entities.INVOICE, 'IDX_invoice_role');
        await queryRunner.dropIndex(Entities.ORDER, 'IDX_order_user');
        await queryRunner.dropIndex(Entities.ORDER, 'IDX_order_status');

        // Remove foreign keys
        const userTable = await queryRunner.getTable(Entities.USER);
        const invoiceTable = await queryRunner.getTable(Entities.INVOICE);
        const ordersTable = await queryRunner.getTable(Entities.ORDER);

        if (userTable) {
            const userForeignKey = userTable.foreignKeys.find(fk => fk.columnNames.includes('role_id'));
            if (userForeignKey) await queryRunner.dropForeignKey(Entities.USER, userForeignKey);
        }

        if (invoiceTable) {
            const invoiceUserForeignKey = invoiceTable.foreignKeys.find(fk => fk.columnNames.includes('user_id'));
            const invoiceRoleForeignKey = invoiceTable.foreignKeys.find(fk => fk.columnNames.includes('approved_by_role'));

            if (invoiceUserForeignKey) await queryRunner.dropForeignKey(Entities.INVOICE, invoiceUserForeignKey);
            if (invoiceRoleForeignKey) await queryRunner.dropForeignKey(Entities.INVOICE, invoiceRoleForeignKey);
        }

        if (ordersTable) {
            const ordersUserForeignKey = ordersTable.foreignKeys.find(fk => fk.columnNames.includes('user_id'));
            if (ordersUserForeignKey) await queryRunner.dropForeignKey(Entities.ORDER, ordersUserForeignKey);
        }

        // Drop tables in reverse order of creation to avoid foreign key violations
        await queryRunner.dropTable(Entities.INVOICE);
        await queryRunner.dropTable(Entities.ORDER);
        await queryRunner.dropTable(Entities.USER);
        await queryRunner.dropTable(Entities.ROLE);
    }
}
