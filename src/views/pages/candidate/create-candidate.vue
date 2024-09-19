<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import Swal from "sweetalert2";
import { required, email, minLength, numeric } from "vuelidate/lib/validators";
import { mapActions } from "vuex";
export default {
  page: {
    title: "Tạo ứng viên",
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
      fileName: "",
      path: "",
      submitted: false,
      isShowSeenCV: false,
      //Preparation data:

      //Selected data:
      selected_currency: "USD",

      candidate_skills: [],
      candidate_languages: [],
      candidate_experiences: [],

      timeAcceptJob: [
        { id: 0, name: "Có thể nhận ngay" },
        { id: 1, name: "Sau 1 tháng" },
        { id: 2, name: "Sau 2 tháng" },
        { id: 3, name: "Sau 3 tháng" },
      ],
      listLanguage: [],
      listSkill: [],
      roleJobs: [],
      selected_job_roles: [],
      roleJobCompany: null,
      listInductries: [],
      careerCompany: null,
      careerCompanys: [],
      levelJobs: [
        {
          id: 0,
          name: "Quản Lý Điều Hành",
        },
        {
          id: 1,
          name: "Quản Lý Cao Cấp",
        },
        {
          id: 2,
          name: "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp",
        },
        {
          id: 3,
          name: "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát",
        },
        {
          id: 4,
          name: "Chuyên Gia / Có Kinh Nghiệm",
        },
        {
          id: 5,
          name: "Mới Ra Trường / Thực Tập",
        },
      ],
      selected_job_levels: [],
      levelJob: null,
      locations: [],
      selected_locations: [],
      softSkill: [],
      languageSkill: [],
      workExperience: [],
      abc: ["a", "b"],
      cv_path: null,
      path_cv_hided: null,
      url: "",
      form: {
        email: null,
        name: null,
        title: null,
        phone: null,
        areaWork: [],
        workAfterDay: null,
        expected: null,
        reason: null,
        currentSalary: null,
        roleJob: [],
        levelJob: [],
        isNegotiable: false,
      },
      lowestSalary: null,
      highestSalary: null,
      isValidateSalary: false,
    };
  },
  validations: {
    form: {
      email: {
        required,
        email,
      },
      name: {
        required,
      },
      title: {
        required,
      },
      phone: {
        required,
        numeric,
        minLength: minLength(10),
      },
      areaWork: {
        required,
      },
      workAfterDay: {
        required,
      },
      highestSalary: {
        required,
        numeric,
      },
      expected: {
        required,
      },
      reason: {
        required,
      },
    },
  },
  mounted() {
    this.getCities();
    this.getJobRole();
    this.getSkill();
    this.getLanguage();
    this.getIndustry();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "candidates/uploadCVSuccess":
          //Get cv path after upload
          this.path_cv_hided = state.candidates.candidateData.pathHided;
          this.form.phone = state.candidates.candidateData.phone;
          this.form.email = state.candidates.candidateData.email;
          break;
        case "cities/getCitiesSuccess":
          //Get cities
          this.locations = state.cities.citiesData.cities;
          break;
        case "company/jobRoleSuccess":
          //Get all job roles
          this.roleJobs = state.company.job_role_data.job_role;
          break;
        case "company/skillSuccess":
          //Get all skilles
          this.listSkill = state.company.skill_data.skills;
          break;
        case "company/languageSuccess":
          //Get all languages
          this.listLanguage = state.company.language_data.languages;
          break;
        case "company/industrySuccess":
          //Get all industries
          this.listInductries = state.company.industry_data.industries;
          break;
        case "candidates/createCandidateSuccess":
          Swal.fire("Tạo ứng viên thành công", "", "success").then(() => {
            this.$router.push({
              path: "/manage-candidate-for-collaborator",
            });
          });
          break;
        case "candidates/createCandidateFailure":
          Swal.fire("Tạo ứng viên không thành công", "", "error").then(
            () => {}
          );
          break;
      }
    });
  },
  computed: {
    getFilePath: () => {
      if (this.fileName !== "") {
        return this.path + "?file=" + this.fileName;
      }
      return this.path;
    },
  },
  watch: {
    path_cv_hided: function () {
      const cv_type = this.getFileExtension(this.path_cv_hided)[0];
      switch (cv_type) {
        case "pdf":
          this.url = generateApiUrl(this.path_cv_hided);
          break;
        case "docx":
          this.url =
            "https://view.officeapps.live.com/op/view.aspx?src=" +
            generateApiUrl(this.path_cv_hided) +
            "&embedded=true";
          break;
      }
    },
    selected_locations: function () {
      this.form.areaWork = [];
      this.selected_locations.forEach((location) => {
        this.form.areaWork.push(location.id);
      });
    },
    selected_job_roles: function () {
      this.form.roleJob = [];
      this.selected_job_roles.forEach((job_role) => {
        this.form.roleJob.push(job_role._id);
      });
    },
    selected_job_levels: function () {
      this.form.levelJob = [];
      this.selected_job_levels.forEach((job_level) => {
        this.form.levelJob.push(job_level.name);
      });
    },
    // lowestSalary: null,
    //   highestSalary: null,
    lowestSalary: function () {
      if (parseInt(this.lowestSalary) < parseInt(this.highestSalary)) {
        this.isValidateSalary = false;
      } else {
        this.isValidateSalary = true;
      }
    },
    highestSalary: function () {
      if (parseInt(this.lowestSalary) < parseInt(this.highestSalary)) {
        this.isValidateSalary = false;
      } else {
        this.isValidateSalary = true;
      }
    },
  },
  methods: {
    ...mapActions("candidates", ["uploadCVFile", "createNewCandidate"]),
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("company", [
      "getJobRoleInformation",
      "getSkillInformation",
      "getLanguageInformation",
      "getIndustryInformation",
    ]),
    
    backToSearchCandidate() {
      this.$router.push({
        path: "/manage-candidate-for-collaborator",
      });
    },

    // Get all cities function
    getCities() {
      this.getCitiesList();
    },

    // Get all job roles funciton
    getJobRole() {
      this.getJobRoleInformation();
    },

    //Get all skilles function
    getSkill() {
      this.getSkillInformation();
    },

    //Get all languages function
    getLanguage() {
      this.getLanguageInformation();
    },

    //Get all industries
    getIndustry() {
      this.getIndustryInformation();
    },

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    // Hide and show salary max and min fields when select Negotiable check box
    handleChecked() {
      let getAllEle = document.querySelectorAll(".checkboxValue");
      getAllEle.forEach((ele, index) => {
        if (index === 0 || index === 1) {
          if (ele.style.display === "none") {
            ele.style.display = "block";
          } else {
            ele.style.display = "none";
          }
        }
      });
    },

    //Add soft skill object
    handleAddSoftSkill() {
      this.candidate_skills.push({
        skill_id: "",
        year_of_experience: "",
        rating: "",
      });
    },

    removeSoftSkill(counter) {
      this.candidate_skills.splice(counter, 1);
    },

    //Add language object
    handleAddLanguageSkill() {
      this.candidate_languages.push({
        language_id: "",
        year_of_experience: "",
        your_rating: "",
      });
    },

    deleteVisaLanguage(counter) {
      this.candidate_languages.splice(counter, 1);
    },

    //Add experience woking
    handleAddExpWorking() {
      this.candidate_experiences.push({
        industry_ids: [],
        job_role_ids: [],
        job_title: "",
        careerCompany: "",
      });
    },

    deleteVisaExpWork(counter) {
      this.candidate_experiences.splice(counter, 1);
    },

    formSubmit() {
      this.submitted = true;
      this.$v.$touch();
      this.createCandidate();
    },
    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
    },
    uploadCV(event) {
      this.path_cv_hided = event.target.files[0];
      const cvfile = this.path_cv_hided;
      const phone = this.form.phone;
      const email = this.form.email;
      this.uploadCVFile({
        cvfile,
        phone,
      });
    },

    createCandidate() {
      if (this.isValidateSalary) {
        return;
      }

      this.submitted = true;
      this.$v.$touch();

      Swal.fire({
        title: "Xác nhận tạo ứng viên",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const path_cv_hided = this.path_cv_hided;

          const email = this.form.email;
          const name = this.form.name;
          const profile_title = this.form.title;
          const phone = this.form.phone;
          const city_ids = this.form.areaWork;
          // const candidate_availability = this.form.workAfterDay.name;
          const candidate_availability = this.form.workAfterDay.id + "";
          const currency = this.selected_currency;
          const negotiable = this.form.isNegotiable;
          const salary_from = negotiable ? null : this.lowestSalary; //nullable
          const salary_to = negotiable ? null : this.highestSalary; //nullable
          const current_salary = this.form.currentSalary; //nullable
          const suitable_reason = this.form.reason;
          const candidate_expectation = this.form.expected;
          const job_role_ids =
            this.form.roleJob.length > 0 ? this.form.roleJob : null; //nullable
          const job_levels =
            this.form.levelJob.length > 0 ? this.form.levelJob : null; //nullable

          var candidate_skills = null; // nullable
          if (this.candidate_skills.length > 0) {
            candidate_skills = [];
            this.candidate_skills.forEach((candidate_skill) => {
              const candidate_skill_tmp = {
                skill_id: candidate_skill.skill_id._id,
                year_of_experience: candidate_skill.year_of_experience,
                rating: candidate_skill.rating,
              };
              candidate_skills.push(candidate_skill_tmp);
            });
          }

          var candidate_languages = null; // nullable
          if (this.candidate_languages.length > 0) {
            candidate_languages = [];
            this.candidate_languages.forEach((candidate_language) => {
              const candidate_language_tmp = {
                language_id: candidate_language.language_id._id,
                year_of_experience: candidate_language.year_of_experience,
                your_rating: candidate_language.your_rating,
              };
              candidate_languages.push(candidate_language_tmp);
            });
          }

          var work_experiences = null; //null
          if (this.candidate_experiences.length > 0) {
            work_experiences = [];
            this.candidate_experiences.forEach((candidate_experience) => {
              var industry_ids = [];
              candidate_experience.industry_ids.forEach((industry) => {
                industry_ids.push(industry.id);
              });

              var job_role_ids = [];
              candidate_experience.job_role_ids.forEach((job_role) => {
                job_role_ids.push(job_role._id);
              });

              const candidate_experience_tmp = {
                industry_ids: industry_ids,
                job_role_ids: job_role_ids,
                job_title: candidate_experience.job_title,
                work_duration: candidate_experience.work_duration,
              };

              work_experiences.push(candidate_experience_tmp);
            });
          }

          const data = {
            path_cv_hided,
            email,
            name,
            profile_title,
            phone,
            city_ids,
            candidate_availability,
            currency,
            salary_from,
            salary_to,
            negotiable,
            current_salary,
            suitable_reason,
            candidate_expectation,
            job_role_ids,
            job_levels,
            candidate_skills,
            candidate_languages,
            work_experiences,
          };

          this.createNewCandidate(data);
        }
        if (result.isDismissed) {
        }
      });
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
          <a href="./manage-candidate-for-collaborator">
            <button class="handleBack">
              <i class="fas fa-chevron-left"></i>
            </button>
          </a>
          <div class="titleCreate">
            <span>Tạo ứng viên</span>
          </div>
        </div>
      </div>
      <input
        type="file"
        accept=".pdf,.docx,.doc,.html"
        id="inputUpload"
        @change="uploadCV"
        hidden
      />
      <div class="upload-main mt-5 text-center" v-if="path_cv_hided === null">
        <div class="upload-container">
          <h2>Tải hồ sơ của bạn lên đây</h2>
          <p><i class="fas fa-cloud-upload-alt"></i></p>
          <p>Thông tin liên lạc của ứng viên, thông tin bí mật và nhạy cảm</p>
          <p>Sẽ bị hệ thống xóa sau khi tải lên</p>
          <p>
            Sau khi tệp được tải lên, hệ thống sẽ nhận được một số thông tin cơ
            bản. Vui lòng điền thông tin còn thiếu.
          </p>
          <!-- <button
            type="button"
            v-b-modal.modal-1
            class="btn btn-upload btn-success"
          > -->
          <button
            type="button"
            @click="onClickedUploadButton"
            class="btn btn-upload btn-success"
          >
            <i class="fas fa-cloud-upload-alt"></i> Tải CV lên (PDF, HTML, DOCX)
          </button>

          <!-- <b-modal
            size="xl"
            title-class="font-18"
            hide-footer
            id="modal-1"
            title="Form"
            centered
          > -->

          <!-- </b-modal> -->
        </div>
      </div>

      <div class="col-12" v-if="path_cv_hided !== null">
        <div class="col-5 mt-3">
          <div class="header d-flex" style="padding: 5px 0">
            <div class="titleHeader" style="flex: 1">
              <span>Thông tin ứng viên</span>
            </div>
            <div class="handleCreateDiffCV">
              <button
                v-if="!isShowSeenCV"
                v-on:click="isShowSeenCV = !isShowSeenCV"
                class="mat-button-seen"
              >
                Xem CV không che
              </button>
              <button
                v-if="isShowSeenCV"
                v-on:click="isShowSeenCV = !isShowSeenCV"
                class="mat-button-seened"
              >
                Xem CV đã che
              </button>
              <button
                class="mat-button-update"
                v-on:click="onClickedUploadButton"
              >
                <i class="fas fa-cloud-upload-alt" style="margin-right: 5px"></i
                >Cập nhật CV khác
              </button>
            </div>
          </div>
        </div>
        <div class="col-12 d-flex">
          <div class="col-5">
            <div id="createCandidate">
              <div class="bodyCreate">
                <div class="formCreated">
                  <form @submit.prevent="createCandidate">
                    <div class="formCreatedContent">
                      <div class="col-12 formCreateGroup">
                        <i class="far fa-envelope"></i>
                        <label for=""
                          >Email ứng viên
                          <span class="labelStar">*</span></label
                        >
                        <div class="inputForm">
                          <input
                            type="email"
                            placeholder="ví dụ: abc@gmail.com"
                            style="width: 70%"
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
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <label for=""
                            >Tên ứng viên
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <input
                              type="text"
                              placeholder="ví dụ: Nguyễn Thành Tài"
                              v-model="form.name"
                              :class="{
                                'is-invalid': submitted && $v.form.name.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.form.name.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.name.required"
                                >Tên không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <label for=""
                            >Tiêu đề hồ sơ hiển thị
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <input
                              type="text"
                              placeholder="ví dụ: NODEJS Fullstack Developer"
                              v-model="form.title"
                              :class="{
                                'is-invalid': submitted && $v.form.title.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.form.title.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.title.required"
                                >Tiêu đề không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <i class="fas fa-phone-alt"></i>
                          <label for=""
                            >Số điện thoại
                            <span class="labelStar">*</span></label
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
                              <span v-if="!$v.form.phone.numeric">
                                Số điện thoại không đúng định dạng *
                              </span>
                              <span v-if="!$v.form.phone.minLength"
                                >Số điện thoại quá ngắn, lớn hơn bằng 10 *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <label for=""
                            >Khu vực làm việc mong muốn<span class="labelStar">
                              *</span
                            ></label
                          >
                          <div class="">
                            <multiselect
                              v-model="selected_locations"
                              :options="locations"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Pick some"
                              label="name"
                              track-by="id"
                              :preselect-first="true"
                              :show-labels="false"
                              :allow-empty="false"
                              :class="{
                                'is-invalid':
                                  submitted && $v.form.areaWork.$error,
                              }"
                            >
                            </multiselect>
                            <!-- <multiselect
                            multiple
                            v-model="form.areaWork"
                            :options="locations"
                            :show-labels="false"
                            :allow-empty="false"
                            label="name"
                            :class="{
                              'is-invalid':
                                submitted && $v.form.areaWork.$error,
                            }"
                          ></multiselect> -->

                            <div
                              v-if="submitted && $v.form.areaWork.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.form.areaWork.required"
                                >Khu vực làm việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="line"></div>
                      <div class="col-12 formCreateGroup">
                        <label for=""
                          >Ứng viên có thể nhận việc mới sau bao nhiêu ngày<span
                            class="labelStar"
                            >*</span
                          ></label
                        >
                        <div class="" style="width: 70%">
                          <multiselect
                            v-model="form.workAfterDay"
                            :options="timeAcceptJob"
                            :show-labels="false"
                            :allow-empty="false"
                            label="name"
                            :class="{
                              'is-invalid':
                                submitted && $v.form.workAfterDay.$error,
                            }"
                          ></multiselect>
                          <div
                            v-if="submitted && $v.form.workAfterDay.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.workAfterDay.required"
                              >Thời gian nhận việc không được bỏ trống *</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup">
                        <label for=""
                          >Đơn vị tiền tệ<span class="labelStar">*</span></label
                        >
                        <div class="container d-flex mr-3">
                          <b-form-radio
                            v-model="selected_currency"
                            class="col-6 mb-3"
                            value="USD"
                            plain
                            >USD</b-form-radio
                          >
                          <b-form-radio
                            v-model="selected_currency"
                            class="col-6 custom-radio mb-3"
                            value="VND"
                            plain
                            >VND</b-form-radio
                          >
                        </div>
                      </div>
                    </div>
                    <div class="formCreatedContent" style="margin-top: 30x">
                      <div class="col-12 formCreateGroup">
                        <div class="col-12 d-flex">
                          <div class="col-6" style="padding-right: 10px">
                            <label for="" v-if="!form.isNegotiable"
                              >Mức lương (thấp nhất)
                              <span class="labelStar">*</span></label
                            >
                            <div class="inputForm checkboxValue">
                              <input
                                type="number"
                                placeholder="Mức lương hàng tháng"
                                v-model="lowestSalary"
                                class="inputValue"
                              />
                            </div>
                            <div class="checkBox">
                              <input
                                type="checkbox"
                                v-on:click="handleChecked"
                                v-model="form.isNegotiable"
                              />

                              <span>Thương lượng</span>
                            </div>
                          </div>
                          <div class="col-6" style="padding-left: 10px">
                            <label for="" v-if="!form.isNegotiable"
                              >Mức lương (cao nhất)<span class="labelStar">
                                *</span
                              ></label
                            >
                            <div class="inputForm checkboxValue">
                              <input
                                type="number"
                                v-model="highestSalary"
                                placeholder="Mức lương hàng tháng"
                                class="inputValue"
                              />
                            </div>
                            <!-- <div class="checkBox">
                            <input
                              type="checkbox"
                              v-on:click="handleChecked"
                              class="inputValue"
                            />
                            <span>Thương lượng </span>
                          </div> -->
                          </div>
                        </div>
                        <div>
                          <span v-if="isValidateSalary" class="text-danger"
                            >Lương thấp nhất phải thấp hơn lương cao nhất
                            *</span
                          >
                          <!-- <span
                                v-if="!isValueCheck"
                                for=""
                                class="text-danger"
                                >Lương thấp nhất phải thấp hơn lương cao nhất
                                *</span
                              > -->
                          <!-- <span v-if="checkValue === 'notValue'" for="" class="text-danger"
                                >Vui lòng điền đủ thông tin lương
                                *</span
                              > -->
                        </div>
                      </div>

                      <div class="col-12 formCreateGroup" style="width: 70%">
                        <label for="">Mức lương hiện tại</label>
                        <div class="skipStep">
                          <span
                            >Bạn có thể bỏ qua mục này nếu ứng viên không đồng ý
                            cung cấp.
                          </span>
                        </div>
                        <div class="inputForm checkboxValue">
                          <input
                            type="text"
                            placeholder="Monthly Gross in USD"
                            v-model="form.currentSalary"
                          />
                        </div>
                        <!-- <div class="checkBox">
                        <input type="checkbox" v-on:click="handleChecked" />
                        <span>Thương lượng</span>
                      </div> -->
                      </div>
                      <div class="col-12 formCreateGroup">
                        <label for=""
                          >Lý do ứng viên phù hợp với vị trí này?<span
                            class="labelStar"
                          >
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
                            v-model="form.reason"
                            :class="{
                              'is-invalid': submitted && $v.form.reason.$error,
                            }"
                          ></textarea>
                          <div
                            v-if="submitted && $v.form.reason.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.reason.required"
                              >Mục này không được bỏ trống *</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup">
                        <label for=""
                          >Tại sao ứng viên thay đổi công việc và kỳ vọng của cô
                          ấy / anh ấy là gì?<span class="labelStar">
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
                            v-model="form.expected"
                            :class="{
                              'is-invalid':
                                submitted && $v.form.expected.$error,
                            }"
                          ></textarea>
                          <div
                            v-if="submitted && $v.form.expected.$error"
                            class="invalid-feedback"
                          >
                            <span v-if="!$v.form.expected.required"
                              >Mục này không được bỏ trống *</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <label for="">Vai trò công việc</label>
                          <div class="">
                            <multiselect
                              v-model="selected_job_roles"
                              :options="roleJobs"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Chọn vai trò công việc"
                              label="name"
                              track-by="_id"
                              :show-labels="false"
                            >
                            </multiselect>
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <label for="">Cấp bậc công việc</label>
                          <div class="">
                            <multiselect
                              v-model="selected_job_levels"
                              :options="levelJobs"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Chọn cấp bậc công việc"
                              label="name"
                              track-by="id"
                              :show-labels="false"
                            >
                            </multiselect>
                          </div>
                        </div>
                      </div>
                      <!-- Kỹ năng ứng viên của bạn -->
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-3" style="padding-right: 10px">
                          <label for="">Kỹ năng ứng viên của bạn</label>
                        </div>
                        <div class="col-9" style="padding-left: 10px">
                          <div
                            class="softSkills"
                            v-for="(skill, index) in candidate_skills"
                            v-bind:key="index"
                          >
                            <!-- Block kỹ năng -->
                            <div class="col-12 formCreateGroup">
                              <label for="">Kỹ năng {{ index + 1 }} </label>
                              <div class="inputForm">
                                <multiselect
                                  v-model="candidate_skills[index].skill_id"
                                  :options="listSkill"
                                  placeholder="Nhập mới hoặc chọn kỹ năng"
                                  label="name"
                                  track-by="_id"
                                  :show-labels="false"
                                  :allow-empty="false"
                                ></multiselect>
                              </div>
                            </div>
                            <div class="col-12 formCreateGroup d-flex">
                              <div class="col-6" style="padding-right: 10px">
                                <label for="">Năm kinh nghiệm </label>
                                <div class="inputForm">
                                  <input
                                    type="number"
                                    placeholder="Nhập số năm"
                                    v-model="
                                      candidate_skills[index].year_of_experience
                                    "
                                  />
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <label for="">Đánh giá của bạn </label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    placeholder="Nhập đánh giá"
                                    v-model="candidate_skills[index].rating"
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="
                                col-12
                                formCreateGroup
                                d-flex
                                justify-content-end
                              "
                            >
                              <div class="handleDeleteSoftSkill">
                                <button
                                  type="button"
                                  v-on:click="removeSoftSkill(index)"
                                >
                                  <i class="fas fa-trash"></i>Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="handleAddButton" style="width: 100%">
                            <button
                              type="button"
                              style="width: 100%"
                              v-on:click="handleAddSoftSkill"
                            >
                              <i class="fas fa-plus-circle"></i>Thêm kỹ năng
                            </button>
                          </div>
                        </div>
                      </div>
                      <!-- Khả năng ngôn ngữ của ứng viên -->
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-3" style="padding-right: 10px">
                          <label for="">Khả năng ngôn ngữ của ứng viên</label>
                        </div>
                        <div class="col-9" style="padding-left: 10px">
                          <div
                            class="softSkills"
                            v-for="(language, index) in candidate_languages"
                            v-bind:key="index"
                          >
                            <div class="col-12 formCreateGroup">
                              <label for="">Ngôn ngữ {{ index + 1 }} </label>
                              <div class="inputForm">
                                <multiselect
                                  v-model="
                                    candidate_languages[index].language_id
                                  "
                                  track-by="_id"
                                  label="name"
                                  placeholder="Chọn ngôn ngữ"
                                  :options="listLanguage"
                                  :searchable="false"
                                  :allow-empty="false"
                                  :show-labels="false"
                                >
                                </multiselect>
                              </div>
                            </div>
                            <div class="col-12 formCreateGroup d-flex">
                              <div class="col-6" style="padding-right: 10px">
                                <label for="">Năm kinh nghiệm </label>
                                <div class="inputForm">
                                  <input
                                    type="number"
                                    placeholder="Nhập số năm"
                                    v-model="
                                      candidate_languages[index]
                                        .year_of_experience
                                    "
                                  />
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <label for="">Đánh giá của bạn </label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    placeholder="Nhập đánh giá của bạn"
                                    v-model="
                                      candidate_languages[index].your_rating
                                    "
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="
                                col-12
                                formCreateGroup
                                d-flex
                                justify-content-end
                              "
                            >
                              <div class="handleDeleteSoftSkill">
                                <button
                                  type="button"
                                  v-on:click="deleteVisaLanguage(index)"
                                >
                                  <i class="fas fa-trash"></i>Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="handleAddButton" style="width: 100%">
                            <button
                              type="button"
                              style="width: 100%"
                              v-on:click="handleAddLanguageSkill"
                            >
                              <i class="fas fa-plus-circle"></i>Thêm ngôn ngữ
                            </button>
                          </div>
                        </div>
                      </div>
                      <!-- Kinh nghiệm làm việc -->
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-3" style="padding-right: 10px">
                          <label for="">Kinh nghiệm làm việc</label>
                        </div>
                        <div class="col-9" style="padding-left: 10px">
                          <div
                            class="softSkills"
                            v-for="(skill, index) in candidate_experiences"
                            v-bind:key="index"
                          >
                            <div class="col-12 formCreateGroup">
                              <label for="">Ngành nghề công ty</label>
                              <div class="">
                                <multiselect
                                  v-model="
                                    candidate_experiences[index].industry_ids
                                  "
                                  :options="listInductries"
                                  :multiple="true"
                                  :close-on-select="false"
                                  :clear-on-select="false"
                                  :preserve-search="true"
                                  placeholder="Chọn nhóm ngành"
                                  label="name"
                                  track-by="id"
                                  :show-labels="false"
                                >
                                </multiselect>
                              </div>
                            </div>
                            <div class="col-12 formCreateGroup">
                              <label for="">Vai trò công việc</label>
                              <div class="">
                                <multiselect
                                  v-model="
                                    candidate_experiences[index].job_role_ids
                                  "
                                  :options="roleJobs"
                                  :multiple="true"
                                  :close-on-select="false"
                                  :clear-on-select="false"
                                  :preserve-search="true"
                                  placeholder="Chọn vai trò công việc"
                                  label="name"
                                  track-by="_id"
                                  :show-labels="false"
                                >
                                </multiselect>
                              </div>
                            </div>
                            <div class="col-12 formCreateGroup d-flex">
                              <div class="col-6" style="padding-right: 10px">
                                <label for="">Tên job</label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    placeholder="Nhập tên công việc"
                                    v-model="
                                      candidate_experiences[index].job_title
                                    "
                                  />
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <label for="">Thời gian làm việc </label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    placeholder="Nhập thời gian làm việc"
                                    v-model="
                                      candidate_experiences[index].work_duration
                                    "
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="
                                col-12
                                formCreateGroup
                                d-flex
                                justify-content-end
                              "
                            >
                              <div class="handleDeleteSoftSkill">
                                <button
                                  type="button"
                                  v-on:click="deleteVisaExpWork(index)"
                                >
                                  <i class="fas fa-trash"></i>Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="handleAddButton" style="width: 100%">
                            <button
                              type="button"
                              style="width: 100%"
                              v-on:click="handleAddExpWorking"
                            >
                              <i class="fas fa-plus-circle"></i>Thêm kinh nghiệm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="actionHandleForm d-flex">
                      <div class="actionHandle">
                        <button class="btnCancel" v-on:click="backToSearchCandidate">
                          <i class="fas fa-chevron-left"></i>Hủy
                        </button>
                      </div>
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
          <div class="col-7">
            <div style="width: 100%; padding: 0 17px">
              <iframe
                v-if="!isShowSeenCV"
                :src="url"
                style="width: 100%; height: 700px"
                frameborder="0"
              ></iframe>
              <div class="cautionCandidate">
                <div class="cautionCandidate__header">
                  <i class="fas fa-info-circle"></i>
                  <span>Lưu ý: Khi gửi CV vào công việc, các hunter chú ý</span>
                </div>
                <div class="cautionCandidate__content">
                  Hãy XÓA tất cả các thông tin liên lạc của ứng viên trong CV
                  như Số Điện Thoại, Email vv.. Nếu không xóa liên lạc, Doanh
                  nghiệp có thể chủ động tự liên hệ với ứng viên dẫn đến
                  Headhunter không được nhận hoa hồng thưởng. Chỉ nhập thông tin
                  của Ứng viên vào các ô của hệ thống tatool để thuận lợi quản
                  lý và kiểm tra trùng hồ sơ.
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
      padding: 8px 10px;
      border: none;
      outline: none;
      border-radius: 8px;
      -webkit-box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.75);
      -moz-box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.75);
      box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.75);
      transition: all 0.2s ease-in-out;
    }
    .mat-button-seen {
      background: #fff;
      border: 1px solid #d4d3d3;
      margin-right: 8px;
      &:hover {
        background: #e7e5e5;
      }
    }
    .mat-button-seened {
      background: #fff;
      border: 1px solid #d4d3d3;
      margin-right: 8px;
      &:hover {
        background: #e7e5e5;
      }
    }
    .mat-button-update {
      background-color: #fdb327;
      color: #08090a;

      &:hover {
        background-color: #ffac11;
        color: #030303;
      }
    }
  }
}
#createCandidate {
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
::placeholder {
  color: #55555526;
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

.cautionCandidate {
  border-left: 7px solid rgb(255, 129, 45, 0.9);
  border-radius: 7px;
  padding: 15px;
  background-color: rgb(255, 210, 89, 0.75);
  margin-top: 2rem;
  &__header {
    i {
      font-size: 17px;
      margin-right: 5px;
    }
    span {
      font-size: 18px;
      font-weight: 600;
    }
  }
  &__content {
    font-size: 15px;
    text-align: justify;
  }
}
</style>
