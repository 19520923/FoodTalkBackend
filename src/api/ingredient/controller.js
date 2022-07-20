import { success } from '../../services/response/'
import { Ingredient } from '.'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Ingredient.count(query)
    .then(count => Ingredient.find(query, select, cursor)
      .then((ingredients) => ({
        count,
        rows: ingredients.map((ingredient) => ingredient.view())
      }))
    )
    .then(success(res))
    .catch(next)
