<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import jwt_decode from "jwt-decode";
import { mapActions } from "vuex";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import Swal from "sweetalert2";

export default {
  page: {
    title: "Danh sách nhân viên",
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
    Paginate,
  },
  data() {
    return {
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      title: "Danh sách nhân viên",
      submitted: false,
      status: "Tất cả trạng thái",
      filter_options: ["Tất cả trạng thái", "approval", "invisible", "lock"],
      gender: [
        {
          id: 0,
          name: "Nam",
        },
        {
          id: 1,
          name: "Nữ",
        },
      ],
      statusArr: [
        {
          id: 1,
          name: "approval",
        },
        {
          id: 2,
          name: "invisible",
        },
        {
          id: 3,
          name: "lock",
        },
      ],
      image: "",
      imagePath: "",
      file: "",
      selectedImage: "",
      permissions: [],
      selected_permissions: [],
      selected_status: [],
      selected_gender: [],
      form: {
        previewImage: null,
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        address: "",
        birth_day: "",
        phone: "",
        gender: "",
        status: "",
        permission_ids: [],
      },
      sorts: [
        {
          id: 1,
          name: "Tên (tăng dần)",
        },
        {
          id: -1,
          name: "Tên (giảm dần)",
        },
        {
          id: 2,
          name: "Ngày tạo (tăng dần)",
        },
        {
          id: -2,
          name: "Ngày tạo (giảm dần)",
        },
      ],
      sort: {
        id: 0,
        name: "Tên (tăng dần)",
      },

      search_value: "",
      checkAll: false,
      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      staffs: {},
    };
  },
  validations: {
    form: {
      first_name: {
        required,
      },
      last_name: {
        required,
      },
      email: {
        required,
        email,
      },

      password: {
        required,
      },

      phone: {
        maxLength: maxLength(15),
        minLength: minLength(10),
      },

      status: {
        required,
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
    this.getPermissionsStaff();
    this.searchStaff();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      let arrPermistion = [];
      state.staff.permissionData.permissions.forEach((item) => {
        arrPermistion.push({ ...item, isChecked: false });
      });
      this.permissions = [...arrPermistion];

      switch (mut.type) {
        case "staff/searchStaffSuccess": {
          this.staffs = state.staff.staffData.data;
          this.total_pages = state.staff.staffData.totalPages;
          this.page_index = state.staff.staffData.pageIndex + 1;
          break;
        }
        case "staff/uploadImgSuccess": {
          this.imagePath = state.staff.imgData.image;
          this.createStaff();
          break;
        }
        case "staff/createStaffSuccess": {
          Swal.fire("Tạo nhân viên thành công", "", "success").then(() => {
            this.showDetailStaff(state.staff.createdStaff.data);
          });
          break;
        }
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    search_value: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchStaffButtonAction();
      }, 800);
    },

    sort: function () {
      this.searchStaffButtonAction();
    },

    selected_permissions: function () {
      this.form.permission_ids = [];
      this.selected_permissions.forEach((permissions) => {
        this.form.permissions.push(permissions.id);
      });
    },

    status: function () {
      this.searchStaffButtonAction();
    },
  },
  methods: {
    ...mapActions("staff", [
      "searchStaffForEmployer",
      "getPermissions",
      "createNewStaff",
      "uploadImg",
    ]),

    searchStaffButtonAction() {
      if (
        this.checkPermisstion("staff.all") ||
        this.checkPermisstion("staff.search")
      ) {
        this.searchStaff();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },
    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },
    getPermissionsStaff() {
      this.getPermissions();
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchStaff();
    },

    searchStaff() {
      const keyword = this.search_value;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
      var status = this.status;

      switch (status) {
        case "Tất cả trạng thái":
          status = 0;
          break;
        case "approval":
          status = 1;
          break;
        case "invisible":
          status = 2;
          break;
        case "lock":
          status = 3;
          break;

        default:
      }
      this.searchStaffForEmployer({
        keyword,
        page_index,
        page_size,
        sort_by,
        status,
      });
    },
    formSubmit() {
      this.submitted = true;
      this.$v.$touch();
      this.createStaff();
    },
    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
    },

    async uploadImgForCreateStaff() {
      this.submitted = true;
      this.$v.$touch();
      if (this.form.previewImage !== null) {
        const img = this.file;
        this.uploadImg({ img });
      } else {
        this.createStaff();
      }
    },
    getImageURL(path) {
      return generateApiUrl(path);
    },

    async createStaff() {
      this.submitted = true;
      var status = this.form.status.name;
      let permission_ids = [];
      for (let permission of this.form.permission_ids) {
        permission_ids.push(permission._id);
      }
      let image;
      if (this.imagePath !== "") {
        image = this.imagePath;
      }
      const data = {
        image,
        first_name: this.form.first_name,
        last_name: this.form.last_name,
        email: this.form.email,
        password: this.form.password,
        status,
        permission_ids
      };
      if (
        this.form.address !== null &&
        this.form.address.trim() !== ""
      ) {
        data.address = this.form.address;
      }
      if (this.form.phone !== null && this.form.phone.trim() !== "") {
        data.phone = this.form.phone;
      }
      if (this.form.birth_day !== "") {
        data.birth_day = this.form.birth_day;
      }
      if (
        this.form.gender !== null &&
        this.form.gender !== ""
      ) {
        data.gender = this.form.gender.name;
      }
      if (data) {
        await this.createNewStaff(data);
      }
    },
    showDetailStaff(staff_id) {
      if (
        this.checkPermisstion("staff.all") ||
        this.checkPermisstion("staff.detail")
      ) {
        const domain = window.location.origin;
        const url = domain + "/staff-detail?id=" + staff_id;
        window.location.href = url;
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    showModal() {
      if (
        this.checkPermisstion("staff.all") ||
        this.checkPermisstion("staff.create")
      ) {
        this.$refs["my-modal"].show();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    hideModal() {
      this.$refs["my-modal"].hide();
    },
    hideModalContact() {
      this.$refs["my-modalContact"].hide();
    },
    hideModalContact1() {
      this.$refs["my-modal"].hide();
    },

    openFile() {
      var input = this.file.target;
      var reader = new FileReader();
      reader.onload = function () {
        var dataURL = reader.result;
        var output = document.getElementById("output");
        output.src = dataURL;
      };
      reader.readAsDataURL(input.files[0]);
    },
    selectImage() {
      this.$refs.fileInput.click();
    },
    pickFile() {
      let input = this.$refs.fileInput;
      let file = input.files;
      if (file && file[0]) {
        this.file = file[0];
        let reader = new FileReader();
        reader.onload = (e) => {
          this.form.previewImage = e.target.result;
        };
        reader.readAsDataURL(file[0]);
        this.$emit("input", file[0]);
      }
    },
    handleChecked() {
      // let currCheck = item;
      // let checkExit = false;
      // if ([...this.permissions].length === 0) {
      //   currCheck.is_disable = !currCheck.is_disable;
      //   this.permissions.push(currCheck);
      // } else {
      //   this.permissions.forEach((data, idx) => {
      //     if (data._id === item._id) {
      //       checkExit = true;
      //       currCheck.is_disable = !currCheck.is_disable;
      //       this.permissions = this.permissions.filter(
      //         (pers) => pers._id !== item._id
      //       );
      //     }
      //   });
      //   if (!checkExit) {
      //     currCheck.is_disable = !currCheck.is_disable;
      //     this.permissions.push(currCheck);
      //   }
      // }
    },

    checkValueTrue(data) {
      if (data.isChecked === true) {
        return true;
      }
      return false;
    },
    checkboxAll(data) {
      let arrPermistions = [...this.permissions];
      let checkPermistion = data.permission.includes(".all");
      let checkValue = this.checkValueTrue(data);

      for (let index = 0; index < arrPermistions.length; index++) {
        if (
          checkPermistion &&
          !checkValue &&
          data.page === arrPermistions[index].page
        ) {
          arrPermistions[index].isChecked = true;
        } else if (
          checkPermistion &&
          checkValue &&
          data.page === arrPermistions[index].page
        ) {
          arrPermistions[index].isChecked = false;
        } else if (
          data.page === arrPermistions[index].page &&
          !checkPermistion
        ) {
          arrPermistions[index].isChecked = false;
        }
      }
      this.permissions = [...arrPermistions];
    },

    handleCheckPermission(item) {
      let currCheck = item;
      let checkExit = false;
      this.checkboxAll(item);
      if ([...this.form.permission_ids].length === 0) {
        currCheck.is_disable = !currCheck.is_disable;
        this.form.permission_ids.push(currCheck);
      } else {
        this.form.permission_ids.forEach((data) => {
          if (data._id === item._id) {
            checkExit = true;
            currCheck.is_disable = !currCheck.is_disable;
            this.form.permission_ids = this.form.permission_ids.filter(
              (pers) => pers._id !== item._id
            );
          }
        });
        if (!checkExit) {
          currCheck.is_disable = !currCheck.is_disable;
          this.form.permission_ids.push(currCheck);
        }
      }
    },
  },
};
</script>
<template>
  <Layout>
    <div id="main" class="main__staff">
      <div class="d-flex align-items-center">
        <div class="headerDetailPage d-flex" style="flex: 1">
          <!-- <a href="#">
            <button class="handleBack">
              <i class="fas fa-chevron-left"></i></button
          ></a> -->
          <i
            class="fas fa-users"
            style="font-size: 20px; margin-right: 7px"
          ></i>
          <PageHeader :title="title" />
        </div>
        <div class="mat-action-add-staff">
          <button
            v-on:click="showModal()"
            data-toggle="modal"
            data-target=".bs-example-modal-center"
          >
            <i class="fas fa-plus-circle"></i
            ><span style="margin-top: 1px">Thêm nhân viên</span>
          </button>
          <b-modal
            ref="my-modal"
            id="modal-lg"
            size="lg"
            title-class="font-18"
            hide-footer
            title="Thêm nhân viên"
          >
            <form
              class="formCreateStaff"
              @submit.prevent="uploadImgForCreateStaff"
            >
              <div class="row">
                <div class="col-12 d-flex contentBasic justify-content-center">
                  <div class="mainAvatar">
                    <div
                      v-if="form.previewImage"
                      class="imagePreviewWrapper"
                      :style="{
                        'background-image': `url(${form.previewImage})`,
                      }"
                      @click="onClickedUploadButton"
                    ></div>
                    <div
                      v-if="!form.previewImage"
                      class="imagePreviewWrapper"
                      :style="{
                        'background-image': `url('https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg')`,
                      }"
                      @click="onClickedUploadButton"
                    ></div>
                    <input
                      ref="fileInput"
                      type="file"
                      @input="pickFile"
                      id="inputUpload"
                      hidden
                    />
                    <div @click="onClickedUploadButton" class="uploadAvatar">
                      <button type="button">Tải ảnh nhân viên</button>
                    </div>
                  </div>
                </div>
                <div class="col-12 d-flex contentBasic">
                  <div class="col-6" style="padding-right: 10px">
                    <span class="title"
                      >Họ
                      <span style="color: red" class="labelStar">*</span></span
                    >
                    <div class="inputContent">
                      <input
                        type="text"
                        v-model="form.first_name"
                        :class="{
                          'is-invalid': submitted && $v.form.first_name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.first_name.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.first_name.required"
                          >Họ không được bỏ trống *</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-6" style="padding-left: 10px">
                    <span class="title"
                      >Tên
                      <span style="color: red" class="labelStar">*</span></span
                    >
                    <div class="inputContent">
                      <input
                        type="text"
                        v-model="form.last_name"
                        :class="{
                          'is-invalid': submitted && $v.form.last_name.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.last_name.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.last_name.required"
                          >Tên không được bỏ trống *</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 d-flex contentBasic">
                  <div class="col-6" style="padding-right: 10px">
                    <span class="title"
                      >Mật khẩu
                      <span style="color: red" class="labelStar">*</span></span
                    >
                    <div class="inputContent">
                      <input
                        type="password"
                        v-model="form.password"
                        :class="{
                          'is-invalid': submitted && $v.form.password.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.password.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.password.required"
                          >Mật khẩu không được bỏ trống *</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-6" style="padding-left: 10px">
                    <span class="title"
                      >Email
                      <span style="color: red" class="labelStar">*</span></span
                    >
                    <div class="inputContent">
                      <input
                        type="email"
                        v-model="form.email"
                        :class="{
                          'is-invalid': submitted && $v.form.email.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.email.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.email.required"
                          >Email không được bỏ trống *</span
                        >
                        <span v-if="!$v.form.email.email"
                          >Email không đúng định dạng *</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 d-flex contentBasic">
                  <div class="col-6" style="padding-right: 10px">
                    <span class="title"
                      >Số điện thoại</span>
                    <div class="inputContent">
                      <input
                        type="text"
                        v-model="form.phone"
                        :class="{
                          'is-invalid': submitted && $v.form.phone.$error,
                        }"
                      />
                      <div
                        v-if="submitted && $v.form.phone.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.phone.minLength"
                          >Số điện thoại quá ngắn, lớn hơn bằng 10 *</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-6" style="padding-left: 10px">
                    <span class="title"
                      >Ngày sinh</span>
                    <div class="inputContent">
                      <input type="date" v-model="form.birth_day" />
                    </div>
                  </div>
                </div>
                <div class="col-12 d-flex contentBasic">
                  <div class="col-6" style="padding-right: 10px">
                    <span class="title"
                      >Địa chỉ</span>
                    <div class="inputContent">
                      <input
                        type="text"
                        v-model="form.address"
                      />
                    </div>
                  </div>

                  <div class="col-6" style="padding-left: 10px">
                    <span class="title"
                      >Giới tính</span>
                    <div class="" style="margin: 5px 0 15px 0">
                      <multiselect
                        v-model="form.gender"
                        :options="gender"
                        :taggable="true"
                        placeholder="Chọn giới tính"
                        label="name"
                        track-by="id"
                      ></multiselect>
                    </div>
                  </div>
                </div>
                <div class="col-12 d-flex contentBasic">
                  <div class="col-6" style="padding-right: 10px">
                    <span class="title"
                      >Trạng thái</span>
                      <span style="color: red" class="labelStar">*</span></span
                    >
                    <div class="" style="margin: 5px 0 15px 0">
                      <multiselect
                        v-model="form.status"
                        :options="statusArr"
                        :taggable="true"
                        label="name"
                        track-by="id"
                        :class="{
                          'is-invalid': submitted && $v.form.status.$error,
                        }"
                      ></multiselect>
                      <div
                        v-if="submitted && $v.form.status.$error"
                        class="invalid-feedback"
                      >
                        <span v-if="!$v.form.status.required"
                          >Trạng thái không được bỏ trống *</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 contentBasic d-f">
                  <div class="d-flex">
                    <span class="title" style="flex: 1">Quyền</span>
                  </div>

                  <div class="benefit d-flex">
                    <div class="col-6">
                      <div>
                        <span class="titleBenefit"> Công việc </span>

                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Công việc')">
                            <input
                              type="checkbox"
                              :checked="item.isChecked"
                              v-on:click="handleCheckPermission(item)"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <span class="titleBenefit"> Nhân viên </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Nhân viên')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <span class="titleBenefit"> Ứng viên </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Ứng viên')">
                            <input
                              type="checkbox"
                              :checked="item.isChecked"
                              v-on:click="handleCheckPermission(item)"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                         <div class="mt-2">
                        <span class="titleBenefit"> Cộng tác viên </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Cộng tác viên')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div>
                        <span class="titleBenefit"> Phỏng vấn </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Phỏng vấn')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <span class="titleBenefit"> Công ty </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Công ty')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="mt-2">
                        <span class="titleBenefit"> Thống kê </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Thống kê')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-2">
                        <span class="titleBenefit"> Thanh toán </span>
                        <div
                          class="contentBenefit"
                          v-for="item in permissions"
                          v-bind:key="item"
                        >
                          <div v-if="item.page.includes('Thanh toán')">
                            <input
                              type="checkbox"
                              v-on:click="handleCheckPermission(item)"
                              :checked="item.isChecked"
                            />
                            <span class="mat-item-checkbox">{{
                              item.description
                            }}</span>
                          </div>
                        </div>
                      </div>
                     
                    </div>
                  </div>
                </div>
              </div>
              <div class="actionHideModal d-flex">
                <div class="btnCancel">
                  <button type="button" v-on:click="hideModal">Hủy</button>
                </div>
                <div class="btnSuccess">
                  <button type="submit">Lưu</button>
                </div>
              </div>
            </form>
          </b-modal>
        </div>
      </div>
      <div class="row mt-4">
        <div class="searchStaff flex-wrap">
          <div class="input__Search">
            <input
              type="text"
              class="form-control"
              placeholder="Nhập từ khóa để tìm kiếm..."
              v-model="search_value"
            />
          </div>
          <div class="mat-action-button-search-staff">
            <button
              type="button"
              class="btn btn-search"
              v-on:click="searchStaff"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <div class="mat-filter-staffby">
            <div class="mat-filter-staff">
              <div class="mat-filter-staff flex-wrap">
                <div style="margin-right: 15px" class="mat-icon-staff-filter">
                  <i class="fas fa-filter"></i>
                  <span> Lọc theo </span>
                </div>

                <div class="filterContent align-items-center">
                  <div class="mat-filter-text">
                    <span class="mat-title-filter"> Trạng thái </span>
                  </div>
                  <multiselect
                    v-model="status"
                    :options="filter_options"
                    :allow-empty="false"
                    :show-labels="false"
                    class="mat-filter-status-staff"
                  ></multiselect>
                </div>

                <div
                  class="
                    d-flex
                    mat-filter-sort-staff
                    align-items-center
                    justify-content-end
                  "
                >
                  <span class="mat-filter-sort-staff-title"
                    ><i
                      class="fas fa-exchange-alt"
                      style="transform: rotate(90deg)"
                    ></i
                    >Sắp xếp theo</span
                  >
                  <multiselect
                    v-model="sort"
                    label="name"
                    :options="sorts"
                    :allow-empty="false"
                    :show-labels="false"
                    class="mat-sort-staff"
                    placeholder="Chọn loại sắp xếp"
                  ></multiselect>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-12 mt-3">
          <div class="listStaff">
            <div class="table-scroll">
              <table class="table table__staff" style="width: 100%">
                <thead class="header">
                  <tr>
                    <td class="mat-title-table">STT</td>
                    <td style="width: 400px" class="mat-title-table">
                      Họ tên / Số điện thoại
                    </td>
                    <td class="mat-title-table">Giới tính</td>
                    <td class="mat-title-table">Ngày sinh</td>
                    <td style="" class="mat-title-table">Email</td>
                    <td style="width: 200px" class="mat-title-table">
                      Trạng thái
                    </td>
                  </tr>
                </thead>
                <tbody class="bodyTable">
                  <tr v-for="(user, idx) in staffs" v-bind:key="user._id">
                    <td class="mat-title-table" style="padding: 0 20px">
                      {{ idx + 1 }}
                    </td>
                    <td
                      class="
                        nameTable
                        d-flex
                        align-items-center
                        mat-title-table
                      "
                      style="height: 70px"
                    >
                      <!-- <div v-if="form.previewImage !== null" class="avatar">
                        <img :src="getImageURL(user.image)" />
                      </div> -->
                      <div v-if="user.image !== null" class="avatar">
                        <img :src="getImageURL(user.image)" />
                      </div>
                      <div v-else class="avatar">
                        <img
                          for="upLoad"
                          src="https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg"
                          alt=""
                        />
                      </div>
                      <div v-on:click="showDetailStaff(user._id)">
                        <span class="name mat-title-table">{{
                          user.first_name + " " + user.last_name
                        }}</span>
                        <span style="margin-left: 5px">
                          <i
                            class="fas fa-venus"
                            v-if="user.gender === 'Nữ'"
                          ></i>
                          <i
                            class="fas fa-mars-stroke"
                            v-if="user.gender === 'Nam'"
                          ></i>
                        </span>
                        <div>
                          <span class="phone mat-title-table">{{
                            user.phone
                          }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="mat-title-table">{{ user.gender }}</td>
                    <td class="mat-title-table">{{ user.birth_day }}</td>
                    <td class="mat-title-table" style="">{{ user.email }}</td>
                    <td class="mat-title-table" style="">
                      <span
                        v-if="user.status === 'approval'"
                        class="availClass mat-title-table"
                        >{{ user.status }}</span
                      >
                      <span v-if="user.status === 'lock'" class="lockClass">{{
                        user.status
                      }}</span>
                      <span
                        v-if="user.status == 'invisible'"
                        class="invisiClass mat-title-table"
                        >{{ user.status }}</span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mat-paging-staff d-flex align-items-center">
              <paginate
                :page-count="total_pages"
                :click-handler="clickCallback"
                :prev-text="'Trước'"
                :next-text="'Sau'"
                :container-class="'pagination'"
                :active-class="'pagination-active'"
                :page-link-class="'pagination-item'"
                v-model="page_index"
              >
              </paginate>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<style lang="scss">
.mat-item-checkbox {
  font-size: 15px;
}
@media screen and (max-width: 768px) {
  .mat-item-checkbox {
    font-size: 14px;
  }
  .modal-body {
    padding: 1rem !important;
  }
  .modal-header {
    padding: 0.7rem 0.7rem;
  }
  .close {
    font-size: 25px;
  }
}
@media screen and (max-width: 480px) {
  .mat-item-checkbox {
    font-size: 13px;
  }
  .modal-body {
    padding: 0.7em !important;
  }
  .modal-header {
    padding: 0.5rem 0.5rem;
  }
  .close {
    font-size: 20px;
  }
}
.mat-filter-status-staff {
  width: 200px;
  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 768px) {
    width: 200px;
  }
}
.mat-icon-staff-filter {
  i {
    font-size: 22px;
    margin-right: 5px;
    @media screen and (max-width: 768px) {
      font-size: 20px;
    }
    @media screen and (max-width: 480px) {
      font-size: 18px;
    }
  }
  span {
    font-size: 14.4px;
    font-family: "Roboto", sans-serif;
    @media screen and (max-width: 768px) {
      font-size: 13.5px;
    }
    @media screen and (max-width: 480px) {
      font-size: 13px;
    }
  }
}
.mat-sort-staff {
  width: 200px;
  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 768px) {
    width: 170px;
  }
}

