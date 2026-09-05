const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// -----------------------------------------
// Routes
// -----------------------------------------

const authRoutes = require("./routes/authRoutes");

const categoryRoutes = require(
  "./modules/master/category/category.routes"
);

const subCategoryRoutes = require(
  "./modules/master/subCategory/subCategory.routes"
);

const brandRoutes = require(
  "./modules/master/brand/brand.routes"
);

const unitRoutes = require(
  "./modules/master/unit/unit.routes"
);

const taxRoutes = require(
  "./modules/master/tax/tax.routes"
);

const warehouseRoutes = require(
  "./modules/master/warehouse/warehouse.routes"
);

// -----------------------------------------
// Product Routes
// -----------------------------------------

const productRoutes = require(
  "./modules/product/product.routes"
);

const app = express();

// -----------------------------------------
// Security
// -----------------------------------------

app.use(helmet());

// -----------------------------------------
// CORS
// -----------------------------------------

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// -----------------------------------------
// Body Parsing
// -----------------------------------------

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// -----------------------------------------
// Logger
// -----------------------------------------

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// -----------------------------------------
// Swagger
// -----------------------------------------

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// -----------------------------------------
// Root
// -----------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bloom Ecommerce API is running",
  });
});

// -----------------------------------------
// Health Check
// -----------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// =========================================
// AUTHENTICATION ROUTES
// =========================================

app.use(
  "/api/auth",
  authRoutes
);

// =========================================
// MASTER ROUTES
// =========================================

// -----------------------------------------
// Category
// -----------------------------------------

app.use(
  "/api/admin/master/categories",
  categoryRoutes
);

// -----------------------------------------
// Sub Category
// -----------------------------------------

app.use(
  "/api/admin/master/sub-categories",
  subCategoryRoutes
);

// -----------------------------------------
// Brand
// -----------------------------------------

app.use(
  "/api/admin/master/brands",
  brandRoutes
);

// -----------------------------------------
// Unit
// -----------------------------------------

app.use(
  "/api/admin/master/units",
  unitRoutes
);

// -----------------------------------------
// Tax
// -----------------------------------------

app.use(
  "/api/admin/master/taxes",
  taxRoutes
);

// -----------------------------------------
// Warehouse
// -----------------------------------------

app.use(
  "/api/admin/master/warehouses",
  warehouseRoutes
);

// =========================================
// PRODUCT ROUTES
// =========================================

app.use(
  "/api/admin/products",
  productRoutes
);

// =========================================
// 404 HANDLER
// =========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =========================================
// GLOBAL ERROR HANDLER
// =========================================

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
  }
);

// -----------------------------------------
// Export App
// -----------------------------------------

module.exports = app;