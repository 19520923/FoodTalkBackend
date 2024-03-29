
import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import {
  password as passwordAuth,
  master,
  token
} from '../../services/passport'
import {
  index,
  showMe,
  show,
  create,
  update,
  updatePassword,
  destroy,
  follow,
  unfollow,
  getFollowing,
  getFollower,
  activate,
  reported
} from './controller'
import { schema } from './model'
export User, { schema, fields } from './model'

const router = new Router()
const { email, password, name, about, username, role, avatar_url, cover_url } =
  schema.tree

const schema_q = new Schema({
  is_active: Boolean
})
/**
 * @api {get} /users Retrieve users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} users List of users.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/', token({ required: true }), query(schema_q), index)

/**
 * @api {get} /users/me Retrieve current user
 * @apiName RetrieveCurrentUser
 * @apiGroup User
 * @apiPermission user
 * @apiParam {String} access_token User access_token.
 * @apiSuccess {Object} user User's data.
 */
router.get('/me', token({ required: true }), showMe)

/**
 * @api {get} /users/:id Retrieve user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiPermission public
 * @apiSuccess {Object} user User's data.
 * @apiError 404 User not found.
 */
router.get('/:id', token({ required: true }), show)

/**
 * @api {post} /users Create user
 * @apiName CreateUser
 * @apiGroup User
 * @apiPermission master
 * @apiParam {String} access_token Master access_token.
 * @apiParam {String} email User's email.
 * @apiParam {String{6..}} password User's password.
 * @apiParam {String} [name] User's name.
 * @apiParam {String} [avatar_url] User's avatar.
 * @apiParam {String=user,admin} [role=user] User's role.
 * @apiSuccess (Sucess 201) {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Master access only.
 * @apiError 409 Email already registered.
 */
router.post(
  '/',
  master(),
  body({ email, password, name, username, role }),
  create
)

/**
 * @api {put} /users/:id Update user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiPermission user
 * @apiParam {String} access_token User access_token.
 * @apiParam {String} [name] User's name.
 * @apiParam {String} [picture] User's picture.
 * @apiSuccess {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current user or admin access only.
 * @apiError 404 User not found.
 */
router.put(
  '/:id',
  token({ required: true }),
  body({ name, username, about, cover_url, avatar_url }),
  update
)

/**
 * @api {put} /users/:id/password Update password
 * @apiName UpdatePassword
 * @apiGroup User
 * @apiHeader {String} Authorization Basic authorization with email and password.
 * @apiParam {String{6..}} password User's new password.
 * @apiSuccess (Success 201) {Object} user User's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Current user access only.
 * @apiError 404 User not found.
 */
router.put('/:id/password', passwordAuth(), body({ password }), updatePassword)

/**
 * @api {delete} /users/:id Delete user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 401 Admin access only.
 * @apiError 404 User not found.
 */
router.delete('/:id', token({ required: true, roles: ['admin'] }), destroy)

router.post('/:id', token({ required: true, roles: ['admin'] }), activate)

router.post('/follow/:id', token({ required: true }), follow)
router.post('/unfollow/:id', token({ required: true }), unfollow)
router.get('/:id/following', token({ required: true }), getFollowing)
router.get('/:id/follower', token({ required: true }), getFollower)
router.get('/list/reported', token({ required: true }), query(), reported)

export default router
