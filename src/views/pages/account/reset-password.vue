<script>
import appConfig from "@/app.config";
import { required } from "vuelidate/lib/validators";

/**
 * Reset Password component
 */
export default {
  page: {
    title: "Reset Password",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      password: "",
      submitted: false,
      error: null,
      title: "Reset Password",
      value: null,
      flag: null,
      text: null,
      languages: [
        {
          flag: require("@/assets/images/flags/us.jpg"),
          language: "en",
          title: "English",
        },
        {
          flag: require("@/assets/images/flags/vietnam.png"),
          language: "vi",
          title: "Tiếng việt",
        },
      ],
      current_language: this.$i18n.locale,
    };
  },
  validations: {
    password: {
      required,
    },
  },
  computed: {
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.value = this.languages.find((x) => x.language === this.$i18n.locale);
    this.flag = this.value.flag;
    this.text = this.value.title;
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "authfack/registerSuccess":
          this.isRegisterFail = false;
          this.isRegisterSuccess = true;
          break;
        case "authfack/registerFailure":
          this.isRegisterFail = true;
          this.isRegisterSuccess = false;
          break;
      }
    });
  },
  methods: {
    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;
      this.current_language = locale;
      this.text = country;
      this.flag = flag;
    },

    tryToResetPassword() {
      var email = "";
      var verification_code = "";
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
      if (!results1) verification_code = "";
      if (!results1[2]) verification_code = "";
      verification_code = decodeURIComponent(results1[2].replace(/\+/g, " "));

      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
          const { password } = this;
          if (email && password && verification_code) {
            this.$store.dispatch("authfack/resetPassword", {
              email,
              password,
              verification_code,
            });
          }
        }
      }
    },
  },
};
</script>

<template>
  <div>
    <div class="homeHeader d-flex">
      <div class="iconheader" style="margin-left: 30px; flex: 1">
        <router-link to="/" class="text-dark">
          <img
            src="@/assets/images/logomain.png"
            class="logo-login"
            alt
            height="50"
          />
        </router-link>
      </div>
      <!-- <b-dropdown variant="white" right toggle-class="header-item">
        <template v-slot:button-content>
          <img
            class="imageLanguage"
            :src="flag"
            alt="Header Language"
            height="16"
          />
          <span class="titleLanguage">{{ text }}</span>
        </template>
        <b-dropdown-item
          class="notify-item"
          v-for="(entry, i) in languages"
          :key="`Lang${i}`"
          :value="entry"
          @click="setLanguage(entry.language, entry.title, entry.flag)"
          :link-class="{ active: entry.language === current_language }"
        >
          <img
            :src="`${entry.flag}`"
            alt="user-image"
            class="me-1 imageLanguage"
            height="12"
          />
          <span class="align-middle titleLanguage">{{ entry.title }}</span>
        </b-dropdown-item>
      </b-dropdown> -->
    </div>
    <div class="account-pages my-5 pt-sm-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6 col-xl-5">
            <div>
              <div class="card">
                <div class="card-body p-4">
                  <div class="text-center mt-2">
                    <h5 class="text-primary">Cấp lại mật khẩu</h5>
                  </div>
                  
                  <div class="p-2 mt-4">
                    <form @submit.prevent="tryToResetPassword">
                      <div class="mb-3">
                        <label for="password">Mật khẩu mới</label>
                        <input
                          type="password"
                          v-model="password"
                          class="form-control"
                          id="password"
                          placeholder="Nhập mật khẩu mới"
                          :class="{
                            'is-invalid': submitted && $v.password.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.password.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.password.required"
                            >Mật khẩu mới không được bỏ trống.</span
                          >
                        </div>
                      </div>
                      <div class="row mb-0">
                        <div class="text-center">
                          <button class="btn btn-primary w-100" type="submit">
                            Xác nhận mật khẩu mới
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

<style lang="scss" >
.homeHeader {
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #fff;

  .logo-login {
    @media screen and (max-width: 1024px) {
      height: 40px;
    }
    @media screen and (max-width: 600px) {
      height: 35px;
    }
  }
}
.titleLanguage {
  margin-left: 5px;
  color: #495057;
  margin-right: 20px;
}
</style>
