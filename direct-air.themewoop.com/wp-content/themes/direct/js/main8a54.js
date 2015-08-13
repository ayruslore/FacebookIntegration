/**
 * Get localize varaiable
 */
var siteurl = localize.siteurl;
var tempdir = localize.tempdir;
/**
 * Before window loaded
 */
jQuery( window ).load(function() {
	"use strict";
    jQuery("#loader").delay('200').fadeOut();
    jQuery("#mask").delay('500').fadeOut("slow");
});
/**
 * When document ready
 */
( function( $ ) {
  	"use strict";
    //Flyout menu
    $(".dropdown-menu > li.trigger > a").on("click",function(e){
        var current=$(this).next();
        var grandparent=$(this).parent().parent();
        if($(this).parent().hasClass('left-caret') || $(this).parent().hasClass('right-caret'))
            $(this).parent().toggleClass('right-caret left-caret');
        grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
        grandparent.find(".dropdown-menu:visible").not(current).hide();
        current.show();
        e.stopPropagation();
    });
    $(".dropdown-menu > li:not(.trigger) > a").on("click",function(){
        var root=$(this).closest('.dropdown');
        root.find('.left-caret').toggleClass('right-caret left-caret');
        root.find('.dropdown-menu:visible').hide();
    });
    //Search handle
    $( '.search-handle a' ).on( 'click', function (e) {
        $( this ).css({
            zIndex: "1000",
            marginRight: "20px"
        }).addClass('ready-submit-search');
        $( '#search-form' ).fadeIn();
        e.preventDefault();
    });
    $( document ).mouseup(function (e)
    {
        var container = $("#search-form");
        if ( !container.is( e.target ) && container.has( e.target ).length === 0 )
        {
            $( '#search-form' ).hide();
            $( '.search-handle a' ).css({
                zIndex: "0",
                marginRight: "0px"
            }).removeClass('ready-submit-search');
        }else{
            $('.ready-submit-search').on('click', function () {
                var query = $('.search-keyword').val();
                var base_search_url = $('.search-form').attr('action') + '?s=';
                window.location.href = base_search_url+query;
            });
        }
    });
    $('.search-form').on('submit',function (e) {
    	var query = $('.search-keyword').val();
        var base_search_url = $('.search-form').attr('action') + '?s=';
        window.location.href = base_search_url+query;
        e.preventDefault();
    });
    //Select
    $('.select-category,.cmb2_select').fancySelect();
    //Brand
    if($(".brands-loop").length){
        $('.brands-loop').owlCarousel({
		    loop:true,
		    margin:10,
		    responsiveClass:true,
		    responsive:{
		        0:{
		            items:1,
		            nav:true
		        },
		        600:{
		            items:3,
		            nav:false
		        },
		        1000:{
		            items:4,
		            nav:true,
		            loop:false
		        }
		    }
		});
    }
    //Wow
    new WOW().init();
    //Scroll
    $('.direct-services').perfectScrollbar();
    //Bounce direct item
    $('.container').on('mouseenter', '.direct-item', function() {
        $(this).find('.direct-category').addClass('animated bounce');
    }).on('mouseleave', '.direct-item', function() {
        $(this).find('.direct-category').removeClass('animated bounce');
    });
    //Masonry
    var $container = $('.masonry-container,.directory-masonry');
    $container.imagesLoaded( function () {
      $container.masonry({
        columnWidth: '.item',
        itemSelector: '.item'
      });
    });
    //Masonry on tab
    $('a[data-toggle=tab]').each(function () {
      var $this = $(this);
      $this.on('shown.bs.tab', function () {
        $container.imagesLoaded( function () {
          $container.masonry({
            columnWidth: '.item',
            itemSelector: '.item'
          });
        });
      });
    });
    //Change display
    $('.display-handle a').on('click',function (e) {
        $('.display-handle a').removeClass('active');
        $(this).addClass('active');
        var display=$(this).attr('data-display');
        var hidden=$(this).attr('data-display-hidden');
        $('.directory-area').find('.col-md-'+hidden).removeClass('col-md-'+hidden).addClass('col-md-'+display);
        $container.imagesLoaded( function () {
          $container.masonry({
            columnWidth: '.item',
            itemSelector: '.item'
          });
        });
        e.preventDefault();
    });
    //Switch Bootstrap
    $.fn.bootstrapSwitch.defaults.size = 'small';
    $.fn.bootstrapSwitch.defaults.onColor = 'success';
    $("[name='_direct_category[]'],[name='_direct_amenities[]']").bootstrapSwitch();
    //Toggle
    var toggle_check=false;
    $('.cmb-type-taxonomy-multicheck').on('click', '.button',function (e) {
        if(toggle_check === false){
            $(this).parent().next().find("input").bootstrapSwitch('state', true, true);
            toggle_check=true;
        }else{
            $(this).parent().next().find("input").bootstrapSwitch('state', false, true);
            toggle_check=false;
        }
        e.preventDefault();
    });
    //Home filter
    $('.home-search-button').on( 'click', function (e) {
        var keyword= $('#home-filter-keyword').val();
        var location= $('#home-filter-location').val();
        var category= encodeURIComponent($('#home-filter-category').val());
        window.location.href = siteurl+'/directory-category/'+category+'/?direct_keyword='+keyword+'&direct_location='+location;
        e.preventDefault();
    });
    //Flex Slider
    if ($('.banner-slider').length > 0) {
	    $('.banner-slider').flexslider({
			animation: "fade",
			start: function(slider){
			  $('body').removeClass('loading');
			}
		});
	};
	//Lightbox
	// ACTIVITY INDICATOR

	var activityIndicatorOn = function()
		{
			$( '<div id="imagelightbox-loading"><div></div></div>' ).appendTo( 'body' );
		},
		activityIndicatorOff = function()
		{
			$( '#imagelightbox-loading' ).remove();
		},


		// OVERLAY

		overlayOn = function()
		{
			$( '<div id="imagelightbox-overlay"></div>' ).appendTo( 'body' );
		},
		overlayOff = function()
		{
			$( '#imagelightbox-overlay' ).remove();
		},


		// CLOSE BUTTON

		closeButtonOn = function( instance )
		{
			$( '<button type="button" id="imagelightbox-close" title="Close"></button>' ).appendTo( 'body' ).on( 'click touchend', function(){ $( this ).remove(); instance.quitImageLightbox(); return false; });
		},
		closeButtonOff = function()
		{
			$( '#imagelightbox-close' ).remove();
		},


		// CAPTION

		captionOn = function()
		{
			var description = $( 'a[href="' + $( '#imagelightbox' ).attr( 'src' ) + '"] img' ).attr( 'alt' );
			if( description.length > 0 )
				$( '<div id="imagelightbox-caption">' + description + '</div>' ).appendTo( 'body' );
		},
		captionOff = function()
		{
			$( '#imagelightbox-caption' ).remove();
		},


		// NAVIGATION

		navigationOn = function( instance, selector )
		{
			var images = $( selector );
			if( images.length )
			{
				var nav = $( '<div id="imagelightbox-nav"></div>' );
				for( var i = 0; i < images.length; i++ )
					nav.append( '<button type="button"></button>' );

				nav.appendTo( 'body' );
				nav.on( 'click touchend', function(){ return false; });

				var navItems = nav.find( 'button' );
				navItems.on( 'click touchend', function()
				{
					var $this = $( this );
					if( images.eq( $this.index() ).attr( 'href' ) != $( '#imagelightbox' ).attr( 'src' ) )
						instance.switchImageLightbox( $this.index() );

					navItems.removeClass( 'active' );
					navItems.eq( $this.index() ).addClass( 'active' );

					return false;
				})
				.on( 'touchend', function(){ return false; });
			}
		},
		navigationUpdate = function( selector )
		{
			var items = $( '#imagelightbox-nav button' );
			items.removeClass( 'active' );
			items.eq( $( selector ).filter( '[href="' + $( '#imagelightbox' ).attr( 'src' ) + '"]' ).index( selector ) ).addClass( 'active' );
		},
		navigationOff = function()
		{
			$( '#imagelightbox-nav' ).remove();
		},


		// ARROWS

		arrowsOn = function( instance, selector )
		{
			var $arrows = $( '<button type="button" class="imagelightbox-arrow imagelightbox-arrow-left"></button><button type="button" class="imagelightbox-arrow imagelightbox-arrow-right"></button>' );

			$arrows.appendTo( 'body' );

			$arrows.on( 'click touchend', function( e )
			{
				e.preventDefault();

				var $this	= $( this ),
					$target	= $( selector + '[href="' + $( '#imagelightbox' ).attr( 'src' ) + '"]' ),
					index	= $target.index( selector );

				if( $this.hasClass( 'imagelightbox-arrow-left' ) )
				{
					index = index - 1;
					if( !$( selector ).eq( index ).length )
						index = $( selector ).length;
				}
				else
				{
					index = index + 1;
					if( !$( selector ).eq( index ).length )
						index = 0;
				}

				instance.switchImageLightbox( index );
				return false;
			});
		},
		arrowsOff = function()
		{
			$( '.imagelightbox-arrow' ).remove();
		};


	var selectorF = 'a[data-imagelightbox="f"]';
	var instanceF = $( selectorF ).imageLightbox(
	{
		onStart:		function() { overlayOn(); closeButtonOn( instanceF ); arrowsOn( instanceF, selectorF ); },
		onEnd:			function() { overlayOff(); captionOff(); closeButtonOff(); arrowsOff(); activityIndicatorOff(); },
		onLoadStart: 	function() { captionOff(); activityIndicatorOn(); },
		onLoadEnd:	 	function() { captionOn(); activityIndicatorOff(); $( '.imagelightbox-arrow' ).css( 'display', 'block' ); }
	});
	//Toolstip
	$('.direct-verified').hover(function () {
		var title=$(this).attr('title');
		$(this).append('<span class="toolstip">'+title+'</span>');
	}, function(){
		$(this).html('');
	});
})(jQuery);
