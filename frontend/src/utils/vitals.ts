import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

export function reportWebVitals() {
  onCLS((metric: Metric) => sendToAnalytics('CLS', metric));
  onINP((metric: Metric) => sendToAnalytics('INP', metric));
  onLCP((metric: Metric) => sendToAnalytics('LCP', metric));
  onTTFB((metric: Metric) => sendToAnalytics('TTFB', metric));
}

function sendToAnalytics(name: string, metric: any) {
  console.debug(`[WebVitals] ${name}:`, metric.value);
  // Send to backend or observability platform
}
