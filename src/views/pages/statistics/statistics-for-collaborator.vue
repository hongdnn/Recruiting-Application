<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import { mapActions, mapGetters, mapState } from "vuex";

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
    
  },
  data() {
    return {
      data: "",
      post: "",
      introduction: "",
      candidate: "",
      currSelect: null,
      checked_all_post: false,
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
          height: 300,
          type: "area",
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          type: "category",
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
        tooltip: {
          x: {
            format: "dd-MM-yy",
          },
        },
      },
    };
  },

  computed: {
    ...mapGetters("statistics", [
      "getStatisticsCollabGetter",
      "getReportStatisticsGetter",
    ]),
    ...mapState("statistics", ["statisticsCollabData", "reportStatisticsData"]),
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
        case "statistics/getStatisticsCollaboratorSuccess": {
          this.post = state.statistics.statisticsCollabData.data.post;
          this.introduction = state.statistics.statisticsCollabData.data.introduction;
          this.candidate = state.statistics.statisticsCollabData.data.candidate;
          break;
        }
        case "statistics/searchReportForStatisticsSuccess": {
          this.data = state.statistics.reportStatisticsData.data;
          this.showResponse();
          break;
        }
      }
    });
  },
  mounted() {
    this.getStatisticsInformation();
    this.reportForStatistics();
    this.showResponse();
  },
  methods: {
    ...mapActions("statistics", [
      "getStatisticsForCollaborator",
      "searchReportForStatistics",
    ]),
    reset() {
      this.chartOptions.xaxis.categories = [];
      this.series = [];
    },
    
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
        if (response.resign !== undefined) {
          const status = this.series.find(({ name }) => name === "Resign");
          status.data.push(response.resign);
        }
        if (response.pending !== undefined) {
          const status = this.series.find(({ name }) => name === "Pending");
          status.data.push(response.pending);
        }
        if (response.employer_decline !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Employer Decline"
          );
          status.data.push(response.employer_decline);
        }
        if (response.employer_accept !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Employer Accept"
          );
          status.data.push(response.employer_accept);
        }
        if (response.company_viewed !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Company Viewed"
          );
          status.data.push(response.company_viewed);
        }
        if (response.company_reject !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Company Reject"
          );
          status.data.push(response.company_reject);
        }
        if (response.company_accept !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Company Accept"
          );
          status.data.push(response.company_accept);
        }
        if (response.send_test !== undefined) {
          const status = this.series.find(({ name }) => name === "Send Test");
          status.data.push(response.send_test);
        }
        if (response.candidate_submit_test !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Candidate Submit Test"
          );
          status.data.push(response.candidate_submit_test);
        }
        if (response.failed_test !== undefined) {
          const status = this.series.find(({ name }) => name === "Failed Test");
          status.data.push(response.failed_test);
        }
        if (response.passed_test !== undefined) {
          const status = this.series.find(({ name }) => name === "Passed Test");
          status.data.push(response.passed_test);
        }
        if (response.schedule_interview !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Schedule Interview"
          );
          status.data.push(response.schedule_interview);
        }
        if (response.candidate_reject_interview !== undefined) {
          const status = this.series.find(
            ({ name }) => name === "Candidate Reject Interview"
          );
          status.data.push(response.candidate_reject_interview);
        }
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
        if (response.offer !== undefined) {
          const status = this.series.find(({ name }) => name === "Offer");
          status.data.push(response.offer);
        }
        if (response.onboard !== undefined) {
          const status = this.series.find(({ name }) => name === "Onboard");
          status.data.push(response.onboard);
        }
      }
      window.dispatchEvent(new Event("resize"));
    },

    async reportForStatistics() {
      this.submitted = true;

      let data = this.convertDataBeforeGetAPI();
      
      if (data) {
        await this.searchReportForStatistics(data);
      } 
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

    showMenu() {
      let ele = document.querySelector(".menu");
      let style = document.querySelector(".menu").style.display;
      if (style === "none") {
        ele.style.display = "block";
      } else {
        ele.style.display = "none";
      }
    },
    
    async getStatisticsInformation() {
      await this.getStatisticsForCollaborator();
    },
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
          <div class="col-12 statisticsContent row">
            <div class="col-lg-6 col-12 statisticsContent__item">
              <div class="job">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity">
                      <h3>{{ post.total }}</h3>
                    </div>
                    <div class="textTotal"><span>Tổng số công việc</span></div>
                    <div class="active__statistic">
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
                  <a href="./manage-post-for-collaborator">
                    <div style="padding: 3px 0; color:black">
                      <span>Xem chi tiết</span
                      ><i class="fas fa-arrow-circle-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div class="col-lg-6 col-12 statisticsContent__item">
              <div class="refer">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity">
                      <h3>{{ introduction.total }}</h3>
                    </div>
                    <div class="textTotal">
                      <span>Tổng số lần giới thiệu</span>
                    </div>
                    <div
                      class="active__statistic d-flex flex-wrap"
                      style="align-items: center"
                    >
                      <span style="margin-right: 8px"
                        >Đòng ý:
                        <strong>{{
                          introduction.accept
                        }}</strong>
                      </span>
                      <span
                        >Phỏng vấn:
                        <strong>{{
                          introduction.interviewed
                        }}</strong>
                      </span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="far fa-handshake"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <a href="./manage-refer-candidate-collaborator">
                    <div style="padding: 3px 0;color:black">
                      <span>Xem chi tiết</span
                      ><i class="fas fa-arrow-circle-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <!-- <div class="col-lg-6 col-12 statisticsContent__item">
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
            </div> -->
            <div class="col-lg-6 col-12 statisticsContent__item">
              <div class="bonus">
                <div class="d-flex contentJob">
                  <div class="col-7" style="flex: 1">
                    <div class="quantity">
                      <h3>{{ candidate.total }}</h3>
                    </div>
                    <div class="textTotal"><span>Tổng số ứng viên</span></div>
                    <div class="active__statistic">
                      <span>--- <strong></strong></span>
                    </div>
                  </div>
                  <div class="iconJob col-3">
                    <i class="fas fa-users"></i>
                  </div>
                </div>
                <div class="seenDetail text-center">
                  <a href="./manage-candidate-for-collaborator">
                    <div style="padding: 3px 0;color:black">
                      <span>Xem chi tiết</span
                      ><i class="fas fa-arrow-circle-right"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="referReports">
        <div class="headerReport">
          <h2 class="mt-3 text-center">Báo cáo giới thiệu</h2>
        </div>
        <div class="bodyReports" @change="reportForStatistics()">
          <apexchart
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
                  >
                    <option value="month">{{ reportBy[0] }}</option>
                    <option value="date">{{ reportBy[1] }}</option>
                    <option value="year">{{ reportBy[2] }}</option>
                  </select>
                </div>
                <div v-if="currSelect === 'month'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Tháng:</span>
                  <select
                    v-model="dataSelectMonth.month"
                    name=""
                    id=""
                    style="width: 100%"
                    value=""
                  >
                    <option v-for="ele in 12" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>

                  <select
                    v-if="currSelect === 'year'"
                    v-model="dataSelectYear.numberOfMonth"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in 36" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>
                <div v-if="currSelect === 'month'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Year:</span>
                  <select
                    v-model="dataSelectMonth.year"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in years" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>
                <div v-if="currSelect === 'month'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Số tháng:</span>
                  <select
                    v-model="dataSelectMonth.numberOfMonth"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in 12" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>
                <div v-if="currSelect === 'date'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Ngày:</span>
                  <input
                    class="form-control"
                    type="date"
                    v-model="dataSelectDate.date"
                  />
                </div>
                <div v-if="currSelect === 'date'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Số ngày:</span>
                  <select
                    v-model="dataSelectDate.numberOfDate"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in 31" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>
                <div v-if="currSelect === 'Week'" class="col-sm-3 col-12"
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
                <div class="col-sm-3 col-12" style="padding: 0 12px"
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
                <div v-if="currSelect === 'Week'" class="col-sm-3 col-12"
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
                <div class="col-sm-3 col-12"
                  style="padding: 0 12px"
                  v-if="currSelect === 'year'"
                >
                  <span>Năm:</span>
                  <select
                    v-model="dataSelectYear.year"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in years" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>

                <div v-if="currSelect === 'year'" class="col-sm-3 col-12"
                  style="padding: 0 12px"
                >
                  <span>Số năm:</span>
                  <select
                    v-model="dataSelectYear.numberOfYear"
                    name=""
                    id=""
                    style="width: 100%"
                  >
                    <option v-for="ele in 52" v-bind:key="ele">
                      {{ ele }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div
            class="
              d-flex
              flex-wrap
              align-items-center
              mt-2
              flex-wrap-reverse
              justify-content-end
            "
          >
            <!-- <button @click="reset" style="margin-right: 8px">
              Click to reset
            </button> -->

            <div
              class="custom-control custom-checkbox"
              style="margin-bottom: 3px"
            >
              <button
                type="reset"
                v-on:click="reportForStatistics(e)"
                v-if="isActiveFilter"
                style="margin-right: 0.25rem"
                class="btn btn-primary"
              >
                <i class="fa fa-search" aria-hidden="true"></i> Tìm kiếm
              </button>
              <input
                type="checkbox"
                class="custom-control-input"
                v-on:click="isActiveFilter = !isActiveFilter"
                style="height: 17px; width: 17px"
              />
            </div>
            <span style="margin: 0 11px 0 7px">Bộ lọc nâng cao</span>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
<style lang="scss">
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
      input {
        height: 30px;
        padding: 5px 10px;
        outline: none;
        border-radius: 4px;
        border: 1px solid #ccc;
        color: #495057;
        width: 100%;
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
    padding-right: 0;

    &__item {
      padding-right: 0;
      padding-bottom: 1.25rem;
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
        .active__statistic {
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

            @media screen and (max-width: 375px) {
              font-size: 60px;
            }
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
</style>
