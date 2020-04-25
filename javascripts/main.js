function Utils() {}

Utils.prototype = {
    constructor: Utils,
    isElementInView: function (element, fullyInView) {
        var pageTop = $(window).scrollTop();
        var pageBottom = pageTop + $(window).height();
        var elementTop = $(element).offset().top;
        var elementBottom = elementTop + $(element).height();

        if (fullyInView === true) {
            return ((pageTop < elementTop) && (pageBottom > elementBottom));
        } else {
            return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
        }
    }
};

var Utils = new Utils();

function trySetIframeSrc(elem) {
  var isElementInView = Utils.isElementInView(elem, false);
  if (isElementInView) {
      var src = elem.data('src');
      if (typeof src !== 'undefined') {
        elem.attr('src', src);
        elem.removeData('src');
      }
  }
}

function detectIframeInView() {
  $('.post-content > iframe').each(function(index) { trySetIframeSrc($(this)) });
}

function addToTop() {
  if ($('#toTop').length > 0) {
    $('#toTop').remove();
  }
  if ($('#disqus_thread').length == 0) {
    $('.page-content').after("<div id='toTop'><a href='#' title='Scroll to top'>▲</a></div>");
  } else {
    $('#disqus_thread').before("<div id='toTop'><a href='#' title='Scroll to top'>▲</a></div>");
  }
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function loadCategory(category) {
  $('#category-picker li').removeClass('active');
  $('#category-picker #'+category).toggleClass('active');
  $('.post-list li').removeClass('hide');
  $('.post-list li').css('pointer-events', '');
  if (category != 'all') {
    $('.post-list li').not($('.'+category)).css('pointer-events', 'none');
    $('.post-list li').not($('.'+category)).toggleClass('hide');
  }
}

function scrollToAnchor(aid){
    var aTag = $(aid.replace(/:/, '\\:'));
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

function goBackTOC() {
  if ($('#markdown-toc').length) {
    $('.post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6').css("cursor", "pointer");
  }
}

$(document).ready(function() {
  detectIframeInView();
  addToTop();
  goBackTOC();
  loadCategory(getUrlParameter('category') || 'all');

  $('body').on('click', '.footnote, .reversefootnote', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    scrollToAnchor($(this).attr("href"));
  });

  var ts_switch = document.querySelector('#ts-switch');
  var ts_label = document.querySelector('#side-label');
  var init = new Switchery(ts_switch);

  var scrollTimer = null;
  $(window).on('scroll', function() {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(detectIframeInView, 500);
  })

  $('body').on('click', '#toTop', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    $("html, body").stop().animate({scrollTop:0}, '500', 'swing');
  });

  $('body').on('click', '#markdown-toc a', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    var newLoadedHtml = $(this).attr("href");
    history.pushState(null, newLoadedHtml, newLoadedHtml);
    $("html, body").stop().animate({scrollTop: $(newLoadedHtml).offset().top - 20}, '500', 'swing');
  });

  $('body').on('click', ".post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6", function(event) {
    var toc = $('#markdown-toc');
    if (toc.length) {
      $("html, body").stop().animate({scrollTop: $(toc).offset().top - 20}, '500', 'swing');
    }
  });

  $('body').on('click', '.post-link, .site-title, .page-link, a[href^="/"]', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    var newLoadedHtml = $(this).attr("href");

    history.pushState(null, newLoadedHtml, newLoadedHtml);
    var pageContentClone = $('.page-content').clone();
    pageContentClone.addClass('page-content-clone').removeClass('page-content');
    $.ajax({url: $(this).attr("href"), success: function(response) {
      var content = $(response).filter('.page-content').find('.wrapper');
      content.find('iframe').each(function(index) {
        $(this).data('src', $(this).attr('src'));
        $(this).attr('src', '');
      });
      pageContentClone.html(content);
      viewLoaded(response, pageContentClone);
    }});
  });

  function viewLoaded(response, pageContentClone) {
    $("html, body").stop().animate({scrollTop:0}, '500', 'swing', function() {
      document.title = $(response).filter("title").text();
      const cat = getUrlParameter('category') || 'all';
      if (cat !== 'all') {
        loadCategory(getUrlParameter('category') || 'all');
        $('#category-picker').slideToggle('fast');
      } 
      pageContentClone.css('opacity', 0);
      if (ts_switch.checked) {
          TongWen.trans2Trad(document);
      } else {
          TongWen.trans2Simp(document);
      }
      $('.page-content').after(pageContentClone);
      $('.page-content').animate(
        {
          marginTop: '1.5em',
          opacity: 0
        }, 600,
        function() {
          $(this).remove();
          $('.page-content-clone').css('margin-top', '1.5em')
          .animate(
            {
              marginTop: '0em',
              opacity: 1
            }, 600, function() {
              $(this).addClass('page-content').removeClass('page-content-clone');
              addToTop();
              goBackTOC();
	      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
            });
          }
        );
      });
    }

  History.Adapter.bind(window, "popstate", function() {
    $('.page-content')
    .load(document.location.href + " .page-content > .wrapper", function(response) {
      document.title = $(response).filter("title").text();
      loadCategory(getUrlParameter('category') || 'all');
    });
  });

  $('body').on('mouseenter', '.post-list a', function() {
    $(this).next('.home-post-meta')
    .animate(
      { marginLeft: '0em',
        opacity: 1 }
      );
  });

  $('body').on('touchstart', '.post-list li', function() {
    $(this).find('.home-post-meta')
    .animate(
      { marginLeft: '0em',
        opacity: 1 }
      );
  });

  $('body').on('mouseleave', '.post-list a', function() {
    $(this).next('.home-post-meta')
    .animate(
      { marginLeft: '-1em',
        opacity: 0 }
      );
  })

  $('body').on('touchend', '.post-list li', function() {
    $(this).find('.home-post-meta')
    .animate(
      { marginLeft: '-1em',
        opacity: 0 }
      );
  });

  var enable_screenshot = getUrlParameter('ss') == '1';
  if (enable_screenshot) {
    $('#ts-div').hide();
    TongWen.trans2Simp(document);
    new QRCode(document.getElementById("qrcode"), 'https://conanblog.me');
  }

  ts_switch.onchange = function() {
      if (ts_switch.checked) {
          TongWen.trans2Trad(document);
          ts_label.innerHTML = "繁";
      } else {
          TongWen.trans2Simp(document);
          ts_label.innerHTML = "简";
      }
  };

  $('body').on('click', '#category-picker a', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    var newLoadedHtml = $(this).attr("href");
    history.pushState(null, newLoadedHtml, newLoadedHtml);
    loadCategory(getUrlParameter('category') || 'all');
  })

  $('body').on('click', '#cp-icon a', function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    $('#category-picker').slideToggle('fast');
  })
});