.textPaging {
  display: flex;
}
.textPaging .active {
  background: #5b73e8;
  color: #ffffff;
}
.textPaging .active:hover {
  background: #4661e9;
}
.textPaging div {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 3px;
  width: 38px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  color: #000;
  height: 38px;
  border: 1px solid #eae9e9;
  transition: all 0.1s linear;
}
.textPaging div:hover {
  background-color: #eae9e9;
}
.modal {
  overflow: hidden !important;
}
.uploadAvatar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  button {
    background-color: #5b73e8;
    padding: 5px 10px;
    border: 1px solid #5b73e8;
    color: #fff;
    border-radius: 3px;
    outline: none;
    transition: all 0.2s ease-in-out;
    &:hover {
      background-color: #4d62c5;
      border: 1px solid #4d62c5;
    }
    @media screen and (max-width: 768px) {
      font-size: 14px;
      padding: 4px 8px;
    }
    @media screen and (max-width: 480px) {
      padding: 3px 8px;
      font-size: 13px;
    }
  }
}
.imagePreviewWrapper {
  border: 2px solid #f1f1f1;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: block;
  cursor: pointer;
  background-size: cover;
  background-position: center center;
  @media screen and (max-width: 768px) {
    width: 135px;
    height: 135px;
  }
  @media screen and (max-width: 480px) {
    width: 120px;
    height: 120px;
  }
}
.benefit {
  height: auto;
  padding: 10px;
  input {
    width: 17px;
    height: 17px;
    margin-right: 10px;
  }
  .titleBenefit {
    font-family: "Roboto", sans-serif;
    color: #495057;
    font-weight: 500;
    font-size: 14.555px;
    @media screen and (max-width: 768px) {
      font-size: 13.555px;
    }
    @media screen and (max-width: 480px) {
      font-size: 13px;
    }
  }
  .contentBenefit {
    display: flex;
    align-items: center;
    input[type="checkbox"] {
      position: relative;
      cursor: pointer;
      margin-right: 15px;
    }
    input[type="checkbox"]:before {
      content: "";
      display: block;
      position: absolute;
      width: 20px;
      height: 20px;
      top: 0;
      left: 0;
      background-color: #e9e9e9;
      @media screen and (max-width: 768px) {
        width: 18px;
        height: 18px;
      }
      @media screen and (max-width: 48px) {
        width: 17px;
        height: 17px;
      }
    }

    input[type="checkbox"]:checked:before {
      content: "";
      display: block;
      position: absolute;
      width: 20px;
      height: 20px;
      top: 0;
      left: 0;
      background-color: #1e80ef;
      @media screen and (max-width: 768px) {
        width: 18px;
        height: 18px;
      }
      @media screen and (max-width: 48px) {
        width: 17px;
        height: 17px;
      }
    }
    input[type="checkbox"]:disabled:before {
      background-color: #c2c2c2;
    }
    input[type="checkbox"]:checked:after {
      content: "";
      display: block;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
      position: absolute;
      top: 2px;
      left: 6px;
    }
    span {
    }
  }
}
.modal-body {
  padding: 1.2rem;
  position: relative;
}
.modal-dialog {
  max-width: 900px !important;
}
.modal-content {
  max-height: 700px;
  overflow-y: auto;
  overflow-x: hidden;
}
.modal-header {
  background-color: rgb(226, 232, 241);
  border: 1px solid rgb(226, 232, 241);
  .modal-title {
    font-weight: 550;
    font-size: 18px;
  }
  .close {
    font-size: 40px;
    display: flex;
    align-items: center;
  }
}
.main__staff .avatar {
  margin-top: 8px;
  width: 60px;
  border-radius: 10px;
  padding: 5px;
  height: 60px;
  border: 1px solid #e1e2e2;
  border-radius: 10%;
  img {
    width: 100%;
    border-radius: 10%;
    height: 100%;
  }
}
.actionHideModal {
  position: sticky;
  /* left: auto; */
  /* right: 0; */
  bottom: 10px;
  justify-content: flex-end;
  button {
    outline: none;
    border: none;
    padding: 5px 30px;
    -webkit-box-shadow: 0px 2.2px 3px -3px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 2.2px 3px -3px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 2.2px 3px -3px rgba(0, 0, 0, 0.5);
    @media screen and (max-width: 768px) {
      font-size: 14px;
      padding: 4px 25px;
    }
    @media screen and (max-width: 480px) {
      font-size: 13px;
      padding: 3px 20px;
    }
  }
  .btnCancel button {
    border: 1px solid #e9e9e9;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border-radius: 3px;
    background: #e9e9e9;
    color: #000;
    &:hover {
      border: 1px solid #dfdede;
      background: #dfdede;
    }
  }
  .btnSuccess button {
    margin-left: 10px;
    border: 1px solid #1aa94c;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border-radius: 3px;
    background: #1aa94c;
    color: #fff;
    &:hover {
      border: 1px solid #25bb59;

      background: #25bb59;
    }
  }
}
.contentBasic {
  .title {
    font-size: 14.444px;
    font-family: "Roboto", sans-serif;
    color: #495057;
    font-weight: 500;
    @media screen and (max-width: 768px) {
      font-size: 14px;
    }
    @media screen and (max-width: 480px) {
      font-size: 13px;
    }
  }
  .mainAvatar {
    .avatar {
      background-image: url("https://www.alliancerehabmed.com/wp-content/uploads/icon-avatar-default.png");
      background-repeat: no-repeat;
      background-size: cover;
      margin-bottom: 10px;
      width: 150px;
      border-radius: 50%;
      height: 150px;

      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #f1f1f1;
      }
      label {
        font-size: 18px;
        cursor: pointer;
      }
    }
  }

  .inputContent {
    margin: 5px 0 15px 0;
    input {
      width: 100%;
      border-radius: 4px;
      outline: none;
      border: 1px solid #e1e2e2;
      height: 38px;
      padding: 0 10px;
      @media screen and (max-width: 480px) {
        height: 30px;
        padding: 0 5px;
      }
    }
    @media screen and (max-width: 480px) {
    }
  }
}
.formCreateStaff {
  .header {
    span {
      color: #495057;
      font-size: 18px;
    }
  }
}

