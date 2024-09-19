<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import { mapGetters, mapActions, mapState } from "vuex";
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
  },
  data() {
    return {
      title: "Danh sách giới thiệu",

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

      // Page
      page_index: 0,
      page_size: 20,

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
      //Get companies
      if (
        this.companies.length <
        state.companies.companiesData.companies.length + 1
      ) {
        this.companies = this.companies.concat(
          state.companies.companiesData.companies
        );
      }
      // Get all candidate
      this.introductions =
        state.introductions.introductionData.candidateIntroductions;
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
  },
  methods: {
    ...mapActions("introductions", ["searchCandidateIntroductinForEmplorer"]),
    ...mapActions("companies", ["getCompaniesList"]),

    getCompaniesForFilter() {
      this.getCompaniesList();
    },

    searchCandidate() {
      const keyword = this.search_value;
      const company_ids = this.company.id;
      const status = this.status.id;
      const page_index = this.page_index;
      const page_size = this.page_size;
      const sort_by = this.sort.id;

      this.searchCandidateIntroductinForEmplorer({
        keyword,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
      });
    },

    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
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
    <div class="d-flex mb-4">
      <i
        class="fas fa-user-friends"
        style="font-size: 20px; margin-right: 7px"
      ></i>
      <PageHeader :title="title" :items="items" />
    </div>
    <div class="list-candidates">
      <div class="header">
        <div class="form">
          <form class="filter mt-2 position-relative" action="">
            <!-- Search bar -->
            <div class="filter-search d-flex mb-3 justify-content-between">
              <div class="position-relative inputSearch">
                <i class="fas fa-search"></i>
                <input
                  type="text"
                  class="form-control"
                  id="inputEmail4"
                  placeholder="Nhập từ khóa để tìm kiếm"
                  v-model="search_value"
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
            <!-- Filter bar-->
            <div class="filter-bar justify-content-between form-inline d-flex">
              <div class="d-flex align-items-center" style="flex: 1">
                <span style="margin-right: 10px"
                  ><i
                    class="fas fa-filter"
                    style="font-size: 17px; margin-top: 5px"
                  ></i
                  >Lọc theo</span
                >
                <div class="optionSelected">
                  <!-- Company dropdown list -->
                  <multiselect
                    v-model="company"
                    label="name"
                    :options="companies"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 200px; z-index: 999"
                    placeholder="Chọn công ty"
                  ></multiselect>
                </div>
                <div class="optionSelected">
                  <multiselect
                    v-model="status"
                    label="name"
                    :options="statuses"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 200px; z-index: 999"
                    placeholder="Chọn trạng thái"
                  ></multiselect>
                </div>
              </div>
              <div class="d-flex sort align-items-center">
                <span><i class="fas fa-exchange-alt"></i>Sắp xếp theo:</span>

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
      <div class="body">
        <table class="table mt-1">
          <thead>
            <tr>
              <th scope="col">Ứng viên</th>
              <th scope="col">Tên công việc</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Ngày chờ xử lý</th>
              <th scope="col">Ngày giới thiệu</th>
            </tr>
          </thead>
          <tbody
            class=""
            id="accordion"
            v-for="introduction in introductions"
            v-bind:key="introduction.candidate_introduction_id"
          >
            <tr class="">
              <th>
                <a href="./refer-candidate-detail">
                {{ introduction.candidate_name }}
                <span
                  class="view text-light"
                  data-toggle="collapse"
                  data-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                  >Xem CV</span
                >
                </a>
              </th>
              <td>{{ introduction.post_title }}</td>
              <td>{{ introduction.status }}</td>
              <td></td>
              <td>{{ getDateString(introduction.introduction_date) }}</td>
            </tr>
            <tr>
              <td colspan="12" class="hiddenRow">
                <div
                  id="collapseOne"
                  class="collapse"
                  aria-labelledby="headingOne"
                  data-parent="#accordion"
                >
                  <div class="card-body">
                    <div class="card">
                      <div class="card-header d-flex">
                        <div class="avatar">
                          <img src="none.png" alt="" class="arounded" />
                        </div>
                        <div class="info ml-3">
                          <div class="name">
                            <h2>Nguyễn Thành Tài</h2>
                          </div>
                          <div>
                            <span class="status">Đang tìm việc</span>
                          </div>
                          <div class="title-doc">.Net</div>
                        </div>
                      </div>
                      <div class="card-body row">
                        <div class="contact col-md-5">
                          <div class="email row">
                            <div class="col-md-2">
                              <i class="fas fa-envelope"></i>
                            </div>
                            <div class="content">
                              <p>Email</p>
                              <span>Email@gmail.com</span>
                            </div>
                          </div>
                          <div class="phone row">
                            <div class="col-md-2">
                              <i class="fas fa-phone-alt"></i>
                            </div>
                            <div class="content">
                              <p>Số điện thoại</p>
                              <span>(+84)812877299</span>
                            </div>
                          </div>
                          <div class="address row">
                            <div class="col-md-2">
                              <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="content">
                              <p>Địa chỉ</p>
                              <span>Email@gmail.com</span>
                            </div>
                          </div>
                        </div>
                        <div class="question col-md-7">
                          <div class="mb-4">
                            <label for=""
                              >Lí do ứng viên phù hợp với vị trí này</label
                            >
                            <input type="text" class="form-control" id="" />
                          </div>
                          <div>
                            <label for=""
                              >Tại sao ứng viên thay đổi công việc và kỳ vọng
                              của cô ấy / anh ấy là gì</label
                            >
                            <input type="text" class="form-control" id="" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>
<style >
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
.multiselect__tag {
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
  width: calc(15% - 15px);
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
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
.filter-search .inputSearch i {
  display: inherit;
  justify-content: center;
  padding: 0 5px;
  margin-left: 10px;
}
.filter-search .inputSearch {
  padding: 10px 0;
  display: flex;
  align-items: center;
  width: 85%;
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
</style>
