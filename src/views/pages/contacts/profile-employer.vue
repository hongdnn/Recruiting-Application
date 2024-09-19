<script>
import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";
import { mapGetters, mapActions, mapState } from "vuex";
import Multiselect from "vue-multiselect";
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import ChangePassword from "../contacts/change-password.vue";
import Swal from "sweetalert2";
import moment from "moment";

/**
 * Profile component
 */
export default {
  page: {
    title: "Hồ Sơ",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    ChangePassword,
  },
  data() {
    return {
      //Change password:
      old_password: "",
      new_password: "",
      re_password: "",
      selectJobLevels: "",
      selectedJobLevels: "",
      levelJob: null,
      listLanguage: [],
      selectSkills: "",
      selectLanguages: "",
      selectCities: "",
      selectJobRoles: "",
      jobLevel: [
        "Quản Lý Điều Hành",
        "Quản Lý Cao Cấp",
        "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp",
        "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát",
        "Chuyên Gia / Có Kinh Nghiệm",
        "Mới Ra Trường / Thực Tập",
      ],
      dataDropdown: [],
      user: {
        id: "1",
        first_name: "",
        phone: "",
        email: "",
        hotline: "",
        address: "",
        status: "",
        last_name: "",
        job_roles: [],
        job_levels: [],
        account_number: "",
        bank_account_fullname: "",
        id_number: "",
        id_card_date: "",
        issued_location: "",
        bank_id: "",
        bank_account_name: "",
        date_of_birth_read: "",
        date_of_birth_update: "",
        locations: [],
        candidate_skills: [],
        proficient_languages: [],
        image: null,
        front_side_image: null,
        back_side_image: null,
      },
      file: "",
      frontFile: "",
      backFile: "",
      previewImage: null,
      imagePath: "",
      frontImagePath: "",
      backImagePath: "",
      existedImage: null,
      isActiveEdit: false,
      isActiveEdit2: false,
      isActiveEdit3: false,
      isActiveEdit4: false,
      submitted: false,
      tryingToGetProfile: false,
      isGetProfileError: false,
      title: "Hồ Sơ",
      previewFrontImage: null,
      previewBackImage: null,
    };
  },

  validations: {
    email: {
      required,
      email,
    },
  },
  computed: {
    // previewImage(){
    //   return `@/assets/images/users/avatar-4.jpg`
    // },
    ...mapGetters("user", [
      "getProfileGetter",
    ]),

    ...mapState("user", ["userEmployer"]),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  watch: {
    data(newValue) {
      this.user = newValue;
    },
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "staff/uploadImgSuccess": {
          this.imagePath = state.staff.imgData.image;
          this.saveUser();
          break;
        }
        case "user/uploadBankImgSuccess": {
          if (state.user.bankImgData.front_side_image !== undefined) {
            this.frontImagePath = state.user.bankImgData.front_side_image;
          }
          if (state.user.bankImgData.back_side_image !== undefined) {
            this.backImagePath = state.user.bankImgData.back_side_image;
          }
          this.saveBankAccount();
          break;
        }
        case "user/profileSuccess": {
          Swal.fire("Cập nhật thông tin thành công", "", "success").then(() => {
            if (this.imagePath === null) {
              this.existedImage = null;
              this.imagePath = "";
              this.previewImage = null;
              this.file = "";
            } else if (this.imagePath !== "") {
              let path = this.imagePath;
              this.existedImage = `${process.env.VUE_APP_API_URL}${path}`;
              this.imagePath = "";
              this.previewImage = null;
              this.file = "";
            }
          });
          break;
        }
        case "user/bankAccountSuccess": {
          Swal.fire(
            "Cập nhật tài khoản ngân hàng thành công",
            "",
            "success"
          ).then(() => {
            if (this.frontImagePath !== "") {
              this.user.front_side_image = `${process.env.VUE_APP_API_URL}${this.frontImagePath}`;
              this.frontImagePath = "";
              this.previewFrontImage = null;
              this.frontFile = "";
            }
            if (this.backImagePath !== "") {
              this.user.back_side_image = `${process.env.VUE_APP_API_URL}${this.backImagePath}`;
              this.backImagePath = "";
              this.previewBackImage = null;
              this.backFile = "";
            }
          });
          break;
        }
      }
    });
  },
  mounted() {
    this.getProfileByEmployerId();
  },

  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("user", [
      "getProfileByEmployer",
      "putProfileByEmployer",
      "changePassword",
    ]),
    ...mapActions("staff", ["uploadImg"]),

    inputValueJobLevel(values) {
      if (values.length === 0) {
        this.selectJobLevels = null;
      } else {
        let result = values[0];
        for (let i = 1; i < values.length; i++) {
          result += ";" + values[i];
        }
        this.selectJobLevels = result;
      }
    },

    inputValueJobRole(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectJobRoles = result;
    },

    inputValueSkill(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectSkills = result;
    },
    inputValueLanguage(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectLanguages = result;
    },
    inputValueCity(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value.id);
      });

      this.selectCities = result;
    },

    getJobRole() {
      this.getJobRoleInformation();
    },

    getSkill() {
      this.getSkillInformation();
    },
    getLanguage() {
      this.getLanguageInformation();
    },
    getCity() {
      this.getCityInformation();
    },

    changeBirthdayRead() {
      this.user.date_of_birth_read = moment(
        this.user.date_of_birth_update
      ).format("DD/MM/YYYY");
    },

    async getProfileByEmployerId() {
      let userStorage = JSON.parse(localStorage.getItem("user"));
      var id = userStorage.data.id;
      await this.getProfileByEmployer(id);
      this.user.first_name = this.userEmployer.data.first_name;
      this.user.email = this.userEmployer.data.email;
      this.user.phone = this.userEmployer.data.phone;
      this.user.date_of_birth_update = this.userEmployer.data.birth_day;
      if (this.userEmployer.data.birth_day !== null) {
        this.user.date_of_birth_read = moment(
          this.userEmployer.data.birth_day
        ).format("DD/MM/YYYY");
      }
      this.user.last_name = this.userEmployer.data.last_name;
      this.user.image = this.userEmployer.data.image;
      if (this.user.image !== null) {
        this.existedImage = process.env.VUE_APP_API_URL + this.user.image.path;
      }
      this.user.address = this.userEmployer.data.address;
    },

    deleteImage() {
      if (this.previewImage !== null) {
        this.previewImage = null;
        this.file = "";
      } else if (this.existedImage !== null) {
        this.existedImage = null;
        this.imagePath = null;
      }
    },

    uploadImgForEmployer() {
      if (this.previewImage !== null) {
        const img = this.file;
        this.uploadImg({ img });
      } else {
        this.saveUser();
      }
    },

    saveUser() {
      let userStorage = JSON.parse(localStorage.getItem("user"));
      const userData = {
        id: userStorage.data.id,
        first_name: this.user.first_name,
        last_name: this.user.last_name,
      };
      if (this.user.phone !== null) {
        userData["phone"] = this.user.phone;
      }
      if (this.user.date_of_birth_update !== null) {
        userData["birth_day"] = this.user.date_of_birth_update;
      }
      if (this.user.address !== null) {
        userData["address"] = this.user.address;
      }
      if (this.imagePath !== "") {
        userData["image"] = this.imagePath;
      }
      if (userData.id) {
        this.putProfileByEmployer(userData);
      }
      this.isActiveEdit = false;
    },
    checkForm: function (e) {
      if (this.user.first_name && this.user.last_name) return true;
      this.errors = [];
      if (!this.name) this.errors.push("Name required.");
      if (!this.age) this.errors.push("Age required.");
      e.preventDefault();
    },

    pickFile() {
      let input = this.$refs.fileInput;
      let file = input.files;
      if (file && file[0]) {
        this.file = file[0];
        let reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file[0]);
        this.$emit("input", file[0]);
      }
    },

    cancelUploadAvatar(event) {
      event.stopPropagation();
      this.previewImage = null;
    },
    addTag(newTag) {
      const tag = {
        name: newTag,
        id: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
      };
      this.user.job_roles.push(tag);
      this.user.candidate_skills.push(tag);
      this.dataDropdown.push(tag);
    },
  },
};
</script>

