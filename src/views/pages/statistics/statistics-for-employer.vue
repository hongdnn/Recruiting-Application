
<script>
import Layout from "../../layouts/main";
import Paginate from "vuejs-paginate";
import appConfig from "@/app.config";
import { mapActions } from "vuex";
import D3Funnel from "d3-funnel";
import { mapGetters, mapState } from "vuex";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import * as jwt from "jsonwebtoken";
import { required } from "vuelidate/lib/validators";
export default {
  page: {
    title: "Bảng thống kê",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    Paginate,
  },

  data() {
    return {
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      submitted: false,
      data_statistics: "",
      post: "",
      introduction: "",
      data: "",
      post_data: "",
      currSelect: null,
      checked_all_post: false,
      post_selected_count: 0,
      search_value: "",
      page_index: 1,
      page_size: 5,
      total_pages: 1,
      keyword_type_value: {
        id: 0,
      },
      search_data: {},
      posts: [],
      timer: 0,
      filter_options: [],
      total_count: 0,
      arrChecked: [],
      dataSelectMonth: {
        month: null,
        year: null,
        numberOfMonth: null,
      },
      dataSelectYear: {
        year: null,
        numberOfYear: null,
      },
      dataSelectDate: {
        date: null,
        numberOfDate: null,
      },
      dataSelectWeek: {
        week: null,
        year: null,
        numberOfWeek: null,
      },
      years: [
        "1999",
        "2000",
        "2001",
        "2002",
        "2003",
        "2004",
        "2005",
        "2006",
        "2007",
        "2008",
        "2009",
        "2010",
        "2011",
        "2012",
        "2013",
        "2014",
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
      ],
      form: {
        reportBy: "",
        date: "",
        number: 0,
        statuses: [],
      },
      introductionStatus: [
        {
          name: "Job Refer",
        },
      ],
      isActiveFilter: false,
      reportBy: ["Tháng", "Ngày", "Năm"],
      labelFunnel: [
        { label: "Pending", value: "" },
        { label: "Employer Accept", value: "" },
        { label: "Company Accept", value: "" },
        { label: "Interviewed", value: "" },
        { label: "Offer", value: "" },
        { label: "Onboard", value: "" },
        { label: "Completed", value: "" },
      ],
      series: [
        {
          name: "Job Refer",
          data: [],
        },
        {
          name: "Completed",
          data: [],
        },
        {
          name: "Resign",
          data: [],
        },
        {
          name: "Pending",
          data: [],
        },
        {
          name: "Employer Decline",
          data: [],
        },
        {
          name: "Employer Accept",
          data: [],
        },
        {
          name: "Company Viewed",
          data: [],
        },
        {
          name: "Company Reject",
          data: [],
        },
        {
          name: "Company Accept",
          data: [],
        },
        {
          name: "Send Test",
          data: [],
        },
        {
          name: "Candidate Submit Test",
          data: [],
        },
        {
          name: "Failed Test",
          data: [],
        },
        {
          name: "Passed Test",
          data: [],
        },
        {
          name: "Schedule Interview",
          data: [],
        },
        {
          name: "Candidate Reject Interview",
          data: [],
        },
        {
          name: "Interviewed",
          data: [],
        },
        {
          name: "Failed Interview",
          data: [],
        },
        {
          name: "Offer",
          data: [],
        },
        {
          name: "Onboard",
          data: [],
        },
      ],
      chartOptions: {
        chart: {
          height: 600,
          type: "area",
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          categories: [""],
        },
        colors: [
          "#2E93fA",
          "#66DA26",
          "#34c3bc",
          "#8c34c3",
          "#FF9800",
          "#74788d",
          "#f56c6c",
          "#6cd5f5",
          "#f56cab",
          "#f7ad0742",
          "#8e50f1",
          "#343a40",
          "#446715",
          "#7a0606",
          "#062f7a",
          "#0c635f7d",
          "#c90707ed",
          "#0731c9ed",
          "#c99f07",
        ],

        fill: {
          type: "gradient" / "pattern" / "image",
        },
        // tooltip: {
        //   x: {
        //     format: "dd-MM-yy",
        //   },
        // },
      },
    };
  },
  validations: {
    currSelect: {
      required,
    },
    dataSelectMonth: {
      numberOfMonth: required,
      year: required,
      month: required,
    },
    dataSelectYear: {
      year: required,
      numberOfYear: required,
      numberOfMonth: required,
    },
    dataSelectDate: {
      date: required,
      numberOfDate: required,
    },
  },
  computed: {
    ...mapGetters(
      "statistics",
      ["getStatisticsGetter", "getReportStatisticsGetter"],
      "post",
      ["getSearchPostGetter"]
    ),
    ...mapState(
      "statistics",
      [
        "statisticsData",
        "reportStatisticsData",
        "candidateIntroductionStatusData",
      ],
      "post",
      ["searchData"]
    ),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
    dataReport() {
      return this.getReportStatisticsGetter;
    },
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
    search_data: function () {
      if (this.search_data !== undefined) {
        this.posts = this.search_data.posts;
      }
    },
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "post/searchPostSuccess": {
          this.posts = state.post.searchData.posts;
          this.search_data = state.post.searchData;
          this.total_pages = state.post.searchData.totalPages;
          this.page_index = state.post.searchData.pageIndex + 1;
          break;
        }
        case "statistics/searchReportForStatisticsSuccess": {
          this.data = state.statistics.reportStatisticsData.data;
          this.showResponse();
          break;
        }
        case "statistics/reportCandidateIntroductionStatusByPostSuccess": {
          this.post_data =
            state.statistics.candidateIntroductionStatusData.data;
          // this.reportCandidateIntroductionByPost();
          this.showfunnel();
          break;
        }
        case "statistics/getStatisticsSuccess": {
          this.post = state.statistics.statisticsData.data.post;
          this.introduction = state.statistics.statisticsData.data.introduction;
          break;
        }
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  mounted() {
    this.decodeToken();
    this.searchPost();
    this.sortByFunnel();
    this.reportForStatistics();
    this.getStatisticsInformation();
    this.reportCandidateIntroductionByPost();
  },
  methods: {
    ...mapActions("statistics", [
      "searchReportForStatistics",
      "getStatisticsForEmployer",
      "reportCandidateIntroductionStatusByPost",
    ]),
    ...mapActions("post", ["searchPostsByEmployer", "getData"]),

    decodeToken() {
      var decoded = jwt.verify(this.userStorage.token, "tatool Secret Key");
      this.user_permissions = decoded.permission;
    },

    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },

    searchPost() {
      var status = 0;
      var search_value = this.search_value;
      var page_index = this.page_index - 1;
      var page_size = this.page_size;
      var keyword_type = 0;
      var sort_by = 0;
      this.searchPostsByEmployer({
        status,
        search_value,
        keyword_type,
        page_index,
        page_size,
        sort_by,
      });
    },
    getImageURL(path) {
      return generateApiUrl(path);
    },

    showDetail(post_id) {
      this.$router.push({
        path: "/post-detail?id=" + post_id,
      });
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchPost();
      let listItem = document.getElementsByClassName("custom-control-checkbox");
      for (let i = 0; i < listItem.length; i++) {
        listItem[i].checked = false;
      }
      this.arrChecked = [];
      this.checked_all_post = false;
    },
    // checked_all_post: function () {
    //   if (this.checked_all_post) {
    //     if (this.posts.length > 0) {
    //       this.post_selected_count = this.posts.length;
    //       this.posts.forEach((post) => {
    //         post.isChecked = true;
    //       });
    //     }
    //   } else {
    //     if (this.posts.length > 0) {
    //       this.post_selected_count = 0;
    //       this.posts.forEach((post) => {
    //         post.isChecked = false;
    //       });
    //     }
    //   }
    // },

    showResponse() {
      this.chartOptions.xaxis.categories.splice(
        0,
        this.chartOptions.xaxis.categories.length
      );
      for (let status of this.series) {
        status.data.splice(0, status.data.length);
      }
      for (let response of this.data) {
        this.chartOptions.xaxis.categories.push(response.date);
        if (response.job_refer !== undefined) {
          const status = this.series.find(({ name }) => name === "Job Refer");
          status.data.push(response.job_refer);
        }
        if (response.completed !== undefined) {
          const status = this.series.find(({ name }) => name === "Completed");
          status.data.push(response.completed);
        }
        // if (response.resign !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Resign");
        //   status.data.push(response.resign);
        // }
        // if (response.pending !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Pending");
        //   status.data.push(response.pending);
        // }
        // if (response.employer_decline !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Employer Decline"
        //   );
        //   status.data.push(response.employer_decline);
        // }
        // if (response.employer_accept !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Employer Accept"
        //   );
        //   status.data.push(response.employer_accept);
        // }
        // if (response.company_viewed !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Company Viewed"
        //   );
        //   status.data.push(response.company_viewed);
        // }
        // if (response.company_reject !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Company Reject"
        //   );
        //   status.data.push(response.company_reject);
        // }
        // if (response.company_accept !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Company Accept"
        //   );
        //   status.data.push(response.company_accept);
        // }
        // if (response.send_test !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Send Test");
        //   status.data.push(response.send_test);
        // }
        // if (response.candidate_submit_test !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Candidate Submit Test"
        //   );
        //   status.data.push(response.candidate_submit_test);
        // }
        // if (response.failed_test !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Failed Test");
        //   status.data.push(response.failed_test);
        // }
        // if (response.passed_test !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Passed Test");
        //   status.data.push(response.passed_test);
        // }
        // if (response.schedule_interview !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Schedule Interview"
        //   );
        //   status.data.push(response.schedule_interview);
        // }
        // if (response.candidate_reject_interview !== undefined) {
        //   const status = this.series.find(
        //     ({ name }) => name === "Candidate Reject Interview"
        //   );
        //   status.data.push(response.candidate_reject_interview);
        // }
        if (response.interviewed !== undefined) {
          const status = this.series.find(({ name }) => name === "Interviewed");
          status.data.push(response.interviewed);
        }
        if (response.failed_interview !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Failed Interview"
          );
          status.data.push(response.failed_interview);
        }
        // if (response.offer !== undefined) {
        //   const status = this.series.find(({ name }) => name === "Offer");
        //   status.data.push(response.offer);
        // }
        if (response.onboard !== undefined) {
          const status = this.series.find(({ name }) => name === "Onboard");
          status.data.push(response.onboard);
        }
      }
      window.dispatchEvent(new Event("resize"));
    },

    showMenu() {
      let ele = document.querySelector(".menu");
      let style = document.querySelector(".menu").style.display;
      if (style === "none") {
        ele.style.display = "block";
      } else {
        ele.style.display = "none";
      }
    },
    showfunnel() {
      const options = {
        chart: {
          width: '100%',
          height: 500,
          bottomWidth: 1 / 3,
          bottomPinch: 1,
          inverted: false,
          horizontal: false,
          animate: 1,
          curve: {
            enabled: true,
            height: 50,
            shade: -0.4,
          },
          totalCount: null,
        },
        block: {
          dynamicHeight: true,
          dynamicSlope: true,
          barOverlay: true,
          fill: {
            type: "gradient",
          },
          minHeight: 1,
          highlight: true,
        },
        label: {
          enabled: true,
          fontSize: "18px",
          fill: "#fff",
          /* format: '{l}: {f}' */
          format: function (label, value) {
            if (value == 0) {
              return "";
            } else {
              return label + ":" + value;
            }
          },
        },
        tooltip: {
          enabled: true,
          format: "{l}: {f}",
        },
        events: {
          click: {
            block: null,
          },
        },
      };
      // this.post_data = this.sortByFunnel();
      if (
        this.post_data.pending &&
        this.post_data.employer_accept === undefined &&
        this.post_data.company_accept === undefined &&
        this.post_data.interviewed === undefined &&
        this.post_data.offer === undefined &&
        this.post_data.onboard === undefined &&
        this.post_data.completed === undefined
      ) {
      }
      if (this.post_data.pending != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Pending"
        );
        status.value = this.post_data.pending;
      }
      if (this.post_data.employerAccept != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Employer Accept"
        );
        status.value = this.post_data.employerAccept;
      }
      if (this.post_data.companyAccept != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Company Accept"
        );
        status.value = this.post_data.companyAccept;
      }
      if (this.post_data.interviewed != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Interviewed"
        );
        status.value = this.post_data.interviewed;
      }
      if (this.post_data.offer != undefined) {
        const status = this.labelFunnel.find(({ label }) => label === "Offer");
        status.value = this.post_data.offer;
      }
      if (this.post_data.onboard != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Onboard"
        );
        status.value = this.post_data.onboard;
      }
      if (this.post_data.completed != undefined) {
        const status = this.labelFunnel.find(
          ({ label }) => label === "Completed"
        );
        status.value = this.post_data.completed;
      }
      // const handleData= this.labelFunnel.find(({ value })=>value.sort());

      const chart = new D3Funnel("#funnel");

      chart.draw(this.labelFunnel, options);
    },
    getStatisticsInformation() {
      this.getStatisticsForEmployer();
    },

    reportForStatistics() {
      this.submitted = true;
      this.$v.$touch();
      let data = this.convertDataBeforeGetAPI();
      if (data) {
        this.searchReportForStatistics(data);
      }
    },

    sortByFunnel() {
      var sortable = [];
      for (var value in this.post_data) {
        sortable.push([value, this.post_data[value]]);
      }

      sortable.sort(function (a, b) {
        return a[1] - b[1];
      });
      return sortable;
    },
    getLastDate(date) {
      return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    },
    formatDate(date) {
      var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
    convertDataBeforeGetAPI() {
      this.form.statuses = this.series.map((value) => {
        return value["name"];
      });

      var statuses = this.form.statuses;
      const tempObjectTime = {
        reportBy: null,
        date: null,
        number: null,
        statuses: statuses,
      };

      if (this.currSelect == null) {
        {
          tempObjectTime.reportBy = "date";
          tempObjectTime.number = 10;
          tempObjectTime.date = this.formatDate(Date(Date.now()));
        }
      } else {
        switch (this.currSelect) {
          case "month":
            {
              const { year, month, numberOfMonth } = this.dataSelectMonth;
              let newMonth = month < 10 ? "0" + month : month;
              let lastDay = this.getLastDate(new Date(year, month, 15));
              tempObjectTime.date = (
                year +
                "-" +
                newMonth +
                "-" +
                lastDay
              ).toString();
              tempObjectTime.reportBy = this.currSelect;
              tempObjectTime.number = +numberOfMonth;
            }
            break;

          case "year":
            {
              let date = new Date(
                this.dataSelectYear.year,
                12 - 1,
                31
              ).toLocaleDateString("en-CA");
              tempObjectTime.reportBy = this.currSelect;
              tempObjectTime.number = this.dataSelectYear.numberOfYear;
              tempObjectTime.date = date;
            }
            break;

          case "date":
            {
              tempObjectTime.reportBy = this.currSelect;
              tempObjectTime.number = this.dataSelectDate.numberOfDate;
              tempObjectTime.date = this.dataSelectDate.date;
            }
            break;
        }
      }
      return tempObjectTime;
    },
    reportCandidateIntroductionByPost() {
      this.submitted = true;

      const post_id = this.arrChecked;
      const post_ids = JSON.parse(JSON.stringify(post_id));

      const data = {
        post_ids,
      };
      if (data) {
        this.reportCandidateIntroductionStatusByPost(data);
      }
    },
    unique(arr) {
      return Array.from(new Set(arr)); //
    },
    clickCheckBoxAll(e) {
      this.checked_all_post = !this.checked_all_post;
      if (e.target.checked) {
        this.arrChecked = [];
        this.posts.forEach((item) => {
          this.arrChecked.push(item.id);
        });
      } else if (!e.target.checked) {
        this.arrChecked = [];
      }
      this.reportCandidateIntroductionByPost();
    },

    clickCheckBoxSingle(e, id) {
      if (this.checked_all_post) {
        this.checked_all_post = false;
        this.arrChecked = [];
      }
      if (e.target.checked) {
        if (this.arrChecked.length < 1) {
          this.arrChecked.push(id);
        } else if (this.arrChecked.length > 0) {
          var count = 0;
          for (let i = 0; i < this.arrChecked.length; i++) {
            count++;
            if (id === this.arrChecked[i]) {
              break;
            }
          }
          if (count == this.arrChecked.length) {
            this.arrChecked.push(id);
            if (this.arrChecked.length === 5) {
              this.checked_all_post = true;
            }
          }
        }
      } else if (!e.target.checked) {
        this.arrChecked = this.arrChecked.filter((ids) => ids !== id);
      }
      this.reportCandidateIntroductionByPost();
    },
  },
  reset() {
    Object.assign(this.$data, this.$options.data.apply(this));
  },
};
</script>
<template>
  <Layout>
    <div id="main">
      <div class="d-flex align-items-center">
        <div class="headerDetailPage d-flex align-items-center" style="flex: 1">
          <i
            class="far fa-chart-bar"
            style="font-size: 22px; margin-right: 5px"
          ></i>
          <div class="titleHeader">
            <span>Bảng thống kê</span>
          </div>
        </div>
      </div>
      <div class="statisticsMain">
        <div class="row mt-3">
          <div class="col-12 statisticsContent d-flex flex-wrap justify-content-between">
            <div class="col-md-6 col-12 statisticsContent__jobTotal">
              <div class="job">
                <div class="d-flex f contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity">
                      <h3>{{ post.total }}</h3>
                    </div>
                    <div class="textTotal"><span>Tổng số công việc</span></div>
                    <div class="active">
                      <span
                        >Hoạt động:
                        <strong>{{ post.active }}</strong>
                      </span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="fas fa-briefcase"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <a href="./manage-post">
                    <div style="padding: 3px 0;color: black">
                      <span>Xem chi tiết</span
                      ><i class="fas fa-arrow-circle-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-12 statisticsContent__recommendTotal">
              <div class="refer">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity">
                      <h3>{{ introduction.total }}</h3>
                    </div>
                    <div class="textTotal">
                      <span>Tổng số lần giới thiệu</span>
                    </div>
                    <div class="active d-flex" style="align-items: center">
                      <span
                        >Đòng ý:
                        <strong>{{ introduction.accept }}</strong>
                      </span>
                      <span style="margin-left: 8px"
                        >Phỏng vấn:
                        <strong>{{ introduction.interviewed }}</strong>
                      </span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="far fa-handshake"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <a href="./manage-candidate">
                    <div style="padding: 3px 0;color: black">
                      <span>Xem chi tiết</span
                      ><i class="fas fa-arrow-circle-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="col-12 statisticsContent d-flex mt-4">
            <div class="col-6" style="padding-right: 13px">
              <div class="bonus">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity"><h3>12200</h3></div>
                    <div class="textTotal">
                      <span>Tổng số tiền thưởng</span>
                    </div>
                    <div class="active">
                      <span>Placement: <strong>1301203</strong></span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="fas fa-dollar-sign"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <div style="padding: 3px 0">
                    <span>Xem chi tiết</span
                    ><i class="fas fa-arrow-circle-right"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6" style="padding-left: 13px">
              <div class="job">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity"><h3>5</h3></div>
                    <div class="textTotal"><span>Tổng số ứng viên</span></div>
                    <div class="active">
                      <span>--- <strong></strong></span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="fas fa-users"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <div style="padding: 3px 0">
                    <span>Xem chi tiết</span
                    ><i class="fas fa-arrow-circle-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
      <div
        class="referReports"
      
      >
        <div  v-if="
          checkPermisstion('statistic.all')">
          <div class="headerReport">
            <h2 class="mt-3 text-center">Báo cáo giới thiệu</h2>
          </div>
          <div class="bodyReports">
            <apexchart
              ref="apexChart"
              type="area"
              height="600"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </div>
          <div class="selection">
            <div class="inputSelection">
              <div class="row">
                <div
                  class="col-12 d-flex inputContent flex-wrap"
                  v-if="isActiveFilter"
                >
                  <div class="col-sm-3 col-12" style="padding: 0 12px">
                    <span>Báo cáo qua:</span>
                    <select
                      name=""
                      id=""
                      style="width: 100%"
                      v-model="currSelect"
                      :class="{
                        'is-invalid': submitted && $v.currSelect.$error,
                      }"
                    >
                      <option value="month">{{ reportBy[0] }}</option>
                      <option value="date">{{ reportBy[1] }}</option>
                      <option value="year">{{ reportBy[2] }}</option>
                    </select>
                    <div
                      v-if="submitted && $v.currSelect.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.currSelect.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'month'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Tháng:</span>
                    <select
                      v-model="dataSelectMonth.month"
                      name=""
                      id=""
                      style="width: 100%"
                      value=""
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectMonth.month.$error,
                      }"
                    >
                      <option v-for="ele in 12" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectMonth.month.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectMonth.month.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                    <select
                      v-if="currSelect === 'year'"
                      v-model="dataSelectYear.numberOfMonth"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectYear.numberOfMonth.$error,
                      }"
                    >
                      <option v-for="ele in 36" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectYear.numberOfMonth.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectYear.numberOfMonth.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'month'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Năm:</span>
                    <select
                      v-model="dataSelectMonth.year"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectMonth.year.$error,
                      }"
                    >
                      <option v-for="ele in years" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectMonth.year.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectMonth.year.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'month'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Số tháng:</span>
                    <select
                      v-model="dataSelectMonth.numberOfMonth"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectMonth.numberOfMonth.$error,
                      }"
                    >
                      <option v-for="ele in 12" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="
                        submitted && $v.dataSelectMonth.numberOfMonth.$error
                      "
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectMonth.numberOfMonth.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'date'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Ngày:</span>
                    <input
                      class="form-control"
                      type="date"
                      v-model="dataSelectDate.date"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectDate.date.$error,
                      }"
                    />
                    <div
                      v-if="submitted && $v.dataSelectDate.date.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectDate.date.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'date'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Số ngày:</span>
                    <select
                      v-model="dataSelectDate.numberOfDate"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectDate.numberOfDate.$error,
                      }"
                    >
                      <option v-for="ele in 31" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectDate.numberOfDate.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectDate.numberOfDate.required"
                        >Mục này không được bỏ trống *</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="currSelect === 'Week'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Week:</span>
                    <select
                      v-model="dataSelectWeek.week"
                      name=""
                      id=""
                      style="width: 100%"
                    >
                      <option v-for="ele in 52" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                  </div>
                  <div
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                    v-if="currSelect === 'Week'"
                  >
                    <span>Year:</span>
                    <select
                      v-model="dataSelectWeek.year"
                      name=""
                      id=""
                      style="width: 100%"
                    >
                      <option v-for="ele in years" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                  </div>
                  <div
                    v-if="currSelect === 'Week'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Number of Week:</span>

                    <select
                      v-model="dataSelectWeek.numberOfWeek"
                      name=""
                      id=""
                      style="width: 100%"
                    >
                      <option v-for="ele in 52" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                  </div>
                  <div
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                    v-if="currSelect === 'year'"
                  >
                    <span>Year:</span>
                    <select
                      v-model="dataSelectYear.year"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectYear.year.$error,
                      }"
                    >
                      <option v-for="ele in years" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectYear.year.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectYear.year.required"
                        >Tên công ty không được bỏ trống *</span
                      >
                    </div>
                  </div>

                  <div
                    v-if="currSelect === 'year'"
                    class="col-sm-3 col-12"
                    style="padding: 0 12px"
                  >
                    <span>Số năm:</span>
                    <select
                      v-model="dataSelectYear.numberOfYear"
                      name=""
                      id=""
                      style="width: 100%"
                      :class="{
                        'is-invalid':
                          submitted && $v.dataSelectYear.numberOfYear.$error,
                      }"
                    >
                      <option v-for="ele in 52" v-bind:key="ele">
                        {{ ele }}
                      </option>
                    </select>
                    <div
                      v-if="submitted && $v.dataSelectYear.numberOfYear.$error"
                      class="invalid-feedback"
                    >
                      <span v-if="!$v.dataSelectYear.numberOfYear.required"
                        >Tên công ty không được bỏ trống *</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="
                d-flex
                align-items-center
                mt-2
                flex-wrap-reverse
                justify-content-end
              "
            >
              <!-- <button @click="reset" style="margin-right: 8px">
              Click to reset
            </button> -->
              <button
                v-on:click="reportForStatistics()"
                v-if="isActiveFilter"
                style="margin-right: 0.25rem"
                class="btn btn-primary"
              >
                <i class="fa fa-search" aria-hidden="true"></i> Tìm kiếm
              </button>
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  v-on:click="isActiveFilter = !isActiveFilter"
                  style="height: 17px; width: 17px"
                />
              </div>
              <span style="margin: 0 11px 0 7px">Bộ lọc nâng cao</span>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div id="funnel" style="transform: rotate(0deg)"></div>
              </div>
              <div class="col-md-6">
                <div class="mat-table-statistic">
                  <div
                    class="mat-table-search"
                    style="width: 100%"
                    @submit.prevent="searchPost"
                  >
                    <input
                      v-model="search_value"
                      class="mat-table-input"
                      type="text"
                      placeholder="Nhập tên công việc ..."
                      style="width: 100%"
                    />
                  </div>
                  <div class="tableContent">
                    <div class="headerTable d-flex">
                      <span
                        style="
                          flex: 1;
                          font-size: 12px;
                          color: rgba(0, 0, 0, 0.54);
                        "
                        ><i
                          class="fas fa-info-circle"
                          style="margin-right: 3px"
                        ></i
                        >Nhấp vào tiêu đề cột để sắp xếp dữ liệu
                      </span>
                      <div class="selectedItem">
                        <span
                          style="color: rgba(0, 0, 0, 0.54); margin-right: 5px"
                          >Selected:</span
                        >{{ arrChecked.length }}
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
                                :checked="checked_all_post"
                                v-on:change="clickCheckBoxAll($event)"
                              />
                            </div>
                          </td>
                          <td>Công việc</td>
                        </tr>

                        <tbody class="dataTableRender">
                          <div
                            class="trMain"
                            v-for="(postValue, index) in posts"
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
                                  :checked="checked_all_post"
                                  v-on:change="
                                    clickCheckBoxSingle($event, postValue.id)
                                  "
                                />
                              </div>
                            </td>
                            <td>
                              <div class="d-flex">
                                <div
                                  class="col-auto imgStatistics__hovernow"
                                  style="height: auto"
                                >
                                  <img
                                    class="imageStatisticsStyle"
                                    :src="getImageURL(postValue.company_image)"
                                  />
                                </div>
                                <div style="margin-left: 10px">
                                  <div v-on:click="showDetail(postValue.id)">
                                    <span class="nameUser">{{
                                      postValue.title
                                    }}</span>
                                    <div style="margin-top: 5px">
                                      <span
                                        v-if="postValue.urgency"
                                        class="urgentRecruitment rounded-pill"
                                        >Tuyển gấp</span
                                      >
                                    </div>
                                  </div>
                                  <div style="margin-top: 5px">
                                    <span class="">{{
                                      postValue.company_name
                                    }}</span>
                                  </div>
                                  <div style="margin-top: 5px">
                                    <span class="moneyInterview"
                                      ><i class="fas fa-star"></i
                                      >{{ postValue.commission }}
                                      {{ postValue.currency }}</span
                                    >/ứng viên
                                  </div>
                                  <div
                                    class="statusJob"
                                    style="margin-top: 5px"
                                  >
                                    <span
                                      v-if="postValue.status == 'active'"
                                      class="
                                        statusPendding
                                        statusActive
                                        rounded-pill
                                      "
                                      >Active</span
                                    >
                                    <span
                                      v-if="postValue.status == 'closed'"
                                      class="statusClose rounded-pill"
                                      >Closed</span
                                    >
                                    <span
                                      v-if="postValue.status == 'pause'"
                                      class="statusPause rounded-pill"
                                      >Pause</span
                                    >
                                  </div>
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
                            <!-- <td>
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
                          </td> -->
                          </div>
                        </tbody>
                      </table>
                    </div>
                    <div class="pagingItem d-flex align-items-center">
                      <paginate
                        :page-count="total_pages"
                        :click-handler="clickCallback"
                        :prev-text="'Trước'"
                        :next-text="'Sau'"
                        :container-class="'pagination'"
                        :active-class="'pagination-active'"
                        :page-link-class="'pagination-item'"
                        v-model="page_index"
                      >
                      </paginate>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<style lang="scss">
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
.mat-table-statistic {
  margin-top: 20px;
  .imageStatisticsStyle {
    width: 180px;
    height: 100%;
    padding: 10px;
  }
  .mat-table-search {
    .mat-table-input {
      outline: none;
      border-radius: 4px;
      padding: 0 10px;
      height: 35px;
      border: 1px solid #ccc;
      color: #495057;
      &:focus {
        border: 1px solid #5b73e8;
      }
    }
  }

  .tableContent {
    margin-top: 15px;
    background-color: #fff;
    border-radius: 7px;
    border: 1px solid #eae9e9;
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
              background: rgb(107, 189, 107) !important;
              color: #ffff !important;
            }
            .statusPause {
              background: rgb(255, 165, 86) !important;
              color: #fff !important;
            }
            .statusClose {
              background: rgb(226, 104, 105) !important;
              color: #fff !important;
            }
            .statusPendding {
              color: #fff;
              background: rgb(98, 160, 203);
            }
            .statusOffer {
              color: #fff;
              background: rgb(180, 149, 209);
            }
            .statusOnboard {
              background: rgb(175, 137, 129);
              color: #fff;
            }
            .statusComplated {
              background: rgb(235, 160, 212);
              color: #ffffff;
            }
          }
          .trMain {
            display: table-row;
            position: relative;
            height: 180px;
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
}
#funnel {
  background: #ececec;
  border-radius: 10px;
  margin-top: 1.2rem;

  text{
    @media (max-width: 768px) {
      font-size: 15px;
    }
    @media (max-width: 500px) {
      font-size: 14px;
    }
    @media (max-width: 450px) {
      font-size: 13px;
    }
  }
}
#funnelPanel {
  width: 600px;
  margin: 0 auto;
  text {
    font-weight: 900;
  }
}
.selection {
  .inputSelection {
    .inputContent {
      span {
        font-family: "Roboto", sans-serif;
        font-size: 14px;
        color: #495057;
      }
      select {
        height: 30px;
        padding: 5px 10px;
        outline: none;
        border-radius: 4px;
        border: 1px solid #ccc;
        color: #495057;
      }
    }
  }
}
.referReports {
  height: auto;
  margin-top: 20px;
  padding: 15px 8px;
  background: #fff;
  box-shadow: 0 -1px 1px rgba(0, 0, 0, 0.08), 1px 0 1px rgba(0, 0, 0, 0.08),
    -1px 0 1px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.08) !important;
  border: none !important;
  border-radius: 0.4rem;
  .menuAction {
    position: relative;
    .line {
      background-color: #5b73e8;

      border-top: 1px solid rgb(153, 153, 153);
      height: 1px;
    }

    .menu {
      right: 10px;
      display: none;
      position: absolute;
      -webkit-box-shadow: 2px 1px 15px -6px rgba(0, 0, 0, 0.75);
      -moz-box-shadow: 2px 1px 15px -6px rgba(0, 0, 0, 0.75);
      box-shadow: 2px 1px 15px -6px rgba(0, 0, 0, 0.75);
      .list1 {
        border-right: 1px solid rgb(153, 153, 153);
        border-top: 1px solid rgb(153, 153, 153);
        border-left: 1px solid rgb(153, 153, 153);
      }
      .list2 {
        border-right: 1px solid rgb(153, 153, 153);
        border-bottom: 1px solid rgb(153, 153, 153);
        border-left: 1px solid rgb(153, 153, 153);
      }
      ul {
        margin: 0px;
        padding: 5px 0px;
        border: none;
        background: rgb(255, 255, 255);
        margin: 0 !important;
        z-index: 99;
        li {
          list-style: none;
          padding: 3px 10px;
          font-size: 13px;
          font-weight: 400;
          color: #495057;
          cursor: pointer;
          transition: background 250ms ease 0s, color 250ms ease 0s;
          &:hover {
            color: #fff;

            background: rgb(51, 92, 173);
          }
        }
      }
    }
    i {
      font-size: 20px;
      color: #495057;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      &:hover {
        color: #313436;
      }
    }
  }
}
.statisticsMain {
  .statisticsContent {
    &__jobTotal{
      padding-right: 13px;
      @media (max-width: 768px) {
        padding-right: 0;
      }
    }
    &__recommendTotal{
      padding-left: 13px;
      @media (max-width: 768px) {
        padding-top: 15px;
        padding-left: 0;
      }
    }
    .refer {
      background-color: #00a65a !important;
    }
    .job {
      background-color: #5b73e8 !important;
    }
    .bonus {
      background-color: #f5b34e !important;
    }
    .job,
    .refer,
    .bonus {
      height: auto;
      border-radius: 5px;
      &:hover {
        .iconJob {
          i {
            font-size: 90px;
            transform: scale(1.1, 1.1);
          }
        }
      }
      .contentJob {
        padding: 10px;
        .quantity {
          h3 {
            font-size: 38px;
            color: #fff;
            font-family: "Roboto", sans-serif;
            font-weight: 550;
          }
        }
        .textTotal {
          span {
            font-size: 17.5px;
            color: #fff;
            font-family: "Roboto", sans-serif;
            font-weight: 550;
          }
        }
        .active {
          span {
            font-size: 15px;
            letter-spacing: 1.1px;
            color: #fff;
            font-family: "Roboto", sans-serif;
          }
        }
        .iconJob {
          display: flex;
          justify-content: flex-end;

          i {
            font-size: 80px;
            margin-right: 15px;
            color: rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease-in-out;
            cursor: pointer;
          }
        }
      }
      .seenDetail {
        margin-top: 5px;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.1);
        color: #ffffff;
        font-family: "Roboto", sans-serif;
        &:hover {
          background: rgba(0, 0, 0, 0.2);
          color: #5b72e8be;
        }
        span {
          padding: 3px 0;
        }
        i {
          margin-left: 10px;
        }
      }
    }
  }
}
.pagination a {
  float: left;
  padding: 8px 16px;
  text-decoration: none;
  border: 1px solid #ddd;
  font-size: 1em;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 5px;
  color: #4e4e4e;
  background-color: white;
}
.pagination-active a {
  background-color: #5b73e8;
  color: white;
}
.pagination-item {
  color: #4e4e4e;
  background-color: white;
}

.pagination a:hover:not(.active) {
  background-color: #5b73e8;
  color: white;
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
  .titleHeader {
    span {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: #495057;
      font-weight: 600;
    }
  }
}
.table-scroll {
  $min-width-desktop: 1366px;
  @media (max-width: #{$min-width-desktop - 0.02px}) {
    overflow-x: auto;
  }
  table {
    th {
      white-space: nowrap;
    }
  }
}
</style>
