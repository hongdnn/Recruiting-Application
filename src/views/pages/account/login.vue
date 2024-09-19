<script>
import { required, email } from "vuelidate/lib/validators";
import appConfig from "@/app.config";
import { createToastInterface } from "vue-toastification";
import jwt_decode from "jwt-decode";

/**
 * Login component
 */
export default {
  page: {
    title: "Login",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  created() {
    // if (localStorage.getItem("fcmToken") !== null) {
    //   this.$messaging.deleteToken().then(() => {
    //     this.$messaging
    //       .getToken({
    //         vapidKey:
    //           "BCMp5HladzX1VqzraN7Nd3_1cYmqnKYbNTrVEBgul5zXhqTuuRHFy1Dj-Ma2RUjGje0pN8iYUAnBLDB7v5NlPPE",
    //       })
    //       .then((token) => {
    //         if (token) {
    //           console.log("fcm", token);
    //           localStorage.setItem("fcmToken", token);
    //         } else {
    //           console.log("No registration token available.");
    //         }
    //       })
    //       .catch((err) => {
    //         console.log("An error retrieving token. ", err);
    //       });
    //   });
    //} else {
    this.$messaging
      .getToken({
        vapidKey:
          "BKMvB28_-09MLFkvy5NYCmYiWhXWWmV4DZnnYBTpNRKNrdzZ9AFOpD-GecHT7cHkzNyp8piXkl2x-B7Ym1-hQe8",
      })
      .then((token) => {
        if (token) {
          localStorage.setItem("fcmToken", token);
        } else {
          console.log("No registration token available.");
        }
      })
      .catch((err) => {
        console.log("An error retrieving token. ", err);
      });

    this.unsub = this.$store.subscribe((mut) => {
      switch (mut.type) {
        case "authfack/loginSuccess": {
          const userStorage = JSON.parse(localStorage.getItem("user"));
          if (userStorage.data.type_account === "employer") {
            var decoded = jwt_decode(userStorage.token)
            const permissions = decoded.permission;
            if (
              permissions.includes("post.all") ||
              permissions.includes("post")
            ) {
              this.pushTo("/");
            } else if (
              permissions.includes("candidate.all") ||
              permissions.includes("candidate")
            ) {
              this.pushTo("/manage-candidate");
            } else if (
              permissions.includes("interview.all") ||
              permissions.includes("interview")
            ) {
              this.pushTo("/manage-interview");
            } else if (
              permissions.includes("company.all") ||
              permissions.includes("company")
            ) {
              this.pushTo("/manage-company");
            } else if (
              permissions.includes("staff.all") ||
              permissions.includes("staff")
            ) {
              this.pushTo("/manage-staff");
            } else if (
              permissions.includes("placement.all") ||
              permissions.includes("placement")
            ) {
              this.pushTo("/manage-placement");
            } else if (
              permissions.includes("statistic.all") ||
              permissions.includes("statistic")
            ) {
              this.pushTo("/statistic-for-employer");
            }
          } else {
            this.pushTo("/");
          }
          break;
        }
        case "authfack/loginFailure": {
          this.isLoginFail = true;
          break;
        }
      }
    });
  },
  data() {
    return {
      isLoginFail: false,
      email: "",
      password: "",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      isSignIn: false,
      isInit: false,
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
    this.initToast();
  },

  methods: {
    pushTo(url) {
      this.$router.push({
        path: url,
      });
    },

    initToast() {
      const pluginOptions = {
        timeout: 4000,
      };
      this.toast = createToastInterface(pluginOptions);
    },
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      let user = this.$store.dispatch("auth/logIn", {
        email: this.email,
        password: this.password,
      });
      if (user.error) {
        alert(user.error);
      }
      if (this.$v.$error) {
        this.toast.error("Bạn đã nhập sai mật khẩu. Vui lòng nhập lại");
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          this.tryingToLogIn = true;
          // Reset the authError if it existed.
          this.authError = null;
          return (
            this.$store
              .dispatch("auth/logIn", {
                email: this.email,
                password: this.password,
              })
              // eslint-disable-next-line no-unused-vars
              .then((token) => {
                this.tryingToLogIn = false;
                this.isAuthError = false;
                // Redirect to the originally requested page, or to the home page

                this.$router.push(
                  this.$route.query.redirectFrom || {
                    path: "/",
                  }
                );
              })
              .catch((error) => {
                this.tryingToLogIn = false;
                this.authError = error ? error : "";
                this.isAuthError = true;
              })
          );
        } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
          const { email, password } = this;
          if (email && password) {
            this.$store.dispatch("authfack/login", {
              email,
              password,
            });
            if (this.password.$error) {
              this.toast.error("Nhập sai mk");
            }
          }
        }
      }
    },
    async signInGoogle() {
      try {
        const googleUser = await this.$gAuth.signIn();
        if (!googleUser) {
          return null;
        }
        this.isSignIn = this.$gAuth.isAuthorized;
        const first_name = googleUser.getBasicProfile().getGivenName();
        const last_name = googleUser.getBasicProfile().getFamilyName();
        const email = googleUser.getBasicProfile().getEmail();
        this.$store.dispatch("authfack/loginSocialAccount", {
          first_name,
          last_name,
          email,
        });
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    async signInFacebook() {
      var self = this;
      window.FB.login(
        function (response) {
          if (response.status === "connected") {
            window.FB.api("/me", { fields: "email,name" }, function (response) {
              const nameArr = response.name.split(" ");
              const last_name = nameArr[nameArr.length - 1];
              const first_name = response.name.replace(last_name, "").trim();
              const email = response.email;
              self.$store.dispatch("authfack/loginSocialAccount", {
                first_name,
                last_name,
                email,
              });
            });
          } 
        },
        { scope: "public_profile,email" }
      );
    },

    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;
      this.current_language = locale;
      this.text = country;
      this.flag = flag;
    },
  },
};
</script>

