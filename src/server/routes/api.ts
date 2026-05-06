import { Router, Request, Response } from 'express'
import accessRouter from './access'
import libRouter from './lib'
import loader from './loader'
import AccountModule from '../modules/Account'
import SnippetModule from '../modules/Snippet'
import CommentModule from '../modules/Comment'
import FavModule from '../modules/Fav'

const router = Router()

router.use(accessRouter)
router.use('/lib', libRouter)
router.use('/account', loader(AccountModule as any))
router.use('/snippet', loader(SnippetModule as any))
router.use('/comment', loader(CommentModule as any))
router.use('/fav', loader(FavModule as any))

/**
 * @openapi
 * /:
 *   get:
 *     summary: API index
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({ state: 0, msg: 'Code Snippet API' })
})

export default router
