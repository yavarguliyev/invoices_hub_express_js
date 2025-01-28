import { JsonController } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';

  @JsonController(createVersionedRoute('/invoices', 'v1'))
export class InvoicesController {}
