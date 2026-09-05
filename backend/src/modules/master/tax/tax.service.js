const Tax = require("./tax.model");

const {
  validateCreateTax,
  validateUpdateTax,
  validateObjectId,
} = require("./tax.validation");

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// -----------------------------------------
// Create Tax
// -----------------------------------------

const createTax = async (data, user) => {
  const validation = validateCreateTax(data);

  if (!validation.isValid) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const taxCode = data.taxCode
    .trim()
    .toUpperCase();

  const taxName = data.taxName.trim();

  const taxType = String(data.taxType)
    .trim()
    .toLowerCase();

  const taxRate = Number(data.taxRate);

  const description =
    data.description?.trim() || "";

  // Duplicate code
  const existingCode = await Tax.findOne({
    taxCode,
  });

  if (existingCode) {
    const error = new Error(
      "Tax code already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  // Duplicate name
  const existingName = await Tax.findOne({
    taxName: {
      $regex: `^${escapeRegex(taxName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error = new Error(
      "Tax name already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const tax = await Tax.create({
    taxCode,
    taxName,
    taxRate,
    taxType,
    description,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return tax;
};

// -----------------------------------------
// Get Taxes
// -----------------------------------------

const getTaxes = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    taxType,
  } = query;

  const pageNumber = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const filter = {};

  // Search
  if (search && search.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(search.trim()),
      "i"
    );

    filter.$or = [
      {
        taxCode: searchRegex,
      },
      {
        taxName: searchRegex,
      },
      {
        description: searchRegex,
      },
    ];
  }

  // Status
  if (status) {
    filter.status = status;
  }

  // Tax Type
  if (taxType) {
    filter.taxType = taxType.toLowerCase();
  }

  const [taxes, total] = await Promise.all([
    Tax.find(filter)
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Tax.countDocuments(filter),
  ]);

  return {
    taxes,
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
// Get Tax By ID
// -----------------------------------------

const getTaxById = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid tax ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id)
    .populate(
      "createdBy",
      "name email"
    )
    .populate(
      "updatedBy",
      "name email"
    );

  if (!tax) {
    const error = new Error(
      "Tax not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return tax;
};

// -----------------------------------------
// Update Tax
// -----------------------------------------

const updateTax = async (
  id,
  data,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid tax ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const validation = validateUpdateTax(data);

  if (!validation.isValid) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = validation.errors;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error = new Error(
      "Tax not found"
    );
    error.statusCode = 404;
    throw error;
  }

  // Determine final values
  const finalTaxType =
    data.taxType !== undefined
      ? String(data.taxType)
          .trim()
          .toLowerCase()
      : tax.taxType;

  const finalTaxRate =
    data.taxRate !== undefined
      ? Number(data.taxRate)
      : tax.taxRate;

  // Percentage validation
  if (
    finalTaxType === "percentage" &&
    finalTaxRate > 100
  ) {
    const error = new Error(
      "Percentage tax rate cannot exceed 100"
    );
    error.statusCode = 400;
    throw error;
  }

  // Tax Code
  if (data.taxCode !== undefined) {
    const taxCode = data.taxCode
      .trim()
      .toUpperCase();

    const existingCode =
      await Tax.findOne({
        taxCode,
        _id: {
          $ne: id,
        },
      });

    if (existingCode) {
      const error = new Error(
        "Tax code already exists"
      );
      error.statusCode = 409;
      throw error;
    }

    tax.taxCode = taxCode;
  }

  // Tax Name
  if (data.taxName !== undefined) {
    const taxName = data.taxName.trim();

    const existingName =
      await Tax.findOne({
        taxName: {
          $regex: `^${escapeRegex(taxName)}$`,
          $options: "i",
        },
        _id: {
          $ne: id,
        },
      });

    if (existingName) {
      const error = new Error(
        "Tax name already exists"
      );
      error.statusCode = 409;
      throw error;
    }

    tax.taxName = taxName;
  }

  // Tax Rate
  if (data.taxRate !== undefined) {
    tax.taxRate = finalTaxRate;
  }

  // Tax Type
  if (data.taxType !== undefined) {
    tax.taxType = finalTaxType;
  }

  // Description
  if (data.description !== undefined) {
    tax.description =
      data.description.trim();
  }

  // Status
  if (data.status !== undefined) {
    tax.status = data.status;
  }

  tax.updatedBy = user?._id || null;

  await tax.save();

  return tax;
};

// -----------------------------------------
// Update Tax Status
// -----------------------------------------

const updateTaxStatus = async (
  id,
  status,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid tax ID"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !["active", "inactive"].includes(status)
  ) {
    const error = new Error(
      "Status must be either active or inactive"
    );
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error = new Error(
      "Tax not found"
    );
    error.statusCode = 404;
    throw error;
  }

  tax.status = status;
  tax.updatedBy = user?._id || null;

  await tax.save();

  return tax;
};

// -----------------------------------------
// Delete Tax
// -----------------------------------------

const deleteTax = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid tax ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const tax = await Tax.findById(id);

  if (!tax) {
    const error = new Error(
      "Tax not found"
    );
    error.statusCode = 404;
    throw error;
  }

  /*
   * Product dependency check will be added
   * after the Product module is created.
   */

  await Tax.findByIdAndDelete(id);

  return true;
};

module.exports = {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
};