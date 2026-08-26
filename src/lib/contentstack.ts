import contentstack from '@contentstack/delivery-sdk';

export const Stack = contentstack.stack({
  apiKey: process.env.CONTENTSTACK_API_KEY!,
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: 'development',
});