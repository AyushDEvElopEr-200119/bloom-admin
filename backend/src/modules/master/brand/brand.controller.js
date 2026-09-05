const brandService = require("./brand.service");

// -----------------------------------------
// Create Brand
// -----------------------------------------

const createBrand = async (req, res) => {
  try {
    const brand = await brandService.createBrand(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Create brand error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to create brand",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get All Brands
// -----------------------------------------

const getBrands = async (req, res) => {
  try {
    const result =
      await brandService.getBrands(req.query);

    return res.status(200).json({
      success: true,
      message: "Brands retrieved successfully",
      data: result.brands,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get brands error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to get brands",
    });
  }
};

// -----------------------------------------
// Get Brand By ID
// -----------------------------------------

const getBrandById = async (req, res) => {
  try {
    const brand =
      await brandService.getBrandById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Brand retrieved successfully",
      data: brand,
    });
  } catch (error) {
    console.error(
      "Get brand by ID error:",
      error
    );

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to get brand",
    });
  }
};

// -----------------------------------------
// Update Brand
// -----------------------------------------

const updateBrand = async (req, res) => {
  try {
    const brand =
      await brandService.updateBrand(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Update brand error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to update brand",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Brand Status
// -----------------------------------------

const updateBrandStatus = async (req, res) => {
  try {
    const brand =
      await brandService.updateBrandStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Brand status updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error(
      "Update brand status error:",
      error
    );

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message ||
        "Failed to update brand status",
    });
  }
};

// -----------------------------------------
// Delete Brand
// -----------------------------------------

const deleteBrand = async (req, res) => {
  try {
    await brandService.deleteBrand(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);

    return res.status(error.statusCode || 400).json({
      success: false,
      message:
        error.message || "Failed to delete brand",
    });
  }
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