const mongoose = require("mongoose");

const attributeValueSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    _id: true,
  }
);

const attributeSchema = new mongoose.Schema(
  {
    attributeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    attributeName: {
      type: String,
      required: true,
      trim: true,
    },

    displayType: {
      type: String,
      enum: ["dropdown", "radio", "checkbox", "text", "color"],
      default: "dropdown",
    },

    values: {
      type: [attributeValueSchema],
      default: [],
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

// Indexes
attributeSchema.index({ attributeName: 1 });
attributeSchema.index({ status: 1 });

module.exports = mongoose.model("AttributeMaster", attributeSchema);