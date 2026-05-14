import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OPEN_PAYMENT_GATEWAY_EVENT } from '../../utils/paymentGateway';

export default function GlobalPaymentGatewayHost() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = (event) => {
      const detail = event.detail || {};
      navigate('/upgrade', {
        state: {
          requestedPlan: detail.planId || detail.requiredPlan || 'premium',
          requiredPlan: detail.requiredPlan || detail.planId || null,
          source: detail.source || 'upgrade',
        },
      });
    };

    window.addEventListener(OPEN_PAYMENT_GATEWAY_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_PAYMENT_GATEWAY_EVENT, handleOpen);
  }, [navigate]);

  return null;
}
