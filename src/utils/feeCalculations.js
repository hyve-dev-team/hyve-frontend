// HYVE Platform Fee Structure & Calculations
// Matches backend FeeCalculationService exactly

export const SUPPLIER_BASE_INSPECTION_FEE = 5000;

export const INSPECTION_FEE_TIERS = {
  SELF_CONTAINED_TO_2BED: {
    category: "SELF_CONTAINED_TO_2BED",
    label: "Self-contained to 2 Bedroom",
    totalFee: 10000,
    supplierBaseFee: 5000,
    hyveShare: 5000,
  },
  THREE_TO_FIVE_BEDROOM: {
    category: "3_TO_5_BEDROOM",
    label: "3 Bedroom to 5 Bedroom",
    totalFee: 12000,
    supplierBaseFee: 5000,
    hyveShare: 7000,
  },
  ENTIRE_HOUSE: {
    category: "ENTIRE_HOUSE",
    label: "Entire House",
    totalFee: 15000,
    supplierBaseFee: 5000,
    hyveShare: 10000,
  },
};

export const HYVE_SERVICE_FEE_RATES = {
  FIRST_YEAR: 0.05, // 5% for first year
  RENEWAL: 0.02, // 2% for renewal years
};

/**
 * Calculates dynamic inspection fee breakdown for a property or queue object
 */
export function calculateInspectionFee(property) {
  if (!property) {
    return INSPECTION_FEE_TIERS.SELF_CONTAINED_TO_2BED;
  }

  // Check if backend already sent the inspection fee fields
  if (property.inspectionFee != null) {
    const total = Number(property.inspectionFee);
    const supplier = Number(
      property.supplierInspectionShare || SUPPLIER_BASE_INSPECTION_FEE,
    );
    const hyve = Number(property.hyveInspectionShare || total - supplier);
    let cat = "SELF_CONTAINED_TO_2BED";
    if (total >= 15000) cat = "ENTIRE_HOUSE";
    else if (total >= 12000) cat = "3_TO_5_BEDROOM";

    return {
      category: cat,
      label: INSPECTION_FEE_TIERS[cat]?.label || "Inspection Fee",
      totalFee: total,
      supplierBaseFee: supplier,
      hyveShare: hyve,
    };
  }

  const rawType = (property.propertyType || property.raw?.propertyType || "")
    .toString()
    .toUpperCase();
  const title = (
    property.lodgeDesc ||
    property.title ||
    property.property ||
    ""
  )
    .toString()
    .toLowerCase();
  const bedrooms = property.bedrooms ?? property.raw?.bedrooms ?? null;
  const size = property.propertySize ?? property.raw?.propertySize ?? null;

  // 1. Entire House (HOUSE type or > 5 bedrooms or > 120 sqm or title contains house / duplex / villa)
  if (
    rawType === "HOUSE" ||
    (bedrooms != null && bedrooms > 5) ||
    (size != null && size > 120) ||
    title.includes("entire house") ||
    title.includes("duplex") ||
    title.includes("mansion")
  ) {
    return INSPECTION_FEE_TIERS.ENTIRE_HOUSE;
  }

  // 2. 3 to 5 Bedroom (bedrooms 3..5 or size 61..120 or title contains 3 bed / 4 bed / 5 bed)
  if (
    (bedrooms != null && bedrooms >= 3 && bedrooms <= 5) ||
    (size != null && size > 60 && size <= 120) ||
    title.includes("3 bed") ||
    title.includes("4 bed") ||
    title.includes("5 bed") ||
    title.includes("3-bed") ||
    title.includes("4-bed") ||
    title.includes("5-bed") ||
    title.includes("3 bedroom") ||
    title.includes("4 bedroom") ||
    title.includes("5 bedroom")
  ) {
    return INSPECTION_FEE_TIERS.THREE_TO_FIVE_BEDROOM;
  }

  // 3. Default: Self-contained to 2 Bedroom
  return INSPECTION_FEE_TIERS.SELF_CONTAINED_TO_2BED;
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
