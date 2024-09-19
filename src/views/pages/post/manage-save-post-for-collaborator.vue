<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
import { generateApiUrl } from '../../../helpers/common/APIConstants';
import { sperateMoney } from "../../../helpers/common/Ultilities";
export default {
  page: {
    title: "Công việc",
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
      title: "Công việc",

      imgQc: [
        {
          id: 0,
          img: "https://tuvancongnghe.net/wp-content/uploads/2020/02/Thie%CC%82%CC%81t-ke%CC%82%CC%81-hi%CC%80nh-a%CC%89nh-qua%CC%89ng-ca%CC%81o.png",
        },
        {
          id: 1,
          img: "https://tuvancongnghe.net/wp-content/uploads/2020/02/Thie%CC%82%CC%81t-ke%CC%82%CC%81-hi%CC%80nh-a%CC%89nh-qua%CC%89ng-ca%CC%81o.png",
        },
        {
          id: 2,
          img: "https://tuvancongnghe.net/wp-content/uploads/2020/02/Thie%CC%82%CC%81t-ke%CC%82%CC%81-hi%CC%80nh-a%CC%89nh-qua%CC%89ng-ca%CC%81o.png",
        },
        {
          id: 3,
          img: "https://tuvancongnghe.net/wp-content/uploads/2020/02/Thie%CC%82%CC%81t-ke%CC%82%CC%81-hi%CC%80nh-a%CC%89nh-qua%CC%89ng-ca%CC%81o.png",
        },
      ],
      //Search by
      keyword_types: [
        {
          id: 0,
          name: "Tất cả từ khóa",
        },
        {
          id: 1,
          name: "Tên công việc",
        },
        {
          id: 2,
          name: "Level",
        },
        {
          id: 3,
          name: "Role",
        },
        {
          id: 4,
          name: "Skill",
        },
        {
          id: 5,
          name: "Ngành",
        },
        {
          id: 6,
          name: "Ngôn ngữ",
        },
        {
          id: 7,
          name: "Mô tả công việc",
        },
        {
          id: 8,
          name: "Yêu cầu",
        },
        {
          id: 9,
          name: "Lợi ích",
        },
      ],

      //Filter by
      locations: [
        {
          id: 0,
          name: "Tất cả vị trí",
        },
      ],
      currencies: [
        {
          id: 0,
          name: "Tất cả đơn vị tiền tệ",
        },
        {
          id: "VND",
          name: "VND",
        },
        {
          id: "USD",
          name: "USD",
        },
      ],
      salary_in_usd: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
        {
          id: 1,
          name: "<= $500",
          salary_from: 0,
          salary_to: 500,
        },
        {
          id: 2,
          name: "$500 - $1000",
          salary_from: 500,
          salary_to: 1000,
        },
        {
          id: 3,
          name: "$1000 - $1500",
          salary_from: 1000,
          salary_to: 1500,
        },
        {
          id: 4,
          name: "$1500 - $2000",
          salary_from: 1500,
          salary_to: 2000,
        },
        {
          id: 5,
          name: "$2000 - $3000",
          salary_from: 2000,
          salary_to: 3000,
        },
        {
          id: 6,
          name: ">= $3000",
          salary_from: 3000,
          salary_to: "",
        },
      ],
      salary_in_vnd: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
        {
          id: 1,
          name: "> 10.000.000 VND",
          salary_from: 0,
          salary_to: 10000000,
        },
        {
          id: 2,
          name: "10.000.000 - 20.000.000 VND",
          salary_from: 10000000,
          salary_to: 20000000,
        },
        {
          id: 3,
          name: "20.000.000 - 30.000.000 VND",
          salary_from: 20000000,
          salary_to: 30000000,
        },
        {
          id: 4,
          name: "30.000.000 - 40.000.000 VND",
          salary_from: 30000000,
          salary_to: 40000000,
        },
        {
          id: 5,
          name: "40.000.000 - 60.000.000 VND",
          salary_from: 40000000,
          salary_to: 60000000,
        },
        {
          id: 6,
          name: ">= 60.000.000 VND",
          salary_from: 60000000,
          salary_to: "",
        },
      ],
      salaries: [
        {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        },
      ],
      negotiable: true,
      type_works: [
        {
          id: 0,
          name: "Tất cả loại hình công việc",
        },
        {
          id: 1,
          name: "Toàn thời gian",
        },
        {
          id: 2,
          name: "Bán thời gian",
        },
      ],
      companies: [
        {
          id: 0,
          name: "Tất cả công ty",
        },
      ],
      statuses: [
        {
          id: 0,
          name: "Tất cả trạng thái",
        },
        {
          id: "active",
          name: "Active",
        },
        {
          id: "pause",
          name: "Pause",
        },
      ],
      is_urgent: false,
      guarantee_types: [
        {
          id: 0,
          name: "Tất cả loại bảo hành",
        },
        {
          id: 1,
          name: "Toàn diện",
        },
        {
          id: 2,
          name: "Giai đoạn",
        },
        {
          id: 3,
          name: "Không bảo hành",
        },
      ],

      //Sort by
      sorts: [
        {
          id: 0,
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Tên công việc",
        },
        {
          id: 2,
          name: "Tên công ty",
        },
        {
          id: 3,
          name: "Tiền thưởng (tăng dần)",
        },
        {
          id: 4,
          name: "Tiền thưởng (giảm dần)",
        },
        {
          id: 5,
          name: "Tiền lương (tăng dần)",
        },
        {
          id: 6,
          name: "Tiền lương (giảm dần)",
        },
      ],

      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //change data
      location: {
        id: 0,
        name: "Tất cả vị trí",
      },
      type_work: {
        id: 0,
        name: "Tất cả loại hình công việc",
      },
      company: {
        id: 0,
        name: "Tất cả công ty",
      },
      status: {
        id: 0,
        name: "Tất cả trạng thái",
      },
      guarantee_type: {
        id: 0,
        name: "Tất cả loại bảo hành",
      },
      search_value: "",
      keyword_type_value: {
        id: 0,
        name: "Tất cả từ khóa",
      },
      sort: {
        id: 0,
        name: "Ngày tạo",
      },
      currency: {
        id: 0,
        name: "Tất cả đơn vị tiền tệ",
      },
      salary: {
        id: 0,
        name: "Tất cả khoản lương",
        salary_from: "",
        salary_to: "",
      },

      //Response data
      total_count: 0,
      search_data: {},
      posts: [],
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
    this.getCitiesForFilter();
    this.getCompaniesForFilter();
    this.searchPost();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "cities/getCitiesSuccess":
          // Get all cities
          if (
            this.locations.length <
            state.cities.citiesData.cities.length + 1
          ) {
            this.locations = this.locations.concat(
              state.cities.citiesData.cities
            );
          }
          break;
        case "companies/getCompaniesSuccess":
          //Get all companies
          if (
            this.companies.length <
            state.companies.companiesData.companies.length + 1
          ) {
            this.companies = this.companies.concat(
              state.companies.companiesData.companies
            );
          }
          break;
        case "post/searchPostSuccess":
          //Get all job
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
    search_data: function () {
      if (this.search_data === undefined) {
      } else {
        this.posts = this.search_data.savePosts;
      }
    },
    currency: function () {
      if (this.currency.id === "VND") {
        this.salaries = this.salary_in_vnd;
      } else if (this.currency.id === "USD") {
        this.salaries = this.salary_in_usd;
      } else {
        this.salary = {
          id: 0,
          name: "Tất cả khoản lương",
          salary_from: "",
          salary_to: "",
        };
        this.salaries = [
          {
            id: 0,
            name: "Tất cả khoản lương",
            salary_from: "",
            salary_to: "",
          },
        ];
      }
      this.searchPost();
    },
    search_value: function () {
      this.searchPost();
    },
    location: function () {
      this.searchPost();
    },
    salary: function () {
      this.searchPost();
    },
    type_work: function () {
      this.searchPost();
    },
    company: function () {
      this.searchPost();
    },
    status: function () {
      this.searchPost();
    },
    guarantee_type: function () {
      this.searchPost();
    },
    sort: function () {
      this.searchPost();
    },
  },
  methods: {
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("companies", ["getCompaniesList"]),
    ...mapActions("post", [
      "searchSavePostForCollaborator",
      "getData",
      "savePost",
      "unsavePost",
    ]),

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    async getCitiesForFilter() {
      this.getCitiesList();
    },

    async getCompaniesForFilter() {
      this.getCompaniesList();
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchPost();
    },
       getImageURL(path) {
      return generateApiUrl(path);
    },

    async searchPost() {
      var keyword_type = this.keyword_type_value.id;
      var keyword = this.search_value;
      var companyId = this.company.id;
      var cityId = this.location.id;
      var negotiable = 0;
      var type_work = this.type_work.id;
      var urgency = 0;
      var status = this.status.id;
      var page_index = this.page_index - 1;
      var page_size = this.page_size;
      var guarantee = this.guarantee_type.id;
      var sortBy = this.sort.id;
      var currency = this.currency.id;
      var salaryFrom = this.salary.salary_from;
      var salaryTo = this.salary.salary_to;

      this.searchSavePostForCollaborator({
        keyword_type,
        keyword,
        companyId,
        cityId,
        negotiable,
        type_work,
        urgency,
        status,
        page_index,
        page_size,
        guarantee,
        sortBy,
        currency,
        salaryFrom,
        salaryTo,
      }).then(() => {});
    },

    showDetail(post_id) {
      this.$router.push({
        path: "/post-detail-for-collaborator?id=" + post_id,
      });
    },

    changeSaveState(post_id, e) {
      this.posts.forEach((post, index) => {
        if (post.id === post_id) {
          this.unsavePost(post_id);
          this.posts.splice(index, 1);
          this.search_data.totalCount = this.search_data.totalCount - 1;
        }
      });

      if (!e) var e = window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    },

    navigateToPostView() {
      this.$router.push({
        path: "/manage-post-for-collaborator",
      });
    },
  },
};
</script>

