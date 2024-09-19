<script>

import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";
import { mapGetters, mapActions, mapState } from "vuex";

/**
 * Profile component
 */
export default {
  page: {
    title: "Hồ Sơ Công Ty",
    meta: [
      {
        name: "description",
        content: appConfig.description,
      },
    ],
  },
  data() {
    return {
      user: {
        id: "1",
        first_name: "",
        phone: "",
        email: "",
        hotline: "",
        address: "",
        status: "",
        last_name: "",
      },
      submitted: false,
      tryingToGetProfile: false,
      isGetProfileError: false,
      title: "Hồ Sơ",
    };
  },

  validations: {
    email: {
      required,
      email,
    },
  },
  computed: {
    ...mapGetters("user", ["getProfileGetter"]),
    ...mapState("user", ["userProfile"]),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
     dataProfile(){
      return this.getProfileGetter;
      }
  },
  watch: {
    data(newValue) {
      this.user = newValue;
    },
  },

  async mounted() {
    await this.getProfileByEmployerId();
  },
  // created(){
  //    this.unsub = this.$store.subscribe((mut, state)=> {
  //    this.user.first_name = state.user.userProfile.first_name
  //    this.user.email = state.user.userProfile.email
  //    this.user.phone=state.user.userProfile.phone
  //    this.user.last_name=state.user.userProfile.last_name
  //    this.user.address=state.user.userProfile.address
  //    this.user.status=state.user.userProfile.status
  //    this.user.job_role_ids=state.user.userProfile.job_role_ids
  //    this.user.location_ids=state.user.userProfile.location_ids
  //     })
  // },
  // beforeDestroy() {
  //     this.unsub();
  // },
  methods: {
    ...mapActions("user", [
      "getProfileByEmployer",
      "putProfileByEmployer",
    ]),

    async getProfileByEmployerId() {
    let userStorage = JSON.parse(localStorage.getItem('user'));
    var id = userStorage.data.id
    await this.getProfileByEmployer(id)
    this.user.first_name = this.userProfile.data.first_name
    this.user.email = this.userProfile.data.email
    this.user.phone=this.userProfile.data.phone
    },
    async saveUser() {
      let userStorage = JSON.parse(localStorage.getItem('user'));
        const userData={
          id:userStorage.data.id,
          first_name:this.user.first_name,
          email:this.user.email,
          phone:this.user.phone,
          last_name:this.user.last_name,
          status:this.user.status
        };
        if(userData.id){
    await this.putProfileByEmployer(userData)
    this.user.first_name=this.userProfile.data.first_name
          this.user.email = this.userProfile.data.email
       this.user.phone=this.userProfile.data.phone
       }
        
    },
    checkForm: function (e) {
      if (this.user.first_name && this.user.last_name) return true;
      this.errors = [];
      if (!this.name) this.errors.push("Name required.");
      if (!this.age) this.errors.push("Age required.");
      e.preventDefault();
    },
     addTag (newTag) {
      const tag = {
        name: newTag,
        id: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
      }
      this.user.job_roles.push(tag)
      this.dataDropdown.push(tag)
    }
  },
};
</script>

