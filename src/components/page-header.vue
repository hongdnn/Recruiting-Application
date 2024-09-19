<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>

<template>
  <!-- start page title -->
  <div class="row">
    <div class="col-12">
      <div
        class="page-title-box d-flex align-items-center justify-content-between"
      >
        <h4 class="mb-0">{{ title }}</h4>

        <div class="page-title-right">
          <b-breadcrumb :items="items" class="m-0 mat-tilte-page"></b-breadcrumb>
        </div>
      </div>
    </div>
  </div>
  <!-- end page title -->
</template>
<style lang="scss">
    .page-title-box{
      h4{
        @media screen and (max: width 767px){
          font-size:17px !important;
        }
        @media screen and (max-width:600px){
          font-size:15.5px !important;
        }
      }
    }
</style>