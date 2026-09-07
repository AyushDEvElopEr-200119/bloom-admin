require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

// -----------------------------------------
// Permissions
// -----------------------------------------

const permissions = [
  // -----------------------------------------
  // Dashboard
  // -----------------------------------------

  {
    name: "dashboard.read",
    resource: "dashboard",
    action: "read",
    description: "View dashboard",
  },

  // -----------------------------------------
  // Products
  // -----------------------------------------

  {
    name: "products.create",
    resource: "products",
    action: "create",
    description: "Create products",
  },

  {
    name: "products.read",
    resource: "products",
    action: "read",
    description: "View products",
  },

  {
    name: "products.update",
    resource: "products",
    action: "update",
    description: "Update products",
  },

  {
    name: "products.delete",
    resource: "products",
    action: "delete",
    description: "Delete products",
  },

  // -----------------------------------------
  // Categories
  // -----------------------------------------

  {
    name: "categories.create",
    resource: "categories",
    action: "create",
    description: "Create categories",
  },

  {
    name: "categories.read",
    resource: "categories",
    action: "read",
    description: "View categories",
  },

  {
    name: "categories.update",
    resource: "categories",
    action: "update",
    description: "Update categories",
  },

  {
    name: "categories.delete",
    resource: "categories",
    action: "delete",
    description: "Delete categories",
  },

  // -----------------------------------------
  // Sub Categories
  // -----------------------------------------

  {
    name: "subcategories.create",
    resource: "subcategories",
    action: "create",
    description: "Create sub categories",
  },

  {
    name: "subcategories.read",
    resource: "subcategories",
    action: "read",
    description: "View sub categories",
  },

  {
    name: "subcategories.update",
    resource: "subcategories",
    action: "update",
    description: "Update sub categories",
  },

  {
    name: "subcategories.delete",
    resource: "subcategories",
    action: "delete",
    description: "Delete sub categories",
  },

  // -----------------------------------------
  // Brands
  // -----------------------------------------

  {
    name: "brands.create",
    resource: "brands",
    action: "create",
    description: "Create brands",
  },

  {
    name: "brands.read",
    resource: "brands",
    action: "read",
    description: "View brands",
  },

  {
    name: "brands.update",
    resource: "brands",
    action: "update",
    description: "Update brands",
  },

  {
    name: "brands.delete",
    resource: "brands",
    action: "delete",
    description: "Delete brands",
  },

  // -----------------------------------------
  // Units
  // -----------------------------------------

  {
    name: "units.create",
    resource: "units",
    action: "create",
    description: "Create units",
  },

  {
    name: "units.read",
    resource: "units",
    action: "read",
    description: "View units",
  },

  {
    name: "units.update",
    resource: "units",
    action: "update",
    description: "Update units",
  },

  {
    name: "units.delete",
    resource: "units",
    action: "delete",
    description: "Delete units",
  },

  // -----------------------------------------
  // Taxes
  // -----------------------------------------

  {
    name: "taxes.create",
    resource: "taxes",
    action: "create",
    description: "Create taxes",
  },

  {
    name: "taxes.read",
    resource: "taxes",
    action: "read",
    description: "View taxes",
  },

  {
    name: "taxes.update",
    resource: "taxes",
    action: "update",
    description: "Update taxes",
  },

  {
    name: "taxes.delete",
    resource: "taxes",
    action: "delete",
    description: "Delete taxes",
  },

  // -----------------------------------------
  // Warehouses
  // -----------------------------------------

  {
    name: "warehouses.create",
    resource: "warehouses",
    action: "create",
    description: "Create warehouses",
  },

  {
    name: "warehouses.read",
    resource: "warehouses",
    action: "read",
    description: "View warehouses",
  },

  {
    name: "warehouses.update",
    resource: "warehouses",
    action: "update",
    description: "Update warehouses",
  },

  {
    name: "warehouses.delete",
    resource: "warehouses",
    action: "delete",
    description: "Delete warehouses",
  },

  // -----------------------------------------
  // Attributes
  // -----------------------------------------

  {
    name: "attributes.create",
    resource: "attributes",
    action: "create",
    description: "Create attributes",
  },

  {
    name: "attributes.read",
    resource: "attributes",
    action: "read",
    description: "View attributes",
  },

  {
    name: "attributes.update",
    resource: "attributes",
    action: "update",
    description: "Update attributes",
  },

  {
    name: "attributes.delete",
    resource: "attributes",
    action: "delete",
    description: "Delete attributes",
  },

  // -----------------------------------------
  // Orders
  // -----------------------------------------

  {
    name: "orders.read",
    resource: "orders",
    action: "read",
    description: "View orders",
  },

  {
    name: "orders.update",
    resource: "orders",
    action: "update",
    description: "Update order status",
  },

  // -----------------------------------------
  // Customers
  // -----------------------------------------

  {
    name: "customers.read",
    resource: "customers",
    action: "read",
    description: "View customers",
  },

  {
    name: "customers.update",
    resource: "customers",
    action: "update",
    description: "Update customers",
  },

  // -----------------------------------------
  // Users
  // -----------------------------------------

  {
    name: "users.create",
    resource: "users",
    action: "create",
    description: "Create admin users",
  },

  {
    name: "users.read",
    resource: "users",
    action: "read",
    description: "View admin users",
  },

  {
    name: "users.update",
    resource: "users",
    action: "update",
    description: "Update admin users",
  },

  {
    name: "users.delete",
    resource: "users",
    action: "delete",
    description: "Delete admin users",
  },

  // -----------------------------------------
  // Roles
  // -----------------------------------------

  {
    name: "roles.create",
    resource: "roles",
    action: "create",
    description: "Create roles",
  },

  {
    name: "roles.read",
    resource: "roles",
    action: "read",
    description: "View roles",
  },

  {
    name: "roles.update",
    resource: "roles",
    action: "update",
    description: "Update roles",
  },

  {
    name: "roles.delete",
    resource: "roles",
    action: "delete",
    description: "Delete roles",
  },

  // -----------------------------------------
  // CMS
  // -----------------------------------------

  {
    name: "cms.create",
    resource: "cms",
    action: "create",
    description: "Create CMS content",
  },

  {
    name: "cms.read",
    resource: "cms",
    action: "read",
    description: "View CMS content",
  },

  {
    name: "cms.update",
    resource: "cms",
    action: "update",
    description: "Update CMS content",
  },

  {
    name: "cms.delete",
    resource: "cms",
    action: "delete",
    description: "Delete CMS content",
  },

  // -----------------------------------------
  // Settings
  // -----------------------------------------

  {
    name: "settings.manage",
    resource: "settings",
    action: "manage",
    description: "Manage application settings",
  },
];

