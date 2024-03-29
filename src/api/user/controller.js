import { success, notFound } from '../../services/response/'
import { User } from '.'
import { to } from '../../services/socket'
import jwt from 'jsonwebtoken'
import { jwtSecret, apiRoot } from '../../config'
import { sendMail } from '../../services/sendgrid'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  User.count({ ...query, role: 'user' })
    .then((count) =>
      User.find({ ...query, role: 'user' }, select, cursor).then((users) => ({
        rows: users.map((user) => user.view()),
        count
      }))
    )
    .then(success(res))
    .catch(next)

export const reported = ({ querymen: { query, select, cursor } }, res, next) =>
  User.count({ ...query, num_report: { $gt: 0 }, is_active: true, role: 'user' })
    .then((count) =>
      User.find({ ...query, num_report: { $gt: 0 }, role: 'user' }, select, cursor).then((users) => ({
        rows: users.map((user) => user.view()),
        count
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next)

export const showMe = ({ user }, res) => res.json(user.view())

export const create = ({ bodymen: { body } }, res, next) =>
  User.create(body)
    .then((user) => {
      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        noTimestamp: true,
        expiresIn: '15m'
      })
      const content = `
        Hey, ${user.name}.<br><br>
        You requested a new account for your Foodtalk.<br>
        Please use the following link to active your account. It will expire in 15 minutes.<br><br>
        <a href="${apiRoot}/api/auth/verify/${token}">Press here</a><br><br>
        If you didn't make this request then you can safely ignore this email. :)<br><br>
        &mdash; Foodtalk Team
      `
      return sendMail({
        toEmail: user.email,
        subject: 'Foodtalk - Active account',
        content
      })
    })
    .then(([response]) =>
      response ? res.status(response.statusCode).end() : null
    )
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: 'email',
          message: 'email already registered'
        })
      } else {
        next(err)
      }
    })

export const verifyAccount = ({ params }, res, next) =>
  User.findById(jwt.verify(params.token, jwtSecret))
    .then(notFound(res))
    .then((user) => (user ? user.set({ is_verified: true }).save() : null))
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = user.role === 'admin'
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: "You can't change other user's data"
        })
        return null
      }
      return result
    })
    .then((user) => (user ? Object.assign(user, body).save() : null))
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next)

export const updatePassword = (
  { bodymen: { body }, params, user },
  res,
  next
) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: 'password',
          message: "You can't change other user's password"
        })
        return null
      }
      return result
    })
    .then((user) =>
      user ? user.set({ password: body.password }).save() : null
    )
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => (user ? user.set({ is_active: false }).save() : null))
    .then(success(res, 204))
    .catch(next)

export const activate = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => (user ? user.set({ is_active: true }).save() : null))
    .then(success(res, 204))
    .catch(next)

export const follow = ({ params, user }, res, next) => {
  User.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      console.log(result)
      if (!result) return null
      if (user.id === params.id) {
        res.status(401).json({
          error: 'Follow failed',
          message: "You can't follow yourself"
        })
        return null
      }

      // if (result.follower.includes(user)) {
      //   res.status(401).json({
      //     error: "Follow failed",
      //     message: "Already followed",
      //   });
      //   return null;
      // }
      return result
    })
    .then(async (u) => {
      if (!u) return null
      u.follower.push(user.id)
      await User.updateOne(
        { _id: user.id },
        { $push: { following: u.id } },
        (err) => console.log(err)
      )
      return u.save()
    })
    .then((u) => (u ? u.view() : null))
    .then((u) => to('user:follow', u, user))
    .then(success(res))
    .catch(next)
}

export const unfollow = ({ params, user }, res, next) => {
  User.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      if (user.id === params.id) {
        res.status(401).json({
          error: 'Follow failed',
          message: "You can't unfollow yourself"
        })
        return null
      }

      // if (!result.follower.includes(user)) {
      //   res.status(401).json({
      //     error: "Follow failed",
      //     message: "Already unfollowed",
      //   });
      //   return null;
      // }
      return result
    })
    .then(async (u) => {
      if (!u) return null
      u.follower = u.follower.filter((f) => f.id !== user.id)
      await User.updateOne(
        { _id: user.id },
        { $pull: { following: u.id } },
        (err) => console.log(err)
      )
      return u.save()
    })
    .then((u) => (u ? u.view() : null))
    .then(success(res))
    .catch(next)
}

export const getFollowing = ({ params }, res, next) => {
  User.findById(params.id)
    .populate('following')
    .then(notFound(res))
    .then(user => user.following ? user.following.map(f => f.view()) : null)
    .then(success(res))
    .catch(next)
}

export const getFollower = ({ params }, res, next) => {
  User.findById(params.id)
    .populate('follower')
    .then(notFound(res))
    .then(user => user.follower ? user.follower.map(f => f.view()) : null)
    .then(success(res))
    .catch(next)
}
