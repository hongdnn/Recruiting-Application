<script>
import Layout from "../../layouts/main";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import Swal from "sweetalert2";
import { mapActions } from "vuex";

// import {
//   required,
//   email,
//   minLength,
//   maxLength,
// } from "vuelidate/lib/validators";
// import Swal from "sweetalert2";

export default {
  page: {
    title: "Chi tiết cộng tác viên",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  components: {
    Layout,
    Multiselect,
    Paginate,
  },
  data() {
    return {
      //Response data
      collaborator_detail: {},
      candidate_introductions: [],

      introduction_keyword: "",
      introduction_page_index: 1,
      introduction_page_size: 10,
      introduction_total_pages: 1,

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
      ],
      sort: {
        id: 0,
        name: "Ngày giới thiệu",
      },

      // Status
      collaborator_statuses: [
        {
          id: 1,
          name: "Approval",
        },
        {
          id: 2,
          name: "Lock",
        },
        {
          id: 3,
          name: "Disable",
        },
        {
          id: 4,
          name: "Waiting",
        },
      ],
      collaborator_status: {
        id: 1,
        name: "Approval",
      },
    };
  },

  watch: {},

  computed: {},
  mounted() {
    this.getCollaboratorDetail();
    this.getCompaniesForFilter();
    this.searchIntroduction();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "collaborators/getCollabortorSuccess":
          this.collaborator_detail = state.collaborators.collaboratorData.data;

          switch (this.collaborator_detail.status) {
            case "approval":
              this.collaborator_status = {
                id: 1,
                name: "Approval",
              };
              break;
            case "lock":
              this.collaborator_status = {
                id: 2,
                name: "Lock",
              };
              break;
            case "disable":
              this.collaborator_status = {
                id: 3,
                name: "Disable",
              };
              break;
            case "waiting":
              this.collaborator_status = {
                id: 4,
                name: "Waiting",
              };
              break;
          }

          break;
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
        case "collaborators/searchCandidateIntroductionForCollaboratorSuccess":
          this.candidate_introductions =
            state.collaborators.introductionsData.candidateIntroductions;
          this.introduction_page_index =
            state.collaborators.introductionsData.pageIndex + 1;
          this.introduction_total_pages =
            state.collaborators.introductionsData.totalPages;
          break;
        case "collaborators/updateCollaboratorStatusSuccess":
          Swal.fire("Cập nhật trạng thái thành công", "", "success").then(
            () => {
              this.$bvModal.hide("my-modal");
              this.getCollaboratorDetail();
            }
          );
          break;
        case "collaborators/updateCollaboratorStatusFailure":
          Swal.fire("Cập nhật trạng thái không thành công", "", "error");
          break;
      }
    });
  },

  beforeDestroy() {
    this.unsub();
  },
  methods: {
    ...mapActions("collaborators", [
      "getCollaboratorDetailByEmployer",
      "searchCandidateIntroductionForCollaborator",
      "updateCollaboratorStatus",
    ]),
    ...mapActions("companies", ["getCompaniesList"]),

    updateStatus() {
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
          const collaboratorId = this.getCollaboratorId();
          const status = this.collaborator_status.id + "";

          const data = {
            collaboratorId,
            status,
          };

          this.updateCollaboratorStatus(data);
        }
      });
    },

    getJobRoles(job_roles) {
      var result = "";
      job_roles.forEach((element, index) => {
        if (index < job_roles.length - 1) {
          result = result + element.name + ", ";
        } else {
          result = result + element.name;
        }
        return result;
      });
    },

    clickCallback(pageNum) {
      this.introduction_page_index = pageNum;
      this.searchIntroduction();
    },

    getCompaniesForFilter() {
      this.getCompaniesList();
    },

    //Convert timestamp
    getDateString(timestamp) {
      var date = new Date(timestamp);
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    //Get candidate introduction id:
    getCollaboratorId() {
      var id = "";
      var url = window.location.href;

      // Get id value
      var name = "id";
      name = name.replace(/[[]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) id = "";
      if (!results[2]) id = "";
      id = decodeURIComponent(results[2].replace(/\+/g, " "));

      return id;
    },

    //search introduction
    searchIntroduction() {
      const keyword = this.introduction_keyword;
      const collaborator_id = this.getCollaboratorId();
      const company_ids = this.company.id;
      const status = this.status.id;
      const page_index = this.introduction_page_index - 1;
      const page_size = this.introduction_page_size;
      const sort_by = this.sort.id;

      const data = {
        keyword,
        collaborator_id,
        company_ids,
        status,
        page_index,
        page_size,
        sort_by,
      };

      console.log(data);

      this.searchCandidateIntroductionForCollaborator(data);
    },

    getCollaboratorDetail() {
      const id = this.getCollaboratorId();

      this.getCollaboratorDetailByEmployer(id);
    },

    viewIntroductionDetail(id) {
      this.$router.push({
        path: "/collaborator-detail?id=" + id,
      });
    },

    showModal() {
      this.$refs["my-modal"].show();
    },
    hideModal() {
      this.$refs["my-modal"].hide();
    },
  },
};
</script>

