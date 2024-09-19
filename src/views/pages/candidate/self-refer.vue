<script>
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import { required, email, minLength, numeric } from "vuelidate/lib/validators";
import { mapActions } from "vuex";
import Swal from "sweetalert2";
import { sperateMoney } from "../../../helpers/common/Ultilities";
export default {
  page: {
    title: "Nộp hồ sơ",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Multiselect,
  },
  data() {
    return {
      //Localize
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

      post: {},
      create_date: "",
      end_date: "",

      //
      fileName: "",
      path: "",
      submitted: false,

      //CV data
      cv_path: "",
      cv_url: "",

      //Preparation data:
      candidate_detail: {},

      //Selected data:
      selected_currency: "USD",

      candidate_skills_original: [],
      candidate_skills: [],
      candidate_languages_original: [],
      candidate_languages: [],
      candidate_experiences_original: [],
      candidate_experiences: [],

      timeAcceptJob: [
        { id: "0", name: "Có thể nhận ngay" },
        { id: "1", name: "Sau 1 tháng" },
        { id: "2", name: "Sau 2 tháng" },
        { id: "3", name: "Sau 3 tháng" },
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
      path_cv_hided: null,
      form: {
        email: null,
        name: null,
        title: null,
        phone: null,
        areaWork: [],
        workAfterDay: null,
        lowestSalary: null,
        highestSalary: null,
        expected: null,
        reason: null,
        currentSalary: null,
        roleJob: [],
        levelJob: [],
        isNegotiable: false,
        otherEmail: null,
        otherPhone: null,
        leveljapan: null,
        nearEvaluate: null,
        gpaCandidate: null,
        candidateEvaluate: null,
        projectEverdone: null,
        communicationEvaluate: null,
        firstDateInterview: null,
      },
      optional_fields: [],
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
      },
      lowestSalary: {
        required,
      },
      expected: {
        required,
      },
      reason: {
        required,
      },
      otherEmail: {
        required,
        email,
      },
      otherPhone: {
        required,
        numeric,
        minLength: minLength(10),
      },
      leveljapan: {
        required,
      },
      nearEvaluate: {
        required,
      },
      gpaCandidate: {
        required,
      },
      candidateEvaluate: {
        required,
      },
      projectEverdone: {
        required,
      },
      communicationEvaluate: {
        required,
      },
      firstDateInterview: {
        required,
      },
    },
  },
  mounted() {
    this.value = this.languages.find((x) => x.language === this.$i18n.locale);
    this.flag = this.value.flag;
    this.text = this.value.title;

    this.getPostDetailById();
    this.getCities();
    this.getJobRole();
    this.getSkill();
    this.getLanguage();
    this.getIndustry();
    this.getListOptionalFields();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "postdetail/getPostDeatilSuccess":
          this.post = state.postdetail.postDetail.post;
          let newArr = [];
          let value = "";
          for (let i = 0; i < this.post.job_level.length; i++) {
            if (this.post.job_level[i] !== ";") {
              value += this.post.job_level[i];
            }
            if (this.post.job_level[i] === ";") {
              newArr.push(value);
              value = "";
            }
          }
          newArr.push(value);
          this.post.job_level = newArr;

          this.create_date = this.getDateString(this.post.date_on);
          this.end_date = this.getDateString(this.post.date_end);
          break;
        case "candidates/uploadCVSuccess":
          this.cv_path = state.candidates.candidateData.pathHided;
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
        case "post/getOptionalFieldSuccess":
          //Get optional fields for post
          this.optional_fields = state.post.optionalFieldData.optional_fields;
          break;
        case "candidates/referCandidateSuccess":
          Swal.fire("Nộp hồ sơ thành công", "", "success").then(() => {
            this.$router.push({
              path: "/",
            });
          });
          break;
        case "candidates/referCandidateFailure":
          Swal.fire("Nộp hồ sơ không thành công", "", "error").then(() => {});
          break;
      }
    });
  },
  watch: {
    cv_path: function () {
      const cv_type = this.getFileExtension(this.cv_path)[0];
      switch (cv_type) {
        case "pdf":
          this.cv_url = generateApiUrl(this.cv_path);
          break;
        case "docx":
          this.cv_url =
            "https://view.officeapps.live.com/op/view.aspx?src=" +
            generateApiUrl(this.cv_path) +
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
    optional_fields: function () {},
  },
  methods: {
    ...mapActions("postdetail", ["getPostDetail"]),
    ...mapActions("candidates", ["uploadCVFile", "selfRefer"]),
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("company", [
      "getJobRoleInformation",
      "getSkillInformation",
      "getLanguageInformation",
      "getIndustryInformation",
    ]),
    ...mapActions("post", ["getOptionalField"]),

    getImageURL(path) {
      return generateApiUrl(path);
    },

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    getPostDetailById() {
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
      this.getPostDetail(id);
    },

    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;
      this.current_language = locale;
      this.text = country;
      this.flag = flag;
    },

    cancelApplyJob() {
      this.$router.push({
        path: "/",
      });
    },

    uploadCV(event) {
      this.path_cv_hided = event.target.files[0];
      const cvfile = this.path_cv_hided;
      this.uploadCVFile({
        cvfile,
      });
    },

    getListOptionalFields() {
      const post_id = this.getPostId();
      this.getOptionalField({ post_id });
    },

    getOptionList(data) {
      return data.split(";");
    },

    applyJob() {
      //Get post id from url
      const post_id = this.getPostId();

      //Get candidate id from url
      const collaborator_id = this.getCollaboratorId();

      //Get general information
      this.submitted = true;
      this.$v.$touch();

      const path_cv_hided = this.cv_path;

      const email = this.form.email;
      const name = this.form.name;
      const profile_title = this.form.title;
      const phone = this.form.phone;
      const city_ids = this.form.areaWork;
      const candidate_availability = this.form.workAfterDay.id;
      const currency = this.selected_currency;
      const negotiable = this.form.isNegotiable;
      const salary_from = negotiable ? null : this.form.lowestSalary; //nullable
      const salary_to = negotiable ? null : this.form.highestSalary; //nullable
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

      //Get optional field information
      var optionalFieldsValue = [];
      this.optional_fields.forEach((optional_field) => {
        var data = optional_field.value;
        switch (optional_field.type) {
          case "multiselect":
            data = "";

            optional_field.value.forEach((option) => {
              data = data + option + ";";
            });
            break;
          case "date":
            const date = new Date(optional_field.value);
            data = date.getTime() + "";
        }
        optionalFieldsValue.push({
          optionalFieldId: optional_field._id,
          value: data,
        });
      });

      // Build data json
      const data = {
        post_id,
        collaborator_id,
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
        optionalFieldsValue,
      };

      // selfRefer

      Swal.fire({
        title: "Xác nhận nộp hồ sơ ứng tuyển",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          this.selfRefer(data);
        }
        if (result.isDismissed) {
        }
      });
    },

    // Get post id
    getPostId() {
      var id = "";
      var url = window.location.href;

      // Get id value
      var name = "id";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      id = decodeURIComponent(results[2].replace(/\+/g, " "));

      return id;
    },

    // Get collaborator id
    getCollaboratorId() {
      var id = "";
      var url = window.location.href;

      // Get id value
      var name = "cid";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      id = decodeURIComponent(results[2].replace(/\+/g, " "));

      return id;
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

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    deleteVisaExpWork(counter) {
      this.candidate_experiences.splice(counter, 1);
    },

    formSubmit() {
      this.submitted = true;
      this.$v.$touch();

      if (this.$store.state.candidates.cvPath === "") {
        this.updateCandidateDetail();
      } else {
        this.createCandidate();
      }
    },
    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
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
    <div class="row">
      <div class="col"></div>
      <div class="col-10">
        <div
          class="
            d-flex
            col-12
            mt-2
            flex-wrap
            justify-content-between
            header__post-detail
          "
          style="align-items: center"
        >
          <div class="d-flex">
            <div class="titleInfomation">
              <div class="textHeader d-flex">
                <span class="textHeaderTitle">{{ post.title }}</span>

                <div class="status__post-detail mat-status-post">
                  <span
                    v-if="post.status == 'active'"
                    class="badge bg-success rounded-pill"
                    >{{ post.status }}</span
                  >
                  <span
                    v-if="post.status == 'pause'"
                    class="badge bg-warning rounded-pill"
                    >{{ post.status }}</span
                  >
                  <span
                    v-if="post.status == 'close'"
                    class="badge bg-danger rounded-pill"
                    >{{ post.status }}</span
                  >
                </div>
                <span
                  class="badge badgeStatus rounded-pill mat-urgency"
                  v-if="post.urgency === true"
                >
                  Tuyển gấp
                </span>
              </div>
              <div class="salaryText">
                <span class="bonus"
                  ><strong
                    >Thưởng {{ sperateMoneyString(post.commission)
                    }}{{ post.currency }}</strong
                  >
                  <span style=""> / Ứng viên</span></span
                >
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="">
            <div class="">
              <b-tabs
                justified
                nav-class="nav-tabs-custom"
                content-class="text-muted"
              >
                <b-tab active>
                  <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                      <i class="fas fa-home"></i>
                    </span>
                    <span class="d-none d-sm-inline-block detailTextJovs"
                      >Chi tiết công việc</span
                    >
                  </template>
                  <div
                    class="jobInfor d-flex flex-wrap job-infor"
                    style="padding: 0"
                  >
                    <div class="col-xl-7 col-12 job-infor__detail">
                      <div class="job-detail">
                        <div class="header-detail">
                          <div class="title-header">
                            <span>Chi tiết công việc</span>
                          </div>
                        </div>
                        <div class="detailContent">
                          <div class="detailinforJob mb-3">
                            <div class="d-flex mb-1">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-cubes"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  color: rgba(0, 0, 0, 0.87);
                                  font-weight: 500;
                                "
                                >Công ty: {{ post.company.name }}</span
                              >
                            </div>

                            <div class="d-flex mb-1">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fa fa-map-marker"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  color: rgba(0, 0, 0, 0.87);
                                  font-weight: 500;
                                "
                                >Địa điểm làm việc:</span
                              >
                              <span v-if="post.cities.length > 0">
                                <span
                                  class="textLocation"
                                  v-for="item in post.cities"
                                  :key="item.name"
                                >
                                  {{ item.name }}</span
                                >
                              </span>
                              <span v-if="post.cities.length <= 0"
                                >Chưa có</span
                              >
                            </div>
                            <div class="d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="mdi mdi-clock-time-eight-outline"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  color: rgba(0, 0, 0, 0.87);
                                  font-weight: 500;
                                "
                                >Ngày tạo: {{ create_date }}</span
                              >
                            </div>

                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="mdi mdi-timer"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  color: rgba(0, 0, 0, 0.87);
                                  font-weight: 500;
                                "
                                >Hạn nộp hồ sơ: {{ end_date }}</span
                              >
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-briefcase"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  font-weight: 500;
                                  color: rgba(0, 0, 0, 0.87);
                                "
                                >Ngành nghề:
                                <span class="workText">
                                  <i
                                    style="font-size: 10px; margin-right: 2px"
                                  ></i
                                  >{{ post.job.name }}</span
                                ></span
                              >
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-dollar-sign"></i>
                              </div>
                              <span
                                v-if="
                                  post.salary_from > 0 || post.salary_to > 0
                                "
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  font-weight: 500;
                                  color: rgba(0, 0, 0, 0.87);
                                "
                                >Lương:
                                <span class="textSalaryDetail">
                                  {{
                                    sperateMoneyString(post.salary_from) +
                                    " - " +
                                    sperateMoneyString(post.salary_to)
                                  }}
                                  {{ post.currency }}</span
                                ></span
                              >
                              <span
                                v-if="!post.salary_from && !post.salary_to"
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  font-weight: 500;
                                  color: rgba(0, 0, 0, 0.87);
                                "
                                >Lương:
                                <span class="textSalaryDetail">
                                  Thương lượng</span
                                >
                              </span>
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-users"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  color: rgba(0, 0, 0, 0.87);
                                  font-weight: 500;
                                "
                                >Số lượng tuyển: {{ post.require_number }}</span
                              >
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-layer-group"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;

                                  font-weight: 500;
                                  color: rgba(0, 0, 0, 0.87);
                                "
                                >Trình độ:
                                <span>
                                  <span
                                    class="textLevelJob"
                                    style="margin-right: 5px"
                                    v-for="item in post.job_level"
                                    v-bind:key="item"
                                    >{{ item }}</span
                                  >
                                </span></span
                              >
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fab fa-critical-role"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;
                                  color: rgba(0, 0, 0, 0.87);

                                  font-weight: 500;
                                "
                                >Vai trò:
                                <span
                                  v-for="item in post.job_role"
                                  :key="item.name"
                                  class="roleJob"
                                >
                                  {{ item.name }}</span
                                ></span
                              >
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-language"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;
                                  color: rgba(0, 0, 0, 0.87);

                                  font-weight: 500;
                                "
                                >Ngôn ngữ:
                                <span v-if="post.languages.length > 0">
                                  <span
                                    v-for="item in post.languages"
                                    :key="item.name"
                                    class="language"
                                  >
                                    {{ item.name }}</span
                                  ></span
                                >
                                <span
                                  v-if="post.languages.length <= 0"
                                  class="language"
                                  >Chưa có</span
                                >
                              </span>
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-tags"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;
                                  color: rgba(0, 0, 0, 0.87);

                                  font-weight: 500;
                                "
                                >Kỹ năng:
                                <span v-if="post.skills.length > 0">
                                  <span
                                    class="textSkill"
                                    v-for="item in post.skills"
                                    :key="item.description"
                                  >
                                    {{ item.description }}</span
                                  >
                                </span>
                                <span v-if="post.skills.length <= 0"
                                  >Chưa có</span
                                >
                              </span>
                            </div>
                            <div class="mt-1 d-flex">
                              <div
                                style="
                                  font-size: 17px;
                                  width: 25px;
                                  margin-right: 5px;
                                  text-align: center;
                                "
                              >
                                <i class="fas fa-newspaper"></i>
                              </div>
                              <span
                                class="fontTitle"
                                style="
                                  font-size: 17px;
                                  color: rgba(0, 0, 0, 0.87);

                                  font-weight: 500;
                                "
                                >Loại bảo hành:
                                <span class="textGuarantee">
                                  {{ post.guarantee_type }}</span
                                >
                              </span>
                            </div>
                          </div>
                          <div class="textDetail">
                            <div class="text-header mt-3">
                              <span>Tổng quan công việc & Trách nhiệm</span>
                            </div>
                            <div class="text" style="white-space: pre-line">
                              <p>
                                {{ post.content }}
                              </p>
                            </div>
                          </div>
                          <div class="textDetail">
                            <div class="text-header mt-3">
                              <span>Lợi ích công việc</span>
                            </div>
                            <div class="text" style="white-space: pre-line">
                              <p>
                                {{ post.benefit }}
                              </p>
                            </div>
                          </div>
                          <div class="textDetail">
                            <div class="text-header mt-3">
                              <span>Yêu cầu công việc</span>
                            </div>
                            <div class="text" style="white-space: pre-line">
                              <p>
                                {{ post.require }}
                              </p>
                            </div>
                          </div>
                          <!-- <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Ưu tiên ứng viên</span>
                        </div>
                        <div class="text">
                          <p>
                            - Experience with setting up and maintaining CI/CD
                            pipelines - Experience with any SQL Server and ORM
                            mappers - Experience with cloud services, at best
                            Azure - Working with International teams, clients,
                            or projects
                          </p>
                        </div>
                      </div> -->
                          <!-- <div class="textDetail">
                        <div class="text-header mt-3">
                          <span
                            >Tại sao ứng viên muốn tuyển vào vị trí này ?</span
                          >
                        </div>
                        <div class="text">
                          <p>
                            - Above-average salary with competitive benefits -
                            Year-end bonus (13th month salary) - Dynamic, fun,
                            and agile environment, perfect for sharing and
                            creativity - Open-minded, kind & humble team with
                            great clients - Modern office space in District 1,
                            hardware is provided - Coaching and skill sharing
                            for management and communications skills - Flexible
                            remote work policy - 15 days of annual leave
                            (additional to public holidays), working Monday –
                            Friday
                          </p>
                        </div>
                      </div> -->
                          <!-- <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Báo cáo đến</span>
                        </div>
                        <div class="text">
                          <p>CTO Thanh Tai</p>
                        </div>
                      </div> -->
                          <div class="textDetail">
                            <div class="text-header mt-3">
                              <span>Quy trình phỏng vấn </span>
                            </div>
                            <div class="text">
                              <span v-if="post.interviews.length > 0">
                                <span
                                  class="text"
                                  v-for="(item, idx) in post.interviews"
                                  :key="item.id"
                                >
                                  Vòng {{ idx + 1 }}: {{ item.description }}
                                  <br
                                /></span>
                              </span>
                              <span v-if="post.interviews.length <= 0"
                                >Chưa có</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-xl-5 col-12 job-infor__company">
                      <div class="companyInfor">
                        <span class="titleCompany">Thông tin công ty</span>
                      </div>
                      <div class="contentCompany">
                        <div class="d-flex flex-wrap">
                          <div
                            class="col-xl-4 col-sm-3 logo__company"
                            style="
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            "
                          >
                            <img
                              style="width: 50%"
                              :src="getImageURL(post.company.company_image)"
                            />
                          </div>
                          <div class="col-xl-8 col-sm-9 content-infor__company">
                            <div class="contentItem pt-2">
                              <h4>{{ post.company.name }}</h4>
                              <div class="itemSpan">
                                <div>
                                  <span style="font-weight: 500; color: #999"
                                    >Địa chỉ</span
                                  >
                                  <div class="detailAdss mb-2">
                                    <span>{{ post.address }}</span>
                                  </div>
                                </div>
                                <div>
                                  <span style="font-weight: 500; color: #999"
                                    >Email</span
                                  >
                                  <div class="detailAdss">
                                    <span>{{ post.company.email }}</span>
                                  </div>
                                </div>
                                <div>
                                  <span style="font-weight: 500; color: #999"
                                    >Số điện thoại</span
                                  >
                                  <div class="detailAdss">
                                    <span>{{ post.company.phone }}</span>
                                  </div>
                                </div>
                                <div>
                                  <span style="font-weight: 500; color: #999"
                                    >Website</span
                                  >
                                  <div class="detailAdss">
                                    <span>{{ post.company.website }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="aboutCompany">
                          <div
                            class="contentAbout"
                            style="white-space: pre-line"
                          >
                            <h3>Giới thiệu về công ty</h3>
                            <h6>
                              {{ post.company.introduction }}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </b-tab>
                <b-tab>
                  <template v-slot:title>
                    <span class="d-inline-block d-sm-none">
                      <i class="far fa-user"></i>
                    </span>
                    <span class="d-none d-sm-inline-block detailTextJovs"
                      >Nộp hồ sơ</span
                    >
                  </template>

                  <div id="main">
                    <div
                      class="upload-main mt-5 text-center"
                      v-if="cv_path === ''"
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.html"
                        id="inputUpload"
                        @change="uploadCV"
                        hidden
                      />
                      <div class="upload-container">
                        <h2>Tải hồ sơ của bạn lên đây</h2>
                        <p><i class="fas fa-cloud-upload-alt"></i></p>
                        <p>
                          Thông tin liên lạc của ứng viên, thông tin bí mật và
                          nhạy cảm
                        </p>
                        <p>Sẽ bị hệ thống xóa sau khi tải lên</p>
                        <p>
                          Sau khi tệp được tải lên, hệ thống sẽ nhận được một số
                          thông tin cơ bản. Vui lòng điền thông tin còn thiếu.
                        </p>
                        <button
                          type="button"
                          @click="onClickedUploadButton"
                          class="btn btn-upload btn-success"
                        >
                          <i class="fas fa-cloud-upload-alt"></i> Upload file
                          (PDF, HTML, DOCX)
                        </button>
                      </div>
                    </div>
                    <div class="col-12 d-flex" v-else>
                      <div class="bodyMain col-5 mt-3">
                        <div class="headerMain">
                          <div class="titleMain">
                            <span>Thông tin ứng viên</span>
                          </div>
                        </div>
                        <form @submit.prevent="applyJob">
                          <div class="bodyCreate">
                            <div class="formCreated">
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
                                        'is-invalid':
                                          submitted && $v.form.email.$error,
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
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
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
                                          'is-invalid':
                                            submitted && $v.form.name.$error,
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
                                          'is-invalid':
                                            submitted && $v.form.title.$error,
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
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
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
                                          'is-invalid':
                                            submitted && $v.form.phone.$error,
                                        }"
                                      />
                                      <div
                                        v-if="submitted && $v.form.phone.$error"
                                        class="invalid-feedback"
                                      >
                                        <span v-if="!$v.form.phone.required"
                                          >Số điện thoại không được bỏ trống
                                          *</span
                                        >
                                        <span v-if="!$v.form.phone.numeric">
                                          Số điện thoại không đúng định dạng *
                                        </span>
                                        <span v-if="!$v.form.phone.minLength"
                                          >Số điện thoại quá ngắn, lớn hơn bằng
                                          10 *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-6" style="padding-left: 10px">
                                    <label for=""
                                      >Khu vực làm việc mong muốn<span
                                        class="labelStar"
                                      >
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
                                            submitted &&
                                            $v.form.areaWork.$error,
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
                                        v-if="
                                          submitted && $v.form.areaWork.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span v-if="!$v.form.areaWork.required"
                                          >Khu vực làm việc không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="line"></div>
                                <div class="col-12 formCreateGroup">
                                  <label for=""
                                    >Ứng viên có thể nhận việc mới sau bao nhiêu
                                    ngày<span class="labelStar">*</span></label
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
                                          submitted &&
                                          $v.form.workAfterDay.$error,
                                      }"
                                    ></multiselect>
                                    <div
                                      v-if="
                                        submitted && $v.form.workAfterDay.$error
                                      "
                                      class="invalid-feedback"
                                    >
                                      <span
                                        v-if="!$v.form.workAfterDay.required"
                                        >Thời gian nhận việc không được bỏ trống
                                        *</span
                                      >
                                    </div>
                                  </div>
                                </div>
                                <div class="col-12 formCreateGroup">
                                  <label for=""
                                    >Đơn vị tiền tệ<span class="labelStar"
                                      >*</span
                                    ></label
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
                              <div
                                class="formCreatedContent"
                                style="margin-top: 30x"
                              >
                                <div class="col-12 formCreateGroup">
                                  <div class="col-12 d-flex">
                                    <div
                                      class="col-6"
                                      style="padding-right: 10px"
                                    >
                                      <label for=""
                                        >Mức lương (thấp nhất)
                                        <span class="labelStar">*</span></label
                                      >
                                      <div class="inputForm checkboxValue">
                                        <input
                                          type="number"
                                          placeholder="Mức lương hàng tháng"
                                          v-model="form.lowestSalary"
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
                                    <div
                                      class="col-6"
                                      style="padding-left: 10px"
                                    >
                                      <label for=""
                                        >Mức lương (cao nhất)<span
                                          class="labelStar"
                                        >
                                          *</span
                                        ></label
                                      >
                                      <div class="inputForm checkboxValue">
                                        <input
                                          type="number"
                                          v-model="form.highestSalary"
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
                                    <span
                                      v-if="
                                        form.lowestSalary > form.highestSalary
                                      "
                                      class="text-danger"
                                      >Lương thấp nhất phải thấp hơn lương cao
                                      nhất *</span
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

                                <div
                                  class="col-12 formCreateGroup"
                                  style="width: 70%"
                                >
                                  <label for="">Mức lương hiện tại</label>
                                  <div class="skipStep">
                                    <span
                                      >Bạn có thể bỏ qua mục này nếu ứng viên
                                      không đồng ý cung cấp.
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
                                        'is-invalid':
                                          submitted && $v.form.reason.$error,
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
                                    >Tại sao ứng viên thay đổi công việc và kỳ
                                    vọng của cô ấy / anh ấy là gì?<span
                                      class="labelStar"
                                      >*</span
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
                                      v-if="
                                        submitted && $v.form.expected.$error
                                      "
                                      class="invalid-feedback"
                                    >
                                      <span v-if="!$v.form.expected.required"
                                        >Mục này không được bỏ trống *</span
                                      >
                                    </div>
                                  </div>
                                </div>
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
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
                                  <div
                                    class="col-3"
                                    style="padding-right: 10px"
                                  >
                                    <label for=""
                                      >Kỹ năng ứng viên của bạn</label
                                    >
                                  </div>
                                  <div class="col-9" style="padding-left: 10px">
                                    <div
                                      class="softSkills"
                                      v-for="(skill, index) in candidate_skills"
                                      v-bind:key="index"
                                    >
                                      <!-- Block kỹ năng -->
                                      <div class="col-12 formCreateGroup">
                                        <label for=""
                                          >Kỹ năng {{ index + 1 }}
                                        </label>
                                        <div class="inputForm">
                                          <multiselect
                                            v-model="
                                              candidate_skills[index].skill_id
                                            "
                                            :options="listSkill"
                                            :custom-label="nameWithLang"
                                            placeholder="Nhập mới hoặc chọn kỹ năng"
                                            label="name"
                                            track-by="_id"
                                            :show-labels="false"
                                            :allow-empty="false"
                                          ></multiselect>
                                        </div>
                                      </div>
                                      <div
                                        class="col-12 formCreateGroup d-flex"
                                      >
                                        <div
                                          class="col-6"
                                          style="padding-right: 10px"
                                        >
                                          <label for="">Năm kinh nghiệm </label>
                                          <div class="inputForm">
                                            <input
                                              type="number"
                                              placeholder="Nhập số năm"
                                              v-model="
                                                candidate_skills[index]
                                                  .year_of_experience
                                              "
                                            />
                                          </div>
                                        </div>
                                        <div
                                          class="col-6"
                                          style="padding-left: 10px"
                                        >
                                          <label for=""
                                            >Đánh giá của bạn
                                          </label>
                                          <div class="inputForm">
                                            <input
                                              type="text"
                                              placeholder="Nhập đánh giá"
                                              v-model="
                                                candidate_skills[index].rating
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
                                            v-on:click="removeSoftSkill(index)"
                                          >
                                            <i class="fas fa-trash"></i>Xóa
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="handleAddButton"
                                      style="width: 100%"
                                    >
                                      <button
                                        type="button"
                                        style="width: 100%"
                                        v-on:click="handleAddSoftSkill"
                                      >
                                        <i class="fas fa-plus-circle"></i>Thêm
                                        kỹ năng
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <!-- Khả năng ngôn ngữ của ứng viên -->
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-3"
                                    style="padding-right: 10px"
                                  >
                                    <label for=""
                                      >Khả năng ngôn ngữ của ứng viên</label
                                    >
                                  </div>
                                  <div class="col-9" style="padding-left: 10px">
                                    <div
                                      class="softSkills"
                                      v-for="(
                                        language, index
                                      ) in candidate_languages"
                                      v-bind:key="index"
                                    >
                                      <div class="col-12 formCreateGroup">
                                        <label for=""
                                          >Ngôn ngữ {{ index + 1 }}
                                        </label>
                                        <div class="inputForm">
                                          <multiselect
                                            v-model="
                                              candidate_languages[index]
                                                .language_id
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
                                      <div
                                        class="col-12 formCreateGroup d-flex"
                                      >
                                        <div
                                          class="col-6"
                                          style="padding-right: 10px"
                                        >
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
                                        <div
                                          class="col-6"
                                          style="padding-left: 10px"
                                        >
                                          <label for=""
                                            >Đánh giá của bạn
                                          </label>
                                          <div class="inputForm">
                                            <input
                                              type="text"
                                              placeholder="Nhập đánh giá của bạn"
                                              v-model="
                                                candidate_languages[index]
                                                  .your_rating
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
                                            v-on:click="
                                              deleteVisaLanguage(index)
                                            "
                                          >
                                            <i class="fas fa-trash"></i>Xóa
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="handleAddButton"
                                      style="width: 100%"
                                    >
                                      <button
                                        type="button"
                                        style="width: 100%"
                                        v-on:click="handleAddLanguageSkill"
                                      >
                                        <i class="fas fa-plus-circle"></i>Thêm
                                        ngôn ngữ
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <!-- Kinh nghiệm làm việc -->
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-3"
                                    style="padding-right: 10px"
                                  >
                                    <label for="">Kinh nghiệm làm việc</label>
                                  </div>
                                  <div class="col-9" style="padding-left: 10px">
                                    <div
                                      class="softSkills"
                                      v-for="(
                                        skill, index
                                      ) in candidate_experiences"
                                      v-bind:key="index"
                                    >
                                      <div class="col-12 formCreateGroup">
                                        <label for="">Ngành nghề công ty</label>
                                        <div class="">
                                          <multiselect
                                            v-model="
                                              candidate_experiences[index]
                                                .industry_ids
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
                                              candidate_experiences[index]
                                                .job_role_ids
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
                                      <div
                                        class="col-12 formCreateGroup d-flex"
                                      >
                                        <div
                                          class="col-6"
                                          style="padding-right: 10px"
                                        >
                                          <label for="">Tên job</label>
                                          <div class="inputForm">
                                            <input
                                              type="text"
                                              placeholder="Nhập tên công việc"
                                              v-model="
                                                candidate_experiences[index]
                                                  .job_title
                                              "
                                            />
                                          </div>
                                        </div>
                                        <div
                                          class="col-6"
                                          style="padding-left: 10px"
                                        >
                                          <label for=""
                                            >Thời gian làm việc
                                          </label>
                                          <div class="inputForm">
                                            <input
                                              type="text"
                                              placeholder="Nhập thời gian làm việc"
                                              v-model="
                                                candidate_experiences[index]
                                                  .work_duration
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
                                            v-on:click="
                                              deleteVisaExpWork(index)
                                            "
                                          >
                                            <i class="fas fa-trash"></i>Xóa
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="handleAddButton"
                                      style="width: 100%"
                                    >
                                      <button
                                        type="button"
                                        style="width: 100%"
                                        v-on:click="handleAddExpWorking"
                                      >
                                        <i class="fas fa-plus-circle"></i>Thêm
                                        kinh nghiệm
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="bodyCreate mt-2">
                            <div class="formCreated">
                              <div class="formCreatedContent">
                                <div class="formCreateGroup">
                                  <h5>Những thông tin cần thiết</h5>
                                  <!-- <label for="">Những thông tin cần thiết</label> -->
                                  <!-- <div
                      class="inputForm addInforDiff"
                      v-for="(applicant, counter) in optional_fields"
                      v-bind:key="counter"
                    >
                      <textarea
                        id="w3review"
                        name="w3review"
                        rows="4"
                        cols="50"
                        style="width: 100%"
                        v-model="form.inforPlus"
                      ></textarea>
                    </div> -->
                                  <div
                                    v-for="optional_field in optional_fields"
                                    :key="optional_field._id"
                                  >
                                    <label for="" class="pt-1"
                                      >{{ optional_field.title }}
                                      <span class="labelStar">*</span>
                                    </label>
                                    <div
                                      v-if="optional_field.type === 'mail'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="email"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>

                                    <div
                                      v-if="optional_field.type === 'phone'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="text"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>

                                    <div
                                      v-if="optional_field.type === 'text'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="text"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>

                                    <div
                                      v-if="optional_field.type === 'integer'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="number"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>

                                    <div
                                      v-if="optional_field.type === 'float'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="number"
                                        step="any"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>

                                    <div
                                      v-if="optional_field.type === 'paragraph'"
                                      class="inputForm"
                                    >
                                      <textarea
                                        id="paragraph"
                                        name="paragraph"
                                        rows="4"
                                        cols="50"
                                        style="width: 100%"
                                        :placeholder="optional_field.hint"
                                        v-model="optional_field.value"
                                      ></textarea>
                                    </div>
                                    <div
                                      v-if="
                                        optional_field.type === 'multiselect'
                                      "
                                    >
                                      <multiselect
                                        v-model="optional_field.value"
                                        :options="
                                          getOptionList(optional_field.data)
                                        "
                                        :multiple="true"
                                        :close-on-select="false"
                                        :clear-on-select="false"
                                        :preserve-search="true"
                                        :placeholder="optional_field.hint"
                                        :preselect-first="true"
                                        :show-labels="false"
                                        :allow-empty="false"
                                      >
                                      </multiselect>
                                    </div>
                                    <div
                                      v-if="
                                        optional_field.type === 'dropdownlist'
                                      "
                                    >
                                      <multiselect
                                        v-model="optional_field.value"
                                        :options="
                                          getOptionList(optional_field.data)
                                        "
                                        :placeholder="optional_field.hint"
                                        :show-labels="false"
                                        :allow-empty="false"
                                      ></multiselect>
                                    </div>
                                    <div
                                      v-if="optional_field.type === 'date'"
                                      class="inputForm"
                                    >
                                      <input
                                        type="date"
                                        :placeholder="optional_field.hint"
                                        style="width: 100%"
                                        v-model="optional_field.value"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="actionHandleForm d-flex">
                              <div class="actionHandle">
                                <button
                                  class="btnCancel"
                                  v-on:click="cancelApplyJob"
                                >
                                  <i class="fas fa-chevron-left"></i>Hủy
                                </button>
                              </div>

                              <div class="actionHandle">
                                <button type="submit" class="btnSave">
                                  <i class="fas fa-save"></i>Nộp hồ sơ
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                      <div class="col-7 mt-5">
                        <div>
                          <iframe
                            :src="cv_url"
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
                </b-tab>
              </b-tabs>
            </div>
          </div>
        </div>
      </div>
      <div class="col"></div>
    </div>
  </div>
