function setHeightTaskContent() {
    $(".tasks-content").css("height", $(window).height() - 30);
};
$(window).resize(setHeightTaskContent);
$(document).ready(setHeightTaskContent);
$(".lng-item").click(function () {
    $(".lng-item").removeClass("active");
    $(this).addClass("active");
});
$(".switch-box").click(function () {
    $(this).toggleClass("status-off");
});
/*
 $(".auth-no-success").click(function () {
 $('.auth-no-success').hide();
 $('.auth-success').show();
 });
 $(".auth-success").click(function () {
 $('.auth-success').hide();
 $('.auth-no-success').show();
 }); */
$(".show-box").disableSelection().click(function (event) {
    var el = $(this)
    el.toggleClass("true")
    var elData = el.parents(".text-line").children("input").val();
    if (el.hasClass("true")) {
        el.parents(".text-line").children("input[type=password]").after("<input class='password' type='text' value='' placeholder='Пароль'>");
        el.parents(".text-line").children("input[type=password]").remove();
        el.parents(".text-line").children("input[type=text]").val(elData);
    }
    else {
        el.parents(".text-line").children("input[type=text]").after("<input class='password' type='password' value='' placeholder='Пароль'>");
        el.parents(".text-line").children("input[type=text]").remove();
        el.parents(".text-line").children("input[type=password]").val(elData);
    }
    event.stopImmediatePropagation();
});
<<<<<<< HEAD
//  авторизация/регистрация/восстановление
signList = function (event) {
    $("[name=confirm-box]").hide();
    $('.center-box form').hide();
    var item = $(this).attr('name');
    switch (item) {
        case 'reg':
            $('form[name=reg]').fadeIn(550).slideDown(500);
            break;
        case 'auth':
            $('form[name=auth]').fadeIn(550).slideDown(500);
            break;
        case 'forgot':
            $('form[name=forgot]').fadeIn(550).slideDown(500);
            break;
    }
    event.stopImmediatePropagation();
};
//  функции при загрузке документа
$(document).ready(function () {
    $(".link").on("click", signList);
    $(".forgot-cancel").on("click", function () {
        $('.center-box form').hide();
        $('form[name=auth]').fadeIn(550).slideDown(500);
    });
    /*$("form[name=auth]").submit(function () {
        $('.center-box').hide();
        $('.center-box form').hide();
        $('.manager').fadeIn(550).slideDown(500);
        $('.login-content').fadeIn(550).slideDown(500);
    });*/
    $("form[name=forgot]").submit(function () {
        $("[name=confirm-box]").fadeIn(550).slideDown(500);
    });
});
//  скроллинг
function setHeightContentScroll() {
    $('.content-scroll').css("height", $(window).height() - 30);
    $('.manager .content-scroll').css("height", $(window).height() - 60);
    $('.content-scroll').children().css("top", 0);
};
setHeightContentScroll();
$(window).resize(setHeightContentScroll);
$('.center-box, .content-idea.one .item-list, .content-idea.two .item-list, .content-idea.three .three-content').mousewheel(function (e, delta) {
    var scrollSize = 10;
    if (delta > 0) {
        if (parseInt($(this).css("top")) != 0) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    } else {
        if ($(this).parent().height() + Math.abs(parseInt($(this).css("top"))) <= $(this).height()) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    }
});
//  языки
$('.lng .show').click(function () {
    $(this).toggleClass('true');
    if ($(this).hasClass('true')) {
        $('.lng-check').fadeIn(10).slideDown(200);
    }
    else {
        $('.lng-check').fadeOut(10).slideOut(200);
    }
});
$('.lng-check li').click(function () {
    $('.lng-check .lng-item').removeClass('active');
    $(this).children('span').addClass('active');
    $('.lng .show').removeClass('true');
    $('.lng-check').fadeOut(10).slideOut(200);
});
//  мессаги
$('.msg-box .close').live("click", function(e){
	$(this).parent().fadeOut(300).slideUp(200);
});
//  лоадер
function loader() {
    $('.loader').fadeOut(300).slideUp(200);
};
$('.loader').on("ready", function () {
    setTimeout("loader();", 1000);
});
//  менеджер/списки
=======
>>>>>>> add
$('.item-list li').click(function (event) {
    $(this).parent().children("li").removeClass('active');
    $(this).addClass('active');
    event.stopImmediatePropagation();
});
clickTabList = function (event) {
    $('.tab-list li').removeClass('active');
    //$('.set-task').hide(300);
    var item = $(this).attr('class');
    switch (item) {
        case 'general':
            $('.set-task[name=set-general]').fadeIn(300);
            break;
        case 'targeting':
            $('.set-task[name=set-targeting]').fadeIn(300);
            break;
        case 'audit':
            $('.set-task[name=set-audit]').fadeIn(300);
            break;
        case 'statistics':
            $('.set-task[name=set-stat]').fadeIn(300);
            break;
    }
    $(this).toggleClass('active');
};
$('.tab-list li').on('click', clickTabList);
$('.tab-list li').click(function () {
    $(this).addClass('active');
});
$('.edit').click(function () {
    $(this).toggleClass('active');
});
<<<<<<< HEAD
$(".context-list .list").on("click", function (event) {
    $(this).parents(".context-option").removeClass("active");
    event.stopImmediatePropagation();
});
=======
//  скроллинг
function setHeightContentScroll() {
    $('.setting-group').css("height", $(window).height() - 90);
    $('.content-height').css("height", $(window).height() - 60);
};
setHeightContentScroll();
$(window).resize(setHeightContentScroll);
$('.content-scroll').mousewheel(function (e, delta) {
    var scrollSize = 15;
    if (delta > 0) {
        if (parseInt($(this).css("top")) != 0) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    } else {
        if ($(this).parent().height() + Math.abs(parseInt($(this).css("top"))) <= $(this).height()) {
            $(this).css("top", parseInt($(this).css("top")) + scrollSize * delta);
        }
    }
});
$(".spoiler").click(function () {
    $(this).toggleClass("active");
    if($(this).hasClass("active")){
        $(this).parents(".set-item").children(".graph-box").show()
    }
    else {
        $(this).parents(".set-item").children(".graph-box").hide()
    }
});
$(".loader").click(function(){
    $(this).hide()
})
>>>>>>> add
