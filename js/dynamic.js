$(window).load(function() {
	$(window).scroll(function () {
		if ($(this).scrollTop() > 50) {
			$('.home').stop(true, true).fadeIn(500);
		} else {
			$('.home').stop(true, true).fadeOut(500);
		}
	});
	$('.home').click(function () {
		$('body, html').animate({
			scrollTop: 0
		}, 1000);
		return false;
	});
});
$(document).ready(function() {
	$('.slider').slides({
		generatePagination: true,
		generateNextPrev: false,
		container: 'container',
		effect: 'slide',
		slideSpeed: 500,
		slideEasing: 'easeInOutQuad',
		play: 7500,
		pause: 2500
	});
	$('.intro .slider .container > div > div > div > div').each(function() {
		var sm = $(this).height()/2;
		$(this).css({'margin-top': -sm+'px'});
	});
	$('.catalog > div > div > div').prepend('<span></span>');
	$('.catalog > div > div > div').hover(
		function() {
			$(this).children('.buttons, span').stop(true, true).fadeIn(500);
		},
		function() {
			$(this).children('.buttons, span').stop(true, true).fadeOut(500);
		}
	);
	$('.main .information .reviews > div > div').append('<span></span>');
	$('input, textarea').each(function () {
		$(this).data('holder',$(this).attr('placeholder'));
		$(this).focusin(function(){
			$(this).attr('placeholder','');
		});
		$(this).focusout(function(){
			$(this).attr('placeholder',$(this).data('holder'));
		});
	});
	$('.intro .nav > div > ul > li').has('div').hover(
		function() {
			$(this).parents('.nav').addClass('hover');
			$(this).addClass('active');
			$(this).children('div').stop(true, true).fadeIn(0);
		},
		function() {
			$(this).parents('.nav').removeClass('hover');
			$(this).removeClass('active');
			$(this).children('div').stop(true, true).fadeOut(0);
		}
	);
	var minintronav = $('.intro .nav').height();
	$('.intro .nav ul li > div > div').css({'min-height': minintronav+'px'});
	$('.intro .nav ul li > div > div')
	$('.menu li:last-child, .footer li:last-child').css({'margin-right': '-10px'});
	$('.catalog > div > div > div:nth-child(4n)').css({'margin-right': '-3px'});
	$('.scroll ul li div.cover').each(function() {
		var iw = $(this).children('img').width()+28;
		$(this).width(iw);
	});
	var max = -1;
	$('.scroll ul li div.cover img').each(function() {
		var h = $(this).height()+28; 
		max = h > max ? h : max;
	});
	$('.scroll ul li div.cover').height(max);
	$('.scroll ul li div.cover').each(function() {
		var hm = max-$(this).children('img').height();
	});
	$('.scroll').append('<span class="ls"></span>');
	$('.scroll').append('<span class="rs"></span>');
	var sh = $('.scroll ul').height();
	$('.ls, .rs').height(sh);
	$('.scroll').height(sh+122);
	var su = 0;
	$('.scroll ul li').each(function(index) {
		su += parseInt($(this).width(), 10);
	});
	var su = su + ($('.scroll ul li').size()*32) - 32;
	$('.scroll ul').width(su);
	var scroll = $('.scroll > div').jScrollPane({
		horizontalDragMinWidth: 56,
		horizontalDragMaxWidth: 56,
		autoReinitialise: true,
		animateScroll: true,
		hijackInternalLinks: true
	});
	var api = scroll.data('jsp');
	var current = 1;
	$('.main .prev').bind('click', function() {
		if ( current > 1 ) {
			if (current == 2) {
				current = current - 1;
				target = 0;
			}
			else {
				current = current - 1;
				var target = $('#'+current).position().left-20;
				api.scrollBy(target, true);
			}
			api.scrollTo(target, true);
		}
		return false;
	});
	$('.main .next').bind('click', function() {
		var rp = $('.scroll ul').width() - $('#'+current).position().left - $('.scroll').width();
		if ( rp > 0 ) {
			current = current + 1;
			var target = $('#'+current).position().left-20;
			api.scrollTo(target, true);
		}
		return false;
	});
	$('.modal').append('<span class="close"></span>');

	var bh = 0;
	
	$('select').selectbox();
	
	$('.openmodal').click(function() {
		$('.modal, .fade').fadeIn(500);
		bh = $('body').scrollTop();
		$('body').css({'position': 'fixed', 'top': -bh+'px', 'overflow-y': 'scroll'});
		return false;
	});
	
	$('.scroll ul li > div div.description button').bind('click', function() {
		$('.modal .step2, .modal .step3, .modal .step4').hide();
		$('.modal .step1').show();
		$('.modal, .fade').fadeIn(500);
		bh = $('body').scrollTop();
		$('body').css({'position': 'fixed', 'top': -bh+'px', 'overflow-y': 'scroll'});
		var scrollanchor = $(this).parent().parent().attr('alt');
		$('.modal .step1 ul.phone li[title='+scrollanchor+']').click();
		return false;
	});
	
	$('.modal .close').click(function() {
		$(this).parent().fadeOut(500);
		$('.fade').removeClass('animate');
		$('.fade').fadeOut(500);
		$('.fade').delay(500).queue(function(next) { $(this).css({'background': 'rgba(211,147,22,0.75)'}); next(); });
		$('body').css({'position': 'static', 'top': '0', 'overflow-y': 'auto'});
		$('body').scrollTop(bh);
		if ( $('.modal .step4').is(':visible') ) {
			$('.modal .step4').delay(500).queue(function(next) { $(this).hide(); next(); });
			$('.modal .step1').delay(500).queue(function(next) { $(this).show(); next(); });
			$('.modal').delay(500).queue(function(next) { $(this).removeClass('thanks'); next(); });
		}
		return false;
	});
	
	var phone = 0;
	var material = 0;
	var color = 0;
	var price = 0;

	$('.modal .step1 ul.phone li').bind('click', function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		phone = $(this).attr('title');
		price = phone+material;
		if ( phone != 0 && material !=0 ) {
			$(this).parents('.step1').find('div.price').empty().html('<p><span>Сумма заказа</span> '+price+'<em>p</em></p>');
		}
	}).filter(':first').click();

	$('.modal .step1 ul.material li').bind('click', function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		material = $(this).attr('title');
		price = phone+material;
		if ( phone != 0 && material !=0 ) {
			$(this).parents('.step1').find('div.price').empty().html('<p><span>Сумма заказа</span> '+price+'<em>p</em></p>');
		}
	}).filter(':first').click();

	$('.modal .step1 div.color ul li').bind('click', function() {
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		color = $(this).attr('title');
	}).filter(':first').click();
	
	var phonelink;
	
	$('.modal .step1 .next button').bind('click', function() {
		if ( phone != 0 ) {
			$(this).parents('.modal').find('.step2 .next').prev().find('.image img.cover').remove();
			$(this).parents('.modal').find('.step1').hide();
			$(this).parents('.modal').find('.step2').show();
			$('.fade').removeClass('animate').addClass('animate');
			$('.fade').css({'background': 'rgba(128,196,255,0.75)'});
			phonelink = './covers/'+phone+'_'+material+'_cover.png';
			$(this).parents('.modal').find('.step2 .next').prev().find('.image').append('<img src="'+phonelink+'" class="cover" alt="" style="visibility:hidden">');
			$('.modal .image img.cover').load(function() {
				croppic.destroy();
				croppic = new Croppic('crop', cropOptions);
				var cropwidth = $(this).width(); 
				var cropheight = $(this).height();
				$('#crop').css({'width': cropwidth+'px', 'height': cropheight+'px', 'margin-top': Math.floor(400-cropheight)/2+'px'});
				$('.image img.cover').css({'margin-left': -cropwidth/2+'px', 'visibility': 'visible', 'margin-top': Math.floor(400-cropheight)/2+'px'});
			});
		}
		else {
			alert('Выберите устройство!');
		}
		return false;
	});

	var cropImageUrl = 0;
	var cropOptions = {
		uploadUrl:'img_save_to_file.php',
		cropData:{
		"dummyData":1,
		"dummyData2":"asdas"
		},
		cropUrl:'img_crop_to_file.php',
		customUploadButtonId:'button',
		modal:false,
		loaderHtml:'<div class="loader bubblingG"><span id="bubblingG_1"></span><span id="bubblingG_2"></span><span id="bubblingG_3"></span></div>',
		onBeforeImgUpload: function() {},
		onAfterImgUpload: function() {},
		onImgDrag: function() {},
		onImgZoom: function() {},
		onBeforeImgCrop: function() {},
		onAfterImgCrop:function() {
			cropImageUrl = $('#crop').find('.croppedImg').attr('src');
			$('.modal').find('.step2').delay(1000).queue(function(next) { $(this).hide(); next(); });
			$('.modal').find('.step3').delay(1000).queue(function(next) { $(this).show(); next(); });
			$('.modal').find('.step3').parent().delay(1000).queue(function(next) { $(this).css({'background': '#ffffff url("./img/modal_step3_bg.png") no-repeat center top'}); next(); });
			$('.fade').removeClass('animate').addClass('animate');
			$('.fade').delay(1000).queue(function(next) { $(this).css({'background': 'rgba(163,42,99,0.75)'}); next(); });
			console.log('урл нарезанной картинки '+cropImageUrl);
			croppic.reset();
		},
		imgEyecandyOpacity:0
	}

	var croppic = new Croppic('crop', cropOptions);

	$('.modal .step2 .next button').bind('click', function() {
		croppic.crop();
		return false;
	});
	
	var dropZone = $('.step2 > div.dropable');

	dropZone[0].ondragover = function() {
		dropZone.css({'outline': '3px solid #466592'});
		return false;
	};

	dropZone[0].ondragleave = function() {
		dropZone.css({'outline': 'none'});
		return false;
	};

	$('.modal .step2 .prev').click(function() {
		$(this).parent().hide();
		$(this).parent().siblings('.step1').show();
		$('.fade').removeClass('animate').addClass('animate');
		$('.fade').css({'background': 'rgba(211,147,22,0.75)'});
		return false;
	});

	$('.modal .step3 .prev').click(function() {
		$(this).parent().hide();
		$(this).parent().siblings('.step2').show();
		$('.fade').removeClass('animate').addClass('animate');
		$('.fade').css({'background': 'rgba(128,196,255,0.75)'});
		$('.modal').find('.step2').parent().css({'background': '#ffffff'});
		$('.croppedImg').remove();
		return false;
	});

	$('.modal .step3 .next button').bind('click', function() {
		$(this).parents('.modal').addClass('bg');
		$(this).parents('.modal').find('.step3').hide();
		$(this).parents('.modal').find('.step35').show();
		$(this).parents('.step3').find('input').removeClass('error success');
		$(this).parents('.step3').find('input').val('');
		return false;
	});

	$('.modal .step35 .prev').click(function() {
		$(this).parent().hide();
		$(this).parent().siblings('.step3').show();
		$('.modal').find('.step3').parent().css({'background': '#ffffff'});
		return false;
	});

	$('.modal .step35 .next button').bind('click', function() {
		$(this).parents('.modal').removeClass('bg');
		$(this).parents('.modal').addClass('thanks');
		$(this).parents('.modal').find('.step35').hide();
		return false;
	});
	
	
	
	$('.scroll ul li > div .description').append('<span></span>');
	$('.scroll ul li > div').hover(
		function() {
			$(this).parent().siblings().stop(true, true).animate({'opacity': '0.5'}, 250);
			$(this).find('.description').stop(true, true).delay(250).fadeIn(250);
			var thisposition = $(this).offset().left + ( $(this).width() / 2 );
			//alert($(window).width() / 2);
			if ( thisposition < ( $(window).width() / 2) ) {
				$(this).children('.description').addClass('left');
			}
			else {
				$(this).children('.description').addClass('right');
			}
		},
		function() {
			$(this).parent().siblings().stop(true, true).animate({'opacity': '1'}, 250);
			$(this).find('.description').stop(true, true).fadeOut(250);
			$(this).find('.description').removeClass('left right');
		}
	);
});