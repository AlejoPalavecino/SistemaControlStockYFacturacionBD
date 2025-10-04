import { InvoiceItem, InvoiceTotals, IvaRate } from '../types/invoice.ts';

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Calculates net and VAT from a price that includes VAT.
 */
export const fromPriceWithVAT = (priceWithVAT: number, rate: IvaRate): { net: number; iva: number } => {
  if (rate === 0) {
    return { net: round(priceWithVAT), iva: 0 };
  }
  const net = round(priceWithVAT / (1 + rate / 100));
  const iva = round(priceWithVAT - net);
  return { net, iva };
};

/**
 * Sums up totals for a list of invoice items.
 */
export const sumTotals = (items: InvoiceItem[]): InvoiceTotals => {
  let totalNetARS = 0;
  let totalIvaARS = 0;

  items.forEach(item => {
    const { net, iva } = fromPriceWithVAT(item.lineTotalARS, item.taxRate);
    totalNetARS += net;
    totalIvaARS += iva;
  });

  const totalARS = round(totalNetARS + totalIvaARS);

  return {
    netARS: round(totalNetARS),
    ivaARS: round(totalIvaARS),
    totalARS: totalARS,
  };
};