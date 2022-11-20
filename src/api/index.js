import { Router } from 'express'
import user from './user'
import auth from './auth'
import passwordReset from './password-reset'
import food from './food'
import notification from './notification'
import foodRate from './food-rate'
import ingredient from './ingredient'
import post from './post'
import postComment from './post-comment'
import chat from './chat'
import message from './message'
import blockList from './post-block-list'
import foodBlockList from './food-block-list'
import userBlockList from './user-block-list'

const router = new Router()

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */
router.use('/users', user)
router.use('/auth', auth)
router.use('/password-resets', passwordReset)
router.use('/foods', food)
router.use('/notifications', notification)
router.use('/food-rates', foodRate)
router.use('/ingredients', ingredient)
router.use('/posts', post)
router.use('/post-comments', postComment)
router.use('/chats', chat)
router.use('/messages', message)
router.use('/post-block-lists', blockList)
router.use('/food-block-lists', foodBlockList)
router.use('/user-block-lists', userBlockList)

export default router
