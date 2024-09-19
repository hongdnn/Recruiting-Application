<script>
import { FormWizard, TabContent } from "vue-form-wizard";
import "vue-form-wizard/dist/vue-form-wizard.min.css";
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { mapGetters, mapActions, mapState } from "vuex";
import Multiselect from "vue-multiselect";
import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
} from "vuelidate/lib/validators";
import Swal from "sweetalert2";
/**
 * Form wizard component
 */

export default {
  page: {
    title: "Tạo Công Việc",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    //DatePicker,
    FormWizard,
    TabContent,
    PageHeader,
    Layout,
    Multiselect,
  },

  data() {
    return {
      lowestSalary: null,
      highestSalary: null,
      isValidateSalary: false,
      typeInterview: ["online", "face to face", "phone"],
      selectCompany: "",
      selectIndustry: "",
      selectJobRoles: [],
      selectedJobRoles: "",
      selectedJobLevel: "",
      selectCities: "",
      selectedCities: "",
      selectJobs: "",
      bonusStartDate: "",
      bonusEndDate: "",
      selectFunctions: "",
      selectSkills: [],
      selectedSkills: "",
      selectLanguages: [],
      selectedLanguages: "",
      selectedPackages: [],
      valueTags: null,
      limitTag: 10,
      urgencyList: [
        { title: "Có", value: true },
        { title: "Không", value: false },
      ],
      educationLevel: [
        "bachelor",
        "master",
        "phD",
        "doctor",
        "intermediate",
        "high school graduated",
      ],
      jobLevel: [
        "Quản Lý Điều Hành",
        "Quản Lý Cao Cấp",
        "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp",
        "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát",
        "Chuyên Gia / Có Kinh Nghiệm",
        "Mới Ra Trường / Thực Tập",
      ],
      typeWork: ["Fulltime", "Parttime"],
      dataType: [
        "mail",
        "phone",
        "text",
        "integer",
        "float",
        "paragraph",
        "multiselect",
        "dropdownlist",
        "date",
      ],
      guaranteeList: [
        "Bảo hành toàn diện",
        "Không bảo hành",
        "Bảo hành theo giai đoạn",
      ],
      currencies: ["VND", "USD"],
      post: {
        city_ids: [],
        job_role_ids: [],
        skill_ids: [],
        language_ids: [],
        keywords: [],
        industry_id: "",
        function_id: "",
        job_id: "",
        title: "",
        user_id: "",
        country_id: "58cca4efde4c3e096a4c32af",
        date_off: 0,
        date_end: 0,
        full_name: "",
        job_level: [],
        email: "",
        phone: "",
        content: "",
        require: "",
        benefit: "",
        salary_from: null,
        salary_to: null,
        negotiable: false,
        type_work: "",
        company_id: "",
        notice_for_referrer: "",
        address: "",
        require_number: "",
        commission: "",
        currency: "VND",
        education_level: "",
        guarantee_type: "",
        guarantee: 50,
        guarantee_date: "",
        urgency: false,
        security: false,
        optional_fields: [
          {
            type: "",
            title: "",
            hint: "",
            data: [""],
          },
        ],
        interviews: [
          {
            type: "",
            stage: 1,
            stage_description: "",
          },
        ],
        packages: [],
        bonus: "",
        bonus_start_date: "",
        bonus_end_date: "",
      },
      jobRoles: [],
      submitted: false,
      tryingToGetProfile: false,
      isGetProfileError: false,
      title: "Tạo công việc",
    };
  },
  validations: {
    bonusStartDate: {
      required,
    },
    bonusEndDate: {
      required,
    },
    selectedCities: {
      required,
    },
    selectCompany: {
      required,
    },
    selectIndustry: {
      required,
    },
    selectFunctions: {
      required,
    },
    selectJobs: {
      required,
    },

    applicant: {
      title: {
        required,
      },
      type: {
        required,
      },
    },

    post: {
      optional_fields: {
        title: {
          required,
        },
      },
      email: {
        required,
        email,
      },
      full_name: {
        required,
      },
      title: {
        required,
      },
      phone: {
        required,
        minLength: minLength(10),
        maxLength: maxLength(20),
      },
      keywords: {
        required,
        maxLength: maxLength(10),
        minLength: minLength(2),
      },
      city_ids: {
        required,
      },
      industry_id: {
        required,
      },
      function_id: {
        required,
      },
      job_id: {
        required,
      },
      job_role_ids: {
        required,
      },
      job_level: {
        required,
      },
      salary_from: {
        required,
        numeric,
      },
      salary_to: {
        required,
        numeric,
      },
      require: {
        required,
      },
      urgency: {
        required,
      },
      date_end: {
        required,
      },
      date_off: {
        required,
      },
      security: {
        required,
      },
      education_level: {
        required,
      },
      type_work: {
        required,
      },
      content: {
        required,
      },

      require_number: {
        required,
        numeric,
      },
      benefit: {
        required,
      },
      address: {
        required,
      },
      applicant_title: {
        required,
      },
      applicant_type: {
        required,
      },
      date_on: {
        required,
      },
      max_value: {
        required,
      },
      min_value: {
        required,
      },

      counter_data: {
        required,
      },
      interview_type: {
        required,
      },
      commission: {
        required,
      },
      bonus: {
        required,
      },
      bonusStartDate: {
        required,
      },
      bonusEndDate: {
        required,
      },
      guarantee_type: {
        required,
      },
      guarantee: {
        required,
      },
      guarantee_date: {
        required,
      },
    },
  },

  computed: {
    ...mapGetters("company", [
      //   "getPost",
      "getCompanyGetter",
      "getIndustryGetter",
      "getJobRolesGetter",
      "getFunctionGetter",
      "getJobGetter",
      "getSkillsGetter",
      "getLanguagesGetter",
      "getCityGetter",
    ]),
    ...mapState("company", [
      //  "postData",
      "company_data",
      "industry_data",
      "job_role_data",
      "job_data",
      "skill_data",
      "function_data",
      "language_data",
      "city_data",
    ]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
    dataCompany() {
      return this.getCompanyGetter;
    },
    dataIndustry() {
      return this.getIndustryGetter;
    },
    dataJobRole() {
      return this.getJobRolesGetter;
    },
    dataJob() {
      return this.getJobGetter;
    },
    dataFunction() {
      return this.getFunctionGetter;
    },
    dataSkill() {
      return this.getSkillsGetter;
    },
    dataLanguage() {
      return this.getLanguagesGetter;
    },
    dataCity() {
      return this.getCityGetter;
    },
  },
  watch: {
    data(newValue) {
      this.user = newValue;
    },
    salary_from: function () {
      if (parseInt(this.post.salary_from) < parseInt(this.post.salary_to)) {
        this.isValidateSalary = false;
      } else {
        this.isValidateSalary = true;
      }
    },
    salary_to: function () {
      if (parseInt(this.post.salary_from) < parseInt(this.post.salary_to)) {
        this.isValidateSalary = false;
      } else {
        this.isValidateSalary = true;
      }
    },
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      //Get companies
      switch (mut.type) {
        case "company/packageSuccess": {
          //Get all question packages
          this.post.packages = state.company.package_data.data;
          break;
        }
        case "company/createPostSuccess": {
          Swal.fire("Tạo công việc thành công", "", "success").then(() => {
            this.navigateToPostDetailScreen(state.company.createdPost.data._id);
          });
          break;
        }
        case "company/createPostFailure": {
          Swal.fire("Tạo công việc thất bại", "", "error").then(() => {});
          break;
        }
      }
    });
  },
  mounted() {
    this.getCompany();
    this.getIndustry();
    this.getSkill();
    this.getLanguage();
    this.getCity();
    this.getPackages();
  },
  methods: {
    ...mapActions("company", [
      "getCompanyInformation",
      "getIndustryInformation",
      // "getJobInformation",
      "getSkillInformation",
      // "getFunctionInformation",
      "getLanguageInformation",
      "getIndustryWithoutFunctionAndJob",
      "getFunctionsInformationByIndustry",
      "getJobRoleByFunction",
      "getCityInformation",
      "getJobsByFunction",
      "createPost",
      "getQuestionPackages",
    ]),
    getPackages() {
      this.getQuestionPackages();
    },

    navigateToPostDetailScreen(post_id) {
      this.$router.push({
        path: "/post-detail?id=" + post_id,
      });
    },

    async removeSelectJobs(industry) {
      await this.getFunctionsInformationByIndustry(industry.id);
      this.post.function_id = this.dataFunction.functions;
      this.selectJobs = "";
      this.selectedJobRoles = "";
      this.jobRoles = [];
    },
    async changeStatusFunction(myFunction) {
      await this.getJobsByFunction(myFunction.id);
      await this.getJobRoleByFunction(myFunction.id);
      this.jobRoles = this.dataJobRole.job_role;
    },
    inputValueJobRole(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectJobRoles = result;
    },
    inputValueCity(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value.id);
      });

      this.selectCities = result;
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
    addVisa() {
      this.post.optional_fields.push({
        type: "",
        title: "",
        hint: "",
        data: [""],
      });
    },
    deleteVisa(counter) {
      this.post.optional_fields.splice(counter, 1);
    },
    addMoreOption(counter) {
      this.post.optional_fields[counter].data.push("");
    },
    deleteOptionInData(counter, count) {
      this.post.optional_fields[counter].data.splice(count, 1);
    },
    addInterview() {
      this.post.interviews.push({
        type: "",
        stage: "",
        stage_description: "",
      });
    },
    deleteInterview(counter) {
      this.post.interviews.splice(counter, 1);
    },
    fillCompanyInfo() {
      this.post.full_name = this.selectCompany.contact_name;
      this.post.email = this.selectCompany.email;
      this.post.phone = this.selectCompany.phone;
    },

    onComplete: function () {
      this.savePost();
    },

    async getCompany() {
      await this.getCompanyInformation();
      this.post.company_id = this.dataCompany.companies;
    },

    async getIndustry() {
      await this.getIndustryWithoutFunctionAndJob();
      this.post.industry_id = this.dataIndustry.industries;
    },

    async getJob() {
      await this.getJobInformation();
      this.post.job_id = this.dataJob.jobs;
    },
    
    async getSkill() {
      await this.getSkillInformation();
      this.post.skill_ids = this.dataSkill.skills;
    },
    async getLanguage() {
      await this.getLanguageInformation();
      this.post.language_ids = this.dataLanguage.languages;
    },
    async getCity() {
      await this.getCityInformation();
      this.post.city_ids = this.dataCity.cities;
    },
    async savePost() {
      let user = JSON.parse(localStorage.getItem("user"));
      if (this.post.negotiable === true) {
        this.post.salary_from = 0;
        this.post.salary_to = 0;
      }
      let optionFieldResult = [];
      for (let optField of this.post.optional_fields) {
        optionFieldResult.push({
          type: optField.type,
          title: optField.title,
          hint: optField.hint,
          data: optField.data,
          min_value: optField.min_value,
          max_value: optField.max_value,
        });
      }
      for (let optField of optionFieldResult) {
        if (optField.type !== "date" && optField.type !== "paragraph") {
          delete optField.min_value;
          delete optField.max_value;
        }
        if (
          optField.type !== "multiselect" &&
          optField.type !== "dropdownlist"
        ) {
          delete optField.data;
        } else {
          let optionAnswers = optField.data[0];
          for (let i = 1; i < optField.data.length; i++) {
            optionAnswers += ";" + optField.data[i];
          }
          optField.data = optionAnswers;
        }
      }
      let postData = {
        city_ids: this.selectCities,
        job_role_ids: this.selectJobRoles,
        skill_ids: this.selectSkills,
        language_ids: this.selectLanguages,
        keywords: this.post.keywords,
        industry_id: this.selectIndustry.id,
        function_id: this.selectFunctions.id,
        job_id: this.selectJobs.id,
        title: this.post.title,
        user_id: user.data.id,
        country_id: this.post.country_id,
        date_off: this.post.date_off,
        date_end: this.post.date_end,
        full_name: this.post.full_name,
        job_level: this.post.job_level[0],
        email: this.post.email,
        phone: this.post.phone,
        content: this.post.content,
        require: this.post.require,
        benefit: this.post.benefit,
        salary_from: parseInt(this.post.salary_from),
        salary_to: parseInt(this.post.salary_to),
        negotiable: this.post.negotiable,
        type_work: this.post.type_work,
        company_id: this.selectCompany.id,
        notice_for_referrer: this.post.notice_for_referrer,
        address: this.post.address,
        require_number: parseInt(this.post.require_number),
        commission: parseInt(this.post.commission),
        currency: this.post.currency,
        education_level: this.post.education_level,
        guarantee_type: this.post.guarantee_type,
        urgency: this.post.urgency,
        security: this.post.security,
      };
      if (postData.guarantee_type !== "Không bảo hành") {
        postData.guarantee = parseInt(this.post.guarantee);
        postData.guarantee_date = parseInt(this.post.guarantee_date);
      }
      if (this.selectedPackages.length > 0) {
        postData.question_packages = this.selectedPackages;
      }
      if (postData.urgency) {
        if (this.post.bonus.trim() !== "") {
          postData.bonus = parseInt(this.post.bonus);
        }
        if (this.post.bonus_start_date !== "") {
          postData.bonus_start_date = this.post.bonus_start_date;
        }
        if (this.post.bonus_end_date !== "") {
          postData.bonus_end_date = this.post.bonus_end_date;
        }
      }
      for (let i = 1; i < this.post.job_level.length; i++) {
        postData.job_level += ";" + this.post.job_level[i];
      }
      if (optionFieldResult[0] !== undefined) {
        if (optionFieldResult[0].type !== "") {
          postData.optional_fields = optionFieldResult;
        }
      }
      if (this.post.interviews[0] !== undefined) {
        if (this.post.interviews[0].type !== "") {
          postData.interviews = this.post.interviews;
        }
      }
      if (postData) {
        if (this.isValidateSalary) {
          return;
        }

        this.submitted = true;
        this.$v.$touch();
        await this.createPost(postData);
      }
    },
    inputGuaranteeDate: function (event) {
      const value = event.target.value;
      this.post.guarantee_date = value;
    },
    changeDateOfPost: function (event, number) {
      const value = event.target.value;
      const date = new Date(value).getTime();
      if (number === 1) {
        this.post.date_off = date;
      } else if (number === 2) {
        this.post.bonus_start_date = date;
      } else if (number === 3) {
        this.post.bonus_end_date = date;
      } else if (number === 4) {
        this.post.date_end = date;
      }
    },
    convertDate: function (event, counter, number) {
      const value = event.target.value;
      const date = new Date(value).getTime();
      if (number === 0) {
        this.post.optional_fields[counter].min_value = date;
      } else {
        this.post.optional_fields[counter].max_value = date;
      }
    },
    checkForm: function (e) {
      if (this.user.first_name && this.user.last_name) return true;
      this.errors = [];
      if (!this.name) this.errors.push("Name required.");
      if (!this.age) this.errors.push("Age required.");
      e.preventDefault();
    },
    addTag(newTag) {
      const tag = {
        name: newTag,
        id: newTag.substring(0, 2) + Math.floor(Math.random() * 10000000),
      };
      this.user.job_roles.push(tag);
      this.dataDropdown.push(tag);
    },
  },
  middleware: "authentication",
};
</script>
<style  lang='scss'>
.tag-container {
  border: 2px solid #ccc;
  border-radius: 3px;
  background: #fff;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 6px;
}
.tag-container .tag {
  height: 30px;
  margin: 5px;
  padding: 5px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #eee;
  display: flex;
  align-items: center;
  color: #333;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2), inset 0 1px 1px #fff;
  cursor: default;
}
.tag i {
  font-size: 16px;
  color: #666;
  margin-left: 5px;
}
.tag-container input {
  padding: 5px;
  font-size: 16px;
  border: 0;
  outline: none;
  font-family: "Rubik";
  color: #333;
  flex: 1;
}
.card-title {
  color: #363636;
  font-size: 19px;
  font-weight: bold;
  font-family: "Roboto", sans-serif !important;
}
.roundPv {
  color: #686767;
  font-size: 18px;
  font-weight: bold;
  font-family: "Roboto", sans-serif !important;
}
.readonly,
.readonly1 {
  pointer-events: none;
  background-color: rgb(100, 100, 100);
}
.title-tab {
  margin: 0 auto;
  margin-bottom: 1.25rem;
  @media (min-width: 768px) {
    width: 70%;
  }
}

