import { Restaurant, Product, RestaurantCategory, ProductCategory } from '../models/models.js'
import { Op } from 'sequelize'


const index = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        include:
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      },
        order: [[{ model: RestaurantCategory, as: 'restaurantCategory' }, 'name', 'ASC']]
      }
    )
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}

/*const indexOwner = async function (req, res) {
  try {
    const restaurants = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: req.user.id },
        include: [{
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }]//,
        //order: [['pinnedAt','ASC']]
      })
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}*/

const indexOwner = async function (req, res) {
  try {
    const pinned = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: req.user.id, pinnedAt:{ [Op.ne]: null }},
        include: [{
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }],
        order: [['pinnedAt','ASC']]
      })
    const notPinned = await Restaurant.findAll(
      {
        attributes: { exclude: ['userId'] },
        where: { userId: req.user.id, pinnedAt:{[Op.eq]: null }},
        include: [{
          model: RestaurantCategory,
          as: 'restaurantCategory'
        }]
      })
    const restaurants = [...pinned, ...notPinned]
    res.json(restaurants)
  } catch (err) {
    res.status(500).send(err)
  }
}


const create = async function (req, res) {
  const newRestaurant = Restaurant.build(req.body)//TODO pq sobra el campo pinned, no esta en la clase
  if(req.body.pinned === true)
    {
      newRestaurant.pinnedAt = new Date()
    }
  else
    {
      newRestaurant.pinnedAt = null
    }
  newRestaurant.userId = req.user.id // usuario actualmente autenticado
  try {
    const restaurant = await newRestaurant.save()
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const show = async function (req, res) {
  // Only returns PUBLIC information of restaurants
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId, {
      attributes: { exclude: ['userId'] },
      include: [{
        model: Product,
        as: 'products',
        include: { model: ProductCategory, as: 'productCategory' }
      },
      {
        model: RestaurantCategory,
        as: 'restaurantCategory'
      }],
      order: [[{ model: Product, as: 'products' }, 'order', 'ASC']]
    }
    )
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const update = async function (req, res) {
  try {
    await Restaurant.update(req.body, { where: { id: req.params.restaurantId } })
    const updatedRestaurant = await Restaurant.findByPk(req.params.restaurantId)
    res.json(updatedRestaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const destroy = async function (req, res) {
  try {
    const result = await Restaurant.destroy({ where: { id: req.params.restaurantId } })
    let message = ''
    if (result === 1) {
      message = 'Sucessfuly deleted restaurant id.' + req.params.restaurantId
    } else {
      message = 'Could not delete restaurant.'
    }
    res.json(message)
  } catch (err) {
    res.status(500).send(err)
  }
}

const togglePin = async function (req, res) {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (restaurant.pinnedAt !== null)
      {
        await restaurant.update({pinnedAt: null})//TODO
      }
      else
      {
        await restaurant.update({pinnedAt: new Date()})
      }
    res.json(restaurant)
  } catch (err) {
    res.status(500).send(err)
  }
}

const RestaurantController = {
  index,
  indexOwner,
  create,
  show,
  update,
  destroy,
  togglePin
}
export default RestaurantController
