import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const isOtelEnabled =
  process.env.OTEL_ENABLED === 'true' ||
  !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

let sdk: NodeSDK | null = null;

// Ensure this script is run before anything else is imported in main.ts
if (isOtelEnabled) {
  const exporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  sdk = new NodeSDK({
    serviceName: 'school-management-backend',
    traceExporter: new OTLPTraceExporter(exporterUrl ? { url: exporterUrl } : undefined),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}

process.on('SIGTERM', () => {
  if (sdk) {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  } else {
    process.exit(0);
  }
});
