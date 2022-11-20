import { success, notFound } from '../../services/response'
import { BlockList } from '.'

export const create = ({ bodymen: { body }, user }, res, next) =>
  BlockList.create({ ...body, author: user.id })
    .then((blockList) => blockList.view())
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  BlockList.count(query)
    .then(count => BlockList.find(query, select, cursor)
      .then((blockLists) => ({
        count,
        rows: blockLists.map((blockList) => blockList.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  BlockList.find({ post: params.id })
    .then(notFound(res))
    .then((blockList) => blockList ? blockList.map(b => b.remove()) : null)
    .then(success(res, 204))
    .catch(next)
