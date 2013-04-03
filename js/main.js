//  для всех с классом password
$(".text-line input.password").after("<span class='show-box'></span>");
//  чекбокс
$("input[type=checkbox]").click(function () {
    $(this).siblings(".checkbox").toggleClass("true")
});
//  радиобокс, нужно подправить
$("input[type=radio]").click(function () {
    $(this).siblings(".radiobox").toggleClass("true")
});
//  фокусирование полей ввода
$(".text-line input").focus(function (event) {
    $(".text-line").removeClass("focus");
    $(this).parent().addClass("focus");
    event.stopImmediatePropagation();
});
//  показ/скрытие символов для пароля
$(".show-box").disableSelection().click(function (event) {
    var el = $(this)
    el.toggleClass("true")
    var elData = el.parents(".text-line").children("input").val();
    if (el.hasClass("true")) {
        el.parents(".text-line").children("input[type=password]").after("<input class='password' type='text' value='' placeholder='' translate='0' traslatetype='attribute' translateattribute='placeholder' name='password' lang='password'>");
        el.parents(".text-line").children("input[type=password]").remove();
        el.parents(".text-line").children("input[type=text]").val(elData);
    }
    else {
        el.parents(".text-line").children("input[type=text]").after("<input class='password' type='password' value='' placeholder='' translate='0' traslatetype='attribute' translateattribute='placeholder' name='password' lang='password'>");
        el.parents(".text-line").children("input[type=text]").remove();
        el.parents(".text-line").children("input[type=password]").val(elData);
    }
    event.stopImmediatePropagation();
});
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
$('.item-list li').click(function (event) {
    $('.loader').show();
    setTimeout("loader();", 200);
    $(this).parent().siblings().children("li").removeClass('active');
    $(this).addClass('active');
    event.stopImmediatePropagation();
});
//  выход
$('.exit').click(function () {
    $('.manager').fadeOut(10).slideUp(200);
    $('.login-content').fadeOut(10).slideUp(200);
    $('.center-box').fadeIn(10).slideDown(50);
    $('form[name=auth]').fadeIn(300).slideDown(50);
});
//  свичер
$('.switch-box').disableSelection().click(function () {
    $(this).toggleClass('status-off');
    $(this).parents('tr').toggleClass('status-off');
});
//  табы
clickTabList = function (event) {
    $('.loader').show();
    setTimeout("loader();", 200);
    $('.tab-list li').removeClass('active');
    $('.three-content').css("top", 0);
    $('.set-task').hide(300);
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
$(".context-option").click(function (event) {
    $(".context-option").removeClass("active");
    $(this).toggleClass("active");
    event.stopImmediatePropagation();
});
$(".context-list .list").on("click", function (event) {
    $(this).parents(".context-option").removeClass("active");
    event.stopImmediatePropagation();
});