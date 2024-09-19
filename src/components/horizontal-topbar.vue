<script>
import simplebar from "simplebar-vue";
import { employeeMenuItems, collaboratorMenuItems } from "./horizontal-menu";

import jwt_decode from "jwt-decode";

import { layoutComputed, authFackMethods } from "@/state/helpers";
import { mapActions } from "vuex";
import { generateApiUrl } from "../helpers/common/APIConstants";

/**
 * Horizontal-topbar component
 */

export default {
  components: { simplebar },
  props: {
    type: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      arrPosts: [],
      userStorage: JSON.parse(localStorage.getItem("user")),
      user_permissions: [],
      permissionStorage: JSON.parse(localStorage.getItem("permissions")),
      isActiveLink: window.location.pathname,
      employeeMenuItems: employeeMenuItems,
      collaboratorMenuItems: collaboratorMenuItems,
      languages: [
        {
          flag: require("@/assets/images/flags/us.jpg"),
          language: "en",
          title: "English",
        },
        {
          flag: require("@/assets/images/flags/vietnam.png"),
          language: "vi",
          title: "Tiếng việt",
        },
      ],

      current_language: this.$i18n.locale,
      text: null,
      flag: null,
      value: null,
      badge: 0,
      notify_index: 0,
      notifications: [],
      originUrl: process.env.VUE_APP_API_URL,
      user: {},
    };
  },
  computed: {
    ...layoutComputed,
    url_current: function () {
      return window.location.pathname;
    },

    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
  destroyed() {
    this.url_current = null;
  },
  created() {
    this.unsub = this.$store.subscribe((mut, state) => {
      switch (mut.type) {
        case "notification/getNotificationSuccess": {
          this.notifications = this.notifications.concat(
            state.notification.notificationData.data
          );
          this.notify_index++;
          break;
        }
        case "notification/getNotificationFirebaseSuccess": {
          this.addNotificationFirebase(
            state.notification.notificationData.data
          );
          break;
        }
        case "notification/getNewNotificationSuccess": {
          this.badge = state.notification.newNotifyData.count;
          break;
        }
        case "staff/permissionSuccess": {
          this.getDataStorePermission(state);
          break;
        }
        case "user/imageProfileSuccess": {
          if (state.user.userProfile.data.image !== undefined) {
            this.user.data.image = state.user.userProfile.data.image;
            console.log(this.user.data);
            localStorage.setItem("user", JSON.stringify(this.user));
            break;
          }
        }
      }
    });
  },

  async mounted() {
    this.decodeToken();

    await this.getNewNotification();
    await this.getNotifications(0, 10, false);
    this.value = this.languages.find((x) => x.language === this.$i18n.locale);
    this.text = this.value.title;
    this.flag = this.value.flag;
    this.activateParentDropdown();
    this.$messaging.onMessage((payload) => {
      if (
        window.location.pathname === "/manage-refer-candidate-collaborator" &&
        payload.data.title === "Cập nhật trạng thái ứng viên"
      ) {
        this.searchCandidate();
      }
      this.getNotifications(0, 5, true);
    });
    this.$router.afterEach(() => {
      this.activateParentDropdown();
    });
  },
  methods: {
    ...mapActions("notification", [
      "getNotification",
      "getNewNotification",
      "updateReadNotification",
    ]),
    ...mapActions("introductions", [
      "searchCandidateIntroductionByCollaborator",
    ]),
    ...authFackMethods,
    /**
     * remove active and mm-active class
     */
    _removeAllClass(className) {
      const els = document.getElementsByClassName(className);
      while (els[0]) {
        els[0].classList.remove(className);
      }
    },

    decodeToken() {
      this.user = JSON.parse(localStorage.getItem("user"));
      var decoded = jwt_decode(this.user.token)
      this.user_permissions = decoded.permission;
    },
    checkPermisstion(permission) {
      return this.user_permissions.includes(permission);
    },

    async getProfileByEmployerId() {
      let userStorage = JSON.parse(localStorage.getItem("user"));
      var id = userStorage.data.id;
      if (userStorage.data.type_account === "employer") {
        await this.getProfileByEmployer(id);
      }

      this.user.image_id = userStorage.data.image;
      this.user.first_name = userStorage.data.first_name;
      this.user.last_name = userStorage.data.last_name;
      this.user.permissions = userStorage.data.permissions;
      this.user.type_account = this.userProfile.data.type_account;
    },
    async getProfileByCollaboratorId() {
      let userStorage = JSON.parse(localStorage.getItem("user"));
      var id = userStorage.data.id;
      if (userStorage.data.type_account === "collaborator") {
        await this.getProfileByCollaborator(id);
      }
      this.user.first_name = userStorage.data.first_name;
      this.user.last_name = userStorage.data.last_name;
      this.user.image_id = userStorage.data.image;
      this.user.type_account = this.userCollab.data.type_account;
    },

    searchCandidate() {
      const keyword = "";
      const company_ids = 0;
      const status = 0;
      const page_index = 0;
      const page_size = 20;
      const sort_by = 0;
      const introduction_date_from = 0;
      const introduction_date_to = 0;

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

    addNotificationFirebase(newNotifications) {
      let listIds = [];
      let count = 5;
      if (this.notifications.length < 5) {
        count = this.notifications.length;
      }
      for (let i = 0; i < count; i++) {
        listIds.push(this.notifications[i]._id);
      }
      for (let i = newNotifications.length - 1; i > -1; i--) {
        if (!listIds.includes(newNotifications[i]._id)) {
          this.notifications.unshift(newNotifications[i]);
          this.badge++;
        }
      }
    },

    async getNotifications(notify_index, page_size, is_noti_firebase) {
      await this.getNotification({
        notify_index,
        page_size,
        is_noti_firebase,
      });
    },

    getAllNotification() {
      const domain = window.location.origin;
      const url = domain + "/notification";
      window.location.href = url;
    },

    async readNotify(notification_id) {
      await this.updateReadNotification({ notification_id });
    },

    navigateToSpecificUrl(notification) {
      const notification_id = notification._id;
      this.readNotify(notification_id).then(() => {
        if (window.location.pathname !== notification.link) {
          this.$router.push({
            path: notification.link,
          });
        } else {
          location.reload();
        }
      });
    },
    getImageURL(path) {
      return generateApiUrl(path);
    },

    activateParentDropdown() {
      const resetParent = (el) => {
        const parent = el.parentElement;
        this._removeAllClass("mm-active");
        this._removeAllClass("mm-show");
        if (parent) {
          parent.classList.remove("active");
          const parent2 = parent.parentElement;
          if (parent2) {
            parent2.classList.remove("active");
            const parent3 = parent2.parentElement;
            if (parent3) {
              parent3.classList.remove("active");
              const parent4 = parent3.parentElement;
              if (parent4) {
                parent4.classList.remove("active");
                const parent5 = parent4.parentElement;
                if (parent5) {
                  parent5.classList.remove("active");
                  const menuelement = document.getElementById(
                    "topnav-menu-content"
                  );
                  if (menuelement !== null)
                    if (menuelement.classList.contains("show"))
                      document
                        .getElementById("topnav-menu-content")
                        .classList.remove("show");
                }
              }
            }
          }
        }
      };
      var links = document.getElementsByClassName("side-nav-link-ref");
      var matchingMenuItem = null;
      for (let i = 0; i < links.length; i++) {
        // reset menu
        resetParent(links[i]);
      }
      for (var i = 0; i < links.length; i++) {
        if (window.location.pathname === links[i].pathname) {
          matchingMenuItem = links[i];
          break;
        }
      }
      if (matchingMenuItem) {
        matchingMenuItem.classList.add("active");
        var parent = matchingMenuItem.parentElement;
        if (parent) {
          parent.classList.add("active");
          const parent2 = parent.parentElement;
          if (parent2) {
            parent2.classList.add("active");
          }
          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.add("active");
            var childAnchor = parent3.querySelector(".has-dropdown");
            if (childAnchor) childAnchor.classList.add("active");
          }

          const parent4 = parent3.parentElement;
          if (parent4) parent4.classList.add("active");
          const parent5 = parent4.parentElement;
          if (parent5) parent5.classList.add("active");
        }
      }
    },
    /**
     * Full-screen
     */
    initFullScreen() {
      document.body.classList.toggle("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    /**
     * Toggle right-sidebar
     */
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },
    /**
     * Menu clicked show the submenu
     */
    onMenuClick(event) {
      event.preventDefault();
      const nextEl = event.target.nextElementSibling;
      if (nextEl) {
        const parentEl = event.target.parentNode;
        if (parentEl) {
          parentEl.classList.remove("show");
        }
        nextEl.classList.toggle("show");
      }
      return false;
    },

    /**
     * Returns true or false if given menu item has child or not
     * @param item menuItem
     */
    hasItems(item) {
      return item.subItems !== undefined ? item.subItems.length > 0 : false;
    },
    /**
     * Language set
     */
    setLanguage(locale, country, flag) {
      this.$i18n.locale = locale;
      this.current_language = locale;
      this.text = country;
      this.flag = flag;
    },
    toggleMenu() {
      let element = document.getElementById("topnav-menu-content");
      element.classList.toggle("show");
    },
    logoutUser() {
      this.$messaging.deleteToken().then(() => {
        this.logout();
        // this.$router.push({
        //   path: "/account/login",
        // });
      });
    },
  },
  watch: {
    type: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.body.setAttribute("data-topbar", "dark");
              break;
            case "light":
              document.body.setAttribute("data-topbar", "light");
              document.body.removeAttribute("data-layout-size", "boxed");
              break;
            case "colored":
              document.body.setAttribute("data-topbar", "colored");
              document.body.removeAttribute("data-layout-size", "boxed");
              break;
            default:
              document.body.setAttribute("data-topbar", "dark");
              break;
          }
        }
      },
    },
    width: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "boxed":
              document.body.setAttribute("data-layout-size", "boxed");
              break;
            case "fluid":
              document.body.setAttribute("data-layout-mode", "fluid");
              document.body.removeAttribute("data-layout-size");
              break;
            default:
              document.body.setAttribute("data-layout-mode", "fluid");
              break;
          }
        }
      },
    },
    data(newValue) {
      this.user = newValue;
    },
  },
};
</script>

