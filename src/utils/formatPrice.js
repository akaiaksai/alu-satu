const DEFAULT_RATE = 500; // KZT per 1 USD — chosen rate
const MAX_REASONABLE_USD = 20000;

export default function formatPrice(value) {
  if (value === undefined || value === null || isNaN(Number(value))) return "";
  const num = Number(value);
  const isProbablyKzt = num > MAX_REASONABLE_USD;
  // read rate from localStorage if set, otherwise use default
  let rate = DEFAULT_RATE;
  try {
    const r = localStorage.getItem('currencyRate');
    if (r) {
      const parsed = Number(r);
      if (!isNaN(parsed) && parsed > 0) rate = parsed;
    }
  } catch {
    rate = DEFAULT_RATE;
  }

  const amountKzt = Math.round(isProbablyKzt ? num : num * rate);
  return new Intl.NumberFormat('ru-RU').format(amountKzt) + ' ₸';
}

export function setCurrencyRate(rate) {
  try {
    if (!isNaN(Number(rate)) && Number(rate) > 0) {
      localStorage.setItem('currencyRate', String(Number(rate)));
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
