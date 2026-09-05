const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    taxCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    taxName: {
      type: String,
      required: true,
      trim: true,
    },

    taxRate: {
      type: Number,
      required: true,
      min: 0,
    },

    taxType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
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

taxSchema.index({ taxName: 1 });
taxSchema.index({ taxType: 1 });
taxSchema.index({ status: 1 });

module.exports = mongoose.model(
  "TaxMaster",
  taxSchema
);