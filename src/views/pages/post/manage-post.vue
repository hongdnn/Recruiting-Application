<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapGetters, mapActions, mapState } from "vuex";
import { generateApiUrl } from "../../../helpers/common/APIConstants";
import jwt_decode from "jwt-decode";
import { sperateMoney } from "../../../helpers/common/Ultilities";
import { vi } from "../../../locales/vi";
import {
  messages,
  loadMessage,
  test_messages,
  loadLocaleMessages,
} from "../../../i18n";
import Swal from "sweetalert2";
export default {
  page: {
    title: "Công việc",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
      { charset: "utf-8" },
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
      searchLabel: "",
      title: "Công việc",
      status: "Tất cả trạng thái",
      search_value: "",
      //Paging
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      sort_by_value: {
        id: 0,
        name: "Ngày bắt đầu nhận CV",
      },
      keyword_type_value: {
        id: 0,
        name: "Tìm theo công việc",
      },
      search_data: {},
      posts: [],
      timer: 0,
      filter_options: ["Tất cả trạng thái", "Active", "Closed", "Pause"],
      sort_option: ["Ngày tạo", "Tên công việc", "Mức lương (cao đến thấp)"],
      sort_options: [
        {
          id: 0,
          name: "Ngày bắt đầu nhận CV",
        },
        {
          id: 1,
          name: "Tên công việc",
        },
        {
          id: 2,
          name: "Mức lương (cao đến thấp)",
        },
      ],
      keyword_types: [
        {
          id: 0,
          name: "Tìm theo công việc",
        },
        {
          id: 1,
          name: "Tìm theo công ty",
        },
      ],
      //Response data

      total_count: 0,
    };
  },
  computed: {
    ...mapGetters("post", ["getSearchPostGetter"]),
    ...mapState("post", ["searchData"]),

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.searchPost();
    this.decodeToken();
    this.searchLabel = this.$i18n.t("post.search");
  },

  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "post/searchPostSuccess":
          this.posts = state.post.searchData.posts;
          this.search_data = state.post.searchData;
          this.total_pages = state.post.searchData.totalPages;
          this.page_index = state.post.searchData.pageIndex + 1;
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
        // document.getElementById("demo").innerHTML = this.search_value;
        this.searchPostButtonAction();
      }, 800);
    },
    search_data: function () {
      if (this.search_data === undefined) {
      } else {
        this.posts = this.search_data.posts;
      }
    },
    sort_by_value: function () {
      this.searchPost();
    },
    status: function () {
      this.searchPost();
    },
  },
  methods: {
    ...mapActions("post", ["searchPostsByEmployer", "getData"]),

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },
    searchPostButtonAction() {
      if (
        this.checkPermisstion("post.all") ||
        this.checkPermisstion("post.search")
      ) {
        this.searchPost();
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

    async searchPost() {
      var status = this.status;
      var search_value = this.search_value;
      var page_index = this.page_index - 1;
      var page_size = this.page_size;
      var sort_by = this.sort_by_value.id;
      var keyword_type = this.keyword_type_value.id;

      switch (status) {
        case "Tất cả trạng thái":
          status = 0;
          break;
        case "Active":
          status = "active";
          break;
        case "Closed":
          status = "closed";
          break;
        case "Pause":
          status = "pause";
          break;
        default:
      }

      this.searchPostsByEmployer({
        status,
        search_value,
        keyword_type,
        page_index,
        page_size,
        sort_by,
      });
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchPost();
    },
    getImageURL(path) {
      return generateApiUrl(path);
    },

    showDetail(post_id) {
      if (
        this.checkPermisstion("post.all") ||
        this.checkPermisstion("post.detail")
      ) {
        const domain = window.location.origin;
        const url = domain + "/post-detail?id=" + post_id;
        window.location.href = url;
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
    createPost() {
      if (
        this.checkPermisstion("post.all") ||
        this.checkPermisstion("post.create")
      ) {
        const domain = window.location.origin;
        const url = domain + "/create-post";
        window.location.href = url;
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },
  },
};
</script>

<template>
  <Layout>
    <div class="mat-manage-post">
      <div class="d-flex align-items-center mat-header">
        <div class="d-flex" style="flex: 1">
          <i
            class="fas fa-briefcase"
            style="font-size: 20px; margin-right: 7px"
          ></i>
          <PageHeader :title="title" />
        </div>
        <div class="handleCreatedJob">
          <button v-on:click="createPost()">
            <i class="fas fa-plus-circle"></i
            ><span style="margin-top: 1px">Tạo công việc</span>
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mat-search">
          <div
            class="col-md-7 col-lg-8 col-sm-6 col-xs-12 mat-search-item"
            style="padding-right: 10px"
          >
            <b-form-input
              class="searchInput searchInputForm"
              for="text"
              value=""
              placeholder="Tìm công việc theo từ khóa"
              v-model="search_value"
            ></b-form-input>
          </div>
          <div class="col-md-5 col-lg-4 col-sm-6 mat-search-item two">
            <multiselect
              class="col-xs-9"
              v-model="keyword_type_value"
              label="name"
              :options="keyword_types"
              :allow-empty="false"
              :show-labels="false"
            ></multiselect>
            <div class="mat-button-search col-xs-3">
              <button type="button" v-on:click="searchPostButtonAction()">
                <!-- {{ $t("post.search") }} -->
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 mat-filter-manage">
          <div class="filterAndJob-admin d-flex">
            <div class="filterContent d-flex align-center">
              <div class="mat-icon-filter">
                <i class="fas fa-filter"></i>
                <span>Lọc theo</span>
              </div>
              <div class="filterContent">
                <multiselect
                  v-model="status"
                  :options="filter_options"
                  :allow-empty="false"
                  :show-labels="false"
                  style="width: 140px"
                ></multiselect>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 d-flex">
        <div class="col-xl-8 col-12">
          <div class="col-12">
            <div class="paging">
              <div class="pagingContent d-flex flex-wrap">
                <div class="iconPaging"></div>
                <div class="pagingItem d-flex flex-wrap">
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
          <div class="findAndSort d-flex">
            <div class="col-12 mt-2">
              <div class="row">
                <div class="findOfJob col-lg-8 col-xl-7 col-md-6 col-sm-6">
                  <span>{{ search_data.totalCount }} Việc làm phù hợp</span>
                </div>
                <div
                  class="
                    sortOfJob
                    d-flex
                    justify-content-end
                    col-lg-4 col-xl-5 col-md-6 col-sm-6 col-xs-12
                  "
                >
                  <i class="fas fa-arrows-alt-v"></i>
                  <span class="titleSort">Sắp xếp theo: </span>
                  <multiselect
                    v-model="sort_by_value"
                    label="name"
                    :options="sort_options"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 200px"
                  ></multiselect>
                </div>
              </div>
            </div>
          </div>
          <div class="mat-list-post">
            <div
              class="mat-post-item"
              v-for="postValue in posts"
              v-bind:key="postValue.id"
            >
              <div
                class="mt-2 hovernow d-flex card__hovernow"
                v-on:click="showDetail(postValue.id)"
              >
                <div
                  class="col-auto img__hovernow mat-post-image"
                  style="height: auto"
                >
                  <img :src="getImageURL(postValue.company_image)" />
                </div>

                <div class="body__hovernow d-flex mat-post-content">
                  <div class="content__hovernow">
                    <div class="d-flex">
                      <div class="titleCompany mat-post-title">
                        <span>{{ postValue.title }}</span>
                      </div>

                      <div class="status mat-status-post">
                        <span
                          v-if="postValue.status == 'active'"
                          class="badge bg-success rounded-pill"
                          >{{ postValue.status }}</span
                        >
                        <span
                          v-if="postValue.status == 'pause'"
                          class="badge bg-warning rounded-pill"
                          >{{ postValue.status }}</span
                        >
                        <span
                          v-if="postValue.status == 'close'"
                          class="badge bg-danger rounded-pill"
                          >{{ postValue.status }}</span
                        >
                        <span
                          class="badge rounded-pill mat-urgency"
                          v-if="postValue.urgency"
                          >Tuyển gấp
                        </span>
                      </div>
                    </div>
                    <div class="name mat-post-name mt-1">
                      <span style="color: grey">{{
                        postValue.company_name
                      }}</span>
                    </div>

                    <div class="numberRequire">
                      <span
                        class="numberRecruits"
                        v-if="postValue.require_number"
                        >Số lượng tuyển:
                        <span>{{ postValue.require_number }}</span></span
                      >
                    </div>
                    <div class="candidateBenefit">
                      <span class="candidateText"
                        >Hoa hồng
                        <span
                          >{{ sperateMoneyString(postValue.commission) }}
                          {{ postValue.currency }}</span
                        >
                        / ứng viên</span
                      >
                    </div>
                    <div class="candidateBenefit">
                      <span class="candidateText"
                        >Thưởng: 
                        <span
                          >{{ sperateMoneyString(postValue.bonus) }}
                          {{ postValue.currency }}</span
                        >
                        / ứng viên</span
                      >
                    </div>
                    <div class="bottomCard">
                      <div class="row">
                        <div class="col-12 mat-bottom-card">
                          <div class="cardBottomItem col-xl-6 col-sm col-xs-12">
                            <div class="headerItem mat-title-bottom">
                              <span>Mức lương</span>
                            </div>
                            <div class="bottomItem mat-text-content">
                              <span
                                v-if="
                                  postValue.salary_from > 0 &&
                                  postValue.salary_to > 0
                                "
                                >Từ
                                <span class="salaryMoneys"
                                  >{{
                                    sperateMoneyString(postValue.salary_from)
                                  }}
                                  -
                                  {{ sperateMoneyString(postValue.salary_to) }}
                                  {{ postValue.currency }}
                                </span></span
                              >
                              <span v-else> Thương lượng </span>
                            </div>
                          </div>
                          <div class="cardBottomItem col-xl-6 col-sm col-xs-12">
                            <div class="headerItem mat-title-bottom">
                              <span>Địa chỉ</span>
                            </div>
                            <div class="bottomItem mat-text-content">
                              <span
                                v-for="(adrs, idx) in postValue.locations"
                                v-bind:key="adrs.id"
                                ><span class="address"
                                  >{{ adrs.name
                                  }}<span
                                    v-if="
                                      idx !== postValue.locations.length - 1
                                    "
                                    >,
                                  </span></span
                                ></span
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="paging">
              <div class="pagingContent d-flex">
                <div class="iconPaging"></div>
                <div class="pagingItem d-flex">
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
        </div>
        <div class="col-4 menuPictureContent" style="padding: 0 15px">
          <div class="menuPicture">
            <div class="itemMenu">
              <h4>
                Việc làm Fintech mới nhất 2021 - Thưởng lên tới 50 triệu cho
                người giới thiệu
              </h4>
            </div>
            <div class="itemMenu2" style="margin-top: 15px">
              <h4>
                Việc làm Fintech mới nhất 2021 - Thưởng lên tới 50 triệu cho
                người giới thiệu
              </h4>
            </div>
            <div class="itemMenu3" style="margin-top: 15px">
              <h4>
                Việc làm Fintech mới nhất 2021 - Thưởng lên tới 50 triệu cho
                người giới thiệu
              </h4>
            </div>
            <div class="itemMenu4" style="margin-top: 15px">
              <h4>
                Việc làm Fintech mới nhất 2021 - Thưởng lên tới 50 triệu cho
                người giới thiệu
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang="scss">
@font-face {
  font-family: Roboto;
  src: url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);
}
.menuPictureContent {
  @media screen and (max-width: 1199px) {
    display: none;
  }
}
.mat-search {
  display: flex;
  margin-bottom: 15px;
  @media screen and (max-width: 600px) {
    display: block;
    margin-bottom: 10px;
  }
  .two {
    @media screen and (max-width: 600px) {
      margin-top: 10px;
    }
  }

  .mat-search-item {
    display: flex;
    .multiselect__tags {
      height: 40px;
    }
    .multiselect__single {
      color: #495057 !important;
      margin-top: 2px;
    }
    @media screen and (max-width: 767px) {
      .multiselect__tags {
        height: 35px;
      }
      .multiselect__single {
        margin-top: 0px !important;
      }
    }
    @media screen and (max-width: 480px) {
      padding-right: 0px !important;
    }

    .mat-button-search {
      padding-left: 10px;
      button {
        width: 120px;
        height: 40px;
        border: none;
        ouline: none;
        background-color: #5b73e8;
        color: white;
        border-radius: 4px;
        &:hover {
          background-color: #4661e9;
        }
        @media screen and (max-width: 600px) {
          height: 35px;
          font-size: 14px;
        }
      }
    }
  }
}
.mat-filter-manage {
  margin-bottom: 20px;
  .filterAndJob-admin {
    padding: 0 20px;
  }
  .mat-icon-filter {
    margin-right: 15px;
    display: flex;
    align-items: center;
    i {
      margin-right: 5px;
      font-size: 20px;
    }
    @media screen and (max-width: 600px) {
      span {
        font-size: 13px;
      }
    }
  }
}
.mat-list-post {
  .mat-post-item {
    .mat-post-image {
      img {
        width: 200px;
        height: 200px;
        padding: 12px;
        @media screen and (max-width: 767px) {
          width: 180px;
          height: 180px;
        }
        @media screen and (max-width: 600px) {
          width: 150px;
          height: 150px;
        }
      }
    }
    .mat-post-content {
      width: 600px;
      .content__hovernow {
        width: 100%;
        padding: 15px 15px;
      }
      .mat-post-title {
        font-size: 20px;
        span {
          @media screen and (max-width: 767px) {
            font-size: 17px;
          }
          @media screen and (max-width: 767px) {
            font-size: 14px;
          }
        }
      }
      .mat-post-name {
        @media screen and (max-width: 767px) {
          span {
            font-size: 15px;
          }
        }
        @media screen and (max-width: 767px) {
          span {
            font-size: 14px;
          }
        }
      }
      .mat-status-post {
        display: flex;
        align-items: center;
        margin-left: 5px;
        .mat-urgency {
          margin-left: 5px;
          border: 1px solid #e60000 !important;
          background: #ffe5e5;
          color: #e60000;
        }
        @media screen and (max-width: 767px) {
          span {
            font: size 10px;
          }
        }
      }
      .mat-bottom-card {
        display: flex;
        @media screen and (max-width: 600px) {
          display: block;
        }
        .mat-title-bottom {
          span {
            @media screen and (max-width: 767px) {
              font-size: 14px;
            }
          }
        }
        .mat-text-content {
          span {
            @media screen and (max-width: 767px) {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
.mat-manage-post {
  .mat-header {
    display: flex;
    margin-bottom: 20px;
    align-items: center;
    @media screen and (max-width: 767px) {
      margin-bottom: 10px;
      i {
        font-size: 14px;
      }
    }
    .mat-title-header {
      font-size: 20px;
      font-weight: 550;
      @media screen and (max-width: 767px) {
        font-size: 18px;
      }
    }
  }
  .jobTodo .header span {
    font-size: 18px;
    font-weight: 600;
    font-family: "Roboto", sans-serif;
    color: #495057;
  }
  .contentTodo {
    width: 100%;
    background-color: #ffffff;
    border: 1.5px solid #dddddf;
    border-radius: 8px;
    padding: 15px;
  }
  .contentTodo .contentQuantity {
    display: flex;
    font-family: "Roboto", sans-serif;
    align-items: center;
  }
  .contentTodo .contentQuantity .itemQan {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #dfdfdfde;
    display: inherit;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-weight: bold;
    font-size: 14px;
  }
  .contentTodo .contentQuantity .textQuan {
    font-size: 14px;
    color: #2c2c2cde;
    margin-left: 10px;
  }
  .infoData .icon {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .infoData .icon i {
    font-size: 30px;
    color: #a0a0a0de;
  }
  .textData {
    display: flex;
    justify-content: center;
  }
  .textData span {
    margin-top: 5px;
    font-family: "Roboto", sans-serif;
    font-size: 14px;
    color: #a0a0a0de;
  }
  .handleCreatedJob button {
    padding: 5px 12px;
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
    @media screen and (max-width: 767px) {
      padding: 4px 8px;
      font-size: 12px;
    }
  }
  .handleCreatedJob button:hover {
    background-color: #fda90e;
  }
  .handleCreatedJob button i {
    margin-right: 5px;
  }
  .titleCompany span {
    font-family: "Roboto", sans-serif;
    font-weight: 500;
  }
  .menuPicture h4 {
    font-family: "Roboto", sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: rgb(73, 73, 73);
  }
  .itemMenu,
  .itemMenu2,
  .itemMenu3,
  .itemMenu4 {
    padding: 10px;
    border-radius: 5px;
    position: relative;
    border: 1px solid #eae9e9;
    background-image: url("https://static.recruitery.co/uploads/images/ef827cdf916d4faba58c5e99836d0cb4_20210406114212.png");
    height: 250px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
  .itemMenu2 {
    background-image: url("https://tuvancongnghe.net/wp-content/uploads/2020/02/Thie%CC%82%CC%81t-ke%CC%82%CC%81-hi%CC%80nh-a%CC%89nh-qua%CC%89ng-ca%CC%81o.png");
  }
  .itemMenu3 {
    background-image: url("https://static.recruitery.co/uploads/images/d4d0d69f33404ca8b0959ae2825b08a8_20201125142500.png");
  }
  .itemMenu4 {
    background-image: url("https://static.recruitery.co/uploads/images/43525c304c3740f9a42f71f0fb371b59_20201112165022.jpg");
  }
  .itemMenu4 h4 {
    color: white;
  }
  .itemMenu2 h4 {
    color: white;
  }
  .status {
    background: none !important;
  }
  .itemMenu::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #05050536;
  }
  .findAndSort .sortOfJob {
    font-family: "Roboto", sans-serif;
    font-weight: 600;
    align-items: center;
    justify-content: flex-end;
  }
  .findAndSort .sortOfJob .titleSort {
    margin: 0 7px;
    font-size: 13px;
    @media screen and (max-width: 767px) {
      font-size: 12px;
    }
  }
  .findAndSort .sortOfJob i {
    font-size: 15px;
  }
  .findAndSort .findOfJob {
    font-size: 14px;

    font-family: "Roboto", sans-serif;
    font-weight: 600;
    flex: 1;
    @media screen and (max-width: 600px) {
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
  .paging {
    border-radius: 4px;
    border: 1px solid #eae9e9;
    background-color: white;
  }
  .pagingContent {
    width: 100%;
  }
  .pagingContent .iconPaging {
    flex: 1;
  }
  .iconContent {
    cursor: pointer;
    margin-left: 5%;
    height: 38px;
    width: 110px;
    border-radius: 6px;
    border: 1px solid #eae9e9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-family: "Roboto", sans-serif;
    font-weight: 500;
    transition: all 0.1s linear;
  }
  .iconContent:hover {
    background: #eae9e9;
  }
  .iconContent span {
    font-family: "Roboto", sans-serif;
    font-weight: 500;
  }
  .iconContent i {
    margin-right: 8px;
  }
  .pagingItem {
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
  .findAndSort .multiselect__tags {
    border: none !important;
    border-radius: 0;

    display: flex !important;
    align-items: center;
    border-bottom: 1.5px solid #7d7d7d !important;
    background-color: #3030 !important;
    margin-top: 2px !important;
    font-weight: 500 !important;
    font-family: "Roboto", sans-serif !important;
    @media screen and (max-width: 767px) {
      height: 35px;
    }
  }
  .filterContent .multiselect__tags {
    border: none !important;
    border-radius: 0;

    padding: 0 5px;
    align-items: center;
    border-bottom: 1.5px solid #7d7d7d !important;
    background-color: #3030 !important;

    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
    @media screen and (max-width: 767px) {
      height: 35px;
    }
  }

  .multiselect__tags .multiselect__input,
  .multiselect__single {
    background-color: #3030 !important;
  }
  .multiselect__select:before {
    border-width: 6px 6px 0;
  }
  .multiselect__select {
    right: 4px;
  }
  .filterAndJob-admin {
    border-radius: 5px;
    border: 1px solid rgba(221, 221, 221, 0.733);
    height: 85px;
    background-color: #ffffff;
    align-items: center;
  }
  .filterContent {
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
  .filterContent span {
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
  #tab {
    margin-top: 5px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #eae9e9;
  }
  #tab .tabItem {
    cursor: pointer;
    padding: 8px 12px;
    align-items: center;
    margin-right: 10px;
    transition: all 0.2s ease-in-out;
    position: relative;
  }
  #tab .tabItem::after {
    content: "";
    width: 0%;
    height: 2px;
    position: absolute;
    bottom: 0;
    left: 0;
    transition: 0.2s ease-in-out;
  }
  #tab .tabItem:hover::after {
    background-color: #5b73e8;
    width: 100%;
  }
  #tab .tabItem:hover {
    color: #5b73e8;
  }
  #tab .tabItem span {
    font-size: 13px;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
  #tab .tabItem i {
    font-size: 18px;
    margin-right: 7px;
  }
  #tab .tabItem .customStar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    background: rgb(92, 92, 92);
    color: white;
    margin-right: 5px;
  }
  #tab .tabItem:hover .customStar {
    background: #5b73e8;
  }
  #tab .tabItem .customStar i {
    margin: 0 auto;
    font-size: 11px;
  }
  .left-view {
    background-color: white;
    border-radius: 10px;
  }

  .header-left-icon {
    font-size: 24px;
    color: cornflowerblue;
  }

  .left-icon {
    font-size: 18px;
    color: rgb(65, 65, 65);
  }

  .imageStyle {
    border-radius: 12px 0px 0px 12px;
    padding: 10px;
    width: 220px;
    height: 100%;
  }

  .hovernow {
    /* box-shadow: 0 1px 1px rgba(100, 100, 100, 0.15); */
    height: auto;
    background-color: white;
    border: solid;
    border-width: 0.5px;
    border-color: rgb(220, 220, 220);
    border-radius: 5px;
    transition: box-shadow 0.3s ease-in-out;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .hovernow:hover {
    box-shadow: 0 5px 15px rgba(39, 39, 39, 0.15);
  }
  .titleCompany span:hover {
    color: #000;
  }
  .titleCompany {
    transition: all 0.2s ease-in;
  }
  .searchInput {
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;

    .multiselect__tags {
      font-weight: 500;
      font-family: "Roboto", sans-serif;
    }
  }
  .numberRequire {
    .numberRecruits {
      margin-right: 10px;
      color: rgba(0, 0, 0, 0.54);
      span {
        color: rgb(0, 0, 0);
      }
    }
    .numberProcessing {
      color: rgba(0, 0, 0, 0.54);
      span {
        color: rgb(0, 0, 0);
      }
    }
  }
  .candidateBenefit {
    .candidateText {
      font-family: "Roboto", sans-serif;
      span {
        color: #179342;
      }
    }
    @media screen and (max-width: 767px) {
      .candidateText {
        font-size: 14px;
      }
    }
  }
  .bottomCard {
    .cardBottomItem {
      .headerItem {
        margin: 10px 0 0 0;
        span {
          color: rgba(0, 0, 0, 0.54);
        }
      }
      .bottomItem {
        display: flex;
        .stars {
          margin-right: 2px;
          margin-top: 1.8px;
          display: flex;
          align-items: center;
          background-color: #3a3a3a;
          width: 16px;
          height: 16px;
          justify-content: center;
          border-radius: 50%;
          color: #eae9e9;
          i {
            font-size: 10px;
            color: white;
          }
        }
        .address {
          margin-right: 5px;
        }
        .salaryMoneys {
          margin-right: 5px;
        }
      }
    }
  }
  @media (max-width: 1199.98px) {
    body[data-layout="horizontal"] .page-content {
      margin-top: 0 !important;
    }
  }

  @media (max-width: 991px) {
    .searchKeywordInput {
      padding-bottom: 1.2rem;
    }
  }

  @media screen and (max-width: 767px) {
    .searchInputForm {
      font-size: 13px;
      height: 35px;
    }
  }
  @media (max-width: 642px) {
    .filterSelect {
      .filterContent {
        width: 50% !important;

        .multiselect {
          width: 100% !important;
        }
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

    .findAndSort {
      flex-wrap: wrap-reverse;
      justify-content: space-between;

      .findOfJob {
        margin-top: 10px;
      }
    }
  }

  .searchSubmit {
    .mat-button-search-managepost {
      width: 100%;
      @media screen and (max-width: 767px) {
      }
      @media screen and (max-width: 599px) {
      }
    }
  }
  @media (max-width: 575px) {
    .searchSubmit {
      padding-top: 15px;
    }
  }

  @media (max-width: 540px) {
    body[data-layout="horizontal"] .page-content {
      padding: calc(140px + 1.25rem) calc(1.25rem / 2) 60px calc(1.25rem / 2);
    }

    .card__hovernow {
      flex-wrap: wrap;

      .img__hovernow {
        width: 100%;
        text-align: center;
      }

      .body__hovernow {
        .content__hovernow {
          font-size: 15px;

          .bottomCard {
            display: block !important;

            .cardBottomItem {
              display: flex;
              width: 100%;

              .headerItem {
                margin: 0 10px 0 0;
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .filterSelect {
      .filterContent {
        width: 100%;
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
}
</style>
