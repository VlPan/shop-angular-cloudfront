export type ApiEndpoint = 'product' | 'order' | 'import' | 'bff' | 'cart' | 'appConfig';

export interface Config {
  production: boolean;
  apiEndpoints: Record<ApiEndpoint, string>;
  apiEndpointsEnabled: Record<ApiEndpoint, boolean>;
  secrets: Record<string, string>;
}
