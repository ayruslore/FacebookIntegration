jQuery(document).ready(function($) {
    //Ajax: Get more directory
    var page = 1;
    var terms = [];
    var direct_load_item = function( drop_type, category, container, location ){
        $(".direct-ajax-term").each(function(){
            if( $(this).attr('checked') === true ){
                $(this).attr('checked',false);
            }
            if( $(this).is(':checked') ){
                terms.push($(this).val());
            }
        });
        if( category === null ){
            category = $('.direct-ajax-category').val();
        }
        if( location === null ){
            location = $('.direct-ajax-location').val();
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: direct_ajax_object.ajax_url,
            data: {
                'action': 'direct_ajax_directory', //calls wp_ajax_nopriv_direct_ajax_directory
                'page_number': page,
                'keyword': $('.direct-ajax-keyword').val(),
                'location': location,
                'category': category,
                'terms': terms,
            },
            beforeSend: function(){
                $( '.directory-area .row' ).css( 'opacity', '0.3' );
                NProgress.start();
            },
            success: function(data){
                if ( data ){
                    //Append data
                    var el = $(data.html);
                    if( container === null ){
                        container = $('.directory-masonry');
                    }
                    if( drop_type == 'replace'){
                        container.html(el).imagesLoaded(function() {
                            container.masonry('reloadItems');
                            container.masonry('layout');
                        });
                    }else{
                        container.append(el).imagesLoaded(function(){
                            container.masonry( 'appended', el, true );
                            container.masonry('reloadItems');
                            container.masonry('layout');
                        });
                    }
                    //Handle button
                    $( '.direct-total-directory' ).html( data.total );
                    if( data.loadmore === false){
                        $( '.loadmore' ).addClass( 'hidden' );
                        page = 1;
                    }else{
                        $( '.loadmore' ).removeClass( 'hidden');
                    }
                }
                //Display
                NProgress.done();
                $( '.directory-area .row' ).css( 'opacity', '1' );
                terms = [];
                setTimeout(function(){
                	if ($('.pro-direct-map').length > 0) {
                		init();
                	};
                }, 100);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $( '.directory-area .row' ).css( 'opacity', '1' );
                NProgress.done();
                terms = [];
            }
        });
    };
    $('.direct-handle-filter').on( 'click' ,function (e) {
        markers.length=0;
        direct_load_item( 'replace',null,null,null );
        page = 1;
        e.preventDefault();
    });
    $('.direct-handle-more-item').on( 'click' ,function (e) {
        page++;
        direct_load_item( null, null, null,null);
        e.preventDefault();
    });
    $('.share-my-location').on( 'click' ,function (e) {
    	$(this).find('i').removeClass('fa fa-crosshairs').addClass('fa fa-spinner');
	    direct_share_location();
      e.preventDefault();
    });
    direct_share_location();

    function direct_share_location(){

    		// Try HTML5 geolocation
		  if(navigator.geolocation) {
		    navigator.geolocation.getCurrentPosition(function(position) {
		      var latlng = new google.maps.LatLng(position.coords.latitude,
		                                       position.coords.longitude);
		      var geocoder = new google.maps.Geocoder();
		      geocoder.geocode({'latLng': latlng}, function(results, status)
				  {
				        if (status == google.maps.GeocoderStatus.OK)
				        {
				            var address = results[0].formatted_address;
				            if ($('#home-filter-location,.direct-ajax-location,#_direct_business_location').val() ===''){
				            	$('#home-filter-location,.direct-ajax-location,#_direct_business_location').val(address);
				            }
				            $('.share-my-location').find('i').removeClass('fa fa-spinner').addClass('fa fa-crosshairs');
				  }
				});
		    }, function() {
		      // Not has permission
		    });
		  } else {
		    // Browser doesn't support Geolocation

		  }
    }
    // Ajax: Recent Directory In Category
    $('.directory-filter li a').on( 'click' ,function (e) {
        var category_id = $(this).attr('data-category');
        var content_tabbed= $(this).attr('href');
        var drop_container= $(content_tabbed+' .directory-masonry');
        markers.length=0;
        page = 1;
        direct_load_item( 'replace',category_id,drop_container,null );
        page = 1;
        e.preventDefault();
    });
    $('.direct-handle-more-category').on( 'click' ,function (e) {
        var category_id = $(this).attr('data-category');
        var content_tabbed= $(this).attr('href');
        var drop_container= $(content_tabbed+' .directory-masonry');
        page++;
        direct_load_item( null, category_id, drop_container,null);
        e.preventDefault();
    });
    // Ajax: Login
    $('#direct-login').on('submit', function(e){
        if( $('#direct-login #direct_remember_me').is(':checked') ){
            direct_remember_me = true;
        }else{
            direct_remember_me = false;
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: direct_ajax_object.ajax_url,
            data: {
                'action': 'direct_ajax_login', //calls wp_ajax_nopriv_direct_ajax_login
                'username': $('#direct-login #direct_username').val(),
                'password': $('#direct-login #direct_password').val(),
                'remember': direct_remember_me,
                'security': $('#direct-login #direct_security').val()
            },
            beforeSend: function(){
                if( $('.alert').length > 0 )
                    $('.alert').hide();
                $( '#direct-login' ).css( 'opacity', '0.3' );
                NProgress.start();
            },
            success: function(data){
                $( '#direct-login' ).css( 'opacity', '1' );
                if (data.logged_in === true){
                    $('form#direct-login').prepend('<div class="alert alert-success" role="alert">'+data.message+'</div>');
                    document.location.href = direct_ajax_object.redirect_url;
                }else{
                    $('form#direct-login').prepend('<div class="alert alert-danger" role="alert">'+data.message+'</div>');
                }
                NProgress.done();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $( '#direct-login' ).css( 'opacity', '1' );
                NProgress.done();
            }
        });
        e.preventDefault();
    });
	// Ajax: Claim
    $('#direct-claim').on('submit', function(e){
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: direct_ajax_object.ajax_url,
            data: {
                'action': 'direct_ajax_claim',
                'directory_id': $('#direct_claim_directory_id').val(),
                'business_name': $('#direct_claim_business_name').val(),
                'yourname': $('#direct_claim_yourname').val(),
                'phonenumber': $('#direct_claim_phonenumber').val(),
                'email': $('#direct_claim_email').val(),
                'security': $('#direct_claim_security').val()
            },
            beforeSend: function(){
                if( $('.alert').length > 0 )
                    $('.alert').hide();
                $( '#direct-claim' ).css( 'opacity', '0.3' );
                NProgress.start();
            },
            success: function(data){
                $( '#direct-claim' ).css( 'opacity', '1' );
                if (data.claim === true){
                    $('form#direct-claim').prepend('<div class="alert alert-success" role="alert">'+data.message+'</div>');
                    $('#direct-claim-listing').modal('toggle');
                }else{
                    $('form#direct-claim').prepend('<div class="alert alert-danger" role="alert">'+data.message+'</div>');
                }
                NProgress.done();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $( '#direct-claim' ).css( 'opacity', '1' );
                NProgress.done();
            }
        });
        e.preventDefault();
    });
});
