//メニュー切り替え

$(function(){
  $('.menu-tab li').on('click', function(){
    if($(this).not('is-active')){
      // タブメニュー
      $(this).addClass('is-active').siblings('li').removeClass('is-active');
      // タブの中身
      var index = $('.menu-tab li').index(this);
      $('.menu-tab-content .menu-content').eq(index).addClass('is-active').siblings('div').removeClass('is-active');
    }
  });
});


$(document).ready(function () {
  hsize = $(window).height();
  $("#full-hight").css("height", hsize + "px");
});
$(window).resize(function () {
  hsize = $(window).height();
  $("#full-hight").css("height", hsize + "px");
});
$(".nav-circle").click(function(){
  $(this).toggleClass("is-active");
});
$(".service-item,.works-item").mouseover(function(){
  $(this).addClass("is-active");
});
$(".service-item,.works-item").mouseout(function(){
  $(this).removeClass("is-active");
});







//スマホメニュー
$('.nav-sp').click(function(){
  $('.nav-sp,.nav-menu').toggleClass('is-active');
});

//ページ内リンク
$(function(){
  $('.page-link').click(function(){
    var speed = 500;
    var href= $(this).attr("href");
    var target = $(href == "#" || href == "" ? 'html' : href);
    var position = target.offset().top;
    $("html, body").animate({scrollTop:position}, speed, "swing");
    return false;
  });
});

//画面高さ取得・navの高さの取得
jQuery(window).scroll(function(){
  // 要素の位置を取得して変数に格納
  var offsetTop = $(document).scrollTop();//スクロール値
  var WinHeight = $(window).height();//画面の高さ
  // コンソールに表示
  // console.log(offsetTop,WinHeight);
  if(WinHeight < offsetTop){
    $('.nav-fixed,.side-fixed-menu').addClass('is-active');
  }else{
      $('.nav-fixed,.side-fixed-menu').removeClass('is-active');
  }
});
