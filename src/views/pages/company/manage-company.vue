<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
export default {
  page: {
    title: "Danh sách công ty",
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
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      title: "Danh sách công ty",
      // industry
      industries: [
        {
          id: 0,
          name: "Tất cả ngành",
        },
      ],
      industry: {
        id: 0,
        name: "Tất cả ngành",
      },

      //Status
      statuses: [
        {
          id: 0,
          name: "Tất cả trạng thái",
        },
      ],
      status: {
        id: 0,
        name: "Tất cả trạng thái",
      },

      // Sort
      sorts: [
        {
          id: 0,
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Trạng thái",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày tạo",
      },

      // Search
      search_value: "",
      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //Response data
      companies: [],
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
    this.getIndustriesForFilter();
    this.searchCompanies();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "company/industrySuccess": {
          //Get industries
          if (
            this.industries.length <
            state.company.industry_data.industries.length + 1
          ) {
            this.industries = this.industries.concat(
              state.company.industry_data.industries
            );
          }
          break;
        }
        case "companies/searchCompaniesSuccess": {
          // Get all companies
          this.companies = state.companies.companiesData.companies;
          this.total_pages = state.companies.companiesData.totalPages;
          this.page_index = state.companies.companiesData.pageIndex + 1;
          break;
        }
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
        this.searchCompanyButtonAction();
      }, 800);
    },
    industry: function () {
      this.searchCompanyButtonAction();
    },

    status: function () {
      this.searchCompanyButtonAction();
    },
    sort: function () {
      this.searchCompanyButtonAction();
    },
  },
  methods: {
    ...mapActions("companies", ["searchCompaniesForEmployer"]),
    ...mapActions("company", ["getIndustryInformation"]),
    searchCompanyButtonAction() {
      if (
        this.checkPermisstion("company.all") ||
        this.checkPermisstion("company.search")
      ) {
        this.searchCompanies();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },
    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },
    getIndustriesForFilter() {
      this.getIndustryInformation();
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchCompanyButtonAction();
    },

    searchCompanies() {
      const keyword = this.search_value;
      const industry_ids = this.industry.id;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;

      this.searchCompaniesForEmployer({
        keyword,
        industry_ids,
        page_index,
        page_size,
        sort_by,
      });
    },

    showDetail(_id) {
      if (
        this.checkPermisstion("company.all") ||
        this.checkPermisstion("company.detail")
      ) {
        this.$router.push({
          path: "/company-detail?id=" + _id,
        });
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },

    createCompany(){
          if (
        this.checkPermisstion("company.all") ||
        this.checkPermisstion("company.create")
      ) {
        this.$router.push({
          path: "/create-company",
        });
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    }
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
    <div class="d-flex align-items-center">
      <div class="headerDetailPage d-flex mb-3" style="flex: 1">
        <i
          class="fas fa-building"
          style="font-size: 20px; margin-right: 7px"
        ></i>
        <PageHeader :title="title" :items="items" />
      </div>

      <div class="mat-button-create-company">
        <button v-on:click="createCompany()">
          <i class="fas fa-plus-circle"></i
          ><span style="margin-top: 1px">Tạo công ty</span>
        </button>
      </div>
    </div>

    <div class="list-candidates">
      <div class="header">
        <div class="form">
          <form
            class="mat-filter-company-main mt-2 position-relative"
            action=""
          >
            <!-- Search bar -->
            <div
              class="
                mat-filter-search-company
                d-flex
                mb-3
                justify-content-between
                flex-wrap
              "
            >
              <div class="position-relative input__Search">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  class="form-control input__Search__input-company"
                  id="inputEmail4"
                  placeholder="Nhập từ khóa để tìm kiếm"
                  v-model="search_value"
                />
              </div>
              <div class="btn__handleActionSearch">
                <button
                  type="button"
                  class="btn btn-search"
                  v-on:click="searchCompanyButtonAction"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
            <!-- Filter bar-->
            <div
              class="
                mat-filter-bar-company
                filterCompany
                justify-content-between
                form-inline
                d-flex
                flex-wrap
              "
            >
              <div class="d-flex align-items-center flex-wrap">
                <span style="margin-right: 10px"
                  ><i class="fas fa-filter" style="font-size: 20px"></i>Lọc
                  theo</span
                >
                <div class="filterSelect">
                  <div class="optionSelected">
                    <!-- Company dropdown list -->
                    <div class="mat-filter-text">
                      <span class="mat-title-filter"> Công ty</span>
                    </div>
                    <multiselect
                      class="optionSelected__business"
                      v-model="industry"
                      label="name"
                      :options="industries"
                      :allow-empty="false"
                      :show-labels="false"
                      placeholder="Chọn ngành"
                    ></multiselect>
                  </div>
                  <!-- <div class="optionSelected">
                  <multiselect
                    v-model="status"
                    label="name"
                    :options="statuses"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 200px;"
                    placeholder="Chọn trạng thái"
                  ></multiselect>
                </div> -->
                </div>
              </div>
              <div class="d-flex sort align-items-center">
                <span class="mat-find-company"
                  ><i class="fas fa-exchange-alt"></i>Sắp xếp theo:</span
                >
                <multiselect
                  v-model="sort"
                  label="name"
                  :options="sorts"
                  :allow-empty="false"
                  :show-labels="false"
                  class="mat-sort-by-company"
                  placeholder="Chọn loại sắp xếp"
                ></multiselect>
              </div>
            </div>
            <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
          </form>
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
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  Tên công ty
                </th>
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  Tên ngành
                </th>
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  Website
                </th>
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody
              class=""
              id="accordion"
              v-for="company in companies"
              v-bind:key="company.id"
            >
              <tr class="tableMain">
                <th
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                  v-on:click="showDetail(company.id)"
                >
                  {{ company.name }}
                </th>
                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  {{ company.industry }}
                </td>
                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  {{ company.website }}
                </td>
                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-company"
                >
                  {{ company.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mat-paging-company d-flex align-items-center">
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
.authentication-bg {
  background-color: #f3f2ef !important;
}
body {
  background-color: #f3f2ef !important;
}
.mat-find-company {
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
}
.mat-title-filter-company {
  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
}
.input__Search {
  input {
    height: 45px;
    @media screen and (max-width: 768px) {
      height: 40px;
    }
    @media screen and (max-width: 480px) {
      height: 35px;
    }
  }
}
.mat-title-header-company {
  font-size: 20px;
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
.mat-paging-company {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.mat-paging-company .iconPaging {
  flex: 1;
}
.mat-paging-company {
  align-items: center;
  margin-right: 15px;
  font-weight: 500;

  font-family: "Roboto", sans-serif;
  ol,
  ul,
  dl {
    margin: 0 !important;
  }
  @media screen and (max-width: 768px) {
    font-size: 14px;
    height: 50px;
  }
  @media screen and (max-width: 599px) {
    font-size: 12px;
    height: 40px;
  }
  .pagination {
    @media screen and (max-width: 768px) {
      a {
        padding: 5px 12px;
      }
    }
  }
}
.mat-title-table-company {
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
}
.pagingItem {
  padding: 0 10px 5px 0;
  justify-content: flex-end;

  font-weight: 500;
  font-family: "Roboto", sans-serif;
  background: #fff;
  width: 100%;
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
  .tableMain {
    border-top: 1px solid #eae9e9;
    cursor: pointer;
    &:hover {
      background-color: #f0f0f0;
    }
  }
  .tableMain:last-child {
    border-bottom: 1px solid #eae9e9;
  }
}

.optionSelected {
  margin-right: 10px;
  display: flex;
  position: relative !important;
}
.optionSelected i {
  position: absolute;
  right: 0;
  bottom: 15px;
  color: #666565;
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
  font-family: "Roboto", sans-serif;
  background-color: #f3f2ef;
}

.btn:focus {
  box-shadow: none;
}
.handleActionSearch {
  margin-left: 15px;
  width: calc(15% - 15px);
}
.handleActionSearch .btn-search:hover {
  background-color: #495cba;
  color: white;
}
.btn-search {
  width: 200px;
  background-color: #5b73e8;
  color: white;
  transition: all 0.2s ease-in;
}
.mat-button-create-company button {
  display: flex;
  align-items: center;
  outline: none;
  background-color: #fdb327;
  -webkit-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  border: 1px solid #fdb327;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  height: 37px;
  @media screen and (max-width: 768px) {
    height: 35px;
  }
  @media screen and (max-width: 480px) {
    height: 30px;
  }
}
.mat-button-create-company button:hover {
  background-color: #fda90e;
}
.mat-button-create-company button i {
  margin-right: 5px;
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

.mat-filter-bar-company .form-control,
.list-candidates .sort .form-control {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #315fb5;
}

.mat-filter-company-main .mat-filter-bar-company {
  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  .multiselect__tags {
    border: none !important;
    border-radius: 0;

    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: #3030 !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
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

.mat-filter-search-company input {
  border: none;
}
.mat-filter-search-company .input__Search i {
  position: absolute;
  top: 50% !important;
  transform: translateY(-50%);
  padding: 0 5px;
}
.mat-filter-search-company .input__Search {
  display: flex;
  align-items: center;
  width: 85%;
  background: #ffffff;
  border: 1px solid #eae9e9;
  border-radius: 5px;
}

.mat-filter-search-company i[class^="fa"] {
  top: 20px;
  left: 10px;
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

.input__Search__input-company {
  padding-left: 35px !important;
}

.mat-title-filter-company {
  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
}

.optionSelected__business {
  width: 200px !important;
  @media screen and (max-width: 768px) {
    width: 200px !important;
  }
  @media screen and (max-width: 480px) {
    width: 170px !important;
  }
  @media screen and (max-width: 325px) {
    width: 150px !important;
  }
}
.mat-sort-by-company {
  width: 200px !important;
  @media screen and (max-width: 768px) {
    width: 200px !important;
  }
  @media screen and (max-width: 480px) {
    width: 150px !important;
  }
  @media screen and (max-width: 325px) {
    width: 150px !important;
  }
}
.btn__handleActionSearch button {
  width: 100% !important;
  height: 45px;
  @media screen and (max-width: 768px) {
    height: 40px;
  }
  @media screen and (max-width: 480px) {
    height: 35px;
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

.filterSelect {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;

  .filterContent {
    white-space: nowrap;
  }
}
.btn__handleActionSearch {
  margin-left: 15px;
  width: calc(15% - 15px);
}
.mat-filter-search-company {
  @media (min-width: 768px) and (max-width: 1023.98px) {
    .input__Search,
    .btn__handleActionSearch button {
      height: 40px;
    }
  }
  @media (max-width: 767.98px) {
    .input__Search,
    .btn__handleActionSearch button {
      padding: 0;
      height: 35px;
    }
  }
}

@media (max-width: 1480px) {
  .mat-filter-bar-company {
    padding: 15px;

    > span {
      width: 100% !important;
      justify-content: start !important;
    }
  }

  .filterSelect {
    justify-content: start;
  }
}
@media (max-width: 767.98px) {
  .mat-filter-search-company {
    .input__Search {
      width: 80% !important;
    }

    .btn__handleActionSearch {
      width: calc(20% - 15px);

      .btn-search {
        padding: 0;
      }
    }
  }
}

@media (max-width: 642px) {
  // .mat-filter-bar-company {
  //   .filterSelect{
  //     .optionSelected{
  //       width: 50% !important;
  //       margin-right: 0;
  //     }
  //   }
  // }
}

@media (max-width: 540px) {
  .list-candidates {
    .header {
      .sort {
        margin-bottom: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .mat-filter-bar-company {
    .filterSelect {
      .optionSelected {
        width: 100% !important;
      }
    }
  }

  .mat-filter-search-company {
    .input__Search {
      width: 100% !important;
    }

    .btn__handleActionSearch {
      margin: 15px 0 0 0;
      width: 100%;
      @media screen and (max-width: 768px) {
        margin: 10px 0 0 0;
      }
    }
  }
}

.table-modal-scroll,
.table-scroll {
  $min-width-desktop: 1366px;
  @media (max-width: #{$min-width-desktop - 0.02px}) {
    overflow: auto;
  }
  table {
    th {
      white-space: nowrap;
    }
  }
}
.mat-filter-bar-company.filterCompany {
  .multiselect__content {
    width: 100%;
    .multiselect__option {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
