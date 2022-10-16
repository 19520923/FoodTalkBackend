import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, destroy, seen } from './controller'
import { schema } from './model'
export Notification, { schema } from './model'

const router = new Router()
const { content } = schema.tree

/**
 * @api {post} /notifications Create notification
 * @apiName CreateNotification
 * @apiGroup Notification
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam type Notification's type.
 * @apiParam author Notification's author.
 * @apiParam receive Notification's receive.
 * @apiParam destination Notification's destination.
 * @apiParam is_seen Notification's is_seen.
 * @apiParam content Notification's content.
 * @apiParam data Notification's data.
 * @apiSuccess {Object} notification Notification's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Notification not found.
 * @apiError 401 admin access only.
 */
router.post('/',
  token({ required: true, roles: ['admin'] }),
  body({ content }),
  create)

/**
 * @api {get} /notifications Retrieve notifications
 * @apiName RetrieveNotifications
 * @apiGroup Notification
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of notifications.
 * @apiSuccess {Object[]} rows List of notifications.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {delete} /notifications/:id Delete notification
 * @apiName DeleteNotification
 * @apiGroup Notification
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Notification not found.
 * @apiError 401 admin access only.
 */
router.delete('/:id',
  token({ required: true, roles: ['admin'] }),
  destroy)


router.post("/:id/seen", token({ required: true }), seen)

export default router
