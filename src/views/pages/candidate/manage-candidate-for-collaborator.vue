
<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import Swal from "sweetalert2";
import { mapActions } from "vuex";
import { sperateMoney } from "../../../helpers/common/Ultilities";
import { generateApiUrl } from "../../../helpers/common/APIConstants";

export default {
  isActive: false,
  page: {
    title: "Danh sách ứng viên",
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
      title: "Danh sách ứng viên",
      timer: 0,
      // Locations
      locations: [
        {
          id: 0,
          name: "Tất cả vị trí",
        },
      ],
      location: {
        id: 0,
        name: "Tất cả vị trí",
      },

      //Salary and Currency
      currencies: [
        {
          id: 0,
          name: "Tất cả tiền tệ",
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
          name: "<= 10.000.000 VND",
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
      currency: {
        id: 0,
        name: "Tất cả tiền tệ",
      },
      salary: {
        id: 0,
        name: "Tất cả khoản lương",
        salary_from: "",
        salary_to: "",
      },

      //Sort
      sorts: [
        {
          id: 0,
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Tên ứng viên",
        },
        {
          id: 2,
          name: "Tiêu đề hồ sơ",
        },
        {
          id: 3,
          name: "Trạng thái",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày tạo",
      },

      //Date
      dateFrom: "",
      dateTo: "",
      timestampFrom: 0,
      timestampTo: 0,

      // Search
      search_require: "",
      search_optional: "",

      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //Response data
      candidates: [],
      total_count: 0,
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
    this.searchCandidate();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "cities/getCitiesSuccess":
          //Get cities
          if (
            this.locations.length <
            state.cities.citiesData.cities.length + 1
          ) {
            this.locations = this.locations.concat(
              state.cities.citiesData.cities
            );
          }
        case "candidates/searchCandidateForCollaboratorSuccess":
          //Get all candidate
          this.candidates = state.candidates.candidateData.candidates;
          this.total_count = state.candidates.candidateData.totalCount;
          this.page_index = state.candidates.candidateData.pageIndex + 1;
          this.total_pages = state.candidates.candidateData.totalPages;
        case "candidates/updateCandidateStatusSuccess":
        // this.searchCandidate();
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    currency: function () {
      if (this.currency.id === "VND") {
        this.salaries = this.salary_in_vnd;
      } else if (this.currency.id === "USD") {
        this.salaries = this.salary_in_usd;
      } else {
        this.salary = {
          id: 0,
          name: "Tất cả",
          salary_from: "",
          salary_to: "",
        };
        this.salaries = [
          {
            id: 0,
            name: "Tất cả",
            salary_from: "",
            salary_to: "",
          },
        ];
      }
      this.searchCandidate();
    },
    dateFrom: function () {
      const date = new Date(document.getElementById("dateFrom").value);
      date.setHours(0, 0, 0, 0);
      this.timestampFrom = date.getTime();
    },
    dateTo: function () {
      const date = new Date(document.getElementById("dateTo").value);
      date.setHours(0, 0, 0, 0);
      this.timestampTo = date.getTime();
    },
    Location: function () {
      this.searchCandidate();
    },
    salary: function () {
      this.searchCandidate();
    },
    sort: function () {
      this.searchCandidate();
    },
    timestampFrom: function () {
      this.searchCandidate();
    },
    timestampTo: function () {
      this.searchCandidate();
    },
    search_require: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchCandidate();
      }, 800);
    },
    search_optional: function () {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.searchCandidate();
      }, 800);
    },
  },
  methods: {
    ...mapActions("cities", ["getCitiesList"]),
    ...mapActions("candidates", [
      "searchCandidateForCollaborator",
      "updateCandidateStatus",
      "deleteCandidate",
    ]),

    // Get file extension
    getFileExtension(path) {
      return /[.]/.exec(path) ? /[^.]+$/.exec(path) : undefined;
    },

    //Open CV in new tab
    openCV(path) {
      const cv_type = this.getFileExtension(
        path
      )[0];
      switch (cv_type) {
          case "pdf":
            window.open(
              generateApiUrl(path),
              "_blank"
            );
            break;
          case "docx":
            window.open("https://view.officeapps.live.com/op/view.aspx?src=" +
              generateApiUrl(path) +
              "&embedded=true",
              "_blank"
            );
            break;
        }
    },

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    getCitiesForFilter() {
      this.getCitiesList();
    },

    handleShow() {
      if ((document.querySelector(".tool").classList = "open")) {
        document.querySelector(".tool").classList.add = "open";
      }
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchCandidate();
    },

    searchCandidate() {
      const salary_from = this.salary.salary_from;
      const salary_to = this.salary.salary_to;
      const date_from = this.timestampFrom;
      const date_to = this.timestampTo;
      const city_ids = this.location.id;
      const keyword_cv_require = this.search_require;
      const keyword_cv_optional = this.search_optional;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;
      const sort_by = this.sort.id;
      const currency = this.currency.id;

      this.searchCandidateForCollaborator({
        salary_from,
        salary_to,
        date_from,
        date_to,
        city_ids,
        keyword_cv_require,
        keyword_cv_optional,
        page_index,
        page_size,
        sort_by,
        currency,
      });
    },

    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    confirm(candidate_id) {
      Swal.fire({
        title: "Bạn chắc chắn chứ ?",
        text: "Dữ liệu sẽ bị xóa vĩnh viễn",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Xóa nó",
        cancelButtonText: "Không",
      }).then((result) => {
        // if (result.value) {
        //   Swal.fire("Deleted!", "Your file has been deleted.", "success");
        // }
        if (result.isConfirmed) {
          this.deleteCandidate({
            candidate_id,
          }).then(() => {
            this.candidates.forEach((candidate, index) => {
              if (candidate.id === candidate_id) {
                this.candidates.splice(index, 1);
                this.total_count = this.total_count - 1;
              }
            });
          });
        } else {
        }
      });
    },

    updateStatus(candidate_id, candidate_status) {
      this.updateCandidateStatus({ candidate_id, candidate_status });
      this.candidates.forEach((candidate) => {
        if (candidate.id === candidate_id) {
          candidate.status =
            candidate_status == 0 ? "Already has a job" : "Looking for a job";
        }
      });
    },

    updateCandidate(id) {
      return "/update-candidate?id=" + id;
    },

    viewDetail(id) {
      this.$router.push({
        path: this.updateCandidate(id),
      });
    },
  },
};
</script>


