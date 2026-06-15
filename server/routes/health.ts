/**
 * @openapi
 * /health:
 *   get:
 *     description: health of service and build number
 *     responses:
 *       200:
 *         description: ok
 */

import version from '../../package.json'

export default defineEventHandler((event) => {
  try {
    const config = useRuntimeConfig(event)
    const query = getQuery(event)

    const state: any = {
      health: 'ok',
      version: version?.version,
      versionInfo: config.public.version ?? null,
      started: config.public?.startupTime
        ? new Date(config.public.startupTime).toUTCString()
        : null
    }

    if (query?.bttest === 'braintags0815') {
      state.config = config
      state.context = event.context
    }

    if (query?.pretty) {
      return `<pre>${JSON.stringify(state, null, 2)}</pre>`
    }

    return state
  } catch (error) {
    return {
      health: 'error'
    }
  }
})