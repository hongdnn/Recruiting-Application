<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import Swal from "sweetalert2";
import { mapActions } from "vuex";
import { sperateMoney } from "../../../helpers/common/Ultilities";
import ExcelJS from "exceljs";
import FileSaver from "file-saver";
import jwt_decode from "jwt-decode";

export default {
  page: {
    title: "Danh sách thanh toán",
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
      title: "Danh sách thanh toán",
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],

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
          name: "Waiting",
        },
        {
          id: 2,
          name: "Payment completed",
        },
        {
          id: 3,
          name: "Payment failed",
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
          name: "Ngày tạo",
        },
        {
          id: 1,
          name: "Tên placement",
        },
        {
          id: 2,
          name: "Tên công việc",
        },
      ],
      sort: {
        id: 0,
        name: "Ngày tạo",
      },

      // Statuses
      selected_statuses: [
        {
          id: "1",
          name: "Waiting",
        },
        {
          id: "2",
          name: "Payment completed",
        },
        {
          id: "3",
          name: "Payment failed",
        },
      ],
      selected_status_1: null,
      selected_status_2: null,

      // Search
      search_value: "",

      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //Response data
      introductions: [],
      placements: [],
      placement_data: null,
      //checkbox
      checked_all_placement: false,
      arrChecked: [],
    };
  },
  computed: {
    notification() {
      return this.store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  mounted() {
    this.getCompaniesForFilter();
    this.searchPlacement();
    this.decodeToken();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      //Get companies
      switch (mut.type) {
        case "companies/getCompaniesSuccess":
          if (
            this.companies.length <
            state.companies.companiesData.companies.length + 1
          ) {
            this.companies = this.companies.concat(
              state.companies.companiesData.companies
            );
          }
          break;
        case "placement/searchPlacementSuccess":
          this.placements = state.placement.placementsData.placements;
          this.total_pages = state.placement.placementsData.totalPages;
          this.page_index = state.placement.placementsData.pageIndex + 1;
          break;
        case "placement/getPlacementSuccess":
          this.placement_data = state.placement.placementData.placement;
          if (this.placement_data.rewardAmount.length == 1) {
            this.selected_status_1 = this.getStatusObject(
              this.placement_data.placementStatus[0]
            );
          } else {
            this.selected_status_1 = this.getStatusObject(
              this.placement_data.placementStatus[0]
            );
            this.selected_status_2 = this.getStatusObject(
              this.placement_data.placementStatus[1]
            );
          }
          break;
        case "placement/updatePlacementSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.searchPlacement();
              this.$bvModal.hide("show-placement");
            }
          );
          break;
        case "placement/updatePlacementFailure":
          Swal.fire("Cập nhật trạng thái không thành công", "", "error").then(
            () => {}
          );
          break;
        case "placement/exportExcelSuccess":
          // const data = state.placement.excelData;

          // let blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
          // url = window.URL.createObjectURL(blob);

          // window.open(url);

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
        this.searchPlacement();
      }, 800);
    },
    company: function () {
      this.searchPlacement();
    },
    status: function () {
      this.searchPlacement();
    },
    sort: function () {
      this.searchPlacement();
    },
  },
  methods: {
    ...mapActions("placement", [
      "searchPlacementByEmployer",
      "getPlacementDetail",
      "updatePlacementStatus",
      "exportExcel",
    ]),
    ...mapActions("companies", ["getCompaniesList"]),

    decodeToken() {
      var decoded = jwt_decode(this.userStorage.token)
      this.user_permissions = decoded.permission;
    },

    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },

    async buildFile(columns, data, filename, sheetName) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = columns;
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { horizontal: "center" };
      data.forEach((e, index) => {
        // row 1 is the header.
        const row = worksheet.getRow(index + 2);
        row.alignment = { wrapText: true, vertical: "top", horizontal: "left" };
        row.values = e;
        worksheet.addRow({ row });
      });
      let dataMax = [];
      let max = 0;
      worksheet.columns.forEach(function (column, i) {
        dataMax = [];
        column.eachCell({ includeEmpty: true }, (cell) => {
          dataMax.push(cell.value?.toString().length || 0);
        });
        max = Math.max(...dataMax);
        column.width = (max < 10 ? 10 : max) + 2;
      });
      const path = "./assets/excel/" + filename;

      workbook.xlsx
        .writeBuffer()
        .then((buffer) =>
          FileSaver.saveAs(new Blob([buffer]), `${Date.now()}_placement.xlsx`)
        )
        .catch((err) => console.log("Error writing excel export", err));
    },

    async exportExcelPlacement() {
      var dataToExport = [];

      this.arrChecked.forEach((item) => {
        dataToExport.push({
          candidate_introduction_id: item.candidate_introduction_id,
          candidateName: item.candidateName,
          postTitle: item.postTitle,
          company: item.company,
          collaboratorName: item.collaboratorName,
          collaboratorEmail: item.collaboratorEmail,
          collaboratorPhone: item.collaboratorPhone,
          bankName: item.bankName,
          bankAccountName: item.bankAccountName,
          bankNumber: item.bankNumber,
          rewardAmount: item.rewardAmount,
          bonus: item.bonus === null ? 0 : item.bonus,
          currency: item.currency,
          status: item.paymentStatus,
          placementDate: item.placementDate,
          percentWarranty: item.percentWarranty,
          warrantyType: item.warrantyType,
        });
      });

      const data = {
        dataToExport: dataToExport,
      };

      const filename = "Placement_" + new Date().toDateString() + ".xlsx";

      for (let t of dataToExport) {
        let commission = "";
        let mainStatus = "";
        let placementDate = "";
        if (t.bonus === null) {
          t.bonus = 0;
        }
        for (let index = 0; index < t.rewardAmount.length; index++) {
          let status = t.status[index];
          let com = t.rewardAmount[index];
          let placeDate = t.placementDate[index];
          commission += "Stage "+(index+1)+" : "+ com + "\n";
          mainStatus += "Stage "+(index+1)+" : "+ status + "\n";
          placementDate +="Stage "+(index+1)+" : "+ new Date(placeDate).toDateString() + "\n";
        }
        delete t.rewardAmount;
        delete t.status;
        delete t.placementDate;
        t["commission"] = commission;
        t["statusOfPlacement"] = mainStatus;
        t["listPlacementDate"] = placementDate;
      }
      const columns = [
        { header: "Introduction ID", key: "candidate_introduction_id" },
        { header: "Candidate name", key: "candidateName" },
        { header: "Post title", key: "postTitle" },
        { header: "Company", key: "company" },
        { header: "Collaborator name", key: "collaboratorName" },
        { header: "Collaborator email", key: "collaboratorEmail" },
        { header: "Collaborator phone", key: "collaboratorPhone" },
        { header: "Bank name", key: "bankName" },
        { header: "Bank account name", key: "bankAccountName" },
        { header: "Bank number", key: "bankNumber" },
        { header: "Bonus", key: "bonus" },
        { header: "Commission", key: "commission" },
        { header: "Currency", key: "currency" },
        { header: "Status of placement", key: "statusOfPlacement" },
        { header: "Placement date", key: "listPlacementDate" },
        { header: "Percent warranty", key: "percentWarranty" },
        { header: "Warranty type", key: "warrantyType" },
      ];

      await this.buildFile(columns, dataToExport, filename, "Placements");
    },

    getCompaniesForFilter() {
      this.getCompaniesList();
    },

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.searchPlacement();
      let listItem = document.getElementsByClassName("custom-control-checkbox");
      for (let i = 0; i < listItem.length; i++) {
        listItem[i].checked = false;
      }
      this.arrChecked = [];
      this.checked_all_placement = false;
    },

    sperateMoneyString(money) {
      if (money != null) {
        return sperateMoney(money + "");
      } else {
        return "";
      }
    },

    searchPlacementButtonAction() {
      if (this.checkPermisstion("placement.all") || this.checkPermisstion("placement.search")) {
        this.searchPlacement();
      } else {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
      }
    },

    searchPlacement() {
      const keyword = this.search_value;
      const companyIds = this.company.id;
      const paymentStatus = this.status.id;
      const pageIndex = this.page_index - 1;
      const pageSize = this.page_size;
      const sortBy = this.sort.id;

      this.searchPlacementByEmployer({
        keyword,
        companyIds,
        paymentStatus,
        pageIndex,
        pageSize,
        sortBy,
      });
    },

    getDateString(timestamp) {
      const date = new Date(timestamp);
      const dateString = "0" + date.getDate();
      const monthString = "0" + (date.getMonth() + 1);
      const yearString = date.getFullYear();
      return (
        dateString.substr(-2) + "/" + monthString.substr(-2) + "/" + yearString
      );
    },

    viewDetail(introduction_id) {
      this.$router.push({
        path: "/refer-candidate-detail?id=" + introduction_id,
      });
    },

    showDetail(placement_id) {
      if (
        !(
          this.checkPermisstion("placement.all") ||
          this.checkPermisstion("placement.detail")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      this.placement_data = null;
      this.selected_status_1 = null;
      this.selected_status_2 = null;
      this.getPlacementDetail(placement_id);
      this.$refs["show-placement"].show();
    },

    getStatusObject(status_string) {
      var status_object = {
        id: "1",
        name: "Waiting",
      };

      switch (status_string) {
        case "Waiting":
          status_object = {
            id: "1",
            name: "Waiting",
          };
          break;
        case "Payment completed":
          status_object = {
            id: "2",
            name: "Payment completed",
          };
          break;
        case "Payment failed":
          status_object = {
            id: "3",
            name: "Payment failed",
          };
          break;
      }

      return status_object;
    },
    clickCheckBoxAll(e) {
      this.checked_all_placement = !this.checked_all_placement;
      if (e.target.checked) {
        this.arrChecked = [];
        this.placements.forEach((item) => {
          this.arrChecked.push(item);
        });
      } else if (!e.target.checked) {
        this.arrChecked = [];
      }
    },
    clickCheckBoxSingle(e, placement) {
      if (this.checked_all_placement) {
        this.checked_all_placement = false;
        this.arrChecked = [];
      }
      if (e.target.checked) {
        if (this.arrChecked.length < 1) {
          this.arrChecked.push(placement);
        } else if (this.arrChecked.length > 0) {
          var count = 0;
          for (let i = 0; i < this.arrChecked.length; i++) {
            count++;
            if (placement.placementId === this.arrChecked[i].placementId) {
              break;
            }
          }
          if (count == this.arrChecked.length) {
            this.arrChecked.push(placement);
            if (this.arrChecked.length === 20) {
              this.checked_all_placement = true;
            }
          }
        }
      } else if (!e.target.checked) {
        this.arrChecked = this.arrChecked.filter(
          (selected_placement) =>
            selected_placement.placementId !== placement.placementId
        );
      }
    },
    updateStatus() {
      if (
        !(
          this.checkPermisstion("placement.all") ||
          this.checkPermisstion("placement.update")
        )
      ) {
        Swal.fire("Bạn chưa được cấp quyền", "", "error").then(() => {});
        return;
      }
      Swal.fire({
        title: "Xác nhận cập nhật trạng thái",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          const placementId = this.placement_data.placementId;
          var status = [];

          if (this.selected_status_1 !== null) {
            status.push(this.selected_status_1.id);
          }

          if (this.selected_status_2 !== null) {
            status.push(this.selected_status_2.id);
          }

          const data = {
            placementId,
            status,
          };

          this.updatePlacementStatus(data);
        }
        if (result.isDismissed) {
        }
      });
    },
  },
};
</script>
<template>
  <Layout>
    <div class="mat-manage-placement">
      <div
        class="d-flex mb-4 flex-wrap justify-content-between align-items-center"
      >
        <div class="header__placement d-flex">
          <i
            class="fas fa-wallet"
            style="font-size: 20px; margin-right: 7px"
          ></i>
          <PageHeader :title="title" />
        </div>
        <div class="header__placement-handle">
          <button
            class="btn btn-success"
            style="padding: 10px 15px"
            v-on:click="exportExcelPlacement"
          >
            <i class="fas fa-file"></i> Xuất Excel
          </button>
        </div>
      </div>

      <b-modal
        id="show-placement"
        centered
        size="lg"
        title="Thông tin thanh toán"
        title-class="font-18"
        ref="show-placement"
        hide-footer
        class="text-center"
      >
        <div class="bodyCreate">
          <div
            class="formCreated row mat-form-placement"
            v-if="placement_data !== null"
          >
            <div class="col-lg-6 mat-form-placement-content">
              <h5>Thông tin cộng tác viên</h5>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement"> Tên:</span>
                  <span class="modal__content-place">{{
                    placement_data.collaboratorName
                  }}</span>
                </div>
              </div>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement">Email:</span>
                  <span class="modal__content-place">{{
                    placement_data.collaboratorEmail
                  }}</span>
                </div>
              </div>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement">Số điện thoại:</span>
                  <span class="modal__content-place">{{
                    placement_data.collaboratorPhone
                  }}</span>
                </div>
              </div>

              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement"
                    >Số tài khoản ngân hàng:</span
                  >
                  <span class="modal__content-place">
                    {{ placement_data.collaboratorBankNumber }}
                  </span>
                </div>
              </div>
            </div>
            <div class="col-lg-6 mat-form-placement-content">
              <h5>Thông tin giới thiệu</h5>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement">Tên ứng viên:</span>
                  <span class="modal__content-place">
                    <a href="">{{ placement_data.candidateName }}</a>
                  </span>
                </div>
              </div>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement">Tên công việc:</span>
                  <span class="modal__content-place">
                    <a href="">{{ placement_data.postTitle }}</a>
                  </span>
                </div>
              </div>
              <div class="row">
                <div class="col-12 d-flex">
                  <span class="mat-title-placement">Tên công ty:</span>
                  <span class="modal__content-place">{{
                    placement_data.companyName
                  }}</span>
                </div>
              </div>
            </div>
            <h5 class="mt-3">Số tiền cần thanh toán:</h5>
            <div class="mt-2 table-modal-scroll">
              <table class="table mb-0">
                <thead class="thead-light">
                  <tr>
                    <th>No.</th>
                    <th>Tên khoản tiền</th>
                    <th>Ngày thanh toán</th>
                    <th>Số tiền</th>
                    <th>Đơn vị</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody v-if="placement_data.rewardAmount.length === 1">
                  <tr v-if="placement_data.bonus !== null">
                    <th>1</th>
                    <td>Tiền thưởng tuyển gấp</td>
                    <td>
                      {{ getDateString(placement_data.placementDate[0]) }}
                    </td>
                    <td>{{ sperateMoneyString(placement_data.bonus) }}</td>
                    <td>{{ placement_data.currency }}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <th v-if="placement_data.bonus === null">1</th>
                    <th v-else>2</th>
                    <td>Tiền tuyển dụng khi ứng viên được nhận làm việc</td>
                    <td>
                      {{ getDateString(placement_data.placementDate[0]) }}
                    </td>
                    <td>
                      {{ sperateMoneyString(placement_data.rewardAmount[0]) }}
                    </td>
                    <td>{{ placement_data.currency }}</td>
                    <td>
                      <multiselect
                        v-model="selected_status_1"
                        :options="selected_statuses"
                        :show-labels="false"
                        :allow-empty="false"
                        label="name"
                        style="width: 170px; z-index: 1"
                      ></multiselect>
                    </td>
                  </tr>
                  <tr>
                    <th></th>
                    <td><strong>Tổng tiền: </strong></td>
                    <td></td>
                    <td v-if="placement_data.bonus !== null">
                      <strong>{{
                        sperateMoneyString(
                          placement_data.rewardAmount[0] + placement_data.bonus
                        )
                      }}</strong>
                    </td>
                    <td v-else>
                      <strong>{{ placement_data.rewardAmount[0] }}</strong>
                    </td>
                    <td>
                      <strong>{{ placement_data.currency }}</strong>
                    </td>
                  </tr>
                </tbody>
                <tbody v-if="placement_data.rewardAmount.length === 2">
                  <tr v-if="placement_data.bonus !== null">
                    <th>1</th>
                    <td>Tiền thưởng tuyển gấp</td>
                    <td>
                      {{ getDateString(placement_data.placementDate[0]) }}
                    </td>
                    <td>{{ sperateMoneyString(placement_data.bonus) }}</td>
                    <td>{{ placement_data.currency }}</td>
                  </tr>
                  <tr>
                    <th v-if="placement_data.bonus === null">1</th>
                    <th v-else>2</th>
                    <td>Tiền tuyển dụng khi ứng viên được nhận làm việc</td>
                    <td>
                      {{ getDateString(placement_data.placementDate[0]) }}
                    </td>
                    <td>
                      {{ sperateMoneyString(placement_data.rewardAmount[0]) }}
                    </td>
                    <td>{{ placement_data.currency }}</td>
                    <td>
                      <multiselect
                        v-model="selected_status_1"
                        :options="selected_statuses"
                        :show-labels="false"
                        :allow-empty="false"
                        label="name"
                        style="width: 170px"
                      ></multiselect>
                    </td>
                  </tr>
                  <tr>
                    <th v-if="placement_data.bonus === null">2</th>
                    <th v-else>3</th>
                    <td>Tiền tuyển dụng khi ứng viên hoàn thành bảo hành</td>
                    <td>
                      {{ getDateString(placement_data.placementDate[1]) }}
                    </td>
                    <td>
                      {{ sperateMoneyString(placement_data.rewardAmount[1]) }}
                    </td>
                    <td>{{ placement_data.currency }}</td>
                    <td>
                      <multiselect
                        v-model="selected_status_2"
                        :options="selected_statuses"
                        :show-labels="false"
                        :allow-empty="false"
                        label="name"
                        style="width: 170px"
                      ></multiselect>
                    </td>
                  </tr>
                  <tr>
                    <th></th>
                    <td><strong>Tổng tiền: </strong></td>
                    <td></td>
                    <td v-if="placement_data.bonus !== null">
                      <strong>{{
                        sperateMoneyString(
                          placement_data.rewardAmount[0] +
                            placement_data.rewardAmount[1] +
                            placement_data.bonus
                        )
                      }}</strong>
                    </td>
                    <td v-else>
                      <strong>{{
                        sperateMoneyString(
                          placement_data.rewardAmount[0] +
                            placement_data.rewardAmount[1]
                        )
                      }}</strong>
                    </td>
                    <td>
                      <strong>{{ placement_data.currency }}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="handleActionBooking d-flex justify-content-end mt-3">
            <div class="view-placement">
              <button
                class="btn-view-placement"
                type="button"
                v-on:click="updateStatus"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </b-modal>

      <div class="list-candidates">
        <div class="header">
          <div class="form">
            <form class="filter__place mt-2 position-relative" action="">
              <!-- Search bar -->
              <div
                class="
                  filter-search__placement
                  d-flex
                  mb-3
                  justify-content-between
                  flex-wrap
                "
              >
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
                    v-on:click="searchPlacementButtonAction"
                  >
                    <span>Tìm kiếm</span>
                  </button>
                </div>
              </div>
              <!-- Filter bar-->
              <div
                class="
                  filter-bar__placement
                  filterBarPlacement
                  justify-content-between
                  form-inline
                  d-flex
                  flex-wrap
                "
              >
                <div
                  class="d-flex align-items-center flex-wrap filter-bar__sort"
                >
                  <span class="textSort" style="margin-right: 10px"
                    ><i
                      class="fas fa-filter"
                      style="font-size: 20px; margin-top: 5px"
                    ></i
                    >Lọc theo</span
                  >
                  <div class="filterSelect">
                    <div class="optionSelected select__company">
                      <!-- Company dropdown list -->
                      <div class="mat-filter-text">
                        <span class="mat-title-filter"> Công ty </span>
                      </div>
                      <multiselect
                        v-model="company"
                        label="name"
                        :options="companies"
                        :allow-empty="false"
                        :show-labels="false"
                        placeholder="Chọn công ty"
                      ></multiselect>
                    </div>
                    <div class="optionSelected select__status">
                      <div class="mat-filter-text">
                        <span class="mat-title-filter"> Trạng thái </span>
                      </div>
                      <multiselect
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
                <div class="sort align-items-center flex-wrap mat-sort">
                  <div>
                    <span class="mat-title-filter"
                      ><i class="fas fa-exchange-alt"></i>Sắp xếp theo</span
                    >
                  </div>
                  <multiselect
                    v-model="sort"
                    label="name"
                    :options="sorts"
                    :allow-empty="false"
                    :show-labels="false"
                    style="width: 140px"
                    placeholder="Chọn loại sắp xếp"
                  ></multiselect>
                </div>
              </div>
              <!-- <button class="del-filter position-absolute bg-danger text-light" type="button"><span class="arounded bg-light text-danger">1</span> Xóa bộ lọc <i class="fas fa-times ml-2"></i></button> -->
            </form>
          </div>
        </div>
        <div
          class="mainTable"
          style="width: 100%; background: #fff; height: auto"
        >
          <div class="table-scroll mt-4">
            <table class="table">
              <thead>
                <tr style="border: 1px solid #eae9e9; background: #f1f1f1">
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9; text-align: center"
                    class="mat-title-table"
                  >
                    <input
                      type="checkbox"
                      id="customCheck1"
                      :checked="checked_all_placement"
                      v-on:change="clickCheckBoxAll($event)"
                    />
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Ngày tạo
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Tên ứng viên
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Tên công việc
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Tiền thưởng
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Ngày thanh toán
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Tiền giới thiệu
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Tổng tiền
                  </th>
                  <th
                    scope="col"
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                  >
                    Đơn vị tiền
                  </th>
                </tr>
              </thead>
              <tbody
                class=""
                id="accordion"
                v-for="placement in placements"
                v-bind:key="placement.placementId"
              >
                <tr class="tableMain">
                  <td
                    style="border-right: 1px solid #eae9e9; text-align: center"
                    class="mat-title-table"
                  >
                    <input
                      type="checkbox"
                      id="customCheck1"
                      :checked="checked_all_placement"
                      v-on:change="clickCheckBoxSingle($event, placement)"
                    />
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{ getDateString(placement.createdDate) }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9; font-weight: bold"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{ placement.candidateName }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{ placement.postTitle }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    algi
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{ sperateMoneyString(placement.bonus) }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    <tr
                      v-for="placement_date in placement.placementDate"
                      v-bind:key="placement_date"
                    >
                      <td style="text-align: center">
                        <span>{{ getDateString(placement_date) }}</span>
                      </td>
                    </tr>
                  </td>
                  <td
                    align="right"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    <tr
                      v-for="reward_amount in placement.rewardAmount"
                      v-bind:key="reward_amount"
                      align="right"
                    >
                      <td>
                        <span class="mat-title-table" align="right">{{
                          sperateMoneyString(reward_amount)
                        }}</span>
                      </td>
                    </tr>
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    <tr
                      v-for="payment_status in placement.paymentStatus"
                      v-bind:key="payment_status"
                    >
                      <td>
                        <span>{{ payment_status }}</span>
                      </td>
                    </tr>
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-if="placement.rewardAmount.length === 1"
                    align="right"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{
                      sperateMoneyString(
                        placement.bonus + placement.rewardAmount[0]
                      )
                    }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-if="placement.rewardAmount.length === 2"
                    align="right"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{
                      sperateMoneyString(
                        placement.bonus +
                          placement.rewardAmount[0] +
                          placement.rewardAmount[1]
                      )
                    }}
                  </td>
                  <td
                    style="border-right: 1px solid #eae9e9"
                    class="mat-title-table"
                    v-on:click="showDetail(placement.placementId)"
                  >
                    {{ placement.currency }}
                  </td>
                </tr>
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
  </Layout>
