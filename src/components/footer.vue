<script>
export default {};
</script>

<template>
  <div class="styleFooter">
    <div class="container-fluid">
      <div class="col-12 p-0">
        <footer class="footer-main d-flex flex-wrap">
          <div class="col-md-6 col-12">
            <h6 class="contact">LIÊN HỆ</h6>
            <div style="width: 100%">
              <ul class="list-info">
                <li>
                  <span
                    >Đơn vị chủ quản: Công ty TNHH tatool Địa chỉ: P1-2.43,
                    Tầng 2, toà nhà The Prince Residence, 19-21 Nguyễn Văn Trỗi,
                    Phường 12, Quận Phú Nhuận, HCM, VN</span
                  >
                </li>
                <li>
                  <span class="email"
                    >Email:
                    <a href="mailto:info@tatool.vn">info@tatool.vn</a></span
                  >
                </li>
                <li><span class="phone">Hotline: 028.668.19.668</span></li>
              </ul>
            </div>
          </div>
          <div class="col-md-6 col-12">
            <h6 class="info">THÔNG TIN</h6>
            <ul class="list-info two">
              <li><a href="">Điều khoản dịch vụ</a></li>
              <li><a href="">Chính sách thanh toán</a></li>
              <li><a href="">Quy định bảo mật</a></li>
              <li><a href="">Liên hệ</a></li>
              <li>
                <a href=""
                  >Về chúng tôi</a
                >
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
    <div class="col-12 text-center bottom-footer">
        <img src="@/assets/images/logomain.png" style='margin-right:10px;cursor:pointer' alt="" height="50">
      <span style='font-size:14px'>Talent Acquisition - tatool © 2021. All Rights Reserved.</span>
    </div>
  </div>
</template>
<style lang='scss'>
.styleFooter {
    margin-bottom: 0;
  -webkit-box-shadow: 0px -2px 9px -2px rgba(186, 186, 186, 1);
  -moz-box-shadow: 0px -2px 9px -2px rgba(186, 186, 186, 1);
  box-shadow: 0px -2px 9px -2px rgba(186, 186, 186, 1);
  background-color: #fff;
}
.footer-main {
  padding: 20px 0 0 0;
  .email {
    margin-top: 10px;
    a {
      color: #495057;
      &:hover {
        color: #5b73e8;
        text-decoration: underline;
      }
    }
  }
  .phone {
    margin-top: 10px;
  }
  .list-info {
    list-style: none;
    padding: 0;
    li {
        font-size: 14px;
      cursor: pointer;
      margin-bottom: 8px;
    }
  }
  .two {
    li {
      a {
        color: #495057;
        &:hover {
          color: #5b73e8;
        }
      }
    }
  }
}
.bottom-footer {
  padding: 10px 0;
  border-top: 1px solid #eae9e9;
}
.contact, .info {
  font-weight: 600;
}
</style>   