<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import Multiselect from "vue-multiselect";
import Paginate from "vuejs-paginate";
import { mapActions } from "vuex";
export default {
  page: {
    title: "Danh sách thông báo",
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
      title: "Danh sách thông báo",

      //Notification type
      types: [
        {
          id: 0,
          name: "Tất cả",
        },
        {
          id: 1,
          name: "Giới thiệu ứng viên",
        },
        {
          id: 2,
          name: "Phỏng vấn",
        },
        {
          id: 3,
          name: "Nhân viên",
        },
        {
          id: 4,
          name: "Thanh toán",
        },
      ],
      selected_type: {
        id: 0,
        name: "Tất cả",
      },

      //Date
      dateFrom: "",
      dateTo: "",
      timestampFrom: null,
      timestampTo: null,

      // Page
      page_index: 1,
      page_size: 20,
      total_pages: 1,

      //Response data
      notifications: [],
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
    this.getAllNotificationList();
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "notification/getAllNotificationSuccess":
          this.notifications = state.notification.notificationsData.data;
          this.page_index = state.notification.notificationsData.pageIndex + 1;
          this.total_pages = state.notification.notificationsData.totalPages;
          break;
        case "notification/getAllNotificationFailure":
          break;
        case "notification/deleteNotificationSuccess":
          this.getAllNotificationList();
          break;
        case "notification/deleteNotificationFailure":
          break;
      }
    });
  },
  beforeDestroy() {
    this.unsub();
  },
  watch: {
    selected_type: function() {
      this.getAllNotificationList();
    },
    dateFrom: function () {
      const date = new Date(document.getElementById("dateFrom").value);
      this.timestampFrom = date.getTime();
      this.getAllNotificationList();
    },
    dateTo: function () {
      const date = new Date(document.getElementById("dateTo").value);
      this.timestampTo = date.getTime();
      this.getAllNotificationList();
    },
  },
  methods: {
    ...mapActions("notification", ["getAllNotification", "deleteNotification",
      "updateReadNotification",]),

    clickCallback(pageNum) {
      this.page_index = pageNum;
      this.getAllNotificationList();
    },

    getAllNotificationList() {
      const type = this.selected_type.id;
      const date_from = this.timestampFrom;
      const date_to = this.timestampTo;
      const page_index = this.page_index - 1;
      const page_size = this.page_size;

      const data = {
        type,
        date_from,
        date_to,
        page_index,
        page_size,
      };

      this.getAllNotification(data);
    },

    deleteNotificationById(notification_id, e) {
      this.deleteNotification(notification_id);

      if (!e) var e = window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    },

    doNotificationAction(target_path, id) {
      this.updateReadNotification({ id });
      const domain = window.location.origin;
      const url = domain + target_path;
      window.location.href = url;
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

    //Get date time
    getDateTimeString(timestamp) {
      var date = new Date(timestamp);

      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      return (
        date.getDate() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getFullYear() +
        " " +
        hours +
        ":" +
        minutes.substr(-2) +
        ":" +
        seconds.substr(-2)
      );
    },

    getTimeAgo(timestamp) {
      var startDateTime = new Date(timestamp);
      var startStamp = startDateTime.getTime();

      var newDate = new Date();
      var newStamp = newDate.getTime();

      var diff = Math.round((newStamp - startStamp) / 1000);

      // var mo = Math.floor(diff / (30 * 24 * 60 * 60));
      // diff = diff - m * 30 * 24 * 60 * 60;
      var d = Math.floor(diff / (24 * 60 * 60));
      diff = diff - d * 24 * 60 * 60;
      var h = Math.floor(diff / (60 * 60));
      diff = diff - h * 60 * 60;
      var m = Math.floor(diff / 60);
      diff = diff - m * 60;

      if (d > 0) {
        return d + " ngày trước";
      } else if (h > 0) {
        return h + " giờ trước";
      } else if (m > 0) {
        return m + " phút trước";
      } else {
        return " vài giây trước";
      }
    },
  },
};
</script>
<template>
  <Layout>
    <div class="d-flex mb-4">
      <!-- <i class="fas fa-bell" style="font-size: 20px; margin-right: 7px"></i> -->
      <i class="far fa-bell" style="font-size: 20px; margin-right: 7px"></i>
      <PageHeader :title="title" />
    </div>
    <div class="list-refers">
      <div class="row">
        <div class="col-12">
          <div class="header">
            <div class="form">
              <form class="filter mt-2 position-relative">
                <!-- Filter bar-->
                <div class="filter-alert justify-content-between d-flex">
                  <div class="row">
                    <div
                      class="d-flex flex-wrap align-items-center col-12">
                      <div class="filter">
                        <span
                          style="color: #495057"
                          class="d-flex align-items-center"
                          ><i
                            class="fas fa-filter"
                            style="font-size: 25px; margin-right: 5px"
                          ></i
                          >Lọc theo</span
                        >
                      </div>
                      <div class="filterSelect">
                        <div class="optionSelected">
                          <label for="">Trạng thái</label>
                          <multiselect
                            v-model="selected_type"
                            label="name"
                            :options="types"
                            :allow-empty="false"
                            :show-labels="false"
                            style="width: 100%; z-index: 999"
                            placeholder="Chọn trạng thái"
                          ></multiselect>
                        </div>
                        <div class="optionSelected">
                          <label for="">Từ ngày</label>
                          <input
                            id="dateFrom"
                            type="date"
                            class="form-control"
                            placeholder="Date from"
                            style="margin-right: 18px; width: 100%"
                            v-model="dateFrom"
                          />
                        </div>
                        <div class="optionSelected">
                          <label for="">Đến ngày</label>
                          <input
                            id="dateTo"
                            type="date"
                            class="form-control"
                            placeholder="Date to"
                            style="margin-right: 18px; width: 100%"
                            v-model="dateTo"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="main-tab mt-4">
      <div class="body-tab">
        <div class="mat-notify-list">
          <div
            class="mat-notify-item d-flex"
            v-for="notification in notifications"
            v-bind:key="notification._id"
          >
            <!-- <div class="image">
              <img :src="notification.image" alt="" />
            </div> -->
            <div :class="['mat-content', notification.is_read ? '' : 'unread']" v-on:click="doNotificationAction(notification.link, notification._id)">
              <div>
                <div class="mat-title-notify d-flex">
                  <div class="mat-title-notify__content">
                    <span class="notify">Thông báo: </span>
                    <span class="title">{{ notification.title }}</span>
                    <span> được cập nhật vào {{ getDateTimeString(notification.time) }}, </span>
                    <span>{{ notification.content }}</span>
                  </div>
                </div>
                <div class="mat-time-notify">
                  <i class="fas fa-briefcase"></i>
                  <span>{{ getTimeAgo(notification.time) }}</span>
                </div>
              </div>
              <div class="mat-handle">
                <button v-on:click="deleteNotificationById(notification._id)"><i class="fas fa-trash"></i></button>
              </div>
            </div>
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
.header {
  background-color: #fff;
  padding: 15px 15px 20px;
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  .filter-alert {
    @media screen and (min-width: 768px) {
      .filter {
        display: flex;
        justify-content: center;
        width: 160px;
      }
    }
    .optionSelected {
      @media screen and (min-width: 768px) {
        margin-right: 18px;
        width: 250px;
      }
      label {
        width: 100px;
        margin-bottom: 0 !important;
      }
    }
  }
}
.main-tab {
  border: 1px solid #d8d8d8;
  .header-tab {
    padding: 11px;
    background: rgb(241, 241, 241);
  }
  .body-tab {
    .mat-notify-list {
      background-color: #fff;

      .mat-notify-item {
        cursor: pointer;
        height: 95px;

        border-bottom: 1px solid #d8d8d8;
        align-items: center;
        &:hover {
          .mat-content {
            background-color: #eae9e9;
          }
        }
        .image {
          padding: 10px 0 10px 20px;
          img {
            height: 50px;
            border-radius: 8px;
          }
        }
        .status {
          margin-left: 15px;

          .active {
            height: 10px;
            width: 10px;
            border-radius: 50%;
            background-color: rgb(109, 255, 128);
          }
          .unActive {
            height: 10px;
            width: 10px;
            border-radius: 50%;
            background-color: #818181;
          }
        }
        .mat-content {
          flex: 1;
          height: 100%;
          align-items: center;
          display: flex;
          padding: 0 25px;
          justify-content: space-between;
          .mat-title-notify {
            .title {
              color: #495057;
              font-weight: 550;
            }
          }
          .mat-time-notify {
            margin-top: 10px;
            i {
              margin-right: 10px;
            }
            span {
            }
          }
          .mat-handle {
            button {
              cursor: pointer;
              border: none;
              outline: none;
              border-radius: 50%;
              height: 40px;
              background-color: #3030;
              width: 40px;
              transition: all 0.25s ease-out;
              &:hover {
                background-color: rgb(253, 232, 232);
              }
              i {
                color: rgb(255, 73, 73);
                font-size: 20px;
              }
            }
          }
        }

        .unread {
          background-color: #eae9e9;
        }
        
      }
    }
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
.filterSelect{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-left: 20px;
  @media (max-width: 1200px) {
    margin-left: 0;
  }
}
@media (max-width: 1042px) {
  .filterSelect {
    .optionSelected {
      width: calc(33.333333% - 18px) !important;
    }
  }
}
@media (max-width: 768px) {
  .filterSelect {
    margin-left: 15px;
    .optionSelected {
      width: calc(33.333333% - 18px) !important;

      .multiselect {
        width: 100% !important;
      }
    }
  }
}
@media (max-width: 560px) {
  .filterSelect {
    margin-top: 10px;
    .optionSelected {
       width: calc(50% - 18px) !important;
    }
  }
}
@media (max-width: 480px) {
  .filterSelect {
    .optionSelected {
      width: 100% !important;
    }
  }
}
.mat-title-notify__content{
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
}
</style>