<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex header__logo">
        <!-- LOGO -->
        <div class="navbar-brand-box">
          <router-link to="/" class="logo logo-dark">
            <span class="logo-sm">
              <img src="@/assets/images/logomain.png" alt height="50" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/logomain.png" alt height="50" />
            </span>
          </router-link>

          <router-link to="/" class="logo logo-light">
            <span class="logo-sm">
              <img src="@/assets/images/logomain.png" alt height="50" />
            </span>
            <span class="logo-lg">
              <img src="@/assets/images/logomain.png" alt height="50" />
            </span>
          </router-link>
        </div>

        <!-- App Search-->
        <!-- <form class="app-search d-none d-lg-block">
          <div class="position-relative">
            <input
              type="text"
              class="form-control"
              :placeholder="$t('navbar.search.text')"
            />
            <span class="uil-search"></span>
          </div>
        </form> -->
      </div>

      <div class="d-flex header__menu">
        <b-dropdown
          variant="white"
          class="d-inline-block d-lg-none ms-2"
          toggle-class="header-item noti-icon"
          right
          menu-class="dropdown-menu-lg p-0"
        >
          <template v-slot:button-content>
            <i class="uil-search"></i>
          </template>
          <form class="p-3">
            <div class="form-group m-0">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :placeholder="$t('navbar.search.text')"
                  aria-label="Recipient's username"
                />
                <div class="input-group-append">
                  <button class="btn btn-primary" type="submit">
                    <i class="mdi mdi-magnify"></i>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </b-dropdown>

        <!-- <b-dropdown variant="white" right toggle-class="header-item">
          <template v-slot:button-content>
            <img class :src="flag" alt="Header Language" height="16" />
            <span class="language__title">{{ text }}</span>
          </template>
          <b-dropdown-item
            class="notify-item"
            v-for="(entry, i) in languages"
            :key="`Lang${i}`"
            :value="entry"
            @click="setLanguage(entry.language, entry.title, entry.flag)"
            :link-class="{ active: entry.language === current_language }"
          >
            <img
              :src="`${entry.flag}`"
              alt="user-image"
              class="me-1"
              height="12"
            />
            <span class="align-middle">{{ entry.title }}</span>
          </b-dropdown-item>
        </b-dropdown> -->

        <!-- <b-dropdown
          variant="white"
          class="d-none d-lg-inline-block ms-1"
          toggle-class="header-item noti-icon"
          right
          menu-class="dropdown-menu-lg"
        >
          <template v-slot:button-content>
            <i class="uil-apps"></i>
          </template>
          <div class="px-lg-2">
            <div class="row no-gutters">
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img src="@/assets/images/brands/github.png" alt="Github" />
                  <span>{{ $t("navbar.dropdown.site.list.github") }}</span>
                </a>
              </div>
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img
                    src="@/assets/images/brands/bitbucket.png"
                    alt="bitbucket"
                  />
                  <span>{{ $t("navbar.dropdown.site.list.bitbucket") }}</span>
                </a>
              </div>
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img
                    src="@/assets/images/brands/dribbble.png"
                    alt="dribbble"
                  />
                  <span>{{ $t("navbar.dropdown.site.list.dribbble") }}</span>
                </a>
              </div>
            </div>

            <div class="row no-gutters">
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img src="@/assets/images/brands/dropbox.png" alt="dropbox" />
                  <span>{{ $t("navbar.dropdown.site.list.dropbox") }}</span>
                </a>
              </div>
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img
                    src="@/assets/images/brands/mail_chimp.png"
                    alt="mail_chimp"
                  />
                  <span>{{ $t("navbar.dropdown.site.list.mailchimp") }}</span>
                </a>
              </div>
              <div class="col">
                <a class="dropdown-icon-item" href="#">
                  <img src="@/assets/images/brands/slack.png" alt="slack" />
                  <span>{{ $t("navbar.dropdown.site.list.slack") }}</span>
                </a>
              </div>
            </div>
          </div>
        </b-dropdown> -->

        <div class="dropdown d-none d-lg-inline-block ms-1">
          <button
            type="button"
            class="btn header-item noti-icon waves-effect"
            data-toggle="fullscreen"
            @click="initFullScreen"
          >
            <i class="uil-minus-path"></i>
          </button>
        </div>
        <b-dropdown
          variant="white"
          class="dropdown d-inline-block"
          toggle-class="header-item noti-icon"
          right
          menu-class="dropdown-menu-lg p-0 dropdown-menu-end"
        >
          <template v-slot:button-content>
            <i class="uil-bell"></i>
            <span v-if="badge !== 0" class="badge bg-danger rounded-pill">{{
              badge
            }}</span>
          </template>

          <div class="p-3">
            <div class="row align-items-center">
              <div class="col">
                <h5 class="m-0 font-size-16">Thông báo</h5>
              </div>
              <!-- <div class="col-auto">
                <a href="#!" class="small">{{
                  $t("navbar.dropdown.notification.subtext")
                }}</a>
              </div> -->
            </div>
          </div>
          <div class="simple-bar">
            <simplebar
              data-simplebar
              v-for="(notification, counter) in this.notifications"
              :key="counter"
            >
              <div
                v-if="notification.is_read === false"
                class="text-reset notification-item simple-bar-div"
                @click="navigateToSpecificUrl(notification)"
              >
                <div class="media simple-bar-color">
                  <div class="avatar-xs me-3">
                    <!-- <span
                      class="
                        avatar-title
                        bg-primary
                        rounded-circle
                        font-size-16
                      "
                    > -->
                    <img
                      v-bind:src="`${originUrl}${notification.image}`"
                      width="40"
                      height="40"
                    />
                    <!-- </span> -->
                  </div>
                  <div class="media-body">
                    <h6 class="mt-0 mb-1">
                      {{ notification.title }}
                    </h6>
                    <div class="font-size-12 text-muted">
                      <p class="mb-1">
                        {{ notification.content }}
                      </p>
                      <p class="mb-0">
                        <i class="mdi mdi-clock-outline"></i>
                        {{
                          new Date(notification.time).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                            hour12: false,
                          })
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-reset notification-item simple-bar-div">
                <div class="media">
                  <div class="avatar-xs me-3">
                    <img
                      v-bind:src="`${originUrl}${notification.image}`"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="media-body">
                    <h6 class="mt-0 mb-1">
                      {{ notification.title }}
                    </h6>
                    <div class="font-size-12 text-muted">
                      <p class="mb-1">
                        {{ notification.content }}
                      </p>
                      <p class="mb-0">
                        <i class="mdi mdi-clock-outline"></i>
                        {{
                          new Date(notification.time).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                            hour12: false,
                          })
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </simplebar>
            <simplebar data-simplebar>
              <div class="p-2 border-top">
                <a
                  class="btn btn-sm btn-link font-size-14 btn-block text-center"
                  @click="getNotifications(notify_index, 10, false)"
                >
                  Xem thêm
                </a>
              </div>
            </simplebar>
          </div>
          <div class="p-2 border-top">
            <a
              class="btn btn-sm btn-link font-size-14 btn-block text-center"
              @click="getAllNotification"
            >
              <i class="uil-arrow-circle-right me-1"></i>
              Xem toàn bộ thông báo
            </a>
          </div>
        </b-dropdown>

        <b-dropdown
          class="d-inline-block"
          toggle-class="header-item"
          right
          variant="white"
        >
          <template v-slot:button-content>
            <img
              v-if="user.data.image !== null"
              class="rounded-circle header-profile-user"
              :src="getImageURL(user.data.image)"
            />
            <img
              v-else
              for="upLoad"
              class="rounded-circle header-profile-user"
              src="@/assets/images/users/user.png"
              alt=""
            />
            <span class="d-none d-xl-inline-block ms-1 fw-medium font-size-15">
              {{ user.data.first_name }} {{ user.data.last_name }}
            </span>
            <i class="uil-angle-down d-none d-xl-inline-block font-size-15"></i>
          </template>

          <!-- item-->
          <div v-if="user.data.type_account === 'collaborator'">
            <router-link to="/contacts/profile" class="text-dark">
              <a class="dropdown-item" href="#">
                <i
                  class="
                    uil uil-user-circle
                    font-size-18
                    align-middle
                    text-muted
                    me-1
                  "
                ></i>
                <span class="align-middle">Profile</span>
              </a>
            </router-link>
          </div>
          <div v-else>
            <router-link to="/contacts/profile-employer" class="text-dark">
              <a class="dropdown-item" href="#">
                <i
                  class="
                    uil uil-user-circle
                    font-size-18
                    align-middle
                    text-muted
                    me-1
                  "
                ></i>
                <span class="align-middle">Profile</span>
              </a>
            </router-link>
          </div>

          <a
            class="dropdown-item"
            href="javascript: void(0);"
            @click="logoutUser"
          >
            <i
              class="
                uil uil-sign-out-alt
                font-size-18
                align-middle
                me-1
                text-muted
              "
            ></i>
            <span class="align-middle">Logout</span>
          </a>
        </b-dropdown>
        <button
          type="button"
          class="btn btn-sm px-3 font-size-16 d-xl-none header-item"
          data-toggle="collapse"
          data-target="#topnav-menu-content"
          @click="toggleMenu"
        >
          <i class="fa fa-fw fa-bars"></i>
        </button>
      </div>
    </div>

    <div class="container-fluid">
      <div class="topnav">
        <nav class="navbar navbar-light navbar-expand-xl topnav-menu">
          <div class="collapse navbar-collapse" id="topnav-menu-content">
            <ul
              class="navbar-nav"
              id="menuList"
              v-if="user.data.type_account === 'employer'"
            >
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('post.all') || checkPermisstion('post')
                  "
                  to="/"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-post',
                    }"
                  >
                    <!-- {{$t('post.menu')}} -->
                    Công việc
                  </span>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('candidate.all') ||
                    checkPermisstion('candidate')
                  "
                  to="/go-manage-candidate"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-candidate',
                    }"
                    >Ứng viên</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('interview.all') ||
                    checkPermisstion('interview')
                  "
                  to="/go-manage-interview"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-interview',
                    }"
                    >Lịch phỏng vấn</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('company.all') ||
                    checkPermisstion('company')
                  "
                  to="/go-manage-company"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-company',
                    }"
                    >Công ty</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('staff.all') || checkPermisstion('staff')
                  "
                  to="/go-manage-staff"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-staff',
                    }"
                    >Nhân viên</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-collaborators"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-collaborators',
                    }"
                    >Cộng tác viên</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="checkPermisstion('placement.all')"
                  to="/go-manage-placement"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/manage-placement',
                    }"
                    v-if="
                      checkPermisstion('placement.all') ||
                      checkPermisstion('placement')
                    "
                    >Thanh toán</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  v-if="
                    checkPermisstion('statistic.all') ||
                    checkPermisstion('statistic')
                  "
                  to="/go-manage-statistics"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla: url_current === '/statistics-for-employer',
                    }"
                    >Thống kê</span
                  >
                </router-link>
              </li>
            </ul>
            <ul
              class="navbar-nav"
              id="menuList"
              v-if="user.data.type_account === 'collaborator'"
            >
              <li class="nav-item">
                <router-link
                  to="/"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-post-for-collaborator',
                    }"
                  >
                    <!-- {{$t('post.menu')}} -->
                    Công việc
                  </span>
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-candidate"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-candidate-for-collaborator',
                    }"
                    >Ứng viên</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-refer-candidate"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-refer-candidate-collaborator',
                    }"
                    >Lịch sử giới thiệu</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-interview"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-interview-collaborator',
                    }"
                    >Lịch phỏng vấn</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-placement"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-placement-for-collaborator',
                    }"
                    >Thanh toán</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-statistics"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/statistics-for-collaborator',
                    }"
                    >Thống kê</span
                  >
                </router-link>
              </li>
              <li class="nav-item">
                <router-link
                  to="/go-manage-job-matching"
                  class="nav-link dropdown-toggle arrow-none side-nav-link-ref"
                >
                  <!-- <i :class="`${item.icon} me-2`"></i> -->
                  <span
                    v-bind:class="{
                      menuListColla:
                        url_current === '/manage-job-matching-for-collaborator',
                    }"
                    >Lọc ứng viên</span
                  >
                </router-link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@font-face {
  font-family: Roboto;
  src: url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);
}
.main-content {
  .page-content {
  }
}
.menuListColla {
  color: #5b73e8;
}

