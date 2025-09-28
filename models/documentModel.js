const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true, // Add index for faster queries
    },
    driverLicense: {
      fileName: {
        type: String,
        maxlength: [255, "File name too long"],
      },
      fileUrl: {
        type: String,
        maxlength: [500, "File URL too long"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    socialSecurity: {
      fileName: {
        type: String,
        maxlength: [255, "File name too long"],
      },
      fileUrl: {
        type: String,
        maxlength: [500, "File URL too long"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    w2: {
      fileName: {
        type: String,
        maxlength: [255, "File name too long"],
      },
      fileUrl: {
        type: String,
        maxlength: [500, "File URL too long"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    f1099: {
      fileName: {
        type: String,
        maxlength: [255, "File name too long"],
      },
      fileUrl: {
        type: String,
        maxlength: [500, "File URL too long"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    form1040: {
      fileName: {
        type: String,
        maxlength: [255, "File name too long"],
      },
      fileUrl: {
        type: String,
        maxlength: [500, "File URL too long"],
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    misc: [
      {
        fileName: {
          type: String,
          required: [true, "File name is required"],
          maxlength: [255, "File name too long"],
        },
        fileUrl: {
          type: String,
          required: [true, "File URL is required"],
          maxlength: [500, "File URL too long"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
documentSchema.index({ userId: 1 });

// Virtual for getting total document count
documentSchema.virtual("totalDocuments").get(function () {
  let count = 0;
  if (this.driverLicense) count++;
  if (this.socialSecurity) count++;
  if (this.w2) count++;
  if (this.f1099) count++;
  if (this.form1040) count++;
  if (this.misc) count += this.misc.length;
  return count;
});

// Pre-save middleware to validate misc array length
documentSchema.pre("save", function (next) {
  if (this.misc && this.misc.length > 20) {
    return next(new Error("Cannot have more than 20 miscellaneous documents"));
  }
  next();
});

module.exports = mongoose.model("Document", documentSchema);
