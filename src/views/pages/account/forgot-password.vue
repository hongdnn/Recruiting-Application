<script>
import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";

export default {
  page: {
    title: "Forgot Password",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      isForgotPasswordFail: false,
      isForgotPasswordSuccess: false,
      email: "",
      toast: null,
      submitted: false,
      error: null,
      title: "Recoverpwd",
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
    email: {
      required,
      email,
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
        case "authfack/forgotPasswordSuccess":
          this.isForgotPasswordFail = false;
          this.isForgotPasswordSuccess = true;
          break;
        case "authfack/forgotPasswordFailure":
          this.isForgotPasswordFail = true;
          this.isForgotPasswordSuccess = false;
          break;
      }
    });
  },
  methods: {
    // Try to register the user in with the email, fullname
    // and password they provided.

    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;
      this.current_language = locale;
      this.text = country;
      this.flag = flag;
    },

    closeToast() {
      this.$router.push({
        path: "/login",
      });
      this.toast.clear();
    },

    tryToReset() {
      this.submitted = true;
      // stop here if form is invalid
      let iconTosat = document.querySelector(".far");
      let iconTosat1 = document.querySelector(".fas");
      this.$v.$touch();
      if (this.$v.$invalid) {
        if (iconTosat1) {
          iconTosat1.classList.remove("fas");
          iconTosat1.classList.add("far");
        }
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          this.tryingToReset = true;
          // Reset the authError if it existed.
          this.error = null;
          return (
            this.$store
              .dispatch("auth/forgotPassword", {
                email: this.email,
              })
              // eslint-disable-next-line no-unused-vars
              .then((token) => {
                this.tryingToReset = false;
                this.isResetError = false;
              })
              .catch((error) => {
                this.tryingToReset = false;
                this.error = error ? error : "";
                this.isResetError = true;
              })
          );
        } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
          const { email } = this;
          if (email) {
            this.$store.dispatch("authfack/forgotPassword", {
              email,
            });
          }
        }
        if (iconTosat) {
          iconTosat.classList.remove("far");
          iconTosat.classList.add("fas");
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
                    <h5 style="color: #495cba">Quên mật khẩu</h5>
                  </div>
                  <div class="p-2 mt-4">
                    <div class="alert alert-danger" role="alert" v-if="isForgotPasswordFail">
                      Email không tồn tại
                    </div>
                    <div
                      class="alert alert-success"
                      role="alert" v-if="isForgotPasswordSuccess"
                    >
                      Vui lòng kiểm tra email để tạo mật khẩu mới
                    </div>
                    <form @submit.prevent="tryToReset">
                      <div class="mb-3">
                        <label for="useremail">Email</label>
                        <input
                          type="email"
                          v-model="email"
                          class="form-control formInput"
                          id="useremail"
                          placeholder="Nhập email"
                          :class="{
                            'is-invalid': submitted && $v.email.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.email.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.email.required"
                            >Email không được bỏ trống.</span
                          >
                          <span v-if="!$v.email.email"
                            >Vui lòng nhập email đúng định dạng.</span
                          >
                        </div>
                      </div>
                      <div class="row mb-0">
                        <div class="col-12 text-end">
                          <button class="handleReset" type="submit">
                            Lấy lại mật khẩu
                          </button>
                        </div>
                      </div>
                      <div class="mt-4 text-center">
                        <p class="mb-0">
                          Bạn đã nhớ lại mật khẩu?
                          <a
                            v-on:click="closeToast()"
                            class="fw-medium"
                            style="color: #495cba; cursor: pointer"
                            >Đăng nhập</a
                          >
                        </p>
                      </div>
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

.alert-text {
  height: 40px;
  line-height: 40px;
  margin-bottom: 10px;
  i {
    margin-right: 5px;
    font-size: 15px;
  }
}
.alertNotifyCheck {
  background-color: #fae4e0;
  color: #f84f31;
}
.alertNotify {
  background-color: #f5fff5;
  color: #4bb543;
  position: relative;
}
.formInput {
  &:hover {
    border: 1px solid #495cba;
  }
  &:focus {
    border: 1px solid #495cba;
  }
}
.handleReset {
  width: 150px;
  font-size: 15px;
  outline: none;
  padding: 4px 0;
  border: 1px solid #495cba;
  border-radius: 20px;
  background-color: transparent;
  color: #495cba;
  transition: all 0.3s ease-in;
  &:hover {
    background-color: #495cba;
    color: #fff;
  }
}
</style>
