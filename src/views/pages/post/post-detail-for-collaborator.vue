<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { mapActions, mapState } from "vuex";
import Multiselect from "vue-multiselect";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import { sperateMoney } from "../../../helpers/common/Ultilities";
import FileSaver from "file-saver";

export default {
  page: {
    title: "Chi tiết công việc",
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
      // Comment
      send_comment_value: "",
      reply_comment_value: "",
      comments: [],
      post: {},
      title: "Thông tin công việc",
      status: "",
      create_date: "",
      end_date: "",
      update_date: "",
      retry: 0,

      //Status
      introduction_statuses: [
        {
          id: "0",
          name: "Tất cả trạng thái",
        },
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
          name: "Resign",
        },
        {
          id: "18",
          name: "Completed",
        },
      ],
      introduction_status: {
        id: "0",
        name: "Tất cả trạng thái",
      },

      //Sort
      introduction_sorts: [
        {
          id: 0,
          name: "Ngày giới thiệu",
        },
        {
          id: 1,
          name: "Tên ứng viên",
        },
        {
          id: 2,
          name: "Tên công việc",
        },
      ],
      introduction_sort: {
        id: 0,
        name: "Ngày giới thiệu",
      },

      // Page
      introduction_page_index: 1,
      introduction_page_size: 20,

      //Response data
      introductions: [],

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
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Tên ứng viên",
        },
        {
          id: 2,
          name: "Tiêu đề hồ sơ",
        },
        {
          id: 3,
          name: "Trạng thái",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày tạo",
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
      total_count: 0,

      path_cv_hided: null,
    };
  },
  watch: {
    post: function () {
      if (this.post === undefined) {
        if (this.retry < 3) {
          this.getPostDetailById();
          this.retry++;
        }
      } else {
        // this.title = this.post.title;
        this.status = this.post.status;
        this.create_date = this.getDateString(this.post.date_on);
        this.end_date = this.getDateString(this.post.date_end);
      }
    },
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
        this.searchCandidate();
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
    introduction_status: function () {
      this.getCandidateIntroductions();
    },
    introduction_sort: function () {
      this.getCandidateIntroductions();
    },
  },
  computed: {
    ...mapState("postdetail", ["postDetail"]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.getPostDetailById();
    this.getAllComment();
    this.getCitiesForFilter();
    this.searchCandidate();
    this.getCandidateIntroductions();
    this.handleButton();
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
          break;
        case "comment/sendCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
          break;
        case "comment/replyCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
          break;
        case "comment/getAllCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
          break;
        case "comment/likeCommentForPostSuccess":
          this.getAllComment();
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
        case "candidates/uploadCVSuccess":
          //Get cv path after upload
          this.path_cv_hided = state.candidates.candidateData.pathHided;
          state.candidates.cvPath = this.path_cv_hided;
          if (state.candidates.candidateData.pathHided !== "") {
            this.$router.push({
              path:
                "/create-refer-candidate-collaborator?post=" + this.getPostId(),
            });
          }
          break;
        case "introductions/introductionDataSuccess":
          this.introductions =
            state.introductions.introductionData.candidateIntroductions;
          break;
        case "introductions/introductionDataFailure":
          break;
        case "post/exportJDSuccess":
          const data = state.post.jdData;
          FileSaver.saveAs(new Blob([data]), `${this.post.title}.pdf`);
          break;
      }
    });
    this.setLocalComment();
    this.getLocalComment();
  },
  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("postdetail", ["getPostDetail", "getData"]),
    ...mapActions("comment", [
      "getAllCommentForPost",
      "sendCommentForPost",
      "replyCommentForPost",
      "likeComment",
    ]),
    ...mapActions("introductions", ["getCandidateIntroductionInPost"]),
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("candidates", ["searchCandidateToRefer", "uploadCVFile"]),
    ...mapActions("post", ["exportJD"]),
    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    //Open CV in new tab
    openCV(path) {
      if (path) {
        
        const cv_type = this.getFileExtension(path)[0];
        switch (cv_type) {
          case "pdf":
            console.log(generateApiUrl(path));
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
      }
    },

    downloadJD() {
      const language = {
        vi: {
          company: "Công ty",
          working_location: "Vị trí làm việc",
          salary: "Lương",
          negotiable: "Thương lượng",
          job_levels: "Trình độ",
          job_roles: "Vai trò",
          skills: "Kỹ năng",
          overview: "Tổng quan công việc & Trách nhiệm",
          requirement: "Yêu cầu công việc",
          benefit: "Lợi ích công việc",
          interview: "Quy trình phỏng vấn",
          round: "Vòng",
          company_about: "Giới thiệu về công ty",
          company_address: "Địa chỉ công ty",
          company_website: "Website công ty",
        },
        en: {
          company: "Company",
          working_location: "Working location",
          salary: "Salary",
          negotiable: "Negotiable",
          job_levels: "Job levels",
          job_roles: "Job roles",
          skills: "Skills",
          overview: "Job Overview And Responsibility",
          requirement: "Required Skills and Experience",
          benefit: "Why Candidate should apply this position",
          interview: "Interview process",
          round: "Round",
          company_about: "About company",
          company_address: "Company address",
          company_website: "Company website",
        },
      };

      var selected_language = language.vi;
      if (this.$i18n.locale === "en") {
        selected_language = language.en;
      }

      //Location
      var location = "";
      this.post.cities.forEach((item, index) => {
        if (index < this.post.cities.length - 1) {
          location = location + item.name + ", ";
        } else {
          location = location + item.name;
        }
      });

      // Salary
      if (this.post.negotiable) {
        var salary = selected_language.negotiable;
      } else {
        var salary =
          this.sperateMoneyString(this.post.salary_from) +
          " - " +
          this.sperateMoneyString(this.post.salary_to) +
          " " +
          this.post.currency;
      }

      // Job levels
      var job_levels = "";
      this.post.job_level.forEach((item, index) => {
        if (index < this.post.job_level.length - 1) {
          job_levels = job_levels + item + ", ";
        } else {
          job_levels = job_levels + item;
        }
      });

      // Job roles
      var job_roles = "";
      this.post.job_role.forEach((item, index) => {
        if (index < this.post.job_role.length - 1) {
          job_roles = job_roles + item.name + ", ";
        } else {
          job_roles = job_roles + item.name;
        }
      });

      // Skill
      var skills = "";
      this.post.skills.forEach((item, index) => {
        if (index < this.post.skills.length - 1) {
          skills = skills + item.description + ", ";
        } else {
          skills = skills + item.description;
        }
      });

      // Interview
      var interviewHTML = "";
      this.post.interviews.forEach((interview, index) => {
        interviewHTML =
          interviewHTML +
          `<p>${selected_language.round} ${index + 1}: ${
            interview.description
          }</p>`;
      });

      var html = `<html style="font-size: 1em;font-family: Roboto;padding-left:20px">
      <div></div>
      <h3 style="color:#063763;text-align: left;">${this.post.title}</h3>
      <p><span style="font-weight: bold;">${selected_language.company}: </span>${this.post.company.name}</p>
      <p><span style="font-weight: bold;">${selected_language.working_location}: </span>${location}</p>
      <p><span style="font-weight: bold;">${selected_language.salary}: </span>${salary}</p>
      <p><span style="font-weight: bold;">${selected_language.job_levels}: </span>${job_levels}</p>
      <p><span style="font-weight: bold;">${selected_language.job_roles}: </span>${job_roles}</p>
      <p><span style="font-weight: bold;">${selected_language.skills}: </span>${skills}</p>
      <h3 style="color:#063763;text-align: left;">${selected_language.overview}</h3>
      <p style="white-space: pre-line">${this.post.content}</p>
      <h3 style="color:#063763;text-align: left;">${selected_language.requirement}</h3>
      <p style="white-space: pre-line">${this.post.require}</p>
      <h3 style="color:#063763;text-align: left;">${selected_language.benefit}</h3>
      <p style="white-space: pre-line">${this.post.benefit}</p>
      <h3 style="color:#063763;text-align: left;">${selected_language.interview}</h3>
      ${interviewHTML}
      <h3 style="color:#063763;text-align: left;">${selected_language.company_about}</h3>
      <p style="white-space: pre-line">${this.post.company.introduction}</p>
      <p><span style="font-weight: bold;">${selected_language.company_address}: </span>${this.post.company.address}</p>
      <p><span style="font-weight: bold;">${selected_language.company_website}: </span>${this.post.company.website}</p>
      </html>`;
      var data = {
        html: html,
      };
      this.exportJD(data);
    },

    copySelfReferLink() {
      let userStorage = JSON.parse(localStorage.getItem("user"));
      var origin = window.location.origin;
      var link =
        origin +
        "/self-refer?id=" +
        this.getPostId() +
        "&cid=" +
        userStorage.data.id;
      var copy = prompt(
        "Sao chép đường dẫn bên dưới để cung cấp cho ứng viên nộp hồ sơ",
        link
      );
    },

    getCandidateIntroductions() {
      const status = this.introduction_status.id;
      const page_index = this.introduction_page_index - 1;
      const page_size = this.introduction_page_size;
      const sort_by = this.introduction_sort.id;
      const post_id = this.getPostId();

      const data = {
        status,
        page_index,
        page_size,
        sort_by,
        post_id,
      };

      this.getCandidateIntroductionInPost(data);
    },

    goToIntroductionDetail(introduction_id) {
      this.$router.push({
        path: "/refer-candidate-detail-collaborator?id=" + introduction_id,
      });
    },

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    async getPostDetailById() {
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

      this.getPostDetail(id).then(() => {
        // this.post = this.$store.state.postdetail.postDetail.post;
      });
    },

    getImageURL(path) {
      return generateApiUrl(path);
    },
    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    getTimeAgo(timestamp) {
      var startDateTime = new Date(timestamp);
      var startStamp = startDateTime.getTime();

      var newDate = new Date();
      var newStamp = newDate.getTime();

      var diff = Math.round((newStamp - startStamp) / 1000);

      var d = Math.floor(diff / (24 * 60 * 60));
      diff = diff - d * 24 * 60 * 60;
      var h = Math.floor(diff / (60 * 60));
      diff = diff - h * 60 * 60;
      var m = Math.floor(diff / 60);
      diff = diff - m * 60;

      if (d > 0) {
        return d + " ngày trước";
      } else if (h > 0) {
        return h + " giờ trước";
      } else if (m > 0) {
        return m + " phút trước";
      } else {
        return "vài giây trước";
      }
    },

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

    getAllComment() {
      var id = this.getPostId();

      this.getAllCommentForPost(id);
    },

    sendComment() {
      var content = this.send_comment_value;
      var post_id = this.getPostId();

      this.sendCommentForPost({
        post_id,
        content,
      }).then(() => {
        this.send_comment_value = "";
      });
    },

    replyComment(parent_comment_id) {
      var content = this.reply_comment_value;

      this.replyCommentForPost({
        parent_comment_id,
        content,
      }).then(() => {
        this.reply_comment_value = "";
      });
    },

    likeCommentForPost(parent_comment_id) {
      this.likeComment(parent_comment_id);
    },

    getCitiesForFilter() {
      this.getCitiesList();
    },

    searchCandidate() {
      const postId = this.getPostId();
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

    referCandidate(id) {
      const post_id = this.getPostId();
      return (
        "/create-refer-candidate-collaborator?post=" +
        post_id +
        "&candidate=" +
        id +
        "&warrantyId="
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
          var handleButton = document.getElementById("handleButtonPost");
          var h = document.body.getBoundingClientRect();
          var offsetY = dot.getBoundingClientRect();
          var yPosition = offsetY.top - h.top + heightFooter;
          if (yPosition >= webHeight - heightFooter) {
            handleButton.classList.add("inBottom");
          } else {
            handleButton.classList.remove("inBottom");
          }
        }
      });
    },
  },
};
</script>

