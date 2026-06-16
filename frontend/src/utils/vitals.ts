import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS((metric) => sendToAnalytics('CLS', metric));
  onFID((metric) => sendToAnalytics('FID', metric));
  onLCP((metric) => sendToAnalytics('LCP', metric));
  onTTFB((metric) => sendToAnalytics('TTFB', metric));
}

function sendToAnalytics(name: string, metric: any) {
  console.debug(`[WebVitals] ${name}:`, metric.value);
  // Send to backend or observability platform
}
