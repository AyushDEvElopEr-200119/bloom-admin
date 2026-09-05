const productService = require("./product.service");

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to create product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCTS
// =====================================================

const getProducts = async (req, res) => {
  try {
    const result =
      await productService.getProducts(
        req.query
      );

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch products.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = async (req, res) => {
  try {
    const product =
      await productService.getProductById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    console.error(
      "Get Product By ID Error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const product =
      await productService.updateProduct(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to update product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// UPDATE PRODUCT STATUS
// =====================================================

const updateProductStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body;

      const product =
        await productService.updateProductStatus(
          req.params.id,
          status,
          req.user
        );

      return res.status(200).json({
        success: true,
        message:
          "Product status updated successfully.",
        data: product,
      });
    } catch (error) {
      console.error(
        "Update Product Status Error:",
        error
      );

      return res
        .status(
          error.statusCode || 500
        )
        .json({
          success: false,
          message:
            error.message ||
            "Failed to update product status.",
          ...(error.errors && {
            errors: error.errors,
          }),
        });
    }
  };

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {
  try {
    const result =
      await productService.deleteProduct(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      message:
        result.message ||
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete product.",
      ...(error.errors && {
        errors: error.errors,
      }),
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
};