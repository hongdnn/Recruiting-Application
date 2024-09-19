<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import Swal from "sweetalert2";
import Multiselect from "vue-multiselect";
import { required } from "vuelidate/lib/validators";
import { mapActions } from "vuex";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import { sperateMoney } from "../../../helpers/common/Ultilities";
import FileSaver from "file-saver";
import jwt_decode from "jwt-decode";

export default {
  page: {
    title: "Thông tin giới thiệu",
  },
  components: {
    Layout,
    PageHeader,
    Multiselect,
    ckeditor: CKEditor.component,
  },
  data() {
    return {
      // Validate onboard date
      isValidateOnboard: false,
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],

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

      // Review placement before create
      review_placement: {},

      // Validate submit check
      submitted: false,

      // Supervisor list
      supervisors: [],

      // Test min time
      min_test_time: "",

      //Invite test form
      test_id: null,

      formInvite: {
        start_date_time: null,
        end_date_time: null,
      },

      // Interview data form
      interview_id: null,

      sample_email_content: `<html style="font-size: 1em;font-family: Roboto;padding-left:20px">
<h2 style="color:#f4841c;text-align: center;">Thư mời phỏng vấn</h2>
<img src="https://tatool.vn/web/images/logo/logomau.png" width="50%" style="display: block;
  margin-left: auto;
  margin-right: auto;"/>
<p>Xin chào <span style="color:#1898be;font-weight: bold;">candidate_name</span>,</p>
<p>tatool.vn xin mời bạn tham dự buổi phỏng vấn của công ty company_name</p>
<h2 style="color:#f4841c;">Thông tin buổi phỏng vấn</h2>
<p><span style="color:#1898be;font-weight: bold;">Thời gian bắt đầu: </span>start_date</p>
<p><span style="color:#1898be;font-weight: bold;">Thời gian kết thúc: </span>end_date</p>
<p><span style="color:#1898be;font-weight: bold;">Địa điểm: </span>interview_location</p>
<p><span style="color:#1898be;font-weight: bold;">Thông tin tham gia: </span>note</p>
<p><span style="color:#1898be;font-weight: bold;">Người tham gia: </span> 
<ul style="padding-bottom: 30px">
candidates
</ul>
</p>
<hr align="left" width="30%">
<p style="font-style: italic;"><span style="font-weight: bold;">Nếu có bất kì thắc mắc, bạn vui lòng liên hệ qua:</span><br/>
Email: <a href="support@tatool.vn">support@tatool.vn</a><br/>
Hotline: 028.668.19.668<br/>
Fanpage: <a href="https://tatool.vn/vi">tatool.vn</a></p>
</html>`,

      formBook_address: null,
      formBook_date: null,
      formBook_start_time: null,
      formBook_end_time: null,
      formBook_interviewer: null,
      formBook_content: null,
      formBook_noteCTV: null,
      formBook_google_meet: true,
      editor: ClassicEditor,
      editorData:
        "<h3>Hello World!</h3><h5><b>This is an simple editable area.</b></h5>",
      //CKeditor config

      // Response data
      introduction_detail: {},
      test_reports: [],
    };
  },
  validations: {
    formBook_date: {
      required,
    },
    formBook_start_time: {
      required,
    },
    formBook_end_time: {
      required,
    },
    formBook_interviewer: {
      required,
    },
  },
  mounted() {
    this.getCandidateIntroductionDetail();
    this.getListSupervisor();
    this.decodeToken();
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

          // Get test report data
          this.test_reports = this.introduction_detail.post.question_packages;
          this.getTestReportData();

          this.createEmailContent();
          break;
        case "interview/getSupervisorSuccess":
          this.supervisors = state.interview.supervisorsData.employers;
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
        case "placement/createPlacementSuccess":
          Swal.fire("Tạo thanh toán thành công", "", "success").then(() => {
            this.getCandidateIntroductionDetail();
            this.$bvModal.hide("create-placement");
          });
          break;
        case "placement/createPlacementFailure":
          Swal.fire("Tạo thanh toán không thành công", "", "error").then(
            () => {}
          );
          break;
        case "interview/createScheduleSuccess":
          this.getCandidateIntroductionDetail();

          const interview_id = this.interview_id;

          this.interview_id = null;
          this.formBook_address = null;
          this.formBook_date = null;
          this.formBook_start_time = null;
          this.formBook_end_time = null;
          this.formBook_interviewer = null;
          this.formBook_content = null;
          this.formBook_noteCTV = null;
          this.formBook_content = null;
          this.google_meet = true;
          this.submitted = false;
          this.createEmailContent();

          Swal.fire("Đặt lịch hẹn thành công", "", "success").then(() => {
            const id = this.getCreateSchedulePopupId(interview_id);
            this.$bvModal.hide(id);
          });
          break;
        case "interview/createScheduleFailure":
          switch (state.interview.scheduleData) {
            case "overlap time with another interview schedule":
              Swal.fire(
                "Đặt lịch hẹn không thành công",
                "Thời gian phỏng vấn bị trùng với một lịch phỏng vấn khác",
                "error"
              ).then(() => {});
              break;
            case "overlap time of supervisor's another interview schedule":
              Swal.fire(
                "Đặt lịch hẹn không thành công",
                "Người tham gia phỏng vấn bận",
                "error"
              ).then(() => {});
              break;
            default:
              Swal.fire("Đặt lịch hẹn không thành công", "", "error").then(
                () => {}
              );
              break;
          }

          break;
        case "introductions/inviteTestSuccess":
          this.getTestReportData();

          const test_id = this.test_id;
          this.test_id = null;
          this.formInvite.start_date_time = null;
          this.formInvite.end_date_time = null;

          Swal.fire("Mời làm bài kiểm tra thành công", "", "success").then(
            () => {
              const id = this.getInviteTestPopupId(test_id);
              this.$bvModal.hide(id);
              this.getCandidateIntroductionDetail();
            }
          );
          break;
        case "introductions/inviteTestFailure":
          Swal.fire("Mời làm bài kiểm tra không thành công", "", "error").then(
            () => {}
          );
          break;
        case "introductions/getTestReportSuccess":
          this.test_reports = state.introductions.testReportData.data;
          break;
        case "introductions/downloadCVSuccess":
          const data = state.introductions.downloadCVData;
          const cv_type = this.getFileExtension(this.introduction_detail.cv)[0];

          switch (cv_type) {
            case "pdf":
              FileSaver.saveAs(
                new Blob([data]),
                `${this.introduction_detail.name}.pdf`
              );
              break;
            case "docx":
              FileSaver.saveAs(
                new Blob([data]),
                `${this.introduction_detail.name}.docx`
              );
              break;
          }
          break;
      }
    });
  },
  watch: {
    selected_introduction_status: function () {
      this.update_status_data.onboardDate = null;
      this.update_status_data.workEndDate = null;

      if (this.introduction_detail.onboard_date !== null) {
        var date = new Date(this.introduction_detail.onboard_date);
        var dateString = "0" + date.getDate();
        var monthString = "0" + (date.getMonth() + 1);
        var yearString = date.getFullYear();

        this.update_status_data.onboardDate =
          yearString +
          "-" +
          monthString.substr(-2) +
          "-" +
          dateString.substr(-2);
      }

      this.update_status_data.status = this.selected_introduction_status.id;
    },

    formBook_date: function () {
      this.createEmailContent();
    },
    formBook_start_time: function () {
      this.createEmailContent();
    },
    formBook_end_time: function () {
      this.createEmailContent();
    },
    formBook_address: function () {
      this.createEmailContent();
    },
    formBook_noteCTV: function () {
      this.createEmailContent();
    },
    formBook_interviewer: function () {
      this.createEmailContent();
    },
  },
  methods: {
    ...mapActions("introductions", [
      "getIntroductionDetail",
      "updateIntroductionStatus",
      "getListCandidateToWarranty",
      "getReviewPlacement",
      "createWarranty",
      "getTestReport",
      "inviteTest",
      "downloadCV",
    ]),
    ...mapActions("interview", ["getSupervisor", "createSchedule"]),
    ...mapActions("placement", ["createPlacement"]),

    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },

    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
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

    //Seperate money
    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    // Create email content
    createEmailContent() {
      this.formBook_content = this.sample_email_content;

      this.formBook_content = this.formBook_content.replace(
        "candidate_name",
        this.introduction_detail.name
      );
      this.formBook_content = this.formBook_content.replace(
        "company_name",
        this.introduction_detail.company.company
      );

      if (
        this.formBook_date !== null &&
        this.formBook_start_time !== null &&
        this.formBook_end_time !== null
      ) {
        const date = new Date(this.formBook_date);
        const date_string = this.getDateString(date);
        const start_time = this.formBook_start_time;
        const end_time = this.formBook_end_time;

        const interview_start_date_string =
          date_string + " " + start_time + ":00";
        const interview_end_date_string = date_string + " " + end_time + ":00";

        this.formBook_content = this.formBook_content.replace(
          "start_date",
          interview_start_date_string
        );
        this.formBook_content = this.formBook_content.replace(
          "end_date",
          interview_end_date_string
        );
      } else {
        this.formBook_content = this.formBook_content.replace("start_date", "");
        this.formBook_content = this.formBook_content.replace("end_date", "");
      }

      if (this.formBook_address !== null && this.formBook_address !== "") {
        this.formBook_content = this.formBook_content.replace(
          "interview_location",
          this.formBook_address
        );
      } else {
        this.formBook_content = this.formBook_content.replace(
          '<p><span style="color:#1898be;font-weight: bold;">Địa điểm: </span>interview_location</p>',
          ""
        );
      }
      if (this.formBook_noteCTV !== null && this.formBook_noteCTV !== "") {
        this.formBook_content = this.formBook_content.replace(
          "note",
          this.formBook_noteCTV
        );
      } else {
        this.formBook_content = this.formBook_content.replace(
          '<p><span style="color:#1898be;font-weight: bold;">Thông tin tham gia: </span>note</p>',
          ""
        );
      }
      if (this.formBook_interviewer !== null) {
        this.formBook_content = this.formBook_content.replace(
          "candidates",
          "<li>" +
            this.introduction_detail.email +
            "</li><li>" +
            this.formBook_interviewer.email +
            "</li>"
        );
      } else {
        this.formBook_content = this.formBook_content.replace(
          "candidates",
          "<li>" + this.introduction_detail.email + "</li>"
        );
      }
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

    //Get candidate introduction detail:
    getCandidateIntroductionDetail() {
      const introduction_id = this.getCandidateIntroductionId();

      this.getIntroductionDetail(introduction_id);
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

    // Invite test
    sendInviteTest(question_package) {
      Swal.fire({
        title: "Xác nhận mời ứng viên làm bài test",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          this.test_id = question_package._id;
          const candidate_introduction_id = this.getCandidateIntroductionId();
          const email = this.introduction_detail.email;
          const question_packages = [question_package];

          const start_date_time = new Date(this.formInvite.start_date_time);
          const end_date_time = new Date(this.formInvite.end_date_time);
          const invited_at = Math.floor(start_date_time.getTime() / 1000);
          const expired = Math.floor(end_date_time.getTime() / 1000);

          const data = {
            candidate_introduction_id,
            email,
            question_packages,
            invited_at,
            expired,
          };

          this.inviteTest(data);
        }
        if (result.isDismissed) {
        }
      });
    },

    //Get min test time
    getMinTestTime() {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      this.min_test_time = now.toISOString().slice(0, 16);
    },

    //Get invite test popup id
    getInviteTestPopupId(package_id) {
      // this.getMinTestTime()
      return "popup-" + package_id;
    },

    //Hide schedule interview popup view
    hideInviteTestPopup(id) {
      this.$bvModal.hide(id);
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

    //Show update schedule popup view
    showUpdateStatus() {
      if (
        !(
          this.checkPermisstion("candidate.all") ||
          this.checkPermisstion("candidate.update_status")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.selected_introduction_status = {
        id: this.current_status.id,
        name: this.current_status.name,
      };

      this.$refs["update-status"].show();
    },

    //Show create placement to
    showCreatePlacement() {
      if (
        !(
          this.checkPermisstion("candidate.all") ||
          this.checkPermisstion("candidate.create_placement")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.review_placement = {};
      const introduction_id = this.getCandidateIntroductionId();
      this.getReviewPlacement(introduction_id);

      this.$refs["create-placement"].show();
    },

    //Update status
    updateStatus() {
      if (
        this.selected_introduction_status.id === "15" ||
        this.selected_introduction_status.id === "16" ||
        this.selected_introduction_status.id === "17"
      ) {
        if (this.update_status_data.onboardDate === null) {
          this.isValidateOnboard = true;
          return;
        } else {
          this.isValidateOnboard = false;
        }
      }

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
          const candidateIntroductionId = this.getCandidateIntroductionId();
          const status = this.update_status_data.status;
          var onboardDate = null;
          var workEndDate = null;
          const note = this.update_status_data.note;

          if (this.update_status_data.onboardDate !== null) {
            const date = new Date(this.update_status_data.onboardDate);
            onboardDate = date.getTime() + "";
          }

          if (this.update_status_data.workEndDate) {
            const date = new Date(this.update_status_data.workEndDate);
            workEndDate = date.getTime() + "";
            onboardDate = this.introduction_detail.onboard_date + "";
          }

          const data = {
            candidateIntroductionId,
            status,
            onboardDate,
            workEndDate,
            note,
          };

          this.updateIntroductionStatus(data);
        }
        if (result.isDismissed) {
        }
      });
    },

    // Cancel update status
    cancelUpdateStatus() {
      this.update_status_data = {
        note: null,
        status: null,
        onboardDate: null,
        workEndDate: null,
      };
      this.isValidateOnboard = false;
      this.$bvModal.hide("update-status");
    },

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
    createPlacementForIntroduction() {
      Swal.fire({
        title: "Xác nhận tạo thanh toán",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const introductionId = this.getCandidateIntroductionId();
          const reward_amount = this.review_placement.rewardAmount;
          const bonus = this.review_placement.bonus;
          const placement_date = this.review_placement.placementDate;
          const currency = this.review_placement.currency;
          var payment_status = this.review_placement.status;

          const data = {
            candidate_introduction_id: introductionId,
            reward_amount: reward_amount,
            placement_date: placement_date,
            currency: currency,
            bonus: bonus,
            payment_status: payment_status,
          };

          this.createPlacement(data);
        }
        if (result.isDismissed) {
        }
      });
    },

    // Cancel create placement
    cancelCreatePlacement() {
      this.review_placement = {};
      this.$bvModal.hide("create-placement");
    },

    // Create warranty
    createWarrantyForIntroduction(newIntroductionId) {
      Swal.fire({
        title: "Xác nhận chọn ứng viên để bảo hành",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const alternative_candidate_introuduction_id = newIntroductionId;
          const guaranteed_candidate_introuduction_id =
            this.getCandidateIntroductionId();

          const data = {
            alternative_candidate_introuduction_id,
            guaranteed_candidate_introuduction_id,
          };

          this.createWarranty(data);
        }
        if (result.isDismissed) {
        }
      });
    },

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

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    //Open CV in new tab
    openCV() {
      if (this.introduction_detail.cv) {
        const cv_type = this.getFileExtension(this.introduction_detail.cv)[0];
        switch (cv_type) {
          case "pdf":
            window.open(generateApiUrl(this.introduction_detail.cv), "_blank");
            break;
          case "docx":
            window.open(
              "https://view.officeapps.live.com/op/view.aspx?src=" +
                generateApiUrl(this.introduction_detail.cv) +
                "&embedded=true",
              "_blank"
            );
            break;
        }
      }
    },

    //Download cv
    downloadCVFile() {
      const id = this.introduction_detail._id;

      this.downloadCV(id);
    },

    //Hide schedule interview popup view
    hideCreateSchedule(id) {
      this.$bvModal.hide(id);
      this.interview_id = null;
      this.formBook_address = null;
      this.formBook_date = null;
      this.formBook_start_time = null;
      this.formBook_end_time = null;
      this.formBook_interviewer = null;
      this.formBook_content = null;
      this.formBook_noteCTV = null;
      this.formBook_content = null;
      this.google_meet = true;
      this.submitted = false;
      this.createEmailContent();
    },

    //Create schedule interview
    formSubmitBooking(interview_id, type) {
      Swal.fire({
        title: "Xác nhận đặt lịch phỏng vấn",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          this.interview_id = interview_id;

          if (type !== "face to face") {
            this.formBook_interviewer = "not null";
          }

          this.submitted = true;
          this.$v.$touch();

          const candidate_introduction_id = this.getCandidateIntroductionId();
          const location = this.formBook_address;

          const date = this.formBook_date;
          const start_time = this.formBook_start_time;
          const end_time = this.formBook_end_time;

          const interview_start_date_string = date + " " + start_time + ":00";
          const interview_end_date_string = date + " " + end_time + ":00";

          const start_date = new Date(interview_start_date_string);
          const end_date = new Date(interview_end_date_string);

          const interview_start_date = start_date.getTime();
          const interview_end_date = end_date.getTime();

          const note = this.formBook_noteCTV;

          const data = {
            interview_id,
            candidate_introduction_id,
            interview_start_date,
            interview_end_date,
          };

          if (this.formBook_content !== null) {
            data.email_content = this.formBook_content;
          }

          if (type === "face to face") {
            const supervisor_id = this.formBook_interviewer.id;
            data.supervisor_id = supervisor_id;
          }

          if (location != null) {
            data.location = location;
          }

          if (note !== null) {
            data.note = note;
          }

          if (type === "online") {
            data.google_meet = this.formBook_google_meet;
          }

          this.createSchedule(data);
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
    <PageHeader />
    <iframe id="my_iframe" style="display: none"></iframe>
    <b-modal
      @hide="cancelUpdateStatus"
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
              <div class="col-12 formCreateGroup d-flex flex-wrap justify-content-between formCreateGroup__modal">
                <div class="col-sm-6 col-12 formCreateGroup__status">
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
                  class="col-sm-6 col-12 formCreateGroup__date"
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
                      id="onboardDateTag"
                      type="date"
                      class="form-control"
                      v-model="update_status_data.onboardDate"
                    />
                    <div style="color: red" v-if="isValidateOnboard">
                      <span>Ngày onboard không được để trống</span>
                    </div>
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
                      :min="update_status_data.onboardDate"
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
      id="create-placement"
      centered
      size="lg"
      title="Tạo thanh toán"
      title-class="font-18"
      ref="create-placement"
      hide-footer
      class="text-center"
    >
      <div class="bodyCreate">
        <div class="formCreated">
          <div class="row mt-2">
            <div class="col-4">Tên cộng tác viên:</div>
            <div class="col-6">{{ review_placement.collaboratorName }}</div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Email:</div>
            <div class="col-6">{{ review_placement.collboratoroEmail }}</div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Số điện thoại:</div>
            <div class="col-6">{{ review_placement.collaboratorPhone }}</div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Tài khoản ngân hàng:</div>
            <div class="col-6">
              {{ review_placement.collaboratorBankAccountNumber }}
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Tên ứng viên:</div>
            <div class="col-6">{{ review_placement.candidateName }}</div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Tên công việc:</div>
            <div class="col-6">{{ review_placement.postTitle }}</div>
          </div>
          <div class="row mt-2">
            <div class="col-4">Số tiền cần thanh toán:</div>
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
                  <td>Tiền tuyển dụng khi ứng viên được nhận làm việc</td>
                  <td>
                    {{ getDateString(review_placement.placementDate[0]) }}
                  </td>
                  <td>
                    {{ sperateMoneyString(review_placement.rewardAmount[0]) }}
                  </td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr v-if="review_placement.bonus !== null">
                  <th>2</th>
                  <td>Tiền thưởng tuyển gấp</td>
                  <td>{{ sperateMoneyString(review_placement.bonus) }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th></th>
                  <td><strong>Tổng tiền: </strong></td>
                  <td></td>
                  <td v-if="review_placement.bonus !== null">
                    <strong>{{
                      sperateMoneyString(
                        review_placement.rewardAmount[0] +
                          review_placement.bonus
                      )
                    }}</strong>
                  </td>
                  <td v-else>
                    <strong>{{
                      sperateMoneyString(review_placement.rewardAmount[0])
                    }}</strong>
                  </td>
                  <td>
                    <strong>{{ review_placement.currency }}</strong>
                  </td>
                </tr>
              </tbody>
              <tbody v-if="review_placement.rewardAmount.length === 2">
                <tr>
                  <th>1</th>
                  <td>Tiền tuyển dụng khi ứng viên được nhận làm việc</td>
                  <td>
                    {{ getDateString(review_placement.placementDate[0]) }}
                  </td>
                  <td>
                    {{ sperateMoneyString(review_placement.rewardAmount[0]) }}
                  </td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th>2</th>
                  <td>Tiền tuyển dụng khi ứng viên hoàn thành bảo hành</td>
                  <td>
                    {{ getDateString(review_placement.placementDate[1]) }}
                  </td>
                  <td>
                    {{ sperateMoneyString(review_placement.rewardAmount[1]) }}
                  </td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr v-if="review_placement.bonus !== null">
                  <th>3</th>
                  <td>Tiền thưởng tuyển gấp</td>
                  <td>{{ sperateMoneyString(review_placement.bonus) }}</td>
                  <td>{{ review_placement.currency }}</td>
                </tr>
                <tr>
                  <th></th>
                  <td><strong>Tổng tiền: </strong></td>
                  <td></td>
                  <td v-if="review_placement.bonus !== null">
                    <strong>{{
                      sperateMoneyString(
                        review_placement.rewardAmount[0] +
                          review_placement.rewardAmount[1] +
                          review_placement.bonus
                      )
                    }}</strong>
                  </td>
                  <td v-else>
                    <strong>{{
                      sperateMoneyString(
                        review_placement.rewardAmount[0] +
                          review_placement.rewardAmount[1]
                      )
                    }}</strong>
                  </td>
                  <td>
                    <strong>{{ review_placement.currency }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="handleActionBooking d-flex mt-3">
            <div class="cancelBtn">
              <button type="button" v-on:click="cancelCreatePlacement">
                <i class="fas fa-times"></i>Hủy
              </button>
            </div>
            <div class="successBtn">
              <button type="button" v-on:click="createPlacementForIntroduction">
                Tạo thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </b-modal>

    <div class="col-12">
      <div class="tool-bar row">
        <div class="col-md-12 title d-flex align-items-center">
          <a href="./manage-candidate">
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
            <div class="col-lg-7 col-12" style="padding: 0">
              <div class="job-detail">
                <div class="header-detail mb-2">
                  <div class="title-header">
                    <span>Thông tin về ứng viên</span>
                  </div>
                  <div class="" style="margin-right: 10px">
                    <button
                      class="btn-create-placement"
                      type="button"
                      v-on:click="showCreatePlacement"
                      v-if="
                        introduction_detail.status_histories[0].status.toLowerCase() ===
                          'onboard' && !introduction_detail.placement
                      "
                    >
                      Tạo thanh toán
                    </button>
                  </div>
                  <div class="">
                    <button
                      class="btn-update-status"
                      type="button"
                      v-on:click="showUpdateStatus"
                      v-if="
                        !(
                          introduction_detail.status_histories[0].status.toLowerCase() ===
                            'onboard' && !introduction_detail.placement
                        )
                      "
                    >
                      Cập nhật trạng thái
                    </button>
                  </div>
                </div>
                <div
                  class="placementContent mt-2 d-flex"
                  v-if="this.introduction_detail.placement"
                >
                  <div class="iconPlacement">
                    <i class="fas fa-money-check-alt"></i>
                  </div>
                  <div class="placementString">
                    Ứng viên đã được tạo thanh toán vào ngày
                    {{
                      this.getDateString(
                        this.introduction_detail.placement.create_date
                      )
                    }}
                  </div>
                </div>
                <div
                  class="warrantyContent mt-3 d-fslex"
                  v-if="this.introduction_detail.alternativeCandidates !== null"
                >
                  <div class="iconWarranty">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <div class="warrantyString">
                    Ứng viên đã được bảo hành bằng ứng viên:
                  </div>
                  <div
                    v-for="(alternativeCandidate, index) in this
                      .introduction_detail.alternativeCandidates"
                    :key="alternativeCandidate.id"
                  >
                    <div>
                      <div class="row">
                        <div class="warrantyContentString col-6">
                          Ứng viên {{ index + 1 }}:
                        </div>
                      </div>
                      <div class="row">
                        <div class="warrantyContentString col-6">
                          Tên ứng viên:
                        </div>
                        <div class="warrantyContentString col-auto">
                          <a href="">{{ alternativeCandidate.name }}</a>
                        </div>
                      </div>
                      <div class="row">
                        <div class="warrantyContentString col-6">Email:</div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.email }}
                        </div>
                      </div>
                      <div class="row">
                        <div class="warrantyContentString col-6">
                          Số điện thoại:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{ alternativeCandidate.phone }}
                        </div>
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
                        <div class="warrantyContentString col-6">
                          Ngày bảo hành:
                        </div>
                        <div class="warrantyContentString col-auto">
                          {{
                            getDateString(
                              alternativeCandidate.warrantyStartDate
                            )
                          }}
                        </div>
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
                <div
                  class="warrantyContent mt-3 d-flex"
                  v-if="this.introduction_detail.candidateGuaranteed !== null"
                >
                  <div class="iconWarranty">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <div class="warrantyString">
                      Ứng viên được chọn để bảo hành cho ứng viên:
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Tên ứng viên:
                      </div>
                      <div class="warrantyContentString col-auto">
                        <a href="">{{
                          this.introduction_detail.candidateGuaranteed.name
                        }}</a>
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Email:</div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.email }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số điện thoại:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{ this.introduction_detail.candidateGuaranteed.phone }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">Trạng thái:</div>
                      <div class="warrantyContentString col-auto">
                        {{
                          this.introduction_detail.candidateGuaranteed.status
                        }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Ngày bắt đầu bảo hành:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{
                          this.getDateString(
                            this.introduction_detail.candidateGuaranteed
                              .warrantyStartDate
                          )
                        }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày phải bảo hành:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{
                          this.introduction_detail.candidateGuaranteed
                            .numberDaysWarranty
                        }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày đã bảo hành:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{
                          this.introduction_detail.candidateGuaranteed
                            .warrantyDate
                        }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="warrantyContentString col-6">
                        Số ngày bảo hành còn lại:
                      </div>
                      <div class="warrantyContentString col-auto">
                        {{
                          this.introduction_detail.candidateGuaranteed
                            .remainingWarrantyDays
                        }}
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
                              v-if="
                                getStatusType(
                                  introduction_detail.status_histories[0].status
                                ) === 'pending'
                              "
                              class="statusNotifyPendding"
                              >{{
                                introduction_detail.status_histories[0].status
                              }}
                            </span>
                            <span
                              v-if="
                                getStatusType(
                                  introduction_detail.status_histories[0].status
                                ) === 'warning'
                              "
                              class="statusNotifyWarning"
                              >{{
                                introduction_detail.status_histories[0].status
                              }}
                            </span>
                            <span
                              v-if="
                                getStatusType(
                                  introduction_detail.status_histories[0].status
                                ) === 'success'
                              "
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
                              <span>{{
                                introduction_detail.introduction_id
                              }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="contactInfor">
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <i class="far fa-envelope"></i>
                              <span>Email</span>
                            </div>
                            <div class="codePr">
                              <!-- <a href style="hoverTextInfor"> -->
                              <span>
                                {{ introduction_detail.email }}
                              </span>
                              <!-- </a> -->
                            </div>
                          </div>
                          <div class="textContentUser">
                            <div class="textInforDetail">
                              <i class="fas fa-phone-alt"></i>
                              <span>Số điện thoại</span>
                            </div>
                            <div class="codePr">
                              <!-- <a href style="hoverTextInfor"> -->
                              <span> {{ introduction_detail.phone }}</span>
                              <!-- </a> -->
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
                    <div class="textDetailBnfit col-sm-6 col-12">
                      <div class="text-header mt-3">
                        <span>Tiêu đề công việc</span>
                      </div>
                      <div class="text">
                        <p>{{ introduction_detail.profile_title }}</p>
                      </div>
                    </div>
                    <div class="textDetailBnfit col-sm-6 col-12">
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
                      <span
                        >Tại sao ứng viên thay đổi công việc và kỳ vọng của cô
                        ấy / anh ấy là gì?</span
                      >
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
                      <p>{{ getJobRoleString() }}</p>
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
                  <div
                    v-for="field in introduction_detail.optional_field_values"
                    v-bind:key="field._id"
                  >
                    <div class="textDetailBnfit col-12">
                      <div class="text-header mt-3">
                        <span>{{ field.optional_field.title }}</span>
                      </div>
                      <div
                        class="text"
                        v-if="field.optional_field.type == 'date'"
                      >
                        <p>{{ getDateString(parseInt(field.value)) }}</p>
                      </div>
                      <div
                        class="text"
                        v-else-if="field.optional_field.type == 'multiselect'"
                      >
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
            <div class="col-lg-5 col-12 inforDetailJob">
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
                      <b-modal
                        v-bind:id="
                          getInviteTestPopupId(item.question_package._id)
                        "
                        size="lg"
                        title="Mời làm bài kiểm tra"
                        title-class="font-18"
                        v-bind:ref="
                          getInviteTestPopupId(item.question_package._id)
                        "
                        hide-footer
                        class="text-center"
                      >
                        <div class="bodyCreate">
                          <div class="formCreated">
                            <form
                              @submit.prevent="
                                sendInviteTest(item.question_package)
                              "
                            >
                              <div class="formCreatedContent">
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
                                    <label for="">Thời gian bắt đầu</label>
                                    <div class="inputForm">
                                      <input
                                        type="datetime-local"
                                        v-model="formInvite.start_date_time"
                                      />
                                    </div>
                                  </div>
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
                                    <label for="">Thời gian kết thúc</label>
                                    <div class="inputForm">
                                      <input
                                        type="datetime-local"
                                        v-model="formInvite.end_date_time"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div class="handleActionBooking d-flex">
                                  <div class="cancelBtn">
                                    <button
                                      type="button"
                                      v-on:click="
                                        hideInviteTestPopup(
                                          getInviteTestPopupId(
                                            item.question_package._id
                                          )
                                        )
                                      "
                                    >
                                      <i class="fas fa-times"></i>Hủy
                                    </button>
                                  </div>
                                  <div class="successBtn">
                                    <button type="submit">
                                      <i class="far fa-file-alt"></i> Mời
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </b-modal>
                      <div class="col-12 formCreateGroup d-flex">
                        <div class="col-6">
                          <label
                            for=""
                            class="titleLabel"
                            style="font-size: 18px"
                            >Bài {{ index + 1 }}</label
                          >
                        </div>
                        <div class="col-6">
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
                      <div v-if="item.schedule == null" class="handleBooking">
                        <button
                          type="button"
                          v-b-modal="
                            getInviteTestPopupId(item.question_package._id)
                          "
                          v-if="
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'offer' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'onboard' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'completed' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'resign' &&
                            (checkPermisstion('candidate.all') ||
                              checkPermisstion('candidate.create_placement'))
                          "
                        >
                          <i
                            class="far fa-file-alt"
                            style="margin-right: 0.5rem"
                          ></i>
                          Mời làm bài kiểm tra
                        </button>
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
              <!-- Intervew -->
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
                      <b-modal
                        v-bind:id="getCreateSchedulePopupId(item._id)"
                        size="lg"
                        title="Đặt lịch phỏng vấn"
                        title-class="font-18"
                        v-bind:ref="getCreateSchedulePopupId(item._id)"
                        hide-footer
                        class="text-center"
                        @hide="
                          hideCreateSchedule(getCreateSchedulePopupId(item._id))
                        "
                      >
                        <div class="bodyCreate">
                          <div class="formCreated">
                            <form
                              @submit.prevent="
                                formSubmitBooking(item._id, item.type)
                              "
                            >
                              <div class="formCreatedContent">
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                  >
                                    <label for="">Địa điểm</label>
                                    <div class="inputForm">
                                      <input
                                        type="text"
                                        v-model="formBook_address"
                                      />
                                    </div>
                                  </div>
                                  <div
                                    class="col-6 d-flex"
                                    style="padding-left: 10px"
                                  >
                                    <div
                                      class="col-6"
                                      style="padding-right: 5px"
                                    >
                                      <label for=""
                                        >Ngày
                                        <span class="labelStar">*</span></label
                                      >
                                      <div class="inputForm">
                                        <input
                                          type="date"
                                          v-model="formBook_date"
                                          :class="{
                                            'is-invalid':
                                              submitted &&
                                              $v.formBook_date.$error,
                                          }"
                                        />
                                        <div
                                          v-if="
                                            submitted && $v.formBook_date.$error
                                          "
                                          class="invalid-feedback"
                                        >
                                          <span
                                            v-if="!$v.formBook_date.required"
                                            >Ngày không được bỏ trống *</span
                                          >
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      class="col-6"
                                      style="padding-left: 5px"
                                    >
                                      <label for=""
                                        >Giờ bắt đầu
                                        <span class="labelStar">*</span></label
                                      >
                                      <div class="inputForm">
                                        <input
                                          type="time"
                                          v-model="formBook_start_time"
                                          :class="{
                                            'is-invalid':
                                              submitted &&
                                              $v.formBook_start_time.$error,
                                          }"
                                        />
                                        <div
                                          v-if="
                                            submitted &&
                                            $v.formBook_start_time.$error
                                          "
                                          class="invalid-feedback"
                                        >
                                          <span
                                            v-if="
                                              !$v.formBook_start_time.required
                                            "
                                            >Giờ không được bỏ trống *</span
                                          >
                                        </div>
                                      </div>
                                      <label class="pt-2" for=""
                                        >Giờ kết thúc
                                        <span class="labelStar">*</span></label
                                      >
                                      <div class="inputForm">
                                        <input
                                          type="time"
                                          v-model="formBook_end_time"
                                          :class="{
                                            'is-invalid':
                                              submitted &&
                                              $v.formBook_end_time.$error,
                                          }"
                                        />
                                        <div
                                          v-if="
                                            submitted &&
                                            $v.formBook_end_time.$error
                                          "
                                          class="invalid-feedback"
                                        >
                                          <span
                                            v-if="
                                              !$v.formBook_end_time.required
                                            "
                                            >Giờ không được bỏ trống *</span
                                          >
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="col-12 formCreateGroup d-flex">
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                    v-if="item.type === 'face to face'"
                                  >
                                    <label for=""
                                      >Người phỏng vấn
                                      <span class="labelStar">*</span></label
                                    >
                                    <div class="">
                                      <multiselect
                                        v-model="formBook_interviewer"
                                        :options="supervisors"
                                        :show-labels="false"
                                        :allow-empty="false"
                                        label="name"
                                        :class="{
                                          'is-invalid':
                                            submitted &&
                                            $v.formBook_interviewer.$error,
                                        }"
                                      ></multiselect>
                                      <div
                                        v-if="
                                          submitted &&
                                          $v.formBook_interviewer.$error
                                        "
                                        class="invalid-feedback"
                                      >
                                        <span
                                          v-if="
                                            !$v.formBook_interviewer.required
                                          "
                                          >Người phỏng vấn không được bỏ trống
                                          *</span
                                        >
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    class="col-6"
                                    style="padding-right: 10px"
                                    v-if="item.type === 'online'"
                                  >
                                    <div class="form-check">
                                      <input
                                        class="form-check-input"
                                        type="checkbox"
                                        value=""
                                        id="flexCheckDefault"
                                        v-model="formBook_google_meet"
                                      />
                                      <label
                                        class="form-check-label"
                                        for="flexCheckDefault"
                                      >
                                        Tạo google meet
                                      </label>
                                    </div>
                                  </div>
                                  <div class="col-6" style="padding-left: 10px">
                                    <label for="">Ghi chú</label>
                                    <div class="inputForm">
                                      <textarea
                                        type=""
                                        name="name"
                                        class="form-control"
                                        value="Francis"
                                        style="height: 6rem"
                                        v-model="formBook_noteCTV"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div class="col-12 formCreateGroup">
                                  <label for="">Nội dung email</label>
                                  <div class="inputForm">
                                    <!-- <textarea
                                      type=""
                                      name="name"
                                      class="form-control"
                                      value="Francis"
                                      style="height: 6rem"
                                      v-model="formBook.content"
                                    /> -->
                                    <!-- <ckeditor
                                      class="form-control"
                                      style="height: 6rem"
                                      v-model="formBook.content"
                                      :config="editorConfig"
                                    ></ckeditor> -->
                                    <ckeditor
                                      v-model="formBook_content"
                                      :editor="editor"
                                      class="form-control"
                                      style="height: 6rem"
                                    ></ckeditor>
                                    <!-- <ckeditor
                                      class="form-control"
                                      style="height: 6rem"
                                      value="Hello, World!"
                                    ></ckeditor> -->
                                  </div>
                                </div>
                                <div class="handleActionBooking d-flex">
                                  <div class="cancelBtn">
                                    <button
                                      type="button"
                                      v-on:click="
                                        hideCreateSchedule(
                                          getCreateSchedulePopupId(item._id)
                                        )
                                      "
                                    >
                                      <i class="fas fa-times"></i>Hủy
                                    </button>
                                  </div>
                                  <div class="successBtn">
                                    <button type="submit">
                                      <i class="far fa-calendar-alt"></i>Đặt
                                      lịch
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </b-modal>
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

                          <span
                            style="margin-left: 10px"
                            v-if="item.type === 'face to face'"
                            >Trực tiếp</span
                          >
                          <span
                            style="margin-left: 10px"
                            v-if="item.type === 'online'"
                            >Online</span
                          >
                          <span
                            style="margin-left: 10px"
                            v-if="item.type === 'phone'"
                            >Điện thoại</span
                          >
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
                      <div v-if="item.schedule == null" class="handleBooking">
                        <button
                          type="button"
                          v-b-modal="getCreateSchedulePopupId(item._id)"
                          v-if="
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'offer' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'onboard' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'completed' &&
                            introduction_detail.status_histories[0].status.toLowerCase() !==
                              'resign' &&
                            (checkPermisstion('candidate.all') ||
                              checkPermisstion('candidate.create_placement'))
                          "
                        >
                          <i
                            class="far fa-calendar-alt"
                            style="margin-right: 0.5rem"
                          ></i
                          >Đặt lịch phỏng vấn
                        </button>
                      </div>
                      <div
                        v-if="
                          index !== introduction_detail.interviews.length - 1
                        "
                        class="contentItemForm"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-12 recentActivity">
              <div class="detailWorkspace">
                <div class="titleHeader">
                  <span>Hoạt động gần đây</span>
                </div>
                <div class="mainWorkspace">
                  <div>
                    <div
                      v-for="(
                        item, index
                      ) in introduction_detail.status_histories"
                      v-bind:key="index"
                      class="d-flex"
                    >
                      <div class="col-2" style="position: relative">
                        <div class="contentTree">
                          <span><i class="fas fa-circle"></i></span>
                        </div>
                        <div
                          v-if="
                            index ===
                            introduction_detail.status_histories.length - 1
                          "
                          class="contentTreeEnd"
                        >
                          <span>
                            <i
                              class="far fa-clock"
                              style="margin-right: 5px"
                            ></i
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
                              <span
                                v-if="
                                  index + 1 <
                                  introduction_detail.status_histories.length
                                "
                              >
                                <span
                                  v-if="
                                    getStatusType(
                                      introduction_detail.status_histories[
                                        index + 1
                                      ].status
                                    ) === 'pending'
                                  "
                                  class="statusNotifyPendding"
                                  >{{
                                    introduction_detail.status_histories[
                                      index + 1
                                    ].status
                                  }}
                                </span>
                                <span
                                  v-if="
                                    getStatusType(
                                      introduction_detail.status_histories[
                                        index + 1
                                      ].status
                                    ) === 'warning'
                                  "
                                  class="statusNotifyWarning"
                                  >{{
                                    introduction_detail.status_histories[
                                      index + 1
                                    ].status
                                  }}
                                </span>
                                <span
                                  v-if="
                                    getStatusType(
                                      introduction_detail.status_histories[
                                        index + 1
                                      ].status
                                    ) === 'success'
                                  "
                                  class="statusNotifySuccess"
                                  >{{
                                    introduction_detail.status_histories[
                                      index + 1
                                    ].status
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
                                  v-if="
                                    getStatusType(item.status) === 'pending'
                                  "
                                  class="statusNotifyPendding"
                                  >{{ item.status }}
                                </span>
                                <span
                                  v-if="
                                    getStatusType(item.status) === 'warning'
                                  "
                                  class="statusNotifyWarning"
                                  >{{ item.status }}
                                </span>
                                <span
                                  v-if="
                                    getStatusType(item.status) === 'success'
                                  "
                                  class="statusNotifySuccess"
                                  >{{ item.status }}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div class="time">
                            <i
                              class="far fa-clock"
                              style="margin-right: 5px"
                            ></i>
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
.btn-create-placement {
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
    @media (min-width: 768px) {
      padding-right: 10px;
    }
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
  .recentActivity{
    @media (min-width: 768px) {
      padding-left: 10px;
    }
    @media (max-width: 767.98px) {
      padding-top: 1.25rem;
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
          color: #000;
          font-size: 14px; // text-decoration: underline;
          // background-color: transparent;
          // border-bottom: 2px solid #17934200;
          // &:hover {
          //   color: #1dbf56;
          //   border-bottom: 2px solid #1dbf56;
          // }
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
.actionHandleForm {
  position: fixed;
  bottom: 10px;
  left: 38%;
  z-index: 999;
  transform: translateX(-50%);
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
      color: white;
      border: 1px solid red;
      background-color: #f44336;
      transition: all 0.2s ease-in-out;
      &:hover {
        background-color: red;
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
.inforDetailJob{
  @media (min-width: 992px) {
    padding-left: 10px;
  }
  @media (max-width: 992px) {
    padding-top: 1.25rem;
  }
}
.formCreateGroup__modal {
  @media (min-width: 576px) {
    
    .formCreateGroup__status{
      padding-right: 10px;
    }
    .formCreateGroup__date{
      padding-left: 10px;
    }
  }
}
</style>
