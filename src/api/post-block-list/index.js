import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, destroy } from './controller'
import { schema } from './model'
export BlockList, { schema } from './model'

const router = new Router()
const { post, reason } = schema.tree
const schema_q = new Schema({
  post: String
})

/**
 * @api {post} /block-lists Create block list
 * @apiName CreateBlockList
 * @apiGroup BlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam post Block list's post.
 * @apiParam food Block list's food.
 * @apiParam user Block list's user.
 * @apiParam type Block list's type.
 * @apiParam reason Block list's reason.
 * @apiSuccess {Object} blockList Block list's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Block list not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true }),
  body({ post, reason }),
  create)

/**
 * @api {get} /block-lists Retrieve block lists
 * @apiName RetrieveBlockLists
 * @apiGroup BlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of block lists.
 * @apiSuccess {Object[]} rows List of block lists.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.get('/',
  token({ required: true, roles: ['admin'] }),
  query(schema_q),
  index)

/**
 * @api {delete} /block-lists/:id Delete block list
 * @apiName DeleteBlockList
 * @apiGroup BlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Block list not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
