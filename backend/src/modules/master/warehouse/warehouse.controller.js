const warehouseService = require("./warehouse.service");

// -----------------------------------------
// Create Warehouse
// -----------------------------------------
const createWarehouse = async (req, res) => {
  try {
    const warehouse = await warehouseService.createWarehouse(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Create Warehouse Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create warehouse",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// -----------------------------------------
// Get All Warehouses
// -----------------------------------------
const getWarehouses = async (req, res) => {
  try {
    const result = await warehouseService.getWarehouses(req.query);

    return res.status(200).json({
      success: true,
      message: "Warehouses fetched successfully",
      data: result.warehouses,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get Warehouses Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch warehouses",
    });
  }
};

// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------
const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await warehouseService.getWarehouseById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Get Warehouse Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch warehouse",
    });
  }
};

// -----------------------------------------
// Update Warehouse
// -----------------------------------------
const updateWarehouse = async (req, res) => {
  try {
    const warehouse = await warehouseService.updateWarehouse(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Update Warehouse Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update warehouse",
      ...(error.errors && { errors: error.errors }),
    });
  }
};

// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------
const updateWarehouseStatus = async (req, res) => {
  try {
    const warehouse = await warehouseService.updateWarehouseStatus(
      req.params.id,
      req.body.status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse status updated successfully",
      data: warehouse,
    });
  } catch (error) {
    console.error("Update Warehouse Status Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update warehouse status",
    });
  }
};

// -----------------------------------------
// Delete Warehouse
// -----------------------------------------
const deleteWarehouse = async (req, res) => {
  try {
    await warehouseService.deleteWarehouse(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Delete Warehouse Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete warehouse",
    });
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
};