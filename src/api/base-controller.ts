import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { IAuthService } from 'application/services/auth.service';
import { IHealthcheckService } from 'application/services/healthcheck.service';
import { IInvoiceService } from 'application/services/invoice.service';
import { IOrderService } from 'application/services/order.service';
import { IRoleService } from 'application/services/role.service';
import { IUserService } from 'application/services/user.service';

export abstract class BaseController {
  private _authService: IAuthService;
  private _healthCheckService: IHealthcheckService;
  private _invoiceService: IInvoiceService;
  private _orderService: IOrderService;
  private _roleService: IRoleService;
  private _userService: IUserService;

  protected get authService (): IAuthService {
    if (!this._authService) {
      this._authService = ContainerHelper.get<IAuthService>(ContainerItems.IAuthService);
    }

    return this._authService;
  }

  protected get healthCheckService (): IHealthcheckService {
    if (!this._healthCheckService) {
      this._healthCheckService = ContainerHelper.get<IHealthcheckService>(ContainerItems.IHealthcheckService);
    }

    return this._healthCheckService;
  }

  protected get invoiceService (): IInvoiceService {
    if (!this._invoiceService) {
      this._invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
    }

    return this._invoiceService;
  }

  protected get orderService (): IOrderService {
    if (!this._orderService) {
      this._orderService = ContainerHelper.get<IOrderService>(ContainerItems.IOrderService);
    }

    return this._orderService;
  }

  protected get roleService (): IRoleService {
    if (!this._roleService) {
      this._roleService = ContainerHelper.get<IRoleService>(ContainerItems.IRoleService);
    }

    return this._roleService;
  }

  protected get userService (): IUserService {
    if (!this._userService) {
      this._userService = ContainerHelper.get<IUserService>(ContainerItems.IUserService);
    }

    return this._userService;
  }
}
