<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import {
  required,
  email,
  minLength,
  maxLength,
} from "vuelidate/lib/validators";
import { mapActions, mapState, mapGetters } from "vuex";
export default {
  page: {
    title: "Tạo công ty",
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
  },
  data() {
    return {
      submitted: false,

      //Preparation data:

      //Selected data:
      industries: [],
      selectIndustry: "",
      industryCompany: null,
      functions: [],
      selectFunctions: null,
      functionCompany: null,
      jobs: [],
      selectJobs: null,
      job: null,
      selectedCities: "",
      locations: [],
      selected_locations: [],
      imageCompany: "",
      imagePath: "",
      file: "",
      selectedImage: "",
      form: {
        address: "",
        previewImage: "",
        email: "",
        company: "",
        phone: "",
        city_ids: "",
        industries: "",
        jobs: "",
        functions: "",
        introduction: "",
        website: "",
        contact_name: null,
        country_id: "58cca4efde4c3e096a4c32af",
      },
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
    form: {
      email: {
        required,
        email,
      },

      company: {
        required,
      },
      phone: {
        required,
        maxLength: maxLength(15),
        minLength: minLength(10),
      },
      areaWork: {
        required,
      },
      contact_name: {
        required,
      },

      functions: {
        required,
      },
      jobs: {
        required,
      },
      introduction: {
        required,
      },
      address: {
        required,
      },

      website: {
        required,
      },
    },
  },
  mounted() {
    this.getCity();
    this.getIndustry();
  },
  created() {
    this.unsub = this.$store.subscribe(async (mut, state) => {
      switch (mut.type) {
        case "companies/uploadImgSuccess": {
          this.imagePath = state.companies.imgData.path;
          await this.createCompany();
          break;
        }
        case "companies/createCompanySuccess": {
          this.showDetailCompany(state.companies.createdCompanies.id);
          break;
        }
      }
    });
  },

  watch: {
    selected_locations: function () {
      this.form.areaWork = [];
      this.selected_locations.forEach((location) => {
        this.form.areaWork.push(location.id);
      });
    },
    selected_industries: function () {
      this.form.industries = [];
      this.selected_industries.forEach((industries) => {
        this.form.industries.push(industries.id);
      });
    },
    selected_functions: function () {
      this.form.functions = [];
      this.selected_functions.forEach((functions) => {
        this.form.functions.push(functions.id);
      });
    },
    selected_jobs: function () {
      this.form.jobs = [];
      this.selected_jobs.forEach((jobs) => {
        this.form.jobs.push(jobs.id);
      });
    },
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
    companyahihi() {
      return this.companiesData.data;
    },
  },
  methods: {
    ...mapActions("companies", [
      "createNewCompanies",
      "getCompanyDetail",
      "getData",
      "getIndustriesWithoutFunctionAndJob",
      "getJobsInformation",
      "getFunctionsInformation",
      "getCityInformation",
      "getFunctionsInformationByIndustry",
      "getJobsByFunction",
      "uploadImg",
    ]),
    ...mapActions("cities", ["getCitiesList"]),

    // Get all cities function
    async getCity() {
      await this.getCityInformation();
      this.form.city_ids = this.dataCity.cities;
    },
    // Get function by industry
    async removeSelectJobs(industry) {
      await this.getFunctionsInformationByIndustry(industry.id);
      this.selectJobs = null;
      let eleRead1 = document.querySelector(".readonly");
      let eleRead2 = document.querySelector(".readonly1");
      if (!eleRead2) {
        document.querySelector(".addClass").classList.add("readonly1");
      } else if (eleRead2 || eleRead1) {
        eleRead2.classList.remove("readonly1");
        eleRead1.classList.remove("readonly");
      }
    },
    async changeStatusFunction(myFunction) {
      await this.getJobsByFunction(myFunction.id);
      document.querySelector(".addClass").classList.remove("readonly1");
    },
    inputValueCity(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value.id);
      });

      this.selectCities = result;
    },
    // Get all job funciton
    // getJob() {
    //   this.getJobInformation();
    //   this.form.jobs = this.companyahihi.jobs;

    // },

    // //Get all  function
    // getFunction() {
    //   this.getFunctionInformation();
    //         this.form.functions = this.companyahihi.functions;

    // },

    //Get all industries
    async getIndustry() {
      await this.getIndustriesWithoutFunctionAndJob();
      this.form.industries = this.dataIndustry.industries;
    },
    async formSubmit() {
      this.submitted = true;
      this.$v.$touch();
      await this.createCompany();
    },

    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
    },
    openFile($event) {
      var input = file.target;
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
    async uploadImgForCreateCompany() {
      if (this.form.previewImage !== "") {
        const imageCompany = this.file;
        this.uploadImg({ imageCompany });
      } else {
        await this.createCompany();
      }
    },
    async createCompany() {
      this.submitted = true;
      this.$v.$touch();
      const address = this.form.address;
      const email = this.form.email;
      const company = this.form.company;
      const phone = this.form.phone;
      const city_id = this.selectedCities.id;
      const industry_id = this.selectIndustry.id;
      const job_id = this.selectJobs === null ? null : this.selectJobs.id;
      const function_id = this.selectFunctions === null ? null : this.selectFunctions.id;

      const contact_name = this.form.contact_name;
      const introduction = this.form.introduction;
      const website = this.form.website;
      let image_new_path;
      if (this.imagePath !== "") {
        image_new_path = this.imagePath;
      } else {
        image_new_path = "/static/company_images/default_company-image.png";
      }
      const country_id = "58cca4efde4c3e096a4c32af";
      const data = {
        email,
        company,
        phone,
        city_id,
        job_id,
        function_id,
        industry_id,
        contact_name,
        introduction,
        website,
        image_new_path,
        country_id,
        address,
      };
      if (data) {
        await this.createNewCompanies(data);
      }
    },
    resetInput() {
      this.form.address="";
      this.form.email="";
      this.form.company="";
      this.form.phone="";
      this.selectedCities="";
      this.selectIndustry="";
      this.selectJobs=null;
      this.selectFunctions=null;

      this.form.contact_name="";
      this.form.introduction="";
      this.form.website="";
    },
    showDetailCompany(_id) {
      const domain = window.location.origin;
      const url = domain + "/company-detail?id=" + _id;
      window.location.href = url;
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" :items="items" />
    <div class="col-12">
      <div class="tool-bar row">
        <div class="col-md-12 title d-flex align-items-center">
          <a href="./manage-company">
            <button class="handleBack">
              <i class="fas fa-chevron-left"></i>
            </button>
          </a>
          <div class="titleCreate">
            <span>Tạo công ty</span>
          </div>
        </div>
      </div>
      <div class="col-12 d-flex">
        <div class="col-12 mt-5">
          <div id="createCandidate">
            <div class="header d-flex" style="padding: 5px 15px">
              <div class="titleHeader" style="flex: 1">
                <span>Thông tin công ty</span>
              </div>
              <div class="handleCreateDiffCV"></div>
            </div>
            <div class="bodyCreate">
              <div class="formCreated">
                <form @submit.prevent="uploadImgForCreateCompany">
                  <div class="formCreatedContent">
                    <div
                      class="col-12 d-flex contentBasic justify-content-center"
                      style="text-center"
                    >
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
                        <div
                          @click="onClickedUploadButton"
                          class="uploadAvatar"
                        >
                          <button type="button">Tải ảnh công ty</button>
                        </div>
                      </div>
                    </div>
                    <div class="col-12 formCreateGroup d-flex">
                      <div class="col-6" style="padding-right: 10px">
                        <label for=""
                          >Tên công ty <span class="labelStar">*</span></label
                        >
                        <div class="inputForm">
                          <input
                            type="text"
                            placeholder="ví dụ: Công ty đầu Bếp Á Âu"
                            v-model="form.company"
                            :class="{
                              'is-invalid': submitted && $v.form.company.$error,
                            }"
                          />
                          <div
                            v-if="submitted && $v.form.company.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.company.required"
                              >Tên công ty không được bỏ trống *</span
                            >
                          </div>
                        </div>
                      </div>

                      <div class="col-6" style="padding-left: 10px">
                        <label for=""
                          >Người liên hệ<span class="labelStar"> *</span></label
                        >
                        <div class="inputForm">
                          <input
                            type="text"
                            v-model="form.contact_name"
                            class="inputValue"
                            :class="{
                              'is-invalid':
                                submitted && $v.form.contact_name.$error,
                            }"
                          />
                          <div
                            v-if="submitted && $v.form.contact_name.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.contact_name.required"
                              >Người liên hệ không được bỏ trống *</span
                            >
                          </div>
                        </div>

                        <div></div>
                      </div>
                    </div>
                    <div class="col-12 formCreateGroup d-flex">
                      <div class="col-6" style="padding-right: 10px">
                        <i class="far fa-envelope"></i>
                        <label for=""
                          >Email công ty <span class="labelStar">*</span></label
                        >
                        <div class="inputForm">
                          <input
                            type="email"
                            placeholder="ví dụ: abc@gmail.com"
                            style="width: 100%"
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
                      <div class="col-6" style="padding-left: 10px">
                        <i class="fas fa-phone-alt"></i>
                        <label for=""
                          >Số điện thoại <span class="labelStar">*</span></label
                        >
                        <div class="inputForm">
                          <input
                            type="text"
                            placeholder="ví dụ: 0339741460"
                            v-model="form.phone"
                            :class="{
                              'is-invalid': submitted && $v.form.phone.$error,
                            }"
                          />
                          <div
                            v-if="submitted && $v.form.phone.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.phone.required"
                              >Số điện thoại không được bỏ trống *</span
                            >
                            <span v-if="!$v.form.phone.minLength"
                              >Số điện thoại quá ngắn, lớn hơn bằng 10 *</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="line"></div>
                  </div>
                  <div class="col-12 formCreateGroup d-flex">
                    <div class="col-4" style="padding-right: 10px">
                      <label class="col-form-label">Chọn ngành</label>
                      <div class="inputForm">
                        <select
                          style="width: 100%"
                          class="form-select"
                          v-model="selectIndustry"
                          @change="removeSelectJobs(selectIndustry)"
                          :class="{
                            'is-invalid': submitted && $v.selectIndustry.$error,
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
                    <div
                      class="col-4"
                      style="padding-left: 10px; padding-right: 10px"
                    >
                      <label class="col-form-label" for="confirmpass"
                        >Chọn phòng ban</label
                      >
                      <div class="inputForm">
                        <select
                          class="readonly"
                          v-model="selectFunctions"
                          style="width: 100%"
                          @change="changeStatusFunction(selectFunctions)"
                          :class="{
                            'is-invalid':
                              submitted && $v.selectFunctions.$error,
                          }"
                        >
                          <option
                            v-for="f in dataFunction.functions"
                            v-bind:key="f.id"
                            v-bind:value="f"
                          >
                            {{ f.name }}
                          </option>
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

                    <div class="col-4" style="padding-left: 10px">
                      <label class="col-form-label" for="confirmpass"
                        >Chọn vị trí công việc</label
                      >
                      <div class="inputForm">
                        <select
                          class="addClass readonly1"
                          v-model="selectJobs"
                          style="width: 100%"
                          :class="{
                            'is-invalid': submitted && $v.selectJobs.$error,
                          }"
                        >
                          <option
                            v-for="job in dataJob.jobs"
                            v-bind:key="job.id"
                            v-bind:value="job"
                          >
                            {{ job.name }}
                          </option>
                        </select>
                        <div
                          v-if="submitted && $v.selectJobs.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.selectJobs.required"
                            >Vị trí công việc không được bỏ trống *</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="formCreatedContent" style="margin-top: 30x">
                    <div class="col-12 formCreateGroup">
                      <div class="col-12 d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <label for=""
                            >Website<span class="labelStar"> *</span></label
                          >
                          <div class="inputForm checkboxValue">
                            <input
                              type="text"
                              placeholder="ví dụ: http://cooky.vn"
                              v-model="form.website"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.website.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.form.website.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.website.required"
                                >Website không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <label for=""
                            >Khu vực làm việc của công ty<span
                              class="labelStar"
                            >
                              *</span
                            ></label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueCity"
                              v-model="selectedCities"
                              :options="form.city_ids"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :preselect-first="true"
                              :show-labels="false"
                              :allow-empty="false"
                              :class="{
                                'is-invalid':
                                  submitted && $v.selectedCities.$error,
                              }"
                            ></multiselect>
                            <div
                              v-if="submitted && $v.selectedCities.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.selectedCities.required"
                                >Khu vực làm việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="formCreatedContent" style="margin-top: 30x">
                    <div class="col-12 formCreateGroup">
                      <div class="col-12 d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <label for=""
                            >Địa chỉ cụ thể<span class="labelStar">
                              *</span
                            ></label
                          >
                          <div class="inputForm checkboxValue">
                            <input
                              type="text"
                              v-model="form.address"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.address.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.form.address.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.address.required"
                                >Địa chỉ không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 formCreateGroup">
                      <label for=""
                        >Giới thiệu về công ty<span class="labelStar">
                          *</span
                        ></label
                      >
                      <div class="inputForm">
                        <textarea
                          id="w3review"
                          name="w3review"
                          rows="4"
                          cols="50"
                          style="width: 100%"
                          v-model="form.introduction"
                          :class="{
                            'is-invalid':
                              submitted && $v.form.introduction.$error,
                          }"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="actionHandleForm d-flex">
                    <div class="actionHandle">
                      <button class="btnCancel" v-on:click="resetInput()">
                        <i class="fas fa-chevron-left"></i>Hủy
                      </button>
                    </div>
                    <!-- <div class="actionHandle">
                      <button type="submit" class="btnSaveAndBack">
                        <i class="fas fa-save"></i>Lưu & Quay lại
                      </button>
                    </div> -->
                    <div class="actionHandle">
                      <button type="submit" class="btnSave">
                        <i class="fas fa-save"></i>Lưu
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="col-7 mt-5">
          <div>
            <iframe
              :src="url"
              style="
                width: 700px;
                height: 700px;
                margin-left: 2rem;
                margin-top: 2rem;
              "
              frameborder="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>


