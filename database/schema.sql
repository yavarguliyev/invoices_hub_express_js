-- Create the "roles" table
CREATE TABLE "roles" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMPTZ NULL,
    CONSTRAINT "UQ_role_name" UNIQUE ("name")
);

-- Create the "users" table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(128) NOT NULL UNIQUE,
    "first_name" VARCHAR(128) NOT NULL,
    "last_name" VARCHAR(64) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "role_id" INT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMPTZ NULL,
    CONSTRAINT "FK_user_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE
);

-- Create the "invoices" table
CREATE TABLE "invoices" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "description" VARCHAR(500),
    "status" VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    "approved_by_role" INT,
    "user_id" INT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMPTZ NULL,
    CONSTRAINT "FK_invoice_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "FK_invoice_role" FOREIGN KEY ("approved_by_role") REFERENCES "roles" ("id") ON DELETE SET NULL
);

-- Create the "orders" table
CREATE TABLE "orders" (
    "id" SERIAL PRIMARY KEY,
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "status" VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    "user_id" INT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" TIMESTAMPTZ NULL,
    CONSTRAINT "FK_order_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Add indexes to the "invoices" table
CREATE INDEX "IDX_invoice_user" ON "invoices" ("user_id");
CREATE INDEX "IDX_invoice_status" ON "invoices" ("status");
CREATE INDEX "IDX_invoice_role" ON "invoices" ("approved_by_role");

-- Add indexes to the "orders" table
CREATE INDEX "IDX_order_user" ON "orders" ("user_id");
CREATE INDEX "IDX_order_status" ON "orders" ("status");

-- Modify the "invoices" table to reference "orders"
ALTER TABLE "invoices" ADD COLUMN "order_id" INT;
ALTER TABLE "invoices"
ADD CONSTRAINT "FK_invoice_order" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL;

-- Insert sample data into "roles" table
INSERT INTO
    "roles" (
        "name",
        "created_at",
        "updated_at"
    )
VALUES ('Global Admin', NOW(), NOW()),
    ('Admin', NOW(), NOW()),
    ('Contributor', NOW(), NOW()),
    ('Standard', NOW(), NOW());

-- Insert sample data into "users" table
INSERT INTO
    "users" (
        "email",
        "first_name",
        "last_name",
        "password",
        "role_id",
        "created_at",
        "updated_at"
    )
VALUES (
        'global_admin@example.com',
        'Alice',
        'Global Admin',
        '$2b$10$xnlUQ65DD06uI3M0EKAHP.0v.mN53s.AcXaN8pSav6rj8.ki68GUq',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Global Admin'
        ),
        NOW(),
        NOW()
    ),
    (
        'admin@example.com',
        'Bob',
        'Admin',
        '$2b$10$xnlUQ65DD06uI3M0EKAHP.0v.mN53s.AcXaN8pSav6rj8.ki68GUq',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Admin'
        ),
        NOW(),
        NOW()
    ),
    (
        'contributor@example.com',
        'Charlie',
        'Contributor',
        '$2b$10$xnlUQ65DD06uI3M0EKAHP.0v.mN53s.AcXaN8pSav6rj8.ki68GUq',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Contributor'
        ),
        NOW(),
        NOW()
    ),
    (
        'standard@example.com',
        'Diana',
        'Standard',
        '$2b$10$xnlUQ65DD06uI3M0EKAHP.0v.mN53s.AcXaN8pSav6rj8.ki68GUq',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Standard'
        ),
        NOW(),
        NOW()
    );

-- Insert sample data into "invoices" table
INSERT INTO
    "invoices" (
        "title",
        "amount",
        "description",
        "status",
        "approved_by_role",
        "user_id",
        "created_at",
        "updated_at"
    )
VALUES (
        'Invoice #001',
        100.50,
        'Payment for services rendered',
        'APPROVED',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Global Admin'
        ),
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'global_admin@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        'Invoice #002',
        250.00,
        'Monthly subscription',
        'PENDING',
        NULL,
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'admin@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        'Invoice #003',
        500.00,
        'Project milestone payment',
        'REJECTED',
        (
            SELECT id
            FROM "roles"
            WHERE
                name = 'Contributor'
        ),
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'contributor@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        'Invoice #004',
        75.99,
        'One-time fee',
        'PENDING',
        NULL,
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'standard@example.com'
        ),
        NOW(),
        NOW()
    );

-- Insert sample data into "orders" table
INSERT INTO
    "orders" (
        "total_amount",
        "status",
        "user_id",
        "created_at",
        "updated_at"
    )
VALUES (
        500.00,
        'PENDING',
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'global_admin@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        250.00,
        'COMPLETED',
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'admin@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        150.75,
        'PENDING',
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'contributor@example.com'
        ),
        NOW(),
        NOW()
    ),
    (
        100.00,
        'CANCELLED',
        (
            SELECT id
            FROM "users"
            WHERE
                email = 'standard@example.com'
        ),
        NOW(),
        NOW()
    );

-- Update sample data in "invoices" to associate them with orders
UPDATE "invoices"
SET
    "order_id" = (
        SELECT id
        FROM "orders"
        WHERE
            "user_id" = (
                SELECT id
                FROM "users"
                WHERE
                    email = 'global_admin@example.com'
            )
    )
WHERE
    "title" = 'Invoice #001';

UPDATE "invoices"
SET
    "order_id" = (
        SELECT id
        FROM "orders"
        WHERE
            "user_id" = (
                SELECT id
                FROM "users"
                WHERE
                    email = 'admin@example.com'
            )
    )
WHERE
    "title" = 'Invoice #002';
