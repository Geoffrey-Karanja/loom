import { exportAsJSON, exportAsMarkdown, exportAsCSV } from '../services/exportService.js'

export async function exportRouter(app) {

  app.get('/json', async (req, reply) => {
    const data = exportAsJSON()
    reply
      .header('Content-Disposition', 'attachment; filename="loom-export.json"')
      .header('Content-Type', 'application/json')
      .send(JSON.stringify(data, null, 2))
  })

  app.get('/markdown', async (req, reply) => {
    const data = exportAsMarkdown()
    reply
      .header('Content-Disposition', 'attachment; filename="loom-export.md"')
      .header('Content-Type', 'text/markdown')
      .send(data)
  })

  app.get('/csv', async (req, reply) => {
    const data = exportAsCSV()
    reply
      .header('Content-Disposition', 'attachment; filename="loom-export.csv"')
      .header('Content-Type', 'text/csv')
      .send(data)
  })
}
