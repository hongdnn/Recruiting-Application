<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import appConfig from "@/app.config";

export default {
  created() {
    //let that = this;
  },
  name: "app",
  page: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      title = typeof title === "function" ? title(this.$store) : title;
      return title ? `${title} | ${appConfig.title}` : appConfig.title;
    },
    meta: [
      { charset: "utf-8" },
      { equiv: "Content-Type", content: "text/html" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  },
  methods: {},
  watch: {
    /**
     * Clear the alert message on route change
     */
    // eslint-disable-next-line no-unused-vars
    $route(to, from) {
      // clear alert on location change
    },
  },
  mounted() {
    // document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
  },
};
</script>
