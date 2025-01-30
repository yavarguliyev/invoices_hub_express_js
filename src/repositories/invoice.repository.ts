import { Repository, EntityRepository } from 'typeorm';

import Invoice from 'entities/invoice.entity';

@EntityRepository(Invoice)
export class InvoiceRepository extends Repository<Invoice> {};
