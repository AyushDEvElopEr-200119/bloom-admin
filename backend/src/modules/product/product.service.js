const mongoose = require("mongoose");
const Product = require("./product.model");

const Category = require("../master/category/category.model");
const SubCategory = require("../master/subCategory/subCategory.model");
const Brand = require("../master/brand/brand.model");
const Unit = require("../master/unit/unit.model");
const Tax = require("../master/tax/tax.model");
const Attribute = require("../master/attribute/attribute.model");

const {
  validateCreateProduct,
  validateUpdateProduct,
  validateObjectId,
} = require("./product.validation");

// =====================================================
// HELPERS
// =====================================================

const escapeRegex = (value = "") => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const createError = (
  message,
  statusCode = 400,
  errors = null
) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  if (errors) {
    error.errors = errors;
  }

  return error;
};

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const normalizeProductData = (data) => {
  const normalized = {
    ...data,
  };

  if (normalized.productCode) {
    normalized.productCode =
      normalizeString(
        normalized.productCode
      ).toUpperCase();
  }

  if (normalized.productName) {
    normalized.productName =
      normalizeString(
        normalized.productName
      );
  }

  if (normalized.hsnSacCode !== undefined) {
    normalized.hsnSacCode =
      normalizeString(
        normalized.hsnSacCode
      );
  }

  if (normalized.barcode !== undefined) {
    normalized.barcode =
      normalizeString(
        normalized.barcode
      );
  }

  if (normalized.slug) {
    normalized.slug =
      normalizeString(
        normalized.slug
      ).toLowerCase();
  }

  if (Array.isArray(normalized.metaKeywords)) {
    normalized.metaKeywords =
      normalized.metaKeywords
        .map((keyword) =>
          normalizeString(keyword)
        )
        .filter(Boolean);
  }

  if (Array.isArray(normalized.tags)) {
    normalized.tags =
      normalized.tags
        .map((tag) =>
          normalizeString(tag)
        )
        .filter(Boolean);
  }

  return normalized;
};

// =====================================================
// MASTER VALIDATION HELPERS
// =====================================================

const validateCategory = async (
  categoryId
) => {
  const category = await Category.findById(
    categoryId
  );

  if (!category) {
    throw createError(
      "Category not found.",
      404
    );
  }

  if (category.status !== "active") {
    throw createError(
      "Selected category is inactive.",
      400
    );
  }

  return category;
};

const validateSubCategory = async (
  subCategoryId,
  categoryId
) => {
  if (
    !subCategoryId ||
    !categoryId
  ) {
    return null;
  }

  const subCategory =
    await SubCategory.findById(
      subCategoryId
    );

  if (!subCategory) {
    throw createError(
      "Sub category not found.",
      404
    );
  }

  if (
    subCategory.status !== "active"
  ) {
    throw createError(
      "Selected sub category is inactive.",
      400
    );
  }

  if (
    subCategory.category.toString() !==
    categoryId.toString()
  ) {
    throw createError(
      "Selected sub category does not belong to the selected category.",
      400
    );
  }

  return subCategory;
};

const validateBrand = async (
  brandId
) => {
  if (!brandId) {
    return null;
  }

  const brand = await Brand.findById(
    brandId
  );

  if (!brand) {
    throw createError(
      "Brand not found.",
      404
    );
  }

  if (brand.status !== "active") {
    throw createError(
      "Selected brand is inactive.",
      400
    );
  }

  return brand;
};

const validateUnit = async (
  unitId
) => {
  const unit = await Unit.findById(
    unitId
  );

  if (!unit) {
    throw createError(
      "Unit not found.",
      404
    );
  }

  if (unit.status !== "active") {
    throw createError(
      "Selected unit is inactive.",
      400
    );
  }

  return unit;
};

const validateTax = async (
  taxId
) => {
  if (!taxId) {
    return null;
  }

  const tax = await Tax.findById(
    taxId
  );

  if (!tax) {
    throw createError(
      "Tax not found.",
      404
    );
  }

  if (tax.status !== "active") {
    throw createError(
      "Selected tax is inactive.",
      400
    );
  }

  return tax;
};

const validateAttributes = async (
  attributeIds
) => {
  if (
    !Array.isArray(attributeIds) ||
    attributeIds.length === 0
  ) {
    return [];
  }

  const uniqueIds = [
    ...new Set(
      attributeIds.map((id) =>
        id.toString()
      )
    ),
  ];

  const attributes =
    await Attribute.find({
      _id: {
        $in: uniqueIds,
      },
    });

  if (
    attributes.length !==
    uniqueIds.length
  ) {
    throw createError(
      "One or more selected attributes were not found.",
      404
    );
  }

  const inactiveAttributes =
    attributes.filter(
      (attribute) =>
        attribute.status !== "active"
    );

  if (inactiveAttributes.length > 0) {
    throw createError(
      "One or more selected attributes are inactive.",
      400
    );
  }

  return attributes;
};

