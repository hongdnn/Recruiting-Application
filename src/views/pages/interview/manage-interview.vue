<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
import moment from "moment";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
export default {
  page: {
    title: "Danh sách phỏng vấn",
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
    Paginate,
  },
  data() {
    return {
      title: "Danh sách phỏng vấn",
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      statuses: [
        "chờ phỏng vấn",
        "đang phỏng vấn",
        "hủy phỏng vấn",
        "phỏng vấn thành công",
        "phỏng vấn thất bại",
      ],
      selectStatus: null,
      // companies
      companies: [],
      //interview schedules
      schedules: [],
      company: [],
      selectCompany: null,
      totalPages: 0,
      totalCount: 0,
      keyword: "",
      company_id: 0,
      status: 0,
      sort_by: -1,
      //Pending date
      listPending: [],
      pending: "",
      //Sort
      sorts: [
        {
          id: -1,
          name: "Ngày giới thiệu(giảm dần)",
        },
        {
          id: 1,
          name: "Ngày giới thiệu(tăng dần)",
        },
        {
          id: -2,
          name: "Thời gian bắt đầu(giảm dần)",
        },
        {
          id: 2,
          name: "Thời gian bắt đầu(tăng dần)",
        },
        {
          id: -3,
          name: "Thời gian kết thúc(giảm dần)",
        },
        {
          id: 3,
          name: "Thời gian kết thúc(tăng dần)",
        },
      ],
      sort: {
        id: -1,
        name: "Ngày giới thiệu(giảm dần)",
      },
      //Show list status
      listStatuses: [],
      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,
      //Response data
      introductions: [],
    };
  },
  computed: {
    dataCompany() {
      return this.getCompanyGetter;
    },
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.searchInterview();
    this.getCompaniesForFilter();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "company/postSuccess": {
          this.companies = state.company.company_data.companies;
          break;
        }
        case "interview/searchInterviewSuccess": {
          this.schedules = state.interview.searchData.schedules;
          this.totalCount = state.interview.searchData.totalCount;
          this.total_pages = state.interview.searchData.totalPages;
          this.page_index = state.interview.searchData.pageIndex + 1;
          this.getListStatuses();
          this.setPendingTime();
          break;
        }
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    keyword: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchInterview();
      }, 800);
    },
    company_id: function () {
      this.searchInterview();
    },
    status: function () {
      this.searchInterview();
    },
    sort_by: function () {
      this.searchInterview();
    },
  },
  methods: {
    ...mapActions("company", ["getCompanyInformation"]),
    ...mapActions("interview", ["searchInterviewByEmployer"]),

    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },

    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },

    getCompaniesForFilter() {
      this.getCompanyInformation();
    },
    setPendingTime() {
      let currentDate = new Date().getTime();
      for (let schedule of this.schedules) {
        if (schedule.interview_start_date <= currentDate) {
          schedule.pending_date = "";
        } else {
          const duration = moment.duration(
            schedule.interview_start_date - currentDate,
            "milliseconds"
          );
          schedule.pending_date =
            duration.days() +
            " ngày " +
            duration.hours() +
            " giờ " +
            duration.minutes() +
            " phút";
        }
      }
    },

    inputCompanies(values) {
      this.company_id = 0;
      if (values.length > 0) {
        this.company_id = values[0].id;
        for (let i = 1; i < values.length; i++) {
          this.company_id += "," + values[i].id;
        }
      }
    },
    inputStatus: function (value) {
      if (value === null) {
        this.status = 0;
      } else if (value === "chờ phỏng vấn") {
        this.status = 1;
      } else if (value === "đang phỏng vấn") {
        this.status = 2;
      } else if (value === "hủy phỏng vấn") {
        this.status = 3;
      } else if (value === "phỏng vấn thành công") {
        this.status = 4;
      } else if (value === "phỏng vấn thất bại") {
        this.status = 5;
      }
    },
    getListStatuses() {
      this.listStatuses = [];
      for (let schedule of this.schedules) {
        if (schedule.status === "waiting interview") {
          this.listStatuses.push("chờ phỏng vấn");
        } else if (schedule.status === "interviewing") {
          this.listStatuses.push("đang phỏng vấn");
        } else if (schedule.status === "cancel interview") {
          this.listStatuses.push("hủy phỏng vấn");
        } else if (schedule.status === "interview success") {
          this.listStatuses.push("phỏng vấn thành công");
        } else if (schedule.status === "interview failed") {
          this.listStatuses.push("phỏng vấn thất bại");
        }
      }
    },
    inputSort: function (value) {
      this.sort_by = value.id;
       if (value.length > 0) {
        this.sort_by = value[0].id;
        for (let i = 1; i < value.length; i++) {
          this.sort_by += "," + value[i].id;
        }
      }
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchInterview();
    },

    searchInterviewButtonAction() {
      if (this.checkPermisstion("interview.all") || this.checkPermisstion("interview.search")) {
        this.searchInterview();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },

    searchInterview() {
      const keyword = this.keyword;

      const company_id = this.company_id;
      const status = this.status;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort_by;

      this.searchInterviewByEmployer({
        keyword,
        company_id,
        status,
        page_index,
        page_size,
        sort_by,
      });
    },

    // getDateString(timestamp) {
    //   var date = new Date(timestamp);
    //   return (
    //     date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    //   );
    // },

    showDetail(interview_id) {
      if (
        !(
          this.checkPermisstion("interview.all") ||
          this.checkPermisstion("interview.detail")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.$router.push({
        path: "./interview-detail?id=" + interview_id,
      });
    },
  },
};
</script>
<template>
  <Layout>
    <!-- <div class="">
      <div class="tool-bar d-flex align-items-center">
        <div style="flex: 1">
          <h4><i class="fas fa-user-friends"></i> Danh sách ứng viên</h4>
        </div>
      </div> -->
    <div class="mat-manage-interview">
      <div class="d-flex interview-header">
        <i
          class="far fa-calendar-check"
          style="font-size: 20px; margin-right: 7px"
        ></i>
               <PageHeader :title="title" />

      </div>

      <div class="list-candidates">
        <div class="header">
          <div class="form">
            <form class="filter mt-2 position-relative" action="">
              <!-- Search bar -->

              <div class="filter-search mb-3">
                <div class="row">
                  <div class="col-12 mat-search-interview">
                    <div class="inputSearch__interview">
                      <i class="fas fa-search"></i>
                      <input
                        type="text"
                        class="form-control"
                        id="inputEmail4"
                        placeholder="Nhập từ khóa để tìm kiếm"
                        v-model="keyword"
                      />
                    </div>
                    <div class="handleActionSearch__interview">
                      <button
                        type="button"
                        class="btn btn-search"
                        @click="searchInterviewButtonAction"
                      >
                        Tìm kiếm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Filter bar-->
              <div
                class="
                  filter-bar
                  filterInterview
                  d-flex
                  flex-wrap
                "
              >
                <div class="d-flex align-items-center flex-wrap " style="flex: 1">
                  <span style="margin-right: 10px"
                    ><i
                      class="fas fa-filter"
                      style="font-size: 17px; margin-top: 5px"
                    ></i
                    >Lọc theo</span
                  >
                  <div class="optionSelected">
                    <!-- Company dropdown list -->
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Công ty </span>
                    </div>
                    <multiselect
                      @input="inputCompanies"
                      v-model="selectCompany"
                      :options="companies"
                      label="name"
                      :multiple="true"
                      :close-on-select="false"
                      :clear-on-select="false"
                      :preserve-search="true"
                      placeholder="Chọn công ty"
                      track-by="name"
                      :preselect-first="true"
                      :show-labels="false"
                      style="width: 200px"
                    >
                    </multiselect>
                  </div>
                  <div class="optionSelected">
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Trạng thái </span>
                    </div>
                    <multiselect
                      @input="inputStatus"
                      v-model="selectStatus"
                      :options="statuses"
                      placeholder="Chọn trạng thái"
                      :show-labels="false"
                      style="width: 200px"
                    ></multiselect>
                  </div>
                </div>
                <div class="sort align-items-center flex-wrap mat-sort">
                <div>
                    <span class="mat-title-filter"
                      ><i class="fas fa-exchange-alt"></i>Sắp xếp theo</span
                    >
                  </div>
                  <multiselect
                    @input="inputSort"
                    v-model="sort"
                    label="name"
                    :options="sorts"
                    :show-labels="false"
                    :allow-empty="false"
                    style="width: 200px"
                  ></multiselect>
                </div>
              </div>
              <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
            </form>
          </div>
        </div>
        <div
          class="mainTable table-scroll mt-4"
          style="width: 100%; background: #fff; height: auto"
        >
          <table class="table ">
            <thead>
              <tr style="border: 1px solid #eae9e9; background: #f1f1f1">
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Ứng viên
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Công việc
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Trạng thái
                </th>
                <!-- <th scope="col">Ngày chờ xử lý</th> -->
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Ngày giới thiệu
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Thời gian bắt đầu
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  Thời gian kết thúc
                </th>
                <th scope="col" class='mat-title-table'>Ghi chú phỏng vấn</th>
              </tr>
            </thead>
            <tbody
              class=""
              id="accordion"
              v-for="(schedule, counter) in schedules"
              v-bind:key="schedule.id"
            >
              <tr class="tableMain" v-on:click="showDetail(schedule.id)">
                <th style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{ schedule.candidate.name }}
                </th>
                <td style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{ schedule.post.name }}
                </td>
                <td style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{ listStatuses[counter] }}
                </td>
                <!-- <td>{{ schedule.pending_date }}</td> -->
                <td style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{
                    new Date(schedule.refer_date).toLocaleString("en-GB", {
                      dateStyle: "short",
    
                    })
                  }}
                </td>
                <td style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{
                    new Date(schedule.interview_start_date).toLocaleString(
                      "en-GB",
                      { dateStyle: "short", timeStyle: "short", hour12: false }
                    )
                  }}
                </td>
                <td style="border-right: 1px solid #eae9e9" class='mat-title-table'>
                  {{
                    new Date(schedule.interview_end_date).toLocaleString(
                      "en-GB",
                      { dateStyle: "short", timeStyle: "short", hour12: false }
                    )
                  }}
                </td>
                <td class='mat-title-table'>{{ schedule.note }}</td>
              </tr>
            </tbody>
          </table>
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
  </Layout>
