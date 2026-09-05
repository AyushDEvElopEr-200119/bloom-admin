const mongoose = require("mongoose");

const SubCategory = require(
  "./subCategory.model"
);

const Category = require(
  "../category/category.model"
);

// ---------------------------------------
// Create Sub Category
// ---------------------------------------

const createSubCategory = async (
  data,
  userId
) => {
  const {
    subCategoryCode,
    subCategoryName,
    category,
    status,
  } = data;

  const normalizedCode =
    subCategoryCode
      .trim()
      .toUpperCase();

  const normalizedName =
    subCategoryName.trim();

  // ---------------------------------------
  // Check duplicate code
  // ---------------------------------------

  const existingCode =
    await SubCategory.findOne({
      subCategoryCode:
        normalizedCode,
    });

  if (existingCode) {
    throw new Error(
      "Sub category code already exists"
    );
  }

  // ---------------------------------------
  // Check parent category
  // ---------------------------------------

  const parentCategory =
    await Category.findById(category);

  if (!parentCategory) {
    throw new Error(
      "Category not found"
    );
  }

  if (
    parentCategory.status !==
    "active"
  ) {
    throw new Error(
      "Inactive category cannot be selected"
    );
  }

  // ---------------------------------------
  // Duplicate name inside category
  // ---------------------------------------

  const existingName =
    await SubCategory.findOne({
      subCategoryName:
        normalizedName,
      category,
    });

  if (existingName) {
    throw new Error(
      "Sub category name already exists under this category"
    );
  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  const subCategory =
    await SubCategory.create({
      subCategoryCode:
        normalizedCode,

      subCategoryName:
        normalizedName,

      category:
        parentCategory._id,

      status:
        status || "active",

      createdBy:
        userId || null,

      updatedBy:
        userId || null,
    });

  return SubCategory.findById(
    subCategory._id
  )
    .populate(
      "category",
      "categoryCode categoryName status"
    )
    .populate(
      "createdBy",
      "firstName lastName email"
    );
};

// ---------------------------------------
// Get all Sub Categories
// ---------------------------------------

const getSubCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  category,
}) => {
  page = Number(page);
  limit = Number(limit);

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }

  const skip =
    (page - 1) * limit;

  const filter = {};

  // ---------------------------------------
  // Search
  // ---------------------------------------

  if (search.trim()) {
    filter.$or = [
      {
        subCategoryCode: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        subCategoryName: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // ---------------------------------------
  // Status
  // ---------------------------------------

  if (status) {
    filter.status = status;
  }

  // ---------------------------------------
  // Category
  // ---------------------------------------

  if (
    category &&
    mongoose.Types.ObjectId.isValid(
      category
    )
  ) {
    filter.category = category;
  }

  const [
    subCategories,
    total,
  ] = await Promise.all([
    SubCategory.find(filter)
      .populate(
        "category",
        "categoryCode categoryName status"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    SubCategory.countDocuments(
      filter
    ),
  ]);

  return {
    subCategories,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(total / limit),

      hasNextPage:
        page <
        Math.ceil(total / limit),

      hasPreviousPage:
        page > 1,
    },
  };
};

// ---------------------------------------
// Get by ID
// ---------------------------------------

const getSubCategoryById = async (
  subCategoryId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      subCategoryId
    )
  ) {
    throw new Error(
      "Invalid sub category ID"
    );
  }

  const subCategory =
    await SubCategory.findById(
      subCategoryId
    )
      .populate(
        "category",
        "categoryCode categoryName status"
      )
      .populate(
        "createdBy",
        "firstName lastName email"
      )
      .populate(
        "updatedBy",
        "firstName lastName email"
      );

  if (!subCategory) {
    throw new Error(
      "Sub category not found"
    );
  }

  return subCategory;
};

// ---------------------------------------
// Update
// ---------------------------------------

const updateSubCategory =
  async (
    subCategoryId,
    data,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        subCategoryId
      )
    ) {
      throw new Error(
        "Invalid sub category ID"
      );
    }

    const subCategory =
      await SubCategory.findById(
        subCategoryId
      );

    if (!subCategory) {
      throw new Error(
        "Sub category not found"
      );
    }

    // -----------------------------------
    // Code
    // -----------------------------------

    if (
      data.subCategoryCode
    ) {
      const normalizedCode =
        data.subCategoryCode
          .trim()
          .toUpperCase();

      const duplicateCode =
        await SubCategory.findOne({
          subCategoryCode:
            normalizedCode,

          _id: {
            $ne: subCategoryId,
          },
        });

      if (duplicateCode) {
        throw new Error(
          "Sub category code already exists"
        );
      }

      subCategory.subCategoryCode =
        normalizedCode;
    }

    // -----------------------------------
    // Category
    // -----------------------------------

    let categoryId =
      subCategory.category;

    if (
      data.category !== undefined
    ) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.category
        )
      ) {
        throw new Error(
          "Invalid category ID"
        );
      }

      const parentCategory =
        await Category.findById(
          data.category
        );

      if (!parentCategory) {
        throw new Error(
          "Category not found"
        );
      }

      if (
        parentCategory.status !==
        "active"
      ) {
        throw new Error(
          "Inactive category cannot be selected"
        );
      }

      subCategory.category =
        parentCategory._id;

      categoryId =
        parentCategory._id;
    }

    // -----------------------------------
    // Name
    // -----------------------------------

    if (
      data.subCategoryName
    ) {
      const normalizedName =
        data.subCategoryName.trim();

      const duplicateName =
        await SubCategory.findOne({
          subCategoryName:
            normalizedName,

          category:
            categoryId,

          _id: {
            $ne: subCategoryId,
          },
        });

      if (duplicateName) {
        throw new Error(
          "Sub category name already exists under this category"
        );
      }

      subCategory.subCategoryName =
        normalizedName;
    }

    // -----------------------------------
    // Status
    // -----------------------------------

    if (data.status) {
      subCategory.status =
        data.status;
    }

    subCategory.updatedBy =
      userId || null;

    await subCategory.save();

    return SubCategory.findById(
      subCategory._id
    )
      .populate(
        "category",
        "categoryCode categoryName status"
      )
      .populate(
        "updatedBy",
        "firstName lastName email"
      );
  };

// ---------------------------------------
// Update Status
// ---------------------------------------

const updateSubCategoryStatus =
  async (
    subCategoryId,
    status,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        subCategoryId
      )
    ) {
      throw new Error(
        "Invalid sub category ID"
      );
    }

    if (
      !["active", "inactive"].includes(
        status
      )
    ) {
      throw new Error(
        "Status must be active or inactive"
      );
    }

    const subCategory =
      await SubCategory.findById(
        subCategoryId
      );

    if (!subCategory) {
      throw new Error(
        "Sub category not found"
      );
    }

    subCategory.status =
      status;

    subCategory.updatedBy =
      userId || null;

    await subCategory.save();

    return SubCategory.findById(
      subCategory._id
    ).populate(
      "category",
      "categoryCode categoryName status"
    );
  };

// ---------------------------------------
// Delete
// ---------------------------------------

const deleteSubCategory =
  async (
    subCategoryId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        subCategoryId
      )
    ) {
      throw new Error(
        "Invalid sub category ID"
      );
    }

    const subCategory =
      await SubCategory.findById(
        subCategoryId
      );

    if (!subCategory) {
      throw new Error(
        "Sub category not found"
      );
    }

    await SubCategory.findByIdAndDelete(
      subCategoryId
    );

    return true;
  };

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryStatus,
  deleteSubCategory,
};