</template>
<style lang='scss'>
.detailTextJovs {
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
}

.jobInfor {
  margin-top: 30px;
}

.job-infor {
  &__detail {
    padding-right: 10px;
  }
  &__company {
    padding-left: 10px;
  }
}
@media (max-width: 991.98px) {
  .job-infor {
    &__detail {
      padding-right: 0;
    }
    &__company {
      margin-top: 15px;
      padding-left: 0;
    }
  }
}

@media (max-width: 576px) {
  .job-infor {
    &__company {
      .logo__company {
        width: 100%;
      }

      .content-infor__company {
        padding: 10px 15px;
      }
    }
  }
}

@media (max-width: 476px) {
  .job-infor__detail {
    .job-detail {
      .detailContent {
        .detailinforJob {
          div {
            span {
              font-size: 15px !important;
            }
          }
        }
      }
    }
  }
}

.header-detail {
  display: flex;
}
.header-detail .title-header {
  flex: 1;
}
.header-detail .title-header span {
  font-weight: 600;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
}
.header-detail .icon-header {
  display: flex;
}
.header-detail .icon-header .iconSave {
  margin-left: 20px;
  color: rgb(250, 213, 92);
  margin-right: 15px;
}
.header-detail .icon-header i {
  cursor: pointer;
  font-size: 20px;
}
.detailContent {
  border-radius: 10px;
  border: 1px solid #eae9e9;
  padding: 10px;
  background-color: #ffffff;
}
.fontTitle {
  font-family: "Roboto", sans-serif;
}
.textSalaryDetail {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: #ebf9ff;
  color: #5cd0ff;
}
.workText {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: #fee2e4;
  color: #fd778e;
}
.textLevelJob {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: rgba(241, 230, 255, 0.884);
  color: rgba(197, 147, 255, 0.884);
  margin-right: 5px;
}
.roleJob {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  margin-right: 6px;
  font-family: "Roboto", sans-serif;
  background-color: rgba(255, 245, 203, 0.904);
  color: rgb(250, 211, 36);
}
.language {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: rgb(231, 252, 232);
  margin-right: 6px;
  color: rgb(103, 255, 111);
}
.textLocation {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: rgb(226, 235, 253);

  color: rgb(13 70 174);
}
.textSkill {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: rgb(226, 235, 253);

  color: rgb(125, 171, 255);
}
.textGuarantee {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: rgb(187, 184, 40);

  color: rgb(102, 109, 6);
}
.badgeStatus {
  border: 1px solid #e60000 !important;
  background: #ffe5e5;
  color: #e60000;
}
.textDetail {
  border-top: 1px solid #eae9e9;
}
.textDetail .text-header {
  font-family: "Roboto", sans-serif;
  font-size: 20px;
  color: rgb(110, 110, 110);
  font-weight: 600;
  margin-bottom: 10px;
}

