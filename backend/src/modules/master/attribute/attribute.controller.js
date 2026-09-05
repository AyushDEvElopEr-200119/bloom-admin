const attributeService = require("./attribute.service");

// -----------------------------------------
// Create Attribute
// -----------------------------------------

const createAttribute = async (req, res) => {
  try {
    const attribute =
      await attributeService.createAttribute(
        req.body,
        req.user
      );

    return res.status(201).json({
      success: true,
      message: "Attribute created successfully",
      data: attribute,
    });
  } catch (error) {
    console.error(
      "Create Attribute Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to create attribute",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Get All Attributes
// -----------------------------------------

const getAttributes = async (req, res) => {
  try {
    const result =
      await attributeService.getAttributes(
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Attributes fetched successfully",
      data: result.attributes,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get Attributes Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch attributes",
    });
  }
};

// -----------------------------------------
// Get Attribute By ID
// -----------------------------------------

const getAttributeById = async (
  req,
  res
) => {
  try {
    const attribute =
      await attributeService.getAttributeById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Attribute fetched successfully",
      data: attribute,
    });
  } catch (error) {
    console.error(
      "Get Attribute Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch attribute",
    });
  }
};

// -----------------------------------------
// Update Attribute
// -----------------------------------------

const updateAttribute = async (
  req,
  res
) => {
  try {
    const attribute =
      await attributeService.updateAttribute(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Attribute updated successfully",
      data: attribute,
    });
  } catch (error) {
    console.error(
      "Update Attribute Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update attribute",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// -----------------------------------------
// Update Attribute Status
// -----------------------------------------

const updateAttributeStatus = async (
  req,
  res
) => {
  try {
    const attribute =
      await attributeService.updateAttributeStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Attribute status updated successfully",
      data: attribute,
    });
  } catch (error) {
    console.error(
      "Update Attribute Status Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to update attribute status",
    });
  }
};

// -----------------------------------------
// Delete Attribute
// -----------------------------------------

const deleteAttribute = async (
  req,
  res
) => {
  try {
    await attributeService.deleteAttribute(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Attribute deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Attribute Error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to delete attribute",
    });
  }
};

module.exports = {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  updateAttributeStatus,
  deleteAttribute,
};