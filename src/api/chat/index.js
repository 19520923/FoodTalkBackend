import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, destroy } from './controller'
import { schema } from './model'
export Chat, { schema } from './model'

const router = new Router()

/**
 * @api {post} /chats Create chat
 * @apiName CreateChat
 * @apiGroup Chat
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam user_1 Chat's user_1.
 * @apiParam user_2 Chat's user_2.
 * @apiParam is_user_1_seen Chat's is_user_1_seen.
 * @apiParam is_user_2_seen Chat's is_user_2_seen.
 * @apiParam last_message Chat's last_message.
 * @apiSuccess {Object} chat Chat's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Chat not found.
 * @apiError 401 user access only.
 */
router.post('/:id',
  token({ required: true }),
  create)

/**
 * @api {get} /chats Retrieve chats
 * @apiName RetrieveChats
 * @apiGroup Chat
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of chats.
 * @apiSuccess {Object[]} rows List of chats.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {delete} /chats/:id Delete chat
 * @apiName DeleteChat
 * @apiGroup Chat
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Chat not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
