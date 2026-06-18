import { Schema, Types } from 'mongoose';
import { TenantContext } from '../../tenant/tenant.context';
import { Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

const logger = new Logger('Database');

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
      schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: false,
        index: true,
      },
    });
  }

  const GLOBAL_BYPASS_MODELS = [
    'Tenant',
    'School',
    'Role',
    'Permission',
    'Counter',
  ];

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

  const recordStartTime = function (this: any) {
    this._startTime = Date.now();
  };

  const logSlowQuery = function (this: any) {
    if (this._startTime) {
      const durationMs = Date.now() - this._startTime;
      if (durationMs > 100) {
        const modelName = this.model?.modelName || 'unknown';
        const filter = this.getFilter ? this.getFilter() : {};
        logger.warn({
          message: `Slow query detected on collection '${modelName}' - Duration: ${durationMs}ms`,
          collection: modelName,
          durationMs,
          filter: JSON.stringify(filter),
          op: this.op || 'unknown',
        });
      }
    }
  };

  const trackQueryMetric = function (this: any, op?: string) {
    if (this._startTime) {
      const durationMs = Date.now() - this._startTime;
      const modelName =
        this.model?.modelName ||
        this._model?.modelName ||
        this.constructor?.modelName ||
        'unknown';
      const schoolId = TenantContext.getSchoolId() || 'system';
      const operation = op || this.op || 'unknown';

      try {
        Sentry.metrics.count('db.operations.total', 1, {
          attributes: {
            model: modelName,
            operation,
            schoolId: String(schoolId),
          },
        });
        Sentry.metrics.distribution('db.operation.duration', durationMs, {
          unit: 'millisecond',
          attributes: {
            model: modelName,
            operation,
            schoolId: String(schoolId),
          },
        });
      } catch (metricErr) {
        // Ignore Sentry metrics tracking errors
      }
    }
  };

  schema.pre('find', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('find', function (this: any) {
    trackQueryMetric.call(this, 'find');
    logSlowQuery.call(this);
  });

  schema.pre('findOne', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('findOne', function (this: any) {
    trackQueryMetric.call(this, 'findOne');
    logSlowQuery.call(this);
  });

  schema.pre('countDocuments', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('countDocuments', function (this: any) {
    trackQueryMetric.call(this, 'countDocuments');
    logSlowQuery.call(this);
  });

  schema.pre('estimatedDocumentCount', function (this: any) {
    recordStartTime.call(this);
    const queryOptions = this.getOptions();
    if (queryOptions && queryOptions.bypassTenant) {
      return;
    }
    const modelName = this.model?.modelName;
    if (modelName && GLOBAL_BYPASS_MODELS.includes(modelName)) {
      return;
    }
    const schoolId = TenantContext.getSchoolId();
    if (schoolId) {
      this.op = 'countDocuments';
      this.where({ schoolId: new Types.ObjectId(schoolId) });
    }
  });
  schema.post('estimatedDocumentCount', function (this: any) {
    trackQueryMetric.call(this, 'estimatedDocumentCount');
    logSlowQuery.call(this);
  });

  schema.pre('updateOne', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('updateOne', function (this: any) {
    trackQueryMetric.call(this, 'updateOne');
    logSlowQuery.call(this);
  });

  schema.pre('updateMany', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('updateMany', function (this: any) {
    trackQueryMetric.call(this, 'updateMany');
    logSlowQuery.call(this);
  });

  schema.pre('deleteOne', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('deleteOne', function (this: any) {
    trackQueryMetric.call(this, 'deleteOne');
    logSlowQuery.call(this);
  });

  schema.pre('deleteMany', function (this: any) {
    recordStartTime.call(this);
    applyTenantFilter.call(this);
  });
  schema.post('deleteMany', function (this: any) {
    trackQueryMetric.call(this, 'deleteMany');
    logSlowQuery.call(this);
  });

  // 3. Intercept Aggregations
  schema.pre('aggregate', function (this: any) {
    recordStartTime.call(this);
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
        $match: { schoolId: new Types.ObjectId(schoolId) },
      });
    }
  });
  schema.post('aggregate', function (this: any) {
    trackQueryMetric.call(this, 'aggregate');
    if (this._startTime) {
      const durationMs = Date.now() - this._startTime;
      if (durationMs > 100) {
        const modelName = this._model?.modelName || 'unknown';
        logger.warn({
          message: `Slow query detected on collection '${modelName}' (Aggregate) - Duration: ${durationMs}ms`,
          collection: modelName,
          durationMs,
          op: 'aggregate',
        });
      }
    }
  });

  // 4. Populate schoolId on document save/create
  schema.pre('save', function (this: any) {
    recordStartTime.call(this);
    const modelName = this.constructor.modelName;
    if (modelName && isBypassedModel(modelName)) {
      return;
    }

    const schoolId = TenantContext.getSchoolId();
    if (schoolId && !this.schoolId) {
      this.schoolId = new Types.ObjectId(schoolId);
    }
  });
  schema.post('save', function (this: any) {
    trackQueryMetric.call(this, 'save');
  });
}
