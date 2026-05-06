import { Router, Request, Response } from 'express'
import App from '../modules/App'

type StaticModule = { cache?: Record<string, number> } & (new (session: any) => any)

function loader(Module: StaticModule): Router {
  const router = Router()

  router.all('/:fn*', (req: Request, res: Response, next) => {
    const fn = String(req.params.fn)
    if (fn.slice(0, 1) === '_') return res.json(App.error.limited)
    if ((Module as any).cache && (Module as any).cache[fn]) {
      res.header('Cache-Control', `public,max-age=${(Module as any).cache[fn]}`)
    }
    next()
  })

  router.post('/:fn', async (req: Request, res: Response) => {
    try {
      const module = new Module(req.session)
      const fn = String(req.params.fn)
      let ret: unknown = null
      if (typeof module[fn] === 'function') {
        ret = await module[fn](Object.assign({}, req.body))
      } else if (typeof (Module as any)[fn] === 'function') {
        ret = await (Module as any)[fn](Object.assign({}, req.body))
      } else {
        throw module.error.param
      }
      if (ret instanceof Buffer) {
        res.write(ret)
        res.end()
      } else {
        res.json(ret)
      }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  router.get('/:fn/:param', async (req: Request, res: Response) => {
    try {
      const module = new Module(req.session)
      const fn = String(req.params.fn)
      const param = String(req.params.param)
      let ret: unknown = null
      if (typeof module[fn] === 'function') {
        ret = await module[fn](param)
      } else if (typeof (Module as any)[fn] === 'function') {
        ret = await (Module as any)[fn](param)
      } else {
        throw module.error.param
      }
      if (ret instanceof Buffer) {
        res.write(ret)
        res.end()
      } else {
        res.json(ret)
      }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  router.get('/:fn', async (req: Request, res: Response) => {
    try {
      const module = new Module(req.session)
      const fn = String(req.params.fn)
      const param = req.query
      let ret: unknown = null
      if (typeof module[fn] === 'function') {
        ret = await module[fn](param)
      } else if (typeof (Module as any)[fn] === 'function') {
        ret = await (Module as any)[fn](param)
      } else {
        throw module.error.param
      }
      if (ret instanceof Buffer) {
        res.write(ret)
        res.end()
      } else {
        res.json(ret)
      }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  return router
}

export default loader
