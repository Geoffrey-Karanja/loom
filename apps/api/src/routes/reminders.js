import {
  createReminder, getReminders, getDueReminders,
  markDone, markFired, deleteReminder, updateReminder
} from '../services/reminderService.js'

export async function remindersRouter(app) {

  app.get('/', async (req) => {
    const all = req.query.all === 'true'
    return getReminders(all)
  })

  app.get('/due', async () => getDueReminders())

  app.post('/', async (req, reply) => {
    const reminder = await createReminder(req.body)
    return reply.code(201).send(reminder)
  })

  app.patch('/:id', async (req, reply) => {
    const updated = await updateReminder(req.params.id, req.body)
    if (!updated) return reply.code(404).send({ error: 'not found' })
    return updated
  })

  app.post('/:id/done', async (req, reply) => {
    const r = await markDone(req.params.id)
    if (!r) return reply.code(404).send({ error: 'not found' })
    return r
  })

  app.post('/:id/fired', async (req, reply) => {
    const r = await markFired(req.params.id)
    if (!r) return reply.code(404).send({ error: 'not found' })
    return r
  })

  app.delete('/:id', async (req, reply) => {
    await deleteReminder(req.params.id)
    return reply.code(204).send()
  })
}
