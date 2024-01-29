// To Use the app you have to create environment.ts - for local development and environment.prod.ts for produciton deployment
// Thouse files will store secrete keys and APIs
// Examples:

import { Config } from './config.interface';

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product: 'endpoint',
    order: 'endpoint',
    import: 'endpoint',
    bff: 'endpoint',
    cart: 'endpoint',
    appConfig: 'config'
  },
  apiEndpointsEnabled: {
    product: true,
    order: false,
    import: false,
    bff: false,
    cart: false,
    appConfig: true,
  },
  secrets: {
    secret1: 'secret1'
  }
};
