import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import router from "./router";
import ElementUI from "element-ui";
import locale from "element-ui/lib/locale/lang/en";
import "element-ui/lib/theme-chalk/index.css";
import vco from "v-click-outside";
import VueApexCharts from "vue-apexcharts";
import VueSweetalert2 from "vue-sweetalert2";
import VueSlideBar from "vue-slide-bar";
import Vuelidate from "vuelidate";
import i18n from "./i18n";
import store from "@/state/store";
import VueFormWizard from "vue-form-wizard";
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import firebase from "firebase"
import { initFacebookSdk } from "./helpers/facebook/init-facebook-sdk"
import App from "./App.vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
// import VueMaterial from 'vue-material'
// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css'
// Vue.use(VueMaterial)
// As a plugin
import VueMask from "v-mask";
Vue.config.productionTip = false;
Vue.use(Toast, {
    transition: "Vue-Toastification__bounce",
    maxToasts: 20,
    newestOnTop: true
});
initFacebookSdk()

//google sign in
import GAuth from 'vue-google-oauth2'
const gauthOption = {
    clientId: '',
    scope: 'profile email',
    prompt: 'select_account'
}
Vue.use(GAuth, gauthOption)




import Lightbox from "vue-easy-lightbox";
Vue.use(VueFormWizard);
Vue.use(ElementUI, locale);
Vue.use(Lightbox);

import { initFirebaseBackend } from "./helpers/firebase/authUtils";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""

};

initFirebaseBackend(firebaseConfig)

Vue.prototype.$messaging = firebase.messaging()

import "@/assets/scss/app.scss";

Vue.component("VueSlideBar", VueSlideBar);
Vue.use(BootstrapVue);
Vue.use(vco);
Vue.component("apexchart", VueApexCharts);
Vue.use(Vuelidate);
Vue.use(VueSweetalert2);

Vue.use(require("vue-chartist"));
Vue.use(VueMask);

new Vue({
    router,
    store,
    i18n,
    created() {
        const getHTMLTag = document.documentElement;
        getHTMLTag.setAttribute("lang", i18n.locale);
    },
    render: (h) => h(App),
}).$mount("#app");