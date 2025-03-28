const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Backlog", "Playing", "Completed", "On Hold", "Dropped"],
      default: "Backlog",
    },
    platform: {
      type: String,
      required: true,
    },
    estimatedPlayTime: {
      type: Number, // hours
      default: 0,
    },
    actualPlayTime: {
      type: Number, // hours
      default: 0,
    },
    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
      validate: {
        validator: Number.isInteger,
        message: "priority must be an integer between 1 and 5"
    }
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", GameSchema);
