/* eslint-disable camelcase */
import { Post } from '../post'
import { User } from '../user'
import { Food } from '../food'

export const show = async ({ params }, res, next) => {
  const { year } = params
  const START_YEAR = new Date(year, 0, 1)
  console.log(START_YEAR)
  const END_YEAR = new Date(year, 11, 31)
  const total_users = await User.count({})
  const total_posts = await Post.count({})
  const total_foods = await Food.count({})
  const total_users_active = await User.count({ is_active: true })
  const total_users_deactive = await User.count({ is_active: false })
  const number_new_users_year = await User.aggregate([
    {
      $match: {
        $and: [
          {
            created_at: {
              $gte: START_YEAR
            }
          }, {
            created_at: {
              $lte: END_YEAR
            }
          }
        ]
      }
    }, {
      $group: {
        _id: {
          $dateToString: {
            date: '$created_at',
            format: '%m'
          }
        },
        count: {
          $sum: 1
        }
      }
    }
  ])
  const number_new_posts_year = await Post.aggregate([
    {
      $match: {
        $and: [
          {
            created_at: {
              $gte: START_YEAR
            }
          }, {
            created_at: {
              $lte: END_YEAR
            }
          }
        ]
      }
    }, {
      $group: {
        _id: {
          $dateToString: {
            date: '$created_at',
            format: '%m'
          }
        },
        count: {
          $sum: 1
        }
      }
    }
  ])

  const number_new_foods_year = await Food.aggregate([
    {
      $match: {
        $and: [
          {
            created_at: {
              $gte: START_YEAR
            }
          }, {
            created_at: {
              $lte: END_YEAR
            }
          }
        ]
      }
    }, {
      $group: {
        _id: {
          $dateToString: {
            date: '$created_at',
            format: '%m'
          }
        },
        count: {
          $sum: 1
        }
      }
    }
  ])

  const top_users = await User.find({ role: 'user' }).sort({ follower: -1 }).limit(5)

  const entity = {
    total_users,
    total_posts,
    total_foods,
    total_users_active,
    total_users_deactive,
    number_new_users_year,
    number_new_posts_year,
    number_new_foods_year,
    top_users: top_users.map(user => user.view())
  }

  res.status(200).json(entity)
}
