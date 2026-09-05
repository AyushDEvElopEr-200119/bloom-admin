const mongoose = require("mongoose");

const Brand = require("./brand.model");

const {
  validateCreateBrand,
  validateUpdateBrand,
  validateObjectId,
} = require("./brand.validation");

// -----------------------------------------
// Create Brand
// -----------------------------------------

const createBrand = async (data, user) => {
  const { isValid, errors } =
    validateCreateBrand(data);

  if (!isValid) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const brandCode =
    data.brandCode.trim().toUpperCase();

  const brandName =
    data.brandName.trim();

  // Check duplicate brand code
  const existingCode = await Brand.findOne({
    brandCode,
  });

  if (existingCode) {
    const error = new Error(
      "Brand code already exists"
    );
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate brand name
  const existingName = await Brand.findOne({
    brandName: {
      $regex: `^${escapeRegex(brandName)}$`,
      $options: "i",
    },
  });

  if (existingName) {
    const error = new Error(
      "Brand name already exists"
    );
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.create({
    brandCode,
    brandName,
    status: data.status || "active",
    createdBy: user?._id || null,
  });

  return brand;
};

// -----------------------------------------
// Get All Brands
// -----------------------------------------

const getBrands = async (query) => {
  const page = Math.max(
    parseInt(query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      parseInt(query.limit, 10) || 10,
      1
    ),
    100
  );

  const skip = (page - 1) * limit;

  const filter = {};

  // Search by code or name
  if (query.search) {
    const search = escapeRegex(
      query.search.trim()
    );

    filter.$or = [
      {
        brandCode: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brandName: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Filter by status
  if (query.status) {
    if (
      !["active", "inactive"].includes(
        query.status
      )
    ) {
      const error = new Error(
        "Invalid status"
      );
      error.statusCode = 400;
      throw error;
    }

    filter.status = query.status;
  }

  const [brands, total] =
    await Promise.all([
      Brand.find(filter)
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
        .limit(limit)
        .lean(),

      Brand.countDocuments(filter),
    ]);

  return {
    brands,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
};

// -----------------------------------------
// Get Brand By ID
// -----------------------------------------

const getBrandById = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid brand ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const brand = await Brand.findById(id)
    .populate(
      "createdBy",
      "name email"
    )
    .populate(
      "updatedBy",
      "name email"
    );

  if (!brand) {
    const error = new Error(
      "Brand not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return brand;
};

// -----------------------------------------
// Update Brand
// -----------------------------------------

const updateBrand = async (
  id,
  data,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid brand ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const { isValid, errors } =
    validateUpdateBrand(data);

  if (!isValid) {
    const error = new Error(
      "Validation failed"
    );
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const brand =
    await Brand.findById(id);

  if (!brand) {
    const error = new Error(
      "Brand not found"
    );
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // Brand Code
  // -----------------------------------------

  if (data.brandCode !== undefined) {
    const brandCode =
      data.brandCode
        .trim()
        .toUpperCase();

    const duplicateCode =
      await Brand.findOne({
        brandCode,
        _id: {
          $ne: id,
        },
      });

    if (duplicateCode) {
      const error = new Error(
        "Brand code already exists"
      );
      error.statusCode = 400;
      throw error;
    }

    brand.brandCode =
      brandCode;
  }

  // -----------------------------------------
  // Brand Name
  // -----------------------------------------

  if (data.brandName !== undefined) {
    const brandName =
      data.brandName.trim();

    const duplicateName =
      await Brand.findOne({
        brandName: {
          $regex: `^${escapeRegex(
            brandName
          )}$`,
          $options: "i",
        },
        _id: {
          $ne: id,
        },
      });

    if (duplicateName) {
      const error = new Error(
        "Brand name already exists"
      );
      error.statusCode = 400;
      throw error;
    }

    brand.brandName =
      brandName;
  }

  // -----------------------------------------
  // Status
  // -----------------------------------------

  if (data.status !== undefined) {
    brand.status =
      data.status;
  }

  brand.updatedBy =
    user?._id || null;

  await brand.save();

  return brand;
};

// -----------------------------------------
// Update Brand Status
// -----------------------------------------

const updateBrandStatus = async (
  id,
  status,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid brand ID"
    );
    error.statusCode = 400;
    throw error;
  }

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

  const brand =
    await Brand.findById(id);

  if (!brand) {
    const error = new Error(
      "Brand not found"
    );
    error.statusCode = 404;
    throw error;
  }

  brand.status = status;
  brand.updatedBy =
    user?._id || null;

  await brand.save();

  return brand;
};

// -----------------------------------------
// Delete Brand
// -----------------------------------------

const deleteBrand = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid brand ID"
    );
    error.statusCode = 400;
    throw error;
  }

  const brand =
    await Brand.findById(id);

  if (!brand) {
    const error = new Error(
      "Brand not found"
    );
    error.statusCode = 404;
    throw error;
  }

  // Product dependency check
  // Will be added when Product Master
  // is implemented.

  await Brand.findByIdAndDelete(id);

  return true;
};

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
// Export
// -----------------------------------------

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
};