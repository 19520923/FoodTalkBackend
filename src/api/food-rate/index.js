import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, update, destroy } from './controller'
import { schema } from './model'
export FoodRate, { schema } from './model'

const router = new Router()
const { food, content, score } = schema.tree

/**
 * @api {post} /food-rates Create food rate
 * @apiName CreateFoodRate
 * @apiGroup FoodRate
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam food Food rate's food.
 * @apiParam content Food rate's content.
 * @apiParam score Food rate's score.
 * @apiSuccess {Object} foodRate Food rate's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food rate not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ food, content, score }),
  create)

/**
 * @api {get} /food-rates Retrieve food rates
 * @apiName RetrieveFoodRates
 * @apiGroup FoodRate
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of food rates.
 * @apiSuccess {Object[]} rows List of food rates.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  query(),
  index)

/**
 * @api {put} /food-rates/:id Update food rate
 * @apiName UpdateFoodRate
 * @apiGroup FoodRate
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam food Food rate's food.
 * @apiParam content Food rate's content.
 * @apiParam score Food rate's score.
 * @apiSuccess {Object} foodRate Food rate's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Food rate not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ food, content, score }),
  update)

/**
 * @api {delete} /food-rates/:id Delete food rate
 * @apiName DeleteFoodRate
 * @apiGroup FoodRate
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Food rate not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
