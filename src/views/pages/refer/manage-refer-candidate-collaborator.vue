<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
export default {
  page: {
    title: "Danh sách giới thiệu",
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
      title: "Danh sách giới thiệu",
      rows: 100,
      perPage: 10,
      currentPage: 1,
      // Companies
      companies: [
        {
          id: 0,
          name: "Tất cả công ty",
        },
      ],
      company: {
        id: 0,
        name: "Tất cả công ty",
      },

      //Status
      statuses: [
        {
          id: 0,
          name: "Tất cả trạng thái",
        },
        {
          id: 1,
          name: "Pending",
        },
        {
          id: 2,
          name: "Employer Decline",
        },
        {
          id: 3,
          name: "Employer Accept",
        },
        {
          id: 4,
          name: "Company Viewed",
        },
        {
          id: 5,
          name: "Company Reject",
        },
        {
          id: 6,
          name: "Company Accept",
        },
        {
          id: 7,
          name: "Send Test",
        },
        {
          id: 8,
          name: "Candidate Submit",
        },
        {
          id: 9,
          name: "Failed Test",
        },
        {
          id: 10,
          name: "Passed Test",
        },
        {
          id: 11,
          name: "Schedule Interview",
        },
        {
          id: 12,
          name: "Candidate Reject Interview",
        },
        {
          id: 13,
          name: "Interviewed",
        },
        {
          id: 14,
          name: "Failed Interview",
        },
        {
          id: 15,
          name: "Offer",
        },
        {
          id: 16,
          name: "Onboard",
        },
        {
          id: 17,
          name: "Resign",
        },
        {
          id: 18,
          name: "Completed",
        },
      ],
      status: {
        id: 0,
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
        {
          id: 3,
          name: "Trạng thái",
        },
        {
          id: 4,
          name: "Ngày chờ xử lý",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày giới thiệu",
      },

      // Search
      search_value: "",

      //Date
      dateFrom: "",
      dateTo: "",
      timestampFrom: 0,
      timestampTo: 0,

      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //Response data
      introductions: [],
    };
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
    this.getCompaniesForFilter();
    this.searchCandidate();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "companies/getCompaniesSuccess":
          //Get companies
          if (
            this.companies.length <
            state.companies.companiesData.companies.length + 1
          ) {
            this.companies = this.companies.concat(
              state.companies.companiesData.companies
            );
          }
          break;
        case "introductions/introductionDataSuccess":
          // Get all candidate
          this.introductions =
            state.introductions.introductionData.candidateIntroductions;
          this.page_index = state.introductions.introductionData.pageIndex + 1;
          this.total_pages = state.introductions.introductionData.totalPages;
          break;
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    search_value: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchCandidate();
      }, 800);
    },
    company: function () {
      this.searchCandidate();
    },
    status: function () {
      this.searchCandidate();
    },
    sort: function () {
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
  },
  methods: {
    ...mapActions("introductions", [
      "searchCandidateIntroductionByCollaborator",
    ]),
    ...mapActions("companies", ["getCompaniesList"]),

    getCompaniesForFilter() {
      this.getCompaniesList();
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchCandidate();
    },

    searchCandidate() {
      const keyword = this.search_value;
      const company_ids = this.company.id;
      const status = this.status.id;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
      const introduction_date_from = this.timestampFrom;
      const introduction_date_to = this.timestampTo;

      this.searchCandidateIntroductionByCollaborator({
        keyword,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
        introduction_date_from,
        introduction_date_to,
      });
    },

    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    //Navigate to introduction detail page
    viewDetail(introduction_id) {
      this.$router.push({
        path: "/refer-candidate-detail-collaborator?id=" + introduction_id,
      });
    },
  },
};
</script>
<template>
  <Layout>
    <div class="d-flex">
      <i
        class="fas fa-address-card"
        style="font-size: 20px; margin-right: 7px"
      ></i>
        <PageHeader :title="title"/>
    </div>
    <div class="list-refers mt-4">
      <div class="col-12 p-0">
        <div class="form">
          <form class="mat-filter-main-refer mt-2 position-relative" action="">
            <!-- Search bar -->
            <div class="mat-filter-search-refer d-flex mb-3">
              <div class="position-relative mat-input-search-refer-collab">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  class="form-control"
                  id="inputEmail4"
                  placeholder="Nhập từ khóa để tìm kiếm"
                  v-model="search_value"
                />
              </div>
              <div class="mat-action-search-refer">
                <button
                  type="button"
                  class="btn btn-search-refer"
                  v-on:click="searchCandidate"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
            <!-- Filter bar-->
            <div
              class="
                mat-filter-bar-refer
                fillterRefer-mat
                justify-content-between
                d-flex
                flex-wrap
              "
            >
              <div class="justify-content-start d-flex flex-wrap filter-bar-refer__sort">
                <span class="d-flex align-items-center">
                  <i
                    class="fas fa-filter"
                    style="font-size: 22px; margin-top: 5px"
                  ></i>
                  Lọc theo
                </span>
                <div class="mat-filter-content-refer">
                  <div class="mat-filter-refer-option">
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Công ty </span>
                    </div>
                    <!-- Company dropdown list -->
                    <multiselect
                      v-model="company"
                      label="name"
                      :options="companies"
                      :allow-empty="false"
                      :show-labels="false"
                      class="mat-item-select-company"
                      placeholder="Chọn công ty"
                    ></multiselect>
                  </div>
                  <div class="mat-filter-refer-option">
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Trạng thái </span>
                    </div>
                    <multiselect
                      v-model="status"
                      label="name"
                      :options="statuses"
                      :allow-empty="false"
                      :show-labels="false"
                      class="mat-item-select-status"
                      placeholder="Chọn trạng thái"
                    ></multiselect>
                  </div>
                  <div class="mat-filter-refer-option">
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Từ ngày</span>
                    </div>
                    <input
                      id="dateFrom"
                      type="date"
                      class="form-control mat-item-select-date"
                      placeholder="Date from"
                      v-model="dateFrom"
                    />
                  </div>
                  <div class="mat-filter-refer-option">
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Đến ngày</span>
                    </div>
                    <input
                      id="dateTo"
                      type="date"
                      class="form-control mat-item-select-date"
                      placeholder="Date to"
                      v-model="dateTo"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
          </form>
        </div>
      </div>

      <div class="sort__refer-collab mt-4">
          <div class="mat-main-sort-refer d-flex align-items-center">
            <span class='mat-title-filter'><i class="fas fa-exchange-alt"></i>Sắp xếp theo:</span>
            <multiselect
              v-model="sort"
              label="name"
              :options="sorts"
              :allow-empty="false"
              :show-labels="false"
              class="mat-sort-by-refer"
              placeholder="Chọn loại sắp xếp"
            ></multiselect>
          </div>
      </div>

      <div
        class="mainTable mt-4"
        style="width: 100%; background: #fff; height: auto"
      >
        <div class="table-scroll">
          <table class="table">
            <thead>
              <tr style="border: 1px solid #eae9e9; background: #f1f1f1">
                <th style="border-right: 1px solid #eae9e9" class="mat-title-table">STT</th>
                <th scope="col" style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  Tên ứng viên
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  Tên công việc
                </th>
                <th scope="col" style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  Trạng thái
                </th>
                <!-- <th scope="col" >Ngày chờ xử lý</th> -->
                <th scope="col" style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  Ngày giới thiệu
                </th>
              </tr>
            </thead>
            <tbody
              class=""
              id="accordion"
              v-for="(introduction, index) in introductions"
              v-bind:key="introduction.candidate_introduction_id"
            >
              <tr
                class="tableMain"
                v-on:click="viewDetail(introduction.candidate_introduction_id)"
              >
                <th style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  {{ index + 1 }}
                </th>
                <th style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  {{ introduction.candidate_name }}
                </th>
                <td style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  {{ introduction.post_title }}
                </td>
                <td style="border-right: 1px solid #eae9e9"  class="mat-title-table">
                  {{ introduction.status }}
                </td>
                <!-- <td style="  "></td> -->
                <td style="border-right: 1px solid #eae9e9" class="mat-title-table">
                  {{ getDateString(introduction.introduction_date) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mat-paging-refer d-flex align-items-center">
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
  </Layout>
</template>
<style lang='scss'>
.mat-find-refer {
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
}
.mat-main-sort-refer {
  width: 100%;
  display: flex;
  justify-content:flex-end;
  @media screen and (max-width: 768px) {
    margin-left: 0px;
      margin-right: 55px;
  }
  @media screen and (max-width: 480px) {
    margin-right: 0px;
  }
}
.mat-sort-by-refer {
  width: 200px;
  @media screen and (max-width: 768px) {
    width: 170px;
  }
  @media screen and (max-width: 480px) {
    width: 210px;
  }
}
  .mat-paging-refer {
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

.mat-item-select-status {
  width: 140px;
  @media screen and (max-width: 768px) {
    width: 220px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.mat-item-select-date {
  width: 140px;
  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.mat-item-select-company {
  width: 180px;
  @media screen and (max-width: 768px) {
    width: 220px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.mat-title-header-refer {
  font-size: 19px;
  font-weight: 600;
  color: #495057;
  flex: 1;
  @media screen and (max-width: 768px) {
    font-size: 18px;
  }
  @media screen and (max-width: 480px) {
    font-size: 15px;
  }
}
.preAndNext {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 5px;
  transition: all 0.1s linear;
  font-family: "Roboto", sans-serif;
}
.preAndNext:hover {
  background-color: #eae9e9b0;
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
  margin-bottom: 15px;
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
.fillterRefer-mat, .sort__refer-collab {
  .mat-filter-refer-option {
    i {
      position: absolute;
      right: 0;
      bottom: 15px;
      color: #666565;
    }
  }

  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: #3030 !important;
    background: #3030 !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;

    input{
      background: #3030 !important;
    }
  }
  .multiselect__input, .multiselect__single{
    background-color: #3030 !important;
    background: #3030 !important;
    overflow:hidden;
    text-overflow: ellipsis;
    width: 80%;
  }
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
}

.btn:focus {
  box-shadow: none;
}
.mat-action-search-refer {
  margin-left: 15px;
  width: calc(15% - 15px);
}
.mat-action-search-refer .btn-search-refer:hover {
  background-color: #415ef1;
  color: white;
}
.btn-search-refer {
  background-color: #5b73e8;
  color: white;
  transition: all 0.2s ease-in;
}

// .view,
// .status {
//   color: #fff;
//   background-color: #5b73e8;
// }

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
.list-refers {
  padding: 0;
}
.mat-filter-bar-refer .form-control,
.list-refers .sort .form-control {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #315fb5;
}

.mat-filter-main-refer .mat-filter-bar-refer {
  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  .filter-bar-refer__sort{
  }
  .mat-main-sort-refer{
    width: 35%;

    @media (max-width: 992px) {
      width: 100%;
      justify-content: flex-start;
    }
  }
}

.mat-filter-main-refer .mat-filter-bar-refer input {
  font-size: 14px;
  padding-right: 0;
  
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
.list-refers {
  .mat-filter-search-refer i[class^="fa"] {
    top: 20px;
    left: 10px;
  }

  .mat-filter-search-refer .mat-input-search-refer-collab i {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: inherit;
    justify-content: center;
    padding: 0 5px;
    font-size: 20px;
    margin-left: 10px;
  }
  .mat-filter-search-refer .mat-input-search-refer-collab input {
    height: 100%;
    border: none;
    padding-left: 50px;
    background: #ffffff;
    border: 1px solid #eae9e9;
    border-radius: 5px;
    height: 45px;
    @media screen and (max-width: 768px) {
      height: 40px;
      font-size: 13.5px;
    }
    @media screen and (max-width: 480px) {
      height: 35px;
      font-size: 12.5px;
    }
  }
  .mat-filter-search-refer button {
    width: 100% !important;
  }
  .mat-filter-search-refer .mat-input-search-refer-collab {
    display: flex;
    align-items: center;
    width: 85%;
    border-radius: 5px;
    height: 45px;

    i {
      font-size: 16px;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 10px;
    }
  }
}

.list-refers .sort .form-control {
  width: 150px;
  background: 0;
  padding: 0;
}

.list-refers .thead {
  background-color: #ececec;
  font-size: 15px;
  font-weight: bold;
}

.list-refers .thead > div {
  padding: 15px 10px;
}

.tbody > div#accordion {
  padding: 15px 0;
}

.list-refers .thead.row {
  margin-left: 0;
  margin-right: 0;
}

.list-refers tbody {
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



.mat-filter-content-refer {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;

  .mat-filter-refer-option {
    white-space: nowrap;
    margin-right: 0;
  }
}

.list-refers {
  .filter {
    .mat-filter-bar-refer input {
      min-height: 40px;
    }
  }
}

.mat-filter-bar-refer {
  &__filter {
    width: 75%;

    @media (max-width: 1559.98px) {
      width: 70%;
    }
    @media (max-width: 1024px) {
      width: 100%;
    }
  }
  &__sort {
    width: 25%;

    @media (max-width: 1559.98px) {
      width: 30%;
    }

    @media (max-width: 1024px) {
      width: 100%;
    }
  }
}

.mat-title-filter {
  @media screen and (max-width: 480px) {
    font-size: 13px;
  }
}

.mat-filter-refer-option {
  margin-right: 10px;
  position: relative !important;
  .mat-title-filter {
    margin: 0 10px;
    color: #4e4e4e;
  }
  align-items: center;
  display: flex;
}

.mat-filter-search-refer {
  flex-wrap: wrap;
  .mat-action-search-refer {
    .btn-search-refer {
      height: 100%;
    }
  }
  @media (min-width: 768px) and (max-width: 1023.98px) {
    .mat-input-search-refer-collab,
    .mat-action-search-refer .btn-search-refer {
      height: 40px !important;
    }
  }
  @media (max-width: 767.98px) {
    .mat-input-search-refer-collab,
    .mat-action-search-refer .btn-search-refer {
      height: 35px !important;
    }
  }
}

@media (min-width: 642.0001px) and (max-width: 721.98px) {
  .mat-filter-content-refer {
    .filterContent {
      width: 33.33333% !important;
    }
  }
}
@media (max-width: 767.98px) {
  .mat-filter-content-refer {
    .mat-filter-refer-option {
      margin-right: 0;
      width: 50% !important;

      .multiselect,
      input[type="date"] {
        width: calc(100% - 10px) !important;
      }
    }
  }

  .mat-filter-search-refer {
    .mat-input-search-refer-collab {
      width: 80% !important;
    }

    .mat-action-search-refer {
      width: calc(20% - 15px);

      .btn-search-refer {
        padding: 0;
      }
    }
  }
}

@media (max-width: 575.98px) {
  .mat-filter-content-refer {
    .mat-filter-refer-option {
      width: 100% !important;

      .multiselect {
        width: 100% !important;
        font-size: 16px !important;
      }
    }
  }
}
@media (max-width: 480px) {
  // .mat-filter-bar-refer {
  //   .mat-filter-content-refer{
  //     .mat-filter-refer-option{
  //       width: 100% !important;
  //     }
  //   }
  // }

  .mat-filter-search-refer {
    .mat-input-search-refer-collab {
      width: 100% !important;
    }

    .mat-action-search-refer {
      margin: 10px 0 0 0;
      width: 100%;
    }
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
.mat-filter-bar-refer{
  .multiselect__content{
    width: 100%;
    .multiselect__option{
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
