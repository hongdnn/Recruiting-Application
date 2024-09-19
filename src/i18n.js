import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { vi } from './locales/vi'
import { en } from './locales/en'

Vue.use(VueI18n)

let messages = {
  vi: vi,
  en: en,
}

export const test_messages = {
  vi: {
    post: {
      menu: "Công việc",
      filter: "Lọc theo",
      search: "Tìm kiếm"
    }
  },
  en: {
    post: {
      menu: "Job",
      filter: "Filter by",
      search: "Search"
    }
  }
}

export function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.js$/i)
  return locales.keys()[0].match(/([A-Za-z0-9-_]+)\./i)
  // const messages = {}
  // locales.keys().forEach(key => {
  //   const matched = key.match(/([A-Za-z0-9-_]+)\./i)
  //   if (matched && matched.length > 1) {
  //     const locale = matched[1]
  //     messages[locale] = locales(key)
  //   }
  // })
  // return messages
}


export function loadMessage() {
  // var file = new File()
  // file.

  var fileread = new FileReader();
  fileread.readAsText

  // var data = FileReader.

  var vi_data = fs.readFileSync('./locales/vi.json', 'utf8')
  var vi_json = JSON.parse(vi_data);

  var en_data = fs.readFileSync('./locales/en.json', 'utf8')
  var en_json = JSON.parse(en_data);

  return {
    vi: vi_json,
    en: en_json,
  }
}

export default new VueI18n({
  locale: 'vi',
  fallbackLocale: 'vi',
  messages,
})