.modal-dialog {
  max-width: 600px;
  padding: 10px;
}
.modal-header {
}
.invisiClass {
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 8px;
  background-color: #fda90e;
}
.availClass {
  color: #ffffff;
  background-color: #5b73e8;
  padding: 2px 10px;
  border-radius: 8px;
}
.lockClass {
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 8px;
  background-color: #b1b1b1;
  width: 30px;
}
.nameTable {
  i {
    color: #cccecf;
    font-size: 18px;
  }
  .fa-mars-stroke {
    color: #4763ee;
  }
  .fa-venus {
    color: rgb(255, 100, 100);
  }
  .name {
    font-family: "Roboto", sans-serif;
    font-weight: 600;
    color: #495057;
  }
  .phone,
  .email {
    font-family: "Roboto", sans-serif;
    font-weight: 500;
    color: #7f8285;
  }
  .phone {
    margin-right: 10px;
  }
}
.bodyTable {
  tr {
    border-bottom: 1px solid #e1e2e2;
    height: 55px;
    cursor: pointer;
    background-color: #ffffff;
    &:hover {
      background-color: #f9f9f9;
    }
  }
}
.listStaff {
  border: 1px solid #ced4da;
  margin-bottom: 15px;
  border-radius: 3px;
  -webkit-box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
  -moz-box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
  box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
  .mat-title-table {
    @media screen and (max-width: 768px) {
      font-size: 14px;
    }
    @media screen and (max-width: 480px) {
      font-size: 12px;
    }
  }
  .header {
    background-color: #e1e2e260;
    width: 100%;
    // height: 55px;
    // @media screen and (max-width: 768px) {
    //   height: 45px;
    // }
    // @media screen and (max-width: 480px) {
    //   height: 40px;
    // }
  }
}
.mat-filter-staffby {
  border: 1px solid #ced4da;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 5px;
  align-items: center;
  padding: 15px 10px;
  display: flex;
  flex-wrap: wrap;
  @media screen and (max-width: 768px) {
    padding: 10px 7px;
  }
  @media screen and (max-width: 48px) {
    padding: 10px 7px;
  }
  .mat-filter-staff {
    align-items: center;
    width: 100%;
    display: flex;
    margin-left: 10px;
    @media screen and (max-width: 768px) {
      margin-left: 5px;
    }
    @media screen and (max-width: 480px) {
      margin-left: 5px;
    }
  }
}
.mat-paging-staff {
  justify-content: flex-end;
  align-items: center;
  margin-right: 15px;
  font-weight: 500;
  height: 70px;
  font-family: "Roboto", sans-serif;
  padding: 5px 0;
  ol,
  ul,
  dl {
    margin: 0 !important;
  }
  @media screen and (max-width: 768px) {
    font-size: 14px;
    height: 65px;
  }
  @media screen and (max-width: 480px) {
    font-size: 12px;
    height: 40px;
  }
  .pagination {
    @media screen and (max-width: 768px) {
      a {
        padding: 7px 15px;
      }
    }
    @media screen and (max-width: 480px) {
      a {
        padding: 5px 12px;
      }
    }
  }
}
.titleSearch {
  margin-bottom: 11px;
  span {
    font-family: "Roboto", sans-serif;
    font-weight: 500;
    font-size: 16.6666px;
    color: #495057;
  }
}
.searchStaff {
  display: flex;

  .input__Search {
    display: flex;
    align-items: center;
    width: 85%;
    background: #ffffff;
    border: 1px solid #eae9e9;
    border-radius: 5px;
    input {
      font-size: 15px;
      @media screen and (max-width: 768px) {
        font-size: 14px;
      }
      @media screen and (max-width: 480px) {
        font-size: 12px;
      }
    }
  }

  button {
    padding: 13px;
  }

  .input__Search {
    flex: 1;

    input {
      width: 100%;
      height: 40px;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      appearance: none;
      border-radius: 0.25rem;
      padding: 0 10px;
      &:focus {
        border: 1px solid #ced4da;
        outline: none;
      }
    }
  }
  .mat-action-button-search-staff {
    padding-left: 15px;
    width: calc(15% - 15px);
    button {
      width: 100% !important;
      padding: 0 30px;
      border-radius: 7px;
      height: 40px;
      border: 1px solid #ced4da;
      font-family: "Roboto", sans-serif;
      color: #fff;
      background-color: #5b73e8;
      border-color: #5b73e8;
      transition: all 0.3s linear;
      &:hover {
        background-color: #4d62c5;
        border-color: #495cba;
      }
    }
  }
}
.headerDetailPage {
  .handleBack {
    align-items: center;
    justify-content: center;
    display: flex;
    margin-right: 5px;
    width: 37px;
    height: 37px;
    border-radius: 50%;
    -webkit-box-shadow: 0px 1px 7px 0px rgba(0, 0, 0, 0.377);
    -moz-box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.377);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.377);
    border: none;
    transition: all 0.2s ease-in-out;
    outline: none;
  }
  .handleBack:hover {
    -webkit-box-shadow: 0px 1px 7px 0px rgb(207, 207, 207);
    -moz-box-shadow: 0px 1px 4px 0px rgb(207, 207, 207);
    box-shadow: 0px 1px 4px 0px rgb(207, 207, 207);
    background-color: rgb(207, 207, 207);
  }
  .mat-title-header-staff {
    span {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: #495057;
      font-weight: 600;
      @media screen and (max-width: 768px) {
        font-size: 16px;
      }
      @media screen and (max-width: 480px) {
        font-size: 15.5px;
      }
    }
  }
}
.mat-action-add-staff button {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #fdb327;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  border: 1px solid #fdb327;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  @media screen and (max-width: 768px) {
    padding: 4px 10px;
    font-size: 14px;
  }
  @media screen and (max-width: 480px) {
    padding: 3px 8px;
    font-size: 12px;
  }
}
.mat-action-add-staff button:hover {
  background-color: #fda90e;
}
.mat-action-add-staff button i {
  margin-right: 5px;
}
.mat-filter-staffby {
  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: #3030 !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
}
select {
  height: 33px;
  font-size: 15px;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  &::after {
    content: "";
    width: 0.8em;
    height: 0.5em;
  }
  &:focus {
    outline: none !important;
  }
}
@media screen and (max-width: 1366px) {
  .modal-dialog {
    max-width: 820px !important;
  }
  .modal-content {
    max-height: 600px !important;
  }
}