<template>
  <Layout>
    <div class="row">
      <div class="mat-header-profile d-flex">
        <i class="fas fa-user-circle"></i>
        <span>Hồ sơ</span>
      </div>
    </div>
    <div class="row mb-4 mat-main-profile">
      <div class="col-xl-4 mat-profile-content">
        <div class="card h-auto">
          <div class="card-body">
            <div class="text-center mat-header-info">
              <!-- <b-dropdown
                class="float-end"
                variant="white"
                right
                menu-class="dropdown-menu-end"
                toggle-class="font-size-16 text-body p-0"
              >
                <template v-slot:button-content>
                  <i class="uil uil-ellipsis-v"></i>
                </template>
                <a class="dropdown-item" href="#">Edit</a>
                <a class="dropdown-item" href="#">Action</a>
                <a class="dropdown-item" href="#">Remove</a>
              </b-dropdown> -->
              <div class="clearfix"></div>
              <div class="d-flex justify-content-center">
                <div v-if="previewImage !== null" class="avatar">
                  <img for="upLoad" :src="previewImage" alt="" />
                </div>
                <div v-else-if="existedImage !== null" class="avatar">
                  <img for="upLoad" :src="existedImage" alt="" />
                </div>
                <div v-else class="avatar">
                  <img
                    for="upLoad"
                    src="https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg"
                    alt=""
                  />
                </div>
              </div>
              <h5 class="mt-3 mb-1 mat-title-name">
                {{ first_name }} {{ user.last_name }}
              </h5>

              <!-- <div class="mt-4">
                <button type="button" class="btn btn-light btn-sm">
                  <i class="uil uil-envelope-alt me-2"></i> Message
                </button>
              </div> -->
            </div>

            <div class="text-muted">
              <div class="table-responsive mb-0 mat-table-info">
                <div class="d-flex mat-table-content">
                  <span class="mat-title">Họ và tên: </span>
                  <span class="mat-title-value">
                    {{ user.first_name }} {{ user.last_name }}
                  </span>
                </div>
                <div class="d-flex mat-table-content">
                  <span class="mat-title">Ngày sinh: </span>
                  <span class="mat-title-value">
                    {{ user.date_of_birth_read }}
                  </span>
                </div>
                <div class="d-flex mat-table-content">
                  <span class="mat-title">Số điện thoại: </span>
                  <span class="mat-title-value">{{ user.phone }}</span>
                </div>
                <div class="d-flex mat-table-content">
                  <span class="mat-title">E-mail: </span>
                  <span class="mat-title-value">{{ user.email }}</span>
                </div>
                <div class="d-flex mat-table-content">
                  <span class="mat-title">Địa chỉ: </span>
                  <span class="mat-title-value">{{ user.address }}</span>
                </div>
                <div class="d-flex mat-table-content">
                  <span class="mat-title">Tình trạng hoạt động: </span>
                  <span class="mat-title-value">{{ user.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-8 mat-profile-content">
        <div class="card mb-0">
          <b-tabs justified class="nav-tabs-custom">
            <b-tab active>
              <template v-slot:title>
                <i class="uil uil-user-circle font-size-20"></i>
                <span class="d-none d-sm-block">Thông tin tài khoản</span>
              </template>
              <div>
                <div class="d-flex justify-content-center">
                  <div v-if="this.previewImage !== null" class="avatar">
                    <img for="upLoad" :src="previewImage" alt="" />
                  </div>
                  <div v-else-if="existedImage !== null" class="avatar">
                    <img for="upLoad" :src="existedImage" alt="" />
                  </div>
                  <div v-else class="avatar">
                    <img
                      for="upLoad"
                      src="https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg"
                      alt=""
                    />
                  </div>
                </div>
                <br />
                <div v-if="isActiveEdit" class="d-flex justify-content-center">
                  <div class="handleAvatar">
                    <div class="upload">
                      <input
                        ref="fileInput"
                        type="file"
                        id="upLoad"
                        @input="pickFile"
                        hidden
                      />

                      <label class="mat-button-upload" for="upLoad"
                        >Tải ảnh lên</label
                      >
                    </div>
                    <div class="delete">
                      <button @click="deleteImage">Xóa ảnh</button>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <form class="mat-form-profile">
                    <div
                      class="
                        col-12
                        mat-flex-layout-info mat-form-profile-content
                      "
                    >
                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          class="mb-3 mat-form-group"
                          id="example name"
                          label-for="name"
                        >
                          <span class="mat-form-title"> Họ </span>
                          <input
                            :disabled="!isActiveEdit"
                            class="form-control"
                            for="name"
                            v-model="user.first_name"
                          />
                        </b-form-group>
                      </div>
                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          class="mb-3 mat-form-group"
                          id="example name"
                          label-for="name"
                        >
                          <span class="mat-form-title"> Tên </span>
                          <input
                            for="name"
                            :disabled="!isActiveEdit"
                            class="form-control"
                            v-model="user.last_name"
                          />
                        </b-form-group>
                      </div>
                    </div>
                    <div
                      class="
                        col-12
                        mat-flex-layout-info mat-form-profile-content
                      "
                    >
                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          id="example-tel"
                          label-for="tele"
                          class="mb-3 mat-form-group"
                        >
                          <span class="mat-form-title"> Số điện thoại </span>
                          <input
                            v-model="user.phone"
                            :disabled="!isActiveEdit"
                            class="form-control"
                          />
                        </b-form-group>
                      </div>

                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          id="example-email"
                          class="mb-3 mat-form-group"
                        >
                          <span class="mat-form-title"> Email </span>
                          <input
                            v-model="user.email"
                            :disabled="true"
                            class="form-control"
                          />
                        </b-form-group>
                      </div>
                    </div>
                    <div
                      class="
                        col-12
                        mat-flex-layout-info mat-form-profile-content
                      "
                    >
                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          id="example-address"
                          label-for="address"
                          class="mb-3 mat-form-group"
                        >
                          <span class="mat-form-title"> Ngày sinh </span>
                          <input
                            type="date"
                            :disabled="!isActiveEdit"
                            @input="changeBirthdayRead"
                            v-model="user.date_of_birth_update"
                            class="form-control"
                          />
                        </b-form-group>
                      </div>
                      <div class="col-md-6 col-sm-6 col-xs-12">
                        <b-form-group
                          id="example-address"
                          label-for="address"
                          class="mb-3 mat-form-group"
                        >
                          <span class="mat-form-title"> Địa chỉ </span>
                          <input
                            :disabled="!isActiveEdit"
                            v-model="user.address"
                            class="form-control"
                          />
                        </b-form-group>
                      </div>
                    </div>

                    <div class="mat-action-form d-flex justify-content-end">
                      <div class="mat-button-form" v-if="isActiveEdit">
                        <button
                          type="button"
                          class="mat-button-cancel"
                          v-on:click="isActiveEdit = !isActiveEdit"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          class="mat-button-save"
                          v-on:click="uploadImgForEmployer()"
                        >
                          Lưu
                        </button>
                      </div>
                      <div class="mat-button-form" v-if="!isActiveEdit">
                        <button
                          class="mat-button-edit"
                          v-on:click="isActiveEdit = !isActiveEdit"
                          type="button"
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                      <!-- <b-button
                        variant="success"
                        class="w-md ms-1"
                        v-on:click="saveUser()"
                        >Lưu</b-button
                      > -->
                    </div>
                  </form>
                </div>
              </div>
            </b-tab>
            
            <b-tab>
              <template v-slot:title>
                <i class="uil uil-keyhole-circle font-size-20"></i>
                <span class="d-none d-sm-block">Đổi mật khẩu</span>
              </template>
              <div class="col-12 mt-4">
                <ChangePassword />
              </div>
            </b-tab>
          </b-tabs>
          <!-- Nav tabs -->
          <!-- Tab content -->
        </div>
      </div>
    </div>
    <!-- end row -->
  </Layout>
</template>
<style lang="scss">
.mat-flex-layout-info {
  display: flex;
  @media screen and (max-width: 600px) {
    display: block;
  }
}
.mat-flex-layout {
  display: flex;
  @media screen and (max-width: 600px) {
    display: block;
  }
}
.mat-header-info {
  .mat-title-name {
    color: #495057;
    @media screen and (max-width: 600px) {
      font-size: 14px;
    }
  }
}

.mat-table-info {
  margin-top: 30px;
  @media screen and (max-width: 600px) {
    margin-top: 10px;
  }
  .mat-table-content {
    margin-bottom: 10px;
    .mat-title {
    }
    .mat-title-value {
      margin-left: 5px;
      color: #495057;
    }
    @media screen and (max-width: 600px) {
      font-size: 13px;
    }
  }
}
.mat-main-profile {
  .mat-profile-content {
    .mat-content-upload-avatar {
      margin-top: 10px;
      img {
        padding: 5px;
        width: 150px;
        height: 150px;
        border: 1px solid #eae9e9;
        border-radius: 50%;
        @media screen and (max-width: 600px) {
          width: 110px;
          height: 110px;
        }
      }
      .mat-button-upload {
        cursor: pointer;
        margin: 10px 0;
        outline: none;
        border: 1px solid #495cba;
        background-color: #495cba;
        color: #fff;
        border-radius: 4px;
        padding: 4px 15px;
        transition: all 0.25s ease-in;
        &:hover {
          background-color: #495cba;
        }
      }
      .mat-button-upload-cancel {
        cursor: pointer;
        margin: 10px 0;
        outline: none;
        border: 1px solid #d4d3d3;
        border-radius: 4px;
        padding: 4px 15px;
        transition: all 0.25s ease-in;
        background: #fff;
        &:hover {
          background: #e7e5e5;
        }
      }
      @media screen and (max-width: 600px) {
        .mat-button-upload {
          font-size: 13px;
        }
        img {
          width: 110px;
          height: 110px;
        }
      }
    }
    .mat-form-profile {
      width: 90%;
      @media screen and (max-width: 767px) {
        width: 95%;
      }

      margin: 0 auto;
      .mat-form-profile-contents {
        @media screen and (max-width: 600px) {
          display: flex;
          justify-content: flex-end;
          flex-direction: column;
          margin-bottom: 2px;
        }
      }
      @media screen and (max-width: 600px) {
        .multiselect__select {
          height: 35px !important;
        }
      }
      .mat-form-profile-content {
        .mat-form-group {
          .mat-form-title {
            font-size: 15px;
            color: #495057;
            font-weight: 500;
            @media screen and (max-width: 600px) {
              font-size: 13px;
            }
          }
          @media screen and (max-width: 600px) {
            font-size: 13px;
          }
          padding: 0 10px;
          @media screen and (max-width: 767px) {
            padding: 0 5px;
          }
        }
      }
      .mat-action-form {
        margin-bottom: 15px;
        @media screen and (max-width: 600px) {
          .mat-button-form {
            font-size: 13px;
          }
        }
        .mat-button-form {
          button {
            outline: none;
            padding: 5px 25px;
            outline: none;
            border-radius: 8px;
            border: none;
            transition: all 0.25s ease-in;
          }
          .mat-button-edit {
            border: 1px solid #d4d3d3;
            background: #fff;
            &:hover {
              background: #e7e5e5;
            }
          }
          .mat-button-save {
            background: #1aa94c;
            border: 1px solid #1aa94c;
            color: #fff;
            &:hover {
              background: #0eb94a;
            }
          }
          .mat-button-cancel {
            background: #fff;
            border: 1px solid #d4d3d3;
            margin-right: 8px;
            &:hover {
              background: #e7e5e5;
            }
          }
        }
      }
    }
  }
  .form-control {
    cursor: pointer;
    @media screen and (max-width: 600px) {
      font-size: 13px;
    }
    &:focus {
      border: 1px solid #495cba !important;
    }
  }
}
.handleAvatar {
  button {
    width: 120px;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    transition: all 0.3s ease-in-out;
  }
  .upload {
    margin-top: 2px;
    label {
      padding: 5px 10px;
      border-radius: 3px;
      width: 120px;
      background-color: #5b73e8;
      border: 1px solid #5b73e8;
      cursor: pointer;
      text-align: center;
      color: #fff;
      &:hover {
        background-color: #4763ee;
      }
    }
  }
  .delete {
    button {
      color: #495057;
      border: 1px solid #e1e2e2;
      &:hover {
        background-color: #e1e2e2;
      }
    }
  }
}
.bodyName {
  margin-top: 12px;
  span {
    color: #5b73e8;
    font-size: 20px;
  }
  i {
    margin-left: 7px;
    font-size: 18px;
  }
}
.avatar {
  margin-top: 8px;
  width: 180px;
  border-radius: 10px;
  padding: 5px;
  height: 180px;
  border: 1px solid #e1e2e2;
  border-radius: 50%;

  img {
    width: 100%;
    border-radius: 50%;
    height: 100%;
  }
}
.identity-card__front,.identity-card__back{
  margin-top: 8px;
  width: 100%;
  border-radius: 10px;
  padding: 5px;
  height: 200px;
  border: 1px solid #e1e2e2;
  border-radius: 20px;
  img {
    width: 100%;
    border-radius: 20px;
    height: 100%;
  }
  
}
.identity-card__frontInput,
.identity-card__backInput{
  text-align: center;
  .mat-button-upload{
    cursor: pointer;
    background-color: #5b73e8;
    color:#fff;
    padding: 5px 10px;border-radius: 5px;
    transition: .3s easy;

    &:hover{
      background-color: #564ab1;
    }
  }
}

.mat-header-profile {
  align-items: center;
  height: 30px;
  margin-bottom: 10px;
  i {
    font-size: 25px;
    color: #495057;
    margin-right: 5px;
  }
  span {
    color: #495057;
    font-size: 20px;
  }
}
</style>