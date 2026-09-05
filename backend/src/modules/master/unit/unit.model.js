const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    unitCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    unitName: {
      type: String,
      required: true,
      trim: true,
    },

    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    unitType: {
      type: String,
      required: true,
      enum: [
        "quantity",
        "weight",
        "length",
        "volume",
        "area",
      ],
      lowercase: true,
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

unitSchema.index({ unitName: 1 });
unitSchema.index({ symbol: 1 });
unitSchema.index({ unitType: 1 });
unitSchema.index({ status: 1 });

module.exports = mongoose.model(
  "UnitMaster",
  unitSchema
);