.pagination a {
  float: left;
  padding: 8px 16px;
  text-decoration: none;
  border: 1px solid #ddd;
  font-size: 1em;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 5px;
  color: #4e4e4e;
  background-color: white;
}
.pagination-active a {
  background-color: #5b73e8;
  color: white;
}
.pagination-item {
  color: #4e4e4e;
  background-color: white;
}

.pagination a:hover:not(.active) {
  background-color: #5b73e8;
  color: white;
}

.filterContent {
  flex: 1;
  display: flex;
  .multiselect__select {
    position: absolute;
    width: 40px;
    height: 38px;
    right: 1px;
    top: 1px;
    padding: 4px 8px;
    text-align: center;
    transition: transform 0.2s ease;
  }
}

.multiselect__input,
.multiselect__single {
  background: 0;
  background-color: unset !important;
}

.optionSelected {
  margin-right: 10px;
  position: relative !important;
  .mat-title-filter {
    margin: 0 10px;
    color: #4e4e4e;
  }
  align-items: center;
  display: flex;
}

.table-modal-scroll,
.table-scroll {
  $min-width-desktop: 1366px;
  @media (max-width: #{$min-width-desktop - 0.02px}) {
    overflow: auto;
  }
  table {
    th {
      white-space: nowrap;
    }
  }
}