<template>
  <div class="authentication-bg">
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
    <div class="main-login">
      <div class="account-pages">
        <div class="row" style="height: 100%">
          <div class="col-12 d-flex">
            <div class="col-sm-7 col-xs-0 content">
              <div class="mat-content">
                <div class="text-center">
                  <h2
                    style="color: #495cba; text-algin: center"
                    class="welcome"
                  >
                    Chào mừng đến với tatool
                  </h2>
                </div>
                <div class="textContent text-center">
                  <span
                    >Để tiếp tục vui lòng đăng ký bằng thông tin cá nhân của
                    bạn</span
                  >
                </div>

                <div class="handleContent mt-2">
                  <a href="/register">
                    <button>Đăng ký</button>
                  </a>
                </div>
              </div>
            </div>
            <div class="col-sm-5 col-xs-12 form-login">
              <div
                style="
                  width: 100%;
                  display: flex;
                  align-items: center;
                  flex-direction: column;
                "
              >
                <div class="text-center">
                  <h3 style="color: #495cba" class="titleLogin">Đăng nhập</h3>
                  <div class="text-center">
                    <ul class="list-inline">
                      <li class="list-inline-item">
                        <a
                          href="javascript:void()"
                          @click="signInFacebook"
                          class="social-list-item item-login"
                        >
                          <i class="fab fa-facebook-f"></i>
                        </a>
                      </li>

                      <li class="list-inline-item">
                        <a
                          @click="signInGoogle"
                          class="social-list-item item-login"
                        >
                          <i class="mdi mdi-google"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="m-auto content-form">
                  <div
                    class="alert alert-danger"
                    role="alert"
                    v-if="isLoginFail"
                  >
                    Tài khoản hoặc mật khẩu không đúng
                  </div>

                  <b-form @submit.prevent="tryToLogIn">
                    <b-form-group id="input-group-1" class="mat-form-group">
                      <label for="input-1" class="labelInput">Email</label>
                      <b-form-input
                        id="input-1"
                        v-model="email"
                        type="text"
                        placeholder="Nhập email"
                        class="formInput"
                        :class="{
                          'is-invalid': submitted && $v.email.$error,
                        }"
                      ></b-form-input>
                      <div
                        v-if="submitted && $v.email.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.email.required"
                          >Vui lòng nhập email của bạn</span
                        >
                        <span v-if="!$v.email.email"
                          >Email của bạn không hợp lệ</span
                        >
                      </div>
                    </b-form-group>
                    <b-form-group
                      id="input-group-2"
                      class="mat-form-group"
                      style="margin-top: 10px"
                    >
                      <label for="input-2" class="labelInput">Mật khẩu</label>
                      <b-form-input
                        class="formInput"
                        id="input-2"
                        v-model="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        :class="{
                          'is-invalid': submitted && $v.password.$error,
                        }"
                      ></b-form-input>
                      <div
                        v-if="
                          submitted &&
                          !$v.password.error &&
                          $v.password.$invalid
                        "
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.password.required">
                          Vui lòng nhập mật khẩu của bạn
                        </span>
                      </div>
                    </b-form-group>
                    <div class="form-check mt-1">
                      <div class="form-check1" style="flex: 1">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          id="auth-remember-check"
                        />
                        <label
                          class="form-check-label"
                          for="auth-remember-check"
                          >Nhớ mật khẩu</label
                        >
                      </div>
                      <div class="forgotPassword">
                        <a href="/forgot-password" class="">Quên mật khẩu</a>
                      </div>
                    </div>
                    <div class="mt-3 text-center">
                      <button type="submit" class="buttonLogin">
                        Đăng nhập 
                      </button>
                    </div>

                    <div class="mt-4 text-center">
                      <p class="mb-0 haveAnAccount">
                        Bạn chưa có tài khoản?
                        <a
                          href="/register"
                          class="fw-medium"
                          style="color: #495cba"
                          >Đăng kí ngay</a
                        >
                      </p>
                    </div>
                  </b-form>
                </div>
              </div>
            </div>
            <!-- end card-body -->

            <!-- end card -->
          </div>
        </div>
        <!-- end row -->
      </div>

      <!-- end col -->

      <!-- end row -->
    </div>
  </div>
