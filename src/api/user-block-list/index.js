import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, destroy } from './controller'
import { schema } from './model'
export UserBlockList, { schema } from './model'

const router = new Router()
const { user, reason } = schema.tree
const schema_q = new Schema({
  user: String
})

/**
 * @api {post} /user-block-lists Create user block list
 * @apiName CreateUserBlockList
 * @apiGroup UserBlockList
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam user User block list's user.
 * @apiParam reason User block list's reason.
 * @apiSuccess {Object} userBlockList User block list's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 User block list not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ user, reason }),
  create)

/**
 * @api {get} /user-block-lists Retrieve user block lists
 * @apiName RetrieveUserBlockLists
 * @apiGroup UserBlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of user block lists.
 * @apiSuccess {Object[]} rows List of user block lists.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.get('/',
  token({ required: true, roles: ['admin'] }),
  query(schema_q),
  index)

/**
 * @api {delete} /user-block-lists/:id Delete user block list
 * @apiName DeleteUserBlockList
 * @apiGroup UserBlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 User block list not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
