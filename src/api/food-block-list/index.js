import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, destroy } from './controller'
import { schema } from './model'
export FoodBlockList, { schema } from './model'

const router = new Router()
const { food, reason } = schema.tree
const schema_q = new Schema({
  post: String
})

/**
 * @api {post} /food-block-lists Create food block list
 * @apiName CreateFoodBlockList
 * @apiGroup FoodBlockList
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam food Food block list's food.
 * @apiParam reason Food block list's reason.
 * @apiSuccess {Object} foodBlockList Food block list's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food block list not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ food, reason }),
  create)

/**
 * @api {get} /food-block-lists Retrieve food block lists
 * @apiName RetrieveFoodBlockLists
 * @apiGroup FoodBlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of food block lists.
 * @apiSuccess {Object[]} rows List of food block lists.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.get('/',
  token({ required: true, roles: ['admin'] }),
  query(schema_q),
  index)

/**
 * @api {delete} /food-block-lists/:id Delete food block list
 * @apiName DeleteFoodBlockList
 * @apiGroup FoodBlockList
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Food block list not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)

export default router
