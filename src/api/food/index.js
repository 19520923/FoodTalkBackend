import { Router } from 'express'
import { middleware as query, Schema } from 'querymen'
import { middleware as body } from 'bodymen'
import { master, token } from '../../services/passport'
import {
  create,
  index,
  update,
  destroy,
  showPersonal,
  reported,
  activate
} from './controller'
import { schema } from './model'
export Food, { schema } from './model'

const router = new Router()
const { name, ingredients, recipe, photo } = schema.tree
const schema_q = new Schema({
  is_active: Boolean
})
/**
 * @api {post} /foods Create food
 * @apiName CreateFood
 * @apiGroup Food
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiParam name Food's name.
 * @apiParam ingredients Food's ingredients.
 * @apiParam recipe Food's recipe.
 * @apiParam avg_score Food's avg_score.
 * @apiParam author Food's author.
 * @apiParam photo Food's photo.
 * @apiParam num_rate Food's num_rate.
 * @apiSuccess {Object} food Food's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food not found.
 * @apiError 401 master access only.
 */
router.post(
  '/',
  token({ required: true }),
  body({ name, ingredients, recipe, photo }),
  create
)

/**
 * @api {get} /foods Retrieve foods
 * @apiName RetrieveFoods
 * @apiGroup Food
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of foods.
 * @apiSuccess {Object[]} rows List of foods.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/', token({ required: true }), query(schema_q), index)
router.get('/:id', token({ required: true }), query(schema_q), showPersonal)

/**
 * @api {get} /foods/:id Retrieve food
 * @apiName RetrieveFood
 * @apiGroup Food
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} food Food's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food not found.
 * @apiError 401 user access only.
 */
// router.get("/:id", token({ required: true }), show);

/**
 * @api {put} /foods/:id Update food
 * @apiName UpdateFood
 * @apiGroup Food
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiParam name Food's name.
 * @apiParam ingredients Food's ingredients.
 * @apiParam recipe Food's recipe.
 * @apiParam avg_score Food's avg_score.
 * @apiParam author Food's author.
 * @apiParam photo Food's photo.
 * @apiParam num_rate Food's num_rate.
 * @apiSuccess {Object} food Food's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food not found.
 * @apiError 401 master access only.
 */
router.put(
  '/:id',
  token({ required: true }),
  body({ name, ingredients, recipe, photo }),
  update
)

/**
 * @api {delete} /foods/:id Delete food
 * @apiName DeleteFood
 * @apiGroup Food
 * @apiPermission master
 * @apiParam {String} access_token master access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Food not found.
 * @apiError 401 master access only.
 */
router.delete('/:id', token({ required: true, roles: ['admin'] }), destroy)
router.post('/:id/activate', token({ required: true, roles: ['admin'] }), activate)
router.get('/list/reported', token({ required: true }), query(), reported)

export default router