<template>
  <Layout>
    <div class="mat-list-candidate-collab-collab">
      <div class="">
        <!-- <div class="tool-bar d-flex align-items-center">
          <div style="flex: 1" class="d-flex align-items-center">
            <h4><i class="fas fa-user-friends"></i>Danh sách ứng viên</h4>
          </div> -->
        <!-- Create candidate button -->
        <div class="d-flex">
          <i
            class="fas fa-user-friends"
            style="font-size: 20px; margin-right: 7px"
          ></i>
                 <PageHeader :title="title"/>
          </div>

          <div class="handleBtn">
            <a href="./create-candidate" class="ml-3">
              <button class="mat-btn-action-add-candidate">
                <i class="fa fa-plus-circle" aria-hidden="true"></i> Tạo ứng
                viên
              </button>
            </a>
        </div>
      </div>
      <!-- Filter bar -->
      <form class="filter mt-3 position-relative" action="">
        <div
          class="
            mat-filter-search-candidate-collab
            mt-3
            justify-content-between
            col-12
            d-flex
            flex-wrap
            align-items-center
          "
        >
          <div class="position-relative mat-input-search-candidate-collab">
            <i class="fas fa-search"></i>
            <input
              type="text"
              id="inputEmail4"
              placeholder="CV bao gồm các từ khóa sau"
              v-model="search_require"
            />
          </div>

          <div class="mat-handle-action-candidate-collab">
            <button
              type="button"
              class="btn btn-search"
              v-on:click="searchCandidate"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
        <div
          class="
            mat-filter-candidate-collab
            flex-wrap
            align-items-center
            d-flex
            mt-4
          "
        >
        <div class="d-flex flex-wrap filter-candidate-collab__filter">
          <span style="display: flex; align-items: center; margin-right: 10px"
            ><i class="fas fa-filter" style="font-size: 22px"></i>Lọc theo</span
          >
          <div class="mat-filter-select-candidate-collab">
            <div class="mat-option-filter-candidate-collab">
              <div class="mat-filter-text">
                <span class="mat-title-filter"> Vị trí </span>
              </div>
              <multiselect
                v-model="location"
                label="name"
                :options="locations"
                :allow-empty="false"
                :show-labels="false"
                placeholder="Chọn vị trí"
                class="mat-multiselect-location"
              >
              </multiselect>
            </div>
            <div class="mat-option-filter-candidate-collab">
              <div class="mat-filter-text">
                <span class="mat-title-filter"> Tiền tệ </span>
              </div>
              <multiselect
                v-model="currency"
                label="name"
                :options="currencies"
                :allow-empty="false"
                :show-labels="false"
                placeholder="Chọn đơn vị tiền tệ"
                class="mat-multiselect-money"
              ></multiselect>
            </div>
            <div class="mat-option-filter-candidate-collab">
              <div class="mat-filter-text">
                <span class="mat-title-filter"> Lương </span>
              </div>
              <multiselect
                v-model="salary"
                label="name"
                :options="salaries"
                :allow-empty="false"
                :show-labels="false"
                placeholder="Chọn khoản lương"
                class="mat-multiselect-salary"
              ></multiselect>
            </div>

            <div class="mat-option-filter-candidate-collab">
              <div class="mat-filter-text">
                <span class="mat-title-filter"> Ngày bắt đầu </span>
              </div>
              <input
                id="dateFrom"
                type="date"
                class="form-control mat-multiselect-dateto"
                placeholder="Date from"
                v-model="dateFrom"
              />
            </div>
            <div class="mat-option-filter-candidate-collab">
              <div class="mat-filter-text">
                <span class="mat-title-filter"> Ngày kết thúc </span>
              </div>
              <input
                id="dateTo"
                type="date"
                class="form-control mat-multiselect-dateto"
                placeholder="Date to"
                v-model="dateTo"
              />
            </div>
          </div>
        </div>
        </div>
      </form>
      
      <div class="mat-list-candidate-collab mt-2">
        <div class="mat-header-candidate justify-content-between">
          <div
            class="d-flex align-items-center"
            style="font-size: 16px; font-weight: 400"
          >
            <span
              class="mat-find-candidate"
              style="margin-right: 19px; font-style: italic"
              v-if="total_count > 0"
              >Tìm thấy
              <span class="titleFindCandidate"> {{ total_count }} </span>ứng
              viên</span
            >
            <span
              class="mat-find-candidate"
              style="font-style: italic"
              v-if="total_count === 0"
              >Không tìm thấy ứng viên nào</span
            >
          </div>
          
          <div class="sortBy align-items-center flex-wrap mat-sort-candidate">
            <div>
              <span class="mat-find-candidate"
                ><i class="fas fa-exchange-alt"></i>Sắp xếp theo:</span
              >
            </div>
            <multiselect
              v-model="sort"
              label="name"
              :options="sorts"
              :allow-empty="false"
              :show-labels="false"
              style="width: 200px; z-index: 999"
            ></multiselect>
          </div>
        </div>
        <div
          class="mainTable mt-4"
          style="width: 100%; background: #fff; height: auto"
        >
          <div class="table-scroll">
            <table class="table" style="white-space: nowrap">
              <thead>
                <tr style="border: 1px solid #eae9e9; background: #f1f1f1">
                  <th scope="col" class="mat-title-table-candidate">
                    Họ và tên
                  </th>
                  <th scope="col" class="mat-title-table-candidate">
                    Tiêu đề hồ sơ
                  </th>
                  <th scope="col" class="mat-title-table-candidate">
                    Ngày tạo
                  </th>
                  <th scope="col" class="mat-title-table-candidate">Lương</th>
                  <th scope="col" class="mat-title-table-candidate">Email</th>
                  <th scope="col" class="mat-title-table-candidate">
                    Số điện thoại
                  </th>
                  <th scope="col" class="mat-title-table-candidate">
                    Trạng thái
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody v-for="candidate in candidates" v-bind:key="candidate.id">
                <tr class="tableMain">
                  <th class="d-flex mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ candidate.name }}
                  </th>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ candidate.profile_title }}
                  </td>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ getDateString(candidate.created_date) }}
                  </td>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ sperateMoneyString(candidate.salary_from) }} - {{ sperateMoneyString(candidate.salary_to) }} {{ candidate.currency }}
                  </td>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ candidate.email }}
                  </td>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ candidate.phone }}
                  </td>
                  <td class="mat-title-table-candidate" v-on:click="viewDetail(candidate.id)">
                    {{ candidate.status === "Looking for a job" ? "Đang tìm việc" : "Đã đi làm" }}
                  </td>

                  <!-- <div class="d-flex" style="position: relative">
                    <span class="status">{{candidate.status}}</span>
                  </div> -->
                  <td class="actionHover">
                    <b-dropdown
                      class="itemAction"
                      right
                      variant="primary"
                      style="padding: 0"
                    >
                      <i slot="button-content" class="fas fa-ellipsis-v"></i>

                      <b-dropdown-item
                        v-on:click="updateStatus(candidate.id, 0)"
                      >
                        <i
                          class="fas fa-briefcase"
                          style="margin-right: 10px"
                        ></i
                        >Đã đi làm</b-dropdown-item
                      >
                      <b-dropdown-item
                        href="#"
                        v-on:click="updateStatus(candidate.id, 1)"
                      >
                        <i class="fas fa-eye" style="margin-right: 10px"></i
                        >Đang tìm việc</b-dropdown-item
                      >
                      <b-dropdown-item
                        v-on:click="openCV(candidate.cv)"
                      >
                        <i
                          class="fas fa-external-link-alt"
                          style="margin-right: 10px"
                        ></i
                        >Mở CV trong tab mới</b-dropdown-item
                      >
                      <b-dropdown-item
                        v-bind:to="updateCandidate(candidate.id)"
                      >
                        <i class="fas fa-pen" style="margin-right: 10px"></i>Sửa
                        ứng viên</b-dropdown-item
                      >
                      <b-dropdown-item v-on:click="confirm(candidate.id)">
                        <i class="fas fa-trash" style="margin-right: 10px"></i
                        >Xóa</b-dropdown-item
                      >
                    </b-dropdown>
                  </td>
                </tr>

                <!-- Element to collapse -->
              </tbody>
            </table>
          </div>
          <div
            class="
              mat-paging-candidate-collab-item
              justify-content-end
              d-flex
              align-items-center
            "
          >
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
          <!-- <div class="col-12">
              <b-collapse id="collapse" visible class="mt-1">
                <div
                  class="collapse show"
                  aria-labelledby="headingOne"
                  data-parent="#accordion"
                  id="accordion"
                >
                  <div class="card-body">
                    <div class="card">
                      <div class="card-header d-flex" style="padding: 14px">
                        <div class="avatar">
                          <img src="none.png" alt="" class="arounded" />
                        </div>
                        <div class="info ml-3 d-flex">
                          <i class="fas fa-user-circle"></i>
                          <div style="margin-left: 5px">
                            <div class="name">
                              <h2>Nguyễn Thành Tài</h2>
                            </div>
                            <div>
                              <span class="status">Đang tìm việc</span>
                            </div>
                            <div class="title-doc">.Net</div>
                          </div>
                        </div>
                      </div>
                      <div class="card-body row">
                        <div class="contact col-md-5">
                          <div class="contactUser d-flex">
                            <div class="">
                              <i class="fas fa-envelope"></i>
                            </div>
                            <div class="detailContact">
                              <span>Email</span>
                              <div class="inforDetail">
                                <span>taideptrai1106@gmail.com</span>
                              </div>
                            </div>
                          </div>
                          <div class="contactUser d-flex">
                            <div class="">
                              <i class="fas fa-phone-alt"></i>
                            </div>
                            <div class="detailContact">
                              <span>Số điện thoại</span>
                              <div class="inforDetail">
                                <span>(+84)909090909</span>
                              </div>
                            </div>
                          </div>
                          <div class="contactUser d-flex">
                            <div class="">
                              <i class="fas fa-map-marker-alt"></i>
                            </div>
                            <div class="detailContact">
                              <span>Khu vực</span>
                              <div class="inforDetail">
                                <span>Hồ Chí Minh</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="question col-md-7">
                          <div class="mb-4">
                            <label for=""
                              >Lí do ứng viên phù hợp với vị trí này</label
                            >
                            <input
                              type="text"
                              placeholder="Good"
                              class="form-reason"
                              id=""
                            />
                          </div>
                          <div>
                            <label for=""
                              >Tại sao ứng viên thay đổi công việc và kỳ vọng
                              của cô ấy / anh ấy là gì</label
                            >
                            <input
                              type="text"
                              placeholder="Good"
                              class="form-reason"
                              id=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </b-collapse>
            </div> -->
        </div>
      </div>
    </div>
  </Layout>
