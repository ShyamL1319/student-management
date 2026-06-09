import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId: string; // Tenant Collection ID
  schoolId: string; // Associated School ID
  subdomain: string;
}

export class TenantContext {
  private static storage = new AsyncLocalStorage<TenantStore>();

  static run(store: TenantStore, callback: () => any) {
    return this.storage.run(store, callback);
  }

  static get(): TenantStore | undefined {
    return this.storage.getStore();
  }

  static getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  static getSchoolId(): string | undefined {
    return this.storage.getStore()?.schoolId;
  }

  static getSubdomain(): string | undefined {
    return this.storage.getStore()?.subdomain;
  }
}
