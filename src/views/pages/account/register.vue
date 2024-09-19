<script>
import { required, email, numeric } from "vuelidate/lib/validators";
import appConfig from "@/app.config";

/**
 * Register component
 */
export default {
  page: {
    title: "Register",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      user: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone: "",
        type_account: "collaborator",
      },
      submitted: false,
      tryingToRegister: false,
      isRegisterError: false,
      isRegisterFail: false,
      isRegisterSuccess: false,
      title: "Register",
      value: null,
      flag: null,
      text: null,
      // URL:`url(${require("@/assets/images/signin-tmp.jpg")})`,
      URL1: `url(${require("@/assets/images/logo-signin.jpg")})`,
      cssProps: {
        backgroundImage: `url(${require("@/assets/images/logo-signin.jpg")})`,
      },

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
    user: {
      first_name: {
        required,
      },
      last_name: {
        required,
      },
      // username: {
      //   required,
      // },
      email: {
        required,
        email,
      },
      password: {
        required,
      },
      phone: {
        required,
        numeric,
      },
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
    })
  },
  methods: {
    // Try to register the user in with the email, username
    // and password they provided.
    tryToRegisterIn() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          this.tryingToRegister = true;
          // Reset the regError if it existed.
          this.regError = null;
          return (
            this.$store
              .dispatch("auth/register", {
                email: this.user.email,
                password: this.user.password,
              })
              // eslint-disable-next-line no-unused-vars
              .then((token) => {
                this.tryingToRegister = false;
                this.isRegisterError = false;
                this.registerSuccess = true;
                if (this.registerSuccess) {
                  this.$router.push(
                    this.$route.query.redirectFrom || {
                      path: "/",
                    }
                  );
                }
              })
              .catch((error) => {
                this.tryingToRegister = false;
                this.regError = error ? error : "";
                this.isRegisterError = true;
              })
          );
        } else if (process.env.VUE_APP_DEFAULT_AUTH === "fakebackend") {
          const {
            first_name,
            last_name,
            email,
            password,
            phone,
            type_account,
          } = this.user;
          if (
            first_name &&
            last_name &&
            email &&
            password &&
            phone &&
            type_account
          ) {
            this.$store.dispatch("authfack/registeruser", this.user);
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
          } else {
          }
        },
        { scope: "public_profile,email" }
      );
    },

    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;

      this.text = country;
      this.flag = flag;
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
    <div class="main-login">
      <div class="account-pages">
        <div class="row">
          <div class="col-xl-5 col-md-6 mat-form-main p-0">
            <div class="text-center mat-header-form">
              <h5>Đăng ký</h5>
              <p class="text-muted">Đăng ký tài khoản cộng tác viên của bạn.</p>
            </div>
            <div class="mat-form-content">
              <div class="alert alert-danger" role="alert" v-if="isRegisterFail">
                Email đã tồn tại
              </div>
              <div class="alert alert-success" role="alert" v-if="isRegisterSuccess">
                Đăng kí thành công<br>Vui lòng kiểm tra email để xác nhận tài khoản
              </div>

              <b-form
                v-if="notification.type !== 'success'"
                @submit.prevent="tryToRegisterIn"
              >
                <!-- My code -->

                <!-- First name field -->
                <div class="row">
                  <div class="col-lg-12 d-flex">
                    <div class="col-6 mat-form-item-control">
                      <b-form-group
                        id="firstname-group"
                        class="mat-form-control"
                        style="padding-right: 5px"
                      >
                        <span class="titleForm"> Tên </span>
                        <b-form-input
                          id="firstname"
                          v-model="user.first_name"
                          type="text"
                          placeholder="Nhập tên"
                          class="mat-form-input"
                          :class="{
                            'is-invalid':
                              submitted && $v.user.first_name.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && !$v.user.first_name.required"
                          class="invalid-feedback"
                        >
                          Tên không được bỏ trống.
                        </div>
                      </b-form-group>
                    </div>

                    <!-- Last name field -->
                    <div class="col-6 mat-form-item-control">
                      <b-form-group
                        id="lastname-group"
                        class="mat-form-control"
                        style="padding-left: 5px"
                      >
                        <span class="titleForm">Họ</span>
                        <b-form-input
                          id="lastname"
                          v-model="user.last_name"
                          type="text"
                          placeholder="Nhập họ"
                          class="mat-form-input"
                          :class="{
                            'is-invalid': submitted && $v.user.last_name.$error,
                          }"
                        ></b-form-input>
                        <div
                          v-if="submitted && !$v.user.last_name.required"
                          class="invalid-feedback"
                        >
                          Họ không được bỏ trống.
                        </div>
                      </b-form-group>
                    </div>
                  </div>
                </div>
                <!-- Email field -->
                <b-form-group id="email-group" class="mat-form-control">
                  <span class="titleForm">Email</span>
                  <b-form-input
                    id="email"
                    v-model="user.email"
                    type="email"
                    placeholder="Nhập email"
                    class="mat-form-input"
                    :class="{
                      'is-invalid': submitted && $v.user.email.$error,
                    }"
                  ></b-form-input>
                  <div
                    v-if="submitted && $v.user.email.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.user.email.required"
                      >Email is required.</span
                    >
                    <span v-if="!$v.user.email.email"
                      >Please enter valid email.</span
                    >
                  </div>
                </b-form-group>

                <!-- Password field -->
                <b-form-group id="password-group" class="mat-form-control">
                  <span class="titleForm">Mật khẩu</span>
                  <b-form-input
                    id="password"
                    v-model="user.password"
                    type="password"
                    placeholder="Mật khẩu"
                    class="mat-form-input"
                    :class="{
                      'is-invalid': submitted && $v.user.password.$error,
                    }"
                  ></b-form-input>
                  <div
                    v-if="submitted && !$v.user.password.required"
                    class="invalid-feedback"
                  >
                    Mật khẩu không được bỏ trống.
                  </div>
                </b-form-group>

                <!-- Phone number field -->
                <b-form-group id="phone-group" class="mat-form-control">
                  <span class="titleForm">Số điện thoại</span>
                  <b-form-input
                    id="phone"
                    v-model="user.phone"
                    type="text"
                    placeholder="Số điện thoại"
                    class="mat-form-input"
                    :class="{
                      'is-invalid': submitted && $v.user.phone.$error,
                    }"
                  ></b-form-input>
                  <div
                    v-if="submitted && $v.user.phone.$error"
                    class="invalid-feedback"
                  >
                    <span v-if="!$v.user.phone.required"
                      >Phone number is required.</span
                    >
                    <span v-if="!$v.user.phone.numeric"
                      >Please enter valid phone.</span
                    >
                  </div>
                </b-form-group>

                <!-- End form -->

                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="auth-terms-condition-check"
                  />
                  <label
                    class="form-check-label"
                    for="auth-terms-condition-check"
                    >Tôi chấp nhận
                    <a href="javascript: void(0);"
                      >các Điều khoản và Điều kiện</a
                    ></label
                  >
                </div>
                <div class="mt-3 text-center">
                  <button type="submit" class="mat-btn-signin">Đăng ký</button>
                </div>

                <div class="mat-footer-form text-center">
                  <div class="signin-other-title">
                    <h5 class="font-size-14 mb-3 title">Đăng ký bằng</h5>
                  </div>

                  <ul class="list-inline">
                    <li class="list-inline-item">
                      <a
                        href="javascript:void()"
                        @click="signInFacebook"
                        class="
                          social-list-item
                          bg-primary
                          text-white
                          border-primary
                        "
                      >
                        <i class="mdi mdi-facebook"></i>
                      </a>
                    </li>

                    <li class="list-inline-item">
                      <a
                        href="javascript:void()"
                        @click="signInGoogle"
                        class="
                          social-list-item
                          bg-danger
                          text-white
                          border-danger
                        "
                      >
                        <i class="mdi mdi-google"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="mat-footer-form text-center">
                  <p class="text-muted mb-0">
                    Bạn đã có tài khoản ?
                    <router-link to="/login" class="fw-medium text-primary"
                      >Đăng nhập</router-link
                    >
                  </p>
                </div>
              </b-form>
            </div>
            <!-- end card-body -->
          </div>
          <div class="col-xl-7 col-md-6 d-flex align-items-center justify-content-center p-0">
            <div class="content content__img" :style="cssProps">
              <div class="mat-content">
                <h2 style="color: #fff" class="welcome text-center">
                  Chào mừng đến với tatool
                </h2>
                <div class="textContent">
                  <span
                    >Để giữ kết nối với chúng tôi, vui lòng đăng nhập bằng thông
                    tin cá nhân của bạn.</span
                  >
                </div>

                <div class="handleContent mt-2">
                  <a href="/login">
                    <button>Đăng nhập</button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- end col -->
        </div>
      </div>
    </div>

    <!-- end row -->
  </div>