</template>
<style lang='scss' >
.mat-manage-interview {
  .mat-filter-text{
    @media screen and (max-width:768px){
      width:100px;
    }
     @media screen and (max-width:480px){
      width:80px;
    }
  }
  .mat-search-interview {
    display: flex;
    flex-wrap: wrap;
  }
  .interview-header {
    .titleHeader {
      span {
        font-family: "Roboto", sans-serif;
        font-size: 18px;
        color: #495057;
        font-weight: 500;
        @media screen and (max-width: 768px) {
            font-size: 17px;
     
        font-weight: 500;
        }
          @media screen and (max-width: 480px) {
            font-size: 15.5px;
     
        font-weight: 500;
        }
      }
    }
  }

   .mat-sort {
    display: flex;
    @media screen and (max-width: 600px) {
      display: flex;
    }
  }

 .paging {
    height: auto !important;

    .pagingContent {
      flex-wrap: wrap;
      padding: 15px;
      @media screen and (max-width: 600px) {
        padding: 5px;
      }
      .iconPaging {
        margin-bottom: 5px;

        .iconContent {
          margin-left: 0;
        }
      }

      .pagingItem {
        flex-wrap: wrap;

        .textPaging {
          flex-wrap: wrap;
        }
      }
    }
  }
  .pagingItem {
    justify-content: flex-end;
    align-items: center;
    margin-right: 15px;
    font-weight: 500;
    height: 90px;
    font-family: "Roboto", sans-serif;
    ol,
    ul,
    dl {
      margin: 0 !important;
    }
    @media screen and (max-width: 767px) {
      font-size: 14px;
      height: 50px;
    }
    @media screen and (max-width: 599px) {
      font-size: 12px;
      height: 40px;
    }
    .pagination {
      @media screen and (max-width: 767px) {
        a {
          padding: 5px 12px;
        }
      }
    }
  }
  .textPaging {
    display: flex;
  }
  .textPaging .active {
    background: #5b73e8;
    color: #ffffff;
  }
  .textPaging .active:hover {
    background: #4661e9;
  }
  .textPaging div {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    margin-right: 3px;
    width: 38px;
    font-weight: 500;
    font-family: "Roboto", sans-serif;
    color: #000;
    height: 38px;
    border: 1px solid #eae9e9;
    transition: all 0.1s linear;
  }
  .textPaging div:hover {
    background-color: #eae9e9;
  }
  .mainTable {
    -webkit-box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
    -moz-box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
    box-shadow: 0px 3px 6px 0px rgba(186, 186, 186, 1);
       .mat-title-table {
      @media screen and (max-width: 767px) {
        font-size: 14px;
      }
      @media screen and (max-width: 767px) {
        font-size: 12px;
      }
    }
    .tableMain {
      border-top: 1px solid #eae9e9;
      cursor: pointer;
      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
  .mat-title-filter {
    @media screen and (max-width: 600px) {
      font-size: 13px;
    }
  }
  .optionSelected {
    margin-right: 10px;
    position: relative !important;
    .mat-title-filter {
      margin: 0 10px;
      color: #4e4e4e;
    }
    align-items: center;
    display: flex;
  }
  .optionSelected i {
    position: absolute;
    right: 0;
    bottom: 15px;
    color: #666565;
  }
  .filterInterview {
    .multiselect__tags {
      border: none !important;
      border-radius: 0;
      height: auto !important;
      border-bottom: 1.5px solid #b1b1b1 !important;
      background-color: #3030 !important;
      margin-top: 2px !important;
      font-family: "Roboto", sans-serif !important;
      font-weight: 500 !important;
    }
  }

  .handleBtn {
    display: flex;
    justify-content: flex-end;
  }
  .btnCreateCandidate {
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
  .handleActionSearch__interview {
    padding-left: 15px;
    width: calc(15% - 15px);
    height: 45px;
      @media screen and (max-width: 992px) {
        width: calc(20% - 15px);
      }
      @media screen and (max-width: 768px) {
        height: 40px;
        font-size: 14px;
        width: calc(25% - 15px);
      }
      @media screen and (max-width: 600px) {
        margin-left: 0px;
        padding-left: 5px;
      }
      @media screen and (max-width: 480px) {
        margin-top: 5px;
        height: 35px;
        font-size: 13px;
        width: 100%;
      }
     
    button {
      height: 100%;
       @media screen and (max-width: 480px) {
        padding: 0px;
      }
    }
  }
  .handleActionSearch__interview .btn-search:hover {
    background-color: #415ef1;
    color: white;
  }
  .btn-search {
   
    background-color: #5b73e8;
    color: white;
    transition: all 0.2s ease-in;
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

  .filter-bar .form-control,
  .list-candidates .sort .form-control {
    border: none;
    border-bottom: 2px solid #ccc;
    border-radius: 0;
  }

  .form-control:focus {
    box-shadow: none;
    border-color: #315fb5;
  }


  .filter .filter-bar {
    background-color: #fff;
    padding: 15px 20px;
    height: auto;
    border-radius: 10px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    @media screen and (max-width: 767px) {
      padding: 10px 15px;
    }
    @media screen and (max-width: 480px) {
      padding: 7px 10px;
    }
  }

  .filter .filter-bar input {
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
  .inputSearch__interview{
    display: flex;
    align-items: center;
    width: 85%;
    background: #ffffff;
    border: 1px solid #eae9e9;
    border-radius: 5px;
    @media screen and (max-width: 992px) {
      width: calc(80% - 15px);
    }
    @media (max-width: 768px){
      width: 75%;
    }
    @media (max-width: 480px){
      width: 100%;
    }
  }
  .filter-search .inputSearch__interview i {
    display: inherit;
    justify-content: center;
    padding: 0 5px;
    margin-left: 10px;
  }

  .filter-search {
    .inputSearch__interview{
      display: flex;
      align-items: center;

      background: #ffffff;
      border: 1px solid #eae9e9;
      border-radius: 5px;
           
      input {
        height: 100%;
      }
    }
     .inputSearch__interview, .handleActionSearch__interview{
        height: 45px;

        @media screen and (max-width: 1024px) {
          height: 40px;
          font-size: 14px;
        }
        @media screen and (max-width: 768px) {
          height: 35px;
          font-size: 13px;
        }
      }
  }
  .filter-search button {
    width: 100%;
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

  /* .collapse,
.collapsing,
.collapse.show {
  background-color: #fff;
} */

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
    padding: 3px 15px;
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
}
.table-modal-scroll,.table-scroll {
  $min-width-desktop: 1366px;
  @media (max-width: #{$min-width-desktop - 0.02px}) {
     overflow: auto;
  }
  table {
    th{
      white-space: nowrap;
    }
  }
}
.filterInterview{
  .multiselect__content{
    width: 100%;
    .multiselect__option{
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
