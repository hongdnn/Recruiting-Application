<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { mapActions, mapState } from "vuex";

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
  },
  data() {
    return {
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
    };
  },
  watch: {
    post: function () {
      this.status = this.post.status;
      this.create_date = this.getDateString(this.post.date_on);
      this.end_date = this.getDateString(this.post.date_end);
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
    this.$store.state.postdetail.postDetail = {};
    this.getPostDetailById();
    this.getAllComment();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "postdetail/getPostDeatilSuccess":
          this.post = state.postdetail.postDetail.post;
        case "comment/sendCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
        case "comment/replyCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
        case "comment/getAllCommentForPostSuccess":
          this.comments = state.comment.commentData.data.comments;
      }
    });
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
    ]),

    async getPostDetailById() {
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
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" />
    <!-- Hiện tại Hiệp nó chỉ cho mỗi comment chỉ đc reply một lần -->
    <!-- Nên m chỉ cần làm ui theo flow đang có thôi -->
    <!-- Dưới mỗi một parent comment nếu có child comment thì hiện còn ko thì hiện chỗ reply -->
    <!-- Chỗ reply m làm UI nút ấn vào để ẩn hiện ra như trên recruitery nha -->
    <!-- Hiện tại do chư có ui nên nó đang hiện hết mấy chỗ reply ra á -->

    <!-- Job general information -->
    <div class="generalInformation row">
      <div class="col-auto" style="height: auto">
        <img
          class=""
          src="https://tatool.vn/statics/avatars/2020/12/KAgszDtegY.png"
          width="180px"
          height="180px"
        />
      </div>
      <div class="col">
        <div class="row pt-3">
          <div class="col-auto">
            <h2>{{ post.title }}</h2>
          </div>
          <div class="col">
            <span
              class="badge bg-success rounded-pill"
              v-if="post.status === 'active'"
              style="height: 20px"
              >Active</span
            >
            <span
              class="badge bg-warning ms-1 rounded-pill"
              v-if="post.status === 'pause'"
              style="height: 20px"
              >Pause</span
            >
            <span
              class="badge bg-danger ms-1 rounded-pill"
              v-if="post.status === 'close'"
              style="height: 20px"
              >Closed</span
            >
          </div>
        </div>
        <p>
          <span style="color: grey; font-size: 16px">tại </span>
          <span style="color: rgb(74, 80, 86); font-size: 16px"
            ><strong>{{ post.company.name }}</strong></span
          >
        </p>
        <p>
          <span><i class="mdi mdi-clock-time-eight-outline" style=""></i></span
          >&nbsp;
          <span style="fon-size: 16px">Ngày tạo: {{ create_date }}</span>
        </p>
        <p>
          <span><i class="mdi mdi-timer" style=""></i></span>&nbsp;
          <span style="fon-size: 16px">Hạn nộp hồ sơ: {{ end_date }}</span>
        </p>
      </div>
      <div class="col-auto">
        <button class="button btn-edit">
          <span class="">
            <i class="mdi mdi-pencil"></i>
          </span>
          <span class="" style="margin-left: 5px"
            ><strong>Chỉnh sửa</strong></span
          >
        </button>
      </div>
    </div>
    <!-- Send comment action -->
    <div class="pt-5">
      <b-form @submit.prevent="sendComment">
        <b-form-group class="mb-3" id="comment" label-for="text">
          <div class="row h-100">
            <div class="col-6 h-100">
              <b-form-input
                class="w-100 h-100"
                for="text"
                value=""
                placeholder="Nhập bình luận"
                v-model="send_comment_value"
              ></b-form-input>
            </div>
            <div class="col">
              <b-button type="submit" variant="primary" class="col"
                >Gửi bình luận</b-button
              >
            </div>
          </div>
        </b-form-group>
      </b-form>
      <!-- comment -->
      <div v-for="parentComment in comments" v-bind:key="parentComment.id">
        <div>
          <span>{{ parentComment.account_name }} </span>
          <span>{{ getDateString(parentComment.time) }}</span>
        </div>
        <div>{{ parentComment.content }}</div>
        <!-- Child comment -->
        <div v-if="parentComment.child">
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>{{ parentComment.child.account_name }} </span>
            <span>{{ getDateString(parentComment.child.time) }}</span>
          </div>
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ parentComment.child.content }}
          </div>
        </div>
        <div v-else>
          <b-form @submit.prevent="replyComment(parentComment.id)">
            <b-form-group class="mb-3" id="comment" label-for="text">
              <div class="row h-100">
                <div class="col-6 h-100">
                  <b-form-input
                    class="w-100 h-100"
                    for="text"
                    value=""
                    placeholder="Nhập bình luận"
                    v-model="reply_comment_value"
                  ></b-form-input>
                </div>
                <div class="col">
                  <b-button type="submit" variant="primary" class="col"
                    >Trả lời bình luận</b-button
                  >
                </div>
              </div>
            </b-form-group>
          </b-form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style>
.generalInformation {
  background-color: white;
  /* border: solid;
  border-width: 0.5px;
  border-color: rgb(209, 209, 209);
  border-radius: 2px; */
  height: 200px;
  padding: 10px;
}

.button {
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
}

.btn-edit {
  background-color: rgb(67, 126, 236);
  border-radius: 8px;
}

.tab-bar {
  background-color: clear;
}

.job-description-card {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(131, 131, 131, 0.15);
}

.company-information-card {
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 5px 10px rgba(131, 131, 131, 0.15);
}
</style>
