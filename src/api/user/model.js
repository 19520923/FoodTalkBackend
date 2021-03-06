/* eslint-disable camelcase */
import crypto from "crypto";
import bcrypt from "bcrypt";
import randtoken from "rand-token";
import mongoose, { Schema } from "mongoose";
import mongooseKeywords from "mongoose-keywords";
import { env } from "../../config";

const roles = ["user", "admin"];
export const fields = [
  "_id",
  "name",
  "email",
  "username",
  "is_current",
  "avatar_url",
  "cover_url",
  "about",
  "last_login",
  "following",
  "follower",
  "socket_id"
];

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      index: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    is_current: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_verified: {
      type: Boolean,
      default: true,
    },
    avatar_url: {
      type: String,
      trim: true,
    },
    cover_url: {
      type: String,
      trim: true,
      default:
        "https://i.pinimg.com/originals/28/35/be/2835be38b5274a4b20155999a7613542.jpg",
    },
    follower: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    about: String,
    socket_id: String,
    last_login: Date,
    services: {
      facebook: String,
      google: String,
    },
    role: {
      type: String,
      enum: roles,
      default: "user",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.path("email").set(function (email) {
  if (
    !this.avatar_url ||
    this.avatar_url.indexOf("https://gravatar.com") === 0
  ) {
    const hash = crypto.createHash("md5").update(email).digest("hex");
    this.avatar_url = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, "$1");
  }

  return email;
});

// hash password
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  /* istanbul ignore next */
  const rounds = env === "test" ? 1 : 9;

  bcrypt
    .hash(this.password, rounds)
    .then((hash) => {
      this.password = hash;
      next();
    })
    .catch(next);
});

userSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "follower following",
    select: fields,
    options: { _recursed: true },
  });
  next();
});

// get user
userSchema.methods = {
  view() {
    const view = {};
    fields.forEach((field) => {
      view[field] = this[field];
    });
    return view;
  },

  async authenticate(password) {
    const valid = await bcrypt.compare(password, this.password);
    return valid ? this : false;
  },

  async follow(user_id) {
    this.follower.push(user_id);

    await this.updateOne(
      { _id: user_id },
      { $push: { following: this.id } },
      (err) => console.log(err)
    );

    return this.save();
  },

  async unfollow(user_id) {
    this.follower = this.follower.filter(f => f.id === user_id);

    await this.updateOne(
      { _id: user_id },
      { $pullAll: { following: this.id } },
      (err) => console.log(err)
    );

    return this.save();
  },
};

userSchema.statics = {
  roles,

  createFromService({ service, id, email, name, avatar_url }) {
    return this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }],
    }).then((user) => {
      if (user) {
        user.services[service] = id;
        user.name = name;
        user.avatar_url = avatar_url;
        return user.save();
      } else {
        const password = randtoken.generate(16);
        return this.create({
          services: { [service]: id },
          email,
          password,
          name,
          avatar_url,
        });
      }
    });
  },
};

userSchema.plugin(mongooseKeywords, { paths: ["email", "name", "username"] });

const model = mongoose.model("User", userSchema);

export const schema = model.schema;
export default model;
