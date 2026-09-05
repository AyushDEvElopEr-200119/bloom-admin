const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    // ---------------------------------------
    // Sub Category Code
    // ---------------------------------------

    subCategoryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ---------------------------------------
    // Sub Category Name
    // ---------------------------------------

    subCategoryName: {
      type: String,
      required: true,
      trim: true,
    },

    // ---------------------------------------
    // Parent Category
    // ---------------------------------------

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryMaster",
      required: true,
    },

    // ---------------------------------------
    // Status
    // ---------------------------------------

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ---------------------------------------
    // Audit
    // ---------------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------
// Indexes
// ---------------------------------------

subCategorySchema.index({
  subCategoryName: 1,
});

subCategorySchema.index({
  category: 1,
});

subCategorySchema.index({
  status: 1,
});

module.exports = mongoose.model(
  "SubCategoryMaster",
  subCategorySchema
);