<template>
  <Layout>
    <div class="mat-manage-save-post">
      <div class="d-flex align-items-center mat-header">
        <div class="d-flex">
          <i
            class="fas fa-briefcase"
            style="font-size: 20px; margin-right: 7px"
          ></i>
        <PageHeader :title="title"/>
        </div>
      </div>

      <!-- <div id="demo-1">Demo 1</div> -->
      <!-- <div id="demo-2">Demo 2</div> -->
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
              <button type="button" v-on:click="searchPost()" class="">
                <!-- {{ $t("post.search") }} -->
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row pb-4">
        <div id="tab" class="d-flex mat-tab-content">
          <div class="tabItem d-flex" v-on:click="navigateToPostView">
            <i class="fas fa-briefcase"></i>
            <span>Tất cả công việc</span>
          </div>
          <div class="tabItem menuListColla">
            <i class="far fa-save"></i>
            <span>Công việc đã lưu</span>
          </div>
        </div>

        <div class="col-12">
          <div class="filterAndJob d-flex col-12">
            <div
              class="filterContent d-flex justify-content-center align-center"
            >
              <div
                class="iconFil d-flex justify-content-center align-center"
                style="margin-right: 7px; color: grey"
              >
                <i
                  class="fas fa-filter"
                  style="margin-right: 7px; font-size: 20px"
                ></i>
              </div>
              <span>Lọc theo</span>
            </div>
            <div class="filterSelect">
              <div class="filterContent" style="width: 140px">
                <multiselect
                  v-model="location"
                  :options="locations"
                  :show-labels="false"
                  :allow-empty="false"
                  label="name"
                  placeholder="Chọn vị trí"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 160px">
                <multiselect
                  v-model="currency"
                  :options="currencies"
                  :show-labels="false"
                  label="name"
                  :allow-empty="false"
                  placeholder="Chọn đơn vị tiền tệ"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 160px">
                <multiselect
                  v-model="salary"
                  :options="salaries"
                  :show-labels="false"
                  label="name"
                  :allow-empty="false"
                  placeholder="Chọn khoảng lương"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 200px">
                <multiselect
                  v-model="type_work"
                  :options="type_works"
                  :allow-empty="false"
                  :show-labels="false"
                  label="name"
                  placeholder="Chọn loại hình công việc"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 140px">
                <multiselect
                  v-model="company"
                  :options="companies"
                  :show-labels="false"
                  :allow-empty="false"
                  label="name"
                  placeholder="Chọn công ty"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 150px">
                <multiselect
                  v-model="status"
                  :options="statuses"
                  :show-labels="false"
                  :allow-empty="false"
                  label="name"
                  placeholder="Chọn trạng thái"
                ></multiselect>
              </div>
              <div class="filterContent" style="width: 160px">
                <multiselect
                  v-model="guarantee_type"
                  :options="guarantee_types"
                  :show-labels="false"
                  :allow-empty="false"
                  label="name"
                  placeholder="Chọn loại bảo hành"
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
                    v-model="sort"
                    label="name"
                    :options="sorts"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 180px"
                    class="mat-muti-sort"
                  ></multiselect>
                </div>
              </div>
            </div>
          </div>

          <div class="mat-list-post">
            <div
              class="mat-post-item"
              v-for="postValue in posts"
              v-bind:key="postValue.post_id"
            >
              <div
                class="mt-3 hovernow d-flex card__hovernow"
                v-on:click="showDetail(postValue.post_id)"
              >
                <div
                  class="col-auto img__hovernow mat-post-image"
                  style="height: auto"
                >
                                  <img :src="getImageURL(postValue.company_image)" />

                </div>
                <div class="body__hovernow d-flex mat-post-content">
                  <div class="col content__hovernow">
                    <div class="d-flex">
                      <div class="titleCompany mat-post-title">
                        <span
                          v-bind:class="{
                            activeBadge: postValue.urgency === true,
                          }"
                          >{{ postValue.title }}</span
                        >
                      </div>

                      <div class="status mat-status-post">
                        <span
                          v-if="postValue.status == 'active'"
                          style="border: 1px solid #34c38f"
                          class="badge bg-success rounded-pill"
                          >{{ postValue.status }}</span
                        >
                        <span
                          v-if="postValue.status == 'pause'"
                          style="border: 1px solid #f1b44c"
                          class="badge bg-warning rounded-pill"
                          >{{ postValue.status }}</span
                        >
                        <span
                          v-if="postValue.status == 'close'"
                          class="badge bg-danger rounded-pill"
                          style="border: 1px solid #e60000"
                          >{{ postValue.status }}</span
                        >
                      </div>
                    </div>

                    <div class="nameCompany mt-1 mat-post-name">
                      <span>{{ postValue.company_name }}</span>
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
                          >{{ sperateMoneyString(postValue.commission) }} {{ postValue.currency }}
                        </span>
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
                          <div class="cardBottomItem col-sm col-xs-12">
                            <div class="headerItem mat-title-bottom">
                              <span>Mức lương</span>
                            </div>
                            <div class="bottomItem mat-text-content">
                              <span v-if="postValue.salary_from >0 && postValue.salary_to>0"
                                >Từ
                                <span class="salaryMoneys"
                                  >{{ sperateMoneyString(postValue.salary_from) }} -
                                  {{ sperateMoneyString(postValue.salary_to) }}
                                  {{ postValue.currency }}
                                </span></span
                              >
                              <span v-else>
                                Thương lượng
                              </span>
                            </div>
                          </div>
                          <div class="cardBottomItem col-sm col-xs-12">
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
                  <div class="col-auto save__hovernow">
                    <div v-on:click="changeSaveState(postValue.id)">
                      <i
                        class="bx bxs-save p-2"
                        style="
                          font-size: 28px;
                          color: rgb(255, 170, 0);
                          margin-bottom: 10rem;
                        "
                      ></i>
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

