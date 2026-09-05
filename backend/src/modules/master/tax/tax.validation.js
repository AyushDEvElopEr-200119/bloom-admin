const mongoose = require("mongoose");

const TAX_TYPES = [
  "percentage",
  "fixed",
];

const validateCreateTax = (data) => {
  const errors = {};

  // Tax Code
  if (!data.taxCode) {
    errors.taxCode = "Tax code is required";
  } else if (
    typeof data.taxCode !== "string" ||
    !data.taxCode.trim()
  ) {
    errors.taxCode = "Tax code must be a valid string";
  }

  // Tax Name
  if (!data.taxName) {
    errors.taxName = "Tax name is required";
  } else if (
    typeof data.taxName !== "string" ||
    !data.taxName.trim()
  ) {
    errors.taxName = "Tax name must be a valid string";
  }

  // Tax Rate
  if (data.taxRate === undefined || data.taxRate === null) {
    errors.taxRate = "Tax rate is required";
  } else if (
    typeof data.taxRate !== "number" ||
    Number.isNaN(data.taxRate)
  ) {
    errors.taxRate = "Tax rate must be a valid number";
  } else if (data.taxRate < 0) {
    errors.taxRate = "Tax rate cannot be negative";
  }

  // Tax Type
  if (!data.taxType) {
    errors.taxType = "Tax type is required";
  } else if (
    !TAX_TYPES.includes(
      String(data.taxType).toLowerCase()
    )
  ) {
    errors.taxType =
      "Tax type must be either percentage or fixed";
  }

  // Percentage maximum
  if (
    data.taxType &&
    String(data.taxType).toLowerCase() === "percentage" &&
    typeof data.taxRate === "number" &&
    data.taxRate > 100
  ) {
    errors.taxRate =
      "Percentage tax rate cannot exceed 100";
  }

  // Description
  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    errors.description =
      "Description must be a valid string";
  }

  // Status
  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.status =
      "Status must be either active or inactive";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateUpdateTax = (data) => {
  const errors = {};

  if (
    data.taxCode !== undefined &&
    (
      typeof data.taxCode !== "string" ||
      !data.taxCode.trim()
    )
  ) {
    errors.taxCode =
      "Tax code must be a valid string";
  }

  if (
    data.taxName !== undefined &&
    (
      typeof data.taxName !== "string" ||
      !data.taxName.trim()
    )
  ) {
    errors.taxName =
      "Tax name must be a valid string";
  }

  if (data.taxRate !== undefined) {
    if (
      typeof data.taxRate !== "number" ||
      Number.isNaN(data.taxRate)
    ) {
      errors.taxRate =
        "Tax rate must be a valid number";
    } else if (data.taxRate < 0) {
      errors.taxRate =
        "Tax rate cannot be negative";
    }
  }

  if (
    data.taxType !== undefined &&
    !TAX_TYPES.includes(
      String(data.taxType).toLowerCase()
    )
  ) {
    errors.taxType =
      "Tax type must be either percentage or fixed";
  }

  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    errors.description =
      "Description must be a valid string";
  }

  if (
    data.status !== undefined &&
    !["active", "inactive"].includes(data.status)
  ) {
    errors.status =
      "Status must be either active or inactive";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  validateCreateTax,
  validateUpdateTax,
  validateObjectId,
  TAX_TYPES,
};