import { Router, Request, Response } from 'express'
import App from '../modules/App'
import AccountModule from '../modules/Account'

type NoLoginInterface = { [key: string]: string[] | '*' }

const no_login_interface: NoLoginInterface = {
  account: ['login', 'query', 'exist', 'create', 'exists', 'avatar'],
  lib: ['captcha'],
  snippet: ['query', 'get', 'execute', 'changes'],
  fav: ['query', 'get'],
  comment: ['query', 'get']
}

const router = Router()

router.all('/:interface/:fn*', (req: Request, res: Response, next) => {
  const iface = String(req.params['interface'])
  const fn = String(req.params.fn)

  const account = new AccountModule(req.session as any)

  const allowedFns = no_login_interface[iface]
  if (!account.islogin && (!allowedFns || (allowedFns !== '*' && allowedFns.indexOf(fn) < 0))) {
    return res.json(App.error.nologin)
  }

  next()
})

export default router
