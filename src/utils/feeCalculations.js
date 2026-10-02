// HYVE Platform Fee Structure & Calculations
// Matches backend FeeCalculationService exactly

export const SUPPLIER_BASE_INSPECTION_FEE = 5000;
export const HYVE_INSPECTION_SHARE = 1450;
export const TOTAL_INSPECTION_FEE = 6450;

export const INSPECTION_FEE_TIERS = {
  STANDARD: {
    category: "STANDARD",
    label: "Physical Property Inspection",
    totalFee: 6450,
    supplierBaseFee: 5000,
    hyveShare: 1450,
  },
  SELF_CONTAINED_TO_2BED: {
    category: "STANDARD",
    label: "Physical Property Inspection",
    totalFee: 6450,
    supplierBaseFee: 5000,
    hyveShare: 1450,
  },
  THREE_TO_FIVE_BEDROOM: {
    category: "STANDARD",
    label: "Physical Property Inspection",
    totalFee: 6450,
    supplierBaseFee: 5000,
    hyveShare: 1450,
  },
  ENTIRE_HOUSE: {
    category: "STANDARD",
    label: "Physical Property Inspection",
    totalFee: 6450,
    supplierBaseFee: 5000,
    hyveShare: 1450,
  },
};

export const HYVE_SERVICE_FEE_RATES = {
  FIRST_YEAR: 0.05, // 5% for first year
  RENEWAL: 0.02, // 2% for renewal years
};

/**
 * Calculates dynamic inspection fee breakdown for a property or queue object:
 * Total: ₦6,450 (₦5,000 Agent/Caretaker Logistics + ₦1,450 HYVE Platform Share)
 */
export function calculateInspectionFee(property) {
  if (!property) {
    return INSPECTION_FEE_TIERS.STANDARD;
  }

  // Check if backend already sent the inspection fee fields
  if (property.inspectionFee != null) {
    const total = Number(property.inspectionFee);
    const supplier = Number(
      property.supplierInspectionShare || SUPPLIER_BASE_INSPECTION_FEE,
    );
    const hyve = Number(property.hyveInspectionShare ?? (total - supplier));

    return {
      category: "STANDARD",
      label: "Physical Property Inspection",
      totalFee: total,
      supplierBaseFee: supplier,
      hyveShare: hyve,
    };
  }

  return INSPECTION_FEE_TIERS.STANDARD;
}

/**
 * Calculates the complete Supplier Rent Package + HYVE Service Fee (5% or 2%)
 */
export function calculateRentPackage(property, isRenewal = false) {
  if (!property) {
    return {
      houseRent: 0,
      serviceCharge: 0,
      legalFee: 0,
      agencyFee: 0,
      cautionFee: 0,
      supplierPackageTotal: 0,
      hyveServiceFeeRate: isRenewal
        ? HYVE_SERVICE_FEE_RATES.RENEWAL
        : HYVE_SERVICE_FEE_RATES.FIRST_YEAR,
      hyveServiceFee: 0,
      totalPayable: 0,
      isRenewal,
    };
  }

  // If backend pre-calculated rentPackage is attached, use it
  if (property.rentPackage) {
    const rp = property.rentPackage;
    return {
      houseRent: Number(rp.houseRent || 0),
      serviceCharge: Number(rp.serviceCharge || 0),
      legalFee: Number(rp.legalFee || 0),
      agencyFee: Number(rp.agencyFee || 0),
      cautionFee: Number(rp.cautionFee || 0),
      supplierPackageTotal: Number(rp.supplierPackageTotal || 0),
      hyveServiceFeeRate: Number(
        rp.hyveServiceFeeRate || (isRenewal ? 0.02 : 0.05),
      ),
      hyveServiceFee: Number(rp.hyveServiceFee || 0),
      totalPayable: Number(rp.totalPayable || 0),
      isRenewal: Boolean(rp.isRenewal),
    };
  }

  // Calculate based on property fields
  const houseRent = Number(
    property.priceAnnually ??
      property.raw?.priceAnnually ??
      (property.price ? property.price * 12 : 0) ??
      (property.lodgePrice ? property.lodgePrice * 12 : 0),
  );

  const serviceCharge = Number(
    property.serviceCharge ?? property.raw?.serviceCharge ?? 0,
  );

  // 10% standard defaults if not explicitly set
  const legalFee = Number(
    property.legalFee ?? property.raw?.legalFee ?? Math.round(houseRent * 0.1),
  );

  const agencyFee = Number(
    property.agencyFee ??
      property.raw?.agencyFee ??
      Math.round(houseRent * 0.1),
  );

  const cautionFee = Number(
    property.cautionFee ??
      property.raw?.cautionFee ??
      Math.round(houseRent * 0.1),
  );

  const supplierPackageTotal =
    houseRent + serviceCharge + legalFee + agencyFee + cautionFee;

  const rate = isRenewal
    ? HYVE_SERVICE_FEE_RATES.RENEWAL
    : HYVE_SERVICE_FEE_RATES.FIRST_YEAR;
  const hyveServiceFee = Math.round(houseRent * rate);
  const totalPayable = supplierPackageTotal + hyveServiceFee;

  return {
    houseRent,
    serviceCharge,
    legalFee,
    agencyFee,
    cautionFee,
    supplierPackageTotal,
    hyveServiceFeeRate: rate,
    hyveServiceFee,
    totalPayable,
    isRenewal,
  };
}

/**
 * Currency formatter for Nigerian Naira (₦)
 */
export function formatNaira(val) {
  if (val == null || isNaN(Number(val))) return "₦ 0";
  return `₦ ${Math.round(Number(val)).toLocaleString()}`;
}