<style lang="scss">
.modal-xl {
  @media screen and(min-width:1200px) {
    max-width: 1450px !important;
  }
}
.actionHandleForm {
  display: flex;
  justify-content: flex-end;
  .actionHandle {
    margin-right: 5px;
    button {
      outline: none !important;
      border: none;
      padding: 8px 15px;
      font-size: 15px;
      font-family: "Roboto", sans-serif;
      border-radius: 10px;

      color: #fff;
      i {
        margin-right: 7px;
        font-size: 17px;
      }
    }
    .btnSaveAndBack {
      background-color: #3480f7;
      border: 1px solid #3480f7;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: #156fff;
      }
    }
    .btnSave {
      background-color: #1aa94c;
      border: 1px solid #1aa94c;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: #0eb94a;
      }
    }
    .btnCancel {
      color: #000;
      border: 1px solid rgb(212, 211, 211);
      background-color: #fff;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: rgb(231, 229, 229);
      }
    }
  }
}
#createCandidate {
  .header {
    align-items: center;
    .titleHeader {
      span {
        font-weight: 600;
        font-family: "Roboto", sans-serif;
        font-size: 20px;
      }
    }
    .handleCreateDiffCV {
      font-weight: 500;
      font-family: "Roboto", sans-serif;
      button {
        background-color: #fdb327;
        color: #08090a;
        padding: 8px 10px;
        border: none;
        outline: none;
        border-radius: 8px;
        -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
        transition: all 0.2s ease-in-out;
        &:hover {
          background-color: #ffac11;
          color: #030303;
        }
      }
    }
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
    }
  }
  .bodyCreate {
    height: auto;
    width: 100%;
    background-color: #ffffff;
    padding: 20px 15px;
    border-radius: 10px;
    border: 1px solid #ccccccd5;

    .formCreated {
      .formCreateGroup {
        margin-bottom: 20px;
        font-weight: 500;
        font-family: "Roboto", sans-serif;
        label {
          color: #777;
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
            height: 33px;
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
            height: 33px;
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
.imagePreviewWrapper {
  border: 2px solid #f1f1f1;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: block;
  cursor: pointer;
  background-size: cover;
  background-position: center center;
}
.loGoCompany {
  img {
    width: 250px;
    height: 250px;
  }
}
.upload-main {
  background-color: #fff;
  border: 2px dashed #494949;
  border-radius: 10px;
  font-family: "Roboto", sans-serif;
}

.upload-main .upload-container {
  padding: 25px 10px;
  color: #717386;
  font-family: "Roboto", sans-serif;
}

.upload-main .upload-container:hover {
  cursor: pointer;
}

.upload-main .upload-container p i {
  font-size: 40px;
}

.upload-main .upload-container p {
  margin-bottom: 0;
  font-family: "Roboto", sans-serif;
}

.upload-main .upload-container .btn-upload {
  border-radius: 7px;
  margin-top: 10px;
  font-family: "Roboto", sans-serif;
}
.handleBack button {
  width: 37px;
  height: 37px;
  border-radius: 50%;
  outline: none;
  border: none;
}
.handleBack {
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
.titleCreate {
  font-weight: 600;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
}
.readonly,
.readonly1 {
  pointer-events: none;
  background-color: rgb(100, 100, 100);
}
</style>
