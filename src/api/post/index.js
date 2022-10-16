import { Router } from "express";
import { middleware as query, Schema } from "querymen";
import { middleware as body } from "bodymen";
import { token } from "../../services/passport";
import { create, index, show, update, destroy, showUser, likeDislike, showLike } from "./controller";
import { schema } from "./model";
export Post, { schema } from "./model";

const router = new Router();
const {
  foods,
  content,
  photos,
  location,
  is_public,
} = schema.tree;

const schema_q = new Schema({
  is_active: Boolean,
});

/**
 * @api {post} /posts Create post
 * @apiName CreatePost
 * @apiGroup Post
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam foods Post's foods.
 * @apiParam content Post's content.
 * @apiParam photos Post's photos.
 * @apiParam reactions Post's reactions.
 * @apiParam num_comment Post's num_comment.
 * @apiParam num_heart Post's num_heart.
 * @apiParam location Post's location.
 * @apiParam is_public Post's is_public.
 * @apiSuccess {Object} post Post's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Post not found.
 * @apiError 401 user access only.
 */
router.post(
  "/",
  token({ required: true }),
  body({
    foods,
    content,
    photos,
    location,
    is_public,
  }),
  create
);

/**
 * @api {get} /posts Retrieve posts
 * @apiName RetrievePosts
 * @apiGroup Post
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of posts.
 * @apiSuccess {Object[]} rows List of posts.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get("/", token({ required: true }), query(schema_q), index);

router.get("/:id", token({ required: true }), query(), showUser);

/**
 * @api {get} /posts/:id Retrieve post
 * @apiName RetrievePost
 * @apiGroup Post
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} post Post's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Post not found.
 * @apiError 401 user access only.
 */
// router.get("/:id", token({ required: true }), show);

/**
 * @api {put} /posts/:id Update post
 * @apiName UpdatePost
 * @apiGroup Post
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam foods Post's foods.
 * @apiParam content Post's content.
 * @apiParam photos Post's photos.
 * @apiParam reactions Post's reactions.
 * @apiParam num_comment Post's num_comment.
 * @apiParam num_heart Post's num_heart.
 * @apiParam location Post's location.
 * @apiParam is_public Post's is_public.
 * @apiSuccess {Object} post Post's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Post not found.
 * @apiError 401 user access only.
 */
router.put(
  "/:id",
  token({ required: true }),
  body({
    foods,
    content,
    photos,
    location,
    is_public,
  }),
  update
);

/**
 * @api {delete} /posts/:id Delete post
 * @apiName DeletePost
 * @apiGroup Post
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Post not found.
 * @apiError 401 user access only.
 */
router.delete("/:id", token({ required: true }), destroy);
router.post("/:id/likeDislike", token({ required: true }), likeDislike);
router.get('/:id/reactions', token({ required: true }), showLike);

export default router;
