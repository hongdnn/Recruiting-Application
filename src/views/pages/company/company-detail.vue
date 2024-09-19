<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import { mapGetters, mapActions, mapState } from "vuex";
//import Multiselect from "vue-multiselect";
import jwt_decode from "jwt-decode";

import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import Swal from "sweetalert2";

export default {
  page: {
    title: "Chi tiết công ty",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout
  },
  data() {
    return {
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      submitted: false,
      dataCompany: "",
      selectedFile: "",
      selectIndustry: "",
      selectFunctions: null,
      selectJobs: null,
      selectCity: "",
      inputAddress: "",
      inputEmail: "",
      inputWebsite: "",
      inputContactName: "",
      inputCompanyPhone: "",
      inputIntroduction: "",
      currId: null,
      create_date: "",
      full_name: "",
      imagePath: "",
      previewImage: null,
      existedImage: null,
      company: "",
    };
  },
  validations: {
    selectIndustry: {
      required,
    },
    selectFunctions: {
      required,
    },
    selectJobs: {
      required,
    },
    selectedCities: {
      required,
    },
    inputAddress:{
      required,
    },
    inputCompanyName: {
      required,
    },
    inputIntroduction: {
      required,
    },
    dataCompanies: {
      address: {
        required,
      },
      introduction: {
        required,
      },
      email: {
        required,
        email,
      },
      phone: {
        required,
        maxLength: maxLength(20),
        minLength: minLength(10),
      },
      website: {
        required,
      },
      contact_name: {
        required,
      },
    },
    dataCompany: {
      company: {
        required,
      },
    },
  },
  watch: {
    company: function () {
      if (this.company === undefined) {
        this.getCompanyDetailById();
      } else {
        // this.title = this.post.title;
        // this.status = this.company.status;
        this.create_date = this.getDateString(this.dataCompanies.createdDate);
      }
    },
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "companies/getCompanyDetailSuccess": {
          this.dataCompany = state.companies.companiesData.data;

          if (this.dataCompany.image !== null) {
            let image = this.dataCompany.image;
            this.existedImage = `${process.env.VUE_APP_API_URL}${image}`;
          }
          break;
        }
        case "companies/uploadUpdateImgSuccess": {
          this.imagePath = state.companies.updatedImgData.path;
          this.updateCompanyDetail();
          break;
        }
        case "companies/updateCompanySuccess": {
          if (this.imagePath === null) {
            this.existedImage = null;
            this.imagePath = "";
            this.previewImage = null;
            this.file = "";
          } else if (this.imagePath !== "") {
            this.imagePath = state.companies.updatedImgData.path;
            let image = this.imagePath;
            this.existedImage = `${process.env.VUE_APP_API_URL}${image}`;

            this.previewImage = null;
            this.file = "";
          }
          this.showDetailCompany(state.companies.updateData.id);

          break;
        }
      }
    });
  },

  computed: {
    ...mapGetters("companies", [
      "getIndustriesGetter",
      "getFunctionsGetter",
      "getJobsGetter",
      "getCitiesGetter",
    ]),
    ...mapState("companies", ["companiesData"]),
    ...mapState("companies", [
      "industries_data",
      "jobs_data",
      "functions_data",
      "cities_data",
    ]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
    dataIndustry() {
      return this.getIndustriesGetter;
    },
    dataJob() {
      return this.getJobsGetter;
    },
    dataFunction() {
      return this.getFunctionsGetter;
    },
    dataCity() {
      return this.getCitiesGetter;
    },
    dataCompanies() {
      return this.companiesData.data;
    },
  },
  async mounted() {
    this.decodeToken();

    this.getCity();
    //this.getIndustry();
    // this.getJob();
    // this.getFunction();
    await this.getCompanyDetailById();
    this.inputAddress = this.dataCompany.address;
    this.inputIntroduction = this.dataCompany.introduction;
    this.inputCompanyName = this.dataCompany.company;
    this.selectCity = this.dataCompany.city;
    this.selectIndustry = this.dataCompany.industry;
    this.selectFunctions = this.dataCompany.function;
    this.selectJobs = this.dataCompany.job;
    this.inputEmail = this.dataCompany.email;
    this.inputWebsite = this.dataCompany.website;
    this.inputContactName = this.dataCompany.contact_name;
    this.inputCompanyPhone = this.dataCompany.phone;
  },
  // async created() {
  //   this.unsub = this.$store.subscribe((mut, state) => {
  //     this.dataCompanies = state.companies.companiesData.data;
  //   });

  // },
  
  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("companies", [
      "getCompanyDetail",
      "getData",
      "getIndustriesInformation",
      "getFunctionsInformationByIndustry",
      "getIndustriesWithoutFunctionAndJob",
      "getJobsByFunction",
      "getJobsInformation",
      "getFunctionsInformation",
      "getCityInformation",
      "editCompany",
      "uploadUpdateImg",
    ]),
    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },
    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },
    uploadImgForUpdateCompany() {
      if (this.previewImage !== null) {
        const imageCompany = this.file;
        this.uploadUpdateImg({ imageCompany });
      } else {
        this.updateCompanyDetail();
      }
    },
    async removeSelectJobs(industry) {
      await this.getFunctionsInformationByIndustry(industry.id);
      this.selectJobs = null;
      this.selectFunctions = null;
    },
    async changeStatusFunction(myFunction) {
      await this.getJobsByFunction(myFunction.id);
      this.selectJobs = null;
    },
    updateCompanyDetail() {
      let image_new_path;
      if (this.imagePath !== "") {
        image_new_path = this.imagePath;
      } else {
        image_new_path = null;
      }      
      const data = {
        id: this.currId,
        image_new_path,
        industry_id: this.selectIndustry.id,
        function_id: this.selectFunctions === null ? null : this.selectFunctions.id,
        job_id: this.selectJobs === null ? null : this.selectJobs.id,
        country_id: "58cca4efde4c3e096a4c32af",
        city_id: this.selectCity.id,
        contact_name: this.inputContactName,
        email: this.inputEmail,
        phone: this.inputCompanyPhone,
        company: this.inputCompanyName,
        website: this.inputWebsite,
        introduction: this.inputIntroduction,
        address: this.inputAddress,
      };

      if (data) {
        this.submitted = true;
        this.$v.$touch();
        this.editCompany({ data });
      }
    },
    async getIndustry() {
      // get industry by id 
      await this.getIndustriesWithoutFunctionAndJob();
      for (let industry of this.dataIndustry.industries) {
        if (this.dataCompanies.industry.id === industry.id) {
          this.selectIndustry = industry;
          await this.getFunctionsInformationByIndustry(industry.id);
          for (let func of this.dataFunction.functions) {
            if (this.dataCompanies.function !== null && this.dataCompanies.function.id === func.id) {
              this.selectFunctions = func;
              await this.getJobsByFunction(func.id);
              for (let job of this.dataJob.jobs) {
                if (this.dataCompanies.job !== null && this.dataCompanies.job.id  === job.id) {
                  this.selectJobs = job;
                }
              }
            }
          }
        }
      }
    },
    resetSelect(){
      this.previewImage = null;
      this.inputCompanyName = this.dataCompany.company;
      this.inputAddress = this.dataCompany.address;
      this.inputIntroduction = this.dataCompany.introduction;
      this.inputCompanyName = this.dataCompany.company;
      this.selectCity = this.dataCompany.city;
      this.selectIndustry = this.dataCompany.industry;
      this.selectFunctions = this.dataCompany.function;
      this.selectJobs = this.dataCompany.job;
      this.inputContactName = this.dataCompany.contact_name;
      this.inputWebsite = this.dataCompany.website;
      this.inputEmail = this.dataCompany.email;
      this.inputCompanyPhone = this.dataCompany.phone;
    },
    getCity() {
      this.getCityInformation();
    },
    async getJob() {
      await this.getJobsInformation();
    },
    async getFunction() {
      await this.getFunctionsInformation();
    },
    async getCompanyDetailById() {
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
      await this.getCompanyDetail(id);
    },

    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
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

    showDetailCompany(_id) {
      const domain = window.location.origin;
      const url = domain + "/company-detail?id=" + _id;
      window.location.href = url;
    },

    async showModal() {
      if (
        this.checkPermisstion("company.all") ||
        this.checkPermisstion("company.update")
      ) {
        await this.getIndustry();
        this.$refs["my-modal"].show();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    hideModal() {
      //this.selectJobs = this.dataCompanies.job;
      //this.selectFunctions = this.dataCompanies.function;
      this.$refs["my-modal"].hide();
    },
    showModalContact() {
      if (
        this.checkPermisstion("company.all") ||
        this.checkPermisstion("company.update")
      ) {
        this.$refs["my-modalContact"].show();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    hideModalContact() {
      this.$refs["my-modalContact"].hide();
    },
  },
};
</script>

<template>
  <Layout>
    <div class="row">
      <div class="headerDetailPage d-flex align-items-center">
        <a href="/manage-company">
          <button class="handleBack">
            <i class="fas fa-chevron-left"></i></button
        ></a>

        <div class="titleHeader">
          <span>Chi tiết công ty</span>
        </div>
      </div>
      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div class="d-flex" style="align-items: center; flex: 1">
                  <span class="titleHeader"> Thông tin cơ bản công ty </span>
                </div>
                <div class="handleEdit">
                  <span
                    v-on:click="showModal"
                    data-toggle="modal"
                    data-target=".bs-example-modal-center"
                    >Chỉnh sửa</span
                  >

                  <b-modal
                    ref="my-modal"
                    id="modal-center"
                    centered
                    title="Chỉnh sửa thông tin cơ bản"
                    title-class="font-18"
                    hide-footer
                    @hidden="resetSelect"
                  >
                    <form @submit.prevent="uploadImgForUpdateCompany">
                      <div class="profile__company">
                        <div class="d-flex justify-content-center">
                          <div
                            v-if="previewImage !== null"
                            class="avatar__modal"
                          >
                            <img
                              for="avatar__modal__upLoad"
                              class="avatar__modal__upLoad"
                              :src="previewImage"
                              alt=""
                            />
                            <div
                              class="
                                avatar__modal__handleAvatar
                                btn btn-primary
                              "
                            >
                              <div class="avatar__modal__upload">
                                <input
                                  ref="fileInput"
                                  type="file"
                                  id="upLoad"
                                  @input="pickFile"
                                  hidden
                                />
                                <label for="upLoad">Cập nhật ảnh</label>
                              </div>
                            </div>
                          </div>
                          <div
                            v-else-if="existedImage !== null"
                            class="avatar__modal"
                          >
                            <img
                              for="avatar__modal__upLoad"
                              class="avatar__modal__upLoad"
                              :src="existedImage"
                              alt=""
                            />
                            <div
                              class="
                                avatar__modal__handleAvatar
                                btn btn-primary
                              "
                            >
                              <div class="upload">
                                <input
                                  ref="fileInput"
                                  type="file"
                                  id="upLoad"
                                  @input="pickFile"
                                  hidden
                                />
                                <label for="upLoad">Cập nhật ảnh</label>
                              </div>
                            </div>
                          </div>
                          <div v-else class="avatar__modal">
                            <img
                              for="avatar__modal__upLoad"
                              class="avatar__modal__upLoad"
                              src="@/assets/images/logomain.png"
                              alt=""
                            />
                            <div
                              class="
                                avatar__modal__handleAvatar
                                btn btn-primary
                              "
                            >
                              <div class="avatar__modal__upLoad">
                                <input
                                  ref="fileInput"
                                  type="file"
                                  id="upLoad"
                                  @input="pickFile"
                                  hidden
                                />
                                <label for="upLoad">Cập nhật ảnh</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="createPostMain" style="margin-top: 3rem">
                        <div class="createPostContent">
                          <div class="col-12 d-flex flex-wrap formPostGroup">
                            <div class="col-sm-6 col-12 formPostGroup__company">
                              <span
                                >Công ty
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="text"
                                  v-model="inputCompanyName"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.inputCompanyName.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted && $v.inputCompanyName.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.inputCompanyName.required"
                                    >Tên công ty không được bỏ trống *</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="col-sm-6 col-12 formPostGroup__city">
                              <span>Thành phố</span>
                              <div class="inputForm">
                                <select
                                  style="width: 100%"
                                  class="form-select"
                                  v-model="selectCity"
                                  :class="{
                                    'is-invalid':
                                      submitted && $v.selectCity.$error,
                                  }"
                                >
                                  <option
                                    v-bind:value="city"
                                    v-for="city in dataCity.cities"
                                    v-bind:key="city.id"
                                    :label="city.name"
                                  ></option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div class="col-12 d-flex flex-wrap formPostGroup">
                            <div class="col-sm-4 col-12 formPostGroup__career">
                              <span
                                >Ngành
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <select
                                  style="width: 100%"
                                  class="form-select"
                                  v-model="selectIndustry"
                                  @change="removeSelectJobs(selectIndustry)"
                                  :class="{
                                    'is-invalid':
                                      submitted && $v.selectIndustry.$error,
                                  }"
                                >
                                  <option
                                    v-bind:value="industry"
                                    v-for="industry in dataIndustry.industries"
                                    v-bind:key="industry.id"
                                    :label="industry.name"
                                  ></option>
                                </select>
                                <div
                                  v-if="submitted && $v.selectIndustry.$error"
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.selectIndustry.required"
                                    >Ngành không được bỏ trống *</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="col-sm-4 col-12 formPostGroup__room">
                              <span
                                >Phòng ban
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <select
                                  style="width: 100%"
                                  class="form-select"
                                  v-model="selectFunctions"
                                  @change="changeStatusFunction(selectFunctions)"
                                  :class="{
                                    'is-invalid':
                                      submitted && $v.selectFunctions.$error,
                                  }"
                                >
                                  <option
                                    v-for="f in this.dataFunction.functions"
                                    v-bind:key="f.id"
                                    v-bind:value="f"
                                    :label="f.name"
                                  ></option>
                                </select>
                                <div
                                  v-if="submitted && $v.selectFunctions.$error"
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.selectFunctions.required"
                                    >Phòng ban không được bỏ trống *</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="col-sm-4 col-12 formPostGroup__position">
                              <span
                                >Vị trí công việc
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <select
                                  style="width: 100%"
                                  class="form-select"
                                  v-model="selectJobs"
                                  :class="{
                                    'is-invalid':
                                      submitted && $v.selectJobs.$error,
                                  }"
                                >
                                  <option
                                    v-for="job in this.dataJob.jobs"
                                    v-bind:key="job.id"
                                    v-bind:value="job"
                                    :label="job.name"
                                  ></option>
                                </select>
                                <div
                                  v-if="submitted && $v.selectJobs.$error"
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.selectJobs.required"
                                    >Vị trí công việc không được bỏ trống
                                    *</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="col-12 d-flex formPostGroup">
                            <div class="col-12" style="padding-right: 10px">
                              <span
                                >Địa chỉ cụ thể
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="text"
                                  v-model="inputAddress"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.inputAddress.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted && $v.inputAddress.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span
                                    v-if="!$v.inputAddress.required"
                                    >Địa chỉ cụ thể không được bỏ trống *</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            class="col-12 formPostGroup"
                            style="height: 100%; width: 100%"
                          >
                            <span
                              >Giới thiệu công ty
                              <span style="color: red" class="labelStar"
                                >*</span
                              ></span
                            >
                            <div class="inputForm">
                              <textarea
                                v-model="inputIntroduction"
                                style="height: 5rem; width: 100%; height: 100%"
                                rows="6"
                                :class="{
                                  'is-invalid':
                                    submitted &&
                                    $v.inputIntroduction.$error,
                                }"
                              ></textarea>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="actionHideModal d-flex justify-content-end">
                        <div class="btnCancel">
                          <button type="button" v-on:click="hideModal">
                            Hủy
                          </button>
                        </div>
                        <div class="btnSuccess">
                          <button type="submit" v-on:click="showModal">
                            Lưu
                          </button>
                        </div>
                      </div>
                    </form>
                  </b-modal>
                </div>
                <div
                  class="iconHeader"
                  block
                  v-b-toggle.accordion-1
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <b-collapse
              id="accordion-1"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <div class="col-12">
                <div class="mainInforCompany">
                  <div style="width: 100%; padding-left: 25px; padding-right: 25px" class="d-flex col-12 mb-2">
                    <div class="contentHeader d-flex">
                      <div style="flex: 1; text-align: justify;">
                        <span class="titleName">{{
                          this.dataCompanies.introduction
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="wrapper-inforDetailCompany">
                    <div class="wrapper-inforDetailCompany__content">
                      <div class="d-flex inforDetailCompany" style="width: 100%; height: 100%">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">ẢNH</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          Một bức ảnh giúp cá nhân hóa thông tin công ty
                        </div>
                        <div class="inputForm col-2 d-flex" style="justify-content: center; align-items: center">
                          <div v-if="previewImage !== null" class="avatar__company">
                            <img for="upLoad" :src="existedImage" alt="" />
                          </div>
                          <div
                            v-else-if="existedImage !== null"
                            class="avatar__company"
                          >
                            <img for="upLoad" :src="existedImage" alt="" />
                          </div>
                          <div v-else class="avatar__company">
                            <img
                              for="upLoad"
                              src="@/assets/images/logomain.png"
                              alt=""
                            />
                          </div>
                        </div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">CÔNG TY</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{ this.dataCompanies.company }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">NGÀNH NGHỀ CÔNG TY</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{
                            dataCompanies.industry.name
                          }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">CHỨC NĂNG</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{
                            dataCompanies.function == null ? '(Chưa cập nhật)' : dataCompanies.function.name 
                          }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">CÔNG VIỆC</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{
                            dataCompanies.job == null ? '(Chưa cập nhật)' : dataCompanies.job.name 
                          }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">THÀNH PHỐ</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{ dataCompany.city.name }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">QUỐC GIA</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{ dataCompanies.country }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                      <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                        <div class="col-3" style="padding-left: 25px">
                          <span class="titleInfor">ĐỊA CHỈ CỤ THỂ</span>
                        </div>
                        <div class="col-7" style="padding-left: 25px">
                          <span class="titleName">{{ dataCompanies.address }}</span>
                        </div>
                        <div
                          class="inputForm col-2 d-flex"
                          style="
                            justify-content: flex-end;
                            padding-right: 30px;
                            align-items: center;
                          "
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>

      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div style="flex: 1">
                  <span class="titleHeader"> Thông tin liên hệ </span>
                </div>
                <div class="handleEdit">
                  <span
                    v-on:click="showModalContact"
                    data-toggle="modal"
                    data-target=".bs-example-modal-center"
                    >Chỉnh sửa</span
                  >
                  <b-modal
                    ref="my-modalContact"
                    id="modal-center"
                    centered
                    title="Chỉnh sửa thông tin liên hệ"
                    title-class="font-18"
                    hide-footer
                    @hidden="resetSelect"
                  >
                    <form @submit.prevent="uploadImgForUpdateCompany">
                      <div class="createPostMain">
                        <div class="createPostContent">
                          <div class="col-12 d-flex flex-wrap formPostGroup">
                            <div class="col-sm-6 col-12 formPostGroup__name">
                              <span
                                >Tên người liên hệ
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="text"
                                  v-model="inputContactName"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.dataCompanies.contact_name.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted &&
                                    $v.dataCompanies.contact_name.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span
                                    v-if="!$v.dataCompanies.contact_name.required"
                                    >Tên người liên hệ không được bỏ trống
                                    *</span
                                  >
                                </div>
                              </div>
                            </div>
                            <div class="col-sm-6 col-12 formPostGroup__email">
                              <span
                                >Email
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="email"
                                  id="date"
                                  v-model="inputEmail"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.dataCompanies.email.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted && $v.dataCompanies.email.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.dataCompanies.email.required"
                                    >Email không được bỏ trống *</span
                                  >
                                  <span v-if="!$v.dataCompanies.email.email"
                                    >Email không đúng định dạng *</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="col-12 d-flex flex-wrap formPostGroup">
                            <div class="col-sm-6 col-12 formPostGroup__numberphone">
                              <span
                                >Số điện thoại
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="text"
                                  v-model="inputCompanyPhone"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.dataCompanies.phone.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted && $v.dataCompanies.phone.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span v-if="!$v.dataCompanies.phone.required"
                                    >Số điện thoại không được bỏ trống *</span
                                  >
                                  <span
                                    v-if="
                                      !$v.inputCompanyPhone.maxLength ||
                                      !$v.inputCompanyPhone.minLength
                                    "
                                  >
                                    Số điện thoại chỉ được phép nhập từ 10 đến
                                    20 kí tự
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div class="col-sm-6 col-12 formPostGroup__website">
                              <span
                                >Website
                                <span style="color: red" class="labelStar"
                                  >*</span
                                ></span
                              >
                              <div class="inputForm">
                                <input
                                  type="url"
                                  v-model="inputWebsite"
                                  :class="{
                                    'is-invalid':
                                      submitted &&
                                      $v.dataCompanies.website.$error,
                                  }"
                                />
                                <div
                                  v-if="
                                    submitted && $v.dataCompanies.website.$error
                                  "
                                  class="invalid-feedback"
                                >
                                  <span
                                    v-if="!$v.dataCompanies.website.required"
                                    >Website không được bỏ trống *</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="actionHideModal d-flex justify-content-end">
                        <div class="btnCancel">
                          <button type="button" v-on:click="hideModalContact">
                            Hủy
                          </button>
                        </div>
                        <div class="btnSuccess" v-on:click="hideModalContact">
                          <button type="submit">Lưu</button>
                        </div>
                      </div>
                    </form></b-modal
                  >
                </div>
                <div
                  class="iconHeader d-flex align-items-center"
                  block
                  v-b-toggle.accordion-2
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            <b-collapse
              id="accordion-2"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <div class="col-12">
                <div class="mainInforCompany wrapper-inforContact">
                  <div class="inforContact__content">
                    <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">TÊN LIÊN HỆ</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          dataCompanies.contact_name
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">EMAIL</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{ dataCompanies.email }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">SỐ ĐIỆN THOẠI</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{ dataCompanies.phone }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div class="inforDetailCompany d-flex" style="width: 100%;height: 65px;border-top: 1px solid #dadce0;">
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">WEBSITE</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{ dataCompanies.website }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div class="col-3"></div>
    </div>
  </Layout>
