const Document = require("../models/documentModel");
const User = require("../models/userModel"); // Add this import

// Create/Upload document
exports.create = async (req, res) => {
  try {
    console.log("📥 Incoming upload request");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { userId, docType } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!docType) {
      return res.status(400).json({ message: "docType is required" });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File is required" });
    }

    // Validate document type
    const validDocTypes = [
      "driverLicense",
      "socialSecurity",
      "w2",
      "f1099",
      "form1040",
      "misc",
    ];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const fileData = {
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      uploadedAt: new Date(),
    };

    let update = {};
    if (docType === "misc") {
      update = { $push: { misc: fileData } };
    } else {
      update = { [docType]: fileData };
    }

    const updatedDoc = await Document.findOneAndUpdate({ userId }, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: updatedDoc,
      fileUrl: req.file.path,
    });
  } catch (err) {
    console.error("❌ Document upload error:", err);
    res.status(500).json({
      success: false,
      message:
        err.message || "Some error occurred while uploading the document.",
    });
  }
};

// Get documents for a user
exports.getDocumentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const documents = await Document.findOne({ userId });

    if (!documents) {
      return res.status(200).json({
        success: true,
        message: "No documents found for this user",
        data: {
          userId,
          driverLicense: null,
          socialSecurity: null,
          w2: null,
          f1099: null,
          form1040: null,
          misc: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Documents retrieved successfully",
      data: documents,
    });
  } catch (err) {
    console.error("❌ Error fetching documents:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error occurred while fetching documents",
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { userId, docType, index } = req.params;

    if (!userId || !docType) {
      return res.status(400).json({
        success: false,
        message: "userId and docType are required",
      });
    }

    const validDocTypes = [
      "driverLicense",
      "socialSecurity",
      "w2",
      "f1099",
      "form1040",
      "misc",
    ];
    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    let update = {};

    if (docType === "misc") {
      if (!index) {
        return res.status(400).json({
          success: false,
          message: "Index is required for misc documents",
        });
      }

      // First get the document to remove the specific item
      const doc = await Document.findOne({ userId });
      if (!doc || !doc.misc || !doc.misc[index]) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      // Remove the item at the specified index
      doc.misc.splice(index, 1);
      await doc.save();

      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
        document: doc,
      });
    } else {
      // For non-misc documents, set the field to null
      update = { $unset: { [docType]: 1 } };

      const updatedDoc = await Document.findOneAndUpdate({ userId }, update, {
        new: true,
      });

      if (!updatedDoc) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Document deleted successfully",
        document: updatedDoc,
      });
    }
  } catch (err) {
    console.error("❌ Error deleting document:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error occurred while deleting document",
    });
  }
};

// Get all documents with user info (admin function)
exports.getAllDocuments = async (req, res) => {
  try {
    // Get all documents with user details using aggregation
    const documentsWithUserInfo = await Document.aggregate([
      {
        $lookup: {
          from: "users", // Make sure this matches your User collection name
          let: { userIdString: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", { $toObjectId: "$$userIdString" }] }, // If userId is stored as string but _id is ObjectId
                    { $eq: [{ $toString: "$_id" }, "$$userIdString"] }, // If both need string comparison
                  ],
                },
              },
            },
          ],
          as: "userInfo",
        },
      },
      {
        $unwind: {
          path: "$userInfo",
          preserveNullAndEmptyArrays: true, // Keep documents even if user not found
        },
      },
      {
        $project: {
          userId: 1,
          userName: { $ifNull: ["$userInfo.name", "N/A"] },
          userEmail: { $ifNull: ["$userInfo.email", "N/A"] },
          driverLicense: 1,
          socialSecurity: 1,
          w2: 1,
          f1099: 1,
          form1040: 1,
          misc: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { updatedAt: -1 }, // Sort by most recently updated
      },
    ]);

    res.status(200).json({
      success: true,
      message: "All documents with user info retrieved successfully",
      data: documentsWithUserInfo,
    });
  } catch (err) {
    console.error("❌ Error fetching all documents with user info:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error occurred while fetching documents",
    });
  }
};

// Alternative simpler approach if aggregation doesn't work
exports.getAllDocumentsSimple = async (req, res) => {
  try {
    const documents = await Document.find({}).sort({ updatedAt: -1 });

    // Get user info for each document
    const documentsWithUserInfo = await Promise.all(
      documents.map(async (doc) => {
        try {
          // Try to find user by converting userId to ObjectId or using as string
          let user = null;

          // First try: userId as ObjectId
          try {
            const ObjectId = require("mongoose").Types.ObjectId;
            if (ObjectId.isValid(doc.userId)) {
              user = await User.findById(doc.userId).select("name email");
            }
          } catch (e) {
            // If ObjectId conversion fails, continue
          }

          // Second try: userId as string in a custom field
          if (!user) {
            user = await User.findOne({ userId: doc.userId }).select(
              "name email"
            );
          }

          // Third try: any other user identifier field you might have
          if (!user) {
            user = await User.findOne({ _id: doc.userId }).select("name email");
          }

          return {
            ...doc.toObject(),
            userName: user?.name || "N/A",
            userEmail: user?.email || "N/A",
          };
        } catch (err) {
          console.error(
            `Error fetching user info for userId ${doc.userId}:`,
            err
          );
          return {
            ...doc.toObject(),
            userName: "N/A",
            userEmail: "N/A",
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "All documents with user info retrieved successfully",
      data: documentsWithUserInfo,
    });
  } catch (err) {
    console.error("❌ Error fetching all documents:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Error occurred while fetching documents",
    });
  }
};
