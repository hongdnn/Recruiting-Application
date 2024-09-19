<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { mapActions } from "vuex";
import Swal from "sweetalert2";
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
      title: "Danh sách ứng viên",
      currId: null,
      job_level: null,
      // Status
      post_statuses: ["active", "close", "pause"],
      selected_status: "",

      //Status
      statuses: [
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
      sorts: [
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
      sort: {
        id: 0,
        name: "Ngày giới thiệu",
      },

      // Search
      search_value: "",

      // Page
      page_index: 1,
      page_size: 20,

      //Response data
      introductions: [],

      // Comment
      send_comment_value: "",
      reply_comment_value: "",
      comments: [],

      post: {},

      create_date: "",
      end_date: "",
      update_date: "",
      retry: 0,
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
    introduction_status: function () {
      this.getCandidateIntroductions();
    },
    sort: function () {
      this.getCandidateIntroductions();
    },
  },
  computed: {
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
          this.selected_status = this.post.status;
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
        case "company/updateSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.getPostDetailById();
            }
          );
          break;
        case "company/updateFailure":
          Swal.fire("Cập nhật trạng thái không thành công", "", "error").then(
            () => {}
          );
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
  },
  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("postdetail", ["getPostDetail"]),
    ...mapActions("comment", [
      "getAllCommentForPost",
      "sendCommentForPost",
      "replyCommentForPost",
      "likeComment",
    ]),
    ...mapActions("introductions", ["getCandidateIntroductionInPost"]),
    ...mapActions("company", ["updatePost"]),
    ...mapActions("post", ["exportJD"]),

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
      var interviewHTML = ""
      this.post.interviews.forEach((interview, index) => {
        interviewHTML = interviewHTML + `<p>${selected_language.round} ${index + 1}: ${interview.description}</p>`
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

    getCandidateIntroductions() {
      const status = this.introduction_status.id;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
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
        path: "/refer-candidate-detail?id=" + introduction_id,
      });
    },

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    showUpdateStatus() {
      this.$refs["update-status"].show();
    },

    updateStatus() {
      Swal.fire({
        title: "Xác nhận cập nhật trạng thái",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const status = this.selected_status;
          const update_time = Math.floor(new Date().getTime() / 1000);
          const id = this.getPostId();

          const dataUser = {
            status,
            update_time,
            id,
          };

          this.updatePost(dataUser);
        }
        if (result.isDismissed) {
        }
      });
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
      this.getPostDetail(id).then(() => {
        // this.post = this.$store.state.postdetail.postDetail.post;
      });
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
        return " vài giây trước";
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
      var content = document.getElementById(parent_comment_id + "_text").value;
      document.getElementById(parent_comment_id + "_text").value = "";

      this.replyCommentForPost({
        parent_comment_id,
        content,
      });
    },

    likeCommentForPost(parent_comment_id) {
      this.likeComment(parent_comment_id);
    },

    getImageURL(path) {
      return generateApiUrl(path);
    },

    showReplyComment(id) {
      document.getElementById(id).style.opacity = 1;
      document.getElementById(id).style.height = 40 + "px";
    },

    hideReplyComment(id) {
      document.getElementById(id).style.opacity = 0;
      document.getElementById(id).style.height = 0 + "px";
    },

    updatePostPage() {
      this.$router.push({
        path: "/update-post?id=" + this.currId,
      });
    },
    handleButton(){
      window.addEventListener('scroll', function (evt) {
        var webHeight = document.body.clientHeight;
        var heightFooter = document.querySelector('.styleFooter').offsetHeight;
        if(document.querySelector('.dot') == 'undefined' || document.querySelector('.dot') == null) {
          var dot = document.createElement('span');
          dot.style.position = 'fixed';
          dot.style.bottom = heightFooter + 'px';
          dot.style.left = '0';
          dot.classList.add('dot');
          document.body.appendChild(dot);
        }else{
          var dot = document.querySelector('.dot');
          var handleButton = document.getElementById("handleButtonPost");
          var h = document.body.getBoundingClientRect();
          var offsetY = dot.getBoundingClientRect();
          var yPosition = offsetY.top - h.top + heightFooter + 30;
          // console.log(yPosition+', '+ (webHeight - heightFooter));
          if (yPosition >= (webHeight - heightFooter)) {
            handleButton.classList.add("inBottom");
          }
          else{
            handleButton.classList.remove("inBottom");
          }
        }
      })
    },
  },
};
</script>