</template>

<style lang='scss'>
.mat-sort-candidate {
  display: flex;
}
.mat-find-candidate {
  @media screen and (max-width: 768px) {
    font-size: 14px;
  }
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
}
.mat-title-table-candidate {
  @media screen and (max-width: 767px) {
    font-size: 14px;
  }
  @media screen and (max-width: 767px) {
    font-size: 12px;
  }
}
.mat-paging-candidate-collab {
  width: 100%;
}
.mat-paging-candidate-collab .iconPaging {
  flex: 1;
}
.mat-paging-candidate-collab-item {
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
.mat-multiselect-location {
  width: 120px;
    @media screen and (max-width:480px){
    width: 150px;
  }
}
.mat-multiselect-money {
  width: 120px;
    @media screen and (max-width:480px){
    width: 150px;
  }
}
.mat-multiselect-salary {
  width: 180px;
  @media screen and (max-width:480px){
    width: 200px;
  }
}
.mat-multiselect-dateto {
  width: 150px;
  @media screen and (max-width:480px){
    width: 170px;
  }
}
.mat-header-candidate-collab {
  display: flex;
  align-items: center;
  .mat-title-header-collab-candidate {
    font-size: 20px;
    font-weight: 600;
    color: #495057;
    flex: 1;
    @media screen and (max-width: 768px) {
      font-size: 18px;
    }
    @media screen and (max-width: 480px) {
      font-size: 16px;
    }
  }
}
.titleFindCandidate {
  color: #5b73e8;
}
.actionHover {
  .dropdown-item:active {
    background-color: #e8f3fd;
  }
  .dropdown-item:hover,
  .dropdown-item:focus {
    color: #5b73e8;
    background-color: #e8f3fd;
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
input[type="date"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

input[type="date"] {
  -moz-appearance: textfield;
}
.modal-dialog-scrollable {
  width: 95%;
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
.seenCv {
  margin-left: 5px;
  font-size: 10px;
  background-color: #5b73e8;
  padding: 3px 10px;
  color: white;
  border-radius: 20px;
  transition: all 0.2s ease-in;
}
.seenCv:hover {
  background-color: #3452e9;
}
.info i {
  font-size: 35px;
  margin-top: 15px;
  color: #b1b1b1;
}

.mat-filter-search-candidate-collab .mat-input-search-candidate-collab {
  display: flex;
  align-items: center;
  width: 85%;
  border-radius: 5px;
  height: 45px;
}

.mat-filter-search-candidate-collab .mat-input-search-candidate-collab input {
  padding-left: 30px;
  width: 100%;
  height: 100%;
  border: 1px solid #eae9e9;
  border-radius: 5px;

  transition: all 0.2s ease-in;
  @media screen and (max-width: 768px) {
    fon-size: 14px;
  }
  @media screen and (max-width: 480px) {
    fon-size: 12px;
  }
}

.mat-filter-search-candidate-collab
  .mat-input-search-candidate-collab
  input:hover {
  border: 1.5px solid #5b73e8;
}
.mat-list-candidate-collab-collab {
  .mat-filter-search-candidate-collab .mat-input-search-candidate-collab {
    i {
      font-size: 16px;
      position: absolute;
      left: 10px;
    }
  }
}
.mat-list-candidate-collab {
  .mat-header-candidate{
    display: flex;
    @media screen and (max-width: 480px){
        display:block;
    }
  }
}
.mat-handle-action-candidate-collab {
  margin-left: 15px;
  width: calc(15% - 15px);

  .btn-search {
    width: 100% !important;
    background-color: #5b73e8;
    color: white;
    height: 45px;
    transition: all 0.2s ease-in;
    &:hover {
      background-color: #415ef1;
    }
  }
  @media screen and (max-width: 767px) {
    margin-left: 10px;
  }
  @media screen and (max-width: 480px) {
    margin-left: 0px;
    margin-top: 5px;
  }
}

.date::-webkit-calendar-picker-indicator,
.date::-webkit-inner-spin-button {
  border: none;
}
.mat-option-filter-candidate-collab {
  // &:not(:last-child) {
  //   margin-right: 18px;
  // }
  i {
    position: absolute;
    right: 0;
    bottom: 15px;
    z-index: 999;
    color: #666565;
  }
  .multiselect__input,
  .multiselect__single {
    background-color: #3030;
  }
  .multiselect__tags {
    border: none !important;
    border-radius: 0;
    border-bottom: 1.5px solid #b1b1b1 !important;
    background-color: transparent !important;
    margin-top: 2px !important;
    font-family: "Roboto", sans-serif !important;
    font-weight: 500 !important;
  }
}

.sortBy {
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

.bg-danger {
  background-color: #fc5454;
}
a {
  text-decoration: none;
  color: #000;
}
a:hover {
  text-decoration: none;
  color: #000;
}
.handleBtn {
  display: flex;
  justify-content: flex-end;
}

.mat-btn-action-add-candidate {
  color: #000;
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
  @media screen and (max-width: 768px) {
    height: 35px;
    padding: 3px 6px;
    font-size: 14px;
  }
  @media screen and (max-width: 480px) {
    height: 30px;
    padding: 3px 5px;
    font-size: 12px;
  }
}
.mat-btn-action-add-candidate:hover {
  background: #fdad19;
}
.body {
  height: auto;
  border: 1px solid #eae9e9;
  border-radius: 10px;
  margin-top: 15px;
}

.btn:focus {
  box-shadow: none;
}

.btn-search,
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

.mat-filter-candidate-collab .form-control,
.mat-list-candidate-collab .sort .form-control {
  border: none;
  border-bottom: 1.5px solid #b1b1b1;
  border-radius: 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #315fb5;
}

.filter .mat-filter-candidate-collab {
  background-color: #fff;
  border-radius: 10px;
  flex-wrap: wrap;
  justify-content: start;
  padding: 15px 10px;
  //   input {
  //   font-size: 14px;
  //   padding-right: 0;
  //   width: 200px;
  // }

  
  // .filter-candidate-collab__filter{
  //   width: 65%;

  //   @media (max-width: 768px) {
  //     width: 100%;
  //     justify-content: flex-start;
  //   }
  // }
  
  .mat-sort-candidate{
    width: 35%;
    justify-content: flex-end;

    @media (max-width: 992px) {
      width: 100%;
      justify-content: flex-start;
    }
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
.mat-filter-search-candidate-collab {
  // height: 50px;
}

.mat-filter-search-candidate-collab button {
  border: none;
  outline: none;
}




.mat-list-candidate-collab .thead {
  background-color: #ececec;
  font-size: 15px;
  font-weight: bold;
}

.mat-list-candidate-collab .thead > div {
  padding: 15px 10px;
}

.tbody > div#accordion {
  padding: 15px 0;
}

.mat-list-candidate-collab .thead.row {
  margin-left: 0;
  margin-right: 0;
}

.mat-list-candidate-collab tbody {
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
  padding: 0;
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
  border-radius: 5px;
  padding: 5px;
  width: 250px;
  background-color: #eae9e9;
}

.tool i[class^="fa"] {
  margin-right: 15px;
}

.tool.open {
  visibility: visible;
  opacity: 1;
}

.tool ul {
  border-radius: 5px;
}
.tool ul .listItem {
  background-color: #333;
}
.tool ul li:hover {
  background-color: #333;
}
.status {
  padding: 3px 15px;
  border-radius: 15px;
  background-color: #5b73e8;
}

.name h2 {
  font-size: 24px;
}

.info div {
  margin-bottom: 5px;
}

.contactUser {
  margin-bottom: 25px;
  align-items: center;
}
.contactUser i {
  margin-top: 3px;
  font-size: 22px;
  margin-right: 15px;
}
.contactUser .detailContact .inforDetail {
  font-weight: bold;
}

.question input {
  width: 100%;
  padding: 14px;
}
.form-reason {
  border: none;
  background-color: rgba(0, 0, 0, 0.03);
  outline: none;
  pointer-events: none;
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
.mat-title-filter {
  @media screen and (max-width: 768px) {
    font-size: 13px;
  }
  @media screen and (max-width: 480px) {
    font-size: 12px;
  }
}

.mat-option-filter-candidate-collab {
  margin-right: 10px;
  position: relative !important;
  .mat-title-filter {
    color: #4e4e4e;
  }
  align-items: center;
  display: flex;

  
}


.mat-filter-select-candidate-collab {
  display: flex;
  flex-wrap: wrap;
  justify-content: start;

  .filterContent {
    white-space: nowrap;
  }
}

  
.mat-filter-search-candidate-collab {
  @media (min-width: 768px) and (max-width: 1023.98px) {
    .mat-input-search-candidate-collab,
    .mat-handle-action-candidate-collab .btn-search {
      height: 40px;
    }
  }
  @media (max-width: 767.98px) {
    .mat-input-search-candidate-collab,
    .mat-handle-action-candidate-collab .btn-search {
      height: 35px;
    }
  }
}

@media (max-width: 1480px) {
  .mat-filter-candidate-collab {
    padding: 15px;

    > span {
      width: 100% !important;
      justify-content: start !important;
    }
  }

  .mat-filter-select-candidate-collab {
    justify-content: start;

    .mat-option-filter-candidate-collab {
      width: 33.33333%;
      margin-right: 0;

      // @media (max-width: 768px) {
      //   width: 50%;
      // }

      @media (max-width: 542px) {
        width: 100%;
      }
    }
  }
}

@media (max-width: 767.98px) {
  .mat-filter-search-candidate-collab {
    .mat-input-search-candidate-collab {
      width: 80% !important;
    }

    .mat-handle-action-candidate-collab {
      width: calc(20% - 15px);

      .btn-search {
        padding: 0;
      }
    }
  }
}

@media (max-width: 642px) {
  .mat-filter-candidate-collab {
    .mat-filter-select-candidate-collab {
      .mat-option-filter-candidate-collab {
        margin-right: 0;

        .multiselect,
        input[type="date"] {
        }
      }
    }
  }
}

@media (max-width: 540px) {
  .mat-list-candidate-collab {
    .header {
      .sort {
        margin-bottom: 10px;
      }
    }
  }
}

@media (max-width: 480px) {
  .mat-filter-candidate-collab {
    .mat-filter-select-candidate-collab {
      .mat-option-filter-candidate-collab {
      }
    }
  }

  .mat-filter-search-candidate-collab {
    .mat-input-search-candidate-collab {
      width: 100% !important;
    }

    .mat-handle-action-candidate-collab {
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
</style>
  
  
