<script>
import Layout from "../../layouts/main";
import PageHeader from "@/components/page-header";
import appConfig from "@/app.config";
import { required, email } from "vuelidate/lib/validators";
import { mapGetters, mapActions, mapState } from 'vuex'
import Profile from "./profile";
import ProfileCompany from './profileCompany';
export default {
  page: {
    title: "Hồ Sơ",
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
     Profile,
    ProfileCompany,
  },
  data() {
    return {
      user:{
        id:"1",
        first_name:"",
        phone:"",
        email:"",
        hotline:"",
        address:"",
      },
      submitted: false,
    tryingToGetProfile: false,
      isGetProfileError: false,
      title: "Hồ Sơ",
      showRole: false
    };
  },

  validations: {
    email: {
      required,
      email,
    },
  },
  computed: {
    ...mapGetters('user', ['getProfileGetter']),
    ...mapState('user', ['userProfile']),
    notification() {
      return this.$store ? this.$store.state.notification : null;
    },
    notificationAutoCloseDuration() {
      return this.$store && this.$store.state.notification ? 5 : 0;
    },
  },
      watch:{
      data(newValue){
        this.user=newValue;
      }
    },
    
    mounted(){
      //this.getAll();
        // this.getProfileByCollaboratorId();
        // this.getProfileByEmployerId();
            let userStorage = JSON.parse(localStorage.getItem('user'));
        if (userStorage.data.type_account==="collaborator") {
          this.showRole = true;
          
        }else { 
          this.showRole = false;
        }
        
    }  ,
    created(){
        this.unsub = this.$store.subscribe((mut, state)=> {
            this.user.first_name = state.user.userProfile.first_name
       this.user.email = state.user.userProfile.email
       this.user.phone=state.user.userProfile.phone
        })
    },
    beforeDestroy() {
        this.unsub();
    },
    methods: {
      ...mapActions('user', [
      'getProfileByCollaborator',
      'getProfileByEmployer'
    ]),
    
    // getAll(){
    //     this.getAll().then(() =>{
    //       if(this.user.type_account==="employer"){
    //         this.getProfileByEmployerId();
    //       this.showRole = true;
    //       } else{
    //         this.getProfileByCollaboratorId();
    //       this.showRole = false;
    //       }
    //     });

    // },
  
    //   getProfileByCollaboratorId(){
   
    //     console.log(this.showRole)
    //     this.getProfileByCollaborator(id).then(() =>{
    //    this.user.first_name = this.userProfile.first_name
    //    this.user.email = this.userProfile.email
    //    this.user.phone=this.userProfile.phone
    //    console.log(this.user)
    //    }
    //    );
    //  },

    //  getProfileByEmployerId(){
    //        let userStorage = JSON.parse(localStorage.getItem('user'));
    //     var id = userStorage.data.id
        
    //     this.getProfileByEmployer(id).then(() =>{
    //     console.log(this.userProfile)
    //     console.log(this.$store.state.user)
    //     console.log(JSON.parse(JSON.stringify(this.$store.state.user)))
    //    this.user.first_name = this.userProfile.first_name
    //    this.user.email = this.userProfile.email
    //    this.user.phone=this.userProfile.phone
    //    console.log(this.user)
    //    }
    //    );
    //  }
     
    }

};
</script>

<template>
  <Layout>
    <PageHeader :title="title" />
    <div class="row">
       <ProfileCompany v-if="!this.showRole" /> 
      <Profile v-if="this.showRole"/>
    
    </div>
  </Layout>
</template>