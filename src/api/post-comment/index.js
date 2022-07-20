import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, update, destroy } from './controller'
import { schema } from './model'
export PostComment, { schema } from './model'

const router = new Router()
const { post, content, parent } = schema.tree

/**
 * @api {post} /post-comments Create post comment
 * @apiName CreatePostComment
 * @apiGroup PostComment
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam post Post comment's post.
 * @apiParam content Post comment's content.
 * @apiParam parent Post comment's parent.
 * @apiSuccess {Object} postComment Post comment's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Post comment not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ post, content, parent }),
  create)

/**
 * @api {get} /post-comments Retrieve post comments
 * @apiName RetrievePostComments
 * @apiGroup PostComment
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of post comments.
 * @apiSuccess {Object[]} rows List of post comments.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  query(),
  index)

/**
 * @api {put} /post-comments/:id Update post comment
 * @apiName UpdatePostComment
 * @apiGroup PostComment
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam post Post comment's post.
 * @apiParam content Post comment's content.
 * @apiParam parent Post comment's parent.
 * @apiSuccess {Object} postComment Post comment's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Post comment not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ post, content, parent }),
  update)

/**
 * @api {delete} /post-comments/:id Delete post comment
 * @apiName DeletePostComment
 * @apiGroup PostComment
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Post comment not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
