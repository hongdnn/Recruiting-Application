<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Swal from "sweetalert2";
import Multiselect from "vue-multiselect";
import { required } from "vuelidate/lib/validators";
import { mapActions } from "vuex";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import FileSaver from "file-saver";

export default {
  page: {
    title: "Chi tiết ứng viên",
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
      // Check warranty
      isShowWarrantyConfirm: false,
      isShowWarrantyButton: false,

      // Introduction status list
      introduction_status: [
        {
          id: "1",
          name: "Pending",
        },
        {
          id: "2",
          name: "Employer decline",
        },
        {
          id: "3",
          name: "Employer accept",
        },
        {
          id: "4",
          name: "Company viewed",
        },
        {
          id: "5",
          name: "Company reject",
        },
        {
          id: "6",
          name: "Company accept",
        },
        {
          id: "7",
          name: "Send test",
        },
        {
          id: "8",
          name: "Submit test",
        },
        {
          id: "9",
          name: "Failed test",
        },
        {
          id: "10",
          name: "Passed test",
        },
        {
          id: "11",
          name: "Schedule interview",
        },
        {
          id: "12",
          name: "Candidate reject interview",
        },
        {
          id: "13",
          name: "Interviewed",
        },
        {
          id: "14",
          name: "Failed interview",
        },
        {
          id: "15",
          name: "Offer",
        },
        {
          id: "16",
          name: "Onboard",
        },
        {
          id: "17",
          name: "Completed",
        },
        {
          id: "18",
          name: "Resign",
        },
      ],

      // Selected introduction status
      selected_introduction_status: {},

      // Update introduction status input data
      update_status_data: {
        note: null,
        status: null,
        onboardDate: null,
        workEndDate: null,
      },

      // Current introduction status
      current_status: null,

      // List candidate to warranty
      candidates_to_warranty: [],

      // Review placement before create
      review_placement: {},

      //Search candidate to refer
      timer: 0,

      // Locations
      locations: [
        {
          id: 0,
          name: "Tất cả vị trí",
        },
      ],
      location: {
        id: 0,
        name: "Tất cả vị trí",
      },

      //Salary and Currency
      currencies: [
        {
          id: 0,
          name: "Tất cả tiền tệ",
        },
        {
          id: "VND",
          name: "VND",
        },
        {
          id: "USD",
          name: "USD",
        },
      ],
      salary_in_usd: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
        {
          id: 1,
          name: "<= $500",
          salary_from: 0,
          salary_to: 500,
        },
        {
          id: 2,
          name: "$500 - $1000",
          salary_from: 500,
          salary_to: 1000,
        },
        {
          id: 3,
          name: "$1000 - $1500",
          salary_from: 1000,
          salary_to: 1500,
        },
        {
          id: 4,
          name: "$1500 - $2000",
          salary_from: 1500,
          salary_to: 2000,
        },
        {
          id: 5,
          name: "$2000 - $3000",
          salary_from: 2000,
          salary_to: 3000,
        },
        {
          id: 6,
          name: ">= $3000",
          salary_from: 3000,
          salary_to: "",
        },
      ],
      salary_in_vnd: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
        {
          id: 1,
          name: "<= 10.000.000 VND",
          salary_from: 0,
          salary_to: 10000000,
        },
        {
          id: 2,
          name: "10.000.000 - 20.000.000 VND",
          salary_from: 10000000,
          salary_to: 20000000,
        },
        {
          id: 3,
          name: "20.000.000 - 30.000.000 VND",
          salary_from: 20000000,
          salary_to: 30000000,
        },
        {
          id: 4,
          name: "30.000.000 - 40.000.000 VND",
          salary_from: 30000000,
          salary_to: 40000000,
        },
        {
          id: 5,
          name: "40.000.000 - 60.000.000 VND",
          salary_from: 40000000,
          salary_to: 60000000,
        },
        {
          id: 6,
          name: ">= 60.000.000 VND",
          salary_from: 60000000,
          salary_to: "",
        },
      ],
      salaries: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
      ],
      currency: {
        id: 0,
        name: "Tất cả tiền tệ",
      },
      salary: {
        id: 0,
        name: "Tất cả khoản lương",
        salary_from: "",
        salary_to: "",
      },

      //Sort
      sorts: [
        {
          id: 0,
          name: "Ngày giới thiệu",
        },
        {
          id: 1,
          name: "Tên ứng viên",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày giới thiệu",
      },

      //Date
      dateFrom: "",
      dateTo: "",
      timestampFrom: 0,
      timestampTo: 0,

      // Search
      search_require: "",
      search_optional: "",

      // Page
      page_index: 0,
      page_size: 30,

      //Response data
      candidates: [],
      introductions: [],
      test_reports: [],
      total_count: 0,

      submitted: false,
      roleJob: {
        id: 0,
        name: "Account Managerment",
      },
      roleJobCompanys: [
        {
          id: 0,
          name: "Account Managerment",
        },
        {
          id: 1,
          name: "Administration",
        },
        {
          id: 2,
          name: "Backend",
        },
        {
          id: 3,
          name: "Account Managerment",
        },
        {
          id: 4,
          name: "Frontend",
        },
        {
          id: 5,
          name: "Fullstack",
        },
      ],
      roleJobCompany: null,
      careerCompany: null,
      careerCompanys: [
        {
          id: 0,
          name: "Agriculture/Forestry",
        },
        {
          id: 1,
          name: "Architecture/Interior Design ",
        },
        {
          id: 2,
          name: "Airlines/Tourism ",
        },
        {
          id: 3,
          name: "Auto/Automotive",
        },
        {
          id: 4,
          name: "Auditing",
        },
        {
          id: 5,
          name: "Arts/Design  ",
        },
      ],
      levelJobs: [
        {
          id: 0,
          name: "Director",
        },
        {
          id: 1,
          name: "Department Head",
        },
        {
          id: 2,
          name: "Junior",
        },
        {
          id: 3,
          name: "Assistant Manager",
        },
        {
          id: 4,
          name: "Senior",
        },
        {
          id: 5,
          name: "Manager ",
        },
      ],
      levelJob: null,
      locations: [
        {
          id: 0,
          name: "Tp. Hồ Chí Minh",
        },
        {
          id: 1,
          name: "Nha Trang",
        },
        {
          id: 2,
          name: "Hà Nội",
        },
        {
          id: 3,
          name: "Đà Lạt",
        },
        {
          id: 4,
          name: "Cần Thơ",
        },
        {
          id: 5,
          name: "Đà Nẵng",
        },
        {
          id: 6,
          name: "New York",
        },
        {
          id: 7,
          name: "HongKong",
        },
        {
          id: 8,
          name: "Canada",
        },
      ],
      interviewer: [
        { name: "Nguyễn Văn A" },
        { name: "Nguyễn Văn B" },
        { name: "Nguyễn Văn C" },
        { name: "Nguyễn Văn D" },
        { name: "Nguyễn Văn E" },
        { name: "Nguyễn Văn F" },
      ],
      listInforPv: [
        {
          id: 0,
          round: 1,
          typeInterview: "Phỏng vấn offline",
          description:
            "Being blessed with responsibility and learning ability, i want to apply for your company aiming at developing companie's product line along with Improvingexperience, learning new technology, self growing which are my biggest goal in the future with the hope to contribute to thedevelopment of the company.",
          dayStart: "17/6/2021",
          dayEnd: "22/6/2021",
          statusInterview: "Thành công",
          interviewer: "Nguyễn Thị Tuyết Như",
          location:
            "Lầu 22 tòa kicsomrein, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
          note: "Looking for a job, a good environment to develop myself",
        },
        {
          id: 1,
          round: 2,
          typeInterview: "Phỏng vấn online",
          description:
            "Being blessed with responsibility and learning ability, i want to apply for your company aiming at developing companie's product line along with Improvingexperience, learning new technology, self growing which are my biggest goal in the future with the hope to contribute to thedevelopment of the company.",
          dayStart: "22/6/2021",
          dayEnd: "11/9/2021",
          statusInterview: "Thất bại",
          interviewer: "Nguyễn Thị Vân Trang",
          location:
            "Lầu 22 tòa kicsomrein, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
          note: "Looking for a job, a good environment to develop myself",
        },
      ],
      location: {
        id: 0,
        name: "Hồ Chí Minh",
      },
      softSkill: [],
      languageSkill: [],
      workExperience: [],
      form: {
        email: null,
        name: null,
        title: null,
        phone: null,
        areaWork: null,
        workAfterDay: null,
        lowestSalary: null,
        highestSalary: null,
        expected: null,
        reason: null,
        currentSalary: null,
        roleJob: null,
        levelJob: null,
      },
      supervisors: [],
      formBook: {
        address: null,
        date: null,
        start_time: null,
        end_time: null,
        interviewer: null,
        content: null,
        noteCTV: null,
      },
      introduction_detail: {},
    };
  },
  validations: {
    formBook: {
      date: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
      },
      interviewer: {
        required,
      },
    },
  },
  mounted() {
    this.getCandidateIntroductionDetail();
    this.getCitiesForFilter();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "introductions/getIntroductionDetailSuccess":
          //Get candidate introduction detail
          this.introduction_detail =
            state.introductions.introductionDetailData.data;
          const statusHistories =
            state.introductions.introductionDetailData.data.status_histories;
          const lastStatus = statusHistories[0];
          this.current_status = this.getStatusObject(lastStatus.status);

          this.checkToShowConfirmWarranty();
          this.checkShowWarrantyButton();

          // Get test report data
          this.test_reports = this.introduction_detail.post.question_packages;
          this.getTestReportData();
          break;
        case "interview/getSupervisorSuccess":
          this.supervisors = state.interview.supervisorsData.employers;
          break;
        case "introductions/getListCandidateToWarrantySuccess":
          this.candidates_to_warranty =
            state.introductions.candidatesToWarrantyData.candidateIntroductions;
          break;
        case "introductions/getReviewPlacementSuccess":
          this.review_placement = state.introductions.reviewPlacementData.data;
          break;
        case "introductions/updateStatusSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.$bvModal.hide("update-status");
              this.getCandidateIntroductionDetail();
            }
          );
          break;
        case "introductions/updateStatusFailure":
          Swal.fire("Cập nhật trạng thái không thành công", "", "error").then(
            () => {}
          );
          break;
        case "introductions/createWarrantySuccess":
          Swal.fire("Tạo bảo hành thành công", "", "success").then(() => {
            const introduction_id = this.getCandidateIntroductionId();
            const domain = window.location.origin;
            const url =
              domain +
              "/refer-candidate-detail-collaborator?id=" +
              introduction_id;
            window.location.href = url;
          });
          break;
        case "introductions/createWarrantyFailure":
          Swal.fire("Tạo bảo hành không thành công", "", "error").then(
            () => {}
          );
          break;
        case "placement/createPlacementSuccess":
          Swal.fire("Tạo thanh toán thành công", "", "success").then(() => {
            this.$bvModal.hide("create-placement");
          });
          break;
        case "placement/createPlacementFailure":
          Swal.fire("Tạo thanh toán không thành công", "", "error").then(
            () => {}
          );
          break;
        case "cities/getCitiesSuccess":
          //Get cities
          if (
            this.locations.length <
            state.cities.citiesData.cities.length + 1
          ) {
            this.locations = this.locations.concat(
              state.cities.citiesData.cities
            );
          }
          break;
        case "candidates/searchCandidateToReferSuccess":
          //Get all candidate
          this.candidates = state.candidates.candidateData.candidates;
          this.total_count = state.candidates.candidateData.totalCount;
          break;
        case "introductions/getCandidatesToWarrantySuccess":
          this.introductions =
            state.introductions.candidatesToWarrantyData.candidateIntroductions;
          break;
        case "introductions/getTestReportSuccess":
          this.test_reports = state.introductions.testReportData.data;
          break;
        case "introductions/downloadCVSuccess":
          const data = state.introductions.downloadCVData;
          const cv_type = this.getFileExtension(
            this.introduction_detail.cv
          )[0];

          switch (cv_type) {
            case "pdf":
              FileSaver.saveAs(new Blob([data]), `${this.introduction_detail.name}.pdf`);
              break;
            case "docx":
              FileSaver.saveAs(new Blob([data]), `${this.introduction_detail.name}.docx`);
              break;
          }
          break;
      }
    });
  },
  watch: {
    search_value: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchPost();
      }, 800);
    },
    currency: function () {
      if (this.currency.id === "VND") {
        this.salaries = this.salary_in_vnd;
      } else if (this.currency.id === "USD") {
        this.salaries = this.salary_in_usd;
      } else {
        this.salary = {
          id: 0,
          name: "Tất cả",
          salary_from: "",
          salary_to: "",
        };
        this.salaries = [
          {
            id: 0,
            name: "Tất cả",
            salary_from: "",
            salary_to: "",
          },
        ];
      }
    },
    dateFrom: function () {
      const date = new Date(document.getElementById("dateFrom").value);
      this.timestampFrom = date.getTime();
    },
    dateTo: function () {
      const date = new Date(document.getElementById("dateTo").value);
      this.timestampTo = date.getTime();
    },
    Location: function () {
      this.searchCandidate();
    },
    salary: function () {
      this.searchCandidate();
    },
    sort: function () {
      this.searchCandidate();
    },
    timestampFrom: function () {
      this.searchCandidate();
    },
    timestampTo: function () {
      this.searchCandidate();
    },
    search_require: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchIntroduction();
      }, 800);
    },
    search_optional: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchCandidate();
      }, 800);
    },
  },
  methods: {
    ...mapActions("introductions", [
      "getIntroductionDetail",
      "updateIntroductionStatus",
      "getListCandidateToWarranty",
      "getReviewPlacement",
      "createWarranty",
      "searchCandidateToWarranty",
      "chooseCandidateToWarranty",
      "getTestReport",
      "downloadCV"
    ]),
    ...mapActions("interview", ["getSupervisor", "createSchedule"]),
    ...mapActions("placement", ["createPlacement"]),
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("candidates", ["searchCandidateToRefer"]),

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    //Download cv
    downloadCVFile() {
      const id = this.introduction_detail._id

      this.downloadCV(id);
    },

    // Convert array to string
    readArray(arr) {
      var s = "";
      arr.forEach((element, index) => {
        if (index < arr.length - 1) {
          s = s + element + ", ";
        } else {
          s = s + element;
        }
      });
      return s;
    },

    // Get test report
    getTestReportData() {
      const candidate_introduction_id = this.getCandidateIntroductionId();
      const question_packages = this.test_reports;

      const data = {
        candidate_introduction_id,
        question_packages,
      };

      this.getTestReport(data);
    },

    //Split multiselect field
    convertToMultiString(value) {
      const data = value.split(";");
      var result = "";
      data.forEach((item, index) => {
        if (index < data.length - 2) {
          result = result + item + ", ";
        } else {
          result = result + item;
        }
      });
      return result;
    },

    // Convert industry string to array:
    convertToIndustryString(industries) {
      var industry_string = "";
      industries.forEach((industry, index) => {
        if (index < industries.length - 1) {
          industry_string = industry_string + industry.name + ", ";
        } else {
          industry_string = industry_string + industry.name;
        }
      });
      return industry_string;
    },

    //Get candidate introduction detail:
    getCandidateIntroductionDetail() {
      const introduction_id = this.getCandidateIntroductionId();

      this.getIntroductionDetail(introduction_id);
    },

    //Get candidate introduction id:
    getCandidateIntroductionId() {
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

    //Get guaranteed introduction id:
    getGuaranteedIntroductionId() {
      var id = "";
      var url = window.location.href;

      // Get id value
      var name = "warrantyId";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      id = decodeURIComponent(results[2].replace(/\+/g, " "));

      return id;
    },

    //Check show confirm warranty view
    checkToShowConfirmWarranty() {
      var url = window.location.href;
      this.isShowWarrantyConfirm =
        url.search("warrantyId") == -1 ? false : true;
    },

    //Confirm warranty
    confirmWarranty() {
      const guaranteed_candidate_introuduction_id =
        this.getGuaranteedIntroductionId();
      const alternative_candidate_introuduction_id =
        this.getCandidateIntroductionId();

      const data = {
        guaranteed_candidate_introuduction_id,
        alternative_candidate_introuduction_id,
      };

      this.chooseCandidateToWarranty(data);
    },

    //Cancel confirm warranty
    cancelConfirmWarranty() {
      const introduction_id = this.getGuaranteedIntroductionId();
      const domain = window.location.origin;
      const url =
        domain + "/refer-candidate-detail-collaborator?id=" + introduction_id;
      window.location.href = url;
    },

    //Convert timestamp
    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    //Get create schedule popup id
    getCreateSchedulePopupId(interview_id) {
      return "popup-" + interview_id;
    },

    //Get list supervisor
    getListSupervisor() {
      this.getSupervisor();
    },

    //Get date time
    getDateTimeString(timestamp) {
      var date = new Date(timestamp);

      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      return (
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear() +
        " " +
        hours +
        ":" +
        minutes.substr(-2) +
        ":" +
        seconds.substr(-2)
      );
    },

    //Show create warranty popup view
    showListCandidateToWarranty() {
      // this.searchCandidate();
      this.searchIntroduction();
      this.$refs["modal-xl"].show();
    },

    // //Show update schedule popup view
    // showUpdateStatus() {
    //   this.selected_introduction_status = {
    //     id: this.current_status.id,
    //     name: this.current_status.name,
    //   };

    //   this.$refs["update-status"].show();
    // },

    // //Show list candidate to warranty popup view
    // showListCandidateToWarranty() {
    //   this.candidates_to_warranty = [];
    //   const post_id = this.introduction_detail.post._id;
    //   this.getListCandidateToWarranty(post_id);

    //   this.$refs["list-candidate-to-warranty"].show();
    // },

    // //Show create placement to
    // showCreatePlacement() {
    //   this.review_placement = {};
    //   const introduction_id = this.getCandidateIntroductionId();
    //   this.getReviewPlacement(introduction_id);

    //   this.$refs["create-placement"].show();
    // },

    //Update status
    // updateStatus() {
    //   Swal.fire({
    //     title: "Xác nhận cập nhật trạng thái",
    //     icon: "question",
    //     showCancelButton: true,
    //     confirmButtonColor: "#3085d6",
    //     cancelButtonColor: "#d33",
    //     confirmButtonText: "Đồng ý",
    //     cancelButtonText: "Quay lại",
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       const candidateIntroductionId = this.getCandidateIntroductionId();
    //       const status = this.update_status_data.status;
    //       var onboardDate = null;
    //       var workEndDate = null;
    //       const note = this.update_status_data.note;

    //       if (this.update_status_data.onboardDate !== null) {
    //         const date = new Date(this.update_status_data.onboardDate);
    //         onboardDate = date.getTime() + "";
    //       }

    //       if (this.update_status_data.workEndDate) {
    //         const date = new Date(this.update_status_data.workEndDate);
    //         workEndDate = date.getTime() + "";
    //         onboardDate = this.introduction_detail.onboard_date + "";
    //       }

    //       const data = {
    //         candidateIntroductionId,
    //         status,
    //         onboardDate,
    //         workEndDate,
    //         note,
    //       };

    //       this.updateIntroductionStatus(data);
    //     }
    //     if (result.isDismissed) {
    //     }
    //   });
    // },

    // Cancel update status
    // cancelUpdateStatus() {
    //   this.update_status_data = {
    //     note: null,
    //     status: null,
    //     onboardDate: null,
    //     workEndDate: null,
    //   };
    //   this.$bvModal.hide("update-status");
    // },

    // Get status object from status string
    getStatusObject(statusString) {
      var status = {};

      switch (statusString.toLowerCase()) {
        case "pending":
          status = {
            id: "1",
            name: "Pending",
          };
          break;
        case "employer decline":
          status = {
            id: "2",
            name: "Employer decline",
          };
          break;
        case "employer accept":
          status = {
            id: "3",
            name: "Employer accept",
          };
          break;
        case "company viewed":
          status = {
            id: "4",
            name: "Company viewed",
          };
          break;
        case "company reject":
          status = {
            id: "5",
            name: "Company reject",
          };
          break;
        case "company accept":
          status = {
            id: "6",
            name: "Company accept",
          };
          break;
        case "send test":
          status = {
            id: "7",
            name: "Send test",
          };
          break;
        case "submit test":
          status = {
            id: "8",
            name: "Submit test",
          };
          break;
        case "failed test":
          status = {
            id: "9",
            name: "Failed test",
          };
          break;
        case "passed test":
          status = {
            id: "10",
            name: "Passed test",
          };
          break;
        case "schedule interview":
          status = {
            id: "11",
            name: "Schedule interview",
          };
          break;
        case "candidate reject interview":
          status = {
            id: "12",
            name: "Candidate reject interview",
          };
          break;
        case "interviewed":
          status = {
            id: "13",
            name: "Interviewed",
          };
          break;
        case "failed interview":
          status = {
            id: "14",
            name: "Failed interview",
          };
          break;
        case "offer":
          status = {
            id: "15",
            name: "Offer",
          };
          break;
        case "onboard":
          status = {
            id: "16",
            name: "Onboard",
          };
          break;
        case "completed":
          status = {
            id: "17",
            name: "Completed",
          };
          break;
        case "resign":
          status = {
            id: "18",
            name: "Resign",
          };
          break;
      }

      return status;
    },

    // Create placement
    // createPlacementForIntroduction() {
    //   Swal.fire({
    //     title: "Xác nhận tạo placement",
    //     icon: "question",
    //     showCancelButton: true,
    //     confirmButtonColor: "#3085d6",
    //     cancelButtonColor: "#d33",
    //     confirmButtonText: "Đồng ý",
    //     cancelButtonText: "Quay lại",
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       const introductionId = this.getCandidateIntroductionId();
    //       const reward_amount = this.review_placement.rewardAmount;
    //       const bonus = this.review_placement.bonus;
    //       const placement_date = this.review_placement.placementDate;
    //       const currency = this.review_placement.currency;

    //       const data = {
    //         candidate_introduction_id: introductionId,
    //         reward_amount: reward_amount,
    //         placement_date: placement_date,
    //         currency: currency,
    //         bonus: bonus,
    //       };
    //       console.log(data);

    //       this.createPlacement(data);
    //     }
    //     if (result.isDismissed) {
    //     }
    //   });
    // },

    // Cancel create placement
    // cancelCreatePlacement() {
    //   this.review_placement = {};
    //   this.$bvModal.hide("create-placement");
    // },

    // Create warranty
    // createWarrantyForIntroduction(newIntroductionId) {
    //   Swal.fire({
    //     title: "Xác nhận chọn ứng viên để bảo hành",
    //     icon: "question",
    //     showCancelButton: true,
    //     confirmButtonColor: "#3085d6",
    //     cancelButtonColor: "#d33",
    //     confirmButtonText: "Đồng ý",
    //     cancelButtonText: "Quay lại",
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       const alternative_candidate_introuduction_id = newIntroductionId;
    //       const guaranteed_candidate_introuduction_id =
    //         this.getCandidateIntroductionId();

    //       const data = {
    //         alternative_candidate_introuduction_id,
    //         guaranteed_candidate_introuduction_id,
    //       };

    //       this.createWarranty(data);
    //     }
    //     if (result.isDismissed) {
    //     }
    //   });
    // },

    // Get status type to render color
    getStatusType(status_string) {
      const status = this.getStatusObject(status_string);
      switch (status.id) {
        case "1":
        case "4":
        case "7":
        case "8":
        case "11":
          return "pending";
        case "2":
        case "5":
        case "9":
        case "12":
        case "14":
        case "18":
          return "warning";
        case "3":
        case "6":
        case "10":
        case "13":
        case "15":
        case "16":
        case "17":
          return "success";
      }
    },

    //Get job level string
    getJobLevels() {
      var jon_levels_string = "";
      if (
        this.introduction_detail.job_levels !== "" &&
        this.introduction_detail.job_levels !== null
      ) {
        const job_levels = this.introduction_detail.job_levels.split(",");
        console.log(job_levels);
        job_levels.forEach((job_level, index) => {
          if (index < job_levels.length - 1) {
            jon_levels_string = jon_levels_string + job_level + ", ";
          } else {
            jon_levels_string = jon_levels_string + job_level;
          }
        });
      }
      return jon_levels_string;
    },

    //Get job role string
    getJobRoleString() {
      var job_role_string = "";
      if (
        this.introduction_detail.job_roles.length > 0 &&
        this.introduction_detail.job_roles !== null
      ) {
        this.introduction_detail.job_roles.forEach((job_role, index) => {
          if (index < this.introduction_detail.job_roles.length - 1) {
            job_role_string = job_role_string + job_role.name + ", ";
          } else {
            job_role_string = job_role_string + job_role.name;
          }
        });
      }
      return job_role_string;
    },

    //Open CV in new tab
    openCV() {
      if (this.introduction_detail.cv) {
        const cv_type = this.getFileExtension(
          this.introduction_detail.cv
        )[0];
        switch (cv_type) {
          case "pdf":
            window.open(
              generateApiUrl(this.introduction_detail.cv),
              "_blank"
            );
            break;
          case "docx":
            window.open(
              "https://view.officeapps.live.com/op/view.aspx?src=" +
                generateApiUrl(
                  this.introduction_detail.cv
                ) +
                "&embedded=true",
              "_blank"
            );
            break;
        }
      }
    },

    getCitiesForFilter() {
      this.getCitiesList();
    },

    searchCandidate() {
      const postId = this.introduction_detail.post._id;
      const name = "";
      const salary_from = this.salary.salary_from;
      const salary_to = this.salary.salary_to;
      const date_from = this.timestampFrom;
      const date_to = this.timestampTo;
      const city_ids = this.location.id;
      const keyword_cv_require = this.search_require;
      const keyword_cv_optional = this.search_optional;
      const page_index = this.page_index;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
      const currency = this.currency.id;

      this.searchCandidateToRefer({
        postId,
        name,
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        keyword_cv_require,
        keyword_cv_optional,
        page_index,
        page_size,
        sort_by,
        currency,
      });
    },

    searchIntroduction() {
      const keyword = this.search_require;
      const sort_by = this.sort.id;
      const page_index = 0;
      const page_size = 20;
      const postId = this.introduction_detail.post._id;

      this.searchCandidateToWarranty({
        keyword,
        postId,
        page_index,
        page_size,
        sort_by,
      });
    },

    //Select candidate to warranty
    referCandidateToWarranty(introduction_id) {
      const warrantyId = this.getCandidateIntroductionId();
      return (
        "/refer-candidate-detail-collaborator?id=" +
        introduction_id +
        "&warrantyId=" +
        warrantyId
      );
    },

    onClickedUploadButton() {
      document.getElementById("inputUpload").click();
    },

    uploadCV(event) {
      this.path_cv_hided = event.target.files[0];
      const cvfile = this.path_cv_hided;
      this.uploadCVFile({
        cvfile,
      });
    },

    //Hide schedule interview popup view
    // hideCreateSchedule(id) {
    //   this.$bvModal.hide(id);
    // },

    //Create schedule interview
    // formSubmitBooking(interview_id) {
    //   Swal.fire({
    //     title: "Xác nhận đặt lịch phỏng vấn",
    //     icon: "question",
    //     showCancelButton: true,
    //     confirmButtonColor: "#3085d6",
    //     cancelButtonColor: "#d33",
    //     confirmButtonText: "Đồng ý",
    //     cancelButtonText: "Quay lại",
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.submitted = true;
    //       this.$v.$touch();

    //       console.log(interview_id);
    //       const candidate_introduction_id = this.getCandidateIntroductionId();
    //       const location = this.formBook.address;

    //       const date = this.formBook.date;
    //       const start_time = this.formBook.start_time;
    //       const end_time = this.formBook.end_time;

    //       const interview_start_date_string = date + " " + start_time + ":00";
    //       const interview_end_date_string = date + " " + end_time + ":00";

    //       const start_date = new Date(interview_start_date_string);
    //       const end_date = new Date(interview_end_date_string);

    //       const interview_start_date = start_date.getTime();
    //       const interview_end_date = end_date.getTime();

    //       const supervisor_id = this.formBook.interviewer.id;
    //       const note = this.formBook.noteCTV;

    //       const data = {
    //         interview_id,
    //         candidate_introduction_id,
    //         interview_start_date,
    //         interview_end_date,
    //         supervisor_id,
    //       };

    //       if (location) {
    //         data.location = Location;
    //       }

    //       if (note) {
    //         data.note = note;
    //       }

    //       console.log(data);
    //       this.createSchedule(data).then(() => {
    //         this.getCandidateIntroductionDetail();

    //         this.formBook.address = null;
    //         this.formBook.date = null;
    //         this.formBook.start_time = null;
    //         this.formBook.end_time = null;
    //         this.formBook.interviewer = null;
    //         this.formBook.content = null;
    //         this.formBook.noteCTV = null;

    //         this.submitted = false;

    //         Swal.fire("Đặt lịch hẹn thành công", "", "success").then(() => {
    //           const id = this.getCreateSchedulePopupId(interview_id);
    //           this.$bvModal.hide(id);
    //         });
    //       });
    //     }
    //     if (result.isDismissed) {
    //     }
    //   });
    // },

    checkShowWarrantyButton() {
      console.log("checkShowWarrantyButton");

      //Kiểm tra nếu ứng viên chưa onboard mà resign thì không được bảo hành:
      if (this.introduction_detail.work_end_date === null) {
        return;
      }

      //Kiểm tra điều kiện đầu vào là giới thiệu có ở trạng thái resign không
      if (
        this.introduction_detail.status_histories &&
        this.introduction_detail.status_histories[0].status.toLowerCase() !==
          "resign"
      ) {
        this.isShowWarrantyButton = false;
        return;
      }

      //Kiểm tra nếu giới thiệu này đã đc đem bảo hành cho người khác thì không hiện nút bảo hành
      if (this.introduction_detail.candidateGuaranteed !== null) {
        this.isShowWarrantyButton = false;
        return;
      }

      //Phân loại bảo hành
      console.log(this.introduction_detail.post.guarantee_type);
      switch (this.introduction_detail.post.guarantee_type) {
        case "Bảo hành theo giai đoạn":
          if (this.introduction_detail.alternativeCandidates === null) {
            this.isShowWarrantyButton = true;
            return;
          } else {
            this.isShowWarrantyButton = false;
            return;
          }
          break;
        case "Bảo hành toàn diện":
          if (this.introduction_detail.alternativeCandidates === null) {
            this.isShowWarrantyButton = true;
            return;
          } else {
            const warranty_count =
              this.introduction_detail.alternativeCandidates.length;
            if (
              this.introduction_detail.alternativeCandidates[warranty_count - 1]
                .status === "Failed"
            ) {
              this.isShowWarrantyButton = true;
              return;
            } else {
              this.isShowWarrantyButton = false;
              return;
            }
          }
          break;
        default:
          this.isShowWarrantyButton = false;
          return;
          break;
      }

      // if (
      //   this.introduction_detail.status_histories &&
      //   this.introduction_detail.status_histories[0].status.toLowerCase() ===
      //     "resign"
      // ) {
      //   switch (this.introduction_detail.post.guarantee_type) {
      //     case "Bảo hành theo giai đoạn":
      //       console.log("Bảo hành theo giai đoạn");
      //       if (
      //         this.introduction_detail.alternativeCandidates.status &&
      //         this.introduction_detail.alternativeCandidates.status.toLowerCase() ===
      //           "not complete"
      //       ) {
      //         if (
      //           this.introduction_detail.alternativeCandidates
      //             .alternative_candidate_introuduction ||
      //           this.introduction_detail.alternativeCandidates
      //             .alternative_candidate_introuduction === null
      //         ) {
      //           if (
      //             !this.introduction_detail.alternativeCandidates
      //               .guaranteed_candidate_introuduction
      //           ) {
      //             return true;
      //           }
      //         }
      //       }
      //       break;
      //     case "Bảo hành toàn diện":
      //       console.log("Bảo hành toàn diện");
      //       if (
      //         this.introduction_detail.alternativeCandidates.status &&
      //         this.introduction_detail.alternativeCandidates.status.toLowerCase() ===
      //           "not complete"
      //       ) {
      //         if (
      //           this.introduction_detail.alternativeCandidates
      //             .alternative_candidate_introuduction ||
      //           this.introduction_detail.alternativeCandidates
      //             .alternative_candidate_introuduction === null
      //         ) {
      //           if (
      //             !this.introduction_detail.guaranteed_candidate_introuduction
      //           ) {
      //             return true;
      //           }
      //         }
      //       } else {
      //         if (
      //           this.introduction_detail.alternativeCandidates
      //             .guaranteed_candidate_introuduction &&
      //           !this.introduction_detail.alternativeCandidates
      //             .alternative_candidate_introuduction
      //         ) {
      //           return true;
      //         }
      //       }
      //       break;
      //   }
      // }
      // return false;
    },
  },
};
</script>

