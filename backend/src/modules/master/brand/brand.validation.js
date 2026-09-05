const mongoose = require("mongoose");

// -----------------------------------------
// Create Brand Validation
// -----------------------------------------

const validateCreateBrand = (data) => {
  const errors = {};

  if (!data.brandCode) {
    errors.brandCode = "Brand code is required";
  } else if (
    typeof data.brandCode !== "string" ||
    !data.brandCode.trim()
  ) {
    errors.brandCode = "Brand code must be a valid string";
  }

  if (!data.brandName) {
    errors.brandName = "Brand name is required";
  } else if (
    typeof data.brandName !== "string" ||
    !data.brandName.trim()
  ) {
    errors.brandName = "Brand name must be a valid string";
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

// -----------------------------------------
// Update Brand Validation
// -----------------------------------------

const validateUpdateBrand = (data) => {
  const errors = {};

  if (
    data.brandCode !== undefined &&
    (
      typeof data.brandCode !== "string" ||
      !data.brandCode.trim()
    )
  ) {
    errors.brandCode = "Brand code must be a valid string";
  }

  if (
    data.brandName !== undefined &&
    (
      typeof data.brandName !== "string" ||
      !data.brandName.trim()
    )
  ) {
    errors.brandName = "Brand name must be a valid string";
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

// -----------------------------------------
// Object ID Validation
// -----------------------------------------

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// -----------------------------------------
// Export
// -----------------------------------------

module.exports = {
  validateCreateBrand,
  validateUpdateBrand,
  validateObjectId,
};