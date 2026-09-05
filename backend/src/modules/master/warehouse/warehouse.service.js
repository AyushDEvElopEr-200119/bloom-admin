const Warehouse = require("./warehouse.model");

const {
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateObjectId,
} = require("./warehouse.validation");

// -----------------------------------------
// Escape Regex
// -----------------------------------------

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// -----------------------------------------
// Create Warehouse
// -----------------------------------------

const createWarehouse = async (data, user) => {
  const validation =
    validateCreateWarehouse(data);

  if (!validation.isValid) {
    const error = new Error(
      "Validation failed"
    );

    error.statusCode = 400;
    error.errors = validation.errors;

    throw error;
  }

  const warehouseCode =
    data.warehouseCode
      .trim()
      .toUpperCase();

  const warehouseName =
    data.warehouseName.trim();

  // ---------------------------------------
  // Duplicate Warehouse Code
  // ---------------------------------------

  const existingCode =
    await Warehouse.findOne({
      warehouseCode,
    });

  if (existingCode) {
    const error = new Error(
      "Warehouse code already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------
  // Duplicate Warehouse Name
  // ---------------------------------------

  const existingName =
    await Warehouse.findOne({
      warehouseName: {
        $regex: `^${escapeRegex(
          warehouseName
        )}$`,
        $options: "i",
      },
    });

  if (existingName) {
    const error = new Error(
      "Warehouse name already exists"
    );

    error.statusCode = 409;

    throw error;
  }

  // ---------------------------------------
  // Create
  // ---------------------------------------

  const warehouse =
    await Warehouse.create({
      warehouseCode,
      warehouseName,

      addressLine1:
        data.addressLine1.trim(),

      addressLine2:
        data.addressLine2?.trim() || "",

      city:
        data.city.trim(),

      state:
        data.state.trim(),

      country:
        data.country.trim(),

      postalCode:
        data.postalCode.trim(),

      contactPerson:
        data.contactPerson.trim(),

      contactPhone:
        data.contactPhone.trim(),

      email:
        data.email?.trim().toLowerCase() ||
        "",

      status:
        data.status || "active",

      createdBy:
        user?._id || null,
    });

  return warehouse;
};

// -----------------------------------------
// Get Warehouses
// -----------------------------------------

const getWarehouses = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    city,
    state,
  } = query;

  const pageNumber = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(
      parseInt(limit, 10) || 10,
      1
    ),
    100
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const filter = {};

  // ---------------------------------------
  // Search
  // ---------------------------------------

  if (search && search.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(search.trim()),
      "i"
    );

    filter.$or = [
      {
        warehouseCode:
          searchRegex,
      },
      {
        warehouseName:
          searchRegex,
      },
      {
        city:
          searchRegex,
      },
      {
        state:
          searchRegex,
      },
      {
        postalCode:
          searchRegex,
      },
    ];
  }

  // ---------------------------------------
  // Status Filter
  // ---------------------------------------

  if (status) {
    filter.status = status;
  }

  // ---------------------------------------
  // City Filter
  // ---------------------------------------

  if (city) {
    filter.city = new RegExp(
      `^${escapeRegex(city.trim())}$`,
      "i"
    );
  }

  // ---------------------------------------
  // State Filter
  // ---------------------------------------

  if (state) {
    filter.state = new RegExp(
      `^${escapeRegex(state.trim())}$`,
      "i"
    );
  }

  const [
    warehouses,
    total,
  ] = await Promise.all([
    Warehouse.find(filter)
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
      .limit(limitNumber)
      .lean(),

    Warehouse.countDocuments(filter),
  ]);

  return {
    warehouses,

    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(
        total / limitNumber
      ),
    },
  };
};

// -----------------------------------------
// Get Warehouse By ID
// -----------------------------------------