<style lang='scss'>
.mat-manage-save-post {
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
  .mat-tab-content {
    .tabItem {
      span {
        @media screen and (max-width: 768px) {
          font-size: 12px;
        }
      }
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
      padding-right:10px !important;
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
  .menuListColla {
    color: #5b73e8;
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

  .itemMenu::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #05050536;
  }
  .findAndSort {
    justify-content: space-between;
  }
  .findAndSort .sortOfJob {
    font-family: "Roboto", sans-serif;
    font-weight: 600;
    align-items: center;
  }
  .findAndSort .sortOfJob .titleSort {
    margin: 0 7px;
    font-size: 13px;
  }
  .findAndSort .sortOfJob i {
    font-size: 13px;
  }
  .findAndSort .findOfJob {
    font-size: 13px;
    align-items: center;
    display: flex;
    font-family: "Roboto", sans-serif;
    font-weight: 600;
  }
  .status {
    background: none !important;
  }
  .status {
    padding: 0 5px;
    border-radius: 15px;
    background: none !important;
    margin-left: 10px;
    display: flex;
    align-items: center;
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
    display: flex;
    align-items: center;
    background-color: white;
  }
  .pagingContent {
    width: 100%;
  }
  .pagingContent .iconPaging {
    flex: 1;
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
 margin-right: 10px;
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
  .filterAndJob {
    border-radius: 5px;
    border: 1px solid rgba(221, 221, 221, 0.733);
    min-height: 85px;
    background-color: #ffffff;
    justify-content: space-evenly;
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
  }

  .hovernow {
    /* box-shadow: 0 1px 1px rgba(100, 100, 100, 0.15); */
    min-height: 200px;
    display: flex;
    align-items: center;
    background-color: white;
    border: solid;
    border-width: 0.5px;
    border-color: rgb(220, 220, 220);
    border-radius: 7px;
    transition: box-shadow 0.3s ease-in-out;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      -webkit-box-shadow: 0px 10px 13px -2px #c3c3c3;
      -moz-box-shadow: 0px 10px 13px -2px #c3c3c3;
      box-shadow: 0px 10px 13px -2px #c3c3c3;
      .titleCompany {
        span {
          border-bottom: 2px solid #000;
          color: #000;
        }
        .activeBadge {
          border-bottom: 2px solid #e60000 !important;
          color: #e60000;
        }
      }
    }

    .body__hovernow {
      flex-basis: 100%;
    }

    .titleCompany {
      .activeBadge {
        color: #e60000;
      }
      span {
        border-bottom: 2px solid transparent;
      }
    }
    .nameCompany {
      span {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.54);
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
  }
  .titleCompany h4:hover {
    color: #000;
  }
  .titleCompany {
    transition: all 0.2s ease-in;
  }

  .formSearch {
    .searchInput {
      font-family: "Roboto", sans-serif !important;
      font-weight: 500 !important;
      height: 45px;
    }
    .searchInputForm {
      transition: all 0.2s ease-in;
      &:hover {
        border: 1.5px solid #5b73e8;
      }
    }
    .searchInput .multiselect__tags {
    }
  }
  .filterSelect {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;

    .filterContent {
      white-space: nowrap;
    }
  }
  @media screen and (max-width: 767px) {
    .searchInputForm {
      font-size: 13px;
      height: 35px;
    }
  }
  @media (max-width: 1480px) {
    .filterAndJob {
      display: block !important;
      padding: 15px;

      > .filterContent {
        width: 100% !important;
        justify-content: start !important;
      }
    }
  }

  @media (max-width: 1199.98px) {
    body[data-layout="horizontal"] .page-content {
      margin-top: 0;
    }
    .menuPictureContent {
      display: none;
    }
  }

  @media (max-width: 991px) {
    .searchKeywordInput {
      padding-bottom: 1.2rem;
    }
  }
  @media (min-width: 642.0001px) and (max-width: 721px) {
    .filterSelect {
      .filterContent {
        width: 33.33333% !important;
      }
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
        width: 100% !important;
      }
    }
  }

  @media (min-width: 768px) and (max-width: 1024px) {
  }

  @media (min-width: 642px) and (max-width: 1480px) {
  }
}
</style>