<template>
  <Layout>
    <div class="d-flex mt-2" style="align-items: center; height: 40px">
      <a href="./manage-post-for-collaborator">
      <button class="handleBack">
        <i class="fas fa-chevron-left"></i>
      </button>
      </a>
      <div class="titleInfomation">
        <div class="textHeader d-flex">
          <span class="textHeaderTitle">{{ post.title }}</span>
           <div class="status__post">
                  <span
                    v-if="post.status == 'active'" style="border: 1px solid #34c38f;"
                    class="badge bg-success rounded-pill"
                    >{{ post.status }}</span
                  >
                  <span
                    v-if="post.status == 'pause'" style="border: 1px solid #f1b44c "
                    class="badge bg-warning rounded-pill"
                    >{{ post.status }}</span
                  >
                  <span
                    v-if="post.status == 'close'"
                    class="badge bg-danger rounded-pill" style="border: 1px solid #e60000 "
                    >{{ post.status }}</span
                  >
                </div>
          <span    class="badge badgeStatus rounded-pill" v-if='post.urgency === true'>
            Tuyển gấp
          </span>
        </div>
        <div class="salaryText">
          <span class="bonus"
            ><strong>Thưởng {{ sperateMoneyString(post.commission) }} {{ post.currency }}</strong
            ><span style=""> / Ứng viên</span></span
          >
        </div>
      </div>
      <!-- <PageHeader :title="title" :items="items" /> -->
    </div>
    <!-- <div class="tabContent d-flex">

      <div class="tab-item active">
        <span> Chi tiết công việc </span>
      </div>
      <div class="tab-item">
        <span> Bình luận và hoạt động gần đây </span>
      </div>
      <div class="tab-item">
        <span> Ứng viên </span>
      </div>
    </div> -->
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
              <div class="jobInfor d-flex" style="padding:0">
                <div class="col-xl-6 col-12" style="padding:0">
                  <div class="job-detail">
                    <div class="header-detail">
                      <div class="title-header">
                        <span>Chi tiết công việc</span>
                      </div>
                      <div class="icon-header">
                        <div class="iconShare" v-on:click="copySelfReferLink">
                          <i class="fas fa-share-alt"></i>
                        </div>
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
                              font-weight: 600;
                            "
                            >Công ty: {{ post.company.name }}</span
                          >
                        </div>
                        
                               <div class="d-flex mb-1 align-items-center">
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
                              font-weight: 600;                              
                              margin-right: .5rem;
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
                          <span v-if="post.cities.length <= 0">Chưa có</span>
                        </div>
                        <div class="d-flex align-items-center">
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
                              font-weight: 600;
                              margin-right: .5rem;
                            "
                            >Ngày tạo: </span><span 
                              style="font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ create_date }}</span>

                        </div>

                        <div class="mt-1 d-flex align-items-center">
                          <div
                            style="
                              font-size: 17px;
                              width: 25px;
                              margin-right: 5px;
                              text-align: center;
                              margin-right: .5rem;
                            "
                          >
                            <i class="mdi mdi-timer"></i>
                          </div>
                          <span
                            class="fontTitle"
                            style="
                              font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
                            "
                            >Hạn nộp hồ sơ: </span><span 
                              style="font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ end_date }}</span>
                        </div>
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                              margin-right: .5rem;
                            "
                            >Ngành nghề:
                            <span class="workText">
                              <i style="font-size: 10px; margin-right: 2px"></i
                              >{{ post.industry.name }}</span
                            ></span
                          >
                        </div>
                       <div class="mt-1 d-flex align-items-center">
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
                          <span v-if=" post.salary_from > 0 || post.salary_to > 0"
                            class="fontTitle"
                            style="
                              font-size: 17px;
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                              margin-right: .5rem;
                            "
                            >Lương:
                            <span class="textSalaryDetail">
                             {{
                                sperateMoneyString(post.salary_from) + " - " + sperateMoneyString(post.salary_to)
                              }} {{post.currency}}</span
                            ></span
                          >
                             <span v-if=" !post.salary_from  && !post.salary_to "
                            class="fontTitle"
                            style="
                              font-size: 17px;
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                              margin-right: .5rem;
                            "
                            >Lương:
                            <span  class="textSalaryDetail"> Thương lượng</span>
                            </span>
                        </div>
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              margin-right: .5rem;
                            "
                            >Số lượng tuyển: </span><span style="
                              font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ post.require_number }}</span>
                        </div>
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                              margin-right: .5rem;
                            "
                            >Trình độ:
                              <span class="textLevelJob" style="margin-right:5px" v-for="item in post.job_level" v-bind:key='item'>{{item}}</span>
                          </span>
                        </div>
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              margin-right: .5rem;
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
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              margin-right: .5rem;
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
                        <div class="mt-1 d-flex align-items-center">
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
                              font-weight: 600;
                              margin-right: .5rem;
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
                            <span v-if="post.skills.length <= 0">Chưa có</span>
                          </span>
                        </div>

                         <div class="mt-1 d-flex align-items-center">
                          <div
                            style="
                              font-size: 17px;
                              width: 25px;
                              margin-right: 5px;
                              text-align: center;
                            "
                          >
                      <i class="fas fa-newspaper"></i>                          </div>
                          <span
                            class="fontTitle"
                            style="
                              font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
                              margin-right: .5rem;
                            "
                            >Loại bảo hành:
                              <span
                                class="textGuarantee"
                              >
                                {{ post.guarantee_type }}</span
                              >
                            </span>
                          
                        </div>
                      </div>
                      <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Tổng quan công việc & Trách nhiệm</span>
                        </div>
                        <div class="text" style="white-space: pre-line;">
                          <p>
                            {{ post.content }}
                          </p>
                        </div>
                      </div>
                      <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Lợi ích công việc</span>
                        </div>
                        <div class="text" style="white-space: pre-line;">
                          <p>
                            {{ post.benefit }}
                          </p>
                        </div>
                      </div>
                      <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Yêu cầu công việc</span>
                        </div>
                        <div class="text" style="white-space: pre-line;">
                          <p>
                           {{post.require}}
                          </p>
                        </div>
                      </div>
                      <div class="textDetail">
                        <div class="text-header mt-3">
                          <span>Quy trình phỏng vấn </span>
                        </div>
                        <div class="text">
                               <span v-if="post.interviews.length > 0">
                              <span
                                class="text"
                                v-for="(item,idx) in post.interviews"
                                :key="item.id"
                              >
                                Vòng {{idx+1}}: {{ item.description }} <br/></span
                              >
                            </span>
                            <span v-if="post.interviews.length <= 0">Chưa có</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- <div class="handleButton"> -->
                  
                  
                  <!-- </div> -->
                </div>
                <div class="col-xl-6 col-12 company" style="padding-left: 1.75rem">
                  <div class="companyInfor">
                    <span class="titleCompany">Thông tin công ty</span>
                  </div>
                  <div class="contentCompany">
                    <div class="d-flex">
                      <div
                        class="col-4"
                        style="
                          margin-right: 15px;

                          display: flex;
                          align-items: center;
                          justify-content: center;
                        "
                      >
                        <img style="width:50%" :src="getImageURL(post.company.company_image)" />
                      </div>
                      <div class="col-8" style="padding: 10px 15px;">
                        <div class="contentItem pt-2">
                          <h4>{{post.company.name}}</h4>
                          <div class="itemSpan">
                            <div>
                              <span style="font-weight: 500; color: #999"
                                >Địa chỉ</span
                              >
                              <div class="detailAdss mb-2">
                                <span>{{post.company.address}}</span>
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
                            <span style="font-weight: 500; color: #999"
                              >Website</span
                            >
                            <div class="detailAdss">
                              <span>{{post.company.website}}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="aboutCompany">
                      <div class="contentAbout" style="white-space: pre-line;">
                        <h3>Giới thiệu về công ty</h3>
                        <h6>
                         {{post.company.introduction}}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="handleButton" id="handleButtonPost">
      <button class="btnDown" v-on:click="downloadJD">
        <i class="fas fa-cloud-download-alt"></i
        ><span>Tải JD</span></button
      >
                <button v-if="post.status === 'active'" class="btnRefer" type="button" v-b-modal.modal-xl>
        <i class="fas fa-user-plus"></i
        ><span>Giới thiệu ứng viên</span>
      </button>

      <b-modal
        id="modal-xl"
        size="xl"
        title="Giới thiệu ứng viên"
        title-class="font-18"
        hide-footer
      >
        <div class="modalContent">
          <div class="d-flex flex-wrap">
          <div class="col-lg-8" style="padding: 10px 15px;position: relative;">
            <div class="headerUpload">
              <span>Chọn từ danh sách ứng viên của bạn</span>
            </div>
            <form class="filter filterReferCandidate mt-3 position-relative" action="">
              <div class="filter-bar d-flex">
                  <div class="col-2 d-flex align-items-center">      <span
                  ><i
                    class="fas fa-filter"
                    style="margin-right: 5px; font-size: 18px"
                  ></i
                  >Lọc theo</span
                ></div>
                <div class="col-10 align-items-center d-flex" style="flex-wrap:wrap">
          
                <div class="optionSelected">
                  <multiselect
                    v-model="location"
                    label="name"
                    :options="locations"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width:200px"
                    placeholder="Chọn vị trí"
                  ></multiselect
                  ><i class="fas fa-chevron-down"></i>
                </div>
                <div class="optionSelected">
                  <multiselect
                    v-model="currency"
                    label="name"
                    :options="currencies"
                    :allow-empty="false"
                    :show-labels="false"
                        style="width:200px"
                    placeholder="Chọn đơn vị tiền tệ"
                  ></multiselect
                  ><i class="fas fa-chevron-down"></i>
                </div>
                <div class="optionSelected">
                  <multiselect
                  v-model="salary"
                  label="name"
                  :options="salaries"
                  :allow-empty="false"
                  :show-labels="false"
                      style="width:200px"
                  placeholder="Chọn khoản lương"
                  ></multiselect
                  ><i class="fas fa-chevron-down"></i>
                </div>
                <div class="optionSelected mt-1" >
                  <input
                    id="dateFrom"
                    type="date"
                    class="form-control date"
                    placeholder="Từ ngày"
                    v-model="dateFrom"
                        style="width:200px"
                  />
                </div>
                <div class="optionSelected mt-1">
                  <input
                    id="dateTo"
                    type="date"
                    class="form-control date"
                    placeholder="Đến ngày"
                    v-model="dateTo"
                      style="width:200px" 
                  />
                </div>
              </div>
              </div>
          

              <div class="filter-search d-flex mt-5 col-12">
                <div class="position-relative inputSearch">
                  <i class="fas fa-search"></i>
                  <input
                    type="text"
                    class="form-control"
                    id="inputEmail4"
                    placeholder="CV bao gồm các từ khóa sau"
                    v-model="search_require"
                  />
                </div>
                <div class="handleActionSearch">
                  <button
                    type="button"
                    class="btn btn-search"
                    v-on:click="searchCandidate"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </form>
            <div
              class="header justify-content-between d-flex"
              style="margin-top: 15px;bottom:0;width:100%"
            >
              <div
                class="d-flex align-items-center"
                style="font-size: 14px; font-weight: 500"
              >
                <span style="margin-right: 4px">{{
                  total_count
                }}</span>
                Ứng viên
              </div>
              <div
                class="d-flex sort sortModalCandidate align-items-center"
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
          <div class="col-lg-4 " style="padding:8px">
            <div class="headerUpload">
              <span>Tải lên hồ sơ ứng viên tại đây</span>
            </div>
            <div class="contentUp mt-3">
              <div class="upload-main mt-2 text-center">
                <input
                  type="file"
                  id="inputUpload"
                  @change="uploadCV"
                  hidden
                />
                <div class="upload-container p-2">
                  <h4>Tải hồ sơ của bạn lên đây</h4>
                  <p><i class="fas fa-cloud-upload-alt"></i></p>
                  <p>
                    Thông tin liên lạc của ứng viên, thông tin bí
                    mật và nhạy cảm
                  </p>
                  <p>Sẽ bị hệ thống xóa sau khi tải lên</p>
                  <p>
                    Sau khi tệp được tải lên, hệ thống sẽ nhận
                    được một số thông tin cơ bản. Vui lòng điền
                    thông tin còn thiếu.
                  </p>
                  <button type="button" class="btn btn-upload" @click="onClickedUploadButton">
                    <i class="fas fa-cloud-upload-alt"></i> Upload file (Chỉ .PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          </div>
        
          <div class="tableRender mt-3">
            
              <div class="row">
                <div class="col-12">
                  <div class="card" style="border-radius: 10px">
                    <div class="">
                      <div class="table-responsive">
                        <table class="table mb-0">
                          <thead class="thead-light">
                            <tr>
                              <th>Tên</th>
                              <th>Tiêu đề hồ sơ</th>
                              <th>Ngày tạo</th>
                              <th>Lương</th>
                              <th>Email</th>
                              <th>Số điện thoại</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody v-for="candidate in candidates" v-bind:key="candidate.id">
                            <tr>
                              <th scope="row">{{ candidate.name }}
                              <td><span class="seenCv" v-on:click="openCV(candidate.cv)">Xem CV</span></td>
                              </th>
                              <td>{{ candidate.profile_title }}</td>
                              <td>{{ getDateString(candidate.created_date) }}</td>
                              <td>{{ sperateMoneyString(candidate.salary_from) }} - {{ sperateMoneyString(candidate.salary_to) }} {{candidate.currency}}</td>
                              <td>{{ candidate.email }}</td>
                              <td>{{ candidate.phone }}</td>

                              <td>
                                <a v-bind:href="referCandidate(candidate.id)">
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
    
    </div>
              </div>
            </b-tab>
            <b-tab>
              <template v-slot:title>
                <span class="d-inline-block d-sm-none">
                  <i class="far fa-user"></i>
                </span>
                <span class="d-none d-sm-inline-block detailTextJovs"
                  >Bình luận</span
                >
              </template>
              <!-- Tab Content -->
              <div class="col-12 mt-4 d-flex flex-wrap commentAndAction">
                <div class="col-lg-6 col-12">
                  <!-- Comment -->
                  <div class="titleComment">
                    <span>Bình luận</span>
                  </div>
                  <div class="col-6 mainComment" style="">
                    <div class="commnentContent">
                      <!-- Send comment -->
                      <div class="inputValueComment d-flex">
                        <div class="iconUser">
                          <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="commnentContentInput">
                          <div class="input">
                            <input
                              type="text"
                              class="inputVl"
                              placeholder="Viết bình luận"
                              v-model="send_comment_value"
                            />
                          </div>
                          <div class="submitComment mb-2 mt-2">
                            <button v-on:click="sendComment">
                              Gửi bình luận
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        class="userComment mt-2 d-flex"
                        v-for="parentComment in comments"
                        :key="parentComment.id"
                      >
                        <!-- Parent comment -->
                        <div class="iconUser">
                          <i class="fas fa-user-circle"></i>
                        </div>
                        <div>
                          <div class="commnentContentInput">
                            <div class="input">
                              <span class="user">{{ parentComment.account_name }}: </span
                              ><span>{{ parentComment.content }}</span>
                            </div>
                          </div>
                          <div class="timeLine d-flex align-items-center">
                            <span style="margin-right: 5px">{{
                              getTimeAgo(parentComment.time)
                            }}</span>

                            <i
                              style="cursor: pointer"
                              class="fas fa-thumbs-up"
                              v-on:click="likeCommentForPost(parentComment.id)"
                            ></i>
                            <span style="margin-left: 10px">{{
                              parentComment.number_of_like
                            }}</span>
                          </div>
                          <!-- <div class="actionUser"> -->
                            <!--                          
                         <div> <span class="like">Thích</span>
                          <span class="reply">Trả lời</span></div> -->
                          <!-- </div> -->
                          <!-- All child comment -->
                          <div
                            v-for="childComment in parentComment.childs"
                            :key="childComment.id"
                          >
                          <!-- Child comment -->
                          <div  class="repComment d-flex">
                            <div class="iconUser">
                              <i class="fas fa-user-circle"></i>
                            </div>
                            <div style="width: 100%">
                              <div>
                                <div class="smsReply">
                                  <span class="user"
                                    >{{ childComment.account_name }}:
                                  </span>
                                  <span>{{ childComment.content }}</span>
                                </div>
                              </div>
                              <div class="timeline d-flex">
                                <span style="flex: 1">{{
                                  getTimeAgo(childComment.time)
                                }}</span>
                                <div class="actionUser">
                                      <i
                                        class="fas fa-thumbs-up"
                                        v-on:click="likeCommentForPost(childComment.id)"
                                      ></i>
                                      <span style="margin-left: 10px">{{childComment.number_of_like}}</span>
                                    </div>
                                <!-- <div class="actionUser">
                                  <span style="margin-right: 10px"
                                    >Trả lời</span
                                  >
                                  <i class="fas fa-thumbs-up"></i>
                                </div> -->
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- <div class="col-lg-6 col-12 commentAndAction__action">
                  <div class="titleComment">
                    <span>Hoạt động gần đây</span>
                  </div>
                  <div class="mainActionNear">
                    <div>
                      <div class="actionNearTitle">
                        <span>Trước đó</span>
                      </div>
                      <div
                        class="contentAction d-flex"
                        v-for="item in arrNotify"
                        :key="item"
                      >
                        <img
                          src="https://img.timviec.com.vn/2020/09/vinfast-3-2.jpg"
                        />
                        <div style="padding: 8px 0 0 8px">
                          <div>
                            <span class="titleJobs">
                              {{ item.name }}
                            </span>
                          </div>
                          <div class="timeLineJob">
                            <i
                              class="fas fa-calendar"
                              style="margin: 0 8px"
                            ></i>
                            <span>{{ item.timeLine }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> -->
              </div>
            </b-tab>
            <b-tab>
              <template v-slot:title>
                <span class="d-inline-block d-sm-none">
                  <i class="far fa-envelope"></i>
                </span>
                <span class="d-none d-sm-inline-block detailTextJovs"
                  >Lịch sử giới thiệu</span
                >
              </template>
              <div class="header">
                  <div class="form">
                    <form class="filter mt-2 position-relative" action="">
                      <!-- Filter bar-->
                      <div
                        class="
                          filter-bar
                          justify-content-between
                          form-inline
                          d-flex
                        "
                      >
                        <div class="d-flex align-items-center" style="flex: 1">
                          <span style="margin-right: 10px"
                            ><i
                              class="fas fa-filter"
                              style="font-size: 17px; margin-top: 5px"
                            ></i
                            >Lọc theo</span
                          >
                          <div class="optionSelected">
                            <multiselect
                            v-model="introduction_status"
                            label="name"
                            :options="introduction_statuses"
                            :allow-empty="false"
                            :show-labels="false"
                            style="width: 200px; z-index: 999"
                            placeholder="Chọn loại sắp xếp"
                          ></multiselect>
                          </div>
                        </div>
                        <div class="d-flex sort align-items-center">
                          <span
                            ><i class="fas fa-exchange-alt"></i>Sắp xếp
                            theo:</span
                          >

                          <multiselect
                            v-model="introduction_sort"
                            label="name"
                            :options="introduction_sorts"
                            :allow-empty="false"
                            :show-labels="false"
                            style="width: 200px; z-index: 999"
                            placeholder="Chọn loại sắp xếp"
                          ></multiselect>
                        </div>
                      </div>
                      <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
                    </form>
                  </div>
                </div>
               <div class="body body__history">
                <table class="table mt-1">
                  <thead>
                    <tr>
                        <th scope="col">Ứng viên</th>
                        <th scope="col">Ngày giới thiệu</th>
                        <th scope="col">Trạng thái</th>
                      </tr>
                  </thead>
                  <tbody
                    class=""
                    id="accordion"
                    v-for="introduction in introductions" v-bind:key="introduction.id"
                  >
                    <tr class="" style="background:white;" v-on:click="goToIntroductionDetail(introduction.id)">
                      <th>{{introduction.candidate_name}}</th>
                        <td>{{getDateString(introduction.introduction_date)}}</td>
                        <td>{{introduction.status}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>
    
    
    <!-- Job general information -->

    <!-- <b-tabs
      justified
      nav-class="nav-tabs-custom"
      content-class="p-3 text-muted"
    >
      <b-tab active>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="fas fa-home"></i>
          </span>
          <span class="d-none d-sm-inline-block" style="font-size: 15px"
            >Ứng viên</span
          >
        </template>
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="far fa-user"></i>
          </span>
          <span class="d-none d-sm-inline-block" style="font-size: 15px">
            Công việc</span
          >
        </template>
      </b-tab>
      <b-tab>
        <template v-slot:title>
          <span class="d-inline-block d-sm-none">
            <i class="far fa-envelope"></i>
          </span>
          <span class="d-none d-sm-inline-block" style="font-size: 15px"
            >Bình luận và hoạt động gần đây</span
          >
        </template>
      </b-tab>
    </b-tabs> -->
  </Layout>
</template>

<style lang='scss'>
.card {
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
    .pendingJob {
      width: 95px;
      padding: 5px 10px;
      border-radius: 10px;
      background-color: rgb(38, 190, 0);
      color: #fff;
      font-size: 12px;
      @media screen and (max-width: 1420px) {
        font-size: 10px;
        padding: 5px 5px;
      }
    }
    .workingJob {
      width: 95px;
      padding: 5px 10px;
      border-radius: 10px;
      background-color: #445fe9;
      color: #fff;
      font-size: 12px;
      @media screen and (max-width: 1420px) {
        font-size: 10px;
        padding: 5px 5px;
      }
    }
  }
}
.filterReferCandidate {
  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: transparent !important;
    margin-top: 2px !important;
    font-weight: 500 !important;
    font-family: "Roboto", sans-serif !important;
  }
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
  width: 200px;
}
.filter-search .inputSearch i {
  display: inherit;
  justify-content: center;
  font-size: 16px;
  margin-left: 10px;
}
.filter-search .inputSearch {
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
.sortModalCandidate {
  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: transparent !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
}
.multiselect__select {
  display: none !important;
}
.date::-webkit-calendar-picker-indicator,
.date::-webkit-inner-spin-button {
  border: none;
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
  margin: 10px 10px;
}
.iconUser i {
  color: #c9c4c4;

  font-size: 44px;
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
.titleInfomation .textHeader {
  align-items: center;
}

.titleInfomation .textHeader .textHeaderTitle {
  font-size: 20px;
  font-weight: 600;
  font-family: "Roboto", sans-serif;
}
.titleInfomation .textHeader .status__post {
  display: flex;
  align-items: center;

  color: white;
  border-radius: 25px;
  font-size: 12px;
  margin-left: 10px;
  font-size: 10px;

  font-weight: 400;
  font-family: "Roboto", sans-serif;
}
// .status {
//   background: none !important;
// }

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
  padding: 4px 12px;
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

.detailContent {
  border-radius: 10px;
  border: 1px solid #eae9e9;
  padding: 10px;
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
.textDetail .text-header {
  font-family: "Roboto", sans-serif;
  font-size: 20px;
  color: rgb(110, 110, 110);
  font-weight: 600;
  margin-bottom: 10px;
}
.textDetail .text p {
  font-family: "Roboto", sans-serif;
  font-size: 15px;
  line-height: 27px;
}
.handleButton {
  position: fixed;
  display: flex;
  left: 50%;
  transform: translateX(-100%);
  bottom: 15px;
  justify-content: center;
  z-index: 999;
  @media (max-width: 1024px) {
    right: 0 !important;
    left: 0 !important;
    justify-content: flex-end !important;
    transform: translateX(-5%);
  }
}
.handleButton.inBottom {
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
.textSalaryDetail {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: #ff9aa1c7;
  color: #c30022;
}
.workText {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: rgb(255, 205, 208);
  color: rgb(255, 66, 98);
}
.textLevelJob {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  color: rgb(118 0 255);
  background-color: rgb(192 142 255 / 88%);
  margin-right: 5px;

}
.roleJob {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  margin-right: 6px;
  font-family: "Roboto", sans-serif;
  background-color: rgba(251, 227, 131, 0.904);
  color: #987c00;
}
.language {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: #70ff77;
  margin-right: 6px;
  color: #00bb0a;
}
.textSkill {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: #95b7fb;
  color: #5350ff;
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
.badge {
  padding: 2.2px 8px;
  font-size: 14px;
}
.textLocation {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: #407fffad;
  color: #00379a;
}
.jobInfor {
  flex-wrap: wrap;
}
.body__history {
  overflow-x: auto;
  white-space: nowrap;
}

.modalContent {
  .filter-search {
    justify-content: space-between;

    .inputSearch {
      margin-right: 0;
      width: 80%;
    }

    .handleActionSearch {
      width: 16%;

      .btn-search {
        width: 100%;
      }
    }
  }
}

@media (max-width: 1199.98px) {
  body[data-layout="horizontal"] .page-content {
    margin-top: 0;
  }
  .company {
    padding: 1.75rem 0 0 !important;
  }

  .modalContent {
    .filter-bar {
      flex-wrap: wrap;

      .optionSelected {
        width: calc(50% - 10px);
      }
    }

    .filter-search {
      .inputSearch {
        width: 35%;
      }

      .handleActionSearch {
        width: 26%;

        .btn-search {
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 991.98px) {
  .commentAndAction {
    &__action {
      padding: 1.75rem 0;
    }
  }

  .modalContent {
    .filter-search {
      margin-top: 30px !important;
      .inputSearch,
      .handleActionSearch {
        margin-top: 0.75rem;
        width: 100%;

        .btn-search {
          width: 100%;
        }
      }
    }
  }
}

@media (max-width: 540px) {
  body[data-layout="horizontal"] .page-content {
    padding: calc(140px + 1.25rem) calc(1.25rem / 2) 60px calc(1.25rem / 2);
  }

  .modalContent {
    .filter-bar {
      flex-wrap: wrap;

      .optionSelected {
        margin-right: 0;
        width: 100%;

        .multiselect,
        input[type="date"] {
          width: 100% !important;
        }
      }
    }
  }
}
</style>
