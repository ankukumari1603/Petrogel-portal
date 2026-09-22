import { Router } from 'express'
import { create, dashboard, getOne, list, remove, update } from '../controllers/resourceController.js'

const router = Router()
const resources = ['customers', 'products', 'formulations', 'production', 'qc', 'lab', 'inventory', 'requirements']

resources.forEach((resource) => {
  router.get(`/${resource}`, (req, res, next) => list(resource, req, res, next))
  router.post(`/${resource}`, (req, res, next) => create(resource, req, res, next))
  router.get(`/${resource}/:id`, (req, res, next) => getOne(resource, req, res, next))
  router.put(`/${resource}/:id`, (req, res, next) => update(resource, req, res, next))
  router.delete(`/${resource}/:id`, (req, res, next) => remove(resource, req, res, next))
})

router.get('/alerts', (req, res, next) => list('alerts', req, res, next))
router.put('/alerts/:id', (req, res, next) => update('alerts', req, res, next))
router.get('/dashboard', dashboard)

export default router
