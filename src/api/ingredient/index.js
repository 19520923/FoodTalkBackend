import { Router } from 'express'
import { middleware as query } from 'querymen'
import { token } from '../../services/passport'
import { index } from './controller'
export Ingredient, { schema } from './model'

const router = new Router()

/**
 * @api {get} /ingredients Retrieve ingredients
 * @apiName RetrieveIngredients
 * @apiGroup Ingredient
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of ingredients.
 * @apiSuccess {Object[]} rows List of ingredients.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

export default router
