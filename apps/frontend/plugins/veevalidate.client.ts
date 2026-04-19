import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, confirmed } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import tr from '@vee-validate/i18n/dist/locale/tr.json'

export default defineNuxtPlugin(() => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('max', max)
  defineRule('confirmed', confirmed)

  configure({
    generateMessage: localize({ tr }),
  })
})
