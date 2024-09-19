<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { mapActions } from "vuex";
import Swal from "sweetalert2";
import jwt_decode from "jwt-decode";
import {
  InterviewStatus,
  listInterviewStatus,
} from "../../../../src/helpers/common/constants";

export default {
  page: {
    title: "Chi tiết lịch phỏng vấn",
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
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      // Schedule detail from api
      schedule_detail: {},
      // Question list
      questions: [],
      // Form update schedule
      formBook: {
        address: null,
        date: null,
        start_time: null,
        end_time: null,
        interviewer: null,
        noteCTV: null,
      },
      //List supervisors form api
      supervisors: [],
      // list interview status before interview time
      interview_statuses_before: [
        {
          id: "waiting interview",
          name: "waiting interview",
        },
        {
          id: "cancel interview",
          name: "cancel interview",
        },
      ],
      // list interview status after interview time
      interview_statuses_after: [
        {
          id: "waiting interview",
          name: "waiting interview",
        },
        {
          id: "interviewing",
          name: "interviewing",
        },
        {
          id: "cancel interview",
          name: "cancel interview",
        },
        {
          id: "interview success",
          name: "interview success",
        },
        {
          id: "interview failed",
          name: "interview failed",
        },
      ],
      // List interview status
      interview_statuses: [],
      // Update status data
      update_status_data: {
        status: null,
        note: null,
      },
      //Supervisor list
      supervisors: [],
      // Default schedule detail to update
      default_schedule_detail: {
        supervisor: null,
        interview_date: null,
        interview_start_time: null,
        interview_end_time: null,
        note: null,
        location: null,
        google_meet: true,
      },

      //Test history
      listStatusNotify: [
        {
          title: "Waiting Candidate Confirm",
          message:
            "Nguyen Tai moved Nguyễn Thành Đạt from Pending to Waiting Candidate Confirm",
          status: [
            {
              id: 0,
              name: "Pending ",
              isActive: "pending",
            },
            {
              id: 1,
              name: "Waiting Candidate Confirm",
              isActive: "waiting",
            },
            {
              id: 1,
              name: "Success",
              isActive: "success",
            },
          ],
          time: "12/06/2021 - 9:42 PM",
        },
        {
          title: "Pending",
          message: "Nguyen Tai create referral",
          status: [
            {
              id: 0,
              name: "Pending",
              isActive: "pending",
            },
          ],
          time: "12/06/2021 - 9:42 PM",
        },
        {
          title: "Success",
          message: "Nguyen Tai done Update",
          status: [
            {
              id: 0,
              name: "Success",
              isActive: "success",
            },
          ],
          time: "12/06/2021 - 9:42 PM",
        },
        {
          title: "Tài",
          message: "Tai FPT Uni",
          status: [
            {
              id: 0,
              name: "Success",
              isActive: "success",
            },
          ],
          time: "12/06/2021 - 9:42 PM",
        },
        {
          title: "Hiệp",
          message: "pro",
          status: [
            {
              id: 0,
              name: "Success",
              isActive: "success",
            },
          ],
          time: "12/06/2021 - 9:42 PM",
        },
      ],

      submitted: false,
      submittedCreatedContent: false,
      interviewStatus: InterviewStatus,
      isStt: null,
      statusDateInterView: false,
      statusQuestion: false,
      listStt: [
        {
          name: "waiting interview",
        },
        {
          name: "interviewing",
        },
        {
          name: "cancel interview",
        },
        {
          name: "interview success",
        },
        {
          name: "interview failed",
        },
      ],
      form: {
        dateStart: null,
        dateEnd: null,
      },

      infoInterViewer: {
        name: "Nguyễn Thành Tài",
        job: "FrontEnd Developer",
        dayStart: "17/6/2021",
        dayEnd: "22/6/2021",
        statusInterview: "interviewing",
        interviewer: "Nguyễn Thị Tuyết Như",
        location:
          "Lầu 22 tòa kicsomrein, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
      },
      listInforPv: [
        {
          id: 0,
          round: 1,
          typeInterview: "Phỏng vấn offline",
          description:
            "Being blessed with responsibility and learning ability, i want to apply for your company aiming at developing companie's product line along with Improvingexperience, learning new technology, self growing which are my biggest goal in the future with the hope to contribute to thedevelopment of the company.",

          note: "Looking for a job, a good environment to develop myself",
          data: [
            {
              id: 0,
              question: "Khác nhau giữa null và undefined?",
              evaluate: "3",
            },
            {
              id: 1,
              question: "Khác nhau giữa 2 hàm document.ready và body.onload?",
              evaluate: "7",
            },
            {
              id: 2,
              question:
                "Cho biết output của lệnh: Console.log(typeof undefined == typeof NULL)",
              evaluate: "7",
            },
            {
              id: 3,
              question: "Khi nào cần sử dụng async và defer trong javascript?",
              evaluate: "8",
            },
            {
              id: 4,
              question: "'This' trong javascript được dùng để làm gì?",
              evaluate: "9",
            },
          ],
        },
        // {
        //   id: 1,
        //   round: 2,
        //   typeInterview: "Phỏng vấn online",
        //   description:
        //     "Being blessed with responsibility and learning ability, i want to apply for your company aiming at developing companie's product line along with Improvingexperience, learning new technology, self growing which are my biggest goal in the future with the hope to contribute to thedevelopment of the company.",
        //   dayStart: "22/6/2021",
        //   dayEnd: "11/9/2021",
        //   statusInterview: "Thất bại",
        //   interviewer: "Nguyễn Thị Vân Trang",
        //   location:
        //     "Lầu 22 tòa kicsomrein, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
        //   note: "Looking for a job, a good environment to develop myself",
        // },
      ],
      formCreateContent: {
        data: [],
      },
      form: {
        data: [],
      },
    };
  },
  mounted() {
    this.getScheduleDetail();
    this.checkDate();
    this.createOnInitForm();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "interview/getScheduleDetailSuccess":
          this.schedule_detail = state.interview.scheduleData.data;
          this.questions = [];
          state.interview.scheduleData.data.questions.forEach((question) => {
            this.questions.push({
              _id: question._id,
              question_content: question.question_content,
              answer_point: question.answer_point,
            });
          });
          this.update_status_data.status = this.getStatusObject(
            this.schedule_detail.status_history[0].status
          );
          this.interview_statuses = this.checkAfterInterviewTime()
            ? this.interview_statuses_after
            : this.interview_statuses_before;
          break;
        case "interview/getScheduleDetailFailure":
          break;
        case "interview/updateScheduleStatusSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.getScheduleDetail();
              this.hideUpdateStatus();
            }
          );
          break;
        case "interview/updateScheduleStatusFailure":
          Swal.fire("Cập nhật trạng thái không thành công", "", "error");
          break;
        case "interview/getSupervisorSuccess":
          this.supervisors = this.combineNameAndEmailForSupervisors(
            state.interview.supervisorsData.employers
          );
          this.getDefaultSupervisor();
          break;
        case "interview/updateScheduleSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.getScheduleDetail();
              this.hideUpdateSchedule();
            }
          );
          break;
        case "interview/updateScheduleFailure":
          switch (state.interview.updateScheduleData) {
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
        case "interview/updateInterviewQuestionSuccess":
          Swal.fire("Cập nhật câu hỏi thành công", "", "success").then(() => {
            this.getScheduleDetail();
            this.cancelUpdateQuestions();
          });
          break;
        case "interview/updateInterviewQuestionFailure":
          Swal.fire("Cập nhật câu hỏi không thành công", "", "error");
          break;
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("interview", [
      "getSupervisor",
      "getInterviewScheduleDetail",
      "updateInterviewQuestion",
      "updateInterviewScheduleStatus",
      "updateInterviewSchedule",
    ]),

    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },

    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },

    //Get schedule id from url
    getScheduleId() {
      var url = window.location.href;

      var name = "id";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    //Get schedule detail
    getScheduleDetail() {
      const schedule_id = this.getScheduleId();

      this.getInterviewScheduleDetail(schedule_id);
    },

    //Show update schedule popup view
    showUpdateSchedule() {
      if (
        !(
          this.checkPermisstion("interview.all") ||
          this.checkPermisstion("interview.update")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.getListSupervisor();
      this.getDefaultData();
      this.$refs["update-schedule"].show();
    },

    //Hide update schedule popup view
    hideUpdateSchedule() {
      this.default_schedule_detail = {
        supervisor: null,
        interview_date: null,
        interview_start_time: null,
        interview_end_time: null,
        note: null,
        location: null,
        google_meet: true,
      };
      this.$bvModal.hide("update-schedule");
    },

    //Show update status popup view
    showUpdateStatus() {
      if (
        !(
          this.checkPermisstion("interview.all") ||
          this.checkPermisstion("interview.update_status")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.$refs["update-status"].show();
    },

    //Hide update status popup view
    hideUpdateStatus() {
      this.update_status_data.status = this.getStatusObject(
        this.schedule_detail.status_history[0].status
      );
      this.update_status_data.note = null;
      this.$bvModal.hide("update-status");
    },

    //Show update question popup view
    showUpdateQuestion() {
      if (
        !(
          this.checkPermisstion("interview.all") ||
          this.checkPermisstion("interview.question")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.$refs["update-question"].show();
    },

    //Convert timestamp to date string
    getDateString(timestamp) {
      const date = new Date(timestamp);
      const dateString = "0" + date.getDate();
      const monthString = "0" + (date.getMonth() + 1);
      const yearString = date.getFullYear();
      return (
        dateString.substr(-2) + "/" + monthString.substr(-2) + "/" + yearString
      );
    },

    //Convert timestamp to date time string
    getDateTimeString(timestamp) {
      var date = new Date(timestamp);
      const dateString = "0" + date.getDate();
      const monthString = "0" + (date.getMonth() + 1);
      const yearString = date.getFullYear();
      const hourString = "0" + date.getHours();
      const minuteString = "0" + date.getMinutes();
      return (
        dateString.substr(-2) +
        "/" +
        monthString.substr(-2) +
        "/" +
        yearString +
        " " +
        hourString.substr(-2) +
        ":" +
        minuteString.substr(-2)
      );
    },

    //Convert timestamp to time string
    getTimeString(startTimestamp, endTimestamp) {
      var start = new Date(startTimestamp);
      var end = new Date(endTimestamp);

      var startHours = "0" + start.getHours();
      var startMinutes = "0" + start.getMinutes();
      var endHours = "0" + end.getHours();
      var endMinutes = "0" + end.getMinutes();

      return (
        startHours.substr(-2) +
        ":" +
        startMinutes.substr(-2) +
        " - " +
        endHours.substr(-2) +
        ":" +
        endMinutes.substr(-2)
      );
    },

    //Create new question
    createNewQuestion() {
      this.questions.push({
        question_content: null,
        answer_point: null,
        action: "create",
      });

    },

    //Delete question
    deleteQuestion(index) {
      if (this.questions[index]._id) {
        var deleteQuestion = {
          _id: this.questions[index]._id,
          question_content: this.questions[index].question_content,
          answer_point: this.questions[index].answer_point,
          action: "delete",
        };
        this.questions.splice(index, 1);
        this.questions.push(deleteQuestion);
      } else {
        this.questions.splice(index, 1);
      }
    },

    //Update list question
    updateQuestions() {
      Swal.fire({
        title: "Xác nhận cập nhật câu hỏi phỏng vấn",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          var isValidated = true;
          var data = {
            questions: [],
          };

          this.questions.forEach((question) => {
            if (
              question.question_content !== "" &&
              question.question_content !== null &&
              question.isEmpty
            ) {
              question.isEmpty = undefined;
            }
            if (question.action) {
              switch (question.action) {
                case "create":
                  if (
                    question.question_content !== "" &&
                    question.question_content !== null
                  ) {
                    data.questions.push(this.generateCreateQuestion(question));
                  } else {
                    question.isEmpty = "isEmpty";
                    isValidated = false;
                    return;
                  }
                  break;
                case "delete":
                  data.questions.push(this.generateDeleteQuestion(question));
                  break;
              }
            } else {
              if (
                question.question_content !== "" &&
                question.question_content !== null
              ) {
                data.questions.push(
                  this.generateUpdateOrNotChangeQuestion(question)
                );
              } else {
                question.isEmpty = "isEmpty";
                isValidated = false;
              }
            }
          });

          if (!isValidated) {
            return;
          }

          const schedule_id = this.getScheduleId();
          this.updateInterviewQuestion({
            schedule_id,
            data,
          });
        }
        if (result.isDismissed) {
        }
      });
    },

    //Generate create question item
    generateCreateQuestion(question) {
      var item = {
        action: "create",
        question_content: question.question_content,
      };
      if (
        question.answer_point !== null &&
        question.answer_point !== "" &&
        this.checkAfterInterviewTime()
      ) {
        item.answer_point = parseInt(question.answer_point);
      }
      return item;
    },

    //Generate delete question item
    generateDeleteQuestion(question) {
      var item = {
        action: "delete",
        id: question._id,
        question_content: question.question_content,
      };
      if (
        question.answer_point !== null &&
        question.answer_point !== "" &&
        this.checkAfterInterviewTime()
      ) {
        item.answer_point = question.answer_point;
      }
      return item;
    },

    //Generate update or not change question item
    generateUpdateOrNotChangeQuestion(question) {
      var item = {
        id: question._id,
        question_content: question.question_content,
      };
      if (
        question.answer_point !== null &&
        question.answer_point !== "" &&
        this.checkAfterInterviewTime()
      ) {
        item.answer_point = question.answer_point;
      }

      var isChanged = false;
      this.schedule_detail.questions.forEach((auQuestion) => {
        if (question._id === auQuestion._id) {
          if (
            question.question_content !== auQuestion.question_content ||
            question.answer_point !== auQuestion.answer_point
          ) {
            isChanged = true;
          }
        }
      });

      item.action = isChanged ? "update" : null;
      return item;
    },

    //Cancel update question:
    cancelUpdateQuestions() {
      this.questions = [];
      this.schedule_detail.questions.forEach((question) => {
        this.questions.push({
          _id: question._id,
          question_content: question.question_content,
          answer_point: question.answer_point,
        });
      });

      this.$bvModal.hide("update-question");
    },

    //Compare interview date with current date
    checkAfterInterviewTime() {
      let currentTime = new Date();
      let currentTimeTimestamp = currentTime.getTime();

      let interviewTimeTimestamp = this.schedule_detail.interview_start_date;

      return currentTimeTimestamp >= interviewTimeTimestamp;
    },

    //Get status object from status string
    getStatusObject(status_string) {
      var status = {};

      switch (status_string) {
        case "waiting interview":
          status = {
            id: "waiting interview",
            name: "waiting interview",
          };
          break;
        case "interviewing":
          status = {
            id: "interviewing",
            name: "interviewing",
          };
          break;
        case "cancel interview":
          status = {
            id: "cancel interview",
            name: "cancel interview",
          };
          break;
        case "interview success":
          status = {
            id: "interview success",
            name: "interview success",
          };
          break;
        case "interview failed":
          status = {
            id: "interview failed",
            name: "interview failed",
          };
          break;
      }

      return status;
    },

    //Update interview status
    updateInterviewStatus() {
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
          const schedule_id = this.getScheduleId();
          const status = this.update_status_data.status.id;

          var data = {
            status: status,
          };

          if (
            this.update_status_data.note !== null &&
            this.update_status_data.note.trim() !== ""
          ) {
            data.reason = this.update_status_data.note;
          }


          this.updateInterviewScheduleStatus({
            schedule_id,
            data,
          });
        }
        if (result.isDismissed) {
        }
      });
    },

    //Get list supervisor
    getListSupervisor() {
      this.getSupervisor();
    },

    //Get default data for update interview schedule
    getDefaultData() {
      //Get interview date
      const interview_date = new Date(
        this.schedule_detail.interview_start_date
      );
      const interview_date_date = "0" + interview_date.getDate();
      const interview_date_month = "0" + (interview_date.getMonth() + 1);
      const interview_date_year = interview_date.getFullYear();
      const interview_date_string =
        interview_date_year +
        "-" +
        interview_date_month.substr(-2) +
        "-" +
        interview_date_date.substr(-2);

      this.default_schedule_detail.interview_date = interview_date_string;

      //Get interview start time
      const interview_start_date = new Date(
        this.schedule_detail.interview_start_date
      );
      const interview_start_date_hours = "0" + interview_start_date.getHours();
      const interview_start_date_minute =
        "0" + interview_start_date.getMinutes();
      const interview_start_time_string =
        interview_start_date_hours.substr(-2) +
        ":" +
        interview_start_date_minute.substr(-2);

      this.default_schedule_detail.interview_start_time =
        interview_start_time_string;

      //Get interview end time
      const interview_end_date = new Date(
        this.schedule_detail.interview_end_date
      );
      const interview_end_date_hours = "0" + interview_end_date.getHours();
      const interview_end_date_minute = "0" + interview_end_date.getMinutes();
      const interview_end_time_string =
        interview_end_date_hours.substr(-2) +
        ":" +
        interview_end_date_minute.substr(-2);

      this.default_schedule_detail.interview_end_time =
        interview_end_time_string;

      // Get note
      if (this.schedule_detail.note) {
        this.default_schedule_detail.note = this.schedule_detail.note;
      }

      // Get Address
      if (this.schedule_detail.location) {
        this.default_schedule_detail.location = this.schedule_detail.location;
      }
    },

    //Get default supervisor object
    getDefaultSupervisor() {
      if (this.schedule_detail.supervisor.id) {
        this.supervisors.forEach((supervisor) => {
          if (supervisor.id === this.schedule_detail.supervisor.id) {
            this.default_schedule_detail.supervisor = supervisor;
          } else {
            this.default_schedule_detail.supervisor = {
              id: this.schedule_detail.supervisor.id,
              name:
                this.schedule_detail.supervisor.name +
                " - " +
                this.schedule_detail.supervisor.email,
            };
          }
        });
      }
    },

    //Combine name and email for supervisor list
    combineNameAndEmailForSupervisors(supervisors) {
      const newSupervisors = [];
      supervisors.forEach((supervisor) => {
        newSupervisors.push({
          id: supervisor.id,
          name: supervisor.name + " - " + supervisor.email,
        });
      });
      return newSupervisors;
    },

    //Update interview schedule detail
    updateScheduleDetail() {
      Swal.fire({
        title: "Xác nhận cập nhật lịch phỏng vấn",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          // this.submitted = true;
          // this.$v.$touch();

          const schedule_id = this.getScheduleId();

          const date = this.default_schedule_detail.interview_date;
          const start_time = this.default_schedule_detail.interview_start_time;
          const end_time = this.default_schedule_detail.interview_end_time;

          const interview_start_date_string = date + " " + start_time + ":00";
          const interview_end_date_string = date + " " + end_time + ":00";

          const start_date = new Date(interview_start_date_string);
          const end_date = new Date(interview_end_date_string);

          const interview_start_date = start_date.getTime();
          const interview_end_date = end_date.getTime();

          var data = {
            interview_start_date: interview_start_date,
            interview_end_date: interview_end_date,
          };

          if (this.default_schedule_detail.location !== null) {
            data.location = this.default_schedule_detail.location;
          }

          if (this.default_schedule_detail.supervisor !== null) {
            data.supervisor_id = this.default_schedule_detail.supervisor.id;
          }

          if (this.default_schedule_detail.note !== null) {
            data.note = this.default_schedule_detail.note;
          }

          if (this.schedule_detail.interview.type === "online") {
            data.google_meet = this.default_schedule_detail.google_meet;
          }

          this.updateInterviewSchedule({
            schedule_id,
            data,
          });
        }
        if (result.isDismissed) {
        }
      });
    },

    checkDate() {
      let dateCurr = new Date().toLocaleString();
      let dateInterview = "6/19/2021, 10:23:09 AM";
      if (new Date(dateInterview).getTime() <= new Date(dateCurr).getTime()) {
        this.statusDateInterView = true;
      }
    },

    handleHideContent() {
      // this.listInforPv[0].data.find((item, idx) => {
      //   if (!item.question || !item.evaluate) {
      //     let idxValue = item.id;
      //     this.listInforPv[0].data = this.listInforPv[0].data.filter(
      //       (item, idx) => {
      //         item.id !== idxValue;
      //       }
      //     );
      //   }
      // });
      this.createOnInitForm();

      this.$refs["modal-create-content"].hide();
    },

    handleShowModalEditStatus() {
      this.$refs["modalStatus"].show();
    },

    handleHideModalEditStatus() {
      this.$refs["modalStatus"].hide();
    },

    hideModel() {
      this.$refs["modal-center"].hide();
    },

    showModalEdit() {
      this.$refs["modal-center"].show();
    },
    formSubmitStt() {
      this.infoInterViewer.statusInterview = this.isStt.name;
      this.handleHideModalEditStatus();
    },
    formSubmitTime() {
      this.submitted = true;
      this.infoInterViewer.dayEnd = this.form.dateEnd;
      this.infoInterViewer.dayStart = this.form.dateStart;
      this.$refs["modal-center"].hide();
    },

    formCreateDataContent() {
      this.submittedCreatedContent = true;
      if (this.listInforPv[0].data !== -1) {
        this.listInforPv[0].data = [...this.formCreateContent.data];
        this.createOnInitForm();
        this.handleHideContent();
      }
    },

    createOnInitForm() {
      let formCurr = this.formCreateContent;
      if (this.listInforPv[0].data) {
        [...formCurr.data] = this.listInforPv[0].data;
      }
    },

    handleHideFormControl(idx) {
      if (idx !== -1) {
        this.listInforPv[0].data = this.listInforPv[0].data.filter(
          (item, index) => item.id !== idx
        );
        this.createOnInitForm();
      }
    },
  },
};
</script>
<template>
  <Layout>
    <PageHeader :title="title" />
    <div class="headerDetailPage d-flex align-items-center" style="flex: 1">
      <a href="/manage-interview">
        <button class="handleBack">
          <i class="fas fa-chevron-left"></i></button
      ></a>
    </div>
    <div class="detailInterview row">
      <b-modal id="update-schedule" size="lg" title="Chỉnh sửa lịch phỏng vấn" title-class="font-18" ref="update-schedule" 
        hide-footer
        class="text-center"
        @hide="hideUpdateSchedule">

        <div class="bodyCreate">
          <div class="formCreated">
            <form @submit.prevent="updateScheduleDetail">
              <div class="formCreatedContent">
                <div class="col-12 formCreateGroup d-flex">
                  <div
                    class="col-6"
                    style="padding-right: 10px"
                    v-if="schedule_detail.interview.type === 'face to face'"
                  >
                    <div>
                      <label for="">Địa điểm</label>
                      <div class="inputForm">
                        <input
                          type="text"
                          v-model="default_schedule_detail.location"
                        />
                      </div>
                    </div>
                    <div class="pt-2">
                      <label for=""
                        >Người phỏng vấn <span class="labelStar">*</span></label
                      >
                      <div class="">
                        <multiselect
                          v-model="default_schedule_detail.supervisor"
                          :options="supervisors"
                          :show-labels="false"
                          :allow-empty="false"
                          label="name"
                          :class="{
                            'is-invalid':
                              submitted && $v.formBook.interviewer.$error,
                          }"
                        ></multiselect>
                        <div
                          v-if="submitted && $v.formBook.interviewer.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.formBook.interviewer.required"
                            >Người phỏng vấn không được bỏ trống *</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="col-6"
                    style="padding-right: 10px"
                    v-if="schedule_detail.interview.type === 'online'"
                  >
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        value=""
                        id="flexCheckDefault"
                        v-model="default_schedule_detail.google_meet"
                      />
                      <label class="form-check-label" for="flexCheckDefault">
                        Tạo google meet
                      </label>
                    </div>
                  </div>
                  <div class="col-6 d-flex" style="padding-left: 10px">
                    <div class="col-6" style="padding-right: 5px">
                      <label for=""
                        >Ngày <span class="labelStar">*</span></label
                      >
                      <div class="inputForm">
                        <input
                          type="date"
                          v-model="default_schedule_detail.interview_date"
                          :class="{
                            'is-invalid': submitted && $v.formBook.date.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.formBook.date.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.formBook.date.required"
                            >Ngày không được bỏ trống *</span
                          >
                        </div>
                      </div>
                    </div>
                    <div class="col-6" style="padding-left: 5px">
                      <label for=""
                        >Giờ bắt đầu <span class="labelStar">*</span></label
                      >
                      <div class="inputForm">
                        <input
                          type="time"
                          v-model="default_schedule_detail.interview_start_time"
                          :class="{
                            'is-invalid':
                              submitted && $v.formBook.start_time.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.formBook.start_time.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.formBook.start_time.required"
                            >Giờ không được bỏ trống *</span
                          >
                        </div>
                      </div>
                      <label class="pt-2" for=""
                        >Giờ kết thúc <span class="labelStar">*</span></label
                      >
                      <div class="inputForm">
                        <input
                          type="time"
                          v-model="default_schedule_detail.interview_end_time"
                          :class="{
                            'is-invalid':
                              submitted && $v.formBook.end_time.$error,
                          }"
                        />
                        <div
                          v-if="submitted && $v.formBook.end_time.$error"
                          class="invalid-feedback"
                        >
                          <span v-if="!$v.formBook.end_time.required"
                            >Giờ không được bỏ trống *</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-12 formCreateGroup d-flex">
                  <div class="col-6" style="padding-right: 10px"></div>
                  <!-- <div class="col-6" style="padding-left: 10px">
                    <label for="">Nội dung email</label>
                    <div class="inputForm">
                      <textarea
                        type=""
                        name="name"
                        class="form-control"
                        value="Francis"
                        style="height: 6rem"
                        v-model="formBook.content"
                      />
                    </div>
                  </div> -->
                </div>
                <div class="col-12 formCreateGroup">
                  <label for="">Ghi chú</label>
                  <div class="inputForm">
                    <textarea
                      type=""
                      name="name"
                      class="form-control"
                      value="Francis"
                      style="height: 6rem"
                      v-model="default_schedule_detail.note"
                    />
                  </div>
                </div>
                <div class="handleActionBooking d-flex pt-2">
                  <div class="cancelBtn">
                    <button type="button" v-on:click="hideUpdateSchedule">
                      <i class="fas fa-times"></i>Hủy
                    </button>
                  </div>
                  <div class="successBtn">
                    <button type="submit">
                      <i class="far fa-calendar-alt"></i>Cập nhật
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

      </b-modal>
      <b-modal id="update-status"
        centered
        title="Cập nhật trạng thái"
        title-class="font-18"
        hide-footer
        ref="update-status"
        @hide="hideUpdateStatus">
        <form @submit.prevent="updateInterviewStatus">
          <div class="col-12">
            <div class="col-12">
              <multiselect
                v-model="update_status_data.status"
                :options="interview_statuses"
                label="name"
                :taggable="true"
                track-by="id"
                :clear-on-select="true"
              ></multiselect>
            </div>
            <div class="col-12 formCreateGroup pt-3">
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
            <div class="handleBtnModal d-flex">
              <div class="btnCancel">
                <button type="button" v-on:click="hideUpdateStatus">
                  <i class="fas fa-times"></i>Hủy
                </button>
              </div>
              <div class="btnSuccess">
                <button type="submit">Lưu</button>
              </div>
            </div>
          </div>
        </form>
      </b-modal>
      <b-modal id="update-question"
        scrollable
        title="Cập nhật câu hỏi phỏng vấn"
        title-class="font-18"
        hide-footer
        ref="update-question"
        @hide="cancelUpdateQuestions">
        <div class="bodyDetail">
          <form @submit.prevent="formCreateDataContent">
            <div v-for="(question, index) in questions" v-bind:key="index">
              <div
                class="col-12 d-flex mb-3"
                v-if="question.action !== 'delete'"
              >
                <div class="col-10" style="padding-right: 10px">
                  <span class="titleLabel">Câu hỏi {{index + 1}}</span>
                  <div class="inputForm">
                    <input
                      id="date-time"
                      type="input"
                      v-model="question.question_content"
                    />
                  </div>
                </div>
                <div class="col-2" style="padding-left: 10px">
                  <div class="d-flex">
                    <div style="flex: 1" v-if="checkAfterInterviewTime()">
                      <span class="titleLabel">Đánh giá</span>
                    </div>
                    <div class="titleLabelIcon">
                      <i
                        class="fas fa-times"
                        v-on:click="deleteQuestion(index)"
                      ></i>
                    </div>
                  </div>
                  <div class="inputForm">
                    <input
                      v-if="checkAfterInterviewTime()"
                      style="width: 50px"
                      id="date-time"
                      v-model="question.answer_point"
                      type="input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="handleAddContent">
              <button type="button" v-on:click="createNewQuestion">
                Thêm nội dung
              </button>
            </div>
            <div class="handleBtnModal d-flex" style="margin-top: 10px">
              <div class="btnCancel">
                <button type="button" v-on:click="cancelUpdateQuestions">
                  <i class="fas fa-times"></i>Hủy
                </button>
              </div>
              <div class="btnSuccess">
                <button type="button" v-on:click="updateQuestions">Lưu</button>
              </div>
            </div>
          </form>
        </div>
      </b-modal>
      <div class="col-md-6 generalInfor">
        <!-- Thông tin chung -->
        <h5>Thông tin chung</h5>
        <div class="bodyDetail">
          <div class="row">
            <div class="col-md-6">
              <div>
                <span class="titleLabel">Tên ứng viên</span>
                <button class="btnHandleSeenCV">Xem CV</button>
              </div>
              <div class="inputForm">
                <span>{{ schedule_detail.candidate.name }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div><span for="" class="titleLabel">Email ứng viên</span></div>
              <div class="inputForm">
                <span>{{ schedule_detail.candidate.email }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div><span for="" class="titleLabel">Tên công ty</span></div>
              <div class="inputForm">
                <span>{{ schedule_detail.post.company.name }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div><span for="" class="titleLabel">Tên công việc</span></div>
              <div class="inputForm">
                <span>{{ schedule_detail.post.title }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Thông tin lịch phỏng vấn -->
        <div class="d-flex flex-wrap justify-content-between">
          <h5>Thông tin lịch phỏng vấn</h5>

          <div>
            <button
              class="btnUpdateSchedule"
              data-toggle="modal"
              data-target="#exampleModalScrollable"
              type="button"
              v-on:click="showUpdateSchedule"
            >
              Chỉnh sửa
            </button>

            <button
              class="btnUpdateStatus"
              data-toggle="modal"
              data-target="#exampleModalScrollable"
              type="button"
              v-on:click="showUpdateStatus"
            >
              Cập nhật trạng thái
            </button>
          </div>
        </div>

        <div class="bodyDetail mt-3">
          <div class="row">
            <div class="col-sm-6">
              <div><span for="" class="titleLabel">Ngày phỏng vấn</span></div>
              <div class="inputForm">
                <span>{{
                  getDateString(schedule_detail.interview_start_date)
                }}</span>
              </div>
            </div>
            <div class="col-sm-6">
              <div>
                <span for="" class="titleLabel">Thời gian phỏng vấn</span>
              </div>
              <div class="inputForm">
                <span>{{
                  getTimeString(
                    schedule_detail.interview_start_date,
                    schedule_detail.interview_end_date
                  )
                }}</span>
              </div>
            </div>
          </div>
          <div class="formCreateGroup row mt-2">
            <div class="col-4">
              <span for="" class="titleLabel">Tình trạng phỏng vấn</span>
            </div>
            <div class="col-8">
              <span>{{ schedule_detail.status_history[0].status }}</span>
            </div>
          </div>
          <div class="formCreateGroup row mt-2">
            <div class="col-4">
              <span for="" class="titleLabel">Phương thức phỏng vấn</span>
            </div>
            <div class="col-8">
              <span>{{ schedule_detail.interview.type }}</span>
            </div>
          </div>
          <div class="formCreateGroup row mt-2" v-if="schedule_detail.location">
            <div class="col-4">
              <span for="" class="titleLabel">Địa điểm phỏng vấn</span>
            </div>
            <div class="col-8">
              <span>{{ schedule_detail.location }}</span>
            </div>
          </div>
          <div
            class="formCreateGroup row mt-2"
            v-if="schedule_detail.supervisor"
          >
            <div class="col-4">
              <span for="" class="titleLabel">Người giám sát</span>
            </div>
            <div class="col-8">
              <span>{{ schedule_detail.supervisor.name }}</span>
            </div>
          </div>
          <div
            class="formCreateGroup row mt-2"
            v-if="schedule_detail.supervisor"
          >
            <div class="col-4">
              <span for="" class="titleLabel">Email người giám sát</span>
            </div>
            <div class="col-8">
              <span>{{ schedule_detail.supervisor.email }}</span>
            </div>
          </div>
          <div class="col-12">
            <div><span for="" class="titleLabel">Mô tả</span></div>
            <div class="inputForm">
              <span>{{ schedule_detail.interview.stage_description }}</span>
            </div>
          </div>
          <div class="col-12" style="margin-top: 10px">
            <span class="titleLabel">Ghi chú</span>
            <div>
              <span>{{ schedule_detail.note }}</span>
            </div>
          </div>
        </div>
        <!-- Câu hỏi đánh giá -->
        <div class="row">
          <div class="col-md-8 col-6">
            <h5>Câu hỏi đánh giá</h5>
          </div>
          <div class="col-md-4 col-6">
            <button
              class="btnUpdateQuestion"
              data-toggle="modal"
              data-target="#exampleModalScrollable"
              type="button"
              v-on:click="showUpdateQuestion"
            >
              Cập nhật câu hỏi
            </button>
          </div>
        </div>
        <div class="bodyDetail mt-3">
          <div class="table-responsive">
            <table class="table mb-0">
              <thead class="thead-light">
                <tr>
                  <th>No.</th>
                  <th>Câu hỏi</th>
                  <th v-if="checkAfterInterviewTime()">Điểm đánh giá</th>
                </tr>
              </thead>
              <tbody
                v-for="(question, index) in schedule_detail.questions"
                v-bind:key="question._id"
              >
                <tr>
                  <td>{{ index + 1 }}</td>
                  <td>{{ question.question_content }}</td>
                  <td v-if="checkAfterInterviewTime()">
                    {{ question.answer_point }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6" style="padding-left: 10px">
        <div class="detailWorkspace">
          <h5>Hoạt động gần đây</h5>
          <div class="mainWorkspace">
            <div>
              <div
                v-for="(item, index) in schedule_detail.status_history"
                v-bind:key="index"
                class="d-flex"
              >
                <div class="col-2" style="position: relative">
                  <div class="contentTree">
                    <span><i class="fas fa-circle"></i></span>
                  </div>
                  <div
                    v-if="index === schedule_detail.status_history.length - 1"
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
                      <div class="textMessage" v-if="item.reason">
                        <span>{{ item.reason }}</span>
                      </div>
                      <div class="statusSteps">
                        <span
                          v-if="
                            index + 1 < schedule_detail.status_history.length
                          "
                        >
                          <span
                            v-if="
                              schedule_detail.status_history[index + 1]
                                .status === 'waiting interview' ||
                              schedule_detail.status_history[index + 1]
                                .status === 'interviewing'
                            "
                            class="statusNotifyPendding"
                            >{{
                              schedule_detail.status_history[index + 1].status
                            }}
                          </span>
                          <span
                            v-if="
                              schedule_detail.status_history[index + 1]
                                .status === 'cancel interview' ||
                              schedule_detail.status_history[index + 1]
                                .status === 'interview failed'
                            "
                            class="statusNotifyWarning"
                            >{{
                              schedule_detail.status_history[index + 1].status
                            }}
                          </span>
                          <span
                            v-if="
                              schedule_detail.status_history[index + 1]
                                .status === 'interview success'
                            "
                            class="statusNotifySuccess"
                            >{{
                              schedule_detail.status_history[index + 1].status
                            }}
                          </span>
                          <i
                            v-if="index !== item.status.length - 1"
                            class="fas fa-long-arrow-alt-right"
                            style="margin: 0 5px"
                          ></i>
                        </span>
                        <span>
                          <span
                            v-if="
                              item.status === 'waiting interview' ||
                              item.status === 'interviewing'
                            "
                            class="statusNotifyPendding"
                            >{{ item.status }}
                          </span>
                          <span
                            v-if="
                              item.status === 'cancel interview' ||
                              item.status === 'interview failed'
                            "
                            class="statusNotifyWarning"
                            >{{ item.status }}
                          </span>
                          <span
                            v-if="item.status === 'interview success'"
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
  </Layout>
</template>
<style lang="scss">
.modal-dialog {
  @media screen and (min-width: 1440px) {
    min-width: 600px;
  }
}
.titleLabelIcon {
  i {
    cursor: pointer;
    &:hover {
      color: rgba(0, 0, 0, 0.699);
    }
  }
}
.handleAddContent {
  display: flex;
  justify-content: center;
  button {
    padding: 6px 15px;
    border: none;
    outline: none;
    border-radius: 3px;
    background: #5b73e8;
    color: white;
    -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    transition: all 0.2s ease-in-out;
    &:hover {
      background: #4763ee;
    }
  }
}
.btnUpdateSchedule {
  padding: 5px 8px;
  border: none;
  outline: none;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: #445fe9;
  color: white;
  background: #445fe9;
  -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  transition: all 0.2s ease-in-out;
}
.btnUpdateSchedule:hover {
  background: #4763ee;
  color: white;
}
.btnUpdateStatus {
  margin-left: 10px;
  padding: 5px 8px;
  border: none;
  outline: none;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: #fdb327;
  color: #000;
  background: #fdb327;
  -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  transition: all 0.2s ease-in-out;
}
.btnUpdateStatus:hover {
  background: #faac1b;
  color: #495057;
}
.btnUpdateQuestion {
  padding: 5px 8px;
  border: none;
  outline: none;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  border-color: #00a65a;
  color: white;
  background: #00a65a;
  -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
  transition: all 0.2s ease-in-out;
  float: right;
}
.btnUpdateQuestion:hover {
  background: #01c26b;
  color: #fff;
}
.handleCreated {
  display: flex;
  justify-content: flex-end;
  margin-right: 10px;
  button {
    padding: 5px 8px;
    border: none;
    outline: none;
    border-radius: 3px;
    background: #fdb327;
    -webkit-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    -moz-box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    box-shadow: 0px 4px 8px -3px rgba(128, 128, 128, 1);
    transition: all 0.2s ease-in-out;
  }
  button:hover {
    background: #fdad19;
  }
}
.page-content {
  padding: 0;
}
.page-title-box {
  padding-bottom: 0;
}
.handleEditTime {
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
.headerDetailPage {
  .handleBack {
    align-items: center;
    justify-content: center;
    display: flex;
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
}
.handleBtnModal {
  margin-top: 25px;
  justify-content: flex-end;
  button {
    padding: 6px 15px;
    outline: none;
    border: none;
    border-radius: 7px;
  }
  .btnCancel {
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
  .btnSuccess {
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
.detailInterview {
  .headerDetail {
    font-weight: 600;
    font-family: "Roboto", sans-serif;
    font-size: 18px;
    color: #495057;
    flex: 1;
  }
  .bodyDetail {
    height: auto;
    width: 100%;
    background-color: #ffffff;
    padding: 20px 15px;
    border-radius: 10px;
    border: 1px solid #ccccccd5;
    margin-bottom: 15px;
    .btnHandleSeenCV {
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      border: none;
      padding: 4px 5px;
      border: 1px solid #3480f7;
      margin-left: 8px;
      background-color: #3480f7;
      color: #fff;
      transition: all 0.2s ease-in-out;
       -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
      -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
      box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
      &:hover {
        background-color: #1b71fd;
        color: #fff;
      }
      i {
        margin-right: 5px;
      }
    }
    .iconStyle {
      color: #5b73e8;
    }
    .formCreateGroup {
      margin-bottom: 10px;
      font-family: "Roboto", sans-serif;
    }
    .titleLabel {
      font-size: 15px;
      color: #495057ef;
      font-weight: 600;
    }
    .handleEditStatus {
      margin-left: 15px;
      i {
        cursor: pointer;
      }
    }
  }
}
.inputForm {
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
              background-color: #28c960;
              padding: 2px 10px;
              border-radius: 10px;
              color: white;
            }
          }
        }
        .time {
          margin-top: 5px;
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
      color: #fff;
      background-color: #2749f3;
    }
  }
}
.generalInfor{
  .bodyDetail{
    .row{
      >div{
        @media (max-width: 768px) {
          padding-bottom: 10px;
        }
      }
    }
  }
}

</style>