.createPostMain {
  margin: 0 auto;
  padding: 20px 15px;
  border-radius: 10px;
  border: 1px solid #ccccccd5;
  @media (min-width: 768px) {
    width: 70%;
  }
}
.titleJobs {
  font-family: "Roboto", sans-serif !important;
  color: rgb(104, 103, 103);
  font-size: 18px;
}
.wizard-icon-container {
  border-radius: 50% !important;
}

.wizard-card-footer {
  margin-top: 30px !important;
  display: block;
  @media (min-width: 768px){
    width: 70%;
    margin: 0 auto;
  }
  @media (max-width: 376px){
    .wizard-footer-left,
    .wizard-footer-right{
      span{
        button {
          padding: 5px 20px;
          min-width: unset;
        }
      }
    }
  }
}
.remove-tag {
  position: absolute;
  top: 1px;
  right: 1px;
  color: #d40c0cdb;
  padding: 0px;
}
.createPostContent {
  .formPostGroup {
    font-weight: bold;
    margin-bottom: 10px;
    font-weight: 500;
    font-family: "Roboto", sans-serif;
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
#visa {
  margin: 20px auto;
  max-width: 700px;
}
.buttonHandle {
  display: flex;
  justify-content: flex-end;
}
.btnAddinfor {
  font-size: 16px;
  padding: 0.4rem 1.3rem;
  text-align: center;
  border: 1px solid #1aa94c;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 7px;

  background-color: #1aa94c;
  color: #fff;
  display: flex;
  justify-content: flex-end;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
}
.btnAddinfor:hover {
}

.previous {
}
.addInforDiff {
  margin-bottom: 10px;
}
.addInforDiff .close {
  position: absolute;
  right: 0;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease-in-out;
  padding-right: 20px;
}
.addInforDiff .close i:hover {
  color: #002518b6;
}
.addInforDiff {
  background-image: none !important;
}

.handleAddInforDif {
  align-items: center;
}
.handleAddInforDif .label {
  flex: 1;
  /* padding: 10px; */
}

.createPostMain{
  .createPost__left {
    @media (min-width: 768px){
      padding-right: 10px;
    }
  }
  .createPost__middle {
    @media (min-width: 768px){
      padding: 0 10px;
    }
  }
  .createPost__right {
    @media (min-width: 768px){
      padding-left: 10px !important;
    }
  }
}
.title-tab{
   color: #5b73e8;
   font-weight: bold;
}
</style>
<template>
  <Layout>
    <PageHeader :title="title" />
    <div class="row">
      <div class="col-xl-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">Các bước tạo việc</h4>
            <form-wizard
              @on-complete="onComplete"
              next-button-text="Kế tiếp"
              back-button-text="Trở về"
              finish-button-text="Hoàn thành"
              color="#5b73e8"
            >
              <tab-content icon="mdi mdi-account-circle">
                

                <div id="createPost">
                  <h5 class="title-tab">
                    1. Thông tin chung
                  </h5>
                  <div class="createPostMain">
                    <div class="createPostContent">
                      <h5 style="font-weight: bold" class="titleJobs">
                        Thông tin công việc
                      </h5>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Tên công việc <span class="labelStar">*</span>
                          </label>
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.title"
                              :class="{
                                'is-invalid': submitted && $v.post.title.$error,}"
                            />
                            <div
                              v-if="submitted && $v.post.title.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.title.required"
                                >Tên công việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="userName"
                            >Chọn công ty
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <select
                              class=""
                              v-model="selectCompany"
                              @change="fillCompanyInfo"
                              style="width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.selectCompany.$error,
                              }"
                            >
                              <option
                                v-bind:value="company"
                                v-for="company in post.company_id"
                                :key="company.id"
                              >
                                {{ company.name }}
                              </option>
                            </select>
                            <div
                              v-if="submitted && $v.selectCompany.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.selectCompany.required"
                                >Công ty không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-4 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Người liên hệ
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.full_name"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.full_name.$error,}"
                            />
                            <div
                              v-if="submitted && $v.post.full_name.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.full_name.required"
                                >Người liên hệ không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4 col-12 createPost__middle">
                          <label class="col-form-label" for="confirmpass"
                            >Email công ty
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.email"
                              :class="{
                                'is-invalid': submitted && $v.post.email.$error,}"
                            />
                            <div
                              v-if="submitted && $v.post.email.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.email.required"
                                >Email không được bỏ trống *</span
                              >
                              <span v-if="!$v.post.email.email"
                                >Email không đúng định dạng *</span
                              >
                            </div>
                          </div>
                        </div>

                        <div class="col-md-4 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Số điện thoại
                            <span class="labelStar">*</span></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.phone"
                              :class="{
                                'is-invalid': submitted && $v.post.phone.$error,}"
                            />
                            <div
                              v-if="submitted && $v.post.phone.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.phone.required"
                                >Số điện thoại không được bỏ trống *</span
                              >
                              <span
                                v-if="
                                  !$v.post.phone.maxLength ||
                                  !$v.post.phone.minLength"
                              >
                                Số điện thoại chỉ được phép nhập từ 10 đến 20 kí
                                tự
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formPostGroup">
                        <span class="titleForm"
                          >Công việc phải bao gồm các từ khóa sau (2-10 từ khóa)
                          <span style="color: red" class="labelStar"
                            >*</span
                          ></span
                        >
                        <div class="d-flex">
                          <div class="col-12" style="padding-right: 5px">
                            <div class="formInput" style="width: 100%">
                              <b-form-tags
                                v-model="post.keywords"
                                no-outer-focus
                                class="mb-2"
                              >
                                <template
                                  v-slot="{
                                    tags,
                                    inputAttrs,
                                    inputHandlers,
                                    removeTag,
                                  }"
                                >
                                  <b-input-group
                                    aria-controls="my-custom-tags-list"
                                  >
                                    <input
                                      v-bind="inputAttrs"
                                      v-on="inputHandlers"
                                      placeholder="Từ khóa"
                                      class="form-control"
                                      :class="{
                                        'is-invalid':
                                          submitted && $v.post.keywords.$error,
                                      }"
                                    />
                                    <div
                                      v-if="
                                        submitted && $v.post.keywords.$error
                                      "
                                      class="invalid-feedback"
                                    >
                                      <span v-if="!$v.post.keywords.required"
                                        >Từ khóa không được bỏ trống *</span
                                      >
                                      <span
                                        v-if="
                                          !$v.post.keywords.maxLength ||
                                          !$v.post.keywords.minLength
                                        "
                                      >
                                        Từ khóa chỉ được phép nhập từ 2 đến 10
                                        kí tự
                                      </span>
                                    </div>
                                  </b-input-group>
                                  <ul
                                    id="my-custom-tags-list"
                                    class="
                                      list-unstyled
                                      d-inline-flex
                                      flex-wrap
                                      mb-0
                                    "
                                    aria-live="polite"
                                    aria-atomic="false"
                                    aria-relevant="additions removals"
                                  >
                                    <b-card
                                      v-for="tag in tags"
                                      :key="tag"
                                      :id="`my-custom-tags-tag_${tag.replace(
                                        /\s/g,
                                        '_'
                                      )}_`"
                                      tag="li"
                                      class="mt-1 mr-1"
                                      body-class="py-1 pr-2 text-nowrap"
                                    >
                                      <strong>{{ tag }}</strong>
                                      <b-button
                                        class="remove-tag"
                                        @click="removeTag(tag)"
                                        variant="link"
                                        size="sm"
                                        :aria-controls="`my-custom-tags-tag_${tag.replace(
                                          /\s/g,
                                          '_'
                                        )}_`"
                                        >x</b-button
                                      >
                                    </b-card>
                                  </ul>
                                </template>
                              </b-form-tags>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-4 col-12 createPost__left">
                          <label class="col-form-label"
                            >Chọn ngành
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class=""
                              v-model="selectIndustry"
                              @change="removeSelectJobs(selectIndustry)"
                              style="width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.selectIndustry.$error,
                              }"
                            >
                              <option
                                v-bind:value="industry"
                                v-for="industry in post.industry_id"
                                v-bind:key="industry.id"
                              >
                                {{ industry.name }}
                              </option>
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
                        <div class="col-md-4 col-12 createPost__middle">
                          <label class="col-form-label" for="confirmpass"
                            >Chọn phòng ban
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class=""
                              v-model="selectFunctions"
                              style="width: 100%"
                              @change="changeStatusFunction(selectFunctions)"
                              :class="{
                                'is-invalid':
                                  submitted && $v.selectFunctions.$error,
                              }"
                            >
                              <option
                                v-for="f in this.post.function_id"
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

                        <div class="col-md-4 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Chọn vị trí công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class="addClass"
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
                                >Phòng ban không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Vai trò công việc</label>
                          <div class="">
                            <multiselect
                              class="addClass readonly2"
                              @input="inputValueJobRole"
                              v-model="selectedJobRoles"
                              :options="jobRoles"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ selectedJobRoles.name }}</multiselect
                            >
                          </div>
                        </div>

                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Cấp bậc công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >

                          <div class="">
                            <multiselect
                              v-model="post.job_level"
                              :options="jobLevel"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              :close-on-select="false"
                              :clear-on-select="false"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.job_level.$error,
                              }"
                            ></multiselect>
                            <div
                              v-if="submitted && $v.post.job_level.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.job_level.required"
                                >Cấp bậc công việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- <div class="col-12 formPostGroup">
                        <label class="col-form-label" for="confirmpass"
                          >Công việc bao gồm các từ khóa sau</label
                        >
                        <div class="inputForm">
                            <input type="text">
                        </div>
                      </div> -->
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Lương thương lượng</label
                          >
                          <div class="col mt-2">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              v-model="post.negotiable"
                            />
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Loại tiền tệ</label
                          >
                          <div class="inputForm">
                            <select
                              class=""
                              v-model="post.currency"
                              style="width: 100%"
                            >
                              <option
                                v-for="currency in currencies"
                                v-bind:key="currency"
                              >
                                {{ currency }}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap"
                        v-if="post.negotiable === false"
                      >
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Lương thấp nhất
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              v-model="post.salary_from"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.salary_to.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.salary_to.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.salary_to.required"
                                >Lương thấp nhất không được bỏ trống *</span
                              >
                            </div>
                          </div>
                          <!-- <span v-if="isValidateSalary" class="text-danger"
                            >Lương thấp nhất phải thấp hơn lương cao nhất
                            *</span
                          > -->
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Lương cao nhất
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >

                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              v-model="post.salary_to"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.salary_to.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.salary_to.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.salary_to.required"
                                >Lương cao nhất không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <div class="row mb-3">
                            <label class="col-form-label" for="email"
                              >Số lượng cần tuyển
                              <span style="color: red" class="labelStar"
                                >*</span
                              ></label
                            >
                            <div class="inputForm">
                              <input
                                type="number"
                                v-model="post.require_number"
                                :class="{
                                  'is-invalid':
                                    submitted && $v.post.require_number.$error,
                                }"
                              />
                              <div
                                v-if="
                                  submitted && $v.post.require_number.$error
                                "
                                class="invalid-feedback"
                              >
                                <span v-if="!$v.post.require_number.required"
                                  >Số lượng cần tuyển không được bỏ trống
                                  *</span
                                >
                                <span v-if="!$v.post.require_number.numeric">
                                  Số lượng cần tuyển không đúng định dạng *
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Tuyển gấp</label
                          >
                          <div class="inputForm">
                            <select v-model="post.urgency" style="width: 100%">
                              <option
                                v-for="urgen in urgencyList"
                                v-bind:key="urgen.value"
                                v-bind:value="urgen.value"
                              >
                                {{ urgen.title }}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Hạn nộp CV
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              type="date"
                              v-on:input="changeDateOfPost($event, 4)"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.date_end.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.date_end.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.date_end.required"
                                >Hạn nộp CV không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Ngày kết thúc tuyển dụng
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              type="date"
                              v-on:input="changeDateOfPost($event, 1)"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.date_off.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.date_off.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.date_off.required"
                                >Ngày kết thúc tuyển dụng không được bỏ trống
                                *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-6">
                          <div class="row mb-3">
                            <label class="col-form-label" for="email"
                              >Bảo mật
                              <span style="color: red" class="labelStar"
                                >*</span
                              ></label
                            >
                            <div class="inputForm">
                              <select
                                v-model="post.security"
                                style="width: 100%"
                              >
                                <option
                                  v-for="urgen in urgencyList"
                                  v-bind:key="urgen.value"
                                  v-bind:value="urgen.value"
                                >
                                  {{ urgen.title }}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="createPost" class="mt-4">
                  <div class="createPostMain">
                    <div class="createPostContent">
                      <h5 style="font-weight: bold" class="titleJobs">
                        Yêu cầu & Kĩ năng công việc
                      </h5>

                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Giáo dục
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              v-model="post.education_level"
                              style="width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.education_level.$error,
                              }"
                            >
                              <option
                                v-for="edu in educationLevel"
                                v-bind:key="edu"
                              >
                                {{ edu }}
                              </option>
                            </select>
                            <div
                              v-if="submitted && $v.post.education_level.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.education_level.required"
                                >Giáo dục không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Ngôn ngữ</label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueLanguage"
                              v-model="selectedLanguages"
                              :options="post.language_ids"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ selectedLanguages.name }}</multiselect
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-md-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Kĩ năng</label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueSkill"
                              v-model="selectedSkills"
                              :options="post.skill_ids"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ selectedSkills.name }}</multiselect
                            >
                          </div>
                        </div>

                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Hình thức làm việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              v-model="post.type_work"
                              style="width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.type_work.$error,
                              }"
                            >
                              <option
                                v-for="type in typeWork"
                                v-bind:key="type"
                              >
                                {{ type }}
                              </option>
                            </select>
                            <div
                              v-if="submitted && $v.post.type_work.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.type_work.required"
                                >Hình thức làm việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12 createPost__left">
                          <label class="col-form-label" for="confirmpass"
                            >Tổng quan công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm" style="width::100%">
                            <textarea
                              id="userName"
                              type="text"
                              v-model="post.content"
                              style="height: 5rem; width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.content.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.content.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.content.required"
                                >Tổng quan công việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6 col-12 createPost__right">
                          <label class="col-form-label" for="confirmpass"
                            >Yêu cầu công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm" style="width::100%">
                            <textarea
                              id="userName"
                              type="text"
                              v-model="post.require"
                              style="height: 5rem; width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.require.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.require.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.require.required"
                                >Yêu cầu công việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-12">
                          <label class="col-form-label" for="confirmpass"
                            >Lợi ích công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm" style="width::100%">
                            <textarea
                              id="userName"
                              type="text"
                              v-model="post.benefit"
                              style="height: 5rem; width: 100%"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.benefit.$error,
                              }"
                            ></textarea>
                            <div
                              v-if="submitted && $v.post.benefit.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.benefit.required"
                                >Lợi ích công việc không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="createPost " class="mt-4">
                  <div class="createPostMain">
                    <div class="createPostContent">
                      <h5 style="font-weight: bold" class="titleJobs">
                        Địa điểm & ghi chú
                      </h5>

                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-md-8 col-12">
                          <label class="col-form-label" for="confirmpass"
                            >Địa điểm
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueCity"
                              v-model="selectedCities"
                              :options="post.city_ids"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :class="{
                                'is-invalid':
                                  submitted && $v.selectedCities.$error,
                              }"
                              >{{ selectedCities.name }}</multiselect
                            >
                            <div
                              v-if="submitted && $v.selectedCities.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.selectedCities.required"
                                >Địa điểm không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formPostGroup d-flex flex-wrap">
                        <div class="col-12">
                          <label class="col-form-label" for="confirmpass"
                            >Địa điểm làm việc cụ thể
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              v-model="post.address"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.address.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.address.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.address.required"
                                >Địa điểm làm việc cụ thể không được bỏ trống
                                *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formPostGroup">
                        <label class="col-form-label" for="confirmpass"
                          >Ghi chú cho cộng tác viên</label
                        >
                        <div class="inputForm" style="width: 100%">
                          <textarea
                            type=""
                            name="name"
                            value="Francis"
                            style="height: 5rem; width: 100%"
                            v-model="post.notice_for_referrer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="createPost " class="mt-4">
                  <div class="createPostMain">
                    <div class="createPostContent">
                      <div class="col-12 formPostGroup">
                        <div class="row mb-3">
                          <h5 style="font-weight: bold" class="titleJobs">
                            Những thông tin khác
                          </h5>
                          <div
                            class="addInforDiff"
                            v-for="(applicant, counter) in post.optional_fields"
                            v-bind:key="counter"
                          >
                            <div class="d-flex flex-wrap mb-3">
                              <span class="close" @click="deleteVisa(counter)"
                                ><i class="fas fa-times"></i
                              ></span>
                              <div class="infor col-md-6 col-12 createPost__left">
                                <label for="duration"
                                  >{{ counter + 1 }}. Tiêu đề</label
                                >
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    class=""
                                    v-model.lazy="applicant.title"
                                    required
                                  />
                                </div>
                              </div>
                              <div class="title col-md-6 col-12 createPost__right">
                                <label for="duration">Chú thích</label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    class=""
                                    v-model.lazy="applicant.hint"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="title col-md-6 mb-3 col-12"
                            >
                              <label for="duration">Loại câu trả lời</label>
                              <div class="inputForm">
                                <select
                                  class=""
                                  v-model="applicant.type"
                                  style="width: 100%"
                                >
                                  <option
                                    v-bind:value="type"
                                    v-for="type in dataType"
                                    v-bind:key="type"
                                  >
                                    {{ type }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div
                              class="d-flex"
                              v-if="applicant.type === 'paragraph'"
                            >
                              <div class="title col-md-6">
                                <label for="duration">Số từ tối thiểu</label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    class=""
                                    v-model="applicant.min_value"
                                    required
                                  />
                                </div>
                              </div>
                              <div class="title col-md-6">
                                <label for="duration">Số từ tối đa</label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    class=""
                                    v-model="applicant.max_value"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="d-flex"
                              v-if="applicant.type === 'date'"
                            >
                              <div class="title col-md-6">
                                <label for="duration"
                                  >Ngảy bắt đầu tối thiểu</label
                                >
                                <div class="inputForm">
                                  <input
                                    type="date"
                                    class=""
                                    v-on:input="convertDate($event, counter, 0)"
                                    required
                                  />
                                </div>
                              </div>
                              <div class="title col-md-6">
                                <label for="duration"
                                  >Ngày kết thúc tối đa</label
                                >
                                <div class="inputForm">
                                  <input
                                    type="date"
                                    class=""
                                    v-on:input="convertDate($event, counter, 1)"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="row mb-3"
                              v-if="
                                applicant.type === 'multiselect' ||
                                applicant.type === 'dropdownlist'
                              "
                            >
                              <div
                                class="addInforDiff"
                                v-for="(optAnswer, count) in post
                                  .optional_fields[counter].data"
                                v-bind:key="count"
                              >
                                <div class="title col-md-6">
                                  <span
                                    v-if="count !== 0"
                                    class="close"
                                    @click="deleteOptionInData(counter, count)"
                                    ><i class="fas fa-times"></i
                                  ></span>
                                  <label for="duration"
                                    >Lựa chọn {{ count + 1 }}</label
                                  >
                                  <div class="inputForm">
                                    <input
                                      type="text"
                                      class=""
                                      v-model="
                                        post.optional_fields[counter].data[
                                          count
                                        ]
                                      "
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                              <div class="buttonHandle">
                                <button
                                  @click="addMoreOption(counter)"
                                  class="btnAddinfor"
                                >
                                  + Thêm lựa chọn khác
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="buttonHandle">
                            <button @click="addVisa" class="btnAddinfor">
                              + Thêm thông tin
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- end col -->

                <!-- end row -->
              </tab-content>
              <tab-content icon="mdi mdi-face-profile">
                <h5 class="title-tab">
                  2. Hình thức phỏng vấn
                </h5>
                <div class="row">
                  <div class="col-12">
                    <div id="createPost">
                      <div class="createPostMain">
                        <div class="createPostContent">
                          <h5 style="font-weight: bold" class="titleJobs">
                            Quy trình phỏng vấn
                          </h5>
                          <div class="col-12 formPostGroup d-flex flex-wrap">
                            <div class="col-md-6 col-12 createPost__right mb-6">
                              <label class="col-form-label" for="confirmpass">Chọn bài test</label>
                              <div class="">
                                <multiselect
                                  v-model="selectedPackages"
                                  :options="post.packages"
                                  :multiple="true"
                                  :taggable="true"
                                  placeholder=""
                                  label="name"
                                  track-by="name"
                                  :close-on-select="false"
                                  :clear-on-select="false"
                                  >{{ selectedPackages.name }}</multiselect
                                >
                              </div>
                            </div>
                          </div>
                          <div class="col-12 formPostGroup">
                            <div class="col-12">
                              <div class="addInforDiff" v-for="(applicant, counter) in post.interviews" v-bind:key="counter">
                                <span class="close" @click="deleteInterview(counter)"><i class="fas fa-times"></i></span>
                                <div class="col-12 d-flex flex-wrap">
                                  <div class="infor col-md-6 col-12 createPost__left"
                                    style="display: flex;
                                      align-items: center;
                                    "
                                  >
                                    <span for="duration" class="roundPv"
                                      >Vòng {{ counter + 1 }}</span
                                    >
                                  </div>
                                  <div class="col-md-6 col-12 createPost__right">
                                    <label for="duration"
                                      >Loại phỏng vấn
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <select
                                        style="width: 100%"
                                        class=""
                                        v-model="post.interviews[counter].type"
                                      >
                                        <option
                                          v-for="interview in typeInterview"
                                          v-bind:key="interview"
                                        >
                                          {{ interview }}
                                        </option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div class="title mt-3">
                                  <label for="duration"
                                    >Mô tả cuộc phỏng vấn</label
                                  >
                                  <div class="inputForm">
                                    <textarea
                                      v-model.lazy="applicant.stage_description"
                                      type=""
                                      name="name"
                                      value="Francis"
                                      style="height: 5rem; width: 100%"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div class="buttonHandle">
                                <button
                                  @click="addInterview"
                                  class="btnAddinfor"
                                >
                                  + Thêm vòng
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 mt-4">
                      <div id="createPost">
                          <div class="createPostMain">
                            <div class="createPostContent">
                              <h5 style="font-weight: bold" class="titleJobs">
                                Bảo hành & tiền thưởng
                              </h5>
                              <div class="col-12 d-flex flex-wrap formPostGroup">
                                <div class="col-md-6 col-12 col-12 createPost__left">
                                  <label class="col-form-label" for="surname"
                                    >Tiền hoa hồng ({{ post.currency }})
                                    <span style="color: red" class="labelStar"
                                      >*</span
                                    ></label
                                  >
                                  <div class="inputForm">
                                    <input
                                      type="number"
                                      name="surname"
                                      v-model="post.commission"
                                      :class="{
                                        'is-invalid':
                                          submitted && $v.post.commission.$error,
                                      }"
                                    />

                                    <div
                                      v-if="
                                        submitted && $v.post.commission.$error
                                      "
                                      class="invalid-feedback"
                                    >
                                      <span v-if="!$v.post.commission.required"
                                        >Tiền hoa hồng không được bỏ trống *</span
                                      >
                                    </div>
                                  </div>
                                </div>
                                <div
                                  v-if="post.urgency === true"
                                  class="col-md-6 col-12 createPost__right"
                                >
                                  <label class="col-form-label" for="email"
                                    >Tiền thưởng ({{ post.currency }})
                                    <span style="color: red" class="labelStar"
                                      >*</span
                                    ></label
                                  >
                                  <div class="inputForm">
                                    <input
                                      type="number"
                                      v-model="post.bonus"
                                      :class="{
                                        'is-invalid':
                                          submitted && $v.post.bonus.$error,
                                      }"
                                    />

                                    <div
                                      v-if="submitted && $v.post.bonus.$error"
                                      class="invalid-feedback"
                                    >
                                      <span v-if="!$v.post.bonus.required"
                                        >Tiền thưởng không được bỏ trống *</span
                                      >
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div
                                v-if="post.urgency === true"
                                class="col-12 d-flex flex-wrap formPostGroup"
                              >
                                <div class="col-md-6 col-12 createPost__left">
                                  <div class="row mb-3">
                                    <label class="col-form-label" for="email"
                                      >Ngày thưởng bắt đầu
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <input
                                        v-model="bonusStartDate"
                                        v-on:input="changeDateOfPost($event, 2)"
                                        type="date"
                                        class=""
                                        required
                                        :class="{
                                          'is-invalid':
                                            submitted && $v.bonusStartDate.$error,
                                        }"
                                      />
                                      <div
                                        v-if="
                                          submitted && $v.bonusStartDate.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span v-if="!$v.bonusStartDate.required"
                                          >Ngày thưởng bắt đầu không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-md-6 col-12 createPost__right">
                                  <div class="row mb-3">
                                    <label class="col-form-label" for="email"
                                      >Ngày thưởng kết thúc
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <input
                                        v-model="bonusEndDate"
                                        v-on:input="changeDateOfPost($event, 3)"
                                        type="date"
                                        :class="{
                                          'is-invalid':
                                            submitted && $v.bonusEndDate.$error,
                                        }"
                                        required
                                      />
                                      <div
                                        v-if="submitted && $v.bonusEndDate.$error"
                                        class="invalid-feedback"
                                      >
                                        <span v-if="!$v.bonusEndDate.required"
                                          >Ngày thưởng kết thúc không được bỏ
                                          trống *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 formPostGroup d-flex flex-wrap">
                                <div class="col-md-6 col-12 createPost__left">
                                  <div class="row mb-3">
                                    <label class="col-form-label" for="email"
                                      >Loại bảo hành
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <select
                                        style="width: 100%"
                                        class=""
                                        v-model="post.guarantee_type"
                                        :class="{
                                          'is-invalid':
                                            submitted &&
                                            $v.post.guarantee_type.$error,
                                        }"
                                      >
                                        <option
                                          v-for="gur in guaranteeList"
                                          v-bind:key="gur"
                                        >
                                          {{ gur }}
                                        </option>
                                      </select>
                                      <div
                                        v-if="
                                          submitted &&
                                          $v.post.guarantee_type.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span
                                          v-if="!$v.post.guarantee_type.required"
                                          >Loại bảo hành không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  class="col-md-6"
                                  v-if="
                                    post.guarantee_type !== 'Không bảo hành' &&
                                    post.guarantee_type !== ''
                                  "
                                  style="padding-left: 10px"
                                >
                                  <div class="row mb-3">
                                    <label class="col-form-label" for="email"
                                      >Tỉ lệ tiền bảo hành (%)
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="createPost__right inputForm" style="padding-left: 0">
                                      <input
                                        type="text"
                                        v-model="post.guarantee"
                                        required
                                        :class="{
                                          'is-invalid':
                                            submitted && $v.post.guarantee.$error,
                                        }"
                                      />
                                      <div
                                        v-if="
                                          submitted && $v.post.guarantee.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span v-if="!$v.post.guarantee.required"
                                          >Tỉ lệ bảo hành không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                v-if="
                                  post.guarantee_type !== 'Không bảo hành' &&
                                  post.guarantee_type !== ''
                                "
                                class="col-12 formPostGroup d-flex flex-wrap"
                              >
                                <div class="col-md-6 createPost__left">
                                  <div class="row mb-3">
                                    <label class="col-form-label" for="email"
                                      >Số ngày bảo hành
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <input
                                        v-on:input="inputGuaranteeDate($event)"
                                        type="number"
                                        :class="{
                                          'is-invalid':
                                            submitted &&
                                            $v.post.guarantee_date.$error,
                                        }"
                                        required
                                      />
                                      <div
                                        v-if="
                                          submitted &&
                                          $v.post.guarantee_date.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span
                                          v-if="!$v.post.guarantee_date.required"
                                          >Số ngày bảo hành không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                    <!-- <div class="col-12 d-flex">
                      <div class="col-md-6" >
                        <div class="row mb-3">
                          <label class=" col-form-label" for="email"
                            >Ngày bắt đầu</label
                          >
                           <div class="">
                            <date-picker
                              v-model="post.guarantee_date"
                              :first-day-of-week="1"
                              lang="en"
                              confirm
                            ></date-picker>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6" style="margin-right: 20px">
                        <div class="row mb-3">
                          <label class=" col-form-label" for="email"
                            >Ngày kết thúc</label
                          >
                            <div class="">
                            <date-picker
                              v-model="post.date_end"
                              :first-day-of-week="1"
                              lang="en"
                              confirm
                            ></date-picker>
                          </div>
                        </div>
                      </div>
                    </div> -->
                  </div>
                  <!-- end col -->
                </div>
                <!-- end row -->
              </tab-content>
            </form-wizard>
          </div>
          <!-- end card-body -->
        </div>
        <!-- end card -->
      </div>
      <!-- end col -->
    </div>
  </Layout>
</template>