const getWarehouseById = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid warehouse ID"
    );

    error.statusCode = 400;

    throw error;
  }

  const warehouse =
    await Warehouse.findById(id)
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      );

  if (!warehouse) {
    const error = new Error(
      "Warehouse not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return warehouse;
};

// -----------------------------------------
// Update Warehouse
// -----------------------------------------

const updateWarehouse = async (
  id,
  data,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid warehouse ID"
    );

    error.statusCode = 400;

    throw error;
  }

  const validation =
    validateUpdateWarehouse(data);

  if (!validation.isValid) {
    const error = new Error(
      "Validation failed"
    );

    error.statusCode = 400;
    error.errors = validation.errors;

    throw error;
  }

  const warehouse =
    await Warehouse.findById(id);

  if (!warehouse) {
    const error = new Error(
      "Warehouse not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------------
  // Warehouse Code
  // ---------------------------------------

  if (data.warehouseCode !== undefined) {
    const warehouseCode =
      data.warehouseCode
        .trim()
        .toUpperCase();

    const existingCode =
      await Warehouse.findOne({
        warehouseCode,
        _id: {
          $ne: id,
        },
      });

    if (existingCode) {
      const error = new Error(
        "Warehouse code already exists"
      );

      error.statusCode = 409;

      throw error;
    }

    warehouse.warehouseCode =
      warehouseCode;
  }

  // ---------------------------------------
  // Warehouse Name
  // ---------------------------------------

  if (data.warehouseName !== undefined) {
    const warehouseName =
      data.warehouseName.trim();

    const existingName =
      await Warehouse.findOne({
        warehouseName: {
          $regex: `^${escapeRegex(
            warehouseName
          )}$`,
          $options: "i",
        },

        _id: {
          $ne: id,
        },
      });

    if (existingName) {
      const error = new Error(
        "Warehouse name already exists"
      );

      error.statusCode = 409;

      throw error;
    }

    warehouse.warehouseName =
      warehouseName;
  }

  // ---------------------------------------
  // Address
  // ---------------------------------------

  if (data.addressLine1 !== undefined) {
    warehouse.addressLine1 =
      data.addressLine1.trim();
  }

  if (data.addressLine2 !== undefined) {
    warehouse.addressLine2 =
      data.addressLine2.trim();
  }

  // ---------------------------------------
  // Location
  // ---------------------------------------

  if (data.city !== undefined) {
    warehouse.city =
      data.city.trim();
  }

  if (data.state !== undefined) {
    warehouse.state =
      data.state.trim();
  }

  if (data.country !== undefined) {
    warehouse.country =
      data.country.trim();
  }

  if (data.postalCode !== undefined) {
    warehouse.postalCode =
      data.postalCode.trim();
  }

  // ---------------------------------------
  // Contact
  // ---------------------------------------

  if (data.contactPerson !== undefined) {
    warehouse.contactPerson =
      data.contactPerson.trim();
  }

  if (data.contactPhone !== undefined) {
    warehouse.contactPhone =
      data.contactPhone.trim();
  }

  if (data.email !== undefined) {
    warehouse.email =
      data.email.trim().toLowerCase();
  }

  // ---------------------------------------
  // Status
  // ---------------------------------------

  if (data.status !== undefined) {
    warehouse.status =
      data.status;
  }

  warehouse.updatedBy =
    user?._id || null;

  await warehouse.save();

  return warehouse;
};

// -----------------------------------------
// Update Warehouse Status
// -----------------------------------------

const updateWarehouseStatus = async (
  id,
  status,
  user
) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid warehouse ID"
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !["active", "inactive"].includes(
      status
    )
  ) {
    const error = new Error(
      "Status must be either active or inactive"
    );

    error.statusCode = 400;

    throw error;
  }

  const warehouse =
    await Warehouse.findById(id);

  if (!warehouse) {
    const error = new Error(
      "Warehouse not found"
    );

    error.statusCode = 404;

    throw error;
  }

  warehouse.status = status;

  warehouse.updatedBy =
    user?._id || null;

  await warehouse.save();

  return warehouse;
};

// -----------------------------------------
// Delete Warehouse
// -----------------------------------------

const deleteWarehouse = async (id) => {
  if (!validateObjectId(id)) {
    const error = new Error(
      "Invalid warehouse ID"
    );

    error.statusCode = 400;

    throw error;
  }

  const warehouse =
    await Warehouse.findById(id);

  if (!warehouse) {
    const error = new Error(
      "Warehouse not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * Inventory dependency check will be
   * added when Inventory module is created.
   */

  await Warehouse.findByIdAndDelete(id);

  return true;
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseStatus,
  deleteWarehouse,
};