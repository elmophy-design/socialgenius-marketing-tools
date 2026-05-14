export const OPEN_PAYMENT_GATEWAY_EVENT = 'socialgenius:open-payment-gateway';

export function openPaymentGateway(payload = {}) {
  window.dispatchEvent(
    new CustomEvent(OPEN_PAYMENT_GATEWAY_EVENT, {
      detail: payload,
    })
  );
}