// =====================================================
// VARIANT VALIDATION
// =====================================================

const validateVariantAttributeValues =
  async (
    variants,
    selectedAttributeIds
  ) => {
    if (
      !Array.isArray(variants) ||
      variants.length === 0
    ) {
      return;
    }

    if (
      !Array.isArray(
        selectedAttributeIds
      )
    ) {
      throw createError(
        "Product attributes are required when variants are used.",
        400
      );
    }

    const selectedIds = new Set(
      selectedAttributeIds.map((id) =>
        id.toString()
      )
    );

    const attributeDocuments =
      await Attribute.find({
        _id: {
          $in: [
            ...selectedIds,
          ],
        },
      });

    const attributeMap = new Map();

    attributeDocuments.forEach(
      (attribute) => {
        attributeMap.set(
          attribute._id.toString(),
          attribute
        );
      }
    );

    for (
      const variant of variants
    ) {
      if (
        !Array.isArray(
          variant.attributes
        )
      ) {
        continue;
      }

      for (
        const variantAttribute of
          variant.attributes
      ) {
        const attributeId =
          variantAttribute.attribute.toString();

        if (
          !selectedIds.has(
            attributeId
          )
        ) {
          throw createError(
            `Variant uses attribute ${attributeId} which is not selected for this product.`,
            400
          );
        }

        const attribute =
          attributeMap.get(
            attributeId
          );

        if (!attribute) {
          throw createError(
            "Variant references an attribute that does not exist.",
            404
          );
        }

        const matchingValue =
          attribute.values.find(
            (item) =>
              item.value
                .trim()
                .toLowerCase() ===
              variantAttribute.value
                .trim()
                .toLowerCase()
          );

        if (!matchingValue) {
          throw createError(
            `Value "${variantAttribute.value}" does not exist in attribute "${attribute.attributeName}".`,
            400
          );
        }

        if (
          matchingValue.status !==
          "active"
        ) {
          throw createError(
            `Value "${variantAttribute.value}" of attribute "${attribute.attributeName}" is inactive.`,
            400
          );
        }
      }
    }
  };

// =====================================================
// DUPLICATE CHECKS
// =====================================================

