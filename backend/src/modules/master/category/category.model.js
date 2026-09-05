const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    // ---------------------------------------
    // Category Code
    // ---------------------------------------

    categoryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ---------------------------------------
    // Category Name
    // ---------------------------------------

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    // ---------------------------------------
    // Parent Category
    // ---------------------------------------

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryMaster",
      default: null,
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
    // Created By
    // ---------------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ---------------------------------------
    // Updated By
    // ---------------------------------------

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

categorySchema.index({
  categoryName: 1,
});

categorySchema.index({
  parentCategory: 1,
});

categorySchema.index({
  status: 1,
});

// ---------------------------------------
// Model
// ---------------------------------------

module.exports = mongoose.model(
  "CategoryMaster",
  categorySchema
);