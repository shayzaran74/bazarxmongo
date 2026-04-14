
// @ts-nocheck


export const localeCodes =  [
  "tr",
  "en"
]

export const localeLoaders = {
  "tr": [{ key: "../locales/tr.json", load: () => import("../locales/tr.json" /* webpackChunkName: "locale__Users_macbook_Desktop_barter_barterborsa_barterborsa_frontend_locales_tr_json" */), cache: true }],
  "en": [{ key: "../locales/en.json", load: () => import("../locales/en.json" /* webpackChunkName: "locale__Users_macbook_Desktop_barter_barterborsa_barterborsa_frontend_locales_en_json" */), cache: true }]
}

export const vueI18nConfigs = [
  
]

export const nuxtI18nOptions = {
  "experimental": {
    "localeDetector": "",
    "switchLocalePathLinkSSR": false,
    "autoImportTranslationFunctions": false
  },
  "bundle": {
    "compositionOnly": true,
    "runtimeOnly": false,
    "fullInstall": true,
    "dropMessageCompiler": false
  },
  "compilation": {
    "jit": true,
    "strictMessage": true,
    "escapeHtml": false
  },
  "customBlocks": {
    "defaultSFCLang": "json",
    "globalSFCScope": false
  },
  "vueI18n": "",
  "locales": [
    {
      "code": "tr",
      "language": "tr-TR",
      "name": "Türkçe",
      "files": [
        "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/tr.json"
      ]
    },
    {
      "code": "en",
      "language": "en-US",
      "name": "English",
      "files": [
        "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/en.json"
      ]
    }
  ],
  "defaultLocale": "tr",
  "defaultDirection": "ltr",
  "routesNameSeparator": "___",
  "trailingSlash": false,
  "defaultLocaleRouteNameSuffix": "default",
  "strategy": "prefix_except_default",
  "lazy": true,
  "langDir": "locales",
  "detectBrowserLanguage": {
    "alwaysRedirect": false,
    "cookieCrossOrigin": false,
    "cookieDomain": null,
    "cookieKey": "i18n_redirected",
    "cookieSecure": false,
    "fallbackLocale": "",
    "redirectOn": "root",
    "useCookie": true
  },
  "differentDomains": false,
  "baseUrl": "",
  "dynamicRouteParams": false,
  "customRoutes": "page",
  "pages": {},
  "skipSettingLocaleOnNavigate": false,
  "types": "composition",
  "debug": false,
  "parallelPlugin": false,
  "multiDomainLocales": false,
  "i18nModules": []
}

export const normalizedLocales = [
  {
    "code": "tr",
    "language": "tr-TR",
    "name": "Türkçe",
    "files": [
      {
        "path": "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/tr.json"
      }
    ]
  },
  {
    "code": "en",
    "language": "en-US",
    "name": "English",
    "files": [
      {
        "path": "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/en.json"
      }
    ]
  }
]

export const NUXT_I18N_MODULE_ID = "@nuxtjs/i18n"
export const parallelPlugin = false
export const isSSG = false

export const DEFAULT_DYNAMIC_PARAMS_KEY = "nuxtI18n"
export const DEFAULT_COOKIE_KEY = "i18n_redirected"
export const SWITCH_LOCALE_PATH_LINK_IDENTIFIER = "nuxt-i18n-slp"
