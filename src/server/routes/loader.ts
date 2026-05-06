import { Router, Request, Response } from 'express'
import App from '../modules/App'

type StaticModule = { cache?: Record<string, number>; prototype: any } & (new (session: any) => any)

/**
 * Create a sanitized copy of req.body, stripping prototype-polluting keys.
 */
function sanitizeBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {}
  const clean: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(body as Record<string, unknown>)) {
    if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
      clean[key] = val
    }
  }
  return clean
}

/**
 * Safely invoke a method by name on an instance.
 * The method must be defined directly on the instance's prototype (not inherited from Object).
 * Returns a bound function to prevent prototype pollution via user-controlled method names.
 */
function resolveMethod(instance: any, Module: StaticModule, fn: string): ((...args: any[]) => any) | null {
  const proto = Module.prototype
  const descriptor = Object.getOwnPropertyDescriptor(proto, fn)
  if (descriptor && typeof descriptor.value === 'function') {
    const method: (...args: any[]) => any = descriptor.value
    return (...args: any[]) => method.apply(instance, args)
  }
  const staticDescriptor = Object.getOwnPropertyDescriptor(Module, fn)
  if (staticDescriptor && typeof staticDescriptor.value === 'function') {
    const staticMethod: (...args: any[]) => any = staticDescriptor.value
    return (...args: any[]) => staticMethod.apply(Module, args)
  }
  return null
}

function loader(Module: StaticModule): Router {
  const router = Router()

  router.all('/:fn*', (req: Request, res: Response, next) => {
    const fn = String(req.params.fn)
    if (fn.slice(0, 1) === '_') return res.json(App.error.limited)
    // Verify the method exists on the module prototype before allowing dispatch
    const proto = Module.prototype
    const hasInstance = proto && Object.prototype.hasOwnProperty.call(proto, fn) && typeof proto[fn] === 'function'
    const hasStatic = Object.prototype.hasOwnProperty.call(Module, fn) && typeof (Module as any)[fn] === 'function'
    if (!hasInstance && !hasStatic) return res.json(App.error.limited)
    if ((Module as any).cache?.[fn]) {
      res.header('Cache-Control', `public,max-age=${(Module as any).cache[fn]}`)
    }
    next()
  })

  router.post('/:fn', async (req: Request, res: Response) => {
    try {
      const instance = new Module(req.session)
      const fn = String(req.params.fn)
      const method = resolveMethod(instance, Module, fn)
      if (!method) throw instance.error.param
      const ret = await method(sanitizeBody(req.body))
      if (ret instanceof Buffer) { res.write(ret); res.end() } else { res.json(ret) }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  router.get('/:fn/:param', async (req: Request, res: Response) => {
    try {
      const instance = new Module(req.session)
      const fn = String(req.params.fn)
      const method = resolveMethod(instance, Module, fn)
      if (!method) throw instance.error.param
      const ret = await method(String(req.params.param))
      if (ret instanceof Buffer) { res.write(ret); res.end() } else { res.json(ret) }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  router.get('/:fn', async (req: Request, res: Response) => {
    try {
      const instance = new Module(req.session)
      const fn = String(req.params.fn)
      const method = resolveMethod(instance, Module, fn)
      if (!method) throw instance.error.param
      const ret = await method(req.query)
      if (ret instanceof Buffer) { res.write(ret); res.end() } else { res.json(ret) }
    } catch (err) {
      return res.json(App.err(err))
    }
  })

  return router
}

export default loader
