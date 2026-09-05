const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    brandCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

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

brandSchema.index({ brandName: 1 });
brandSchema.index({ status: 1 });

module.exports = mongoose.model(
  "BrandMaster",
  brandSchema
);