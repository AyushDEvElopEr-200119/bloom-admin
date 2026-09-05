const categoryService = require("./category.service");

const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("./category.validation");

// ---------------------------------------
// Create
// ---------------------------------------

const createCategory = async (
  req,
  res
) => {
  try {
    const errors =
      validateCreateCategory(
        req.body
      );

    if (
      Object.keys(errors).length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors,
      });
    }

    const category =
      await categoryService.createCategory(
        req.body,
        req.user?._id
      );

    return res.status(201).json({
      success: true,
      message:
        "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error(
      "Create category error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get all
// ---------------------------------------

const getCategories = async (
  req,
  res
) => {
  try {
    const result =
      await categoryService.getCategories(
        {
          page:
            req.query.page,

          limit:
            req.query.limit,

          search:
            req.query.search || "",

          status:
            req.query.status,

          parentCategory:
            req.query.parentCategory,
        }
      );

    return res.status(200).json({
      success: true,

      data: result.categories,

      pagination:
        result.pagination,
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Get one
// ---------------------------------------

const getCategoryById = async (
  req,
  res
) => {
  try {
    const category =
      await categoryService.getCategoryById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error(
      "Get category error:",
      error
    );

    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Update
// ---------------------------------------

const updateCategory = async (
  req,
  res
) => {
  try {
    const errors =
      validateUpdateCategory(
        req.body
      );

    if (
      Object.keys(errors).length > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors,
      });
    }

    const category =
      await categoryService.updateCategory(
        req.params.id,
        req.body,
        req.user?._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error(
      "Update category error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ---------------------------------------
// Status
// ---------------------------------------

const updateCategoryStatus =
  async (
    req,
    res
  ) => {
    try {
      const { status } =
        req.body;

      const category =
        await categoryService.updateCategoryStatus(
          req.params.id,
          status,
          req.user?._id
        );

      return res.status(200).json({
        success: true,

        message:
          "Category status updated successfully",

        data: category,
      });
    } catch (error) {
      console.error(
        "Update category status error:",
        error
      );

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

// ---------------------------------------
// Delete
// ---------------------------------------

const deleteCategory = async (
  req,
  res
) => {
  try {
    await categoryService.deleteCategory(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};