</template>

<style lang="scss" >
.main-login {
  height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  z-index: 999;
  @media screen and (max-width: 600px) {
    display: block;
  }
  @media screen and (max-width: 1024px) and (max-height: 768px) {
    height: 100%;
    display: block;
    margin-top: 20px;
  }
  @media screen and (max-width: 600px) {
    display: flex;
  }
}
.account-pages {
  border-radius: 8px;
  // width: 65%;
  margin: 0 auto;
  border: 1px solid #eae9e9;

  // background-image: url("https://images.pexels.com/photos/389818/pexels-photo-389818.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
  @media screen and (max-width: 1024px) {
    width: 80%;
  }
  @media screen and (max-width: 1024px) {
    width: 80%;
  }
  @media screen and (max-width: 1024px) and (max-height: 768px) {
  }
  @media screen and (max-width: 600px) {
    width: 90%;
    background-image: none;
  }
  .mat-form-main {
    background: #fff;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    border-right: none;
    border: 1px solid #eae9e9;
    @media screen and (max-width: 600px) {
      border-right: 1px solid #eae9e9;
    }
    .mat-header-form {
      margin-top: 20px;
      h5 {
        color: #495cba;
        font-weight: 500;
      }
      p {
        color: #495057;
      }
      @media screen and (max-width: 600px) {
        h5 {
          font-size: 16px;
        }
        p {
          font-size: 13px;
        }
      }
    }
    .mat-form-content {
      padding: 0 20px;
      @media screen and (max-width: 599px) {
        padding: 0 5px;
      }
      // .mat-form-item-control {
      //   @media screen and (max-width: 599px) {
      //     width: 100%;
      //   }
      // }
      .mat-form-control {
        margin-bottom: 10px;

        .titleForm {
          font-size: 14px;
          color: #495057;
          @media screen and (max-width: 600px) {
            font-size: 12.5px;
          }
        }

        .mat-form-input {
          height: 35px;
          @media screen and (max-width: 768px) {
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
      }

      .form-check {
        color: #495057;
        font-size: 14px;
        @media screen and (max-width: 600px) {
          font-size: 12px;
        }
        .form-check-input {
        }
        .form-check-label {
          a {
            color: #495057;
          }
        }
      }
      .mat-footer-form {
        font-size: 14px;
        color: #495057;
        margin: 10px 0;
      }

      .mat-btn-signin {
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
          width: 90px;
          font-size: 13px;
        }
        @media screen and (max-width: 600px) {
          width: 80px;
          padding: 2px 10px;
          font-size: 13px;
        }
        &:hover {
          background-color: #495cba;
          color: #fff;
        }
      }
    }
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
.content__img {
  position: relative;

  &:after {
    content: '';
    background-color: rgba(0, 0, 0, 0.6);
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
}
.content {
  height: 100%;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-bottom-right-radius: 8px;
  border-top-right-radius: 8px;

  .mat-content {
    z-index: 999 !important;
  }
  @media screen and (max-width: 768px) {
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
  text-align: center;
}
.content .textContent span {
  font-family: "Muli,sans-serif";
  font-weight: 500;
  font-size: 15px;
  color: #fff;
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
  border: 1px solid #fff;
  border-radius: 20px;
  background-color: transparent;
  color: #fff;
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
body {
  background: #fff !important;
}
</style>
