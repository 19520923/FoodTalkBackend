import { Router } from "express";
import { middleware as query } from "querymen";
import { middleware as body } from "bodymen";
import { token } from "../../services/passport";
import { create, index, update, destroy } from "./controller";
import { schema } from "./model";
export Message, { schema } from "./model";

const router = new Router();
const { chat, content, type } = schema.tree;

/**
 * @api {post} /messages Create message
 * @apiName CreateMessage
 * @apiGroup Message
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam chat Message's chat.
 * @apiParam content Message's content.
 * @apiParam type Message's type.
 * @apiSuccess {Object} message Message's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Message not found.
 * @apiError 401 user access only.
 */
router.post(
  "/",
  token({ required: true }),
  body({ chat, content, type }),
  create
);

/**
 * @api {get} /messages Retrieve messages
 * @apiName RetrieveMessages
 * @apiGroup Message
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of messages.
 * @apiSuccess {Object[]} rows List of messages.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get("/:id", token({ required: true }), query(), index);

/**
 * @api {put} /messages/:id Update message
 * @apiName UpdateMessage
 * @apiGroup Message
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam chat Message's chat.
 * @apiParam content Message's content.
 * @apiParam type Message's type.
 * @apiSuccess {Object} message Message's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Message not found.
 * @apiError 401 user access only.
 */
router.put(
  "/:id",
  token({ required: true }),
  body({ chat, content, type }),
  update
);

/**
 * @api {delete} /messages/:id Delete message
 * @apiName DeleteMessage
 * @apiGroup Message
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Message not found.
 * @apiError 401 user access only.
 */
router.delete("/:id", token({ required: true }), destroy);

export default router;
