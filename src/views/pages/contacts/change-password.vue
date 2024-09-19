<script>
import { required, sameAs } from "vuelidate/lib/validators";
import appConfig from "@/app.config";
import { mapActions } from "vuex";
import Swal from "sweetalert2";

/**
 * Change password component
 */
export default {
  page: {
    title: "Change password",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      password: {
        old_password: "",
        new_password: "",
        re_password: "",
      },
      submitted: false,
      tryingToChangePassword: false,
      isChangePasswordError: false,
      title: "Change password",
    };
  },
  validations: {
    password: {
      old_password: {
        required,
      },
      new_password: {
        required,
      },
      re_password: {
        required,
        sameAs: sameAs("new_password"),
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
  mounted() {},
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "user/changePasswordSuccess":
          Swal.fire("Đổi mật khẩu thành công", "", "success").then(() => {
            this.password.old_password = "";
            this.password.new_password = "";
            this.password.re_password = "";
            this.submitted = false;
          });
          break;
        case "user/changePasswordFailure":
          switch (state.user.changePassword) {
            case "Old password is not correct.":
              Swal.fire("Đổi mật khẩu không thành công", "Mật khẩu cũ không chính xác", "error").then(
                () => {}
              );
              break;
            default:
              Swal.fire("Đổi mật khẩu không thành công", "", "error").then(
                () => {}
              );
              break;
          }

          break;
      }
    });
  },
  methods: {
    ...mapActions("user", ["changePassword"]),

    tryToChangePassword() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      } else {
        Swal.fire({
          title: "Xác nhận đổi mật khẩu",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Quay lại",
        }).then((result) => {
          if (result.isConfirmed) {
            const old_password = this.password.old_password;
            const new_password = this.password.new_password;
            const re_password = this.password.re_password;

            const data = {
              old_password,
              new_password,
              re_password,
            };

            this.changePassword(data);
          }
          if (result.isDismissed) {
          }
        });
      }
    },
  },
};
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-sm-6 col-12" style="padding: 0 25px 15px">
      <div v-if="notification.message" :class="'alert ' + notification.type">
        {{ notification.message }}
      </div>
      <b-form @submit.prevent="tryToChangePassword">
        <!-- Old pasword field -->
        <b-form-group
          id="old-password-group"
          label="Mật khẩu cũ"
          class="mb-3"
          label-for="oldPassword"
        >
          <b-form-input
            id="oldPassword"
            v-model="password.old_password"
            type="password"
            placeholder="Nhập mật khẩu cũ"
            :class="{
              'is-invalid': submitted && $v.password.old_password.$error,
            }"
          ></b-form-input>
          <div
            v-if="submitted && !$v.password.old_password.required"
            class="invalid-feedback"
          >
            Bắt buộc nhập mật khẩu cũ.
          </div>
        </b-form-group>
        <!-- New pasword field -->
        <b-form-group
          id="new-password-group"
          label="Mật khẩu mới"
          class="mb-3"
          label-for="newPassword"
        >
          <b-form-input
            id="oldPassword"
            v-model="password.new_password"
            type="password"
            placeholder="Nhập mật khẩu mới"
            :class="{
              'is-invalid': submitted && $v.password.new_password.$error,
            }"
          ></b-form-input>
          <div
            v-if="submitted && !$v.password.new_password.required"
            class="invalid-feedback"
          >
            Bắt buộc nhập mật khẩu mới.
          </div>
        </b-form-group>
        <!-- Confirm pasword field -->
        <b-form-group
          id="re-password-group"
          label="Xác nhận mật khẩu mới"
          class="mb-3"
          label-for="rePassword"
        >
          <b-form-input
            id="rePassword"
            v-model="password.re_password"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            :class="{
              'is-invalid': submitted && $v.password.re_password.$error,
            }"
          ></b-form-input>
          <div
            v-if="submitted && $v.password.re_password.$error"
            class="invalid-feedback"
          >
            <span v-if="!$v.password.re_password.required"
              >Bắt buộc nhập lại mật khẩu mới</span
            >
            <span
              v-if="
                !$v.password.re_password.sameAs &&
                $v.password.re_password.required
              "
              >Mật khẩu xác nhận không trùng khớp</span
            >
          </div>
        </b-form-group>
        <div class="mt-3 text-end">
          <b-button type="submit" variant="primary" class="w-sm"
            >Đổi mật khẩu</b-button
          >
        </div>
      </b-form>
    </div>
  </div>
</template>