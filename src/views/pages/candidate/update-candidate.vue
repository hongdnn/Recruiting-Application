<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { mapActions } from "vuex";
import Swal from "sweetalert2";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import { required, email, minLength, numeric } from "vuelidate/lib/validators";
export default {
  page: {
    title: "Cập nhật ứng viên",
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
      abc: ["a", "b"],
      path_cv_hided: null,
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
      expected: {
        required,
      },
      reason: {
        required,
      },
    },
  },
  mounted() {
    this.getCandidateDetailById();
    this.getCities();
    this.getJobRole();
    this.getSkill();
    this.getLanguage();
    this.getIndustry();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "candidates/getCandidateSuccess":
          //Get candidate detail
          this.candidate_detail = state.candidates.candidateData.data;
          this.fillCandidateDetail();
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
        case "candidates/updateCandidateSuccess":
          Swal.fire("Cập nhật ứng viên thành công", "", "success").then(() => {
            this.backToSearchCandidate()
          });
          break;
        case "candidates/updateCandidateFailure":
          switch (state.candidates.updateCandidateData) {
            case "The candidate is already in recruitment process.":
              Swal.fire(
                "Cập nhật không thành công",
                "Không thể cập nhật khi ứng viên đang được ứng tuyển",
                "error"
              ).then(() => {
              });
              break;
            default:
              Swal.fire("Cập nhật không thành công", "", "error").then(
                () => {
                }
              );
              break;
          }
          break;
        case "candidates/updateCVSuccess":
          Swal.fire("Cập nhật CV thành công", "", "success").then(() => {
            this.getCandidateDetailById();
          });
          break;
        case "candidates/updateCVFailure":
          switch (state.candidates.updateCVData) {
            case "Can not update this candidate":
              Swal.fire(
                "Cập nhật CV không thành công",
                "Không thể cập nhật CV khi ứng viên đang được ứng tuyển",
                "error"
              ).then(() => {
                this.getCandidateDetailById();
              });
              break;
            default:
              Swal.fire("Cập nhật CV không thành công", "", "error").then(
                () => {
                  this.getCandidateDetailById();
                }
              );
              break;
          }
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
    ...mapActions("candidates", [
      "getCandidateDetail",
      "updateCandidate",
      "updateCV",
    ]),
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

    fillCandidateDetail() {
      //Fill normal information
      this.path_cv_hided = this.candidate_detail.cv.path;
      this.cv_path = this.candidate_detail.cv.path;
      this.form.email = this.candidate_detail.email;
      this.form.name = this.candidate_detail.name;
      this.form.title = this.candidate_detail.profile_title;
      this.form.phone = this.candidate_detail.phone;
      if (this.candidate_detail.cities.length > 0) {
        this.selected_locations = this.candidate_detail.cities;
      }
      this.selected_currency = this.candidate_detail.currency;
      this.lowestSalary = this.candidate_detail.salary_from;
      this.highestSalary = this.candidate_detail.salary_to;
      this.form.isNegotiable = this.candidate_detail.negotiable;
      this.form.currentSalary = this.candidate_detail.current_salary;
      this.form.expected = this.candidate_detail.candidate_expectation;
      this.form.reason = this.candidate_detail.suitable_reason;

      //Fill data for candidate_availability
      switch (this.candidate_detail.candidate_availability) {
        case "có thể nhận ngay":
          this.form.workAfterDay = { id: "0", name: "Có thể nhận ngay" };
          break;
        case "sau 1 tháng":
          this.form.workAfterDay = { id: "1", name: "Sau 1 tháng" };
          break;
        case "sau 2 tháng":
          this.form.workAfterDay = { id: "2", name: "Sau 2 tháng" };
          break;
        case "sau 3 tháng":
          this.form.workAfterDay = { id: "3", name: "Sau 3 tháng" };
          break;
      }

      //Fill data for job_roles
      if (this.candidate_detail.job_roles.length > 0) {
        this.candidate_detail.job_roles.forEach((job_role) => {
          this.selected_job_roles.push({
            _id: job_role.id,
            name: job_role.name,
          });
        });
      }

      //Fill data for job_levels
      if (this.candidate_detail.job_levels !== null) {
        const job_level_array = this.candidate_detail.job_levels.split(",");
        if (job_level_array.length > 0) {
          job_level_array.forEach((job_level) => {
            var job_level_object = {};
            switch (job_level) {
              case "Quản Lý Điều Hành":
                job_level_object = {
                  id: 0,
                  name: "Quản Lý Điều Hành",
                };
                break;
              case "Quản Lý Cao Cấp":
                job_level_object = {
                  id: 1,
                  name: "Quản Lý Cao Cấp",
                };
                break;
              case "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp":
                job_level_object = {
                  id: 2,
                  name: "Quản Lý / Chuyên Gia / Chuyên Gia Tư Vấn Cao Cấp",
                };
                break;
              case "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát":
                job_level_object = {
                  id: 3,
                  name: "Chuyên Gia Cao Cấp / Trưởng Nhóm / Giám Sát",
                };
                break;
              case "Chuyên Gia / Có Kinh Nghiệm":
                job_level_object = {
                  id: 4,
                  name: "Chuyên Gia / Có Kinh Nghiệm",
                };
                break;
              case "Mới Ra Trường / Thực Tập":
                job_level_object = {
                  id: 5,
                  name: "Mới Ra Trường / Thực Tập",
                };
                break;
            }
            this.selected_job_levels.push(job_level_object);
          });
        }
      }

      //Fill data for candidate_skills
      if (this.candidate_detail.candidate_skills.length > 0) {
        this.candidate_detail.candidate_skills.forEach((candidate_skill) => {
          this.candidate_skills.push({
            _id: candidate_skill._id,
            skill_id: {
              _id: candidate_skill.skill._id,
              name: candidate_skill.skill.translate.vi.name,
            },
            year_of_experience: candidate_skill.year_of_experience,
            rating: candidate_skill.rating,
          });
        });

        this.candidate_skills.forEach((candidate_skill) => {
          this.candidate_skills_original.push(candidate_skill);
        });
      }

      //Fill data for candidate_languages
      if (this.candidate_detail.candidate_languages.length > 0) {
        this.candidate_detail.candidate_languages.forEach(
          (candidate_language) => {
            this.candidate_languages.push({
              _id: candidate_language._id,
              language_id: {
                _id: candidate_language.language._id,
                name: candidate_language.language.name,
              },
              year_of_experience: candidate_language.year_of_experience,
              your_rating: candidate_language.your_rating,
            });
          }
        );

        this.candidate_languages.forEach((candidate_language) => {
          this.candidate_languages_original.push(candidate_language);
        });
      }

      //Fill data for work_experiences
      if (this.candidate_detail.work_experiences.length > 0) {
        this.candidate_detail.work_experiences.forEach(
          (candidate_experience) => {
            var industries = [];
            candidate_experience.industries.forEach((industry) => {
              industries.push({
                id: industry._id,
                name: industry.name,
                translate: industry.translate,
              });
            });

            var job_roles = [];
            candidate_experience.job_roles.forEach((job_role) => {
              job_roles.push({
                _id: job_role._id,
                name: job_role.name,
              });
            });

            this.candidate_experiences.push({
              _id: candidate_experience._id,
              industry_ids: industries,
              job_role_ids: job_roles,
              job_title: candidate_experience.job_title,
              work_duration: candidate_experience.work_duration,
            });
          }
        );

        this.candidate_experiences.forEach((candidate_experience) => {
          this.candidate_experiences_original.push(candidate_experience);
        });
      }
    },

    // Update candidate detail
    updateCandidateDetail() {
      if (this.isValidateSalary) {
        return;
      }

      this.submitted = true;
      this.$v.$touch();

      Swal.fire({
        title: "Xác nhận cập nhật ứng viên",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const email = this.form.email;
          const name = this.form.name;
          const profile_title = this.form.title;
          const phone = this.form.phone;
          const city_ids = this.form.areaWork;
          const candidate_availability = this.form.workAfterDay.id;
          const currency = this.selected_currency;
          const negotiable = this.form.isNegotiable;
          const salary_from = negotiable ? null : this.lowestSalary; //nullable
          const salary_to = negotiable ? null : this.highestSalary; //nullable
          const current_salary = this.form.currentSalary; //nullable
          const suitable_reason = this.form.reason;
          const candidate_expectation = this.form.expected;
          const job_role_ids =
            this.form.roleJob.length > 0 ? this.form.roleJob : null; //nullable
          const job_level_array =
            this.form.levelJob.length > 0 ? this.form.levelJob : null; //nullable

          //---------------------------------------------------------------------
          // Candidate skills update data
          var candidate_skills = null; // nullable
          //Check update or delete available data
          if (
            this.candidate_skills_original.length !== 0 ||
            this.candidate_skills.length !== 0
          ) {
            candidate_skills = [];
            this.candidate_skills_original.forEach(
              (candidate_skill_original) => {
                var isExist = false;
                //Check candidate_skill_original is exist after update
                this.candidate_skills.forEach((candidate_skill) => {
                  if (candidate_skill._id) {
                    if (candidate_skill_original._id === candidate_skill._id) {
                      isExist = true;
                    }
                  }
                });
                //Handle available candidate_skill data if exist
                if (isExist) {
                  candidate_skills.push({
                    _id: candidate_skill_original._id,
                    skill_id: candidate_skill_original.skill_id._id,
                    year_of_experience:
                      candidate_skill_original.year_of_experience,
                    rating: candidate_skill_original.rating,
                  });
                }
                //Handle available canidate_skill data if not exist
                else {
                  candidate_skills.push({
                    _id: candidate_skill_original._id + "(delete)",
                    skill_id: candidate_skill_original.skill_id._id,
                    year_of_experience:
                      candidate_skill_original.year_of_experience,
                    rating: candidate_skill_original.rating,
                  });
                }
              }
            );

            //Check create data
            this.candidate_skills.forEach((candidate_skill) => {
              if (!candidate_skill._id) {
                candidate_skills.push({
                  skill_id: candidate_skill.skill_id._id,
                  year_of_experience: candidate_skill.year_of_experience,
                  rating: candidate_skill.rating,
                });
              }
            });
          }

          //---------------------------------------------------------------------
          // Candidate languages update data
          var candidate_languages = null; // nullable
          if (
            this.candidate_languages_original.length !== 0 ||
            this.candidate_languages.length !== 0
          ) {
            candidate_languages = [];
            //Check update or delete available data
            this.candidate_languages_original.forEach(
              (candidate_language_original) => {
                var isExist = false;
                this.candidate_languages.forEach((candidate_language) => {
                  if (candidate_language._id) {
                    if (
                      candidate_language_original._id === candidate_language._id
                    ) {
                      isExist = true;
                    }
                  }
                });
                //Handle available candidate_language data if exist
                if (isExist) {
                  candidate_languages.push({
                    _id: candidate_language_original._id,
                    language_id: candidate_language_original.language_id._id,
                    year_of_experience:
                      candidate_language_original.year_of_experience,
                    your_rating: candidate_language_original.your_rating,
                  });
                }
                //Handle available candidate_language data if not exist
                else {
                  candidate_languages.push({
                    _id: candidate_language_original._id + "(delete)",
                    language_id: candidate_language_original.language_id._id,
                    year_of_experience:
                      candidate_language_original.year_of_experience,
                    your_rating: candidate_language_original.your_rating,
                  });
                }
              }
            );
            // Check create data
            this.candidate_languages.forEach((candidate_language) => {
              if (!candidate_language._id) {
                candidate_languages.push({
                  language_id: candidate_language.language_id._id,
                  year_of_experience: candidate_language.year_of_experience,
                  your_rating: candidate_language.your_rating,
                });
              }
            });
          }

          //---------------------------------------------------------------------
          // Candidate experiences update data
          var work_experiences = null; //null
          if (
            this.candidate_experiences_original.length !== 0 ||
            this.candidate_experiences.length !== 0
          ) {
            work_experiences = [];
            //Check update or delete available data
            this.candidate_experiences_original.forEach(
              (candidate_experience_original) => {
                var isExist = false;
                this.candidate_experiences.forEach((candidate_experience) => {
                  if (candidate_experience._id) {
                    if (
                      candidate_experience_original._id ===
                      candidate_experience._id
                    ) {
                      isExist = true;
                    }
                  }
                });
                //Handle available candidate_experience data if exist
                if (isExist) {
                  var industry_ids = [];
                  candidate_experience_original.industry_ids.forEach(
                    (industry) => {
                      industry_ids.push(industry.id);
                    }
                  );

                  var job_role_ids = [];
                  candidate_experience_original.job_role_ids.forEach(
                    (job_role) => {
                      job_role_ids.push(job_role._id);
                    }
                  );

                  work_experiences.push({
                    _id: candidate_experience_original._id,
                    industry_ids: industry_ids,
                    job_role_ids: job_role_ids,
                    job_title: candidate_experience_original.job_title,
                    work_duration: candidate_experience_original.work_duration,
                  });
                }
                //Handle available candidate_experience data if not exist
                else {
                  var industry_ids = [];
                  candidate_experience_original.industry_ids.forEach(
                    (industry) => {
                      industry_ids.push(industry.id);
                    }
                  );

                  var job_role_ids = [];
                  candidate_experience_original.job_role_ids.forEach(
                    (job_role) => {
                      job_role_ids.push(job_role._id);
                    }
                  );

                  work_experiences.push({
                    _id: candidate_experience_original._id + "(delete)",
                    industry_ids: industry_ids,
                    job_role_ids: job_role_ids,
                    job_title: candidate_experience_original.job_title,
                    work_duration: candidate_experience_original.work_duration,
                  });
                }
              }
            );
            // Check create data
            this.candidate_experiences.forEach((candidate_experience) => {
              if (!candidate_experience._id) {
                var industry_ids = [];
                candidate_experience.industry_ids.forEach((industry) => {
                  industry_ids.push(industry.id);
                });

                var job_role_ids = [];
                candidate_experience.job_role_ids.forEach((job_role) => {
                  job_role_ids.push(job_role._id);
                });

                work_experiences.push({
                  industry_ids: industry_ids,
                  job_role_ids: job_role_ids,
                  job_title: candidate_experience.job_title,
                  work_duration: candidate_experience.work_duration,
                });
              }
            });
          }

          const data = {
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
            job_level_array,
            candidate_skills,
            candidate_languages,
            work_experiences,
          };

          const candidate_id = this.getCandidateId();
          this.updateCandidate({ candidate_id, data });
        }
        if (result.isDismissed) {
        }
      });
    },

    // Get candidate id
    getCandidateId() {
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

    //Get candidate detail by candidate id
    getCandidateDetailById() {
      const candidate_id = this.getCandidateId();
      this.getCandidateDetail({
        candidate_id,
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

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
    },

    updateCVFile(event) {
      const files = event.target.files;
      const cvfile = files[0];
      const candidate_id = this.getCandidateId();
      this.updateCV({
        cvfile,
        candidate_id,
      });
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" />
    <div class="col-12">
      <div class="tool-bar row">
        <div class="col-md-12 title d-flex align-items-center">
          <a href="./manage-candidate-for-collaborator">
            <button class="handleBack">
              <i class="fas fa-chevron-left"></i>
            </button>
          </a>

          <div class="titleCreate">
            <span>Cập nhật ứng viên</span>
          </div>
        </div>
      </div>

      <div class="col-12 d-flex flex-wrap">
        <div class="col-lg-5 col-12 mt-5">
          <div id="createCandidate">
            <div class="header d-flex" style="padding: 5px 15px">
              <div class="titleHeader" style="flex: 1">
                <span>Thông tin ứng viên</span>
              </div>
              <input
                type="file"
                id="inputUpload"
                @change="updateCVFile"
                hidden
              />
              <div class="handleCreateDiffCV">
                <button type="button" @click="onClickedUploadButton">
                  <i
                    class="fas fa-cloud-upload-alt"
                    style="margin-right: 5px"
                  ></i
                  >Cập nhật CV khác
                </button>
              </div>
            </div>
            <div class="bodyCreate">
              <div class="formCreated">
                <form @submit.prevent="updateCandidateDetail">
                  <div class="formCreatedContent candidate__update">
                    <div class="col-12 formCreateGroup inputEmail-candidate">
                      <i class="far fa-envelope"></i>
                      <label for=""
                        >Email ứng viên <span class="labelStar">*</span></label
                      >
                      <div class="inputForm">
                        <input
                          type="email"
                          placeholder="ví dụ: abc@gmail.com"
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-6 inputName-candidate">
                        <label for=""
                          >Tên ứng viên <span class="labelStar">*</span></label
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
                      <div class="col-6 inputTitle-candidate">
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-6 inputNumberPhone-candidate">
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
                            <span v-if="!$v.form.phone.numeric">
                              Số điện thoại không đúng định dạng *
                            </span>
                            <span v-if="!$v.form.phone.minLength"
                              >Số điện thoại quá ngắn, lớn hơn bằng 10 *</span
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-6 inputWorkPlace-candidate">
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
                      <div class="" style="width: 100%">
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
                          <label for=""
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
                          <label for=""
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
                          >Lương thấp nhất phải thấp hơn lương cao nhất *</span
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
                            'is-invalid': submitted && $v.form.expected.$error,
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-6 inputRoleJob-candidate">
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
                      <div class="col-6 inputLevelJob-candidate">
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-3 labelSkill-candidate">
                        <label for="">Kỹ năng ứng viên của bạn</label>
                      </div>
                      <div class="col-9 contentSkill-candidate">
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
                                :custom-label="nameWithLang"
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-3 labelLanguageSkill-candidate">
                        <label for="">Khả năng ngôn ngữ của ứng viên</label>
                      </div>
                      <div class="col-9 contentLanguageSkill-candidate">
                        <div
                          class="softSkills"
                          v-for="(language, index) in candidate_languages"
                          v-bind:key="index"
                        >
                          <div class="col-12 formCreateGroup">
                            <label for="">Ngôn ngữ {{ index + 1 }} </label>
                            <div class="inputForm">
                              <multiselect
                                v-model="candidate_languages[index].language_id"
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
                    <div class="col-12 formCreateGroup d-flex flex-wrap">
                      <div class="col-3 labelExperience-candidate">
                        <label for="">Kinh nghiệm làm việc</label>
                      </div>
                      <div class="col-9 contentExperience-candidate">
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
                          <div class="col-12 formCreateGroup d-flex flex-wrap">
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
                      <button
                        class="btnCancel"
                        v-on:click="backToSearchCandidate"
                      >
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
        <div class="col-lg-7 col-12 mt-5">
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
  </Layout>
</template>


<style lang="scss">
.modal-xl {
  @media screen and(min-width:1200px) {
    max-width: 1450px !important;
  }
}
.actionHandleForm {
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

.inputEmail-candidate {
  .inputForm{
    input{
      width: 100% !important;
    }
  }
}

.inputTitle-candidate, .inputWorkPlace-candidate, .inputLevelJob-candidate, .contentSkill-candidate, .contentLanguageSkill-candidate, .contentExperience-candidate{
  padding-left: 10px;
  @media (max-width: 420px) {
      padding-left: 0;
      width: 100% !important;
  }
  .inputForm{
    input{
      // width: 100% !important;
    }
  }
}

.inputName-candidate, .inputNumberPhone-candidate, .inputRoleJob-candidate, .labelSkill-candidate, .labelLanguageSkill-candidate, .labelExperience-candidate{
  padding-right: 10px;
  @media (max-width: 420px) {
      width: 100% !important;
      padding-right: 0;
      padding-bottom: 10px;
  }
}

.candidate__update{
  .multiselect__tags{
    display: block;
    border-radius: 5px;
    border: 1px solid #e8e8e8 !important;
    background-color: #fff !important;
  }
}
</style>