</template>

<style lang='scss'>
.authentication-bg {
  background-color: #fff !important;
}
.main-login {
  height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  z-index: 999;
  @media screen and (max-width: 600px) {
    display: block;
    margin-top: 50px;
  }
}
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
.imageLanguage {
}
.account-pages {
  border-radius: 8px;
  width: 55%;
  margin: 0 auto;
  height: 650px;

  background-repeat: no-repeat;
  border: 1px solid #eae9e9;
  background-size: cover;
  background-position: center;
  background-image: url("https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");

  @media screen and (max-width: 1500px) {
    width: 65%;
    height: 500px;
  }
  @media screen and (max-width: 1376px) {
    width: 85%;
  }
  @media screen and (max-width: 1024px) {
    height: 450px;
    width: 75%;
  }
  @media screen and (max-width: 768px) {
    height: 500px;
  }
  @media screen and (max-width: 600px) {
    background: #ffff;
    width: 95%;
  }
  .list-inline-item {
    .item-login {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ced4da;
      cursor: pointer;
      @media screen and (max-width: 768px) {
        width: 30px;
        height: 30px;
      }
      @media screen and (max-width: 1500px) {
        width: 35px;
        height: 35px;
      }
      &:hover {
        .fa-facebook-f {
          color: #1877f2;
        }
        .mdi-twitter {
          color: #00b0e9;
        }
        .mdi-google {
          color: #d93025;
        }
      }
      i {
        font-size: 22px;
        color: #495057;
        @media screen and (max-width: 768px) {
          font-size: 15px;
        }
        @media screen and (max-width: 1500px) {
          font-size: 17px;
        }
      }
    }
  }
  .form-login {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    @media screen and (max-width: 768px) {
      .titleLogin {
        font-size: 18px;
      }
    }
    @media screen and (max-width: 1500px) {
      .titleLogin {
        font-size: 18px;
      }
    }
    @media screen and (max-width: 600px) {
      width: 100%;
    }
    .content-form {
      width: 100%;
      padding: 0 20px;
      @media screen and (max-width: 768px) {
        padding: 0 10px;
      }
      @media screen and (max-width: 600px) {
        padding: 0 20px;
      }
    }
    .haveAnAccount {
      @media screen and (max-width: 768px) {
        font-size: 14px;
      }
      @media screen and (max-width: 600px) {
        font-size: 12px;
      }
    }
  }
  .labelInput {
    @media screen and (max-width: 768px) {
      font-size: 14px;
    }
    @media screen and (max-width: 600px) {
      font-size: 12px;
    }
  }
  .formInput {
    @media screen and (max-width: 768px) {
      height: 40px;
    }
    @media screen and (max-width: 600px) {
      height: 35px;
    }
    &:hover {
      border: 1px solid #495cba;
    }
    &:focus {
      border: 1px solid #495cba;
    }
  }
  .forgotPassword {
    color: #495057;
    padding: 7px 15px;
    background-color: rgb(255, 255, 255);
    border-radius: 30px;
    transition: all 0.25s;
    &:hover {
      background-color: rgb(232, 243, 253);
    }
    @media screen and (max-width: 1024px) {
      a {
        font-size: 14px;
      }
    }
    @media screen and (max-width: 600px) {
      a {
        font-size: 12px;
      }
    }
  }
  .form-check,
  .form-check1 {
    display: flex;
    align-items: center;
  }

  .form-check-label {
    margin-left: 5px;
    @media screen and (max-width: 1024px) {
      font-size: 11px;
    }
    @media screen and (max-width: 768px) {
      font-size: 11px;
    }
    @media screen and (max-width: 600px) {
      margin-top: 5px;
    }
  }
  .form-check {
    .form-check-input {
      height: 19px;
      width: 19px;
      @media screen and (max-width: 1024px) {
        height: 17px;
        width: 17px;
      }
      @media screen and (max-width: 768px) {
        height: 15px;
        width: 15px;
      }
    }
  }
  .buttonLogin {
    width: 100px;
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
    @media screen and (max-width: 1024px) {
      width: 80px;
      font-size: 13px;
    }
    @media screen and (max-width: 600px) {
      width: 70px;
      font-size: 11.5px;
    }
  }
  .btnhandleCreate {
    position: absolute;
    right: 0;
    margin-right: 15px;
  }
  .btnhandleCreate button {
    outline: none;
    border: 1px solid white;
    background-color: white;
    color: black;
    padding: 4px 8px;
    border-radius: 3px;
    transition: all 0.2s ease-in-out;
  }
  .btnhandleCreate button:hover {
    background-color: rgba(178, 226, 248, 0);
    color: white;
  }

  .content {
    margin: auto auto;
    display: flex;
    justify-content: center;
    cursor: pointer;
    @media screen and (max-width: 600px) {
      display: none;
    }
    @media screen and (max-width: 767px) {
      .welcome {
        font-size: 18px;
      }
      .textContent {
      }
    }
    @media screen and (max-width: 1500px) {
      .welcome {
        font-size: 20px;
      }
      .textContent {
        span {
        }
      }
    }
  }
  .content .textContent {
    margin-bottom: 10px;
  }
  .content .textContent span {
    text-align: center;
    font-family: "Muli,sans-serif";
    font-weight: 500;
    font-size: 15px;
    color: #495cba;
  }
  .iconheader i {
    color: white;
    font-size: 35px;
  }
  .content .handleContent {
    display: flex;
    justify-content: center;
  }
  .content .handleContent button {
    width: 100px;
    font-size: 15px;
    outline: none;
    padding: 4px 0;
    border: 1px solid #495cba;
    border-radius: 20px;
    background-color: transparent;
    color: #495cba;
    transition: all 0.3s ease-in;
    @media screen and (max-width: 1024px) {
      width: 80px;
      font-size: 13px;
    }
    @media screen and (max-width: 600px) {
      width: 60px;
      font-size: 13px;
    }
  }
  .content .handleContent button:hover {
    background-color: #495cba;
    color: #fff;
  }
}
</style>