</template>

<style lang='scss'>
.modal-header {
  background-color: #e2e8f1 !important;
}

.btn-view-placement {
  justify-content: flex-end;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  outline: none;
  background-color: #00ad57;
  -webkit-box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  -moz-box-shadow: 0px 2px 7px -2px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 2px 7px -2px rgb(0 0 0 / 75%);
  border: 1px solid #00ad57;
  border-radius: 7px;
  transition: all 0.2s ease-in-out;
  color: white;
}

.mat-form-placement {
  .mat-form-placement-content {
    .mat-title-placement {
      margin-right: 14px;
      font-size: 14px;
      color: #494949;
      margin-bottom: 7px;
    }
    .modal__content-place,
    .mat-title-placement {
      @media (max-width: 410px) {
        font-size: 13px;
      }
      @media (max-width: 378px) {
        font-size: 12px;
      }
    }
  }
}
.btn-view-placement:hover {
  background-color: white;
  color: #00ad57;
}
.mat-manage-placement {
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
  .filterBarPlacement {
    background-color: #fff;
    padding: 15px 15px 20px;
    border-radius: 10px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    .multiselect__tags {
      border: none !important;
      border-radius: 0;
      text-overflow: ellipsis !important;
      border-bottom: 1.5px solid #b1b1b1 !important;
      background-color: #3030 !important;
      background: #3030 !important;
      margin-top: 2px !important;
      font-family: "Roboto", sans-serif !important;
      font-weight: 400 !important;
    }
    .multiselect__single,
    .multiselect__input {
      background-color: #3030 !important;
      background: #3030 !important;
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
    &.select__company {
      width: 295px;
    }
    &.select__status {
      width: 250px;
    }
  }
  .optionSelected i {
    position: absolute;
    right: 0;
    bottom: 15px;
    z-index: 999;
    color: #666565;
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
  .handleActionSearch {
    margin-left: 15px;
    width: calc(15% - 15px);
    button {
      height: 45px;
      @media screen and (max-width: 767px) {
        height: 40px;
        font-size: 14px;
      }
      @media screen and (max-width: 480px) {
        height: 35px;
        font-size: 13px;
      }
    }
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

  .filter__place .filter-bar {
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

  .filter__place .filter-bar input {
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

  .filter-search__placement input {
    border: none;
    padding: 0 0 !important;
  }
  .filter-search__placement .inputSearch i {
    display: inherit;
    justify-content: center;
    padding: 0 5px;
    margin-left: 10px;
  }
  .filter-search__placement .inputSearch {
    display: flex;
    align-items: center;
    width: 85%;
    background: #ffffff;
    border: 1px solid #eae9e9;
    border-radius: 5px;

    input {
      height: 45px;
      @media screen and (max-width: 767px) {
        height: 40px;
        font-size: 14px;
      }
      @media screen and (max-width: 767px) {
        height: 35px;
        font-size: 13px;
      }
    }
  }
  .filter-search__placement button {
    width: 100% !important;
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

  .itemRow:hover {
    cursor: pointer;
    background-color: rgb(240, 240, 240);
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

  .bodyCreate {
    height: auto;
    width: 100%;
    background-color: #ffffff;
    padding: 20px 15px;
    border-radius: 10px;
    border: 1px solid #ccccccd5;
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

  .filterSelect {
    display: flex;
    flex-wrap: wrap;
    justify-content: start;

    .optionSelected {
      white-space: nowrap;
      margin-right: 10px;
    }
  }

  .list-candidates {
    .filter__place {
      .sort {
        padding-top: 15px;
        @media screen and (max-width: 767px) {
          padding-top: 10px;
        }
        @media screen and (max-width: 480px) {
          padding-top: 5px;
        }
      }
    }
  }

  @media (max-width: 991.98px) {
    .list-candidates {
      .filter-search__placement {
        .inputSearch {
          width: 75%;
          // min-height: 40px;
        }

        .handleActionSearch {
          width: calc(25% - 15px);
        }
      }
    }
  }

  @media (min-width: 642.0001px) and (max-width: 721.98px) {
    .filterSelect {
      .filterContent {
        width: 33.33333% !important;
      }
    }
  }
  @media (max-width: 767.98px) {
    .filterSelect {
      .optionSelected {
        margin-right: 0;
        width: 200px !important;

        .multiselect,
        input[type="date"] {
          width: calc(100% - 10px) !important;
        }
      }
    }
  }

  @media (max-width: 575.98px) {
    .list-candidates {
      .filter-bar__sort {
        width: 100%;

        .textSort {
          width: 100%;
          span {
            font-size: 13px;
          }
          i {
            font-size: 14px;
          }
        }
      }
      .filter-search__placement {
        .inputSearch {
          width: 65%;
        }

        .handleActionSearch {
          width: calc(35% - 15px);
        }
      }
    }

    .filterSelect {
      width: 100% !important;
      .optionSelected {
        margin-right: 10px;
        width: calc(50% - 10px) !important;

        .multiselect {
          width: 100% !important;
          font-size: 16px !important;
        }
      }
    }
  }

  @media (max-width: 390px) {
    .list-candidates {
      .filter-search__placement {
        .inputSearch {
          width: 100%;
        }

        .handleActionSearch {
          width: 100%;
          margin: 10px 0 0 0;
        }
      }
    }

    .filterSelect {
      width: 100% !important;
      .optionSelected {
        margin-right: 10px;
        width: 100% !important;

        .multiselect {
          width: 100% !important;
          font-size: 16px !important;
        }
      }
    }
    #show-placement___BV_modal_content_ {
      .modal-body {
        padding: 1rem 0.5rem;
      }
    }
  }
}
.table-modal-scroll,
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
.filter-bar__placement {
  .multiselect__content {
    width: 100%;
    .multiselect__option {
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>