.companyInfor .titleCompany {
  font-weight: 600;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
}
.contentCompany {
  border-radius: 10px;
  border: 1px solid #eae9e9;
  padding: 8px;
  background-color: #ffffff;
  height: auto;
}
.contentCompany .contentItem {
  font-weight: 600;
  font-family: "Roboto", sans-serif;
}
.contentCompany .aboutCompany {
  margin-top: 15px;
  border-top: 1px solid #eae9e9;
}
.contentCompany .aboutCompany .contentAbout {
  margin-top: 5px;
  font-weight: 600;
  font-family: "Roboto", sans-serif;
}
.contentCompany .aboutCompany .contentAbout h3 {
  color: rgb(110, 110, 110);
}
.contentCompany .aboutCompany .contentAbout h6 {
  line-height: 22px;
  margin: 10px 0;
  color: rgb(39, 39, 39);
}
.contentCompany .logo {
  height: 115px;
  width: 115px;
  border-radius: 4px;
  padding: 5px;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url("https://travel.com.vn/Images/vtv-logo.png");
}
.header__post-detail {
  &__handle {
    @media (max-width: 910px) {
      margin-top: 15px;
      width: 100%;
    }

    @media (max-width: 476px) {
      .handleUpdateStatusJob__input {
        width: 100% !important;
        margin-right: 0 !important;
        margin-bottom: 5px;
      }
      .handleUpdateStatusJob__btn {
        width: 50%;

        button {
          justify-content: center;
          width: 100%;
        }
      }

      .handleCreatedJob {
        width: calc(50% - 10px);

        button {
          justify-content: center;
          width: 100%;
        }
      }
    }

    @media (max-width: 345px) {
      .handleUpdateStatusJob__input,
      .handleUpdateStatusJob__btn,
      .handleCreatedJob {
        width: 100%;
      }

      .handleUpdateStatusJob__btn {
        margin-right: 0 !important;
        margin-bottom: 5px;
      }
    }
  }
}
.titleInfomation .textHeader {
  align-items: center;
}
.titleInfomation .textHeader .textHeaderTitle {
  font-size: 20px;
  font-weight: 600;
  font-family: "Roboto", sans-serif;
}
.titleInfomation .textHeader .status__post-detail {
  display: flex;
  align-items: center;
  height: 20px;
  color: white;
  margin: 0 5px;

  span {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    padding: 0 10px;
    border-radius: 25px;

    font-family: "Roboto", sans-serif;
  }
}

