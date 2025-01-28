import { Repository, EntityRepository } from 'typeorm';

import Invoice from 'entities/invoices.entity';

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {};
