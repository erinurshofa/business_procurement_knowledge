import { FinancialItem, FinancialCalculation } from "@/types/procurement";

/**
 * Deterministic Financial Engine
 * Ensures 100% accurate, reproducible financial calculations for procurement documents (RAB, Remunerasi, PPN).
 * LLMs are forbidden from calculating final numbers.
 */

export function calculateRAB(items: FinancialItem[], ppnPercent: number = 11): FinancialCalculation {
  let personnelCostSubtotalIDR = 0;
  let nonPersonnelCostSubtotalIDR = 0;

  const calculatedItems = items.map((item) => {
    let subtotal = 0;
    if (item.category === "Personnel") {
      subtotal = item.quantity * item.durationMonths * item.billingRateIDR;
      personnelCostSubtotalIDR += subtotal;
    } else {
      subtotal = item.quantity * (item.durationMonths || 1) * item.billingRateIDR;
      nonPersonnelCostSubtotalIDR += subtotal;
    }
    return {
      ...item,
      subtotalIDR: subtotal,
    };
  });

  const directCostSubtotalIDR = personnelCostSubtotalIDR + nonPersonnelCostSubtotalIDR;
  const ppnAmountIDR = Math.round((directCostSubtotalIDR * ppnPercent) / 100);
  const grandTotalIDR = directCostSubtotalIDR + ppnAmountIDR;
  const terbilangText = terbilangIndonesian(grandTotalIDR) + " Rupiah";

  return {
    items: calculatedItems,
    personnelCostSubtotalIDR,
    nonPersonnelCostSubtotalIDR,
    directCostSubtotalIDR,
    ppnPercent,
    ppnAmountIDR,
    grandTotalIDR,
    terbilangIDR: terbilangText,
  };
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function terbilangIndonesian(nilai: number): string {
  const angka = Math.abs(nilai);
  const huruf = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  let temp = "";

  if (angka < 12) {
    temp = " " + huruf[angka];
  } else if (angka < 20) {
    temp = terbilangIndonesian(angka - 10) + " Belas";
  } else if (angka < 100) {
    temp = terbilangIndonesian(Math.floor(angka / 10)) + " Puluh" + terbilangIndonesian(angka % 10);
  } else if (angka < 200) {
    temp = " Seratus" + terbilangIndonesian(angka - 100);
  } else if (angka < 1000) {
    temp = terbilangIndonesian(Math.floor(angka / 100)) + " Ratus" + terbilangIndonesian(angka % 100);
  } else if (angka < 2000) {
    temp = " Seribu" + terbilangIndonesian(angka - 1000);
  } else if (angka < 1000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000)) + " Ribu" + terbilangIndonesian(angka % 1000);
  } else if (angka < 1000000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000000)) + " Juta" + terbilangIndonesian(angka % 1000000);
  } else if (angka < 1000000000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000000000)) + " Milyar" + terbilangIndonesian(angka % 1000000000);
  } else if (angka < 1000000000000000) {
    temp = terbilangIndonesian(Math.floor(angka / 1000000000000)) + " Triliun" + terbilangIndonesian(angka % 1000000000000);
  }

  return temp.trim();
}