.titleInfomation .salaryText .bonus {
  font-size: 14px;
  color: #34c38f;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
}
.titleInfomation .salaryText .bonus span {
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #000;
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
.headerMain {
  display: flex;
  margin-bottom: 12px;
  .titleMain {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    span {
    }
  }
  .handleMain {
    display: flex;
    .btnhandle {
      margin-right: 10px;
      button {
        transition: all 0.2s ease-in-out;
        outline: none !important;
        border: none;
        padding: 6px 15px;
        font-size: 15px;
        font-family: "Roboto", sans-serif;
        border-radius: 10px;

        -webkit-box-shadow: 0px 1px 8px -2px rgba(0, 0, 0, 0.75);
        -moz-box-shadow: 0px 1px 8px -2px rgba(0, 0, 0, 0.75);
        box-shadow: 0px 1px 8px -2px rgba(0, 0, 0, 0.75);
      }
      .btnSelect {
        background-color: #1aa94c;
        color: #fff;
        &:hover {
          background-color: #0ebd4b;
        }
      }
      .btnAdd {
        background-color: #fdb327;
        color: #08090a;
        &:hover {
          background-color: #faa912;
        }
        i {
          margin-right: 5px;
        }
      }
    }
  }
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
  color: #555;
  .titleRefer {
    color: rgb(27, 27, 27);
  }
}
.actionHandleForm {
  justify-content: flex-end;

  z-index: 999;

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
</style>
