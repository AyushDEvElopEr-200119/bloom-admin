const mongoose = require("mongoose");

const Category = require("./category.model");

// ---------------------------------------
// Create Category
// ---------------------------------------

const createCategory = async (
  data,
  userId
) => {
  const {
    categoryCode,
    categoryName,
    parentCategory,
    status,
  } = data;

  // Check duplicate code
  const existingCode =
    await Category.findOne({
      categoryCode:
        categoryCode.trim().toUpperCase(),
    });

  if (existingCode) {
    throw new Error(
      "Category code already exists"
    );
  }

  // Check duplicate name
  const existingName =
    await Category.findOne({
      categoryName: categoryName.trim(),
    });

  if (existingName) {
    throw new Error(
      "Category name already exists"
    );
  }

  // Validate parent
  let parent = null;

  if (parentCategory) {
    parent =
      await Category.findById(
        parentCategory
      );

    if (!parent) {
      throw new Error(
        "Parent category not found"
      );
    }

    if (parent.status !== "active") {
      throw new Error(
        "Inactive category cannot be selected as parent"
      );
    }
  }

  const category =
    await Category.create({
      categoryCode:
        categoryCode.trim().toUpperCase(),

      categoryName:
        categoryName.trim(),

      parentCategory:
        parent ? parent._id : null,

      status:
        status || "active",

      createdBy:
        userId || null,

      updatedBy:
        userId || null,
    });

  return Category.findById(
    category._id
  )
    .populate(
      "parentCategory",
      "categoryCode categoryName"
    )
    .populate(
      "createdBy",
      "firstName lastName email"
    );
};

// ---------------------------------------
// Get Categories
// ---------------------------------------

const getCategories = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  parentCategory,
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

  // Search
  if (search.trim()) {
    filter.$or = [
      {
        categoryCode: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        categoryName: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // Status
  if (status) {
    filter.status = status;
  }

  // Parent
  if (parentCategory === "null") {
    filter.parentCategory = null;
  } else if (
    parentCategory &&
    mongoose.Types.ObjectId.isValid(
      parentCategory
    )
  ) {
    filter.parentCategory =
      parentCategory;
  }

  const [
    categories,
    total,
  ] = await Promise.all([
    Category.find(filter)
      .populate(
        "parentCategory",
        "categoryCode categoryName"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Category.countDocuments(filter),
  ]);

  return {
    categories,

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
// Get Single Category
// ---------------------------------------

const getCategoryById = async (
  categoryId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      categoryId
    )
  ) {
    throw new Error(
      "Invalid category ID"
    );
  }

  const category =
    await Category.findById(
      categoryId
    )
      .populate(
        "parentCategory",
        "categoryCode categoryName"
      )
      .populate(
        "createdBy",
        "firstName lastName email"
      )
      .populate(
        "updatedBy",
        "firstName lastName email"
      );

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  return category;
};

// ---------------------------------------
// Update Category
// ---------------------------------------

const updateCategory = async (
  categoryId,
  data,
  userId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      categoryId
    )
  ) {
    throw new Error(
      "Invalid category ID"
    );
  }

  const category =
    await Category.findById(
      categoryId
    );

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  // -----------------------------------
  // Category code
  // -----------------------------------

  if (data.categoryCode) {
    const code =
      data.categoryCode
        .trim()
        .toUpperCase();

    const duplicateCode =
      await Category.findOne({
        categoryCode: code,

        _id: {
          $ne: categoryId,
        },
      });

    if (duplicateCode) {
      throw new Error(
        "Category code already exists"
      );
    }

    category.categoryCode =
      code;
  }

  // -----------------------------------
  // Category name
  // -----------------------------------

  if (data.categoryName) {
    const name =
      data.categoryName.trim();

    const duplicateName =
      await Category.findOne({
        categoryName: name,

        _id: {
          $ne: categoryId,
        },
      });

    if (duplicateName) {
      throw new Error(
        "Category name already exists"
      );
    }

    category.categoryName =
      name;
  }

  // -----------------------------------
  // Parent category
  // -----------------------------------

  if (
    data.parentCategory !==
    undefined
  ) {
    if (
      data.parentCategory === null ||
      data.parentCategory === ""
    ) {
      category.parentCategory =
        null;
    } else {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.parentCategory
        )
      ) {
        throw new Error(
          "Invalid parent category ID"
        );
      }

      // Category cannot be its own parent
      if (
        data.parentCategory.toString() ===
        categoryId.toString()
      ) {
        throw new Error(
          "Category cannot be its own parent"
        );
      }

      const parent =
        await Category.findById(
          data.parentCategory
        );

      if (!parent) {
        throw new Error(
          "Parent category not found"
        );
      }

      if (
        parent.status !==
        "active"
      ) {
        throw new Error(
          "Inactive category cannot be selected as parent"
        );
      }

      category.parentCategory =
        parent._id;
    }
  }

  // -----------------------------------
  // Status
  // -----------------------------------

  if (data.status) {
    category.status =
      data.status;
  }

  category.updatedBy =
    userId || null;

  await category.save();

  return Category.findById(
    category._id
  )
    .populate(
      "parentCategory",
      "categoryCode categoryName"
    )
    .populate(
      "updatedBy",
      "firstName lastName email"
    );
};

// ---------------------------------------
// Update Status
// ---------------------------------------

const updateCategoryStatus =
  async (
    categoryId,
    status,
    userId
  ) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        categoryId
      )
    ) {
      throw new Error(
        "Invalid category ID"
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

    const category =
      await Category.findById(
        categoryId
      );

    if (!category) {
      throw new Error(
        "Category not found"
      );
    }

    category.status =
      status;

    category.updatedBy =
      userId || null;

    await category.save();

    return category;
  };

// ---------------------------------------
// Delete Category
// ---------------------------------------

const deleteCategory = async (
  categoryId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      categoryId
    )
  ) {
    throw new Error(
      "Invalid category ID"
    );
  }

  const category =
    await Category.findById(
      categoryId
    );

  if (!category) {
    throw new Error(
      "Category not found"
    );
  }

  // Check children
  const childCount =
    await Category.countDocuments({
      parentCategory:
        categoryId,
    });

  if (childCount > 0) {
    throw new Error(
      "Cannot delete category because it has sub categories"
    );
  }

  await Category.findByIdAndDelete(
    categoryId
  );

  return true;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};