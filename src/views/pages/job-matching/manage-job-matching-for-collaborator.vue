<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import PageHeader from "@/components/page-header";
import { mapActions } from "vuex";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
export default {
  page: {
    title: "Lọc ứng viên",
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
      title: "Lọc ứng viên",
      // Companies
      companies: [],
      selected_companies: [],

      //Cities
      locations: [],
      selected_location_for_candidate: [],
      selected_location_for_post: [],

      //Keyword type
      post_keyword_types: [
        {
          id: 0,
          name: "Tất cả từ khóa",
        },
        {
          id: 1,
          name: "Tên công việc",
        },
        {
          id: 2,
          name: "Level",
        },
        {
          id: 3,
          name: "Role",
        },
        {
          id: 4,
          name: "Skill",
        },
        {
          id: 5,
          name: "Ngành",
        },
        {
          id: 6,
          name: "Ngôn ngữ",
        },
        {
          id: 7,
          name: "Mô tả công việc",
        },
        {
          id: 8,
          name: "Yêu cầu",
        },
        {
          id: 9,
          name: "Lợi ích",
        },
      ],
      selected_post_keyword_type: {
        id: 0,
        name: "Tất cả từ khóa",
      },

      //Work type
      type_works: [
        {
          id: 0,
          name: "Tất cả loại hình công việc",
        },
        {
          id: 1,
          name: "Toàn thời gian",
        },
        {
          id: 2,
          name: "Bán thời gian",
        },
      ],
      type_work: {
        id: 0,
        name: "Tất cả loại hình công việc",
      },

      //warranty type
      guarantee_types: [
        {
          id: 0,
          name: "Tất cả loại bảo hành",
        },
        {
          id: 1,
          name: "Giai đoạn",
        },
        {
          id: 2,
          name: "Toàn diện",
        },
        {
          id: 3,
          name: "Không bảo hành",
        },
      ],
      guarantee_type: {
        id: 0,
        name: "Tất cả loại bảo hành",
      },

      //post currency
      selected_currency_post: "USD",

      //candidate currency
      selected_currency_candidate: "USD",

      //post status
      statuses: [
        {
          id: 0,
          name: "Tất cả trạng thái",
        },
        {
          id: "active",
          name: "Active",
        },
        {
          id: "pause",
          name: "Pause",
        },
      ],
      status: {
        id: 0,
        name: "Tất cả trạng thái",
      },

      // Job keywords
      job_keywords: [],

      // Candidate keywords
      candidate_keywords: [],

      // Post salary
      post_min_salary: null,
      post_max_salary: null,
      is_post_negotiate: false,

      // Candidate salary
      candidate_min_salary: null,
      candidate_max_salary: null,
      is_candidate_negotiate: false,

      // Post urgent
      is_urgent: false,

      //Date
      dateFrom: "",
      dateTo: "",
      timestampFrom: 0,
      timestampTo: 0,

      //Page index
      post_page_index: 0,
      candidate_page_index: 0,

      //Items total count
      post_total_count: 0,
      candidate_total_count: 0,

      //Total pages
      post_total_pages: 0,
      candidate_total_pages: 0,

      //Response data
      posts: [],
      candidates: [],
      matching_datas: [],

      //Selected count
      candidate_selected_count: 0,
      post_selected_count: 0,

      //Checked all items
      checked_all_candidate: false,
      checked_all_post: false,

      //--------------------------------------------------

      value1: ["IT", "tai", "hong", "pear", "peach"],
      value2: ["bus", "busi", "business", "kinh", "tien"],
      value3: ["nguy", "ng", "c", "duc", "hiep"],
      value4: ["doa", "ngu", "n", "nam", "hon"],

      location: [],
      location1: [],
      typeTab: false,
      typeTab2: false,
      checkAll: false,
      checkAll1: false,
      selected_currencyCandidate: "USD",
      selectedAll: [],
      selectedAllCandidate: [],
      dataTable: [
        {
          name: "Trần Minh Văn",
          email: "asagosv2@gmail.com",
          phone: "0339741460",
          salary: "Thỏa thuận",
          location: ["Hồ Chí Minh", "Hai Nam", "New york"],
          dateCreated: "5/12/2019",
          isChecked: false,
        },
        {
          name: "Trần Minh Công",
          email: "asagosv3@gmail.com",
          phone: "099390132",
          salary: "10000000",
          location: ["Hồ Chí Minh", "Hai Nam"],
          dateCreated: "5/12/2019",
          isChecked: false,
        },
        {
          name: "Trần Minh Công",
          email: "asagosv3@gmail.com",
          phone: "099390132",
          salary: "10000000",
          location: ["Hồ Chí Minh", "Đà Nẵng"],
          dateCreated: "5/12/2019",
          isChecked: false,
        },
      ],
      dataTable1: [
        {
          name: "Team Lead",
          typeJob: "Fulltime",
          email: "asagosv2@gmail.com",
          phone: "0339741460",
          salary_to: "1200",
          salary_from: "2000",
          location: ["Hồ Chí Minh", "Hà Nội"],
          dateCreated: "5/12/2019",
          moneyInterview: "350,000",
          status: "pause",
          job: "NashTech",
          role: ["Senior", "Team Leader"],
          Urgentrecruitment: "Tuyển gấp",
          isChecked: false,
          id: 0,
        },
        {
          name: "Technical Architect - LAMP",
          typeJob: "Parttime",
          email: "asagosv3@gmail.com",
          phone: "099390132",
          salary_to: "850",
          salary_from: "",
          location: ["Hồ Chí Minh", "New york"],
          dateCreated: "5/12/2019",
          moneyInterview: "150,000",
          status: "active",
          job: "Shipper",
          role: ["Senior", "Middle"],
          Urgentrecruitment: "Tuyển gấp",
          isChecked: false,
          id: 1,
        },
        {
          name: "Senior Automation Test Engineer",
          typeJob: "Fulltime",
          email: "asagosv3@gmail.com",
          phone: "099390132",
          salary_to: "5000",
          salary_from: "7000",
          location: ["Hồ Chí Minh"],
          dateCreated: "5/12/2019",
          moneyInterview: "150,000",
          status: "close",
          job: "Boost",
          role: ["Junior", "Team Leader"],
          isChecked: false,
          id: 3,
        },
        {
          name: "Junior Web Developer",
          typeJob: "Fulltime",
          email: "asagosv3@gmail.com",
          phone: "099390132",
          salary_to: "1200",
          salary_from: "1400",
          location: ["Hồ Chí Minh", "Nha Trang"],
          dateCreated: "5/12/2019",
          moneyInterview: "120,000",
          status: "active",
          job: "Developer",
          role: ["Junior", "Fresher IT"],
          isChecked: false,
          id: 4,
        },
      ],
      arrTypeKeyword: [
        { name: "All" },
        { name: "Job title", id: 0 },
        { name: "Level", id: 1 },
        { name: "Role", id: 2 },
        { name: "Skill", id: 3 },
        { name: "Industry", id: 4 },
        { name: "Language", id: 5 },
        { name: "Job descripton", id: 6 },
        { name: "Why working here", id: 7 },
        { name: "Notice for refere", id: 8 },
      ],
      arrStatus: [
        { name: "All", id: 0 },
        { name: "Close", id: 1 },
        { name: "Active", id: 2 },
        { name: "Pause", id: 3 },
      ],
      arrCompany: [
        { name: "Cong ty A" },
        { name: "Cong ty B", id: 0 },
        { name: "Cong ty C", id: 1 },
        { name: "Cong ty D", id: 2 },
        { name: "Cong ty E", id: 3 },
        { name: "Cong ty F", id: 4 },
        { name: "Cong ty G", id: 5 },
      ],
      arrLocation: [
        { name: "Nha Trang", id: 6 },
        { name: "Hồ Chí Minh", id: 0 },
        { name: "Hà Nội", id: 1 },
        { name: "Đà Nẵng", id: 2 },
        { name: "New York", id: 3 },
        { name: "Canada", id: 4 },
        { name: "Korea", id: 5 },
      ],
      arrTypeJob: [
        { name: "All", id: 0 },
        { name: "IT", id: 1 },
        { name: "None IT", id: 2 },
      ],
    };
  },
  mounted() {
    this.getCompaniesForFilter();
    this.getCities();
    this.handleButton();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "companies/getCompaniesSuccess":
          //Get companies
          this.companies = state.companies.companiesData.companies;
          break;
        case "cities/getCitiesSuccess":
          // Get all cities
          this.locations = state.cities.citiesData.cities;
          break;
        case "post/searchPostToMatchingSuccess":
          this.posts = [];
          if (state.post.searchData.posts.length > 0) {
            state.post.searchData.posts.forEach((post) => {
              post.isChecked = false;
              this.posts.push(post);
            });
          }
          this.post_total_count = state.post.searchData.totalCount;
          this.post_total_pages = state.post.searchData.totalPages;
          break;
        case "candidates/searchCandidateToMatchingSuccess":
          this.candidates = [];
          if (state.candidates.candidateData.candidates.length > 0) {
            state.candidates.candidateData.candidates.forEach((candidate) => {
              candidate.isChecked = false;
              this.candidates.push(candidate);
            });
          }
          this.candidate_total_count =
            state.candidates.candidateData.totalCount;
          this.candidate_total_pages =
            state.candidates.candidateData.totalPages;
          break;
        case "candidates/jobMatchingSuccess":
          this.matching_datas = state.candidates.jobMatchingData.matched;
          this.$refs["matching-table"].show();
          break;
        case "candidates/jobMatchingFailure":
          break;
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    // Search post
    selected_post_keyword_type: function () {
      this.searchPost();
    },
    job_keywords: function () {
      this.searchPost();
    },
    selected_companies: function () {
      this.searchPost();
    },
    selected_location_for_post: function () {
      this.searchPost();
    },
    post_min_salary: function () {
      this.searchPost();
    },
    post_max_salary: function () {
      this.searchPost();
    },
    type_work: function () {
      this.searchPost();
    },
    status: function () {
      this.searchPost();
    },
    is_post_negotiate: function () {
      this.searchPost();
    },
    is_urgent: function () {
      this.searchPost();
    },
    guarantee_type: function () {
      this.searchPost();
    },
    selected_currency_post: function () {
      this.searchPost();
    },
    //Search candidate
    candidate_keywords: function () {
      this.searchCandidate();
    },
    candidate_min_salary: function () {
      this.searchCandidate();
    },
    candidate_max_salary: function () {
      this.searchCandidate();
    },
    dateFrom: function () {
      const date = new Date(document.getElementById("dateFrom").value);
      date.setHours(0, 0, 0, 0);
      this.timestampFrom = date.getTime();
      this.searchCandidate();
    },
    dateTo: function () {
      const date = new Date(document.getElementById("dateTo").value);
      date.setHours(0, 0, 0, 0);
      this.timestampTo = date.getTime();
      this.searchCandidate();
    },
    selected_location_for_candidate: function () {
      this.searchCandidate();
    },
    selected_currency_candidate: function () {
      this.searchCandidate();
    },
    is_candidate_negotiate: function () {
      this.searchCandidate();
    },

    checked_all_candidate: function () {
      if (this.checked_all_candidate) {
        if (this.candidates.length > 0) {
          this.candidate_selected_count = this.candidates.length;
          this.candidates.forEach((candidate) => {
            candidate.isChecked = true;
          });
        }
      } else {
        if (this.candidates.length > 0) {
          this.candidate_selected_count = 0;
          this.candidates.forEach((candidate) => {
            candidate.isChecked = false;
          });
        }
      }
    },
    checked_all_post: function () {
      if (this.checked_all_post) {
        if (this.posts.length > 0) {
          this.post_selected_count = this.posts.length;
          this.posts.forEach((post) => {
            post.isChecked = true;
          });
        }
      } else {
        if (this.posts.length > 0) {
          this.post_selected_count = 0;
          this.posts.forEach((post) => {
            post.isChecked = false;
          });
        }
      }
    },
  },
  methods: {
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("companies", ["getCompaniesList"]),
    ...mapActions("post", ["searchPostToMatching"]),
    ...mapActions("candidates", ["searchCandidateToMatching", "jobMatching"]),

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    //Open CV in new tab
    openCV(path) {
      const cv_type = this.getFileExtension(
        path
      )[0];
      switch (cv_type) {
        case "pdf":
          window.open(generateApiUrl(path), "_blank");
          break;
        case "docx":
          window.open(
            "https://view.officeapps.live.com/op/view.aspx?src=" +
              generateApiUrl(path) +
              "&embedded=true",
            "_blank"
          );
          break;
      }
    },

    // Get all cities function
    getCities() {
      this.getCitiesList();
    },

    //Get all companies
    getCompaniesForFilter() {
      this.getCompaniesList();
    },

    //Convert timestamp to string
    getDateString(timestamp) {
      const date = new Date(timestamp);
      const dateString = "0" + date.getDate();
      const monthString = "0" + (date.getMonth() + 1);
      const yearString = date.getFullYear();
      return (
        dateString.substr(-2) + "/" + monthString.substr(-2) + "/" + yearString
      );
    },

    //Detect user click checkbox of post or candidate
    clickCheckBox() {
      if (this.posts.length > 0) {
        this.post_selected_count = 0;
        this.posts.forEach((post) => {
          if (post.isChecked) {
            this.post_selected_count = this.post_selected_count + 1;
          }
        });
      }
      if (this.candidates.length > 0) {
        this.candidate_selected_count = 0;
        this.candidates.forEach((candidate) => {
          if (candidate.isChecked) {
            this.candidate_selected_count = this.candidate_selected_count + 1;
          }
        });
      }
    },

    //Search post
    searchPost() {
      const keyword_type = this.selected_post_keyword_type.id;
      var keyword = "";
      if (this.job_keywords.length > 0) {
        this.job_keywords.forEach((key) => {
          keyword = keyword + key + ",";
        });
        keyword = keyword.substring(0, keyword.length - 1);
      }
      var companyIds = 0;
      if (this.selected_companies.length > 0) {
        companyIds = "";
        this.selected_companies.forEach((company) => {
          companyIds = companyIds + company.id + ",";
        });
        companyIds = companyIds.substring(0, companyIds.length - 1);
      }
      var cityIds = 0;
      if (this.selected_location_for_post.length > 0) {
        cityIds = "";
        this.selected_location_for_post.forEach((location) => {
          cityIds = cityIds + location.id + ",";
        });
        cityIds = cityIds.substring(0, cityIds.length - 1);
      }
      const salaryFrom = this.post_min_salary;
      const salaryTo = this.post_max_salary;
      const type_work = this.type_work.id;
      const status = this.status.id;
      const page_index = this.post_page_index;
      const page_size = 10;
      const sortBy = 0;
      const negotiable = this.is_post_negotiate ? 2 : 1;
      const urgency = this.is_urgent ? 2 : 1;
      const guarantee = this.guarantee_type.id;
      const currency = this.selected_currency_post;

      const data = {
        keyword_type,
        keyword,
        companyIds,
        cityIds,
        salaryFrom,
        salaryTo,
        type_work,
        status,
        page_index,
        page_size,
        sortBy,
        negotiable,
        urgency,
        guarantee,
        currency,
      };

      this.searchPostToMatching(data);
    },

    //Search candidate
    searchCandidate() {
      var keyword_cv = "";
      if (this.candidate_keywords.length > 0) {
        this.candidate_keywords.forEach((key) => {
          keyword_cv = keyword_cv + key + ",";
        });
        keyword_cv = keyword_cv.substring(0, keyword_cv.length - 1);
      }
      const salary_from = this.candidate_min_salary;
      const salary_to = this.candidate_max_salary;
      const date_from = this.timestampFrom;
      const date_to = this.timestampTo;
      var city_ids = 0;
      if (this.selected_location_for_candidate.length > 0) {
        this.selected_location_for_candidate.forEach((location) => {
          city_ids = city_ids + location.id + ",";
        });
        city_ids = city_ids.substring(0, city_ids.length - 1);
      }
      const page_index = this.candidate_page_index;
      const page_size = 20;
      const currency = this.selected_currency_candidate;
      const negotiable = this.is_candidate_negotiate;

      const data = {
        keyword_cv,
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        page_index,
        page_size,
        currency,
        negotiable,
      };

      this.searchCandidateToMatching(data);
    },

    //Matching job and candidate together
    matchThem() {
      var postIds = [];
      var candidateIds = [];
      if (this.posts.length > 0) {
        this.posts.forEach((post) => {
          if (post.isChecked) {
            postIds.push(post.id);
          }
        });
      }
      if (this.candidates.length > 0) {
        this.candidates.forEach((candidate) => {
          if (candidate.isChecked) {
            candidateIds.push(candidate.id);
          }
        });
      }

      const data = {
        postIds,
        candidateIds,
      };

      this.jobMatching(data);
    },

    //Create refer for a post-candidate pair
    createRefer(post_id, candidate_id) {
      this.$router.push({
        path:
          "/create-refer-candidate-collaborator?post=" +
          post_id +
          "&candidate=" +
          candidate_id +
          "&warrantyId=",
      });
    },

    checkAllChecked() {
      if (!this.checkAll) {
        this.dataTable1.forEach((data) => {
          data.isChecked = true;
          this.checkAll = true;
        });
      } else if (this.checkAll) {
        this.dataTable1.forEach((data) => {
          data.isChecked = false;
          this.checkAll = false;
        });
      }
      if ([...this.selectedAll].length === 0) {
        this.selectedAll = this.dataTable1;
      } else {
        this.selectedAll = [];
      }
    },
    checkAllCheckedCandidate() {
      if (!this.checkAll1) {
        this.dataTable.forEach((data) => {
          data.isChecked = true;
          this.checkAll1 = true;
        });
      } else if (this.checkAll1) {
        this.dataTable.forEach((data) => {
          data.isChecked = false;
          this.checkAll1 = false;
        });
      }
      if ([...this.selectedAllCandidate].length === 0) {
        this.selectedAllCandidate = this.dataTable;
      } else {
        this.selectedAllCandidate = [];
      }
    },
    showSelectedAll(item) {
      // this.dataTable1[index].isChecked = !this.dataTable1[index].isChecked;
      let currCheck = item;
      let checkExit = false;
      if ([...this.selectedAll].length === 0) {
        this.selectedAll.push(currCheck);
      } else {
        this.selectedAll.forEach((data, idx) => {
          if (data.id === item.id) {
            checkExit = true;
            this.selectedAll = this.selectedAll.filter(
              (pers) => pers.id !== item.id
            );
          }
        });
        if (!checkExit) {
          this.selectedAll.push(currCheck);
        }
      }
    },
    showSelectedAllCandidate(item) {
      let currCheck = item;
      let checkExit = false;
      if ([...this.selectedAllCandidate].length === 0) {
        this.selectedAllCandidate.push(currCheck);
      } else {
        this.selectedAllCandidate.forEach((data, idx) => {
          if (data.id === item.id) {
            checkExit = true;
            this.selectedAllCandidate = this.selectedAllCandidate.filter(
              (pers) => pers.id !== item.id
            );
          }
        });
        if (!checkExit) {
          this.selectedAllCandidate.push(currCheck);
        }
      }
    },
    handleChecked(type) {
      let getAllEle = document.querySelectorAll(".checkboxValue");
      let getAllEleCandidate = document.querySelectorAll(
        ".checkboxValueCandidate"
      );
      if (type == "job") {
        getAllEle.forEach((ele, index) => {
          if (index === 0 || index === 1) {
            if (ele.style.display === "none") {
              ele.style.display = "block";
              this.is_post_negotiate = false;
            } else {
              ele.style.display = "none";
              this.is_post_negotiate = true;
              this.post_min_salary = null;
              this.post_max_salary = null;
            }
          }
        });
      } else {
        getAllEleCandidate.forEach((ele, index) => {
          if (index === 0 || index === 1) {
            if (ele.style.display === "none") {
              ele.style.display = "block";
              this.is_candidate_negotiate = false;
              this.candidate_min_salary = null;
              this.candidate_max_salary = null;
            } else {
              ele.style.display = "none";
              this.is_candidate_negotiate = true;
            }
          }
        });
      }
    },
    handleButton() {
      window.addEventListener("scroll", function (evt) {
        var webHeight = document.body.clientHeight;
        var heightFooter = document.querySelector(".styleFooter").offsetHeight;
        if (
          document.querySelector(".dot") == "undefined" ||
          document.querySelector(".dot") == null
        ) {
          var dot = document.createElement("span");
          dot.style.position = "fixed";
          dot.style.bottom = heightFooter + "px";
          dot.style.left = "0";
          dot.classList.add("dot");
          document.body.appendChild(dot);
        } else {
          var dot = document.querySelector(".dot");
          var handleButton = document.getElementById("handleButtonMatch");
          var h = document.body.getBoundingClientRect();
          var offsetY = dot.getBoundingClientRect();
          var yPosition = offsetY.top - h.top + heightFooter;
          if(handleButton != null){
            if (yPosition >= webHeight - heightFooter) {
              handleButton.classList.add("inBottom");
            } else {
              handleButton.classList.remove("inBottom");
            }
          }
        }
      });
    },
  },
};
</script>
<template>
  <Layout>
    <b-modal
      id="matching-table"
      centered
      size="lg"
      title="Danh sách matching job"
      title-class="font-18"
      ref="matching-table"
      hide-footer
      class="text-center"
    >
      <div class="tableMain mt-4">
        <div class="row">
          <div class="col-12 d-flex">
            <div class="tableContent table-scroll">
              <div class="tables table-bordered">
                <table class="table">
                  <tr class="headerTr">
                    <td style="width: 220px">Công việc</td>
                    <td>Ứng viên</td>
                    <td>Phần trăm tương đồng</td>
                    <td></td>
                  </tr>

                  <tbody class="dataTableRender">
                    <div
                      class="trMain"
                      v-for="(matching_data, index) in matching_datas"
                      v-bind:key="index"
                    >
                      <td style="width: 80px">
                        <div>
                          <div>
                            <span class="nameUser">{{
                              matching_data.postTitle
                            }}</span>
                            <div>
                              <span
                                v-if="matching_data.urgency"
                                class="urgentRecruitment rounded-pill"
                                >Tuyển gấp</span
                              >
                            </div>
                          </div>
                          <div>
                            <span class="">{{ matching_data.company }}</span>
                          </div>
                          <div v-if="matching_data.postNegotiable">
                            Thương lượng
                          </div>
                          <div v-else>
                            <span class=""
                              >{{ matching_data.postSalaryFrom }} -
                              {{ matching_data.postSalaryTo }}
                              {{ matching_data.postCurrency }}</span
                            >
                          </div>
                          <div>
                            <span class="moneyInterview"
                              ><i class="fas fa-star"></i
                              >{{ matching_data.postCommission }}
                              {{ matching_data.postCurrency }}</span
                            >/ứng viên
                          </div>
                          <div class="statusJob">
                            <span
                              v-if="matching_data.postStatus === 'active'"
                              class="statusActive rounded-pill"
                              >active</span
                            >
                            <span
                              v-if="matching_data.postStatus === 'pause'"
                              class="statusPause rounded-pill"
                              >pause</span
                            >
                            <span
                              v-if="matching_data.postStatus === 'close'"
                              class="statusClose rounded-pill"
                              >close</span
                            >
                          </div>
                          <div class="roleJob">
                            <span
                              class="rounded-pill"
                              v-for="location in matching_data.postCities"
                              v-bind:key="location"
                            >
                              {{ location }}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="nameUser">{{
                          matching_data.candidateName
                        }}</span>
                        <div>
                          <span class="emailUser">{{
                            matching_data.candidateEmail
                          }}</span>
                        </div>
                        <div>
                          <span class="userPhone">{{
                            matching_data.candidatePhone
                          }}</span>
                        </div>
                        <div v-if="matching_data.candidateNegotiable">
                          Thương lượng
                        </div>
                        <div v-else>
                          <span class=""
                            >{{ matching_data.candidateSalaryFrom }} -
                            {{ matching_data.candidateSalaryTo }}
                            {{ matching_data.candidateCurrency }}</span
                          >
                        </div>
                        <div class="roleJob">
                          <span
                            class="rounded-pill"
                            v-for="location in matching_data.candidateCities"
                            v-bind:key="location"
                          >
                            {{ location }}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          style="
                            height: 100%;
                            display: flex;
                            align-items: center;
                          "
                        >
                          <div class="d-flex" style="flex-wrap: wrap">
                            <div class="textTable">
                              <span>{{ matching_data.percent }}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          class="handleButton1"
                          v-if="matching_data.allowReferred"
                        >
                          <button
                            class="btnRefer"
                            type="button"
                            v-on:click="
                              createRefer(
                                matching_data.postId,
                                matching_data.candidateId
                              )
                            "
                          >
                            Giới thiệu ứng viên
                          </button>
                        </div>
                        <div v-else>
                          <span
                            v-if="
                              matching_data.message ===
                              'This candidate is currently recruiting for another job'
                            "
                          >
                            Ứng viên này hiện đang tuyển dụng cho một công việc
                            khác
                          </span>
                          <span
                            v-if="
                              matching_data.message === 'The post is not active'
                            "
                          >
                            Công việc không còn hoạt động
                          </span>
                          <span
                            v-if="
                              matching_data.message ===
                              'The candidate has been referred for this post before'
                            "
                          >
                            Ứng viên đã được giới thiệu cho công việc này trước
                            đây
                          </span>
                        </div>
                      </td>
                    </div>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>
    <div id="main">
      <div class="header">
        <div class="tool-bar row">
          <div class="col-md-12 title d-flex">
            <i
              class="fas fa-equals"
              style="font-size: 20px; margin-right: 7px"
            ></i>
            <PageHeader :title="title" />
          </div>
        </div>
      </div>
      <div class="mainContent">
        <div class="row">
          <div class="col-12 d-flex flex-wrap job-matching__filter">
            <div class="col-lg-6 col-12 filter__job">
              <div class="contentJobMatching">
                <div class="headercontent">
                  <h4>Công việc</h4>
                </div>
                <div class="bodycontent">
                  <div class="iconFillter">
                    <div style="flex: 1">
                      <i class="fas fa-filter"></i><span>Lọc theo</span>
                    </div>

                    <div
                      class="actionFilter"
                      v-b-toggle.collapse1
                      v-on:click="typeTab = !typeTab"
                    >
                      <i class="fas fa-plus" v-if="typeTab"></i>
                      <i class="fas fa-minus" v-if="!typeTab"></i>
                    </div>
                  </div>

                  <!-- Using value -->

                  <!-- Element to collapse -->
                  <b-collapse id="collapse1" visible class="mt-1">
                    <form>
                      <div class="col-12 formContent keywords">
                        <span class="titleForm"
                          >Công việc phải bao gồm các từ khóa sau</span
                        >
                        <div class="d-flex flex-wrap justify-content-between">
                          <div class="keywords__input">
                            <div class="formInput" style="width: 100%">
                              <b-form-tags
                                v-model="job_keywords"
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
                                    />
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
                                    <!-- Always use the tag value as the :key, not the index! -->
                                    <!-- Otherwise screen readers will not read the tag
               additions and removals correctly -->
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
                          <div class="keywords__all">
                            <div
                              class=""
                              style="width: 100%; white-space: nowrap"
                            >
                              <multiselect
                                v-model="selected_post_keyword_type"
                                :options="post_keyword_types"
                                :show-labels="false"
                                :allow-empty="false"
                                label="name"
                              ></multiselect>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        class="col-12 formContent d-flex flex-wrap filter__type"
                      >
                        <div class="filter__type-job">
                          <span class="titleForm">Loại công việc</span>

                          <div class="" style="width: 100%">
                            <multiselect
                              v-model="type_work"
                              :options="type_works"
                              :show-labels="false"
                              :allow-empty="false"
                              label="name"
                            ></multiselect>
                          </div>
                        </div>
                        <div class="filter__type-insurance">
                          <span class="titleForm">Loại bảo hành</span>
                          <div class="" style="width: 100%">
                            <multiselect
                              v-model="guarantee_type"
                              :options="guarantee_types"
                              :show-labels="false"
                              :allow-empty="false"
                              label="name"
                            ></multiselect>
                          </div>
                        </div>
                      </div>

                      <div class="col-12 formContent">
                        <span class="titleForm">Đơn vị tiền tệ</span>
                        <div class="d-flex">
                          <div
                            class="col-6 d-flex align-items-center"
                            style="padding-right: 10px"
                          >
                            <b-form-radio
                              v-model="selected_currency_post"
                              class="col-6 mb-3"
                              value="USD"
                              plain
                              >USD</b-form-radio
                            >
                            <b-form-radio
                              v-model="selected_currency_post"
                              class="col-6 custom-radio mb-3"
                              value="VND"
                              plain
                              >VND</b-form-radio
                            >
                          </div>

                          <div class="col-6" style="padding-left: 10px">
                            <span class="titleForm">Trạng thái</span>
                            <div class="" style="width: 100%">
                              <multiselect
                                v-model="status"
                                :options="statuses"
                                :show-labels="false"
                                :allow-empty="false"
                                label="name"
                              ></multiselect>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        class="col-12 formContent checkboxValue filter__salary"
                      >
                        <span class="titleForm">Mức lương</span>
                        <div class="d-flex flex-wrap">
                          <div class="filter__salary-min">
                            <div class="formInput" style="width: 100%">
                              <div class="negotiate">
                                <input
                                  type="number"
                                  style="width: 100%"
                                  placeholder="Mức lương tối thiểu"
                                  v-model="post_min_salary"
                                />
                                <i class="fas fa-dollar-sign"></i>
                              </div>
                            </div>
                          </div>
                          <div class="filter__salary-max">
                            <div class="formInput" style="width: 100%">
                              <div class="negotiate">
                                <input
                                  type="number"
                                  style="width: 100%"
                                  placeholder="Mức lương tối đa"
                                  v-model="post_max_salary"
                                />
                                <i class="fas fa-dollar-sign"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formContent d-flex align-items-center">
                        <div class="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck1"
                            style="width: 17px; height: 17px; margin-right: 8px"
                            v-on:click="handleChecked('job')"
                          />
                        </div>
                        <span class="titleForm" style="margin-top: 3px"
                          >Thương lượng</span
                        >
                      </div>
                      <div
                        class="
                          col-12
                          formContent
                          d-flex
                          flex-wrap
                          filter__company-address
                        "
                      >
                        <div class="filter__company-address__company">
                          <span class="titleForm">Công ty</span>

                          <div class="" style="width: 100%">
                            <multiselect
                              v-model="selected_companies"
                              :options="companies"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Chọn địa điểm"
                              label="name"
                              track-by="id"
                              :show-labels="false"
                            ></multiselect>
                          </div>
                        </div>
                        <div class="filter__company-address__address">
                          <span class="titleForm">Địa điểm</span>
                          <div class="" style="width: 100%">
                            <multiselect
                              v-model="selected_location_for_post"
                              :options="locations"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Chọn địa điểm"
                              label="name"
                              track-by="id"
                              :show-labels="false"
                            ></multiselect>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formContent d-flex">
                        <div class="checkBox" style="flex: 1">
                          <div class="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              class="custom-control-input"
                              id="customCheck1"
                              v-model="is_urgent"
                            />
                          </div>
                          <span class="titleForm" style="margin-top: 3px"
                            >Tuyển gấp</span
                          >
                        </div>
                        <div class="handleFindPost">
                          <button type="button" v-on:click="searchPost">
                            <i class="fas fa-search"></i>Tìm kiếm
                          </button>
                        </div>
                      </div>
                    </form>
                  </b-collapse>
                </div>
              </div>
            </div>
            <div class="col-lg-6 col-12 filter__candidate">
              <div class="contentJobMatching">
                <div class="headercontent">
                  <h4>Ứng viên</h4>
                </div>
                <div class="bodycontent">
                  <div class="iconFillter">
                    <div style="flex: 1">
                      <i class="fas fa-filter"></i><span>Lọc theo</span>
                    </div>

                    <div
                      class="actionFilter"
                      v-b-toggle.collapse
                      v-on:click="typeTab2 = !typeTab2"
                    >
                      <i class="fas fa-plus" v-if="typeTab2"></i>
                      <i class="fas fa-minus" v-if="!typeTab2"></i>
                    </div>
                  </div>
                  <b-collapse id="collapse" visible class="mt-1">
                    <form>
                      <div class="col-12 formContent">
                        <span class="titleForm"
                          >CV phải bao gồm các từ khóa sau</span
                        >
                        <div class="d-flex">
                          <div class="col-12">
                            <div class="formInput" style="width: 100%">
                              <b-form-tags
                                v-model="candidate_keywords"
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
                                    />
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
                                    <!-- Always use the tag value as the :key, not the index! -->
                                    <!-- Otherwise screen readers will not read the tag
               additions and removals correctly -->
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
                      <div class="col-12 formContent d-flex">
                        <div class="col-6" style="padding-right: 10px">
                          <span class="titleForm">Từ ngày</span>

                          <div class="formInput" style="width: 100%">
                            <input
                              id="dateFrom"
                              type="date"
                              style="width: 100%"
                              placeholder="Date from"
                              v-model="dateFrom"
                            />
                          </div>
                        </div>
                        <div class="col-6" style="padding-left: 10px">
                          <span class="titleForm">Đến ngày</span>
                          <div class="formInput" style="width: 100%">
                            <input
                              id="dateTo"
                              type="date"
                              style="width: 100%"
                              placeholder="Date to"
                              v-model="dateTo"
                            />
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formContent">
                        <span class="titleForm">Đơn vị tiền tệ</span>
                        <div class="d-flex">
                          <div
                            class="col-6 d-flex align-items-center"
                            style="padding-right: 10px"
                          >
                            <b-form-radio
                              v-model="selected_currency_candidate"
                              class="col-6 mb-3"
                              value="USD"
                              plain
                              >USD</b-form-radio
                            >
                          </div>

                          <div
                            class="col-6 d-flex align-items-center"
                            style="padding-left: 10px"
                          >
                            <b-form-radio
                              v-model="selected_currency_candidate"
                              class="col-6 custom-radio mb-3"
                              value="VND"
                              plain
                              >VND</b-form-radio
                            >
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formContent checkboxValueCandidate">
                        <span class="titleForm">Mức lương</span>
                        <div class="d-flex">
                          <div class="col-6" style="padding-right: 10px">
                            <div class="formInput" style="width: 100%">
                              <div class="negotiate">
                                <input
                                  type="number"
                                  style="width: 100%"
                                  placeholder="Mức lương tối thiểu"
                                  v-model="candidate_min_salary"
                                />
                                <i class="fas fa-dollar-sign"></i>
                              </div>
                            </div>
                          </div>

                          <div class="col-6" style="padding-left: 10px">
                            <div class="formInput" style="width: 100%">
                              <div class="negotiate">
                                <input
                                  type="number"
                                  style="width: 100%"
                                  placeholder="Mức lương tối đa"
                                  v-model="candidate_max_salary"
                                />
                                <i class="fas fa-dollar-sign"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-12 formContent d-flex align-items-center">
                        <div class="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck1"
                            style="width: 17px; height: 17px; margin-right: 8px"
                            v-model="is_candidate_negotiate"
                            v-on:click="handleChecked('candidate')"
                          />
                        </div>
                        <span class="titleForm" style="margin-top: 3px"
                          >Thương lượng</span
                        >
                      </div>
                      <div class="col-12 formContent d-flex">
                        <!-- <div class="col-6" style="padding-right: 10px">
                        <span class="titleForm">Công ty</span>

                        <div class="formInput" style="width: 100%">
                          <select name="" id="" style="width: 100%">
                            <option
                              value=""
                              v-bind:key="item.id"
                              v-for="item in arrCompany"
                            >
                              {{ item.name }}
                            </option>
                          </select>
                        </div>
                      </div> -->
                        <div class="col-12">
                          <span class="titleForm">Địa điểm</span>
                          <div class="" style="width: 100%">
                            <multiselect
                              v-model="selected_location_for_candidate"
                              :options="locations"
                              :multiple="true"
                              :close-on-select="false"
                              :clear-on-select="false"
                              :preserve-search="true"
                              placeholder="Chọn địa điểm"
                              label="name"
                              track-by="id"
                              :show-labels="false"
                            ></multiselect>
                          </div>
                        </div>
                      </div>
                      <div
                        class="col-12 formContent d-flex justify-content-end"
                      >
                        <!-- <div class="checkBox" style="flex: 1">
                        <input type="checkbox" />
                        <span class="titleForm">Tuyển gấp</span>
                      </div> -->
                        <div class="handleFindPost">
                          <button
                            class="handleFind2"
                            type="button"
                            v-on:click="searchCandidate"
                          >
                            <i class="fas fa-search"></i>Tìm kiếm
                          </button>
                        </div>
                      </div>
                    </form>
                  </b-collapse>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tableMain mt-4">
        <div class="row">
          <div class="col-12 d-flex flex-wrap job-matching__table">
            <div class="job-matching__table-job">
              <div class="tableContent">
                <div class="headerTable d-flex">
                  <span
                    style="flex: 1; font-size: 12px; color: rgba(0, 0, 0, 0.54)"
                    ><i class="fas fa-info-circle" style="margin-right: 3px"></i
                    >Nhấp vào tiêu đề cột để sắp xếp dữ liệu
                  </span>
                  <div class="selectedItem">
                    <span style="color: rgba(0, 0, 0, 0.54); margin-right: 5px"
                      >Selected:</span
                    >{{ post_selected_count }}
                  </div>
                </div>
                <div class="tables table-bordered table-scroll">
                  <table class="table">
                    <tr class="headerTr">
                      <td style="width: 20px">
                        <div class="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck1"
                            v-model="checked_all_post"
                          />
                        </div>
                      </td>
                      <td style="width: 220px">Công việc</td>
                      <td>Lương</td>
                      <td>Địa điểm</td>
                    </tr>

                    <tbody class="dataTableRender">
                      <div
                        class="trMain"
                        v-for="(post, index) in posts"
                        v-bind:key="index"
                      >
                        <td
                          style="width: 20px"
                          class="d-flex align-item-center"
                        >
                          <div class="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              class="custom-control-input"
                              id="customCheck1"
                              v-model="post.isChecked"
                              v-on:change="clickCheckBox"
                            />
                          </div>
                        </td>
                        <td style="width: 220px">
                          <div>
                            <div>
                              <span class="nameUser">{{ post.title }}</span>
                              <div>
                                <span
                                  v-if="post.urgency"
                                  class="urgentRecruitment rounded-pill"
                                  >Tuyển gấp</span
                                >
                              </div>
                            </div>
                            <div>
                              <span class="">{{ post.company_name }}</span>
                            </div>
                            <div>
                              <span class="moneyInterview"
                                ><i class="fas fa-star"></i
                                >{{ post.commission }} {{ post.currency }}</span
                              >/ứng viên
                            </div>
                            <div class="statusJob">
                              <span
                                v-if="post.status == 'active'"
                                class="statusActive rounded-pill"
                                >active</span
                              >
                              <span
                                v-if="post.status == 'pause'"
                                class="statusPause rounded-pill"
                                >pause</span
                              >
                              <span
                                v-if="post.status == 'close'"
                                class="statusClose rounded-pill"
                                >close</span
                              >
                            </div>
                            <!-- <div class="roleJob">
                              <span
                                class="rounded-pill"
                                v-for="location in post.locations"
                                v-bind:key="location.id"
                              >
                                {{ location.name }}
                              </span>
                            </div> -->
                          </div>
                        </td>
                        <td>
                          <div v-if="post.negotiable">
                            <span class="salary"> Thương lượng </span>
                          </div>
                          <div v-else>
                            <span class="salary">
                              {{ post.salary_from }} - {{ post.salary_to }}
                              {{ post.currency }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div
                            style="
                              height: 100%;
                              display: flex;
                              align-items: center;
                            "
                          >
                            <div class="d-flex" style="flex-wrap: wrap">
                              <div
                                class="textTable"
                                v-for="(location, index) in post.locations"
                                v-bind:key="location.id"
                                style="margin-right: 10px"
                              >
                                <span>{{ location.name }}</span>
                                <span
                                  v-if="
                                    post.locations.length > 1 &&
                                    index !== post.locations.length - 1
                                  "
                                  >,
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </div>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="job-matching__table-candidate">
              <div class="tableContent">
                <div class="headerTable d-flex">
                  <span
                    style="flex: 1; font-size: 12px; color: rgba(0, 0, 0, 0.54)"
                    ><i class="fas fa-info-circle" style="margin-right: 3px"></i
                    >Nhấp vào tiêu đề cột để sắp xếp dữ liệu
                  </span>
                  <div class="selectedItem">
                    <span style="color: rgba(0, 0, 0, 0.54); margin-right: 5px"
                      >Selected:</span
                    >{{ candidate_selected_count }}
                  </div>
                </div>
                <div class="tables table-bordered table-scroll">
                  <table class="table">
                    <tr class="headerTr">
                      <td style="width: 20px">
                        <div class="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            class="custom-control-input"
                            id="customCheck1"
                            v-model="checked_all_candidate"
                          />
                        </div>
                      </td>
                      <td>Ngày tạo</td>
                      <td>Ứng viên</td>
                      <td>Lương</td>
                      <td>Địa điểm</td>
                    </tr>

                    <tbody class="dataTableRender">
                      <div
                        class="trMain"
                        v-for="(candidate, index) in candidates"
                        v-bind:key="index"
                      >
                        <td
                          style="width: 20px"
                          class="d-flex align-item-center"
                        >
                          <div class="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              class="custom-control-input"
                              id="customCheck1"
                              v-model="candidate.isChecked"
                              v-on:change="clickCheckBox"
                            />
                          </div>
                        </td>
                        <td>
                          <div>
                            <span>{{
                              getDateString(candidate.created_date)
                            }}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span class="nameUser">{{ candidate.name }}</span>
                            <div>
                              <span class="emailUser">{{
                                candidate.email
                              }}</span>
                            </div>
                            <div>
                              <span class="userPhone">{{
                                candidate.phone
                              }}</span>
                            </div>
                            <div class="handleSeenUser">
                              <button
                                class=""
                                v-on:click="openCV(candidate.cv)"
                              >
                                <i class="fas fa-eye"></i>Xem CV
                              </button>
                            </div>
                          </div>
                        </td>
                        <td style="width: 180px">
                          <div v-if="candidate.negotiable">
                            <span class="salary"> Thương lượng </span>
                          </div>
                          <div v-else>
                            <span class="salary">
                              {{ candidate.salary_from }} -
                              {{ candidate.salary_to }}
                              {{ candidate.currency }}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div
                            style="
                              height: 100%;
                              display: flex;
                              align-items: center;"
                          >
                            <div class="d-flex" style="width: 100px">
                              <div
                                class="textTable"
                                v-for="(city, index) in candidate.cities"
                                v-bind:key="city"
                                style="margin-right: 10px"
                              >
                                <span>{{ city }}</span>
                                <span
                                  v-if="
                                    candidate.cities.length > 1 &&
                                    index !== candidate.cities.length - 1"
                                  >,
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </div>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="handleButtonMatch" class="handleButton" v-if="post_selected_count > 0 && candidate_selected_count > 0">
      <button class="btnRefer" type="button" v-on:click="matchThem">
        <i class="fas fa-handshake"></i><span>Match</span>
      </button>
    </div>
  </Layout>
</template>
<style lang="scss">
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
.successBtn button {
  cursor: pointer;
  margin-left: 600px;
  margin-top: 10px;
  padding: 6px 13px;
  outline: none;
  border: none;
  border-radius: 7px;
  color: white;
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
.btnPlacement {
  background: #409eff;
  transition: all 0.2s linear;
}
.btnPlacement i {
  margin-right: 5px;
}
.btnPlacement:hover {
  background: #1f85eb;
}
.handleButton1 button {
  cursor: pointer;
  margin-left: 10px;
  margin-top: 10px;
  padding: 6px 13px;
  outline: none;
  border: none;
  border-radius: 7px;
  color: white;
}
.handleButton1 .btnDown {
  background-color: #3480f7;
  color: #fff;
  transition: all 0.2s linear;
}
.handleButton1 .btnDown:hover {
  background: #445fe9;
}
.handleButton1 .btnDown i {
  margin-right: 5px;
}
.btnRefer {
  background: #1aa94c;
  transition: all 0.2s linear;
}
.btnRefer i {
  margin-right: 5px;
}
.btnRefer:hover {
  background: #0ebb4b;
}
.remove-tag {
  position: absolute;
  top: 1px;
  right: 1px;
  color: #d40c0cdb;
  padding: 0px;
}
.tableContent {
  background-color: #fff;

  border-radius: 7px;
  .headerTable {
    padding: 20px;
    span {
    }
    .selectedItem {
    }
  }
  .tables {
    .table {
      .headerTr {
        background-color: #ececec;
        height: 30px;
        td {
          border-right: 2px solid #f9f9f9;
          transition: all 0.15s;
          cursor: pointer;
          input {
            width: 18px;
            height: 18px;
            margin: auto;
          }
          &:hover {
            background-color: #f4f4f4;
          }
        }
      }
      .dataTableRender {
        .urgentRecruitment {
          background-color: #e60000c9;
          color: #ffffff;
          padding: 2px 10px;
          font-size: 13px;
        }
        .roleJob {
          margin-top: 5px;
          span {
            background: #ececec !important;
            color: #08090a !important;
            padding: 2px 10px;
            margin-right: 5px;
          }
        }
        .moneyInterview {
          margin-top: 5px;

          color: #e60000c9 !important;
          i {
            margin-right: 5px;
          }
        }
        .statusJob {
          span {
            padding: 2px 10px;
          }
          .statusActive {
            background: #b5f4cb !important;
            color: #0a1e05 !important;
          }
          .statusPause {
            background: #f1b44c !important;
            color: #0a1e05 !important;
          }
          .statusClose {
            background: #ffe5e5 !important;
            color: #f44336 !important;
          }
        }
        .trMain {
          display: table-row;
          position: relative;
          height: 100%;
          transition: all 0.15s;
          cursor: pointer;
          &:hover {
            background-color: #f4f4f4;
            -webkit-box-shadow: 0px 7px 6px -6px rgba(0, 0, 0, 0.75);
            -moz-box-shadow: 0px 7px 6px -6px rgba(0, 0, 0, 0.75);
            box-shadow: 0px 7px 6px -6px rgba(0, 0, 0, 0.75);
          }
        }
        .centerTd {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        .salary {
          font-weight: bold;
        }
        input {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          margin: auto;
        }
        .nameUser {
          color: #179342;
          font-weight: 550;
          font-size: 17px;
          &:hover {
            border-bottom: 1px solid #1dbf56;
            cursor: pointer;
            color: #1dbf56;
          }
        }
        .emailUser {
          color: #1dbf56;
          &:hover {
            border-bottom: 1px solid #1dbf56;
            cursor: pointer;
          }
        }
        .userPhone {
          color: #1dbf56;
          &:hover {
            border-bottom: 1px solid #1dbf56;
            cursor: pointer;
          }
        }
        .handleSeenUser {
          margin-top: 5px;
          button {
            font-size: 12px;
            outline: none;
            border-radius: 5px;
            padding: 2px 5px;
            border: none;
            color: #fff;
            background-color: #5b73e8;
            border: 1px solid #5b73e8;
            &:hover {
              background: #3859fd;
              border: 1px solid #3859fd;
            }
            i {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
body {
  overflow-y: scroll;
}
.mainContent {
  .contentJobMatching {
    .headercontent {
      margin-top: 30px;
      h4 {
      }
    }
    .bodycontent {
      background: rgba(0, 0, 0, 0.055);
      border-radius: 8px;
      border: 1px solid rgba(230, 225, 225, 0.623);
      padding: 18px 20px;
      margin-top: 15px;
      .iconFillter {
        display: flex;
        align-items: center;
        .actionFilter {
          i {
            font-size: 15px;
          }
        }
        span {
          font-size: 16px;
        }
        i {
          margin-right: 10px;
          font-size: 20px;
        }
      }
      .formContent {
        margin-top: 15px;
        .titleForm {
        }
        .formInput {
          .negotiate {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1px solid #eee;
            border-radius: 5px;
            input {
              height: 35px;
              border: none;
              padding: 0 10px;
            }
            i {
              padding: 0 11px;
            }
          }
          input {
            padding: 0 10px;
            height: 37px;
            border-radius: 5px;
            border: 1px solid #eee;
            transition: all 0.3s linear;
            &:focus {
              -webkit-box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              -moz-box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              outline: none;
            }
            &:hover {
              border: 1px solid #5b73e8;
            }
          }
          select {
            padding: 0 10px;
            height: 37px;
            border-radius: 5px;
            border: 1px solid #eee;
            transition: all 0.3s linear;
            &:focus {
              -webkit-box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              -moz-box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              box-shadow: 0px 0px 4px 1px rgba(128, 149, 242, 1);
              outline: none;
            }
            &:hover {
              border: 1px solid #5b73e8;
            }
          }
          .multiselect {
            height: 37px !important;
          }
        }
      }
      .checkBox {
        display: flex;
        align-items: center;
        .titleForm {
          margin-left: 8px;
        }
        input {
          height: 17px;
          width: 17px;
        }
      }

      .handleFindPost {
        button {
          outline: none;
          border: 1px solid #5b73e8;
          border-radius: 7px;
          background: #5b73e8;
          padding: 4.2px 10px;
          color: #fff;
          transition: all 0.3s ease-in-out;
          &:hover {
            background: #4460e9;
          }
          i {
            font-size: 14px;
            margin-right: 7px;
          }
        }
        .handleFind2 {
          border: 1px solid #1aa94c;

          background-color: #1aa94c;
          &:hover {
            background-color: #10b94b;
          }
        }
      }
    }
  }
}
.header {
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
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      -webkit-box-shadow: 0px 1px 7px 0px rgb(207, 207, 207);
      -moz-box-shadow: 0px 1px 4px 0px rgb(207, 207, 207);
      box-shadow: 0px 1px 4px 0px rgb(207, 207, 207);
      background-color: rgb(207, 207, 207);
    }
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
}
.custom-checkbox .custom-control-input:checked {
  background-color: #ff4081;
  border-color: #ff4081;
}
thead,
tbody,
tfoot,
tr,
td,
th {
  border-color: none;
  border-style: none;
  border-width: 0;
}

.handleButton {
  position: fixed;
  display: flex;
  left: 50%;
  transform: translateX(-50%);
  bottom: 15px;
  justify-content: center;
  z-index: 999;
}
.handleButton button {
  cursor: pointer;
  margin-left: 10px;
  margin-top: 10px;
  padding: 6px 13px;
  outline: none;
  border: none;
  border-radius: 7px;
  color: white;
}
.handleButton .btnDown {
  background-color: #3480f7;
  color: #fff;
  transition: all 0.2s linear;
}
.handleButton .btnDown:hover {
  background: #445fe9;
}
.handleButton .btnDown i {
  margin-right: 5px;
}
.btnRefer {
  background: #1aa94c;
  transition: all 0.2s linear;
}
.btnRefer i {
  margin-right: 5px;
}
.btnRefer:hover {
  background: #0ebb4b;
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
.keywords__all{
  .multiselect__content{
    width: 100%;
    
    .multiselect__option{
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
  }
}
.job-matching__filter {
  .filter__job {
    padding-right: 15px;

    @media screen and (max-width: 991.98px) {
      padding-right: 0;
    }

    .keywords {
      &__input {
        margin-right: 15px;
        width: 75%;
      }

      &__all {
        width: calc(25% - 15px);
      }

      @media screen and (max-width: 575.98px) {
        &__input {
          margin-right: 0;
          width: 100%;
        }

        &__all {
          width: 100%;
        }
      }
    }

    .filter__type {
      &-job {
        width: calc(50% - 10px);
        margin-right: 10px;
      }

      &-insurance {
        margin-left: 10px;
        width: calc(50% - 10px);
      }

      @media screen and (max-width: 575.98px) {
        &-job {
          margin-right: 0;
          width: 100%;
        }

        &-insurance {
          margin-top: 10px;
          margin-left: 0;
          width: 100%;
        }
      }
    }

    .filter__salary {
      &-min {
        width: calc(50% - 10px);
        margin-right: 10px;
      }
      &-max {
        width: calc(50% - 10px);
        margin-left: 10px;
      }

      @media screen and (max-width: 459.98px) {
        &-min {
          margin-right: 0;
          width: 100%;
        }

        &-max {
          margin-top: 10px;
          margin-left: 0;
          width: 100%;
        }
      }
    }

    .filter__company-address {
      &__company {
        width: calc(50% - 10px);
        margin-right: 10px;
      }

      &__address {
        width: calc(50% - 10px);
        margin-left: 10px;
      }

      @media screen and (max-width: 459.98px) {
        &__company {
          margin-right: 0;
          width: 100%;
        }

        &__address {
          margin-top: 10px;
          margin-left: 0;
          width: 100%;
        }
      }
    }
  }

  .filter__candidate {
    padding-left: 15px;

    @media screen and (max-width: 991.98px) {
      padding-left: 0;
    }
  }
}

.job-matching__table {
  &-job {
    width: calc(50% - 10px);
    margin-right: 10px;
  }
  &-candidate {
    width: calc(50% - 10px);
    margin-left: 10px;
  }

  @media screen and (max-width: 991.98px) {
    &-job {
      width: 100%;
      margin-right: 0;
    }
    &-candidate {
      margin-top: 20px;
      width: 100%;
      margin-left: 0;
    }
  }
}
.job-matching__filter{
  .multiselect__tags{
    display: block;
    border-radius: 5px;
    border: 1px solid #e8e8e8 !important;
    background-color: #fff !important;
  }
}

.table-scroll {
  $min-width-desktop: 1366px;
  @media (max-width: #{$min-width-desktop - 0.02px}) {
    overflow-x: auto;
  }

  table {
    tr {
      white-space: nowrap;
    }
  }
}
#handleButtonMatch.handleButton.inBottom {
  position: unset;
  transform: unset;
  
  .handleButton__box {
    transform: translateX(-50%);
  }

  @media (max-width: 1024px) {
    text-align: right !important;
    transform: unset;
  }
}
</style>