<template>
  <Layout>
    <b-modal
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
          <form @submit.prevent="showUpdateStatus">
            <div class="formCreatedContent">
              <div class="col-12 formCreateGroup d-flex">
                <div class="col-6" style="padding-right: 10px">
                  <label for=""
                    >Trạng thái ứng viên <span class="labelStar">*</span></label
                  >
                  <div class="">
                    <multiselect
                      v-model="selected_status"
                      :options="post_statuses"
                      :show-labels="false"
                      :allow-empty="false"
                    ></multiselect>
                  </div>
                </div>
              </div>
              <div
                class="
                  handleActionBooking__post-detail
                  d-flex
                  justify-content-end
                "
              >
                <button
                  type="button"
                  v-on:click="cancelUpdateStatus"
                  class="btn btn-secondary"
                  style="margin-right: 0.75rem"
                >
                  <i class="fas fa-times"></i>Hủy
                </button>
                <button type="submit" class="btn btn-success">Cập nhật</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </b-modal>
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
        <a href="./manage-post">
          <button class="handleBack">
            <i class="fas fa-chevron-left"></i>
          </button>
        </a>
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
      <div class="header__post-detail__handle d-flex flex-wrap">
        <div
          class="handleUpdateStatusJob handleUpdateStatusJob__input"
          style="width: 150px; margin-right: 10px"
        >
          <multiselect
            v-model="selected_status"
            :options="post_statuses"
            :show-labels="false"
            :allow-empty="false"
          ></multiselect>
        </div>
        <div class="handleUpdateStatusJob" style="margin-right: 10px">
          <button v-on:click="updateStatus()">
            <span style="margin-top: 2px; margin-right: 2px"
              >Cập nhật trạng thái</span
            >
          </button>
        </div>
        <div class="handleCreatedJob">
          <button v-on:click="updatePostPage()">
            <i class="fas fa-edit"></i
            ><span style="margin-top: 2px; margin-right: 2px">Chỉnh sửa</span>
          </button>
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
              <div class="jobInfor d-flex flex-wrap job-infor" style="padding: 0">
                <div class="col-xl-6 col-12 job-infor__detail">
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
                              margin-right: 1.25rem;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
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
                              margin-right: .5rem;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
                            "
                            >Ngày tạo: </span
                          ><span 
                              style="font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ create_date }}</span>
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
                              margin-right: .5rem;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
                            "
                            >Hạn nộp hồ sơ: </span
                          ><span 
                              style="font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ end_date }}</span>
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
                              margin-right: .5rem;
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                            "
                            >Ngành nghề:
                            <span class="workText">
                              <i style="font-size: 10px; margin-right: 2px"></i
                              >{{ post.industry.name }}</span
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
                            v-if="post.salary_from > 0 || post.salary_to > 0"
                            class="fontTitle"
                            style="
                              font-size: 17px;
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              font-weight: 600;
                              color: rgba(0, 0, 0, 0.87);
                            "
                            >Lương:
                            <span class="textSalaryDetail"> Thương lượng</span>
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
                              margin-right: .5rem;
                              color: rgba(0, 0, 0, 0.87);
                              font-weight: 600;
                            "
                            >Số lượng tuyển: </span
                          ><span style="
                              font-size: 17px;
                              color: rgba(0, 0, 0, 0.87);
                            ">{{ post.require_number }}</span>
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
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              margin-right: 1.25rem;
                              font-weight: 600;
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
                              Vòng {{ idx + 1 }}: {{ item.description }} <br
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
                <div class="col-xl-6 col-12 job-infor__company">
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
                      <div class="contentAbout" style="white-space: pre-line">
                        <h3>Giới thiệu về công ty</h3>
                        <h6>
                          {{ post.company.introduction }}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="handleButton" id="handleButtonPost">
                <div class="handleButton__box">
                  <button class="btnDown" v-on:click="downloadJD">
                    <i class="fas fa-cloud-download-alt"></i
                    ><span>Tải JD</span>
                  </button>
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
                  >Bình luận</span
                >
              </template>
              <div class="col-12 mt-4 d-flex flex-wrap">
                <div class="col-md-6 col-12">
                  <div class="titleComment">
                    <span>Bình luận</span>
                  </div>
                  <div class="d-flex flex-wrap col-12">
                    <div class="col-md-6 mainComment" style="">
                      <div class="commnentContent">
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
                        <!-- All comment -->
                        <div
                          class="userComment mt-4"
                          v-for="parentComment in comments"
                          :key="parentComment.id"
                        >
                          <!-- Parent comment -->
                          <div class="d-flex">
                            <div class="iconUser">
                              <i class="fas fa-user-circle"></i>
                            </div>
                            <div>
                              <div class="commnentContentInput">
                                <div class="input">
                                  <span class="user"
                                    >{{ parentComment.account_name }}: </span
                                  ><span>{{ parentComment.content }}</span>
                                </div>
                              </div>
                              <div class="timeLine d-flex">
                                <span>{{
                                  getTimeAgo(parentComment.time)
                                }}</span>
                                <span
                                  style="
                                    margin-right: 10px;
                                    margin-left: 10px;
                                    cursor: pointer;
                                    font-weight: bold;
                                  "
                                  v-on:click="
                                    showReplyComment(parentComment.id)
                                  "
                                  >Trả lời</span
                                >
                                <i
                                  style="cursor: pointer"
                                  class="fas fa-thumbs-up"
                                  v-on:click="
                                    likeCommentForPost(parentComment.id)
                                  "
                                ></i>
                                <span style="margin-left: 10px">{{
                                  parentComment.number_of_like
                                }}</span>
                              </div>
                              <div class="actionUser">
                                <!--                          
                          <div> <span class="like">Thích</span>
                            <span class="reply">Trả lời</span></div> -->
                              </div>
                              <!-- All child comment -->
                              <div
                                v-for="childComment in parentComment.childs"
                                :key="childComment.id"
                              >
                                <!-- Child comment -->
                                <div class="repComment d-flex">
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
                                      <span>{{
                                        getTimeAgo(childComment.time)
                                      }}</span>
                                      <div class="actionUser">
                                        <i
                                          class="fas fa-thumbs-up"
                                          v-on:click="
                                            likeCommentForPost(childComment.id)
                                          "
                                        ></i>
                                        <span style="margin-left: 10px">{{
                                          childComment.number_of_like
                                        }}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div :id="parentComment.id" class="replyCommentUser">
                            <span>Trả lời bình luận</span>
                            <span
                              class="ml-2"
                              style="
                                font-weight: 500;
                                color: grey;
                                cursor: pointer;
                              "
                              v-on:click="hideReplyComment(parentComment.id)"
                            >
                              Xóa</span
                            >
                            <div class="inputCommentReply">
                              <input
                                :id="parentComment.id + '_text'"
                                type="text"
                              />
                              <i
                                class="fas fa-paper-plane"
                                v-on:click="replyComment(parentComment.id)"
                              ></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </b-tab>
            <b-tab>
              <template v-slot:title>
                <span class="d-inline-block d-sm-none">
                  <i class="far fa-envelope"></i>
                </span>
                <span class="d-none d-sm-inline-block detailTextJovs"
                  >Ứng viên</span
                >
              </template>
              <div class="list-candidates">
                <div class="header">
                  <div class="form">
                    <form class="filter mt-2 position-relative" action="">
                      <!-- Filter bar-->
                      <div
                        class="
                          filter-bar__post-detail
                          justify-content-between
                          form-inline
                          d-flex
                          flex-wrap
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
                              :options="statuses"
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
                            v-model="sort"
                            label="name"
                            :options="sorts"
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
                <div class="body table-scroll">
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
                      v-for="introduction in introductions"
                      v-bind:key="introduction.id"
                    >
                      <tr
                        class=""
                        v-on:click="goToIntroductionDetail(introduction.id)"
                      >
                        <th>{{ introduction.candidate_name }}</th>
                        <td>
                          {{ getDateString(introduction.introduction_date) }}
                        </td>
                        <td>{{ introduction.status }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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

<style lang='scss' scoped>
.optionSelected {
  margin-right: 10px;
  display: flex;
  position: relative !important;
}
.optionSelected i {
  position: absolute;
  right: 0;
  bottom: 15px;
  z-index: 999;
  color: #666565;
}
.multiselect__tags {
  border: none !important;
  border-radius: 0;

  border-bottom: 1.5px solid #b1b1b1 !important;
  background-color: #3030 !important;
  margin-top: 2px !important;
  font-family: "Roboto", sans-serif !important;
  font-weight: 500 !important;
}

.handleBtn {
  display: flex;
  justify-content: flex-end;
}

.btnImportExcel {
  color: #000 !important;
  height: 37px;
  padding: 3px 8px;
  border: none;
  outline: none;
  border-radius: 3px;
  background: #fdb327;
  -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  transition: all 0.2s ease-in-out;
}
.btnCreateCandidate:hover {
  background: #fdad19;
}
body {
  font-family: Roboto, sans-serif !important;
  background-color: #f3f2ef;
  min-width: 1140px;
}

.btn:focus {
  box-shadow: none;
}
.handleActionSearch {
  margin-left: 15px;
}
.handleActionSearch .btn-search:hover {
  background-color: #415ef1;
  color: white;
}
.btn-search {
  width: 200px !important;
  background-color: #5b73e8;
  color: white;
  transition: all 0.2s ease-in;
}
.mat-status-post {
  display: flex;
  align-items: center;
  margin-left: 5px;
  .mat-urgency {
    margin-left: 5px;
    border: 1px solid #e60000 !important;
    background: #ffe5e5;
    color: #e60000;
  }
  @media screen and (max-width: 767px) {
    span {
      font: size 10px;
    }
  }
}
.view,
.status {
  color: #fff;
  background-color: #5b73e8;
}

i[class^="fa"] {
  margin-right: 5px;
}

.fas.fa-exchange-alt {
  transform: rotate(90deg);
}

.arounded {
  border-radius: 50%;
}

.title h2 {
  font-weight: 700;
  font-size: 20px;
}

.filter-bar__post-detail .form-control,
.list-candidates .sort .form-control {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #315fb5;
}

.filter .filter-bar__post-detail {
  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.filter .filter-bar__post-detail input {
  font-size: 14px;
  padding-right: 0;
  padding-left: 0;
  width: 200px;
}

.del-filter {
  font-size: 11px;
  border: 0;
  border-radius: 20px;
  padding: 2px 10px;
  top: -10px;
  padding-left: 3px;
  left: 15px;
  box-shadow: 1px 1px 5px rgb(0 0 0 / 74%);
}

.del-filter:focus {
  outline: 0;
}

.del-filter span {
  padding: 1px 4px;
}

.filter-search input {
  border: none;
  padding: 0 0 !important;
}
.filter-search .inputSearch i {
  display: inherit;
  justify-content: center;
  padding: 0 5px;
  margin-left: 10px;
}
.filter-search .inputSearch {
  width: 100%;
  padding: 10px 0;
  display: flex;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1px solid #eae9e9;
  border-radius: 5px;
}
.filter-search button {
  padding: 13px;
  width: 290px;
}

.filter-search i[class^="fa"] {
  top: 20px;
  left: 10px;
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

.view {
  padding: 2px 10px;
  font-weight: normal;
  font-size: 13px;
  border-radius: 15px;
}

.view:hover {
  cursor: pointer;
}

.hiddenRow {
  padding: 0 !important;
  position: static;
}

// .collapse,
// .collapsing,
// .collapse.show {
//   background-color: #fff;
// }

.tool {
  top: 0;
  left: 100%;
  box-shadow: 0 0 5px rgb(0 0 0 / 75%);
  border-radius: 5px;
  width: 0px;
  visibility: hidden;
  opacity: 0;
  transition: all 0.5s;
}

.tool i[class^="fa"] {
  margin-right: 15px;
}

.tool.open {
  width: 250px;
  visibility: visible;
  opacity: 1;
}

.tool ul {
  border-radius: 5px;
}

.status {
  border-radius: 15px;
}

.name h2 {
  font-size: 24px;
}

.info div {
  margin-bottom: 5px;
}

.contact i[class^="fa"] {
  font-size: 25px;
  padding-top: 10px;
}

.contact .content p {
  margin-bottom: 0.5rem;
}

.contact > div {
  margin-bottom: 15px;
}

.contact .content span {
  font-size: 20px;
  font-weight: 700;
}

.question input {
  width: 100%;
  padding: 25px;
}

/* UPLOAD */

a {
  color: #000;
}

a:hover {
  text-decoration: none;
  color: #000;
}

.title h2 span::after {
  content: "<";
  padding: 7px 13px;
  border-radius: 50%;
  background: #fff;
  margin-right: 10px;
}

.upload-main {
  background-color: #fff;
  border: 3px dashed #494949;
  border-radius: 10px;
}

.upload-main .upload-container {
  padding: 25px 10px;
  color: #717386;
}

.upload-main .upload-container:hover {
  cursor: pointer;
}

.upload-main .upload-container p i {
  font-size: 40px;
}

.upload-main .upload-container p {
  margin-bottom: 0;
}

.upload-main .upload-container .btn-upload {
  border-radius: 7px;
  margin-top: 10px;
}
.replyCommentUser {
  margin-left: 12%;
  opacity: 0;
  height: 0px;
  transition: all 0.2s ease-in-out;
}
.inputCommentReply {
  border: 2px solid #eae9e9;
  width: 80%;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  transition: all 0.2s ease-in-out;
}

.inputCommentReply:hover {
  border: 2px solid #5b73e8;
}
.replyCommentUser .inputCommentReply input {
  border: none;
  outline: none;
  flex: 1;
}
.replyCommentUser .inputCommentReply i {
  margin-right: 10px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease-in-out;
  color: #5b73e8;
}
.replyCommentUser .inputCommentReply i:hover {
  color: #3350e2;
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
  padding: 10px 20px 25px 10px;
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

.handleCreatedJob button {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #445fe9;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  border: 1px solid #445fe9;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
}
.handleCreatedJob button:hover {
  background-color: #2242e2;
}
.handleCreatedJob button i {
  margin-right: 7px;
}
.handleUpdateStatusJob button {
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #00ad57;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  border: 1px solid #00ad57;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
}
.handleUpdateStatusJob button:hover {
  background-color: #00ad57;
}
.handleUpdateStatusJob button i {
  margin-right: 7px;
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
.jobInfor {
  margin-top: 30px;
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
.updateJob {
  display: flex;
  justify-content: flex-end;
}
.updateJob i {
  cursor: pointer;
}
.textDetail .text p {
  font-family: "Roboto", sans-serif;
  font-size: 15px;
  line-height: 27px;
}
.handleButton {
  position: fixed;
  bottom: 15px;
  z-index: 999;
  width: calc(41.433333% - 10px);

  @media (max-width: 1366px) {
    width: calc(48.333333% - 15px);
  }
  @media (max-width: 1200px) {
    width: 100%;
  }
  .handleButton__box {
    text-align: right;

    @media (max-width: 1200px) {
      text-align: center;
  }
  }
}
.handleButton button {
  cursor: pointer;
  margin-left: 10px;
  margin-top: 10px;
  padding: 4px 10px;
  outline: none;
  border: none;
  border-radius: 3px;
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
  background: #34c38f;
  transition: all 0.2s linear;
}
.btnRefer i {
  margin-right: 5px;
}
.btnRefer:hover {
  background: #22be85;
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
// .status {
//   background: none !important;
// }

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
  background-color: #78d6ff;
  color: #0052a7;
}
.workText {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background-color: #ff9aa1c7;
  color: #c30022;
}
.textLevelJob {
  font-size: 14px;
  padding: 3px 8px !important;
  border-radius: 15px;
  font-weight: 500;
  font-family: "Roboto", sans-serif;
  margin-right: 6px;
  background-color: rgb(192 142 255 / 88%);
  color: rgb(118 0 255);
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

.table-modal-scroll,
.table-scroll {
  $min-width-desktop: 1366px;
  @media screen and (max-width: $min-width-desktop) {
    overflow: auto;

    table {
      white-space: nowrap;
    }
  }
}
.handleButton.inBottom {
    position: unset;
    width: 58.333333%;
    transform: unset;
    justify-content: flex-end;
  
  .handleButton__box {
    text-align: left;
  }

  @media(max-width: 1024px){
    text-align: left !important;
    transform: unset;
  }
}
</style>
