const mongoose = require("mongoose");

// -----------------------------------------
// Validate Attribute Values
// -----------------------------------------

const validateValues = (values, errors) => {
  if (values === undefined) {
    return;
  }

  if (!Array.isArray(values)) {
    errors.values = "Values must be an array";
    return;
  }

  const seenValues = new Set();

  values.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors[`values.${index}`] =
        "Attribute value must be an object";
      return;
    }

    if (
      typeof item.value !== "string" ||
      !item.value.trim()
    ) {
      errors[`values.${index}.value`] =
        "Attribute value must be a valid string";
    } else {
      const normalizedValue = item.value
        .trim()
        .toLowerCase();

      if (seenValues.has(normalizedValue)) {
        errors[`values.${index}.value`] =
          "Duplicate attribute value";
      }

      seenValues.add(normalizedValue);
    }

    if (
      item.status !== undefined &&
      !["active", "inactive"].includes(item.status)
    ) {
      errors[`values.${index}.status`] =
        "Value status must be either active or inactive";
    }
  });
};

// -----------------------------------------
// Create Attribute Validation
// -----------------------------------------

const validateCreateAttribute = (data) => {
  const errors = {};

  if (!data.attributeCode) {
    errors.attributeCode = "Attribute code is required";
  } else if (
    typeof data.attributeCode !== "string" ||
    !data.attributeCode.trim()
  ) {
    errors.attributeCode =
      "Attribute code must be a valid string";
  }

  if (!data.attributeName) {
    errors.attributeName = "Attribute name is required";
  } else if (
    typeof data.attributeName !== "string" ||
    !data.attributeName.trim()
  ) {
    errors.attributeName =
      "Attribute name must be a valid string";
  }

  if (
    data.displayType !== undefined &&
    ![
      "dropdown",
      "radio",
      "checkbox",
      "text",
      "color",
    ].includes(data.displayType)
  ) {
    errors.displayType =
      "Display type must be dropdown, radio, checkbox, text or color";
  }

  validateValues(data.values, errors);

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
// Update Attribute Validation
// -----------------------------------------

const validateUpdateAttribute = (data) => {
  const errors = {};

  if (
    data.attributeCode !== undefined &&
    (
      typeof data.attributeCode !== "string" ||
      !data.attributeCode.trim()
    )
  ) {
    errors.attributeCode =
      "Attribute code must be a valid string";
  }

  if (
    data.attributeName !== undefined &&
    (
      typeof data.attributeName !== "string" ||
      !data.attributeName.trim()
    )
  ) {
    errors.attributeName =
      "Attribute name must be a valid string";
  }

  if (
    data.displayType !== undefined &&
    ![
      "dropdown",
      "radio",
      "checkbox",
      "text",
      "color",
    ].includes(data.displayType)
  ) {
    errors.displayType =
      "Display type must be dropdown, radio, checkbox, text or color";
  }

  validateValues(data.values, errors);

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
// ObjectId Validation
// -----------------------------------------

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  validateCreateAttribute,
  validateUpdateAttribute,
  validateObjectId,
};