const checkProductCodeDuplicate =
  async (
    productCode,
    excludeId = null
  ) => {
    if (!productCode) {
      return;
    }

    const query = {
      productCode:
        productCode
          .trim()
          .toUpperCase(),
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await Product.findOne(query);

    if (existing) {
      throw createError(
        "Product code already exists.",
        409
      );
    }
  };

const checkSlugDuplicate =
  async (
    slug,
    excludeId = null
  ) => {
    if (!slug) {
      return;
    }

    const query = {
      slug: slug
        .trim()
        .toLowerCase(),
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await Product.findOne(query);

    if (existing) {
      throw createError(
        "Product slug already exists.",
        409
      );
    }
  };

const checkBarcodeDuplicate =
  async (
    barcode,
    excludeId = null
  ) => {
    if (!barcode) {
      return;
    }

    const query = {
      barcode: barcode.trim(),
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const existing =
      await Product.findOne(query);

    if (existing) {
      throw createError(
        "Product barcode already exists.",
        409
      );
    }
  };

const checkVariantSkuDuplicates =
  (variants) => {
    if (!Array.isArray(variants)) {
      return;
    }

    const skuSet = new Set();

    variants.forEach(
      (variant) => {
        if (!variant.sku) {
          return;
        }

        const sku =
          variant.sku
            .trim()
            .toUpperCase();

        if (skuSet.has(sku)) {
          throw createError(
            `Duplicate variant SKU "${sku}" found.`,
            409
          );
        }

        skuSet.add(sku);
      }
    );
  };

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (
  data,
  user
) => {
  const normalizedData =
    normalizeProductData(data);

  const validationErrors =
    validateCreateProduct(
      normalizedData
    );

  if (
    Object.keys(
      validationErrors
    ).length > 0
  ) {
    throw createError(
      "Product validation failed.",
      400,
      validationErrors
    );
  }

  // ---------------------------------------------------
  // Duplicate checks
  // ---------------------------------------------------

  await checkProductCodeDuplicate(
    normalizedData.productCode
  );

  await checkSlugDuplicate(
    normalizedData.slug
  );

  await checkBarcodeDuplicate(
    normalizedData.barcode
  );

  checkVariantSkuDuplicates(
    normalizedData.variants
  );

  // ---------------------------------------------------
  // Master validation
  // ---------------------------------------------------

  await validateCategory(
    normalizedData.category
  );

  await validateSubCategory(
    normalizedData.subCategory,
    normalizedData.category
  );

  await validateBrand(
    normalizedData.brand
  );

  await validateUnit(
    normalizedData.unit
  );

  await validateTax(
    normalizedData.tax
  );

  await validateAttributes(
    normalizedData.attributes
  );

  await validateVariantAttributeValues(
    normalizedData.variants,
    normalizedData.attributes
  );

  // ---------------------------------------------------
  // Create
  // ---------------------------------------------------

  const product =
    await Product.create({
      ...normalizedData,

      createdBy:
        user?._id || null,

      updatedBy:
        user?._id || null,
    });

  return await getProductById(
    product._id
  );
};

// =====================================================
// GET PRODUCTS
// =====================================================

const getProducts = async (
  query = {}
) => {
  let {
    page = 1,
    limit = 10,
    search = "",
    status,
    category,
    subCategory,
    brand,
    productType,
    isPublished,
    isFeatured,
    hasVariants,
  } = query;

  const pageNumber =
    Math.max(
      parseInt(page, 10) || 1,
      1
    );

  const limitNumber =
    Math.min(
      Math.max(
        parseInt(limit, 10) || 10,
        1
      ),
      100
    );

  const filter = {};

  // ---------------------------------------------------
  // Search
  // ---------------------------------------------------

  if (
    typeof search === "string" &&
    search.trim()
  ) {
    const searchRegex =
      new RegExp(
        escapeRegex(
          search.trim()
        ),
        "i"
      );

    filter.$or = [
      {
        productCode:
          searchRegex,
      },
      {
        productName:
          searchRegex,
      },
      {
        barcode:
          searchRegex,
      },
      {
        slug:
          searchRegex,
      },
      {
        tags:
          searchRegex,
      },
    ];
  }

  // ---------------------------------------------------
  // Filters
  // ---------------------------------------------------

  if (status) {
    filter.status = status;
  }

  if (category) {
    if (
      !mongoose.Types.ObjectId.isValid(
        category
      )
    ) {
      throw createError(
        "Invalid category filter.",
        400
      );
    }

    filter.category = category;
  }

  if (subCategory) {
    if (
      !mongoose.Types.ObjectId.isValid(
        subCategory
      )
    ) {
      throw createError(
        "Invalid sub category filter.",
        400
      );
    }

    filter.subCategory =
      subCategory;
  }

  if (brand) {
    if (
      !mongoose.Types.ObjectId.isValid(
        brand
      )
    ) {
      throw createError(
        "Invalid brand filter.",
        400
      );
    }

    filter.brand = brand;
  }

  if (productType) {
    filter.productType =
      productType;
  }

  if (
    isPublished !== undefined
  ) {
    filter.isPublished =
      isPublished === true ||
      isPublished === "true";
  }

  if (
    isFeatured !== undefined
  ) {
    filter.isFeatured =
      isFeatured === true ||
      isFeatured === "true";
  }

  if (
    hasVariants !== undefined
  ) {
    filter.hasVariants =
      hasVariants === true ||
      hasVariants === "true";
  }

  // ---------------------------------------------------
  // Query
  // ---------------------------------------------------

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    products,
    total,
  ] = await Promise.all([
    Product.find(filter)
      .populate(
        "category",
        "categoryCode categoryName status"
      )
      .populate(
        "subCategory",
        "subCategoryCode subCategoryName category status"
      )
      .populate(
        "brand",
        "brandCode brandName status"
      )
      .populate(
        "unit",
        "unitCode unitName symbol unitType status"
      )
      .populate(
        "tax",
        "taxCode taxName taxRate taxType status"
      )
      .populate(
        "attributes",
        "attributeCode attributeName displayType values status"
      )
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
      .limit(limitNumber),

    Product.countDocuments(filter),
  ]);

  return {
    products,

    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages:
        Math.ceil(
          total /
            limitNumber
        ),
    },
  };
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = async (
  id
) => {
  const idErrors =
    validateObjectId(
      id,
      "product ID"
    );

  if (
    Object.keys(idErrors)
      .length > 0
  ) {
    throw createError(
      "Invalid product ID.",
      400,
      idErrors
    );
  }

  const product =
    await Product.findById(id)
      .populate(
        "category",
        "categoryCode categoryName status"
      )
      .populate(
        "subCategory",
        "subCategoryCode subCategoryName category status"
      )
      .populate(
        "brand",
        "brandCode brandName status"
      )
      .populate(
        "unit",
        "unitCode unitName symbol unitType status"
      )
      .populate(
        "tax",
        "taxCode taxName taxRate taxType status"
      )
      .populate(
        "attributes",
        "attributeCode attributeName displayType values status"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      );

  if (!product) {
    throw createError(
      "Product not found.",
      404
    );
  }

  return product;
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (
  id,
  data,
  user
) => {
  const idErrors =
    validateObjectId(
      id,
      "product ID"
    );

  if (
    Object.keys(idErrors)
      .length > 0
  ) {
    throw createError(
      "Invalid product ID.",
      400,
      idErrors
    );
  }

  const existingProduct =
    await Product.findById(id);

  if (!existingProduct) {
    throw createError(
      "Product not found.",
      404
    );
  }

  const normalizedData =
    normalizeProductData(data);

  const validationErrors =
    validateUpdateProduct(
      normalizedData
    );

  if (
    Object.keys(
      validationErrors
    ).length > 0
  ) {
    throw createError(
      "Product validation failed.",
      400,
      validationErrors
    );
  }

  // ---------------------------------------------------
  // Build final values
  // ---------------------------------------------------

  const finalCategory =
    normalizedData.category !==
    undefined
      ? normalizedData.category
      : existingProduct.category;

  const finalSubCategory =
    normalizedData.subCategory !==
    undefined
      ? normalizedData.subCategory
      : existingProduct.subCategory;

  const finalBrand =
    normalizedData.brand !==
    undefined
      ? normalizedData.brand
      : existingProduct.brand;

  const finalUnit =
    normalizedData.unit !==
    undefined
      ? normalizedData.unit
      : existingProduct.unit;

  const finalTax =
    normalizedData.tax !==
    undefined
      ? normalizedData.tax
      : existingProduct.tax;

  const finalAttributes =
    normalizedData.attributes !==
    undefined
      ? normalizedData.attributes
      : existingProduct.attributes;

  const finalVariants =
    normalizedData.variants !==
    undefined
      ? normalizedData.variants
      : existingProduct.variants;

  const finalProductType =
    normalizedData.productType !==
    undefined
      ? normalizedData.productType
      : existingProduct.productType;

  const finalHasVariants =
    normalizedData.hasVariants !==
    undefined
      ? normalizedData.hasVariants
      : existingProduct.hasVariants;

  // ---------------------------------------------------
  // Duplicate checks
  // ---------------------------------------------------

  if (
    normalizedData.productCode !==
    undefined
  ) {
    await checkProductCodeDuplicate(
      normalizedData.productCode,
      id
    );
  }

  if (
    normalizedData.slug !==
    undefined
  ) {
    await checkSlugDuplicate(
      normalizedData.slug,
      id
    );
  }

  if (
    normalizedData.barcode !==
    undefined
  ) {
    await checkBarcodeDuplicate(
      normalizedData.barcode,
      id
    );
  }

  if (
    normalizedData.variants !==
    undefined
  ) {
    checkVariantSkuDuplicates(
      normalizedData.variants
    );
  }

  // ---------------------------------------------------
  // Master validation
  // ---------------------------------------------------

  await validateCategory(
    finalCategory
  );

  await validateSubCategory(
    finalSubCategory,
    finalCategory
  );

  await validateBrand(
    finalBrand
  );

  await validateUnit(
    finalUnit
  );

  await validateTax(
    finalTax
  );

  await validateAttributes(
    finalAttributes
  );

  await validateVariantAttributeValues(
    finalVariants,
    finalAttributes
  );

  // ---------------------------------------------------
  // Update
  // ---------------------------------------------------

  Object.assign(
    existingProduct,
    normalizedData
  );

  existingProduct.updatedBy =
    user?._id || null;

  await existingProduct.save();

  return await getProductById(
    existingProduct._id
  );
};

// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================

const updateProductStatus =
  async (
    id,
    status,
    user
  ) => {
    const idErrors =
      validateObjectId(
        id,
        "product ID"
      );

    if (
      Object.keys(idErrors)
        .length > 0
    ) {
      throw createError(
        "Invalid product ID.",
        400,
        idErrors
      );
    }

    if (
      !["active", "inactive"].includes(
        status
      )
    ) {
      throw createError(
        "Status must be active or inactive.",
        400
      );
    }

    const product =
      await Product.findById(id);

    if (!product) {
      throw createError(
        "Product not found.",
        404
      );
    }

    product.status = status;

    product.updatedBy =
      user?._id || null;

    await product.save();

    return await getProductById(
      product._id
    );
  };

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (
  id
) => {
  const idErrors =
    validateObjectId(
      id,
      "product ID"
    );

  if (
    Object.keys(idErrors)
      .length > 0
  ) {
    throw createError(
      "Invalid product ID.",
      400,
      idErrors
    );
  }

  const product =
    await Product.findById(id);

  if (!product) {
    throw createError(
      "Product not found.",
      404
    );
  }

  // ---------------------------------------------------
  // Inventory dependency will be checked here later.
  // ---------------------------------------------------

  await Product.findByIdAndDelete(
    id
  );

  return {
    message:
      "Product deleted successfully.",
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};