<template>
  <Layout>
    <div class="row">
      <div class="headerDetailPage d-flex align-items-center">
        <a href="/manage-company">
          <button class="handleBack">
            <i class="fas fa-chevron-left"></i></button
        ></a>

        <div class="titleHeader">
          <span>Chi tiết cộng tác viên</span>
        </div>
      </div>
      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div class="d-flex" style="align-items: center; flex: 1">
                  <span class="titleHeader"> Thông tin cơ bản </span>
                </div>
                <div class="handleEdit">
                  <span
                    v-on:click="showModal"
                    data-toggle="modal"
                    data-target=".bs-example-modal-center"
                    >Cập nhật trạng thái</span
                  >

                  <b-modal
                    ref="my-modal"
                    id="modal-center"
                    centered
                    title="Cập nhật trạng thái"
                    title-class="font-18"
                    hide-footer
                    style="font-weight: bolder"
                  >
                    <div class="bodyCreate">
                      <div class="formCreated">
                        <form>
                          <div class="formCreatedContent">
                            <div class="col-12 formCreateGroup d-flex">
                              <div class="col-6" style="padding-right: 10px">
                                <label for=""
                                  >Trạng thái ứng viên
                                  <span class="labelStar">*</span></label
                                >
                                <div class="">
                                  <multiselect
                                    class="optionSelected__status"
                                    v-model="collaborator_status"
                                    label="name"
                                    :options="collaborator_statuses"
                                    :allow-empty="false"
                                    :show-labels="false"
                                    placeholder="Chọn trạng thái"
                                  ></multiselect>
                                </div>
                              </div>
                            </div>
                            <div
                              class="
                                handleActionBooking__post-detail
                                d-flex
                                justify-content-end
                              "
                            >
                              <button
                                type="button"
                                v-on:click="hideModal()"
                                class="btn btn-secondary"
                                style="margin-right: 0.75rem"
                              >
                                <i class="fas fa-times"></i>Hủy
                              </button>
                              <button
                                type="button"
                                class="btn"
                                v-on:click="updateStatus()"
                              >
                                Cập nhật
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </b-modal>
                </div>
                <div
                  class="iconHeader"
                  block
                  v-b-toggle.accordion-1
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <b-collapse
              id="accordion-1"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <div class="profileDetail mt-3" style="background-color: #fff">
                <div class="row">
                  <div class="col-md-4">
                    <div class="profile__staff">
                      <div class="d-flex justify-content-center">
                        <!-- <div v-if="previewImage !== null" class="avatar">
                          <img for="upLoad" :src="previewImage" alt="" />
                        </div>
                        <div v-else-if="existedImage !== null" class="avatar">
                          <img for="upLoad" :src="existedImage" alt="" />
                        </div> -->
                        <div class="avatar">
                          <img
                            for="upLoad"
                            src="https://banner2.cleanpng.com/20180410/bbw/kisspng-avatar-user-medicine-surgery-patient-avatar-5acc9f7a7cb983.0104600115233596105109.jpg"
                            alt=""
                          />
                        </div>
                      </div>
                      <div class="bodyName text-center">
                        <span style="font-weight: bolder">
                          {{ collaborator_detail.first_name }}
                          {{ collaborator_detail.last_name }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="
                      col-md-8
                      d-flex
                      flex-wrap
                      justify-content-center
                      contentInfor
                    "
                  >
                    <div class="col-10">
                      <div class="basicInfor">
                        <div class="bodyBasic mt-4">
                          <div class="row">
                            <div class="col-12 d-flex contentBasic">
                              <div class="col-6" style="padding-right: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >HỌ
                                </span>
                                <div class="inputContent">
                                  {{ collaborator_detail.first_name }}
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >TÊN</span
                                >
                                <div class="inputContent">
                                  {{ collaborator_detail.last_name }}
                                </div>
                              </div>
                            </div>
                            <div class="col-12 d-flex contentBasic">
                              <div class="col-6" style="padding-right: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >NGÀY SINH</span
                                >
                                <div class="inputContent">
                                  {{ collaborator_detail.birth_day }}
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >EMAIL</span
                                >
                                <div class="inputContent">
                                  {{ collaborator_detail.email }}
                                </div>
                              </div>
                            </div>
                            <div class="col-12 d-flex contentBasic">
                              <div class="col-6" style="padding-right: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >SỐ ĐIỆN THOẠI</span
                                >
                                <div class="inputContent">
                                  {{ collaborator_detail.phone }}
                                </div>
                              </div>
                              <div class="col-6" style="padding-left: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >TRẠNG THÁI</span
                                >
                                <div class="" style="margin: 5px 0 15px 0">
                                  {{ collaborator_detail.status }}
                                </div>
                              </div>
                            </div>

                            <div class="col-12 d-flex contentBasic">
                              <div class="col-12" style="padding-right: 10px">
                                <span class="title" style="font-weight: bolder"
                                  >ĐỊA CHỈ</span
                                >
                                <div class="inputContent">
                                  {{ collaborator_detail.address }}
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
            </b-collapse>
          </div>
        </div>
      </div>

      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div style="flex: 1">
                  <span class="titleHeader"> HỒ SƠ </span>
                </div>

                <div
                  class="iconHeader d-flex align-items-center"
                  block
                  v-b-toggle.accordion-2
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            <b-collapse
              id="accordion-2"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <div class="col-12">
                <div class="mainInforCompany wrapper-inforContact">
                  <div class="inforContact__content">
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">VAI TRÒ CÔNG VIỆC</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          getJobRoles(collaborator_detail.job_roles)
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">CẤP ĐỘ CÔNG VIỆC</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName"></span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">NGÀNH NGHỀ</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName"></span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">KĨ NĂNG</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName"></span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">NGÔN NGỮ</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName"></span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">ĐỊA ĐIỂM</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName"></span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div style="flex: 1">
                  <span class="titleHeader">
                    THÔNG TIN TÀI KHOẢN NGÂN HÀNG
                  </span>
                </div>

                <div
                  class="iconHeader d-flex align-items-center"
                  block
                  v-b-toggle.accordion-3
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            <b-collapse
              id="accordion-3"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
              <div class="col-12">
                <div class="mainInforCompany wrapper-inforContact">
                  <div class="inforContact__content">
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">TÊN NGÂN HÀNG</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          collaborator_detail.bank_account.bank_name
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">SỐ TÀI KHOẢN</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          collaborator_detail.bank_account.account_number
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">HỌ VÀ TÊN THẺ</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          collaborator_detail.bank_account.id_card_fullname
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">SỐ CMND/CCCD</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          collaborator_detail.bank_account.id_number
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">NGÀY PHÁT HÀNH</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          getDateString(
                            collaborator_detail.bank_account.id_card_date
                          )
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                    <div
                      class="inforDetailCompany d-flex"
                      style="
                        width: 100%;
                        height: 65px;
                        border-top: 1px solid #dadce0;
                      "
                    >
                      <div class="col-3" style="padding-left: 25px">
                        <span class="titleInfor">NƠI CẤP</span>
                      </div>
                      <div class="col-7" style="padding-left: 25px">
                        <span class="titleName">{{
                          collaborator_detail.bank_account.issued_location
                        }}</span>
                      </div>
                      <div
                        class="inputForm col-2 d-flex"
                        style="
                          justify-content: flex-end;
                          padding-right: 30px;
                          align-items: center;
                        "
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div style="flex: 1">
                  <span class="titleHeader">
                    THÔNG TIN GIỚI THIỆU ỨNG VIÊN
                  </span>
                </div>

                <div
                  class="iconHeader d-flex align-items-center"
                  block
                  v-b-toggle.accordion-4
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            <b-collapse
              id="accordion-4"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
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
                          />
                        </div>
                        <div
                          class="btn__handleActionSearch"
                          style="margin-right: 3rem"
                        >
                          <button type="button" class="btn btn-search">
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
                        <span style="margin-left: 1.5rem"
                          ><i
                            class="fas fa-filter"
                            style="font-size: 17px; margin-top: 5px"
                          ></i
                          >Lọc theo</span
                        >
                        <div class="mat-filter-select-candidate">
                          <div class="mat-option-select-candidate">
                            <!-- Company dropdown list -->
                            <div class="mat-filter-text">
                              <span class="mat-title-filter"> Công ty</span>
                            </div>
                            <multiselect
                              class="optionSelected__company"
                              v-model="company"
                              label="name"
                              :options="companies"
                              :allow-empty="false"
                              :show-labels="false"
                              placeholder="Chọn công ty"
                            ></multiselect>
                          </div>
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
                          <div class="mat-option-select-candidate">
                            <div class="mat-filter-text">
                              <span class="mat-title-filter"> Từ ngày </span>
                            </div>
                            <input
                              id="dateFrom"
                              type="date"
                              class="form-control optionSelected__dateFrom"
                              placeholder="Date from"
                            />
                          </div>
                          <div class="mat-option-select-candidate">
                            <div class="mat-filter-text">
                              <span class="mat-title-filter"> Đến ngày </span>
                            </div>
                            <input
                              id="dateTo"
                              type="date"
                              class="form-control optionSelected__dateTo"
                              placeholder="Date to"
                            />
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
                      d-flex
                    "
                    style="margin-right: 3rem"
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
                  style="
                    width: 95%;
                    background: #fff;
                    height: auto;
                    margin-left: 2rem;
                  "
                >
                  <div class="table-scroll">
                    <table class="table">
                      <thead>
                        <tr
                          style="border: 1px solid #eae9e9; background: #f1f1f1"
                        >
                          <th
                            scope="col"
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            Tên ứng viên
                          </th>
                          <th
                            scope="col"
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            Tên công việc
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
                            Ngày giới thiệu
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        class=""
                        id="accordion"
                        v-for="item in candidate_introductions"
                        v-bind:key="item.candidate_introduction_id"
                      >
                        <tr
                          class="tableMain"
                          v-on:click="
                            viewIntroductionDetail(
                              item.candidate_introduction_id
                            )
                          "
                        >
                          <th
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            {{ item.candidate_name }}
                          </th>
                          <td
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            {{ item.post_title }}
                          </td>
                          <td
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            {{ item.status }}
                          </td>

                          <td
                            style="border-right: 1px solid #eae9e9"
                            class="mat-title-table-candidates"
                          >
                            {{ getDateString(item.introduction_date) }}
                          </td>
                        </tr>
                        <tr></tr>
                      </tbody>
                    </table>
                  </div>
                  <div
                    class="
                      mat-paging-candidate-collab
                      d-flex
                      align-items-center
                    "
                  >
                    <paginate
                      :page-count="introduction_total_pages"
                      :click-handler="clickCallback"
                      :prev-text="'Trước'"
                      :next-text="'Sau'"
                      :container-class="'pagination'"
                      :active-class="'pagination-active'"
                      :page-link-class="'pagination-item'"
                      v-model="introduction_page_index"
                    >
                    </paginate>
                  </div>
                </div>
              </div>
            </b-collapse>
          </div>
        </div>
      </div>
      <div class="col-12 p-0">
        <div class="col-12 mt-3 inforCompany p-0">
          <div>
            <div style="background-color: #e2e8f1; border: 1px solid #e2e8f1">
              <div
                class="col-12 d-flex align-items-center"
                style="padding: 10px 20px; height: 50px"
              >
                <div style="flex: 1">
                  <span class="titleHeader"> THÔNG TIN THANH TOÁN </span>
                </div>

                <div
                  class="iconHeader d-flex align-items-center"
                  block
                  v-b-toggle.accordion-5
                  variant="info"
                >
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            <b-collapse
              id="accordion-5"
              visible
              accordion="my-accordion"
              role="tabpanel"
            >
            </b-collapse>
          </div>
        </div>
      </div>
      <div class="col-3"></div>
    </div>
  </Layout>