// -----------------------------------------
// Seed Database
// -----------------------------------------

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Starting database seed...");

    // -----------------------------------
    // 1. Create / Update Permissions
    // -----------------------------------

    const permissionDocuments = [];

    for (const permissionData of permissions) {
      const permission =
        await Permission.findOneAndUpdate(
          {
            name: permissionData.name,
          },
          permissionData,
          {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

      permissionDocuments.push(permission);
    }

    console.log(
      `✓ ${permissionDocuments.length} permissions created/updated`
    );

    // -----------------------------------
    // 2. Create / Update Roles
    // -----------------------------------

    const permissionIds =
      permissionDocuments.map(
        (permission) => permission._id
      );

    // -----------------------------------
    // Permission Map
    // -----------------------------------

    const permissionMap = {};

    permissionDocuments.forEach(
      (permission) => {
        permissionMap[permission.name] =
          permission._id;
      }
    );

    // -----------------------------------
    // Super Admin
    // -----------------------------------

    const superAdminRole =
      await Role.findOneAndUpdate(
        {
          name: "Super Admin",
        },
        {
          name: "Super Admin",
          description:
            "Full access to the ecommerce administration",
          permissions: permissionIds,
          isSystemRole: true,
          status: "active",
        },
        {
          returnDocument: "after",
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    // -----------------------------------
    // Admin
    // -----------------------------------

    const adminPermissionNames =
      permissionDocuments
        .filter(
          (permission) =>
            ![
              "roles.delete",
              "settings.manage",
            ].includes(permission.name)
        )
        .map(
          (permission) => permission._id
        );

    const adminRole =
      await Role.findOneAndUpdate(
        {
          name: "Admin",
        },
        {
          name: "Admin",
          description:
            "General ecommerce administration",
          permissions:
            adminPermissionNames,
          isSystemRole: true,
          status: "active",
        },
        {
          returnDocument: "after",
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    // -----------------------------------
    // Order Manager
    // -----------------------------------

    const orderManagerPermissions = [
      "dashboard.read",
      "orders.read",
      "orders.update",
      "customers.read",
      "customers.update",
    ]
      .map(
        (name) => permissionMap[name]
      )
      .filter(Boolean);

    const orderManagerRole =
      await Role.findOneAndUpdate(
        {
          name: "Order Manager",
        },
        {
          name: "Order Manager",
          description:
            "Manage ecommerce orders and customers",
          permissions:
            orderManagerPermissions,
          isSystemRole: true,
          status: "active",
        },
        {
          returnDocument: "after",
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    // -----------------------------------
    // Editor
    // -----------------------------------

    const editorPermissions = [
      "dashboard.read",

      "products.read",

      "categories.read",
      "subcategories.read",
      "brands.read",

      "units.read",
      "taxes.read",
      "warehouses.read",
      "attributes.read",

      "cms.create",
      "cms.read",
      "cms.update",
      "cms.delete",
    ]
      .map(
        (name) => permissionMap[name]
      )
      .filter(Boolean);

    const editorRole =
      await Role.findOneAndUpdate(
        {
          name: "Editor",
        },
        {
          name: "Editor",
          description:
            "Manage ecommerce content and CMS",
          permissions:
            editorPermissions,
          isSystemRole: true,
          status: "active",
        },
        {
          returnDocument: "after",
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    console.log(
      "✓ Roles created/updated"
    );

    // -----------------------------------
    // 3. Create / Update Super Admin
    // -----------------------------------

    const adminEmail =
      "admin@bloom-ecommerce.com";

    const adminPassword =
      "Admin@123456";

    const hashedPassword =
      await bcrypt.hash(
        adminPassword,
        12
      );

    const superAdmin =
      await User.findOneAndUpdate(
        {
          email: adminEmail,
        },
        {
          firstName: "Super",
          lastName: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: superAdminRole._id,
          status: "active",
        },
        {
          returnDocument: "after",
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    console.log(
      "✓ Super Admin created/updated"
    );

    // -----------------------------------
    // Seed Complete
    // -----------------------------------

    console.log(
      "\n================================="
    );

    console.log(
      "DATABASE SEED COMPLETED"
    );

    console.log(
      "================================="
    );

    console.log(
      `Email:    ${adminEmail}`
    );

    console.log(
      `Password: ${adminPassword}`
    );

    console.log(
      "=================================\n"
    );

    console.log("Roles:");

    console.log(
      `- ${superAdminRole.name}`
    );

    console.log(
      `- ${adminRole.name}`
    );

    console.log(
      `- ${orderManagerRole.name}`
    );

    console.log(
      `- ${editorRole.name}`
    );

    // -----------------------------------
    // Close Database
    // -----------------------------------

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed failed:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

// -----------------------------------------
// Run Seed
// -----------------------------------------

seedDatabase();