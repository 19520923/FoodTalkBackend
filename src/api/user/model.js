import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { env } from '../../config'

const roles = ['user', 'admin']
export const fields = [
  '_id',
  'name',
  'email',
  'username',
  'is_current',
  'avatar_url',
  'cover_url',
  'about',
  'last_login',
  'following',
  'follower',
  'socket_id',
  'created_at',
  'is_active',
  'num_report'
]

const userSchema = new Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    name: {
      type: String,
      index: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    is_current: {
      type: Boolean,
      default: false
    },
    is_active: {
      type: Boolean,
      default: true
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    avatar_url: {
      type: String,
      trim: true
    },
    cover_url: {
      type: String,
      trim: true,
      default:
        'https://firebasestorage.googleapis.com/v0/b/login-183fb.appspot.com/o/images%2Fdefault%2Fwatercolor-painting-purple-abstract-background_41066-2265.webp?alt=media&token=46efa03b-e270-4212-9d38-2c735a4e483d'
    },
    follower: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    about: {
      type: String,
      default: ''
    },
    socket_id: String,
    last_login: Date,
    services: {
      facebook: String,
      google: String
    },
    role: {
      type: String,
      enum: roles,
      default: 'user'
    },
    num_report: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

userSchema.path('email').set(function (email) {
  if (
    !this.avatar_url ||
    this.avatar_url.indexOf('https://gravatar.com') === 0
  ) {
    const hash = crypto.createHash('md5').update(email).digest('hex')
    this.avatar_url = `https://gravatar.com/avatar/${hash}?d=identicon`
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

// hash password
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  /* istanbul ignore next */
  const rounds = env === 'test' ? 1 : 9

  bcrypt
    .hash(this.password, rounds)
    .then((hash) => {
      this.password = hash
      next()
    })
    .catch(next)
})

/* Populating the follower and following fields. */
// userSchema.pre(/^find/, function (next) {
//   if (this.options._recursed) {
//     return next();
//   }
//   this.populate({
//     path: "follower following",
//     select: fields,
//     options: { _recursed: true },
//   });
//   next();
// });

userSchema.methods = {
  /* A method that returns the user's data. */
  view () {
    const view = {}
    fields.forEach((field) => {
      view[field] = this[field]
    })
    return view
  },

  /* A method that is used to authenticate the user. */
  async authenticate (password) {
    const valid = await bcrypt.compare(password, this.password)
    return valid ? this : false
  }
}

userSchema.statics = {
  roles,

  createFromService ({ service, id, email, name, avatar_url }) {
    return this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }]
    }).then((user) => {
      if (user) {
        user.services[service] = id
        user.name = name
        user.avatar_url = avatar_url
        return user.save()
      } else {
        const password = randtoken.generate(16)
        return this.create({
          services: { [service]: id },
          email,
          password,
          name,
          avatar_url
        })
      }
    })
  }
}

userSchema.plugin(mongooseKeywords, { paths: ['email', 'name', 'username'] })

const model = mongoose.model('User', userSchema)

export const schema = model.schema
export default model