.filterSelect {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;

  .filterContent {
    white-space: nowrap;
  }
}
.searchStaff {
  @media (min-width: 768px) and (max-width: 1023.98px) {
    .input__Search,
    .mat-action-button-search-staff button {
      height: 40px;
    }
  }
  @media (max-width: 767.98px) {
    .input__Search,
    .mat-action-button-search-staff button {
      padding: 0;
      height: 35px;
    }
  }
}

@media (max-width: 1480px) {
  .filter-bar {
    display: block !important;
    padding: 15px;

    > span {
      width: 100% !important;
      justify-content: start !important;
    }
  }

  .filterSelect {
    justify-content: start;

    .optionSelected {
      width: 200px !important;
    }
  }
}
@media (max-width: 767.98px) {
  .searchStaff {
    .input__Search {
      width: 80% !important;
    }

    .mat-action-button-search-staff {
      width: calc(20% - 15px);

      .btn-search {
        padding: 0;
      }
    }
  }
}

.mat-action-button-search-staff {
  button {
    font-size: 14px;
    @media screen and (max-width: 768px) {
      font-size: 13px;
    }
  }
}

@media (max-width: 642px) {
  .filter-bar {
    .filterSelect {
      .optionSelected {
        width: 50% !important;
        margin-right: 0;

        .multiselect,
        input[type="date"] {
          width: calc(100% - 10px) !important;
        }
      }
    }
  }
}

@media (max-width: 540px) {
  .list-candidates {
    .header {
      .sort {
        margin-bottom: 10px;
      }
    }
  }
}

@media (max-width: 490px) {
  .filter-bar {
    .filterSelect {
      .optionSelected {
        width: 100% !important;
      }
    }
  }

  .searchStaff {
    .input__Search {
      width: 100% !important;
    }

    .mat-action-button-search-staff {
      margin: 15px 0 0 0;
      padding-left: 0;
      width: 100% !important;
    }
  }
}

.table__staff {
  tbody {
    tr {
      td {
        border-right: 1px solid rgb(234, 233, 233);
        border-bottom: 1px solid rgb(234, 233, 233);
      }
    }
  }
}
</style>
