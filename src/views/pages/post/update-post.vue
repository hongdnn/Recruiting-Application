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
    title: "Thông tin công Việc",
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
      typeInterview: ["online", "face to face", "phone"],
      id: this.$route.params.id,
      selectCompany: "",
      selectIndustry: "",
      selectJobRoles: "",
      selectedJobRoles: "",
      selectJobLevels: "",
      selectedJobLevels: "",
      selectCities: "",
      selectedCities: "",
      selectJobs: "",
      selectFunctions: "",
      selectSkills: "",
      selectedSkills: "",
      selectLanguages: "",
      selectedLanguages: "",
      selectGuarantee: "",
      bonusStartDate: "",
      bonusEndDate: "",
      dateOff: "",
      dateEnd: "",
      selectedPackages: [],
      listPackages: [],
      selectedDateOff: 0,
      selectedDateEnd: 0,
      selectedBonusStart: 0,
      selectedBonusEnd: 0,
      jobRoles: [],

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
      deleteInterviews: [],
      deleteOptFields: [],
      post: {
        cities: [],
        job_role: [],
        skills: [],
        languages: [],
        keywords: [],
        industry: "",
        function: "",
        job: "",
        title: "",
        user: "",
        country: "",
        date_off: "",
        date_end: "",
        full_name: "",
        job_level: null,
        email: "",
        phone: "",
        content: "",
        require: "",
        benefit: "",
        salary_from: "",
        salary_to: "",
        negotiable: false,
        type_work: "",
        company: "",
        notice_for_referrer: "",
        address: "",
        require_number: "",
        commission: "",
        currency: "",
        education_level: "",
        guarantee_type: "",
        guarantee: 50,
        guarantee_date: 0,
        urgency: false,
        update_time: 0,
        security: false,
        optional_fields: [],
        interviews: [],
        question_packages: [],
        bonus: "",
        bonus_start_date: "",
        bonus_end_date: "",
      },
      submitted: false,
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
      company: {
        required,
      },
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
      cities: {
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
      job_role: {
        required,
      },
      job_level: {
        required,
      },
      salary_from: {
        required,
      },
      salary_to: {
        required,
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
      // "getPost",
      "getCompanyGetter",
      "getIndustryGetter",
      "getJobRolesGetter",
      "getFunctionGetter",
      "getJobGetter",
      "getSkillsGetter",
      "getLanguagesGetter",
      "getCityGetter",
      "getPostGetter",
    ]),
    ...mapState("company", [
      // "postData",
      "company_data",
      "industry_data",
      "job_role_data",
      "job_data",
      "skill_data",
      "function_data",
      "language_data",
      "city_data",
      "postData",
    ]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
    dataPost() {
      return this.getPostGetter;
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
  },

  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      //Get companies
      switch (mut.type) {
        case "company/packageSuccess": {
          //Get all question packages
          this.listPackages = state.company.package_data.data;
          // for (let packageItem of this.listPackages) {
          //   if (this.post.question_packages.includes(packageItem._id)) {
          //     this.selectedPackages.push(packageItem);
          //   }
          // }
          break;
        }
        case "company/updateSuccess": {
          Swal.fire("Cập nhật công việc thành công", "", "success").then(() => {
            this.navigateToPostDetailScreen(state.company.updateData.data._id);
          });
          break;
        }
        case "company/updateFailure": {
          Swal.fire("Cập nhật công việc không thành công", "", "error").then(
            () => {
              this.navigateToPostDetailScreen(
                state.company.updateData.data._id
              );
            }
          );
          break;
        }
      }
    });
  },
  async mounted() {
    await this.getPostId();
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
      "getIndustryWithoutFunctionAndJob",
      "getFunctionsInformationByIndustry",
      "getJobRoleByFunction",
      "getJobsByFunction",
      "getJobInformation",
      "getSkillInformation",
      "getFunctionInformation",
      "getLanguageInformation",
      "getCityInformation",
      "getPost",
      "updatePost",
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
      this.selectJobs = "";
      this.selectFunctions = "";
      this.post.job_role = [];
      this.jobRoles = [];
    },
    async changeStatusFunction(myFunction) {
      await this.getJobsByFunction(myFunction.id);
      await this.getJobRoleByFunction(myFunction.id);
      this.jobRoles = this.dataJobRole.job_role;
      //this.jobRoles = this.selectFunctions.jobRoles;
      this.post.job_role = [];
    },
    inputValueJobRole(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectJobRoles = result;
    },
    fillCompanyInfo() {
      this.post.full_name = this.post.company.contact_name;
      this.post.email = this.post.company.email;
      this.post.phone = this.post.company.phone;
    },

    inputValueJobLevel(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value._id);
      });

      this.selectJobLevels = result;
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
    inputValuePackages(values) {
      let result = [];

      values.forEach((value) => {
        result.push(value);
      });

      this.post.question_packages = result;
    },
    addVisa() {
      this.post.optional_fields.push({
        type: "",
        title: "",
        hint: "",
        data: [""],
        action: "create",
      });
    },
    deleteVisa(counter) {
      if (
        this.post.optional_fields[counter].id !== undefined &&
        this.post.optional_fields[counter].action !== "delete"
      ) {
        this.post.optional_fields[counter].action = "delete";
        this.deleteOptFields.push(this.post.optional_fields[counter]);
      }
      this.post.optional_fields.splice(counter, 1);
    },
    addMoreOption(counter) {
      this.post.optional_fields[counter].data.push("");
    },
    deleteOptionInData(counter, count) {
      this.post.optional_fields[counter].data.splice(count, 1);
      this.addActionUpdate(this.post.optional_fields[counter]);
    },
    addInterview() {
      this.post.interviews.push({
        type: "",
        stage: "",
        stage_description: "",
        action: "create",
      });
    },
    addActionUpdate(object) {
      if (object.id !== undefined) {
        object.action = "update";
      }
    },
    deleteInterview(counter) {
      if (
        this.post.interviews[counter].id !== undefined &&
        this.post.interviews[counter].action !== "delete"
      ) {
        this.post.interviews[counter].action = "delete";
        this.deleteInterviews.push(this.post.interviews[counter]);
      }
      this.post.interviews.splice(counter, 1);
    },

    onComplete: function () {
      this.savePost();
    },

    async getCompany() {
      await this.getCompanyInformation();
    },

    async getIndustry() {
      // get industry by id 
      await this.getIndustryWithoutFunctionAndJob();
      for (let industry of this.dataIndustry.industries) {
        if (this.post.industry.id === industry.id) {
          this.selectIndustry = industry;
          await this.getFunctionsInformationByIndustry(industry.id);
          for (let func of this.dataFunction.functions) {
            if (this.post.function.id === func.id) {
              this.selectFunctions = func;
              await this.getJobsByFunction(func.id);
              await this.getJobRoleByFunction(func.id);
              this.jobRoles = this.dataJobRole.job_role;
              for (let job of this.dataJob.jobs) {
                if (this.post.job.id === job.id) {
                  this.selectJobs = job;
                }
              }
            }
          }
        }
      }

    },

    async getJob() {
      await this.getJobInformation();
    },
    async getFunction() {
      await this.getFunctionInformation();
    },
    async getSkill() {
      await this.getSkillInformation();
    },
    async getLanguage() {
      await this.getLanguageInformation();
    },
    async getCity() {
      await this.getCityInformation();
    },
    async getPostId() {
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

      await this.getPost(id);
      (this.post.id = this.dataPost.post._id),
        (this.post.cities = this.dataPost.post.cities),
        (this.post.job_role = this.dataPost.post.job_role),
        (this.post.skills = this.dataPost.post.skills),
        (this.post.languages = this.dataPost.post.languages),
        (this.post.keywords = this.dataPost.post.keywords),
        (this.post.industry = this.dataPost.post.industry),
        (this.post.function = this.dataPost.post.function),
        (this.post.job = this.dataPost.post.job),
        (this.post.title = this.dataPost.post.title),
        (this.post.user = this.dataPost.post.user),
        (this.post.country = this.dataPost.post.country),
        (this.post.date_off = this.dataPost.post.date_off),
        (this.post.date_end = this.dataPost.post.date_end),
        (this.post.full_name = this.dataPost.post.full_name),
        (this.post.job_level = this.dataPost.post.job_level.split(";")),
        (this.post.email = this.dataPost.post.email),
        (this.post.phone = this.dataPost.post.phone),
        (this.post.content = this.dataPost.post.content),
        (this.post.require = this.dataPost.post.require),
        (this.post.benefit = this.dataPost.post.benefit),
        (this.post.salary_from = this.dataPost.post.salary_from),
        (this.post.salary_to = this.dataPost.post.salary_to),
        (this.post.negotiable = this.dataPost.post.negotiable),
        (this.post.type_work = this.dataPost.post.type_work),
        (this.post.company = this.dataPost.post.company),
        (this.post.notice_for_referrer =
          this.dataPost.post.notice_for_referrer),
        (this.post.address = this.dataPost.post.address),
        (this.post.require_number = this.dataPost.post.require_number),
        (this.post.commission = this.dataPost.post.commission),
        (this.post.currency = this.dataPost.post.currency),
        (this.post.education_level = this.dataPost.post.education_level),
        (this.post.guarantee_date = this.dataPost.post.guarantee_date),
        (this.post.guarantee = this.dataPost.post.guarantee),
        (this.post.guarantee_type = this.dataPost.post.guarantee_type),
        (this.post.urgency = this.dataPost.post.urgency),
        (this.post.security = this.dataPost.post.security),
        (this.post.optional_fields = this.dataPost.post.optional_fields),
        (this.post.interviews = this.dataPost.post.interviews),
        (this.post.question_packages = this.dataPost.post.question_packages),
        (this.post.bonus = this.dataPost.post.bonus),
        (this.post.bonus_start_date = this.dataPost.post.bonus_start_date),
        (this.post.bonus_end_date = this.dataPost.post.bonus_end_date);
      this.selectGuarantee = this.dataPost.post.guarantee;
      if (this.post.bonus_start_date !== 0) {
        this.bonusStartDate = new Date(this.post.bonus_start_date)
          .toISOString()
          .split("T")[0];
      }
      if (this.post.bonus_end_date !== 0) {
        this.bonusEndDate = new Date(this.post.bonus_end_date)
          .toISOString()
          .split("T")[0];
      }
      this.dateOff = new Date(this.post.date_off).toISOString().split("T")[0];
      this.dateEnd = new Date(this.post.date_end).toISOString().split("T")[0];
      for (let optField of this.post.optional_fields) {
        if (optField.type === "date") {
          optField.min_value = new Date(optField.min_value)
            .toISOString()
            .split("T")[0];
          optField.max_value = new Date(optField.max_value)
            .toISOString()
            .split("T")[0];
        }
        if (
          optField.type === "multiselect" ||
          optField.type === "dropdownlist"
        ) {
          let optionAnswers = optField.data.split(";");
          optField.data = [];
          for (let i = 0; i < optionAnswers.length; i++) {
            optField.data.push(optionAnswers[i]);
          }
        }
      }
    },
    // :)
    async savePost() {
      let user = JSON.parse(localStorage.getItem("user"));
      if (this.post.negotiable === true) {
        this.post.salary_from = 0;
        this.post.salary_to = 0;
      }
      let updatedPost = {
        id: this.dataPost.post._id,
        city_ids: [],
        job_role_ids: [],
        skill_ids: [],
        language_ids: [],
        optional_fields: [],
        keywords: this.post.keywords,
        industry_id: this.selectIndustry.id,
        function_id: this.selectFunctions.id,
        job_id: this.selectJobs.id,
        title: this.post.title,
        user_id: user.data.id,
        country_id: this.post.country.id,
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
        company_id: this.post.company.id,
        update_time: new Date().getTime(),
        notice_for_referrer: this.post.notice_for_referrer,
        address: this.post.address,
        require_number: parseInt(this.post.require_number),
        commission: parseInt(this.post.commission),
        currency: this.post.currency,
        education_level: this.post.education_level,
        guarantee: parseInt(this.post.guarantee),
        guarantee_date: this.post.guarantee_date,
        guarantee_type: this.post.guarantee_type,
        urgency: this.post.urgency,
        security: this.post.security,
      };
      if (updatedPost.guarantee_type === "Không bảo hành") {
        updatedPost.guarantee = 0;
      }
      if (this.post.question_packages.length > 0) {
        updatedPost.question_packages = this.post.question_packages;
      }
      for (let i = 1; i < this.post.job_level.length; i++) {
        updatedPost.job_level += ";" + this.post.job_level[i];
      }
      if (this.selectedDateOff !== 0) {
        updatedPost.date_off = this.selectedDateOff;
      }
      if (this.selectedDateEnd !== 0) {
        updatedPost.date_end = this.selectedDateEnd;
      }
      if (!updatedPost.urgency) {
        updatedPost.bonus = 0;
        updatedPost.bonus_start_date = 0;
        updatedPost.bonus_end_date = 0;
      } else {
        updatedPost.bonus = parseInt(this.post.bonus);
        if (this.selectedBonusStart !== 0) {
          updatedPost.bonus_start_date = this.selectedBonusStart;
        }
        if (this.selectedBonusEnd !== 0) {
          updatedPost.bonus_end_date = this.selectedBonusEnd;
        }
      }
      updatedPost.interviews = this.post.interviews.concat(
        this.deleteInterviews
      );
      for (let interview of updatedPost.interviews) {
        if (interview.action === undefined) {
          interview.action = null;
        }
      }
      for (let i = 0; i < this.post.optional_fields.length; i++) {
        let optFieldDto = {
          title: this.post.optional_fields[i].title,
          hint: this.post.optional_fields[i].hint,
          type: this.post.optional_fields[i].type,
          min_value: this.post.optional_fields[i].min_value,
          max_value: this.post.optional_fields[i].max_value,
          data: this.post.optional_fields[i].data,
        };
        if (this.post.optional_fields[i].id !== undefined) {
          optFieldDto.id = this.post.optional_fields[i].id;
        }
        if (this.post.optional_fields[i].action !== undefined) {
          optFieldDto.action = this.post.optional_fields[i].action;
        } else {
          optFieldDto.action = null;
        }
        updatedPost.optional_fields.push(optFieldDto);
      }
      for (let i = 0; i < this.deleteOptFields.length; i++) {
        updatedPost.optional_fields.push(this.deleteOptFields[i]);
      }
      for (let optField of updatedPost.optional_fields) {
        if (optField.type !== "date" && optField.type !== "paragraph") {
          delete optField.min_value;
          delete optField.max_value;
        }
        if (optField.type === "date") {
          optField.min_value = new Date(optField.min_value).getTime();
          optField.max_value = new Date(optField.max_value).getTime();
        }
        if (
          optField.type !== "multiselect" &&
          optField.type !== "dropdownlist"
        ) {
          delete optField.data;
        } else {
          let a = optField.data[0];
          for (let i = 1; i < optField.data.length; i++) {
            if (optField.data[i].trim() !== "") {
              a += ";" + optField.data[i];
            }
          }
          delete optField.data;
          optField.data = a;
        }
      }
      for (let city of this.post.cities) {
        updatedPost.city_ids.push(city.id);
      }
      for (let jobRole of this.post.job_role) {
        updatedPost.job_role_ids.push(jobRole._id);
      }
      for (let skill of this.post.skills) {
        updatedPost.skill_ids.push(skill._id);
      }
      for (let language of this.post.languages) {
        updatedPost.language_ids.push(language._id);
      }
      if (updatedPost.id) {
        this.submitted = true;
        this.$v.$touch();
        await this.updatePost(updatedPost);
      }
    },
    changeDateOfPost: function (event, number) {
      const value = event.target.value;
      const date = new Date(value).getTime();
      if (number === 1) {
        this.selectedDateOff = date;
      } else if (number === 2) {
        this.selectedBonusStart = date;
      } else if (number === 3) {
        this.selectedBonusEnd = date;
      } else if (number === 4) {
        this.selectedDateEnd = date;
      }
    },
    // convertDate: function (event, counter, number) {
    //   const value = event.target.value;
    //   const date = new Date(value).getTime();
    //   if (number === 0) {
    //     this.post.optional_fields[counter].min_value = date;
    //   } else {
    //     this.post.optional_fields[counter].max_value = date;
    //   }
    // },
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
<style lang='scss'>
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
.handleCreatedJob button {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: blue;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  border: 1px solid blue;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
}
.handleCreatedJob button:hover {
  background-color: blue;
}
.handleCreatedJob button i {
  margin-right: 5px;
}
.createPostMain {
  height: auto;
  width: 70%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  // background-color: #53cb6a87;
  padding: 20px 15px;
  border-radius: 10px;
  border: 1px solid #ccccccd5;
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
  transform: translateX(-50%);
  width: 70%;
  justify-content: center;
  left: 50%;
  position: relative;
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
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%) !important;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem !important;

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
.remove-tag {
  position: absolute;
  top: 1px;
  right: 1px;
  color: #d40c0cdb;
  padding: 0px;
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
                <h5
                  style="
                    color: #5b73e8;
                    margin-left: 12.5rem;
                    font-weight: bold;
                  "
                >
                  1. Thông tin chung
                </h5>

                <div id="createPost">
                  <div class="createPostMain">
                    <div class="createPostContent">
                      <h5 style="font-weight: bold" class="titleJobs">
                        Thông tin công việc
                      </h5>
                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-md-6" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Tên công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              class="form-control"
                              name="userName"
                              v-model="post.title"
                              :class="{
                                'is-invalid': submitted && $v.post.title.$error,
                              }"
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
                        <div class="col-6" style="padding-left: 10px">
                          <label class="col-form-label" for="userName"
                            >Chọn công ty
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class="form-select"
                              v-model="post.company"
                              @change="fillCompanyInfo"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.company.$error,
                              }"
                            >
                              <option
                                v-bind:value="company"
                                v-for="company in this.dataCompany.companies"
                                :key="company.id"
                              >
                                {{ company.name }}
                              </option>
                            </select>
                            <div
                              v-if="submitted && $v.post.company.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.company.required"
                                >Công ty không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-4" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Người liên hệ
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.full_name"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.full_name.$error,
                              }"
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
                        <div
                          class="col-4"
                          style="padding-left: 10px; padding-right: 10px"
                        >
                          <label class="col-form-label" for="confirmpass"
                            >Email công ty
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.email"
                              :class="{
                                'is-invalid': submitted && $v.post.email.$error,
                              }"
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

                        <div class="col-4" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Số điện thoại
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              id="userName"
                              type="text"
                              name="userName"
                              v-model="post.phone"
                              :class="{
                                'is-invalid': submitted && $v.post.phone.$error,
                              }"
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
                                  !$v.post.phone.minLength
                                "
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

                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-4" style="padding-right: 10px">
                          <label class="col-form-label"
                            >Ngành
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
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
                        <div
                          class="col-4"
                          style="padding-left: 10px; padding-right: 10px"
                        >
                          <label class="col-form-label" for="confirmpass"
                            >Phòng Ban
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
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
                            >Vị trí công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              style="width: 100%"
                              class="form-select"
                              v-model="selectJobs"
                              :class="{
                                'is-invalid': submitted && $v.selectJobs.$error,
                              }"
                            >
                              <option
                                v-for="job in this.dataJob.jobs"
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
                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-md-6" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Vai trò công việc
                          </label>
                          <div class="">
                            <multiselect
                              @input="inputValueJobRole"
                              v-model="post.job_role"
                              :options="jobRoles"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ post.job_role.name }}</multiselect
                            >
                          </div>
                        </div>

                        <div class="col-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Cấp bậc công việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >

                          <div class="">
                            <multiselect
                              @input="inputValueJobLevel"
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
                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-md-6" style="padding-right: 10px">
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
                        <div class="col-md-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Loại tiền tệ
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
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
                      <div
                        class="col-12 d-flex formPostGroup"
                        v-if="post.negotiable === false"
                      >
                        <div class="col-md-6" style="padding-right: 10px">
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
                              class="form-control"
                              v-model="post.salary_from"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.salary_from.$error,
                              }"
                            />
                            <div
                              v-if="submitted && $v.post.salary_from.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.salary_from.required"
                                >Lương thấp nhất không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                        <div class="col-md-6" style="padding-left: 10px">
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
                              class="form-control"
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
                                >Lương thấp nhất không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-6" style="padding-right: 10px">
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
                                class="form-control"
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
                        <div class="col-md-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Tuyển gấp
                          </label>
                          <div class="inputForm">
                            <select class="form-select" v-model="post.urgency">
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
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-6" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Hạn nộp CV
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              v-model="dateEnd"
                              type="date"
                              class="form-control"
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
                        <div class="col-md-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Ngày kết thúc tuyển dụng
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <input
                              v-model="dateOff"
                              type="date"
                              class="form-control"
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
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-6" style="padding-right: 10px">
                          <div class="row mb-3">
                            <label class="col-form-label" for="email"
                              >Bảo mật</label
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

                      <div class="col-12 formPostGroup d-flex">
                        <div class="col-md-6" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Giáo dục
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class="form-select"
                              v-model="post.education_level"
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
                        <div class="col-md-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Ngoại ngữ</label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueLanguage"
                              v-model="post.languages"
                              :options="dataLanguage.languages"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ post.languages.name }}</multiselect
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-md-12 formPostGroup d-flex">
                        <div class="col-md-6" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Kĩ năng</label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueSkill"
                              v-model="post.skills"
                              :options="dataSkill.skills"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              >{{ post.skills.name }}</multiselect
                            >
                          </div>
                        </div>

                        <div class="col-md-6" style="padding-left: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Hình thức làm việc
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="inputForm">
                            <select
                              class="form-select"
                              v-model="post.type_work"
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
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-6" style="padding-right: 10px">
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
                              class="form-control"
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
                        <div class="col-md-6" style="padding-left: 10px">
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
                              class="form-control"
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
                        <div class="col-12" style="padding-right: 10px">
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
                              class="form-control"
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

                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-8" style="padding-right: 10px">
                          <label class="col-form-label" for="confirmpass"
                            >Địa điểm
                            <span style="color: red" class="labelStar"
                              >*</span
                            ></label
                          >
                          <div class="">
                            <multiselect
                              @input="inputValueCity"
                              v-model="post.cities"
                              :options="dataCity.cities"
                              :multiple="true"
                              :taggable="true"
                              placeholder=""
                              label="name"
                              track-by="name"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :class="{
                                'is-invalid':
                                  submitted && $v.post.cities.$error,
                              }"
                              >{{ post.cities.name }}</multiselect
                            >
                            <div
                              v-if="submitted && $v.post.cities.$error"
                              class="invalid-feedback"
                            >
                              <span v-if="!$v.post.cities.required"
                                >Địa điểm không được bỏ trống *</span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 d-flex formPostGroup">
                        <div class="col-md-12" style="padding-right: 10px">
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
                              class="form-control"
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
                            <div class="d-flex mb-3">
                              <span class="close" @click="deleteVisa(counter)"
                                ><i class="fas fa-times"></i
                              ></span>
                              <div
                                class="infor col-md-6"
                                style="padding-right: 10px"
                              >
                                <label for="duration"
                                  >{{ counter + 1 }}. Tiêu đề</label
                                >
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    @change="addActionUpdate(applicant)"
                                    v-model.lazy="applicant.title"
                                    required
                                    :class="{
                                      'is-invalid':
                                        submitted && $v.applicant.title.$error,
                                    }"
                                  />
                                  <div
                                    v-if="
                                      submitted &&
                                      $v.post.optional_fields.title.$error
                                    "
                                    class="invalid-feedback"
                                  >
                                    <span v-if="!$v.applicant.title.required"
                                      >Tiêu đề không được bỏ trống *</span
                                    >
                                  </div>
                                </div>
                              </div>
                              <div
                                class="title col-md-6"
                                style="padding-left: 10px"
                              >
                                <label for="duration">Chú thích</label>
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    @change="addActionUpdate(applicant)"
                                    v-model.lazy="applicant.hint"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              class="title col-md-6 mb-3"
                              style="padding-right: 10px"
                            >
                              <label for="duration">Loại câu trả lời</label>
                              <div class="inputForm">
                                <select
                                  class="form-select"
                                  @change="addActionUpdate(applicant)"
                                  v-model="applicant.type"
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
                                    @change="addActionUpdate(applicant)"
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
                                    @change="addActionUpdate(applicant)"
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
                                    v-model="applicant.min_value"
                                    type="date"
                                    @change="addActionUpdate(applicant)"
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
                                    v-model="applicant.max_value"
                                    @change="addActionUpdate(applicant)"
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
                                      @change="addActionUpdate(applicant)"
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
                <h5
                  style="
                    color: #5b73e8;
                    margin-left: 48.5rem;
                    font-weight: bold;
                  "
                >
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
                          <div class="col-12 d-flex formPostGroup">
                            <div
                              class="col-md-6 mb-6"
                              style="padding-right: 10px"
                            >
                              <label class="col-form-label" for="confirmpass"
                                >Chọn bài test</label
                              >
                              <div class="">
                                <multiselect
                                  v-model="post.question_packages"
                                  :options="listPackages"
                                  :multiple="true"
                                  :taggable="true"
                                  placeholder=""
                                  label="name"
                                  track-by="name"
                                  :close-on-select="false"
                                  :clear-on-select="false"
                                  >{{
                                    post.question_packages.name
                                  }}</multiselect
                                >
                              </div>
                            </div>
                          </div>
                          <div class="col-12 formPostGroup">
                            <div class="col-12">
                              <div
                                class="addInforDiff"
                                v-for="(applicant, counter) in post.interviews"
                                v-bind:key="counter"
                              >
                                <span
                                  class="close"
                                  @click="deleteInterview(counter)"
                                  ><i class="fas fa-times"></i
                                ></span>
                                <div class="col-12 d-flex">
                                  <div
                                    class="infor col-6"
                                    style="
                                      padding-right: 10px;
                                      display: flex;
                                      align-items: center;
                                      padding-left: 10px;
                                    "
                                  >
                                    <span for="duration" class="roundPv"
                                      >Vòng {{ counter + 1 }}</span
                                    >
                                  </div>
                                  <div class="col-6" style="padding-left: 10px">
                                    <label for="duration"
                                      >Loại phỏng vấn
                                      <span style="color: red" class="labelStar"
                                        >*</span
                                      ></label
                                    >
                                    <div class="inputForm">
                                      <select
                                        class="form-select"
                                        v-model="post.interviews[counter].type"
                                        @change="addActionUpdate(applicant)"
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
                                      class="form-control"
                                      value="Francis"
                                      style="height: 10rem"
                                      @change="addActionUpdate(applicant)"
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
                            <div class="col-12 d-flex formPostGroup">
                              <div class="col-md-6" style="padding-right: 10px">
                                <label class="col-form-label" for="surname"
                                  >Tiền hoa hồng ({{ post.currency }})
                                  <span style="color: red" class="labelStar"
                                    >*</span
                                  ></label
                                >
                                <div class="inputForm">
                                  <input
                                    type="text"
                                    name="surname"
                                    class="form-control"
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
                                class="col-md-6"
                                style="padding-left: 10px"
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
                                    class="form-control"
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
                              class="col-12 d-flex formPostGroup"
                            >
                              <div class="col-md-6" style="padding-right: 10px">
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
                              <div class="col-md-6" style="padding-left: 10px">
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
                                      required
                                      :class="{
                                        'is-invalid':
                                          submitted && $v.bonusEndDate.$error,
                                      }"
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
                            <div class="col-12 formPostGroup d-flex">
                              <div class="col-md-6" style="padding-right: 10px">
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
                                  <div class="inputForm">
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
                              class="col-12 formPostGroup d-flex"
                            >
                              <div class="col-md-6" style="padding-right: 10px">
                                <div class="row mb-3">
                                  <label class="col-form-label" for="email"
                                    >Số ngày bảo hành
                                    <span style="color: red" class="labelStar"
                                      >*</span
                                    ></label
                                  >
                                  <div class="inputForm">
                                    <input
                                      v-model="post.guarantee_date"
                                      type="number"
                                      class="form-select"
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
