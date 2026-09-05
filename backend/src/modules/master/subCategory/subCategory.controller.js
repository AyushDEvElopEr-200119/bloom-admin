const subCategoryService = require("./subCategory.service");

// -----------------------------------------
// Create Sub Category
// -----------------------------------------

const createSubCategory = async (req, res) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Sub category created successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Create sub category error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to create sub category",
    });
  }
};

// -----------------------------------------
// Get All Sub Categories
// -----------------------------------------

const getSubCategories = async (req, res) => {
  try {
    const result = await subCategoryService.getSubCategories(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Sub categories retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get sub categories error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get sub categories",
    });
  }
};

// -----------------------------------------
// Get Sub Category By ID
// -----------------------------------------

const getSubCategoryById = async (req, res) => {
  try {
    const subCategory =
      await subCategoryService.getSubCategoryById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Sub category retrieved successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Get sub category error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to get sub category",
    });
  }
};

// -----------------------------------------
// Update Sub Category
// -----------------------------------------

const updateSubCategory = async (req, res) => {
  try {
    const subCategory =
      await subCategoryService.updateSubCategory(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message: "Sub category updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Update sub category error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to update sub category",
    });
  }
};

// -----------------------------------------
// Update Sub Category Status
// -----------------------------------------

const updateSubCategoryStatus = async (req, res) => {
  try {
    const subCategory =
      await subCategoryService.updateSubCategoryStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    return res.status(200).json({
      success: true,
      message: "Sub category status updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Update sub category status error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message ||
        "Failed to update sub category status",
    });
  }
};

// -----------------------------------------
// Delete Sub Category
// -----------------------------------------

const deleteSubCategory = async (req, res) => {
  try {
    await subCategoryService.deleteSubCategory(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
    });
  } catch (error) {
    console.error("Delete sub category error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Failed to delete sub category",
    });
  }
};

// -----------------------------------------
// Exports
// -----------------------------------------

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryStatus,
  deleteSubCategory,
};