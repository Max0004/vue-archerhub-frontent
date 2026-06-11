// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    postgres: {
      host: import.meta.env.NUXT_POSTGRES_HOST,
      user: import.meta.env.NUXT_POSTGRES_USER,
      password: import.meta.env.NUXT_POSTGRES_PASSWORD,
      database: import.meta.env.NUXT_POSTGRES_DATABASE,
      table: import.meta.env.NUXT_POSTGRES_TABLE,
      port: Number(import.meta.env.NUXT_POSTGRES_PORT),
    }
  }
})
