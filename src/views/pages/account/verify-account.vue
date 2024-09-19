<script>
import appConfig from "@/app.config";

/**
 * Verify account component
 */
export default {
  page: {
    title: "Verify Account",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      error: null,
      title: "Verify Account",
    };
  },
  computed: {
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  methods: {
    tryToVerifyAccount() {
      var email = "";
      var verifyCode = "";
      var url = window.location.href;

      // Get email value
      var name = "email";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) email = "";
      if (!results[2]) email = "";
      email = decodeURIComponent(results[2].replace(/\+/g, " "));

      //Get code value
      var name1 = "code";
      name1 = name1.replace(/[[]]/g, "\\$&");
      var regex1 = new RegExp("[?&]" + name1 + "(=([^&#]*)|&|#|$)"),
        results1 = regex1.exec(url);
      if (!results1) verifyCode = "";
      if (!results1[2]) verifyCode = "";
      verifyCode = decodeURIComponent(results1[2].replace(/\+/g, " "));

      //Call API
      if (email && verifyCode) {
        this.$store.dispatch("authfack/confirmAccount", {
          verifyCode,
          email,
        });
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="home-btn d-none d-sm-block">
      <router-link to="/" class="text-dark">
        <i class="mdi mdi-home-variant h2"></i>
      </router-link>
    </div>
    <div class="account-pages my-5 pt-sm-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">
            <div>
              <div class="card">
                <div class="card-body p-4">
                  <div class="text-center mt-2">
                    <h5 class="text-primary">Verify account</h5>
                  </div>
                  <div class="p-2 mt-4">
                    <div
                      v-if="notification.message"
                      :class="'alert ' + notification.type"
                    >
                      {{ notification.message }}
                    </div>
                    <div
                      class="alert alert-success text-center mb-4"
                      role="alert"
                    >
                      Welcome to tatool<br />Please click Verify button to
                      active your account
                    </div>
                    <form @submit.prevent="tryToVerifyAccount">
                      <div class="row mb-0">
                        <div class="text-center">
                          <button class="btn btn-primary w-100" type="submit">
                            Verify account
                          </button>
                        </div>
                      </div>
                      <!-- <div class="mt-4 text-center">
                        <p class="mb-0">
                          Remember It ?
                          <router-link
                            to="/login"
                            class="fw-medium text-primary"
                            >Signin</router-link
                          >
                        </p>
                      </div> -->
                    </form>
                  </div>
                </div>
                <!-- end card-body -->
              </div>
              <!-- end card -->
            </div>
            <!-- end col -->
          </div>
        </div>
      </div>
    </div>
    <!-- end row -->
  </div>
</template>

<style lang="scss" module></style>