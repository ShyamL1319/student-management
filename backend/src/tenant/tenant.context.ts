import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId?: string; // Tenant Collection ID
  schoolId?: string; // Associated School ID
  subdomain?: string;
  requestId: string;
  correlationId: string;
  userId?: string;
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

  static getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }

  static getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  static setUserId(userId: string) {
    const store = this.storage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  static setTenantDetails(
    tenantId: string,
    schoolId: string,
    subdomain: string,
  ) {
    const store = this.storage.getStore();
    if (store) {
      store.tenantId = tenantId;
      store.schoolId = schoolId;
      store.subdomain = subdomain;
    }
  }
}