</template>


<style  lang='scss'>
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
  margin-left: 2rem;
  align-items: center;
  width: 78%;
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
.actionHideModal {
  button {
    outline: none;
    border: none;
    padding: 3px 18px;
    -webkit-box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
    -moz-box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
    box-shadow: 0px 4px 6px -3px rgba(0, 0, 0, 0.5);
  }
  .btnCancel button {
    border: 1px solid #e9e9e9;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border-radius: 3px;
    background: #e9e9e9;
    color: #000;
    &:hover {
      border: 1px solid #dfdede;
      background: #dfdede;
    }
  }
  .btnSuccess button {
    margin-left: 10px;
    border: 1px solid #1aa94c;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border-radius: 3px;
    background: #1aa94c;
    color: #fff;
    &:hover {
      border: 1px solid #25bb59;

      background: #25bb59;
    }
  }
}
.profile__company {
  border-right: 1px solid rgba(221, 221, 221, 0.733);

  .handleAvatar {
    margin-left: 2rem;
    width: 150px;
    border-radius: 50%;
    button {
      width: 120px;
      border: none;
      margin-top: 5;
      padding: 5px 10px;
      border-radius: 3px;
      transition: all 0.3s ease-in-out;
    }

    .upload {
      margin-top: 12px;

      label {
        padding: 5px 10px;
        border-radius: 3px;
        width: 120px;
        background-color: #5b73e8;
        border: 1px solid #5b73e8;
        cursor: pointer;
        text-align: center;
        color: #fff;
        &:hover {
          background-color: #4763ee;
        }
      }
    }
    .avatar__company {
      margin-top: 8px;
      // width: 180px;
      // height: 180px;
      // border-radius: 10px;
      // padding: 5px;
      // border: 1px solid #e1e2e2;
      border-radius: 50%;

      img {
        width: 100%;
        border-radius: 50%;
        height: 100%;
      }
    }
    .delete {
      button {
        color: #495057;
        border: 1px solid #e1e2e2;
        &:hover {
          background-color: #e1e2e2;
        }
      }
    }
  }
  .avatar__modal {
    width: 100%;
    text-align: center;

    img {
      width: 50%;
      border-radius: 50%;
      border: 2px solid #f1f1f1;
    }
    &__handleAvatar {
      display: block;
      width: 130px;
      margin-left: 0;
      margin: 1.5rem auto 0;
      label {
        margin-bottom: 0;
      }
    }
  }
  .bodyName {
    margin-top: 12px;
    span {
      color: #5b73e8;
      font-size: 20px;
    }
    i {
      margin-left: 7px;
      font-size: 18px;
    }
  }

  .bodyName {
    span {
      color: #5b73e8;
      font-size: 17px;
    }
  }
}
.createPostContent {
  .formPostGroup {
    height: 100%;
    font-weight: bold;
    margin-bottom: 10px;
    font-weight: 500;
    font-family: "Roboto", sans-serif;

    &__company,
    &__career,
    &__name,
    &__numberphone {
      padding-right: 10px;
      @media (max-width: 576px) {
        padding-right: 0;
      }
    }
    &__room {
      padding: 0 10px 0 10px;
      @media (max-width: 576px) {
        padding: 10px 0 0 0;
      }
    }

    &__city,
    &__position,
    &__email,
    &__website {
      padding-left: 10px;

      @media (max-width: 576px) {
        padding-top: 10px;
        padding-left: 0;
      }

      .multiselect__tags input.multiselect__input {
        border: none;
      }
    }
    label {
      color: rgb(51, 51, 51);
      font-size: 14px;

      .labelStar {
        color: rgb(255, 32, 32);
      }
    }
    i {
      color: #777;
      font-size: 14px;
      margin-right: 5px;
    }
    .skipStep {
      span {
        font-size: 12px;
      }
      margin-bottom: 5px;
    }
    .inputForm {
      input {
        width: 100%;
        height: 38px;
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
      select {
        width: 70%;
        height: 38px;
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
      textarea {
        font-size: 15px;
        border: 1px solid #ccc;
        box-shadow: inset 0 1px 1px rgb(0 0 0 / 8%);
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.42857143;
        color: #555;
        background-color: #fff;
        border-radius: 0.4rem;
        &:focus {
          outline: none !important;
          -webkit-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          -moz-box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          box-shadow: 0px 0px 4px 0px rgba(155, 172, 250, 1);
          border-color: rgba(155, 172, 250, 1);
        }
      }
    }
    .checkBox {
      margin: 5px 0 0 10px;
      display: flex;
      align-items: center;

      input {
        height: 15px;
        width: 15px;
        cursor: pointer;
      }
      span {
        margin-top: 3px;
        margin-left: 5px;
      }
    }

    .handleAddButton {
      button {
        background-color: white;
        color: #5b73e8;
        border: 1px solid #5b73e8;
        padding: 5px 0;
        border-radius: 10px;
        font-weight: 500;
        font-family: "Roboto", sans-serif;
        transition: 0.2s linear;
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          color: #5b73e8;
        }
        &:hover {
          border: 1px solid white;
          color: white;
          background-color: #5b73e8;
          i {
            color: white;
          }
        }
      }
    }
    .handleDeleteSoftSkill {
      justify-content: flex-end;
      display: flex;
      button {
        border: none;
        padding: 5px 10px;
        border-radius: 10px;
        font-size: 13px;
        background-color: #f44336;
        transition: all 0.2s ease-in-out;
        color: white;
        &:hover {
          background-color: #fc1a0a;
        }
        &:focus {
          outline: none !important;
        }
        i {
          margin-right: 6px;
          margin-left: 4px;
          color: white;
          font-size: 13px;
        }
      }
    }
  }
}
.contentHeader {
  width: 100%;
  margin-top: 15px;
  span {
    text-align: justify;
    word-break: break-word;
    word-wrap: break-word;
    color: #495057;
    font-family: "Roboto", sans-serif;
    font-size: 15px;
  }
}
.iconHeader {
  i {
    font-size: 20px;
    cursor: pointer;
  }
}
.handleEdit {
  display: flex;
  align-items: center;
  margin-right: 10px;
  span {
    color: #1761fd;
    cursor: pointer;
  }
}
.inforCompany {
  flex-grow: 1;
  flex-shrink: 1;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #dadce0;
  box-sizing: border-box;
  overflow: hidden;

  .titleHeader {
    font-size: 17px;
    font-family: "Roboto", sans-serif;
    color: #303e67;
    font-weight: bold;
    text-transform: uppercase;
  }

  .mainInforCompany {
  }
  .inforDetailCompany {
    justify-content: space-around;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: #fafafa;
    }
    .titleInfor {
      word-break: break-word;
      word-wrap: break-word;
      color: #495057;
      font-family: "Roboto", sans-serif;
      font-size: 14px;
      font-weight: 500;
    }
    .titleName {
      font-family: "Roboto", sans-serif;
      font-size: 15.5px;
      font-weight: 500;
    }
    .inputForm {
      word-break: break-word;
      word-wrap: break-word;
      color: #5f6368;
      font-family: "Roboto", sans-serif;
      font-size: 15px;

      img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
      }
    }
  }
}
.headerDetailPage {
  .titleHeader {
    span {
      font-family: "Roboto", sans-serif;
      font-size: 18px;
      color: #495057;
      font-weight: 600;
    }
  }
}
.editAvatar {
  display: flex;
  justify-content: center;
  img {
    cursor: pointer;
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
  label {
    position: relative;
    i {
      position: absolute;
      left: 50%;
      transform: translate(-50%, 50%);
      bottom: 50%;
      font-size: 30px;
      color: rgb(221, 221, 221);
      cursor: pointer;
      opacity: 0;
    }
    &:hover {
      opacity: 0.8;
      i {
        opacity: 1;
      }
    }
  }
}
.loGoCompany {
  img {
    width: 250px;
    height: 250px;
  }
}
.handleBack {
  align-items: center;
  justify-content: center;
  display: flex;
  margin-right: 15px;
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
.modal-dialog {
  @media screen and (min-width: 1440px) {
    min-width: 666px;
  }
}
.modal-header {
  background-color: rgb(226, 232, 241);
  border: 1px solid rgb(226, 232, 241);
}

.wrapper-inforDetailCompany {
  overflow-x: auto;
  &__content {
    min-width: 706px;
  }
}

.wrapper-inforContact {
  overflow-x: auto;
  .inforContact__content {
    min-width: 490px;
  }
}
.bodyInfoDetail {
  border: 1px solid #e1e2e2;
  border-radius: 7px;
  padding: 20px 0;
}
.profileDetail {
  padding: 15px 15px;
  .header {
    text-align: center;
    span {
      font-size: 17px;
      font-weight: 600;
      font-family: "Roboto", sans-serif;
    }
  }
  .profile__staff {
    border-right: 1px solid rgba(221, 221, 221, 0.733);
    .handleAvatar {
      margin-top: 15px;
      button {
        width: 120px;
        border: none;
        margin-top: 5;
        padding: 5px 10px;
        border-radius: 3px;
        transition: all 0.3s ease-in-out;
      }
      .upload {
        margin-top: 12px;
        label {
          padding: 5px 10px;
          border-radius: 3px;
          width: 120px;
          background-color: #5b73e8;
          border: 1px solid #5b73e8;
          cursor: pointer;
          text-align: center;
          color: #fff;
          &:hover {
            background-color: #4763ee;
          }
        }
      }
      .delete {
        button {
          color: #495057;
          border: 1px solid #e1e2e2;
          &:hover {
            background-color: #e1e2e2;
          }
        }
      }
    }
    .bodyName {
      margin-top: 12px;
      span {
        color: #5b73e8;
        font-size: 20px;
      }
      i {
        margin-left: 7px;
        font-size: 18px;
      }
    }

    .avatar {
      margin-top: 8px;
      width: 180px;
      border-radius: 10px;
      padding: 5px;
      height: 180px;
      border: 1px solid #e1e2e2;
      border-radius: 50%;

      img {
        width: 100%;
        border-radius: 50%;
        height: 100%;
      }
    }
    .bodyName {
      span {
        color: #5b73e8;
        font-size: 17px;
      }
    }
  }
  .basicInfor {
    .header {
      height: 50px;
      border-bottom: 1px solid rgba(221, 221, 221, 0.575);
    }
    .handleUpdate {
      .titleEdit {
        span {
          font-size: 14px;
          color: #4763ee;
          cursor: pointer;
          font-weight: 500;
          i {
            margin-left: 5px;
            color: #4763ee;
            cursor: pointer;
          }
        }
      }
      button {
        width: 80px;
        border: none;
        margin-top: 5;
        padding: 5px 10px;
        border-radius: 3px;
        transition: all 0.3s ease-in-out;
        margin-right: 5px;
      }
      .save {
        button {
          background-color: #1aa94c;
          border: 1px solid #1aa94c;
          color: #fff;
          &:hover {
            background-color: #0dc04c;
          }
        }
      }
      .cancel {
        button {
          color: #495057;
          border: 1px solid #e1e2e2;
          &:hover {
            background-color: #e1e2e2;
          }
        }
      }
    }
    .bodyBasic {
      .contentBasic {
        .title {
          font-size: 15px;
          font-family: "Roboto", sans-serif;
          color: #495057;
          font-weight: 550;
        }

        .inputContent {
          margin: 5px 0 15px 0;
          input {
            width: 100%;
            border-radius: 4px;
            outline: none;
            border: 1px solid #e1e2e2;
            height: 38px;
            padding: 0 10px;
          }
        }
      }
    }
  }
}
</style>