</template>


<style  lang='scss'>
.actionHideModal {
  button {
    outline: none;
    border: none;
    padding: 3px 18px;
    -webkit-box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
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
.profile__company {
  border-right: 1px solid rgba(221, 221, 221, 0.733);

  .handleAvatar {
    margin-left: 2rem;
    width: 150px;
    border-radius: 50%;
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
    .avatar__company {
      margin-top: 8px;
      // width: 180px;
      // height: 180px;
      // border-radius: 10px;
      // padding: 5px;
      // border: 1px solid #e1e2e2;
      border-radius: 50%;

      img {
        width: 100%;
        border-radius: 50%;
        height: 100%;
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
  .avatar__modal {
    width: 100%;
    text-align: center;

    img {
      width: 50%;
      border-radius: 50%;
      border: 2px solid #f1f1f1;
    }
    &__handleAvatar {
      display: block;
      width: 130px;
      margin-left: 0;
      margin: 1.5rem auto 0;
      label {
        margin-bottom: 0;
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

  .bodyName {
    span {
      color: #5b73e8;
      font-size: 17px;
    }
  }
}
.createPostContent {
  .formPostGroup {
    height: 100%;
    font-weight: bold;
    margin-bottom: 10px;
    font-weight: 500;
    font-family: "Roboto", sans-serif;

    &__company, &__career, &__name, &__numberphone {
      padding-right: 10px;
      @media (max-width: 576px) {
        padding-right: 0;
      }
    }
    &__room{
      padding: 0 10px 0 10px;
      @media (max-width: 576px) {
        padding: 10px 0 0 0;
      }
    }

    &__city, &__position, &__email, &__website {
      padding-left: 10px;

      @media (max-width: 576px) {
        padding-top: 10px;
        padding-left: 0;
      }

      .multiselect__tags input.multiselect__input{
        border:none;
      }
    }
    label {
      color: rgb(51, 51, 51);
      font-size: 14px;

      .labelStar {
        color: rgb(255, 32, 32);
      }
    }
    i {
      color: #777;
      font-size: 14px;
      margin-right: 5px;
    }
    .skipStep {
      span {
        font-size: 12px;
      }
      margin-bottom: 5px;
    }
    .inputForm {
      input {
        width: 100%;
        height: 38px;
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
      select {
        width: 70%;
        height: 38px;
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
      textarea {
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
    }
    .checkBox {
      margin: 5px 0 0 10px;
      display: flex;
      align-items: center;

      input {
        height: 15px;
        width: 15px;
        cursor: pointer;
      }
      span {
        margin-top: 3px;
        margin-left: 5px;
      }
    }

    .handleAddButton {
      button {
        background-color: white;
        color: #5b73e8;
        border: 1px solid #5b73e8;
        padding: 5px 0;
        border-radius: 10px;
        font-weight: 500;
        font-family: "Roboto", sans-serif;
        transition: 0.2s linear;
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          color: #5b73e8;
        }
        &:hover {
          border: 1px solid white;
          color: white;
          background-color: #5b73e8;
          i {
            color: white;
          }
        }
      }
    }
    .handleDeleteSoftSkill {
      justify-content: flex-end;
      display: flex;
      button {
        border: none;
        padding: 5px 10px;
        border-radius: 10px;
        font-size: 13px;
        background-color: #f44336;
        transition: all 0.2s ease-in-out;
        color: white;
        &:hover {
          background-color: #fc1a0a;
        }
        &:focus {
          outline: none !important;
        }
        i {
          margin-right: 6px;
          margin-left: 4px;
          color: white;
          font-size: 13px;
        }
      }
    }
  }
}
.contentHeader {
  width: 100%;
  margin-top: 15px;
  span {
    text-align: justify;
    word-break: break-word;
    word-wrap: break-word;
    color: #495057;
    font-family: "Roboto", sans-serif;
    font-size: 15px;
  }
}
.iconHeader {
  i {
    font-size: 20px;
    cursor: pointer;
  }
}
.handleEdit {
  display: flex;
  align-items: center;
  margin-right: 10px;
  span {
    color: #1761fd;
    cursor: pointer;
  }
}
.inforCompany {
  flex-grow: 1;
  flex-shrink: 1;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #dadce0;
  box-sizing: border-box;
  overflow: hidden;

  .titleHeader {
    font-size: 17px;
    font-family: "Roboto", sans-serif;
    color: #303e67;
    font-weight: bold;
    text-transform: uppercase;
  }

  .mainInforCompany {
  }
  .inforDetailCompany {
    justify-content: space-around;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: #fafafa;
    }
    .titleInfor {
      word-break: break-word;
      word-wrap: break-word;
      color: #495057;
      font-family: "Roboto", sans-serif;
      font-size: 14px;
      font-weight: 500;
    }
    .titleName {
      font-family: "Roboto", sans-serif;
      font-size: 15.5px;
      font-weight: 500;
    }
    .inputForm {
      word-break: break-word;
      word-wrap: break-word;
      color: #5f6368;
      font-family: "Roboto", sans-serif;
      font-size: 15px;

      img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }
    }
  }
}
.headerDetailPage {
  .titleHeader {
    span {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: #495057;
      font-weight: 600;
    }
  }
}
.editAvatar {
  display: flex;
  justify-content: center;
  img {
    cursor: pointer;
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
  label {
    position: relative;
    i {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 50%);
      bottom: 50%;
      font-size: 30px;
      color: rgb(221, 221, 221);
      cursor: pointer;
      opacity: 0;
    }
    &:hover {
      opacity: 0.8;
      i {
        opacity: 1;
      }
    }
  }
}
.loGoCompany {
  img {
    width: 250px;
    height: 250px;
  }
}
.handleBack {
  align-items: center;
  justify-content: center;
  display: flex;
  margin-right: 15px;
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
.modal-dialog {
  @media screen and (min-width: 1440px) {
    min-width: 666px;
  }
}
.modal-header {
  background-color: rgb(226, 232, 241);
  border: 1px solid rgb(226, 232, 241);
}

.wrapper-inforDetailCompany{
  overflow-x: auto;
  &__content{
    min-width: 706px;
  }
}

.wrapper-inforContact{
  overflow-x: auto;
  .inforContact__content{
    min-width: 490px;
  }
}
</style>