<template>
  <Layout>
    <PageHeader/>
                    <b-modal
                      id="modal-xl"
                      ref="modal-xl"
                      size="lg "
                      title="Giới thiệu ứng viên"
                      title-class="font-18"
                      hide-footer
                    >
                      <div class="modalContent">
                        <div class="">
                        <div class="" style="padding: 10px 15px;position: relative;">
                          <div class="headerUpload">
                            <span>Chọn từ danh sách ứng viên của bạn</span>
                          </div>
                          <!--  -->
                          <div class="filter-search d-flex mt-3">
                              <div class="position-relative inputSearch">
                                <i class="fas fa-search"></i>
                                <input
                                  type="text"
                                  class="form-control"
                                  id="inputEmail4"
                                  placeholder="Nhập từ khóa để tìm kiếm"
                                  v-model="search_require"
                                />
                              </div>
                              <div class="handleActionSearch">
                                <button
                                  type="button"
                                  class="btn btn-search"
                                  v-on:click="searchIntroduction"
                                >
                                  Tìm kiếm
                                </button>
                              </div>
                            </div>
                          <div
                            class="header justify-content-between d-flex mt-2"
                            style=""
                          >
                            <div
                              class="d-flex align-items-center"
                              style="font-size: 14px; font-weight: 500"
                            >
                              <span style="margin-right: 4px">{{
                                this.introductions.length
                              }}</span>
                              Ứng viên
                            </div>
                            <div
                              class="d-flex sort align-items-center"
                              style="padding-right: 20px"
                            >
                              <span
                                ><i class="fas fa-exchange-alt iconSort"></i>Sắp
                                xếp theo:</span
                              >

                              <multiselect
                               v-model="sort"
                                label="name"
                                :options="sorts"
                                :allow-empty="false"
                                :show-labels="false"
                                style="width: 200px; z-index: 999"
                              ></multiselect>
                            </div>
                          </div>
                        
                        </div>
                        
                        </div>
                     
                        <div class="tableRender mt-2">
                          
                            <div class="row">
                              <div class="col-12">
                                <div class="card" style="border-radius: 10px">
                                  <div class="">
                                    <div class="table-responsive">
                                      <table class="table mb-0">
                                        <thead class="thead-light">
                                          <tr>
                                            <th>Ngày tạo</th>
                                            <th>Tên</th>
                                            <th>Số điện thoại</th>
                                            <th>Công việc</th>
                                            <th>Công ty</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                          </tr>
                                        </thead>
                                        <tbody v-for="introduction in introductions" v-bind:key="introduction.candidate_introduction_id">
                                          <tr>
                                            <td>{{ getDateString(introduction.introduction_date) }}</td>
                                            <th scope="row">{{ introduction.candidate_name }}
                                            <td><span class="seenCv">Xem CV</span></td>
                                            </th>
                                            <td>{{ introduction.phone }}</td>
                                            <td>{{ introduction.post_title }}</td>
                                            <td>{{ introduction.company }}</td>
                                            <td>{{ introduction.status }}</td>

                                            <td>
                                              <a v-bind:href="referCandidateToWarranty(introduction.candidate_introduction_id)">
                                                    <button
                                                type="button"
                                                class="btnSelectDetail"
                                              >
                                                Chọn
                                              </button></a>
                                        
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                         
                          
                          </div>
                      </div>
                    </b-modal>

    <!-- <b-modal
      id="update-status"
      centered
      size="lg"
      title="Cập nhật trạng thái"
      title-class="font-18"
      ref="update-status"
      hide-footer
      class="text-center"
    >
      <div class="bodyCreate">
        <div class="formCreated">
          <form @submit.prevent="updateStatus">
            <div class="formCreatedContent">
              <div class="col-12 formCreateGroup d-flex">
                <div class="col-6" style="padding-right: 10px">
                  <label for=""
                    >Trạng thái ứng viên <span class="labelStar">*</span></label
                  >
                  <div class="">
                    <multiselect
                      v-model="selected_introduction_status"
                      :options="introduction_status"
                      :show-labels="false"
                      :allow-empty="false"
                      label="name"
                    ></multiselect>
                  </div>
                </div>
                <div
                  class="col-6"
                  style="padding-left: 10px"
                  v-if="
                    selected_introduction_status.id === '15' ||
                    selected_introduction_status.id === '16' ||
                    selected_introduction_status.id === '17'
                  "
                >
                  <label for=""
                    >Ngày onboard <span class="labelStar">*</span></label
                  >
                  <div class="inputForm">
                    <input
                      type="date"
                      class="form-control"
                      v-model="update_status_data.onboardDate"
                    />
                  </div>
                </div>
                <div
                  class="col-6"
                  style="padding-left: 10px"
                  v-if="selected_introduction_status.id === '18'"
                >
                  <label for=""
                    >Ngày nghỉ việc <span class="labelStar">*</span></label
                  >
                  <div class="inputForm">
                    <input
                      type="date"
                      class="form-control"
                      v-model="update_status_data.workEndDate"
                    />
                  </div>
                </div>
              </div>
              <div class="col-12 formCreateGroup">
                <label for="">Ghi chú</label>
                <div class="inputForm">
                  <textarea
                    type=""
                    name="name"
                    class="form-control"
                    value="Francis"
                    style="height: 4rem"
                    v-model="update_status_data.note"
                  />
                </div>
              </div>
              <div class="handleActionBooking d-flex">
                <div class="cancelBtn">
                  <button type="button" v-on:click="cancelUpdateStatus">
                    <i class="fas fa-times"></i>Hủy
                  </button>
                </div>
                <div class="successBtn">
                  <button type="submit">Cập nhật</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </b-modal>
    <b-modal
      id="list-candidate-to-warranty"
      centered
      size="xl"
      title="Chọn ứng viên bảo hành thay thế"
      title-class="font-18"
      ref="list-candidate-to-warranty"
      hide-footer
      class="text-center"
    >
      <div class="bodyCreate">
        <div class="formCreated">
          <div class="table-responsive">
            <table class="table mb-0">
              <thead class="thead-light">
                <tr>
                  <th>Tên ứng viên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Ngày giới thiệu</th>
                  <th>Người giới thiệu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-for="candidate in candidates_to_warranty" v-bind:key="candidate.candidateIntroductionId">
                <tr>
                  <th scope="row">{{ candidate.candidateName }}
                  <td><span class="seenCv">Xem CV</span></td>
                  </th>
                  <td>{{ candidate.candidateEmail }}</td>
                  <td>{{ candidate.candidatePhone }}</td>
                  <td>{{ getDateString(candidate.introductionDate) }}</td>
                  <td>{{ candidate.collaboratorName }}</td>

                  <td>
                          <button type="button"
                      class="btnSelectDetail"
                      v-on:click="createWarrantyForIntroduction(candidate.candidateIntroductionId)">
                      Chọn
                    </button>
              
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </b-modal>
    <b-modal
      id="create-placement"
      centered
      size="lg"
      title="Tạo placement"
      title-class="font-18"
      ref="create-placement"
      hide-footer
      class="text-center"
    >
      <div class="bodyCreate">
        <div class="formCreated">
            <div class="row mt-2">
              <div class="col-4">Tên cộng tác viên: </div>
              <div class="col-6">{{review_placement.collaboratorName}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Email: </div>
              <div class="col-6">{{review_placement.collboratoroEmail}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Số điện thoại: </div>
              <div class="col-6">{{review_placement.collaboratorPhone}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Tài khoản ngân hàng: </div>
              <div class="col-6">{{review_placement.collaboratorBankAccount}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Tên ứng viên: </div>
              <div class="col-6">{{review_placement.candidateName}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Tên công việc: </div>
              <div class="col-6">{{review_placement.postTitle}}</div>
            </div>
            <div class="row mt-2">
              <div class="col-4">Số tiền cần thanh toán: </div>
            </div>
            <div class="mt-2">
            <table class="table mb-0" v-if="review_placement.rewardAmount">
              <thead class="thead-light">
                <tr>
                  <th>No.</th>
                  <th>Tên khoản tiền</th>
                  <th>Ngày placement</th>
                  <th>Số tiền</th>
                  <th>Đơn vị</th>
                </tr>
              </thead>
              <tbody v-if="review_placement.rewardAmount.length === 1">
                <tr>
                  <th>1</th>
                  <td>Tiền thưởng tuyển dụng thành công</td>
                  <td>{{ getDateString(review_placement.placementDate[0]) }}</td>
                  <td>{{ review_placement.rewardAmount[0] }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr v-if="review_placement.bonus !== null">
                  <th>2</th>
                  <td>Tiền thưởng tuyển gấp</td>
                  <td>{{ review_placement.bonus }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th></th>
                  <td><strong>Tổng tiền thưởng: </strong></td>
                  <td></td>
                  <td v-if="review_placement.bonus !== null"><strong>{{ review_placement.rewardAmount[0] + review_placement.bonus }}</strong></td>
                  <td v-else><strong>{{ review_placement.rewardAmount[0] }}</strong></td>
                  <td><strong>{{ review_placement.currency }}</strong></td>
                </tr>
              </tbody>
              <tbody v-if="review_placement.rewardAmount.length === 2">
                <tr>
                  <th>1</th>
                  <td>Tiền thưởng tuyển dụng thành công</td>
                  <td>{{ getDateString(review_placement.placementDate[0]) }}</td>
                  <td>{{ review_placement.rewardAmount[0] }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th>2</th>
                  <td>Tiền thưởng tuyển dụng thành công</td>
                  <td>{{ getDateString(review_placement.placementDate[1]) }}</td>
                  <td>{{ review_placement.rewardAmount[1] }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr v-if="review_placement.bonus !== null">
                  <th>3</th>
                  <td>Tiền thưởng tuyển gấp</td>
                  <td>{{ review_placement.bonus }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th></th>
                  <td><strong>Tổng tiền thưởng: </strong></td>
                  <td></td>
                  <td v-if="review_placement.bonus !== null"><strong>{{ review_placement.rewardAmount[0] + review_placement.rewardAmount[1] + review_placement.bonus }}</strong></td>
                  <td v-else><strong>{{ review_placement.rewardAmount[0] + review_placement.rewardAmount[1] }}</strong></td>
                  <td><strong>{{ review_placement.currency }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="handleActionBooking d-flex mt-3">
            <div class="cancelBtn">
              <button
                type="button"
                v-on:click="cancelCreatePlacement"
              >
                <i class="fas fa-times"></i>Hủy
              </button>
            </div>
            <div class="successBtn">
              <button type="button" v-on:click="createPlacementForIntroduction">
                Tạo placement
              </button>
            </div>
          </div>
        </div>
      </div>
    </b-modal> -->

    <div class="col-12">
      <div class="tool-bar row">
        <div class="col-md-12 title d-flex align-items-center">
          <a href="./manage-refer-candidate-collaborator">
          <button class="handleBack">
              <i class="fas fa-chevron-left"></i>
          </button>
          </a>
          <div class="titleCreate">
            <span>Chi tiết ứng viên</span>
          </div>
        </div>
      </div>
      <b-tabs justified nav-class="nav-tabs-custom" content-class=" text-muted">
        <b-tab active>
          <template v-slot:title>
            <span class="d-inline-block d-sm-none">
              <i class="fas fa-home"></i>
            </span>
            <span class="d-none d-sm-inline-block detailTextJovs"
              >Chi tiết giới thiệu</span
            >
          </template>
          <div class="jobInfor d-flex flex-wrap" style="padding: 0">
            <div class="col-md-7" style="padding: 0">
              <div class="job-detail">
                <div class="header-detail mb-2">
                  <div class="title-header">
                    <span>Thông tin về ứng viên</span>
                  </div>
                  <div class="" v-if="isShowWarrantyButton">
                    <button
                      class="btn-update-status"
                      type="button"
                      v-on:click="showListCandidateToWarranty"
                    >
                      Bảo hành ứng viên
                    </button>
                  </div>
                </div>
                <div class="confirmWarrantyContent mt-2" v-if="isShowWarrantyConfirm">
                  <div class="row">
                    <div class="col-md-8 d-flex">
                    <div class="iconConfirmWarranty">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="confirmWarrantyString">Xác nhận chọn ứng viên để bảo hành</div>
                  </div>
                  <div class="col-md-4">
                    <div class="row">
                      <div class="col-2"></div>
                      <div class="col-6">
                        <button
                          style="width:100%;"
                          class="btn-confirm-warranty"
                          type="button"
                          v-on:click="confirmWarranty" 
                        >
                        Đồng ý
                        </button>
                      </div>
                      <div class="col-4">
                        <button
                          style="width:100%;"
                          class="btn-cancel-warranty"
                          type="button" 
                          v-on:click="cancelConfirmWarranty"
                        >
                        Hủy
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <div class="placementContent mt-2 d-flex" v-if="this.introduction_detail.placement">
                  <div class="iconPlacement">
                      <i class="fas fa-money-check-alt"></i>
                  </div>
                  <div class="placementString">Ứng viên đã được tạo thanh toán vào ngày {{this.getDateString(this.introduction_detail.placement.create_date)}}</div>
                </div>
                <div class="warrantyContent mt-3 d-fslex" v-if="this.introduction_detail.alternativeCandidates !== null">
                  <div class="iconWarranty">
                      <i class="fas fa-shield-alt"></i>
                  </div>
                  <div class="warrantyString">Ứng viên đã được bảo hành bằng ứng viên:</div>
                  <div v-for="(alternativeCandidate, index) in this.introduction_detail.alternativeCandidates" :key="alternativeCandidate.id">
                    <div>
                      <div class="row">
                      <div class="warrantyContentString col-6">Ứng viên {{index + 1}}:</div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Tên ứng viên:</div>
                      <div class="warrantyContentString col-auto"><a href="">{{alternativeCandidate.name}}</a></div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Email:</div>
                      <div class="warrantyContentString col-auto">{{alternativeCandidate.email}}</div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Số điện thoại:</div>
                      <div class="warrantyContentString col-auto">{{alternativeCandidate.phone}}</div>
                    </div>
                     <div class="row">
                        <div class="warrantyContentString col-6">
                          Trạng thái:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.status }}
                        </div>
                      </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Ngày bảo hành:</div>
                      <div class="warrantyContentString col-auto">{{getDateString(alternativeCandidate.warrantyStartDate)}}</div>
                    </div>
                    <div class="row">
                        <div class="warrantyContentString col-6">
                          Số ngày phải bảo hành:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.numberDaysWarranty }}
                        </div>
                      </div>
                      <div class="row">
                        <div class="warrantyContentString col-6">
                          Số ngày đã bảo hành:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.warrantyDate }}
                        </div>
                      </div>
                      <div class="row">
                        <div class="warrantyContentString col-6">
                          Số ngày bảo hành còn lại:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.remainingWarrantyDays }}
                        </div>
                      </div>
                      <div
                        v-if="
                          index !==
                          introduction_detail.alternativeCandidates.length - 1
                        "
                        class="seperator"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="warrantyContent mt-3 d-flex" v-if="this.introduction_detail.candidateGuaranteed !== null">
                  <div class="iconWarranty">
                      <i class="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <div class="warrantyString">Ứng viên được chọn để bảo hành cho ứng viên:</div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Tên ứng viên:</div>
                      <div class="warrantyContentString col-auto"><a href="">{{this.introduction_detail.candidateGuaranteed.name}}</a></div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Email:</div>
                      <div class="warrantyContentString col-auto">{{this.introduction_detail.candidateGuaranteed.email}}</div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Số điện thoại:</div>
                      <div class="warrantyContentString col-auto">{{this.introduction_detail.candidateGuaranteed.phone}}</div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Trạng thái:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.status }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Ngày bắt đầu bảo hành:</div>
                      <div class="warrantyContentString col-auto">{{this.getDateString(this.introduction_detail.candidateGuaranteed.warrantyStartDate)}}</div>
                    </div><div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày phải bảo hành:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.numberDaysWarranty }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày đã bảo hành:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.warrantyDate }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày bảo hành còn lại:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.remainingWarrantyDays }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="detailContent mt-3">
                  <div class="detailinforJob mb-3 d-flex">
                    <div class="iconUser">
                      <i class="fas fa-user-circle"></i>
                    </div>

                    <div class="showTextInfor">
                      <div class="nameUser">
                        <span class="fontTitle">{{
                          introduction_detail.name
                        }}</span>
                        <div class="pt-2 pb-2">
                          <span>
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[0].status) === 'pending'"
                            class="statusNotifyPendding"
                            >{{
                              introduction_detail.status_histories[0].status
                            }}
                          </span>
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[0].status) === 'warning'"
                            class="statusNotifyWarning"
                            >{{
                              introduction_detail.status_histories[0].status
                            }}
                          </span>
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[0].status) === 'success'"
                            class="statusNotifySuccess"
                            >{{
                              introduction_detail.status_histories[0].status
                            }}
                          </span>
                        </span>
                        </div>
                      </div>
                      <div class="d-flex flex-wrap">
                        <div class="contactInfor">
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <span>Ngày giới thiệu</span>
                            </div>
                            <div class="codePr">
                              <span>{{
                                this.getDateString(
                                  introduction_detail.introduction_date
                                )
                              }}</span>
                            </div>
                          </div>
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <span>Mã giới thiệu (Referral ID) </span>
                            </div>
                            <div class="codePr">
                              <span>{{ introduction_detail.introduction_id }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="contactInfor">
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <i class="far fa-envelope"></i>
                              <span>Email</span>
                            </div>
                            <div class="textDetailContent">
                              <a href style="hoverTextInfor">
                                <strong>{{ introduction_detail.email }}</strong>
                              </a>
                            </div>
                          </div>
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <i class="fas fa-phone-alt"></i>
                              <span>Số điện thoại</span>
                            </div>
                            <div class="textDetailContent">
                              <a href style="hoverTextInfor">
                                <strong>{{ introduction_detail.phone }}</strong>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="btnHandleUser">
                        <div class="btnItem">
                          <button class="seenCv" v-on:click="openCV">
                            <i class="fas fa-eye"></i>Xem CV
                          </button>
                        </div>
                        <div class="btnItem">
                          <button class="installCv" v-on:click="downloadCVFile">
                            <i class="fas fa-arrow-circle-down"></i>Tải CV
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap">
                    <div class="textDetailBnfit col-md-6">
                      <div class="text-header mt-3">
                        <span>Tiêu đề công việc</span>
                      </div>
                      <div class="text">
                        <p>{{ introduction_detail.profile_title }}</p>
                      </div>
                    </div>
                    <div class="textDetailBnfit col-md-6">
                      <div class="text-header mt-3">
                        <span>Khu vực làm việc</span>
                      </div>
                      <div
                        class="text"
                        v-for="(city, index) in introduction_detail.cities"
                        :key="city.id"
                      >
                        <p>
                          <span v-if="index % 2 === 0">{{ city.name }}</span>
                          <span v-if="index % 2 !== 0">{{ city.name }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap">
                    <div class="textDetailBnfit col-sm-6 col-12">
                      <div class="text-header mt-3">
                        <span>Mức lương mong đợi</span>
                      </div>
                      <div class="text">
                        <p>
                          {{ introduction_detail.salary_from }} -
                          {{ introduction_detail.salary_to }}
                          {{ introduction_detail.currency }}
                        </p>
                      </div>
                    </div>
                    <div class="textDetailBnfit col-sm-6 col-12">
                      <div class="text-header mt-3">
                        <span>Ngày có thể đi làm</span>
                      </div>
                      <div class="text">
                        <p>{{ introduction_detail.candidate_availability }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="textDetailBnfit col-12">
                    <div class="text-header mt-3">
                      <span>Lý do ứng viên phù hợp với vị trí này</span>
                    </div>
                    <div class="text">
                        <p>{{ introduction_detail.suitable_reason }}</p>
                    </div>
                  </div>
                  <div class="textDetailBnfit col-12">
                    <div class="text-header mt-3">
                      <span>Tại sao ứng viên thay đổi công việc và kỳ vọng của cô ấy / anh ấy là gì?</span>
                    </div>
                    <div class="text">
                        <p>{{ introduction_detail.candidate_expectation }}</p>
                    </div>
                  </div>
                  <div class="textDetailBnfit col-12">
                    <div class="text-header mt-3">
                      <span>Vai trò công việc</span>
                    </div>
                    <div class="text">
                        <p>{{getJobRoleString()}}</p>
                    </div>
                  </div>
                  <div class="textDetailBnfit col-12">
                    <div class="text-header mt-3">
                      <span>Cấp bậc công việc</span>
                    </div>
                    <div class="text">
                        <p>{{ getJobLevels() }}</p>
                    </div>
                  </div>
                  <h5>Kỹ năng của ứng viên</h5>
                  <div
                    v-for="(
                      skill, index
                    ) in introduction_detail.candidate_skills"
                    v-bind:key="skill._id"
                  >
                    <div class="textDetailBnfit col-12">
                      <div class="text-header mt-3">
                        <span>Kỹ năng {{ index + 1 }}: </span>
                      </div>
                      <div class="text">
                        <p>Kỹ năng: {{ skill.skill.translate.vi.name }}</p>
                        <p>
                          Số năm kinh nghiệm: {{ skill.year_of_experience }}
                        </p>
                        <p>Đánh giá: {{ skill.rating }}</p>
                      </div>
                    </div>
                  </div>
                  <h5>Khả năng ngôn ngữ của ứng viên</h5>
                  <div
                    v-for="(
                      language, index
                    ) in introduction_detail.candidate_languages"
                    v-bind:key="language._id"
                  >
                    <div class="textDetailBnfit col-12">
                      <div class="text-header mt-3">
                        <span>Ngôn ngữ {{ index + 1 }}: </span>
                      </div>
                      <div class="text">
                        <p>Ngôn ngữ: {{ language.language.name }}</p>
                        <p>
                          Số năm kinh nghiệm: {{ language.year_of_experience }}
                        </p>
                        <p>Đánh giá: {{ language.your_rating }}</p>
                      </div>
                    </div>
                  </div>
                  <h5>Kinh nghiệm làm việc của ứng viên</h5>
                  <div
                    v-for="(
                      work_experience, index
                    ) in introduction_detail.work_experiences"
                    v-bind:key="work_experience._id"
                  >
                    <div class="textDetailBnfit col-12">
                      <div class="text-header mt-3">
                        <span>Kinh nghiệm làm việc {{ index + 1 }}: </span>
                      </div>
                      <div class="text">
                        <p>
                          Ngành làm việc:
                          {{
                            convertToIndustryString(work_experience.industries)
                          }}
                        </p>
                        <p>
                          Vị trí làm việc:
                          {{ work_experience.job_roles[0].name }}
                        </p>
                        <p>Tên công việc: {{ work_experience.job_title }}</p>
                        <p>
                          Số năm làm việc: {{ work_experience.work_duration }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h5>Thông tin bổ sung</h5>
                  <div v-for="(field) in introduction_detail.optional_field_values" v-bind:key="field._id">
                    <div class="textDetailBnfit col-12">
                      <div class="text-header mt-3">
                        <span>{{field.optional_field.title}}</span>
                      </div>
                      <div class="text" v-if="field.optional_field.type == 'date'">
                        <p>{{ getDateString(parseInt(field.value)) }}</p>
                      </div>
                      <div class="text" v-else-if="field.optional_field.type == 'multiselect'">
                        <p>{{ convertToMultiString(field.value) }}</p>
                      </div>
                      <div class="text" v-else>
                        <p>{{ field.value }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-5 candidate__JobInfor">
              <div class="companyInfor">
                <span class="titleCompany">Thông tin về công việc</span>
              </div>
              <div class="contentCompany">
                <div style="border-bottom: 1px solid #ccc">
                  <div class="headerDetailJob">
                    <div class="headerText">
                      <span>{{ introduction_detail.post.title }}</span>
                      <i class="fas fa-external-link-alt"></i>
                    </div>
                    <div class="bottomText">
                      <span>{{ introduction_detail.company.company }}</span>
                    </div>
                  </div>
                </div>
                <div class="detailSkillAndExp">
                  <div class="detailtextHeader">
                    <h6><strong>Tổng quan công việc & Trách nhiệm</strong></h6>
                  </div>
                  <div class="textContent" style="white-space: pre-line">
                    <span>
                      {{ introduction_detail.post.content }}
                    </span>
                    <br />
                  </div>
                  <div class="detailtextHeader">
                    <h6><strong>Lợi ích công việc</strong></h6>
                  </div>
                  <div class="textContent" style="white-space: pre-line">
                    <span>
                      {{ introduction_detail.post.benefit }}
                    </span>
                    <br />
                  </div>
                  <div class="detailtextHeader">
                    <h6><strong>Yêu cầu công việc</strong></h6>
                  </div>
                  <div class="textContent" style="white-space: pre-line">
                    <span>
                      {{ introduction_detail.post.require }}
                    </span>
                    <br />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-tab>
        <b-tab>
          <template v-slot:title>
            <span class="d-inline-block d-sm-none">
              <i class="fas fa-home"></i>
            </span>
            <span class="d-none d-sm-inline-block detailTextJovs"
              >Tất cả hoạt động</span
            >
          </template>

          <div class="col-12 d-flex flex-wrap referCandidate">
            <div class="col-md-6 col-12 inforReferCandidate">
              <!-- Test -->
              <div class="headerInforDetail">
                <div class="titleHeaderDetailInfor">
                  <span>Thông tin bài kiểm tra</span>
                </div>
              </div>
              <div class="bodyCreate">
                <div class="formCreated">
                  <div class="formCreatedContent">
                    <div
                      v-for="(item, index) in test_reports"
                      v-bind:key="index"
                    >
                      <div class="col-12 formCreateGroup d-flex flex-wrap">
                        <div class="col-md-6 col-12">
                          <label
                            for=""
                            class="titleLabel"
                            style="font-size: 18px"
                            >Bài {{ index + 1 }}</label
                          >
                        </div>
                        <div class="col-md-6 col-12">
                          <label for="" class="titleLabel"
                            >Loại bài kiểm tra:</label
                          >
                          <span style="margin-left: 10px" v-if="item.question_package.type_test === 'aptitude'">Tài năng</span>
                          <span style="margin-left: 10px" v-if="item.question_package.type_test === 'disc'">Tính cách DISC</span>
                          <span style="margin-left: 10px" v-if="item.question_package.type_test === 'personality'">5 tính cách lớn</span>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup">
                        <label for="" class="titleLabel"
                          >Tên bài kiểm tra</label
                        >
                        <div class="inputForm">
                          <span>{{ item.question_package.name }}</span>
                        </div>
                      </div>
                      <div
                        v-for="(report, report_index) in item.reports"
                        v-bind:key="report_index"
                      >
                        <div
                          class="col-12 formCreateGroup formCreateGroup__refer"
                        >
                          <label for="" class="titleLabel">Thời gian mời:</label
                          ><span>
                            {{ getDateTimeString(report.invite_at) }}</span
                          >
                          <div class="inputForm" v-if="!report.percents">
                            <span>Bài kiểm tra chưa được làm</span>
                          </div>
                          <div v-else>
                            <table class="table">
                              <thead>
                                <tr>
                                  <th scope="col">Tiêu chí</th>
                                  <th scope="col">Đánh giá</th>
                                </tr>
                              </thead>
                              <tbody v-if="report.percents.aptitude !== undefined">
                                <tr>
                                  <td>Điểm tài năng</td>
                                  <td>{{ report.percents.aptitude }} %</td>
                                </tr>
                              </tbody>
                              <tbody v-if="report.percents.disc !== undefined">
                                <tr>
                                  <td>Điểm tính cách DISC</td>
                                  <td>{{ readArray(report.percents.disc) }}</td>
                                </tr>
                              </tbody>
                              <tbody v-if="report.percents.personality !== undefined">
                                <tr>
                                  <td>Tính Hướng Ngoại</td>
                                  <td>
                                    {{ report.percents.personality.extra }} %
                                  </td>
                                </tr>
                                <tr>
                                  <td>Tính Tương Hợp</td>
                                  <td>
                                    {{ report.percents.personality.agree }} %
                                  </td>
                                </tr>
                                <tr>
                                  <td>Tính Tận Tâm</td>
                                  <td>
                                    {{ report.percents.personality.cons }} %
                                  </td>
                                </tr>
                                <tr>
                                  <td>Tính Nhạy Cảm Tâm Lý</td>
                                  <td>
                                    {{ report.percents.personality.neur }} %
                                  </td>
                                </tr>
                                <tr>
                                  <td>Sẵn Sàng Trải Nghiệm</td>
                                  <td>
                                    {{ report.percents.personality.open }} %
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <a :href="'https://tatool.vn/vi/test/report/' + report.report_id" target="_blank">Xem chi tiết điểm bài kiểm tra</a>
                          </div>
                          <!-- percents -->
                        </div>
                      </div>
                      <div
                        v-if="
                          index !==
                          introduction_detail.post.question_packages.length - 1
                        "
                        class="contentItemForm"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Interview -->
              <div class="headerInforDetail">
                <div class="titleHeaderDetailInfor">
                  <span>Thông tin chi tiết lịch phỏng vấn</span>
                </div>
              </div>
              <div class="bodyCreate">
                <div class="formCreated">
                  <div class="formCreatedContent">
                    <!-- <div v-if="statusInterview"> -->
                    <div
                      v-for="(item, index) in introduction_detail.interviews"
                      v-bind:key="index"
                    >
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-6">
                          <label
                            for=""
                            class="titleLabel"
                            style="font-size: 18px"
                            >Vòng {{ index + 1 }}</label
                          >
                        </div>
                        <div class="col-6">
                          <label for="" class="titleLabel"
                            >Loại phỏng vấn:</label
                          >

                          <span style="margin-left: 10px">{{ item.type }}</span>
                        </div>
                      </div>
                      <div class="col-12 formCreateGroup">
                        <label for="" class="titleLabel">Mô tả phỏng vấn</label>
                        <div class="inputForm">
                          <span>{{ item.stage_description }}</span>
                        </div>
                      </div>
                      <div
                        class="col-12 formCreateGroup"
                        v-if="item.schedule != null"
                      >
                        <label for="" class="titleLabel"
                          >Thời gian phỏng vấn</label
                        >
                        <div class="inputForm">
                          <span
                            >{{
                              getDateTimeString(
                                item.schedule.interview_start_date
                              )
                            }}
                            -
                            {{
                              getDateTimeString(
                                item.schedule.interview_end_date
                              )
                            }}</span
                          >
                        </div>
                      </div>
                      <div
                        class="col-12 formCreateGroup"
                        v-if="item.schedule != null"
                      >
                        <label for="" class="titleLabel">Trạng thái</label>
                        <div class="inputForm">
                          <span>{{ item.schedule.status_history.status }}</span>
                        </div>
                      </div>
                      <!-- <div v-if="item.schedule == null" class="handleBooking">
                        <button
                          type="button"
                          v-b-modal="getCreateSchedulePopupId(item._id)"
                        >
                          <i
                            class="far fa-calendar-alt"
                            style="margin-right: 0.5rem"
                          ></i
                          >Đặt lịch phỏng vấn
                        </button>
                      </div> -->
                      <div
                        v-if="index !== introduction_detail.interviews - 1"
                        class="contentItemForm"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-12 referCandidate__activity-log">
              <div class="detailWorkspace">
                <div class="titleHeader">
                  <span>Hoạt động gần đây</span>
                </div>
              <div class="mainWorkspace">
            <div>
              <div
                v-for="(item, index) in introduction_detail.status_histories"
                v-bind:key="index"
                class="d-flex"
              >
                <div class="col-2" style="position: relative">
                  <div class="contentTree">
                    <span><i class="fas fa-circle"></i></span>
                  </div>
                  <div
                    v-if="index === introduction_detail.status_histories.length - 1"
                    class="contentTreeEnd"
                  >
                    <span>
                      <i class="far fa-clock" style="margin-right: 5px"></i
                    ></span>
                  </div>
                </div>
                <div class="detailBodyWorkspace">
                  <div class="cardStatus">
                    <div class="headerCard">
                      <span>{{ item.status }}</span>
                    </div>
                    <div class="bodyCardStatus">
                      <div class="textMessage" v-if="item.note">
                        <span>{{ item.note }}</span>
                      </div>
                      <div class="statusSteps">
                        <span v-if="index + 1 < introduction_detail.status_histories.length">
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[index + 1].status) === 'pending'"
                            class="statusNotifyPendding"
                            >{{
                              introduction_detail.status_histories[index + 1].status
                            }}
                          </span>
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[index + 1].status) === 'warning'"
                            class="statusNotifyWarning"
                            >{{
                              introduction_detail.status_histories[index + 1].status
                            }}
                          </span>
                          <span
                            v-if="getStatusType(introduction_detail.status_histories[index + 1].status) === 'success'"
                            class="statusNotifySuccess"
                            >{{
                              introduction_detail.status_histories[index + 1].status
                            }}
                          </span>
                          <i
                            v-if="index !== item.status.length + 1"
                            class="fas fa-long-arrow-alt-right"
                            style="margin: 0 5px"
                          ></i>
                        </span>
                        <span>
                          <span
                            v-if="getStatusType(item.status) === 'pending'"
                            class="statusNotifyPendding"
                            >{{ item.status }}
                          </span>
                          <span
                            v-if="getStatusType(item.status) === 'warning'"
                            class="statusNotifyWarning"
                            >{{ item.status }}
                          </span>
                          <span
                            v-if="getStatusType(item.status) === 'success'"
                            class="statusNotifySuccess"
                            >{{ item.status }}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div class="time">
                      <i class="far fa-clock" style="margin-right: 5px"></i>
                      <span>{{ getDateTimeString(item.time) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </Layout>
</template>


<style lang="scss">
.modal-header {
  justify-content: center;
}
.btn-update-status {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #2767fd;
  -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  border: 1px solid #2767fd;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
  &:hover {
    background-color: white;
    color: #2767fd;
  }
}
.btn-warranty {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #ff7600;
  -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  border: 1px solid #ff7600;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
  &:hover {
    background-color: white;
    color: #ff7600;
  }
}
.btn-confirm-warranty {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #00ad57;
  -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  border: 1px solid #00ad57;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
  &:hover {
    background-color: white;
    color: #00ad57;
  }
}
.btn-cancel-warranty {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #818181;
  -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  border: 1px solid #818181;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
  &:hover {
    background-color: white;
    color: #818181;
  }
}
.handleBooking {
  display: flex;
  justify-content: flex-end;
  margin: 10px 10px 0 0;
  button {
    padding: 5px 12px;
    display: flex;
    align-items: center;
    outline: none;
    background-color: #fdb327;
    -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
    -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
    box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
    border: 1px solid #fdb327;
    border-radius: 7px;
    transition: all 0.2s ease-in-out;
    &:hover {
      background-color: #fda90e;
    }
  }
}
.handleActionBooking {
  justify-content: flex-end;
  button {
    padding: 6px 15px;
    outline: none;
    border: none;
    border-radius: 7px;
  }
  .cancelBtn {
    margin-right: 10px;
    button {
      background-color: #efefef;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: #e0deded2;
      }
      i {
        margin-right: 5px;
        color: rgb(102, 102, 102);
      }
    }
  }
  .successBtn {
    button {
      background-color: #1aa94c;
      transition: all 0.2s ease-in-out;

      color: white;
      i {
        margin-right: 5px;
      }
      &:hover {
        background-color: #0dc04c;
      }
    }
  }
}
.seperator {
  border-bottom: 2px dashed #ccc;
  margin-top: 25px;
  margin-bottom: 25px;
  border-color: gray;
}
.bodyCreate {
  height: auto;
  width: 100%;
  background-color: #ffffff;
  padding: 20px 15px;
  border-radius: 10px;
  border: 1px solid #ccccccd5;
  .contentItemForm {
    border-bottom: 2px dashed #ccc;
    margin-top: 25px;
    margin-bottom: 25px;
  }
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
      .titleLabel {
        font-size: 15px;
        font-weight: 600;
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
.referCandidate {
  margin-top: 0;
  .inforReferCandidate {
    .headerInforDetail {
      .titleHeaderDetailInfor {
        span {
          font-weight: 600;
          font-family: "Roboto", sans-serif;
          font-size: 20px;
          color: #3f3b3b;
        }
      }
    }
    .bodyInforDetailCandidateRefer {
      border-radius: 10px;
      border: 1px solid #eae9e9;
      padding: 8px;
      background-color: #ffffff;
      height: auto;
    }
  }
  .detailWorkspace {
    .titleHeader {
      span {
        font-weight: 600;
        font-family: "Roboto", sans-serif;
        font-size: 20px;
        color: #3f3b3b;
      }
    }
    .mainWorkspace {
      background-color: #ffffff;
      border: 1px solid #eae9e9;
      border-radius: 10px;
      padding: 16px;
      .treeTimeline {
        padding: 0 5px 0 0;
        position: relative;

        .headerTree {
          width: 98px;
          text-align: center;
          span {
            padding: 5px 10px;
            border-radius: 8px;
            background: #ffe5e5 !important;
            color: #f44336 !important;
            font-size: 12px;
          }
        }
      }
      .contentTree {
        position: absolute;
        display: flex;
        justify-content: center;
        height: 100%;
        width: 3px;
        left: 50%;
        transform: translateX(-50%);
        background: #ddd;
        i {
          font-size: 18px;
        }
        span {
        }
      }
      .contentTreeEnd {
        position: absolute;
        display: flex;
        justify-content: center;
        left: 52%;
        transform: translateX(-50%);
        bottom: -10px;
        i {
          font-size: 20px;
        }
      }
      .detailBodyWorkspace {
        flex: 1;
        border: 1px solid #eae9e9;
        border-radius: 10px;
        padding: 5px 30px 5px 10px;
        margin-bottom: 15px;
        .cardStatus {
          .headerCard {
            span {
              color: #030303;
              font-size: 15px;
              font-weight: 500;
            }
          }
          .bodyCardStatus {
            margin-top: 5px;
            .textMessage {
              font-size: 13px;
              margin-bottom: 5px;
            }
            .statusSteps {
              color: #030303;
            }
          }
          .time {
            margin-top: 5px;
          }
        }
      }
    }
  }
}
.showTextInfor {
  margin-left: 20px;
  .nameUser {
    .fontTitle {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: rgba(51, 51, 51, 0.801);
      font-weight: 500;
    }
    .statusWaiting {
      margin: 12px 0 16px 0;
      span {
        padding: 5px 8px;
        border-radius: 20px;
        background-color: #c8f6fc;
        color: #193c52;
        font-weight: 600;
        font-size: 12.6px;
      }
    }
  }
  .contactInfor {
    padding: 0 50px 0 0;
    .textContentUser {
      .textInforDetail {
        i {
          margin-right: 5px;
        }
        span {
          margin-bottom: 10px;
        }
      }
      .codePr {
        margin: 5px 0 10px 0;
        color: #000;
        font-size: 14px;
      }
      .textDetailContent {
        a {
          color: #179342;
          text-decoration: underline;
          background-color: transparent;
          border-bottom: 2px solid #17934200;
          &:hover {
            color: #1dbf56;
            border-bottom: 2px solid #1dbf56;
          }
        }
        margin: 5px 0 10px 0;
      }
    }
  }
  .btnHandleUser {
    display: flex;
    .btnItem {
      margin-right: 8px;
      button {
        border-radius: 8px;
        font-size: 12px;
        outline: none;
        border: none;
        padding: 4px 5px;
        border: 1px solid #00000000;
      }
      .seenCv {
        background-color: #3480f7;
        color: #fff;
        transition: all 0.2s ease-in-out;
        &:hover {
          background-color: #1b71fc;
        }
        i {
          margin-right: 5px;
        }
      }
      .installCv {
        background-color: #666666;
        color: #fff;
        transition: all 0.2s ease-in-out;
        &:hover {
          background-color: #666666;
        }
        i {
          margin-right: 5px;
        }
      }
      .shareCv {
        width: 40px;
        border: 1px solid #eae9e9;
        background-color: #fff;
        transition: all 0.2s ease-in-out;
        &:hover {
          background-color: #ecececc0;
        }
        i {
          font-size: 14px;
          color: #4a4a4b;
        }
      }
      .mesCv {
        background-color: #fdb327;
        transition: all 0.2s ease-in-out;

        color: #08090a;
        &:hover {
          background-color: #fca80e;
        }
        i {
          margin-right: 5px;
        }
      }
    }
  }
}
.titleJobs {
  font-weight: 500;
  font-family: "Roboto", sans-serif;
}
.actionNearTitle {
  border-bottom: 2px solid #eae9e9;

  background-color: #eae9e9;
  border-start-start-radius: 10px;
  border-top-right-radius: 10px;
  padding: 6px;
}
.actionNearTitle span {
  font-weight: 500;
  margin-left: 10px;
  font-family: "Roboto", sans-serif;
  color: #545765;
  font-size: 16px;
}
.mainActionNear {
  margin-top: 6px;
  margin-left: 10px;
  background-color: #ffffff;
  border-radius: 10px;
}
.mainActionNear .contentAction {
  cursor: pointer;
  border-bottom: 2px solid #eae9e9;
  height: 90px;
}
.mainActionNear .contentAction:hover {
  background-color: #eae9e9;
}
.mainActionNear .contentAction img {
  margin-top: 10px;
  width: 70px;
  border-radius: 10px;
  height: 70px;
  padding: 4px;
}
.mainComment {
  padding: 10px 20px 10px 10px;
  margin-top: 5px;
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  height: auto;
  border: 1px solid #eae9e9;
}
.repComment .iconUser i {
  color: rgb(184, 105, 105);
  font-size: 40px;
}
.repComment {
  width: 100%;
}
.repComment .smsReply .timeLine {
  font-weight: 500;
  font-size: 13px;
  font-family: "Roboto", sans-serif;
}
.repComment .smsReply {
  border-radius: 6px;
  border: 1px solid #eae9e9;
  font-weight: 500;
  font-size: 13px;
  font-family: "Roboto", sans-serif;
  padding: 7px;
}
.timeLine {
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  font-size: 13px;
  margin-left: 10px;
}
.actionUser {
  margin-top: 3px;
  font-size: 13px;
  font-weight: 600;
  font-family: "Roboto", sans-serif;
}
.actionUser {
  cursor: pointer;
  transition: 0.2s ease-in-out;
}
.actionUser i {
  font-size: 16px;
}
.actionUser span:hover {
  color: #545765;
}
.actionUser i:hover {
  color: #2242e2;
}
.iconUser {
}
.iconUser i {
  color: #c9c4c4;

  font-size: 35px;
}
.userComment .user {
  font-family: "Roboto", sans-serif;
  font-weight: 600;
  font-size: 13px;
}
.userComment .commnentContentInput {
  padding: 7px;
  font-size: 13px;
  font-family: "Roboto", sans-serif;
  height: auto;
  width: 100%;
  border: 1px solid #eae9e9;
  border-radius: 10px;
}
.inputValueComment .submitComment button {
  outline: none;
  border-radius: 10px;
  border: none;
  background-color: #445fe9;
  color: rgb(253, 253, 253);
  padding: 6px 12px;
  font-weight: 500;
  font-size: 12px;
  font-family: "Roboto", sans-serif;
  transition: all 0.2s linear;
}
.inputValueComment .submitComment button:hover {
  background-color: #2242e2;
  color: rgb(255, 255, 255);
}
.inputValueComment .commnentContentInput {
  width: 100%;
}
.inputValueComment .commnentContentInput .inputVl {
  width: 100%;
  height: 44px;
  border: 1px solid #eae9e9;
  border-radius: 10px;
  transition: 0.2s ease-in;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  font-family: "Roboto", sans-serif;
}
.inputValueComment .commnentContentInput .inputVl:hover {
  border: 1px solid #000000;
}
.inputValueComment .commnentContentInput .inputVl:focus {
  border: 1px solid #5b73e8;
}
.titleComment span {
  font-size: 18px;
  font-weight: 700;
  font-family: "Roboto", sans-serif;
  color: #545765 !important;
}
.commnentContent {
}
.detailTextJovs {
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
}
.active {
  border-bottom: none;
}
.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
  background-color: transparent;
}
.tab-content > .active {
  border-bottom: none !important;
}
.companyInfor .titleCompany {
  font-weight: 600;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
  color: #3f3b3b;
}

.contentCompany {
  border-radius: 10px;
  border: 1px solid #eae9e9;
  padding: 8px;
  background-color: #ffffff;
  height: auto;
  .headerDetailJob {
    padding-bottom: 15px;

    .headerText {
      padding: 5px 10px 2px 10px;
      &:hover {
        span {
          border-bottom: 2px solid #10ac47;
        }
        i {
          color: #10ac47;
        }
      }

      span {
        font-size: 18.8px;
        color: #111 !important;
        border-bottom: 2px solid rgba(0, 0, 0, 0);
        cursor: pointer;
      }
      i {
        margin-left: 5px;
        font-size: 18.8px;
        color: #1aa94c;
      }
    }
    .bottomText {
      padding: 0 10px;
      span {
      }
    }
  }
  .detailSkillAndExp {
    padding: 8px 10px;
    .detailtextHeader {
      h6 {
        color: #999999 !important;
        font-size: 16px;
        font-weight: 500;
      }
    }
    .textContent {
      color: #74788d;
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
.titleInfomation .textHeader .status {
  display: flex;
  align-items: center;
  padding: 1px 15px;
  color: white;
  background: #41d19cbd;
  border-radius: 25px;
  font-size: 12px;
  margin-left: 10px;
  font-size: 10px;

  font-weight: 400;
  font-family: "Roboto", sans-serif;
}
.titleInfomation .textHeader .status span {
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
.handleBack {
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
.tabContent {
  margin-top: 30px;
  justify-content: flex-start;
  border-bottom: 1px solid #eae9e9;
}
.tabContent .tab-item {
  text-transform: uppercase;
  cursor: pointer;
  color: rgb(68, 68, 68);
  font-family: "Roboto", sans-serif;
}
.itemSpan .detailAdss span {
  font-family: "Roboto", sans-serif;
}
.active {
  border-bottom: 2.5px solid #5b73e8;
}
.jobInfor {
  margin-top: 30px;
}

.detailContent {
  border-radius: 10px;
  border: 1px solid #eae9e9;
  padding: 16px;
  background-color: #ffffff;
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
  color: #3f3b3b;
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

.textDetail {
  border-top: 1px solid #eae9e9;
}
.textDetailBnfit {
  .privateSms {
    color: #b27514;
    font-size: 12.2px;
    margin: 0;
  }
  .text-header {
    font-family: "Roboto", sans-serif;
    font-size: 17px;
    color: #6d6d6d;
    font-weight: 600;
    margin-bottom: 10px;
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
  .handleSaveCmt {
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    button {
      border: none;
      outline: none;
      border-radius: 7px;
      background-color: #1aa94c;
      color: #fff;
      font-size: 12px;
      padding: 5px 12px;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: #05b643;
      }
      i {
        margin-right: 5px;
      }
    }
  }
  .statusUv {
    display: flex;
    align-items: center;
    .statusDetailUv {
      font-family: "Roboto", sans-serif;
      font-size: 17px;
      color: #999999;
      font-weight: 600;
      margin-bottom: 5px;
      margin-right: 10px;
    }
    .statusWaiting {
      margin: 12px 0 16px 0;
      span {
        padding: 5px 8px;
        border-radius: 20px;
        background-color: #c8f6fc;
        color: #193c52;
        font-weight: 600;
        font-size: 12.6px;
      }
    }
  }
}
.textDetail .text-header {
  font-family: "Roboto", sans-serif;
  font-size: 17px;
  color: #999999;
  font-weight: 600;
  margin-bottom: 10px;
}
.textDetail .text p {
  font-family: "Roboto", sans-serif;
  font-size: 15px;
  line-height: 27px;
}
.handleButton {
  display: flex;

  bottom: 15px;
  justify-content: flex-end;
  z-index: 999;
}
.handleButton button {
  cursor: pointer;
  margin-left: 10px;
  margin-top: 10px;
  padding: 5px 10px;
  outline: none;
  border: none;
  border-radius: 10px;
  color: white;
}
.handleButton .btnDown {
  background: #f44336;
  transition: all 0.2s linear;
}
.handleButton .btnDown:hover {
  background: #f33528;
}
.handleButton .btnDown i {
  margin-right: 5px;
}
.btnRefer {
  background: #1aa94c;
  transition: all 0.2s linear;
}

.btnRefer:hover {
  background: #1aa94c;
}
.generalInformation {
  background-color: white;
  /* border: solid;
  border-width: 0.5px;
  border-color: rgb(209, 209, 209);
  border-radius: 2px; */
  height: 200px;
  padding: 10px;
}

.btn-edit {
  background-color: #50a5f1;
  border-radius: 4px;
  border: none;
  color: white;
  padding: 5px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  -webkit-box-shadow: 0px 1px 3px 0px rgba(74, 74, 74, 1);
  -moz-box-shadow: 0px 1px 3px 0px rgba(74, 74, 74, 1);
  box-shadow: 0px 1px 3px 0px rgba(74, 74, 74, 1);
  transition: all 0.2s linear;
  position: relative;
}

.btn-edit:hover {
  background-color: rgb(44, 145, 235);
  /* transform: scale(0, 0); opacity: .3; transition: 0s; */
}
.btn-edit i {
  font-size: 14px;
}
.page-title-box {
  padding-bottom: 0px !important;
}
.fontTitle {
  font-family: "Roboto", sans-serif;
}

.modal-xl {
  @media screen and(min-width:1200px) {
    max-width: 1450px !important;
  }
}
// .actionHandleForm {
//   position: fixed;
//   bottom: 10px;
//   left: 38%;
//   z-index: 999;
//   transform: translateX(-50%);
//   .actionHandle {
//     margin-right: 5px;
//     button {
//       outline: none !important;
//       border: none;
//       padding: 8px 15px;
//       font-size: 15px;
//       font-family: "Roboto", sans-serif;
//       border-radius: 10px;

//       color: #fff;
//       i {
//         margin-right: 7px;
//         font-size: 17px;
//       }
//     }
//     .btnSaveAndBack {
//       background-color: #3480f7;
//       border: 1px solid #3480f7;
//       transition: all 0.2s ease-in-out;
//       &:hover {
//         background-color: #156fff;
//       }
//     }
//     .btnSave {
//       background-color: #1aa94c;
//       border: 1px solid #1aa94c;
//       transition: all 0.2s ease-in-out;
//       &:hover {
//         background-color: #0eb94a;
//       }
//     }
//     .btnCancel {
//       color: white;
//       border: 1px solid red;
//       background-color: #f44336;
//       transition: all 0.2s ease-in-out;
//       &:hover {
//         background-color: red;
//       }
//     }
//   }
// }
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
.table-responsive {
  .thead-light {
    background: #ececec;

    td {
      padding: 15px;
    }
  }
  .seenCv {
    padding: 3px 7px;
    border-radius: 10px;
    background-color: #445fe9;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    &:hover {
      background-color: #2749f3;
    }
  }
}
.btnSelectDetail {
  border: none;
  outline: none;
  background-color: #1aa94c;
  border-radius: 8px;
  color: white;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  transition: all 0.2s ease-in-out;
  -webkit-box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  &:hover {
    background-color: #0ebd4b;
  }
}
.statusNotifyPendding {
  padding: 2px 10px;
  background-color: #eae9e9;
  border-radius: 10px;
}
.statusNotifyWarning {
  padding: 2px 10px;
  background-color: #ff3232;
  border-radius: 10px;
  color: white;
}
.statusNotifySuccess {
  background-color: #16ff68;
  padding: 2px 10px;
  border-radius: 10px;
  color: black;
}
.iconSort {
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  margin-right: 5px;
}
.filter-bar {
  flex-direction: row;
  flex-wrap: wrap;
  border: none;
  border: 1.5px solid #eae9e9 !important;

  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  .form-control {
    border: none;
    outline: none;
    padding-bottom: 10px;
    border-bottom: 1.5px solid #b1b1b1 !important;
    border-radius: 0;
  }
  .optionSelected {
    margin-right: 10px;
    display: flex;
    position: relative !important;
    input {
      border: none;
      outline: none;
      padding: 5px 10px;
      border-bottom: 1px solid #000;
    }
  }
  .optionSelected i {
    position: absolute;
    right: 0;
    bottom: 15px;
    z-index: 999;
    color: #666565;
  }
  .multiselect__single {
    font-weight: 600;
    font-size: 15px;
    font-family: "Roboto", sans-serif;
  }
}

.filter .filter-bar input {
  font-size: 14px;
  padding-right: 0;
  padding-left: 0;
  width: 200px;
}
.filter-search .inputSearch i {
  display: inherit;
  justify-content: center;
  font-size: 16px;
  margin-left: 10px;
}
.filter-search .inputSearch {
  width: 100%;

  display: flex;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1.5px solid #eae9e9;
  border-radius: 5px;
  transition: all 0.2s ease-in;
  margin-right: 10px;
  input {
    border: none;
    outline: none;
  }
}
.btnSelectDetail {
  border: none;
  outline: none;
  background-color: #1aa94c;
  border-radius: 8px;
  color: white;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  transition: all 0.2s ease-in-out;
  -webkit-box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 1px 6px -1px rgba(0, 0, 0, 0.75);
  &:hover {
    background-color: #0ebd4b;
  }
}
.filter-search .inputSearch:hover {
  border: 1.5px solid #5b73e8;
}
.list-candidates .header {
  padding: 10px 15px;
}

.list-candidates .sort .form-control {
  width: 150px;
  background: 0;
  padding: 0;
}

.list-candidates .thead {
  background-color: #ececec;
  font-size: 15px;
  font-weight: bold;
}

.list-candidates .thead > div {
  padding: 15px 10px;
}

.tbody > div#accordion {
  padding: 15px 0;
}

.list-candidates .thead.row {
  margin-left: 0;
  margin-right: 0;
}

.list-candidates tbody {
  background-color: #fff;
}
.handleActionSearch {
  .btn-search {
    background-color: #5b73e8;
    color: white;
    width: 150px;
    padding: 10px 20px;
    transition: all 0.2s ease-in;
    &:hover {
      background-color: #3a59f5;
      color: white;
    }
  }
}

.multiselect__select {
  display: none !important;
}
.date::-webkit-calendar-picker-indicator,
.date::-webkit-inner-spin-button {
  border: none;
}

.multiselect__tags {
  border: none !important;
  border-radius: 0;
  border-bottom: 1.5px solid #b1b1b1 !important;
  background-color: transparent !important;
  margin-top: 2px !important;
  font-family: "Roboto", sans-serif !important;
  font-weight: 500 !important;
}

.upload-main {
  background-color: #fff;
  border: 2px dashed rgba(131, 131, 131, 0.8);
  border-radius: 10px;
  font-family: "Roboto", sans-serif;
  padding: 5px;
}

.headerUpload {
  font-size: 19px;
  color: #000000c5;
  font-weight: 600;
}
.btn-upload {
  background-color: #1aa94c;
  transition: all 0.2s ease;
  color: #ffffff;

  i {
    font-size: 18px;
  }
  &:hover {
    color: #ffffff;
    background-color: #059638;
    i {
      color: #ffffff;
    }
  }
}
.modal-xl {
  @media screen and(min-width:1200px) {
    max-width: 1450px !important;
  }
}
.placementContent {
  border-radius: 10px;
  border: 1px solid #93d9a3;
  padding: 16px;
  background-color: #cdf3a2;
}
.placementString {
  font-size: 18px;
  color: #337c44;
  margin-left: 15px;
  margin-top: 5px;
}
.confirmWarrantyString {
  font-size: 18px;
  color: #3b3b3b;
  margin-left: 15px;
  margin-top: 5px;
}
.iconPlacement i {
  color: #337c44;

  font-size: 35px;
}
.warrantyContent {
  border-radius: 10px;
  border: 1px solid #ffe365;
  padding: 16px;
  background-color: #ffed99;
}
.confirmWarrantyContent {
  border-radius: 10px;
  border: 1px solid #aaaaaa;
  padding: 16px;
  background-color: #e2e2e2;
}
.warrantyString {
  font-size: 18px;
  color: #62582c;
  margin-left: 15px;
  margin-top: 5px;
}
.warrantyContentString {
  font-size: 14px;
  color: #62582c;
  margin-left: 15px;
  margin-top: 5px;
}
.iconWarranty i {
  color: #62582c;

  font-size: 35px;
}
.iconConfirmWarranty i {
  color: #3b3b3b;

  font-size: 35px;
}
.formCreateGroup__refer {
  .table {
    width: auto;
    min-width: 300px;

    thead,
    tbody {
      tr {
        th {
          background: #f2f2f2;
        }
        th,
        td {
          border: 1px solid #b8bdc383 !important;
        }
      }
    }
  }
}

.candidate__JobInfor{
  margin-top: 1.25rem;

  @media (min-width: 768px) {
    padding-left: 10px;
    margin-top: 0;
  }


  .companyInfor{
    padding-bottom: 16px;
  }
}

.referCandidate__activity-log{
  margin-top: 1.25rem;

  @media (min-width: 768px) {
    padding-left: 10px;
    margin-top: 0;
  }
}
</style>
