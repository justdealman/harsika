/*
 * CROP
 * dependancy: jQuery
 * author: Ognjen "Zmaj Džedaj" Božičković
 */

(function (window, document) {

	Croppic = function (id, options) {

		var that = this;
		that.id = id;
		that.obj = $('#' + id);
		that.outputDiv = that.obj;

		// DEFAULT OPTIONS
		that.options = {
			uploadUrl:'',
			uploadData:{},
			cropUrl:'',
			cropData:{},
			outputUrlId:'',
			//styles
			imgEyecandy:true,
			imgEyecandyOpacity:0.2,
			zoomFactor:10,
			doubleZoomControls:true,
			modal:false,
			customUploadButtonId:'',
			loaderHtml:'',
			//callbacks
			onBeforeImgUpload: null,
			onAfterImgUpload: null,
			onImgDrag: null,
			onImgZoom: null,
			onBeforeImgCrop: null,
			onAfterImgCrop: null
		};

		// OVERWRITE DEFAULT OPTIONS
		for (i in options) that.options[i] = options[i];

		// INIT THE WHOLE DAMN THING!!!
		that.init();
		
	};
	

	var multiply = 1;
	var origratio = 1;
	var preview = 1;
	var angle = 0;

	Croppic.prototype = {
		id:'',
		imgInitW:1,
		imgInitH:0,
		imgW:0,
		imgH:0,
		objW:0,
		objH:0,
		windowW:0,
		windowH:$(window).height(),
		obj:{},
		outputDiv:{},
		outputUrlObj:{},
		img:{},
		defaultImg:{},
		croppedImg:{},
		imgEyecandy:{},
		form:{},
		cropControlsUpload:{},
		cropControlsCrop:{},
		cropControlZoomMuchIn:{},
		cropControlZoomMuchOut:{},
		cropControlZoomIn:{},
		cropControlZoomOut:{},
		cropControlCrop:{},
		cropControlReset:{},	
		cropControlRemoveCroppedImage:{},	
		cropControlClockwise:{},	
		modal:{},
		loader:{},
		
		init: function () {
			var that = this;
			
			that.objW = that.obj.width();
			that.objH = that.obj.height();
			
			if( $.isEmptyObject(that.defaultImg)){ that.defaultImg = that.obj.find('img'); }
			
			that.createImgUploadControls();
			that.bindImgUploadControl();
			
		},
		createImgUploadControls: function(){
			var that = this;
			
			var cropControlUpload = '';
			if(that.options.customUploadButtonId ===''){ cropControlUpload = '<i class="cropControlUpload"></i>'; }
			var cropControlRemoveCroppedImage = '<i class="cropControlRemoveCroppedImage"></i>';
			
			if( $.isEmptyObject(that.croppedImg)){ cropControlRemoveCroppedImage=''; }

			var html =    '<div class="cropControls cropControlsUpload"> ' + cropControlUpload + cropControlRemoveCroppedImage + ' </div>';
			that.outputDiv.append(html);
			
			that.cropControlsUpload = that.outputDiv.find('.cropControlsUpload');
			
			if(that.options.customUploadButtonId ===''){ that.imgUploadControl = that.outputDiv.find('.cropControlUpload'); }
			else{	that.imgUploadControl = $('#'+that.options.customUploadButtonId); that.imgUploadControl.show();	}

			if( !$.isEmptyObject(that.croppedImg)){
				that.cropControlRemoveCroppedImage = that.outputDiv.find('.cropControlRemoveCroppedImage');
			}
			
		},
		bindImgUploadControl: function(){
			
			var that = this;
			
			// CREATE UPLOAD IMG FORM
			var formHtml = '<form class="'+that.id+'_imgUploadForm" style="display: none; visibility: hidden;">  <input type="file" name="img">  </form>';
			that.outputDiv.append(formHtml);
			that.form = that.outputDiv.find('.'+that.id+'_imgUploadForm');
			
			that.imgUploadControl.off('click');
			that.imgUploadControl.on('click',function(){ 
				that.form.find('input[type="file"]').trigger('click');										
			});
			
			
	
			if( !$.isEmptyObject(that.croppedImg)){
			
				that.cropControlRemoveCroppedImage.on('click',function(){ 
					that.croppedImg.remove();
					
					if( !$.isEmptyObject(that.defaultImg)){ 
						that.obj.append(that.defaultImg);
					}
					
					if(that.options.outputUrlId !== ''){	$('#'+that.options.outputUrlId).val('');	}
				
				});	
			
			}
			
											
			that.form.find('input[type="file"]').change(function(){
				
				if (that.options.onBeforeImgUpload) that.options.onBeforeImgUpload.call(that);
				
				that.showLoader();
				that.imgUploadControl.hide();
			
				var formData = new FormData(that.form[0]);
				
				for (var key in that.options.uploadData) {
					if( that.options.uploadData.hasOwnProperty(key) ) {
						formData.append( key , that.options.uploadData[key] );	
					}
				}
				
				$.ajax({
                    url: that.options.uploadUrl,
                    data: formData,
                    context: document.body,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST'
				}).always(function(data){
				
					response = jQuery.parseJSON(data);
					if(response.status=='success'){
					
					
						that.imgInitW = that.imgW = response.width;
						that.imgInitH = that.imgH = response.height;
						
						if ( that.imgW > 999 && that.imgH > 399 && that.imgW < 3841 && that.imgH < 2161) {
						
							$('.step2 > div p.mistake').remove();
							
							that.reset();
							
							multiply = 1;
							
							
							
							var ratio = that.imgInitW / that.imgInitH;
							
							if ( that.imgInitW < that.objW ) {
								that.imgInitW = that.objW;
								that.imgInitH = that.imgInitW*ratio;
								
								if ( that.imgInitH < that.objH) {
									that.imgInitH = that.objH;
									that.imgInitW = that.objH/ratio;
								}
								
								multiply = response.width / that.imgInitW;
							}
							
							if(that.options.modal){	that.createModal(); }
							if( !$.isEmptyObject(that.croppedImg)){ that.croppedImg.remove(); }
							
							that.imgUrl=response.url;
							
							that.obj.append('<img src="'+response.url+'">');
							that.initCropper();
							
							that.hideLoader();

							if (that.options.onAfterImgUpload) that.options.onAfterImgUpload.call(that);
						
						}
						
						else {
						
						
							if ( that.imgW < 1000 || that.imgH < 400 ) {
								$('.step2 > div p.mistake').remove();
								$('.step2 > div').append('<p class="mistake">Недостаточный размер файла, необходимо загрузить картинку размером не менее 1000x400 px.</p>');
								that.hideLoader();
							
							}
						
							if ( that.imgW > 3840 || that.imgH > 2160 ) {
								$('.step2 > div p.mistake').remove();
								$('.step2 > div').append('<p class="mistake">Слишком большое изображение, необходимо загрузить картинку размером не более 3841x2161 px.</p>');
								that.hideLoader();
							
							}
						}
						
					}
					
					if(response.status=='error'){
						$('.step2 > div p.mistake').remove();
						$('.step2 > div').append('<p class="mistake">Данный формат файла не поддерживается. Загрузите любое изображение в формате JPG, GIF или PNG.</p>');
						that.hideLoader();
					}

				});
				
			});

			dropZone = $('.step2 > div.dropable');

			dropZone[0].ondrop = function(event) {
				event.preventDefault();
				dropZone.css({'outline': 'none'});

				if (that.options.onBeforeImgUpload) that.options.onBeforeImgUpload.call(that);
				
				that.showLoader();
				that.imgUploadControl.hide();

				var img = event.dataTransfer.files[0];

				var formData = new FormData();
				formData.append('img', img);

				$.ajax({
                    url: that.options.uploadUrl,
                    data: formData,
                    context: document.body,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: 'POST'
				}).always(function(data){
				
					response = jQuery.parseJSON(data);
					if(response.status=='success'){
					
						that.imgInitW = that.imgW = response.width;
						that.imgInitH = that.imgH = response.height;
						
						if ( that.imgW > 999 && that.imgH > 399 && that.imgW < 3841 && that.imgH < 2161) {
						
							$('.step2 > div p.mistake').remove();
					
							that.reset();
							
							multiply = 1;
							
							var ratio = that.imgInitW / that.imgInitH;
							
							if ( that.imgInitW < that.objW ) {
								that.imgInitW = that.objW;
								that.imgInitH = that.imgInitW*ratio;
								
								if ( that.imgInitH < that.objH) {
									that.imgInitH = that.objH;
									that.imgInitW = that.objH/ratio;
								}
								
								multiply = response.width / that.imgInitW;
							}
							
							if(that.options.modal){	that.createModal(); }
							if( !$.isEmptyObject(that.croppedImg)){ that.croppedImg.remove(); }
							
							that.imgUrl=response.url;
							
							that.obj.append('<img src="'+response.url+'">');
							that.initCropper();
							
							that.hideLoader();

							if (that.options.onAfterImgUpload) that.options.onAfterImgUpload.call(that);
						}	
						
						else {
						
							if ( that.imgW < 1000 || that.imgH < 400 ) {
								$('.step2 > div p.mistake').remove();
								$('.step2 > div').append('<p class="mistake">Недостаточный размер файла, необходимо загрузить картинку размером не менее 1000x400 px.</p>');
								that.hideLoader();
							
							}
						
							if ( that.imgW > 3840 || that.imgH > 2160 ) {
								$('.step2 > div p.mistake').remove();
								$('.step2 > div').append('<p class="mistake">Слишком большое изображение, необходимо загрузить картинку размером не более 3841x2161 px.</p>');
								that.hideLoader();
							
							}
							
						}
							
						
					}
					
					if(response.status=='error'){
						$('.step2 > div p.mistake').remove();
						$('.step2 > div').append('<p class="mistake">Данный формат файла не поддерживается. Загрузите любое изображение в формате JPG, GIF или PNG.</p>');
						that.hideLoader();
					}

				});
				
			};
	
		},
		createModal: function(){
			var that = this;
		
			var marginTop = that.windowH/2-that.objH/2;
			var modalHTML =  '<div id="croppicModal">'+'<div id="croppicModalObj" style="width:'+ that.objW +'px; height:'+ that.objH +'px; margin:0 auto; margin-top:'+ marginTop +'px; position: relative;"> </div>'+'</div>';

			$('body').append(modalHTML);
			
			that.modal = $('#croppicModal');
			
			that.obj = $('#croppicModalObj');
			
		},
		destroyModal: function(){
			var that = this;
			
			that.obj = that.outputDiv;
			that.modal.remove();
		},
		initCropper: function(){
			var that = this;
			
			/*SET UP SOME VARS*/
			that.img = that.obj.find('img');
			that.img.wrap('<div class="cropImgWrapper" style="overflow:hidden; z-index:1; position:absolute; width:'+that.objW+'px; height:'+that.objH+'px;"></div>');
	
			/*INIT DRAGGING*/
			that.createCropControls();
			
			if(that.options.imgEyecandy){ that.createEyecandy(); }
			that.initDrag();
			that.initialScaleImg();
		},
		createEyecandy: function(){
			var that = this;

			that.imgEyecandy = that.img.clone();
			that.imgEyecandy.css({'z-index':'0','opacity':that.options.imgEyecandyOpacity}).appendTo(that.obj);
		},
		destroyEyecandy: function(){
			var that = this;
			that.imgEyecandy.remove();
		},
		initialScaleImg:function(){
			var that = this;
			that.zoom(-that.imgInitW);
			that.zoom(40);
			
			// initial center image
			
			that.img.css({'left': -(that.imgW -that.objW)/2, 'top': -(that.imgH -that.objH)/2, 'position':'relative'});
			if(that.options.imgEyecandy){ that.imgEyecandy.css({'left': -(that.imgW -that.objW)/2, 'top': -(that.imgH -that.objH)/2, 'position':'relative'}); }
			
		},
		
		createCropControls: function(){
			var that = this;
			
			// CREATE CONTROLS
			var cropControlZoomMuchIn =      '<i class="cropControlZoomMuchIn"></i>';
			var cropControlZoomIn =          '<i class="cropControlZoomIn"></i>';
			var cropControlZoomOut =         '<i class="cropControlZoomOut"></i>';
			var cropControlZoomMuchOut =     '<i class="cropControlZoomMuchOut"></i>';
			var cropControlCrop =            '<i class="cropControlCrop"></i>';
			var cropControlReset =           '<i class="cropControlReset"></i>';
			var cropControlClockwise =       '<i class="cropControlClockwise"></i>';
			var cropControlCounterclockwise =       '<i class="cropControlCounterclockwise"></i>';
			
            var html;
            
			if(that.options.doubleZoomControls){ html =  '<div class="cropControls cropControlsCrop">'+ cropControlZoomMuchIn + cropControlZoomOut + cropControlZoomIn + cropControlZoomMuchOut + cropControlCrop + cropControlReset + cropControlCounterclockwise + cropControlClockwise + '</div>'; }
			else{ html =  '<div class="cropControls cropControlsCrop">' + cropControlZoomOut + cropControlZoomIn + cropControlCrop + cropControlReset + cropControlCounterclockwise + cropControlClockwise + '</div>'; }	
			
			that.obj.append(html);
			
			that.cropControlsCrop = that.obj.find('.cropControlsCrop');

			// CACHE AND BIND CONTROLS
			if(that.options.doubleZoomControls){
				that.cropControlZoomMuchIn = that.cropControlsCrop.find('.cropControlZoomMuchIn');
				that.cropControlZoomMuchIn.on('click',function(){ that.zoom( that.options.zoomFactor*10 ); });
			
				that.cropControlZoomMuchOut = that.cropControlsCrop.find('.cropControlZoomMuchOut');
				that.cropControlZoomMuchOut.on('click',function(){ that.zoom(-that.options.zoomFactor*10); });
			}
			
			that.cropControlZoomIn = that.cropControlsCrop.find('.cropControlZoomIn');
			that.cropControlZoomIn.on('click',function(){ that.zoom(that.options.zoomFactor); });

			that.cropControlZoomOut = that.cropControlsCrop.find('.cropControlZoomOut');
			that.cropControlZoomOut.on('click',function(){ that.zoom(-that.options.zoomFactor); });		

			that.cropControlCrop = that.cropControlsCrop.find('.cropControlCrop');
			that.cropControlCrop.on('click',function(){ that.crop(); });

			that.cropControlReset = that.cropControlsCrop.find('.cropControlReset');
			that.cropControlReset.on('click',function(){ that.reset(); });	

			that.cropControlClockwise = that.cropControlsCrop.find('.cropControlCounterclockwise');
			that.cropControlClockwise.on('click',function(){ that.rotate(-1); });		

			that.cropControlClockwise = that.cropControlsCrop.find('.cropControlClockwise');
			that.cropControlClockwise.on('click',function(){ that.rotate(1); });				
			
		},
		initDrag:function(){
			var that = this;
			
			that.img.on("mousedown", function(e) {
				
				e.preventDefault(); // disable selection

				var z_idx = that.img.css('z-index'),
                drg_h = that.img.outerHeight(),
                drg_w = that.img.outerWidth(),
                pos_y = that.img.offset().top + drg_h - e.pageY,
                pos_x = that.img.offset().left + drg_w - e.pageX;
				
				that.img.css('z-index', 1000).on("mousemove", function(e) {
					
					var imgTop = e.pageY + pos_y - drg_h;
					var imgLeft = e.pageX + pos_x - drg_w;
					
					that.img.offset({
						top:imgTop,
						left:imgLeft
					}).on("mouseup", function() {
						$(this).removeClass('draggable').css('z-index', z_idx);
					});
					
					if(that.options.imgEyecandy){ that.imgEyecandy.offset({ top:imgTop, left:imgLeft }); }
					
					if( parseInt( that.img.css('top')) > 0 ){ that.img.css('top',0);  if(that.options.imgEyecandy){ that.imgEyecandy.css('top', 0); } }
					var maxTop = -( that.imgH-that.objH); if( parseInt( that.img.css('top')) < maxTop){ that.img.css('top', maxTop); if(that.options.imgEyecandy){ that.imgEyecandy.css('top', maxTop); } }
					
					if( parseInt( that.img.css('left')) > 0 ){ that.img.css('left',0); if(that.options.imgEyecandy){ that.imgEyecandy.css('left', 0); }}
					var maxLeft = -( that.imgW-that.objW); if( parseInt( that.img.css('left')) < maxLeft){ that.img.css('left', maxLeft); if(that.options.imgEyecandy){ that.imgEyecandy.css('left', maxLeft); } }
					
					if (that.options.onImgDrag) that.options.onImgDrag.call(that);
					
				});
	
			}).on("mouseup", function() {
				that.img.off("mousemove");
			}).on("mouseout", function() {
				that.img.off("mousemove");
			});
			
		},
		zoom :function(x){
			var that = this;
			var ratio = that.imgW / that.imgH;
			var newWidth = that.imgW+x;
			var newHeight = newWidth/ratio;
			var doPositioning = true;
			
			var left;
			var top;
			
			if( newWidth < that.objW || newHeight < that.objH){

				if( newWidth - that.objW < newHeight - that.objH ){ 
					newWidth = that.objW;
					newHeight = newWidth/ratio;
				}else{
					newHeight = that.objH;
					newWidth = ratio * newHeight;
				}
			
				doPositioning = false;

			} 
			
			if( newWidth > that.imgInitW || newHeight > that.imgInitH){
				
				if( newWidth - that.imgInitW < newHeight - that.imgInitH ){ 
					newWidth = newWidth-x;
					newHeight = newWidth/ratio;
				}else{
					newHeight = that.imgInitH;
					newWidth = ratio * newHeight;
				}
				
				doPositioning = false;
				
			}
			
			//console.log(that.objW+', '+newWidth);
			//console.log(that.objH+', '+newHeight);

			
			that.imgW = newWidth;
			that.img.width(newWidth); 
				
			that.imgH = newHeight;
			that.img.height(newHeight); 
			
	
			var newTop = parseInt( that.img.css('top') ) - x/2;
			var newLeft = parseInt( that.img.css('left') ) - x/2;

			
			if( newTop>0 ){ newTop=0;}
			if( newLeft>0 ){ newLeft=0;}
			
			var maxTop = -( newHeight-that.objH); if( newTop < maxTop){	newTop = maxTop;	}
			var maxLeft = -( newWidth-that.objW); if( newLeft < maxLeft){	newLeft = maxLeft;	}
			
			if( doPositioning ){
				that.img.css({'top':newTop, 'left':newLeft}); 
			}
			
			if(that.options.imgEyecandy){

				if ( angle == 90 || angle == 270 || angle == -90 || angle == -270 ) {
					left = (that.imgH-that.imgW)/2;
					top = (that.imgH-that.imgW)/2;
				}
				else {
					left = 0;
					top = 0;
				}
			
				if ( angle == 90 || angle == 270 || angle == -90 || angle == -270 ) {
					that.imgEyecandy.width(newHeight);
					that.imgEyecandy.height(newWidth);
					that.imgEyecandy.css({'margin-left': -left+'px', 'margin-top': top+'px'});
				}
				else {
					that.imgEyecandy.width(newWidth);
					that.imgEyecandy.height(newHeight);
					that.imgEyecandy.css({'margin-left': -left+'px', 'margin-top': top+'px'});
				}
			
			
				if( doPositioning ){
					that.imgEyecandy.css({'top':newTop, 'left':newLeft}); 
				}
			}

			
			if (that.options.onImgZoom) that.options.onImgZoom.call(that);

		},
		rotate:function(x){
			var that = this;

			angle = eval(angle)+(90*x);
			
			if ( angle == 360 || angle == -360 ) {
				angle = 0;
			}
			
			var ratio = that.imgW / that.imgH;
			var newWidth;
			var newHeight;
			var left;
			var top;
			
			newWidth = that.imgH;
			newHeight = that.imgW;
			
			newRatio = 1;
			
			
			if( newWidth < that.objW || newHeight < that.objH){

				if( newWidth - that.objW < newHeight - that.objH ){ 
					newWidth = that.objW;
					newHeight = newWidth * ratio;
				}else{
					newHeight = that.objH;
					newWidth = newHeight / ratio;
				}
			
				doPositioning = false;

			} 
			

			
			
			/*if ( newWidth < that.objW ) {
				newWidth = that.objW;
				newHeight = newWidth*(that.imgH/that.imgW)
			}
			
			if ( newHeight < that.objH ) {
				newHeight= that.objH;
				newWidth = newHeight/(that.imgH/that.imgW);
				top = 0;
				left = 0;
			}*/
				
			that.imgW = newWidth;
			that.img.width(newWidth); 
			
			that.imgH = newHeight;
			that.img.height(newHeight); 
			
			if ( angle == 90 || angle == 270 || angle == -90 || angle == -270 ) {
				left = (that.imgH-that.imgW)/2;
				top = (that.imgH-that.imgW)/2;
			}
			else {
				left = 0;
				top = 0;
			}
			
			var doPositioning = true;
			
			//console.log(newHeight+', '+newWidth);

			that.img.css({
				'left': - ( newWidth - $('#crop').width() )/ 2 +'px',
				'top': - ( newHeight - $('#crop').height() )/ 2 +'px',
			});
			
			if ( angle == 90 || angle == 270 || angle == -90 || angle == -270 ) {
				$('#crop > img').css({
					'transform': 'rotate('+eval(angle)+'deg)',
					'width': newHeight+'px',
					'height': newWidth+'px',
					'left': - ( newWidth - $('#crop').width() )/ 2 +'px',
					'top': - ( newHeight - $('#crop').height() )/ 2 +'px',
					'margin-left': -left+'px',
					'margin-top': top+'px'
				});
			}
			else {
				$('#crop > img').css({
					'transform': 'rotate('+eval(angle)+'deg)',
					'width': newWidth+'px',
					'height': newHeight+'px',
					'left': - ( newWidth - $('#crop').width() )/ 2 +'px',
					'top': - ( newHeight - $('#crop').height() )/ 2 +'px',
					'margin-left': -left+'px',
					'margin-top': top+'px'
				});
			}

			
			/*var that = this;
			var ratio = that.imgW / that.imgH;
			var newWidth = that.imgW+x;
			var newHeight = newWidth/ratio;
			var doPositioning = true;
			
			if( newWidth < that.objW || newHeight < that.objH){
				
				if( newWidth - that.objW < newHeight - that.objH ){ 
					newWidth = that.objW;
					newHeight = newWidth/ratio;
				}else{
					newHeight = that.objH;
					newWidth = ratio * newHeight;
				}
				
				doPositioning = false;
				
			} 
			
			if( newWidth > that.imgInitW || newHeight > that.imgInitH){
				
				if( newWidth - that.imgInitW < newHeight - that.imgInitH ){ 
					newWidth = that.imgInitW;
					newHeight = newWidth/ratio;
				}else{
					newHeight = that.imgInitH;
					newWidth = ratio * newHeight;
				}
				
				doPositioning = false;
				
			}
			
			that.imgW = newWidth;
			that.img.width(newWidth); 
			
			that.imgH = newHeight;
			that.img.height(newHeight); 
	
			var newTop = parseInt( that.img.css('top') ) - x/2;
			var newLeft = parseInt( that.img.css('left') ) - x/2;
			
			if( newTop>0 ){ newTop=0;}
			if( newLeft>0 ){ newLeft=0;}
			
			var maxTop = -( newHeight-that.objH); if( newTop < maxTop){	newTop = maxTop;	}
			var maxLeft = -( newWidth-that.objW); if( newLeft < maxLeft){	newLeft = maxLeft;	}
			
			if( doPositioning ){
				that.img.css({'top':newTop, 'left':newLeft}); 
			}
			
			if(that.options.imgEyecandy){
				that.imgEyecandy.width(newWidth);
				that.imgEyecandy.height(newHeight);
				if( doPositioning ){
					that.imgEyecandy.css({'top':newTop, 'left':newLeft}); 
				}
			}	
			
			if (that.options.onImgZoom) that.options.onImgZoom.call(that);*/

		},
		crop:function(){
			var that = this;
			
			if (that.options.onBeforeImgCrop) that.options.onBeforeImgCrop.call(that);
			
			that.cropControlsCrop.hide();
			that.showLoader();
			
			origratio = that.imgInitW/that.imgW;
			
			if ( angle == 0 ) {
				var cropData = {
					imgUrl:that.imgUrl,
					imgInitW:that.imgInitW,
					imgInitH:that.imgInitH,
					imgW:that.imgW/multiply*origratio,
					imgH:that.imgH/multiply*origratio,
					imgY1:Math.abs( parseInt( that.img.css('top') ) )*origratio,
					imgX1:Math.abs( parseInt( that.img.css('left') ) )*origratio,
					cropH:that.objH*origratio,
					cropW:that.objW*origratio,
					angle:-angle
				}
			}
			if ( angle == 180 || angle == -180 ) {
				var cropData = {
					imgUrl:that.imgUrl,
					imgInitW:that.imgInitW,
					imgInitH:that.imgInitH,
					imgW:that.imgW/multiply*origratio,
					imgH:that.imgH/multiply*origratio,
					imgY1:Math.abs( (that.imgH - that.objH) + parseInt( that.img.css('top') ) )*origratio,
					imgX1:Math.abs( (that.imgW - that.objW) + parseInt( that.img.css('left') ) )*origratio,
					cropH:that.objH*origratio,
					cropW:that.objW*origratio,
					angle:-angle
				}
			}
			if ( angle == 90 || angle == -270 ) {
				var cropData = {
					imgUrl:that.imgUrl,
					imgInitW:that.imgInitW,
					imgInitH:that.imgInitH,
					imgW:that.imgH/multiply*origratio,
					imgH:that.imgW/multiply*origratio,
					imgX1:Math.abs( parseInt( that.img.css('top') ) * parseInt(that.imgH / that.imgW) )*origratio,
					imgY1:Math.abs( parseInt( that.img.css('left') ) + parseInt(that.imgW - that.objW) )*origratio,
					cropH:that.objW*origratio,
					cropW:that.objH*origratio,
					angle:-angle
				}
			}
			
			
			if ( angle == -90 || angle == 270 ) {
				var cropData = {
					imgUrl:that.imgUrl,
					imgInitW:that.imgInitW,
					imgInitH:that.imgInitH,
					imgW:that.imgH/multiply*origratio,
					imgH:that.imgW/multiply*origratio,
					imgX1:Math.abs( parseInt( that.img.css('top') ) + parseInt(that.imgH - that.objH) )*origratio,
					imgY1:Math.abs( parseInt( that.img.css('left') ) * parseInt(that.imgH / that.imgW) )*origratio,
					cropH:that.objW*origratio,
					cropW:that.objH*origratio,
					angle:-angle
				}
			}
			
			preview = that.objW;
						
			var formData = new FormData();

			for (var key in cropData) {
				if( cropData.hasOwnProperty(key) ) {
						formData.append( key , cropData[key] );
				}
			}
			
			for (var key in that.options.cropData) {
				if( that.options.cropData.hasOwnProperty(key) ) {
						formData.append( key , that.options.cropData[key] );
				}
			}

			$.ajax({
                url: that.options.cropUrl,
                data: formData,
                context: document.body,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST'
				}).always(function(data){
					response = jQuery.parseJSON(data);
					if(response.status=='success'){
						
						that.imgEyecandy.hide();
						
						that.destroy();
						
						that.obj.append('<img class="croppedImg" src="'+response.url+'" style="width: '+preview+'px">');
						if(that.options.outputUrlId !== ''){	$('#'+that.options.outputUrlId).val(response.url);	}
						
						that.croppedImg = that.obj.find('.croppedImg');
						
						cropImageUrl = that.obj.find('.croppedImg').attr('src'); 

						that.init();
						
						that.hideLoader();

					}
					if(response.status=='error'){
						that.obj.append('<p style="width:100%; height:100%;>'+response.message+'</p>">');
					}
					
					if (that.options.onAfterImgCrop) that.options.onAfterImgCrop.call(that);
				 
				});
		},
		showLoader:function(){
			var that = this;
			
			that.obj.append(that.options.loaderHtml);
			that.loader = that.obj.find('.loader');
			
		},
		hideLoader:function(){
			var that = this;
			that.loader.remove();	
		},
		reset:function(){
			var that = this;
			that.destroy();
			angle = 0;
			that.init();
			
			if( !$.isEmptyObject(that.croppedImg)){ 
				that.obj.append(that.croppedImg); 
				if(that.options.outputUrlId !== ''){	$('#'+that.options.outputUrlId).val(that.croppedImg.attr('url'));	}
			}
			
		},
		destroy:function(){
			var that = this;
			if(that.options.modal && !$.isEmptyObject(that.modal) ){ that.destroyModal(); }
			if(that.options.imgEyecandy && !$.isEmptyObject(that.imgEyecandy) ){  that.destroyEyecandy(); }
			if( !$.isEmptyObject( that.cropControlsUpload ) ){  that.cropControlsUpload.remove(); }
			if( !$.isEmptyObject( that.cropControlsCrop ) ){   that.cropControlsCrop.remove(); }
			if( !$.isEmptyObject( that.loader ) ){   that.loader.remove(); }
			if( !$.isEmptyObject( that.form ) ){   that.form.remove(); }
			that.obj.html('');
		}
	};
})(window, document);
