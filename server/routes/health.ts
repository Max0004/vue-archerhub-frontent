/**
 * @openapi
 * /health: 
 *        get: 
 *          description: health of service and build number
 *          responses:
 *              200: ok
 *                 
 *
 */
import version from '../../package.json'

/**
 * Just a health check and build number
 */
export default defineEventHandler((event) => {
  try {
    const state = {
        health: 'ok',
        version: version?.version,
        versionInfo: useRuntimeConfig(event).public.version ?? null,
        started: useRuntimeConfig(event).public?.startupTime ? new Date(useRuntimeConfig(event).public.startupTime).toUTCString() : null
      };
    
      if(getQuery(event)?.bttest == 'braintags0815') {
        state.config = useRuntimeConfig(event);
        state.context = event?.context
      }
    
      if(getQuery(event)?.pretty)
        return "<pre>" + JSON.stringify(state, null, 2) + "</pre>"
      else
        return state
  } catch(error) {
    return {
      health: 'error'
    }
  }
})