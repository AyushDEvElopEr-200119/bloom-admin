const unitService = require("./unit.service");

// -----------------------------------------
// Create Unit
// -----------------------------------------

const createUnit = async (req, res) => {
  try {
    const unit = await unitService.createUnit(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    console.error(
      "Create unit error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create unit",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get Units
// -----------------------------------------

const getUnits = async (req, res) => {
  try {
    const result =
      await unitService.getUnits(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Units retrieved successfully",
      data: result.units,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get units error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to get units",
    });
  }
};

// -----------------------------------------
// Get Unit By ID
// -----------------------------------------

const getUnitById = async (
  req,
  res
) => {
  try {
    const unit =
      await unitService.getUnitById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Unit retrieved successfully",
      data: unit,
    });
  } catch (error) {
    console.error(
      "Get unit by ID error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to get unit",
    });
  }
};

// -----------------------------------------
// Update Unit
// -----------------------------------------

const updateUnit = async (
  req,
  res
) => {
  try {
    const unit =
      await unitService.updateUnit(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Unit updated successfully",
      data: unit,
    });
  } catch (error) {
    console.error(
      "Update unit error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update unit",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Unit Status
// -----------------------------------------

const updateUnitStatus = async (
  req,
  res
) => {
  try {
    const unit =
      await unitService.updateUnitStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Unit status updated successfully",
      data: unit,
    });
  } catch (error) {
    console.error(
      "Update unit status error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update unit status",
    });
  }
};

// -----------------------------------------
// Delete Unit
// -----------------------------------------

const deleteUnit = async (
  req,
  res
) => {
  try {
    await unitService.deleteUnit(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Unit deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete unit error:",
      error
    );

    return res.status(
      error.statusCode || 400
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete unit",
    });
  }
};

module.exports = {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
};