.navbar-header {
  .dropdown {
    .header-item {
      color: #495057 !important;
      &:hover {
        color: #5b73e8 !important;
        i {
          color: #5b73e8 !important;
        }
      }
      i {
        color: #495057 !important;
      }
    }
  }
  .app-search {
    .position-relative {
      margin-top: 0.8rem;
      width: 480px;
      input {
        background: #fff !important;
        border-radius: 5px;
        border: 1px solid rgba(221, 221, 221, 0.733);
        color: #495057 !important;
      }
      ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: #495057 !important;
        opacity: 1; /* Firefox */
      }

      :-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: #495057 !important;
      }

      ::-ms-input-placeholder {
        /* Microsoft Edge */
        color: #495057 !important;
      }
      .uil-search {
        color: #74788d;
      }
    }
  }
  .simple-bar {
    overflow-y: scroll;
    max-height: 400px;
  }
  .simple-bar-color {
    background-color: lightblue;
  }
  .simple-bar-div {
    border-style: inset;
    border-width: 0.05px;
  }
}

@media (max-width: 540px) {
  #page-topbar {
    .navbar-header {
      .header__logo {
        flex-basis: 100%;
        justify-content: space-between;
      }

      .header__menu {
        flex-basis: 100%;
        justify-content: flex-end;
      }
    }
  }
}

@media (max-width: 514.98px) {
  .navbar-header {
    .header__logo {
      .navbar-brand-box {
        .logo-sm {
          img {
            height: 30px;
          }
        }
      }
    }
  }
}
@media (max-width: 459.98px) {
  .language__title {
    display: none;
  }
}

@media (max-width: 374.98px) {
  .navbar-header {
    .header__logo {
      .navbar-brand-box {
        padding-right: 0;

        .logo-sm {
          img {
            height: 20px;
          }
        }
      }
    }
  }
}
</style>
