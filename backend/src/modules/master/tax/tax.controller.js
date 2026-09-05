const taxService = require("./tax.service");

// -----------------------------------------
// Create Tax
// -----------------------------------------

const createTax = async (req, res) => {
  try {
    const tax = await taxService.createTax(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Tax created successfully",
      data: tax,
    });
  } catch (error) {
    console.error(
      "Create tax error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create tax",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get Taxes
// -----------------------------------------

const getTaxes = async (req, res) => {
  try {
    const result =
      await taxService.getTaxes(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Taxes retrieved successfully",
      data: result.taxes,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get taxes error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to get taxes",
    });
  }
};

// -----------------------------------------
// Get Tax By ID
// -----------------------------------------

const getTaxById = async (
  req,
  res
) => {
  try {
    const tax =
      await taxService.getTaxById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Tax retrieved successfully",
      data: tax,
    });
  } catch (error) {
    console.error(
      "Get tax by ID error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to get tax",
    });
  }
};

// -----------------------------------------
// Update Tax
// -----------------------------------------

const updateTax = async (
  req,
  res
) => {
  try {
    const tax =
      await taxService.updateTax(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Tax updated successfully",
      data: tax,
    });
  } catch (error) {
    console.error(
      "Update tax error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update tax",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Tax Status
// -----------------------------------------

const updateTaxStatus = async (
  req,
  res
) => {
  try {
    const tax =
      await taxService.updateTaxStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Tax status updated successfully",
      data: tax,
    });
  } catch (error) {
    console.error(
      "Update tax status error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update tax status",
    });
  }
};

// -----------------------------------------
// Delete Tax
// -----------------------------------------

const deleteTax = async (
  req,
  res
) => {
  try {
    await taxService.deleteTax(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Tax deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete tax error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete tax",
    });
  }
};

module.exports = {
  createTax,
  getTaxes,
  getTaxById,
  updateTax,
  updateTaxStatus,
  deleteTax,
};