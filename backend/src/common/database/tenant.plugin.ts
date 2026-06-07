import { Schema, Types } from 'mongoose';
import { TenantContext } from '../../tenant/tenant.context';

export interface TenantPluginOptions {
  bypass?: boolean;
}

export function tenantPlugin(schema: Schema, options?: TenantPluginOptions) {
  if (options?.bypass) {
    return;
  }

  // 1. Automatically inject the schoolId field to the schema
  if (!schema.paths['schoolId']) {
    schema.add({
      schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: false, index: true },
    });
  }

  const GLOBAL_BYPASS_MODELS = ['Tenant', 'School', 'Role', 'Permission', 'AuditLog', 'Counter'];

  const isBypassedModel = (modelName: string): boolean => {
    return GLOBAL_BYPASS_MODELS.includes(modelName);
  };

  // 2. Intercept find and write hooks to inject schoolId filter
  const applyTenantFilter = function (this: any) {
    const queryOptions = this.getOptions();
    if (queryOptions && queryOptions.bypassTenant) {
      return;
    }

    const modelName = this.model?.modelName;
    if (modelName && isBypassedModel(modelName)) {
      return;
    }

    const schoolId = TenantContext.getSchoolId();
    if (schoolId) {
      this.where({ schoolId: new Types.ObjectId(schoolId) });
    }
  };

  schema.pre('find', applyTenantFilter);
  schema.pre('findOne', applyTenantFilter);
  schema.pre('countDocuments', applyTenantFilter);
  schema.pre('estimatedDocumentCount', applyTenantFilter);
  schema.pre('updateOne', applyTenantFilter);
  schema.pre('updateMany', applyTenantFilter);
  schema.pre('deleteOne', applyTenantFilter);
  schema.pre('deleteMany', applyTenantFilter);

  // 3. Intercept Aggregations
  schema.pre('aggregate', function (this: any) {
    const pipelineOptions = this.options || {};
    if (pipelineOptions.bypassTenant) {
      return;
    }

    const modelName = this._model?.modelName;
    if (modelName && isBypassedModel(modelName)) {
      return;
    }

    const schoolId = TenantContext.getSchoolId();
    if (schoolId) {
      this.pipeline().unshift({
        $match: { schoolId: new Types.ObjectId(schoolId) }
      });
    }
  });

  // 4. Populate schoolId on document save/create
  schema.pre('save', function (this: any) {
    const modelName = (this.constructor as any).modelName;
    if (modelName && isBypassedModel(modelName)) {
      return;
    }

    const schoolId = TenantContext.getSchoolId();
    if (schoolId && !this.schoolId) {
      this.schoolId = new Types.ObjectId(schoolId);
    }
  });
}
