const Attribute = require("./attribute.model");

const {
  validateCreateAttribute,
  validateUpdateAttribute,
  validateObjectId,
} = require("./attribute.validation");

// -----------------------------------------
// Escape Regex
// -----------------------------------------

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// -----------------------------------------
// Create Attribute
// -----------------------------------------

const createAttribute = async (data, user) => {
  const validation =
    validateCreateAttribute(data);

  if (!validation.isValid) {
    const error = new Error(
      "Validation failed"
    );

    error.statusCode = 400;
    error.errors = validation.errors;

    throw error;
  }

  const attributeCode =
    data.attributeCode
      .trim()
      .toUpperCase();

  const attributeName =
    data.attributeName.trim();

  // ---------------------------------------
  // Duplicate Attribute Code
  // ---------------------------------------

  const existingCode =
    await Attribute.findOne({
      attributeCode,
    });

  if (existingCode) {
    const error = new Error(
      "Attribute code already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------
  // Duplicate Attribute Name
  // ---------------------------------------

  const existingName =
    await Attribute.findOne({
      attributeName: {
        $regex: `^${escapeRegex(
          attributeName
        )}$`,
        $options: "i",
      },
    });

  if (existingName) {
    const error = new Error(
      "Attribute name already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------
  // Normalize Values
  // ---------------------------------------

  const values =
    (data.values || []).map((item) => ({
      value: item.value.trim(),
      status: item.status || "active",
    }));

  // ---------------------------------------
  // Create Attribute
  // ---------------------------------------

  const attribute =
    await Attribute.create({
      attributeCode,
      attributeName,

      displayType:
        data.displayType || "dropdown",

      values,

      status:
        data.status || "active",

      createdBy:
        user?._id || null,
    });

  return attribute;
};

// -----------------------------------------
// Get Attributes
// -----------------------------------------

const getAttributes = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    displayType,
  } = query;

  const pageNumber = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(
      parseInt(limit, 10) || 10,
      1
    ),
    100
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const filter = {};

  // ---------------------------------------
  // Search
  // ---------------------------------------

  if (search && search.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(search.trim()),
      "i"
    );

    filter.$or = [
      {
        attributeCode: searchRegex,
      },
      {
        attributeName: searchRegex,
      },
      {
        "values.value": searchRegex,
      },
    ];
  }

  // ---------------------------------------
  // Status Filter
  // ---------------------------------------

  if (status) {
    filter.status = status;
  }

  // ---------------------------------------
  // Display Type Filter
  // ---------------------------------------

  if (displayType) {
    filter.displayType =
      displayType;
  }

  // ---------------------------------------
  // Fetch Data
  // ---------------------------------------

  const [
    attributes,
    total,
  ] = await Promise.all([
    Attribute.find(filter)
      .populate(
        "createdBy",
        "firstName lastName email"
      )
      .populate(
        "updatedBy",
        "firstName lastName email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Attribute.countDocuments(filter),
  ]);

  return {
    attributes,

    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------

const getAttributeById = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid attribute ID"
    );

    error.statusCode = 400;

    throw error;
  }

  const attribute =
    await Attribute.findById(id)
      .populate(
        "createdBy",
        "firstName lastName email"
      )
      .populate(
        "updatedBy",
        "firstName lastName email"
      );

  if (!attribute) {
    const error = new Error(
      "Attribute not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return attribute;
};

// -----------------------------------------
// Update Attribute
// -----------------------------------------

const updateAttribute = async (
  id,
  data,
  user
) => {
  // ---------------------------------------
  // Validate ID
  // ---------------------------------------

  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid attribute ID"
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------------
  // Validate Data
  // ---------------------------------------

  const validation =
    validateUpdateAttribute(data);

  if (!validation.isValid) {
    const error = new Error(
      "Validation failed"
    );

    error.statusCode = 400;
    error.errors = validation.errors;

    throw error;
  }

  // ---------------------------------------
  // Find Attribute
  // ---------------------------------------

  const attribute =
    await Attribute.findById(id);

  if (!attribute) {
    const error = new Error(
      "Attribute not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------------
  // Attribute Code
  // ---------------------------------------

  if (
    data.attributeCode !== undefined
  ) {
    const attributeCode =
      data.attributeCode
        .trim()
        .toUpperCase();

    const existingCode =
      await Attribute.findOne({
        attributeCode,

        _id: {
          $ne: id,
        },
      });

    if (existingCode) {
      const error = new Error(
        "Attribute code already exists"
      );

      error.statusCode = 409;

      throw error;
    }

    attribute.attributeCode =
      attributeCode;
  }

  // ---------------------------------------
  // Attribute Name
  // ---------------------------------------

  if (
    data.attributeName !== undefined
  ) {
    const attributeName =
      data.attributeName.trim();

    const existingName =
      await Attribute.findOne({
        attributeName: {
          $regex: `^${escapeRegex(
            attributeName
          )}$`,
          $options: "i",
        },

        _id: {
          $ne: id,
        },
      });

    if (existingName) {
      const error = new Error(
        "Attribute name already exists"
      );

      error.statusCode = 409;

      throw error;
    }

    attribute.attributeName =
      attributeName;
  }

  // ---------------------------------------
  // Display Type
  // ---------------------------------------

  if (
    data.displayType !== undefined
  ) {
    attribute.displayType =
      data.displayType;
  }

  // ---------------------------------------
  // Values
  // ---------------------------------------

  if (data.values !== undefined) {
    attribute.values =
      data.values.map((item) => ({
        value: item.value.trim(),
        status:
          item.status || "active",
      }));
  }

  // ---------------------------------------
  // Status
  // ---------------------------------------

  if (data.status !== undefined) {
    attribute.status =
      data.status;
  }

  // ---------------------------------------
  // Updated By
  // ---------------------------------------

  attribute.updatedBy =
    user?._id || null;

  await attribute.save();

  return attribute;
};

// -----------------------------------------
// Update Attribute Status
// -----------------------------------------

const updateAttributeStatus = async (
  id,
  status,
  user
) => {
  // Validate ID
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid attribute ID"
    );

    error.statusCode = 400;

    throw error;
  }

  // Validate Status
  if (
    !["active", "inactive"].includes(
      status
    )
  ) {
    const error = new Error(
      "Status must be either active or inactive"
    );

    error.statusCode = 400;

    throw error;
  }

  // Find Attribute
  const attribute =
    await Attribute.findById(id);

  if (!attribute) {
    const error = new Error(
      "Attribute not found"
    );

    error.statusCode = 404;

    throw error;
  }

  attribute.status = status;

  attribute.updatedBy =
    user?._id || null;

  await attribute.save();

  return attribute;
};

// -----------------------------------------
// Delete Attribute
// -----------------------------------------

const deleteAttribute = async (id) => {
  // Validate ID
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid attribute ID"
    );

    error.statusCode = 400;

    throw error;
  }

  // Find Attribute
  const attribute =
    await Attribute.findById(id);

  if (!attribute) {
    const error = new Error(
      "Attribute not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Product dependency check will be added
   * when Product module is implemented.
   */

  await Attribute.findByIdAndDelete(id);

  return true;
};

module.exports = {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  updateAttributeStatus,
  deleteAttribute,
};