<template>
  <Layout>
    <PageHeader :title="title" />

    <div class="row mb-4">
      <div class="col-xl-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="text-center">
              <b-dropdown
                class="float-end"
                variant="white"
                right
                menu-class="dropdown-menu-end"
                toggle-class="font-size-16 text-body p-0"
              >
                <template v-slot:button-content>
                  <i class="uil uil-ellipsis-v"></i>
                </template>
                <a class="dropdown-item" href="#">Edit</a>
                <a class="dropdown-item" href="#">Action</a>
                <a class="dropdown-item" href="#">Remove</a>
              </b-dropdown>
              <div class="clearfix"></div>
              <div>
                <img
                  src="@/assets/images/users/avatar-4.jpg"
                  alt
                  class="avatar-lg rounded-circle img-thumbnail"
                />
              </div>
              <h5 class="mt-3 mb-1">
                {{ user.first_name }} {{ user.last_name }}
              </h5>

              <div class="mt-4">
                <button type="button" class="btn btn-light btn-sm">
                  <i class="uil uil-envelope-alt me-2"></i> Message
                </button>
              </div>
            </div>

            <hr class="my-4" />

            <div class="text-muted">
              <h5 class="font-size-16"></h5>
              <p>
                Công ty chúng tôi là {{ user.first_name }} {{ user.last_name }}
              </p>
              <div class="table-responsive mt-4 mb-0">
                <div>
                  <p class="mb-1">Tên :</p>
                  <h5 class="font-size-16">
                    {{ user.first_name }} {{ user.last_name }}
                  </h5>
                </div>
                <div class="mt-4">
                  <p class="mb-1">Số điện thoại :</p>
                  <h5 class="font-size-16">{{ user.phone }}</h5>
                </div>
                <div class="mt-4">
                  <p class="mb-1">E-mail :</p>
                  <h5 class="font-size-16">{{ user.email }}</h5>
                </div>
                <div class="mt-4">
                  <p class="mb-1">Địa điểm :</p>
                  <h5 class="font-size-16">{{ user.location_ids }}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-8">
        <div class="card mb-0">
          <b-tabs content-class="p-4" justified class="nav-tabs-custom">
            <b-tab active>
              <template v-slot:title>
                <i class="uil uil-user-circle font-size-20"></i>
                <span class="d-none d-sm-block">Thông tin tài khoản</span>
              </template>
              <div>
                <div class="text-center">
                  <img
                    src="@/assets/images/users/avatar-4.jpg"
                    alt
                    class="avatar-lg rounded-circle img-thumbnail"
                  />
                  <br />
                  <b-button variant="secondary" class="w-md ms-1"
                    >Thay đổi logo</b-button
                  >
                </div>

                <div class="col-12">
                  <form>
                    <div class="col-12 d-flex">
                      <div class="col-5" style="margin-left: 2rem">
                        <b-form-group
                          class="mb-3"
                          id="example name"
                          label="Họ"
                          label-for="name"
                        >
                          <b-form-input
                            for="name"
                            v-model="user.first_name"
                          ></b-form-input>
                        </b-form-group>
                      </div>
                      <div class="col-1"></div>
                      <div class="col-5">
                        <b-form-group
                          class="mb-3"
                          id="example name"
                          label="Tên"
                          label-for="name"
                        >
                          <b-form-input
                            for="name"
                            v-model="user.last_name"
                          ></b-form-input>
                        </b-form-group>
                      </div>
                    </div>
                    <div class="col-12 d-flex">
                      <div class="col-5" style="margin-left: 2rem">
                        <b-form-group
                          id="example-tel"
                          label="Số điện thoại"
                          label-for="tele"
                          class="mb-3"
                        >
                          <b-form-input v-model="user.phone"></b-form-input>
                        </b-form-group>
                      </div>
                      <div class="col-1"></div>
                      <div class="col-5">
                        <b-form-group
                          id="example-email"
                          label="Email"
                          label-for="email"
                          class="mb-3"
                        >
                          <b-form-input v-model="user.email"></b-form-input>
                        </b-form-group>
                      </div>
                    </div>
                    <b-form-group
                      id="example-address"
                      label="Địa chỉ"
                      label-for="address"
                      class="mb-3"
                      style="margin-left: 2rem"
                    >
                      <b-form-input v-model="user.address"></b-form-input>
                    </b-form-group>

                    <div style="float: right; margin-bottom: 5.5rem">
                      <b-button
                        variant="success"
                        class="w-md ms-1"
                        v-on:click="saveUser()"
                        >Lưu</b-button
                      >
                    </div>
                  </form>
                </div>
              </div>
            </b-tab>
         
          </b-tabs>
          <!-- Nav tabs -->
          <!-- Tab content -->
        </div>
      </div>
    </div>
    <!-- end row -->
  </Layout>
</template>
