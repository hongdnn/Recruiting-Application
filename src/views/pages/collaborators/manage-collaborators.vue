<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
// import * as jwt from "jsonwebtoken";
import Swal from "sweetalert2";
export default {
  page: {
    title: "Danh sách cộng tác viên",
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
      title: "Danh sách cộng tác viên",
    //   userStorage: JSON.parse(localStorage.getItem("user")),
    //   user_permissions: [],

      //Status
      statuses: [
        {
          id: 0,
          name: "Tất cả trạng thái",
        },
        {
          id: 1,
          name: "approval",
        },
        {
          id: 2,
          name: "lock",
        },
        {
          id: 3,
          name: "disable",
        },
        {
          id:4,
          name:"waiting",
        }
       
      ],
      status: {
        id: 0,
        name: "Tất cả trạng thái",
      },
      //Sort
      sorts: [
        {
          id: 0,
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Tên cộng tác viên",
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
      collaborators: [],
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
    this.searchForCollaborator();
  },
  created() {
   this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "collaborators/searchCollaboratorSuccess":
          // Get all candidate
          this.collaborators =
            state.collaborators.collaboratorData.collaborators;
          this.page_index = state.collaborators.collaboratorData.pageIndex + 1;
          this.total_pages = state.collaborators.collaboratorData.totalPages;

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
        this.searchForCollaborator();
      }, 800);
    },
    status: function () {
      this.searchForCollaborator();
    },
    sort: function () {
      this.searchForCollaborator();
    },
   
  },
  methods: {
   ...mapActions("collaborators", [
      "searchCollaborators",
    ]),

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchForCollaborator();
    },

  

    searchForCollaborator() {
      const keyword = this.search_value;
      const status = this.status.id;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
     

      this.searchCollaborators({
        keyword,
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

    viewDetail(id) {
      this.$router.push({
        path: "/collaborator-detail?id=" + id,
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
    <div class="d-flex">
      <i
        class="fas fa-user-check"
        style="font-size: 20px; margin-right: 7px"
      ></i>
      <PageHeader :title="title" :items="items" />
    </div>

    <div class="mat-list-candidates">
      <div class="header">
        <div class="form">
          <form
            class="mat-filter-main-candidate mt-2 position-relative"
            action=""
          >
            <!-- Search bar -->
            <div
              class="
                mat-filter-search-candidate
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
                  class="form-control input__Search__input"
                  id="inputEmail4"
                  placeholder="Nhập từ khóa để tìm kiếm"
                  v-model="search_value"
                />
              </div>
              <div class="btn__handleActionSearch">
                <button
                  type="button"
                  class="btn btn-search"
                  v-on:click="searchForCollaborator"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
            <!-- Filter bar-->
            <div
              class="
                mat-filter-candidate
                flex-wrap
                align-items-center
                d-flex
                mt-4
              "
            >
              <span style="margin-right: 10px"
                ><i
                  class="fas fa-filter"
                  style="font-size: 17px; margin-top: 5px"
                ></i
                >Lọc theo</span
              >
              <div class="mat-filter-select-candidate">
                <div class="mat-option-select-candidate">
                  <div class="mat-filter-text">
                    <span class="mat-title-filter">Trạng thái</span>
                  </div>
                  <multiselect
                    class="optionSelected__status"
                    v-model="status"
                    label="name"
                    :options="statuses"
                    :allow-empty="false"
                    :show-labels="false"
                    placeholder="Chọn trạng thái"
                  ></multiselect>
                </div>
              </div>
            </div>
            <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
          </form>
        </div>
      </div>
      <div class="mat-header-candidate justify-content-between">
        
        <div
          class="
            mt-2
            sortByCandidate
            align-items-center
            justify-content-end
            flex-wrap
            mat-sort-candidates
          "
        >
          <div>
            <span class="mat-find-candidates"
              ><i class="fas fa-exchange-alt"></i>Sắp xếp theo:</span
            >
          </div>
          <multiselect
            v-model="sort"
            label="name"
            :options="sorts"
            :allow-empty="false"
            :show-labels="false"
            style="width: 200px"
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
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                  STT
                </th>
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                Họ tên / Số điện thoại CTV
                </th>
                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                Email
                </th>

                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                Trạng thái
                </th>
                  <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                Số ứng viên được giới thiệu
                </th>

                <th
                  scope="col"
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody
              class=""
              id="accordion"
                v-for="(user, idx) in collaborators" v-bind:key="user._id"
            
            >
              <tr
                class="tableMain"
                      v-on:click="viewDetail(user.collaboratorId)"
              >
                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                {{idx+1}}
                </td >
                 <th
                      class="
                        nameTable
                        d-flex
                        align-items-center
                        mat-title-table
                      "
                      style="height: 70px"
                    >
                      <!-- <div v-if="form.previewImage !== null" class="avatar">
                        <img :src="getImageURL(user.image)" />
                      </div> -->
                      <div v-if="user.image !== null" style="width:50px; height:50px;" class="avatar">
                        <img :src="getImageURL(user.image)" />
                      </div>
                      <div v-else  style="width:50px; height:50px;" class="avatar">
                        <img
                        style="width:50px; height:50px;"
                          for="upLoad"
                          src="https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg"
                          alt=""
                        />
                      </div>
                      <div v-on:click="showDetailStaff(user._id)">
                        <span class="name mat-title-table">{{
                          user.first_name + " " + user.last_name
                        }}</span>
                        <div>
                          <span class="phone mat-title-table">{{
                            user.phone
                          }}</span>
                        </div>
                      </div>
                    </th>
                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                {{user.email}}
                </td>

                <td
                  style="border-right: 1px solid #eae9e9"
                  class="mat-title-table-candidates"
                >
                {{user.status}}
                </td>
                <td>
                    {{user.numberOfCandidateReferred}}
                </td>
                <td>
                    {{ getDateString(user.created_date) }}
                </td>
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
        <div class="mat-paging-candidate-collab d-flex align-items-center">
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
.mat-title-header-collab-candidate {
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
.mat-find-candidates {
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
}
.mat-title-table-candidates {
  @media screen and (max-width: 767px) {
    font-size: 14px;
  }
  @media screen and (max-width: 767px) {
    font-size: 12px;
  }
}
.mat-sort-candidates {
  display: flex;

  @media screen and (max-width: 480px) {
    justify-content: flex-end;
  }
}
.sortByCandidate {
  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: transparent !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
  .multiselect__input,
  .multiselect__single {
    background-color: #3030 !important;
  }
}
.pagingItem {
  padding: 5px 10px 5px 0;
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
  margin-bottom: 15px;
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
}
.mat-option-select-candidate {
  margin-right: 10px;
  display: flex;
  position: relative !important;
}
.mat-option-select-candidate i {
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
  font-family: Roboto, sans-serif !important;
  background-color: #f3f2ef;
}

.btn:focus {
  box-shadow: none;
}
.btn__handleActionSearch {
  margin-left: 15px;
  width: calc(15% - 15px);
  @media screen and (max-width: 480px) {
    margin-left: 0px;
  }
}
.btn__handleActionSearch .btn-search:hover {
  background-color: #5b73e8;
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

.mat-filter-candidate .form-control,
.mat-list-candidates .sort .form-control {
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #315fb5;
}

.mat-filter-main-candidate .mat-filter-candidate {
  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  display: flex;
  @media screen and (max-width: 480px) {
    padding: 12px 12px 15px;
  }
  @media screen and (max-width: 768px) {
    padding: 10px 10px 13px;
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
}

.mat-filter-main-candidate .mat-filter-candidate input {
  font-size: 14px;
  padding-right: 0;
  padding-left: 0;
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

.mat-filter-search-candidate input {
  border: none;
}
.mat-filter-search-candidate .input__Search i {
  position: absolute;
  top: 50% !important;
  transform: translateY(-50%);
  padding: 0 5px;
  margin-left: 10px;
}
.mat-filter-search-candidate .input__Search {
  display: flex;
  align-items: center;
  width: 85%;
  background: #ffffff;
  border: 1px solid #eae9e9;
  border-radius: 5px;
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
}

.mat-filter-search-candidate button {
  padding: 13px;
}

.mat-filter-search-candidate i[class^="fa"] {
  top: 20px;
  left: 10px;
}

.mat-list-candidates .thead {
  background-color: #ececec;
  font-size: 15px;
  font-weight: bold;
}

.mat-list-candidates .thead > div {
  padding: 15px 10px;
}

.tbody > div#accordion {
  padding: 15px 0;
}

.mat-list-candidates .thead.row {
  margin-left: 0;
  margin-right: 0;
}

.mat-list-candidates tbody {
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

.input__Search__input {
  padding-left: 50px !important;
}

.mat-title-filter {
  @media screen and (max-width: 600px) {
    font-size: 13px;
  }
}
.optionSelected__company {
  width: 200px;
  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.optionSelected__status {
  width: 200px;

  @media screen and (max-width: 768px) {
    width: 120px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.optionSelected__dateFrom {
  width: 130px;

  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.optionSelected__dateTo {
  width: 130px;

  @media screen and (max-width: 768px) {
    width: 240px;
  }
  @media screen and (max-width: 480px) {
    width: 200px;
  }
}
.btn__handleActionSearch button {
  width: 100% !important;
}
.mat-paging-candidate-collab {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: 15px;
}
.mat-paging-candidate-collab .iconPaging {
  flex: 1;
}
.avatar {
      background-image: url("https://www.alliancerehabmed.com/wp-content/uploads/icon-avatar-default.png");
      background-repeat: no-repeat;
      background-size: cover;
      margin-bottom: 10px;
      width: 50px;
      border-radius: 50%;
      height: 50px;

      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        background-color: #f1f1f1;
      }
      label {
        font-size: 18px;
        cursor: pointer;
      }
}
.mat-paging-candidate-collab {
  align-items: center;
  margin-right: 15px;
  font-weight: 500;

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
.mat-option-select-candidate {
  margin-right: 10px;
  position: relative !important;
  .mat-title-filter {
    margin: 0 10px;
    color: #4e4e4e;
  }
  align-items: center;
  display: flex;
}

.mat-filter-select-candidate {
  display: flex;
  flex-wrap: wrap;

  @media screen and (max-width: 768px) {
  }
  @media screen and (max-width: 480px) {
    display: block;
  }
}
.mat-filter-search-candidate {
  @media (min-width: 768px) and (max-width: 1023.98px) {
    .input__Search,
    .btn__handleActionSearch .btn-search {
      height: 40px;
    }
  }
  @media (max-width: 767.98px) {
    .input__Search,
    .btn__handleActionSearch .btn-search {
      height: 35px;
    }
  }
}

@media (max-width: 1480px) {
  .mat-filter-candidate {
    display: block !important;
    padding: 15px;

    > span {
      width: 100% !important;
      justify-content: start !important;
    }
  }
}
@media (max-width: 767.98px) {
  .mat-filter-search-candidate {
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
  .mat-filter-candidate {
    .mat-filter-select-candidate {
      .mat-option-select-candidate {
        .multiselect,
        input[type="date"] {
        }
      }
    }
  }
}

@media (max-width: 540px) {
  .mat-list-candidates {
    .header {
      .sort {
        margin-bottom: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .mat-filter-search-candidate {
    .input__Search {
      width: 100% !important;
    }

    .btn__handleActionSearch {
      margin-top: 10px;
      width: 100%;
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
.mat-filter-candidate {
  .multiselect__content {
    width: 100%;
    .multiselect__option {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
