import { Router } from 'express'
import { token } from '../../services/passport'
import { show } from './controller'

const router = new Router()

/**
 * @api {get} /dashboard/:id Retrieve dashboard
 * @apiName RetrieveDashboard
 * @apiGroup Dashboard
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess {Object} dashboard Dashboard's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Dashboard not found.
 * @apiError 401 admin access only.
 */
router.get('/:year',
  token({ required: true, roles: ['admin'] }),
  show)

export default router
