
<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import jwt_decode from "jwt-decode";
import Multiselect from "vue-multiselect";
import { mapGetters, mapActions, mapState } from "vuex";
import Swal from "sweetalert2";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";

export default {
  page: {
    title: "Chi tiết nhân viên",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      tempArrStafPermistion: [],
      arrCompanies: [],
      arrCandidates: [],
      arrInterviews: [],
      arrPlacements: [],
      arrStatistics: [],
      arrStaffs: [],
      arrPosts: [],
      arrCollabs:[],
      convertList: [],
      currId: null,
      onEdit: false,
      permissions: [],
      newPermisstionArr: [],
      listPermisions: [],
      selected_permission: [],
      selected_perChange: [],
      status: false,
      isAllPost: false,
      isAllInterView: false,
      isAllStaff: false,
      isActiveEdit: true,
      isAllCompany: false,
      isAllCandidate: false,
      isAllStatistics: false,
      isAllPlacement: false,
      isAllCollab:false,
      titleUpImage: "Tải ảnh lên",
      previewImage: null,
      statusArr: ["approval", "lock", "invisible"],
      genders: ["Nam", "Nữ"],
      file: "",
      birthDay: "",
      imagePath: "",
      existedImage: null,
      dataStaff: {},
      submitted: false,
    };
  },
  validations: {
    dataStaff: {
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

      address: {
        required,
      },
      phone: {
        required,
        maxLength: maxLength(15),
        minLength: minLength(10),
      },

      gender: {
        required,
      },

      status: {
        required,
      },
    },
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
  },
  watch: {
    selected_permission: function () {
      this.permissions = [];
      this.selected_permission.forEach((permission) => {
        this.permissions.push(permission._id);
      });
    },

    staff: function () {
      if (this.staff === undefined) {
        this.getStaffDetailById();
      } else {
        // this.title = this.post.title;
        // this.status = this.company.status;
        // this.curator = this.companyahihi.curator;
        // this.create_date = this.getDateString(this.companyahihi.createdDate);
      }
    },
  },
  computed: {
    ...mapGetters("staff", ["getPermissionGetter", "getStaffGetter"]),
    ...mapState("staff", ["staffData", "permissionData"]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.getStaffDetailById();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "staff/getStaffDetailSuccess": {
          this.getPermission();
          this.dataStaff = state.staff.staffData.data;
          if (this.dataStaff.birth_day !== null) {
            this.birthDay = new Date(this.dataStaff.birth_day)
              .toISOString()
              .split("T")[0];
          }
          if (this.dataStaff.image !== null) {
            let path = this.dataStaff.image.path;
            this.existedImage = `${process.env.VUE_APP_API_URL}${path}`;
          }
          break;
        }
        case "staff/uploadUpdateImgSuccess": {
          this.imagePath = state.staff.updatedImgData.image;
          this.updateStaffDetail();
          break;
        }
        case "staff/updateStaffSuccess": {
          Swal.fire("Cập nhật nhân viên thành công", "", "success").then(() => {
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

        case "staff/permissionSuccess": {
          this.getDataStorePermission(state);
        }
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("staff", [
      "getStaffDetail",
      "getData",
      "getPermissions",
      "editStaff",
      "uploadUpdateImg",
    ]),
    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },
    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },
    getDataStorePermission(state) {
      state.staff.permissionData.permissions.forEach((permission) => {
        switch (permission.page) {
          case "Công việc": {
            this.arrPosts.push(permission);
            break;
          }
          case "Công ty": {
            this.arrCompanies.push(permission);
            break;
          }
          case "Phỏng vấn": {
            this.arrInterviews.push(permission);
            break;
          }
          case "Ứng viên": {
            this.arrCandidates.push(permission);
            break;
          }
          case "Nhân viên": {
            this.arrStaffs.push(permission);
            break;
          }
          case "Thống kê": {
            this.arrStatistics.push(permission);
            break;
          }
          case "Thanh toán": {
            this.arrPlacements.push(permission);
            break;
          }
          case "Cộng tác viên":{
            this.arrCollabs.push(permission)
          }
        }
      });
      [...this.dataStaff.permissions].forEach((newPer) => {
        if (this.tempArrStafPermistion.length === 0) {
          this.tempArrStafPermistion.push(newPer);
        } else if (this.tempArrStafPermistion.length > 0) {
          var count = 0;
          for (let i = 0; i < this.tempArrStafPermistion.length; i++) {
            count++;
            if (newPer._id === this.tempArrStafPermistion[i]._id) {
              break;
            }
          }
          if (count == this.tempArrStafPermistion.length) {
            this.tempArrStafPermistion.push(newPer);
          }
        }
      });
      this.dataStaff.permissions.forEach(() => {
        this.tempArrStafPermistion.forEach((permission) => {
          switch (permission.page) {
            case "Công việc": {
              if (permission.permission === "post.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrPosts.length; i++) {
                  this.arrPosts[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrPosts.length; idx++) {
                if (this.arrPosts[idx]._id === permission._id) {
                  this.arrPosts[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Công ty": {
              if (permission.permission === "company.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrCompanies.length; i++) {
                  this.arrCompanies[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrCompanies.length; idx++) {
                if (this.arrCompanies[idx]._id === permission._id) {
                  this.arrCompanies[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Phỏng vấn": {
              if (permission.permission === "interview.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrInterviews.length; i++) {
                  this.arrInterviews[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrInterviews.length; idx++) {
                if (this.arrInterviews[idx]._id === permission._id) {
                  this.arrInterviews[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Ứng viên": {
              if (permission.permission === "candidate.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrCandidates.length; i++) {
                  this.arrCandidates[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrCandidates.length; idx++) {
                if (this.arrCandidates[idx]._id === permission._id) {
                  this.arrCandidates[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Nhân viên": {
              if (permission.permission === "staff.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrStaffs.length; i++) {
                  this.arrStaffs[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrStaffs.length; idx++) {
                if (this.arrStaffs[idx]._id === permission._id) {
                  this.arrStaffs[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Thống kê": {
              if (permission.permission === "statistic.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrStatistics.length; i++) {
                  this.arrStatistics[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrStatistics.length; idx++) {
                if (this.arrStatistics[idx]._id === permission._id) {
                  this.arrStatistics[idx].status = true;
                  break;
                }
              }
              break;
            }
            case "Thanh toán": {
              if (permission.permission === "placement.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrPlacements.length; i++) {
                  this.arrPlacements[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrPlacements.length; idx++) {
                if (this.arrPlacements[idx]._id === permission._id) {
                  this.arrPlacements[idx].status = true;
                  break;
                }
              }
              break;
            }
                  case "Cộng tác viên": {
              if (permission.permission === "collaborator.all") {
                this.checkDisable(permission.page);
                for (let i = 0; i < this.arrCollabs.length; i++) {
                  this.arrCollabs[i].status = true;
                }
                break;
              }
              for (let idx = 0; idx < this.arrCollabs.length; idx++) {
                if (this.arrCollabs[idx]._id === permission._id) {
                  this.arrCollabs[idx].status = true;
                  break;
                }
              }
              break;
            }
          }
        });
      });
    },
    checkAllPermistion() {},
    checkDisable(data) {
      if (data === "Công việc") {
        this.isAllPost = true;
      } else if (data === "Phỏng vấn") {
        this.isAllInterView = true;
      } else if (data === "Nhân viên") {
        this.isAllStaff = true;
      } else if (data === "Công ty") {
        this.isAllCompany = true;
      } else if (data === "Ứng viên") {
        this.isAllCandidate = true;
      } else if (data === "Thống kê") {
        this.isAllStatistics = true;
      } else if (data === "Thanh toán") {
        this.isAllPlacement = true;
      } else if (data === "Cộng tác viên"){
        this.isAllCollab = true;
      }
    },
    checkUnDisabled(data) {
      if (data === "Công việc") {
        for (let i = 0; i < this.arrPosts.length; i++) {
          this.arrPosts[i].status = false;
        }
        this.isAllPost = false;
      } else if (data === "Phỏng vấn") {
        for (let i = 0; i < this.arrInterviews.length; i++) {
          this.arrInterviews[i].status = false;
        }
        this.isAllInterView = false;
      } else if (data === "Nhân viên") {
        for (let i = 0; i < this.arrStaffs.length; i++) {
          this.arrStaffs[i].status = false;
        }
        this.isAllStaff = false;
      } else if (data === "Công ty") {
        for (let i = 0; i < this.arrCompanies.length; i++) {
          this.arrCompanies[i].status = false;
        }
        this.isAllCompany = false;
      } else if (data === "Ứng viên") {
        for (let i = 0; i < this.arrCandidates.length; i++) {
          this.arrCandidates[i].status = false;
        }
        this.isAllCandidate = false;
      } else if (data === "Thống kê") {
        for (let i = 0; i < this.arrStatistics.length; i++) {
          this.arrStatistics[i].status = false;
        }
        this.isAllStatistics = false;
      } else if (data === "Thanh toán") {
        for (let i = 0; i < this.arrPlacements.length; i++) {
          this.arrPlacements[i].status = false;
        }
        this.isAllPlacement = false;
      }  else if (data === "Cộng tác viên") {
        for (let i = 0; i < this.arrCollabs.length; i++) {
          this.arrCollabs[i].status = false;
        }
        this.isAllCollab = false;
      }
    },
    getStaffDetailById() {
      var id = "";
      var url = window.location.href;

      // Get email value
      var name = "id";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      id = decodeURIComponent(results[2].replace(/\+/g, " "));
      this.currId = id;

      this.getStaffDetail(id);
    },

    inputValuePermission(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectJobRoles = result;
    },

    async getPermission() {
      await this.getPermissions();
    },

    handleSaveEdit() {
      this.onEdit = !this.onEdit;
      this.uploadImgForUpdateStaff();
    },

    unique(arr) {
      var newArr = [];
      newArr = arr.filter(function (item) {
        return newArr.includes(item) ? "" : newArr.push(item);
      });
      return newArr;
    },
    dataPermissions() {
      return this.dataPermisArr;
    },

    handleDeleteByAll(page) {
      this.tempArrStafPermistion = this.tempArrStafPermistion.filter(
        (data) => page !== data.page
      );
    },

    handleChecked(event, item) {
      item.status = !item.status;
      switch (item.page) {
        case "Công việc": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrPosts.length; i++) {
                this.arrPosts[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Phỏng vấn": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrInterviews.length; i++) {
                this.arrInterviews[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Công ty": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrCompanies.length; i++) {
                this.arrCompanies[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Nhân viên": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrStaffs.length; i++) {
                this.arrStaffs[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Ứng viên": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrCandidates.length; i++) {
                this.arrCandidates[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Thống kê": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrStatistics.length; i++) {
                this.arrStatistics[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
        case "Thanh toán": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrPlacements.length; i++) {
                this.arrPlacements[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
           case "Cộng tác viên": {
          if (item.permission.includes(".all")) {
            if (item.status == false) {
              this.checkUnDisabled(item.page);
              this.handleDeleteByAll(item.page);
              break;
            } else {
              for (let i = 0; i < this.arrCollabs.length; i++) {
                this.arrCollabs[i].status = true;
              }
              this.checkDisable(item.page);
              this.tempArrStafPermistion.push(item);
              break;
            }
          }

          if (item.status == true) {
            {
              this.handleNormalTrue(item);
              break;
            }
          } else {
            this.handleNormalFalse(item);
            break;
          }
        }
      }
    },

    handleNormalFalse(item) {
      let isExit = this.checkExit(item, this.tempArrStafPermistion);
      if (isExit) {
        this.tempArrStafPermistion = this.tempArrStafPermistion.filter(
          (fil) => fil._id !== item._id
        );
      }
      return;
    },

    handleNormalTrue(item) {
      let isExit = this.checkExit(item, this.tempArrStafPermistion);
      if (!isExit) {
        this.tempArrStafPermistion.push(item);
      }
      return;
    },

    checkExit(data, array) {
      for (let i = 0; i < array.length; i++) {
        if (data._id === array[i]._id) {
          return true;
        }
      }
      return false;
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

    deleteImage() {
      if (this.previewImage !== null) {
        this.previewImage = null;
        this.file = "";
      } else if (this.existedImage !== null) {
        this.existedImage = null;
        this.imagePath = null;
      }
    },

    uploadImgForUpdateStaff() {
      this.submitted = true;
      this.$v.$touch();
      if (this.previewImage !== null) {
        const img = this.file;
        this.uploadUpdateImg({ img });
      } else {
        this.updateStaffDetail();
      }
      this.isActiveEdit = !this.isActiveEdit;
      this.onEdit = false;
    },

    updateStaffDetail() {
      //this.submitted = true;
      let image;
      if (this.imagePath !== "") {
        image = this.imagePath;
      }
      const data = {
        id: this.currId,
        image,
        first_name: this.dataStaff.first_name,
        last_name: this.dataStaff.last_name,
        status: this.dataStaff.status,
      };
      if (
        this.currId !== this.userStorage.data.id ||
        this.userStorage.data.email === "admin@tatool.vn"
      ) {
        if (this.tempArrStafPermistion.length >= 0) {
          let permission_ids = [];
          for (
            let index = 0;
            index < this.tempArrStafPermistion.length;
            index++
          ) {
            permission_ids.push(this.tempArrStafPermistion[index]._id);
          }
          data.permission_ids = permission_ids;
        }
      }
      if (
        this.dataStaff.address !== null &&
        this.dataStaff.address.trim() !== ""
      ) {
        data.address = this.dataStaff.address;
      }
      if (this.dataStaff.phone !== null && this.dataStaff.phone.trim() !== "") {
        data.phone = this.dataStaff.phone;
      }
      if (this.birthDay !== "") {
        data.birth_day = this.birthDay;
      }
      if (
        this.dataStaff.gender !== null &&
        this.dataStaff.gender.trim() !== ""
      ) {
        data.gender = this.dataStaff.gender;
      }
      if (data) {
        this.editStaff({ data });
      }
    },
    onEditStaff() {
      if (
        this.checkPermisstion("staff.all") ||
        this.checkPermisstion("staff.update")
      ) {
        this.onEdit = true;
        this.isActiveEdit = !this.isActiveEdit;
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
      if (
        this.currId === this.userStorage.data.id &&
        this.userStorage.data.email !== "admin@tatool.vn"
      ) {
        this.onEdit = true;
        this.isActiveEdit = !this.isActiveEdit;
      }
    },
  },
};
</script>

<template>
  <Layout>
    <div id="main">
      <div class="d-flex align-items-center">
        <div class="headerDetailPage d-flex align-items-center" style="flex: 1">
          <a href="/manage-staff">
            <button class="handleBack">
              <i class="fas fa-chevron-left"></i></button
          ></a>

          <div class="titleHeader">
            <span>Chi tiết nhân viên</span>
          </div>
        </div>
        <PageHeader :title="title" />
      </div>
      <div class="bodyInfoDetail mt-3" style="background-color: #fff">
        <div class="profileDetail">
          <div class="row">
            <div class="col-md-4">
              <div class="profile__staff">
                <div class="header">
                  <span>HỒ SƠ</span>
                </div>
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
                <div class="bodyName text-center">
                  <span>{{
                    dataStaff.first_name + " " + dataStaff.last_name
                  }}</span>
                  <i class="fas fa-venus" v-if="dataStaff.gender === 'Nữ'"></i>
                  <i
                    class="fas fa-mars-stroke"
                    v-if="dataStaff.gender === 'Nam'"
                  ></i>
                </div>
                <div class="d-flex justify-content-center">
                  <div class="handleAvatar">
                    <div class="upload">
                      <input
                        ref="fileInput"
                        type="file"
                        id="upLoad"
                        @input="pickFile"
                        hidden
                      />
                      <label for="upLoad">Tải ảnh lên</label>
                    </div>
                    <div class="delete">
                      <button @click="deleteImage">Xóa ảnh</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="
                col-md-8
                d-flex
                flex-wrap
                justify-content-center
                contentInfor
              "
            >
              <div class="col-10">
                <div class="basicInfor">
                  <div class="header d-flex" style="text-align: left">
                    <div style="flex: 1">
                      <span>Thông tin cơ bản</span>
                    </div>
                    <div class="handleUpdate d-flex">
                      <div class="titleEdit">
                        <span v-if="!onEdit" v-on:click="onEditStaff"
                          >Chỉnh sửa <i class="fas fa-pencil-alt"></i
                        ></span>
                      </div>
                      <div class="d-flex" v-if="onEdit">
                        <div class="cancel">
                          <button
                            type="button"
                            class=""
                            v-on:click="onEdit = !onEdit"
                          >
                            Hủy
                          </button>
                        </div>
                        <div class="save">
                          <button v-on:click="handleSaveEdit">Lưu</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bodyBasic mt-4">
                    <div class="row">
                      <div class="col-12 d-flex contentBasic">
                        <div class="col-6" style="padding-right: 10px">
                          <span class="title">HỌ </span>
                          <div class="inputContent">
                            <input
                              :disabled="!onEdit"
                              type="text"
                              v-model="dataStaff.first_name"
                              :class="{
                                'is-invalid':
                                  submitted && $v.dataStaff.first_name.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.dataStaff.first_name.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.dataStaff.first_name.required"
                                >Họ không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <span class="title">TÊN</span>
                          <div class="inputContent">
                            <input
                              :disabled="!onEdit"
                              type="text"
                              v-model="dataStaff.last_name"
                              :class="{
                                'is-invalid':
                                  submitted && $v.dataStaff.last_name.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.dataStaff.last_name.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.dataStaff.last_name.required"
                                >Tên không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 d-flex contentBasic">
                        <div class="col-6" style="padding-right: 10px">
                          <span class="title">NGÀY SINH</span>
                          <div class="inputContent">
                            <input
                              type="date"
                              :disabled="!onEdit"
                              v-model="birthDay"
                            />
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <span class="title">GIỚI TÍNH</span>
                          <div class="" style="margin: 5px 0 15px 0">
                            <multiselect
                              v-model="dataStaff.gender"
                              :options="genders"
                              :disabled="!onEdit"
                              :taggable="true"
                            ></multiselect>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 d-flex contentBasic">
                        <div class="col-6" style="padding-right: 10px">
                          <span class="title">EMAIL</span>
                          <div class="inputContent">
                            <input
                              :disabled="true"
                              type="email"
                              v-model="dataStaff.email"
                              :class="{
                                'is-invalid':
                                  submitted && $v.dataStaff.email.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.dataStaff.email.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.dataStaff.email.required"
                                >Email không được bỏ trống *</span
                              >
                              <span v-if="!$v.dataStaff.email.email"
                                >Email không đúng định dạng *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <span class="title">SỐ ĐIỆN THOẠI</span>
                          <div class="inputContent">
                            <input
                              type="text"
                              :disabled="!onEdit"
                              v-model="dataStaff.phone"
                              :class="{
                                'is-invalid':
                                  submitted && $v.dataStaff.phone.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.dataStaff.phone.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.dataStaff.phone.required"
                                >Số điện thoại không được bỏ trống *</span
                              >
                              <span v-if="!$v.dataStaff.phone.minLength"
                                >Số điện thoại quá ngắn, lớn hơn bằng 10 *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 d-flex contentBasic">
                        <div class="col-6" style="padding-right: 10px">
                          <span class="title">TRẠNG THÁI</span>
                          <div class="" style="margin: 5px 0 15px 0">
                            <multiselect
                              v-model="dataStaff.status"
                              :disabled="!onEdit"
                              :options="statusArr"
                              :taggable="true"
                            ></multiselect>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <span class="title">Địa chỉ</span>
                          <div class="inputContent">
                            <input
                              type="text"
                              :disabled="!onEdit"
                              v-model="dataStaff.address"
                              :class="{
                                'is-invalid':
                                  submitted && $v.dataStaff.address.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.dataStaff.address.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.dataStaff.address.required"
                                >Địa chỉ không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 contentBasic d-f">
                        <span class="title">QUYỀN</span>
                        <div class="benefit d-flex flex-wrap">
                          <div class="col-md-6">
                            <div>
                              <span class="titleBenefit"> Công việc </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrPosts"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllPost"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="mt-2">
                              <span class="titleBenefit"> Nhân viên </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrStaffs"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllStaff"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="mt-2">
                              <span class="titleBenefit"> Ứng viên </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrCandidates"
                                v-bind:key="item"
                              >
                                <div
                                  v-if="
                                    item.permission.includes('candidate.all')
                                  "
                                >
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div
                                  v-if="
                                    !item.permission.includes('candidate.all')
                                  "
                                >
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllCandidate"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                               <div class="mt-2">
                              <span class="titleBenefit"> Cộng tác viên </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrCollabs"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllCollab"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div>
                              <span class="titleBenefit"> Phỏng vấn </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrInterviews"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllInterView"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="mt-2">
                              <span class="titleBenefit"> Công ty </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrCompanies"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>

                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllCompany"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                            <div class="mt-2">
                              <span class="titleBenefit"> Thống kê </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrStatistics"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    @click="handleChecked($event, item)"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllStatistics"
                                    :readonly="!onEdit"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>

                            <div class="mt-2">
                              <span class="titleBenefit"> Thanh toán </span>
                              <div
                                class="contentBenefit"
                                v-for="item in arrPlacements"
                                v-bind:key="item"
                              >
                                <div v-if="item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                                <div v-if="!item.permission.includes('.all')">
                                  <input
                                    type="checkbox"
                                    :checked="item.status"
                                    @click="handleChecked($event, item)"
                                    :disabled="isAllPlacement"
                                    v-bind:class="{
                                      activeCheckbox: isActiveEdit,
                                    }"
                                  />
                                  <span>{{ item.description }}</span>
                                </div>
                              </div>
                            </div>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<style lang="scss">
.activeCheckbox {
  pointer-events: none;
}
.benefit {
  height: auto;
  border: 1px solid rgba(221, 221, 221, 0.733);
  padding: 10px;
  .titleBenefit {
    font-family: "Roboto", sans-serif;
    color: #495057;
    font-weight: bold;
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
.fa-mars-stroke {
  color: #4763ee;
}
.fa-venus {
  color: rgb(255, 100, 100);
}
.bodyInfoDetail {
  border: 1px solid #e1e2e2;
  border-radius: 7px;
  padding: 20px 0;
}
.profileDetail {
  padding: 15px 15px;
  .header {
    text-align: center;
    span {
      font-size: 17px;
      font-weight: 600;
      font-family: "Roboto", sans-serif;
    }
  }
  .profile__staff {
    border-right: 1px solid rgba(221, 221, 221, 0.733);
    .handleAvatar {
      margin-top: 15px;
      button {
        width: 120px;
        border: none;
        margin-top: 5;
        padding: 5px 10px;
        border-radius: 3px;
        transition: all 0.3s ease-in-out;
      }
      .upload {
        margin-top: 12px;
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
    .bodyName {
      span {
        color: #5b73e8;
        font-size: 17px;
      }
    }
  }
  .basicInfor {
    .header {
      height: 50px;
      border-bottom: 1px solid rgba(221, 221, 221, 0.575);
    }
    .handleUpdate {
      .titleEdit {
        span {
          font-size: 14px;
          color: #4763ee;
          cursor: pointer;
          font-weight: 500;
          i {
            margin-left: 5px;
            color: #4763ee;
            cursor: pointer;
          }
        }
      }
      button {
        width: 80px;
        border: none;
        margin-top: 5;
        padding: 5px 10px;
        border-radius: 3px;
        transition: all 0.3s ease-in-out;
        margin-right: 5px;
      }
      .save {
        button {
          background-color: #1aa94c;
          border: 1px solid #1aa94c;
          color: #fff;
          &:hover {
            background-color: #0dc04c;
          }
        }
      }
      .cancel {
        button {
          color: #495057;
          border: 1px solid #e1e2e2;
          &:hover {
            background-color: #e1e2e2;
          }
        }
      }
    }
    .bodyBasic {
      .contentBasic {
        .title {
          font-size: 15px;
          font-family: "Roboto", sans-serif;
          color: #495057;
          font-weight: 550;
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
          }
        }
      }
    }
  }
}
.nav-tabs .nav-link:hover,
.nav-tabs .nav-link:focus {
  border-color: #f5f6f8 #f5f6f8 #ced4da;
  isolation: none;
}
.nav-tabs .nav-link {
  border: none;
}
.nav-tabs .nav-link.active {
  border-bottom: 2px solid #5b73e8;
  color: #5b73e8;
  background-color: #3030;
}
.nav-tabs {
  border-bottom: 1px solid #e1e2e2;
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
  .titleHeader {
    span {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: #495057;
      font-weight: 600;
    }
  }
}

.basicInfor {
  .multiselect__tags {
    background: none;
    background-color: unset !important;

    .multiselect__single {
      background: none;
      background-color: unset !important;
    }
  }
}

.contentInfor {
  @media (max-width: 768px) {
    padding-top: 15px;
  }
}
</style>