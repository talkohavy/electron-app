import { ClockApi } from './features/clock.api';
import { CounterApi } from './features/counter.api';
import { DialogApi } from './features/dialog.api';
import { MenuApi } from './features/menu.api';
import { SystemApi } from './features/system.api';
import type { IpcService } from '../ipc-service';

/**
 * Price to pay:
 *
 * 1. contextBridge strips prototype methods.
 * It only clones an object's own enumerable properties.
 *
 * Therefore, each API should define its public methods as an arrow-function class field,
 * so they survive the bridge.
 *
 * 2. Not leaking the injected dependency.
 * A normal private ipc (or constructor-param property) compiles to an own enumerable field,
 * which contextBridge would then clone onto window.api.counter.ipc.
 * I used a hard-private #ipc field, which is invisible to property enumeration,
 * so the dependency stays truly internal.
 */
export class Api {
  readonly system: SystemApi;
  readonly dialog: DialogApi;
  readonly counter: CounterApi;
  readonly clock: ClockApi;
  readonly menu: MenuApi;

  constructor(ipc: IpcService) {
    this.system = new SystemApi(ipc);
    this.dialog = new DialogApi(ipc);
    this.counter = new CounterApi(ipc);
    this.clock = new ClockApi(ipc);
    this.menu = new MenuApi(ipc);
  }
}
