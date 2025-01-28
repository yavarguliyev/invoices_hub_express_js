import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { RoleDto } from 'value-objects/dto/role/role.dto';
import { InvoiceDto } from 'value-objects/dto/invoice/invoice.dto';

export class InvoiceResultsDto {
  invoices?: InvoiceDto[];
  invoice?: InvoiceDto;
  role?: RoleDto;
  result: ResultMessage;

  constructor (invoices: InvoiceDto[], invoice: InvoiceDto, role: RoleDto, result: ResultMessage) {
    this.invoices = invoices;
    this.invoice = invoice;
    this.role = role;
    this.result = result;
  }
}
