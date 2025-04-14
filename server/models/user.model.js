const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    totalBacklogHours: {
      type: Number,
      default: 0,
    },
    games: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
    ],

    // ✅ Add these fields:
    resetToken: {
      type: String,
    },
    resetTokenExpire: {
      type: Number, // or Date if you prefer working with Date objects
    },
  },
  {
    timestamps: true,
    methods: {
      async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
      },
    },
  }
);

// hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
