function Utils(){}function trySetIframeSrc(t){var e=Utils.isElementInView(t,!1);if(e){var o=t.data("src");"undefined"!=typeof o&&(t.attr("src",o),t.removeData("src"))}}function detectIframeInView(){$(".post-content > iframe").each(function(){trySetIframeSrc($(this))})}function addToTop(){$("#toTop").length>0&&$("#toTop").remove(),0==$("#disqus_thread").length?$(".page-content").after("<div id='toTop'><a href='#' title='Scroll to top'>\u25b2</a></div>"):$("#disqus_thread").before("<div id='toTop'><a href='#' title='Scroll to top'>\u25b2</a></div>")}function loadCategory(t){$("#category-picker li").removeClass("active"),$("#category-picker #"+t).toggleClass("active"),$(".post-list li").removeClass("hide"),$(".post-list li").css("pointer-events",""),"all"!=t&&($(".post-list li").not($("."+t)).css("pointer-events","none"),$(".post-list li").not($("."+t)).toggleClass("hide"))}function scrollToAnchor(t){history.pushState(null,t,t);var e=$(t.replace(/:/,"\\:"));$("html,body").animate({scrollTop:e.offset().top-100},"slow"),e.animate({"background-color":"#ffc"}).delay(2e3).animate({"background-color":"transparent"})}function goBackTOC(){$("#markdown-toc").length&&$(".post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6").css("cursor","pointer")}Utils.prototype={constructor:Utils,isElementInView:function(t,e){var o=$(window).scrollTop(),n=o+$(window).height(),a=$(t).offset().top,i=a+$(t).height();return e===!0?o<a&&n>i:a<=n&&i>=o}};var Utils=new Utils,getUrlParameter=function(t){var e,o,n=decodeURIComponent(window.location.search.substring(1)),a=n.split("&");for(o=0;o<a.length;o++)if(e=a[o].split("="),e[0]===t)return void 0===e[1]||e[1]};$(document).ready(function(){function t(t,o){$("html, body").stop().animate({scrollTop:0},"500","swing",function(){document.title=$(t).filter("title").text();const n=getUrlParameter("category")||"all";"all"!==n&&(loadCategory(getUrlParameter("category")||"all"),$("#category-picker").slideToggle("fast")),o.css("opacity",0),e.checked?TongWen.trans2Trad(document):TongWen.trans2Simp(document),$(".page-content").after(o),$(".page-content").animate({marginTop:"1.5em",opacity:0},600,function(){$(this).remove(),$(".page-content-clone").css("margin-top","1.5em").animate({marginTop:"0em",opacity:1},600,function(){$(this).addClass("page-content").removeClass("page-content-clone"),addToTop(),goBackTOC(),MathJax.Hub.Queue(["Typeset",MathJax.Hub])})})})}detectIframeInView(),addToTop(),goBackTOC(),loadCategory(getUrlParameter("category")||"all"),$("body").on("click",".footnote, .reversefootnote",function(t){t.preventDefault(),t.stopImmediatePropagation(),scrollToAnchor($(this).attr("href"))});var e=document.querySelector("#ts-switch"),o=document.querySelector("#side-label"),n=(new Switchery(e),null);$(window).on("scroll",function(){n&&clearTimeout(n),n=setTimeout(detectIframeInView,500)}),$("body").on("click","#toTop",function(t){t.preventDefault(),t.stopImmediatePropagation(),$("html, body").stop().animate({scrollTop:0},"500","swing")}),$("body").on("click","#markdown-toc a",function(t){t.preventDefault(),t.stopImmediatePropagation();var e=$(this).attr("href");history.pushState(null,e,e),$("html, body").stop().animate({scrollTop:$(e).offset().top-20},"500","swing")}),$("body").on("click",".post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6",function(){var t=$("#markdown-toc");t.length&&$("html, body").stop().animate({scrollTop:$(t).offset().top-20},"500","swing")}),$("body").on("click",'.post-link, .site-title, .page-link, a[href^="/"]',function(e){e.preventDefault(),e.stopImmediatePropagation();var o=$(this).attr("href");history.pushState(null,o,o);var n=$(".page-content").clone();n.addClass("page-content-clone").removeClass("page-content"),$.ajax({url:$(this).attr("href"),success:function(e){var o=$(e).filter(".page-content").find(".wrapper");o.find("iframe").each(function(){$(this).data("src",$(this).attr("src")),$(this).attr("src","")}),n.html(o),t(e,n)}})}),History.Adapter.bind(window,"popstate",function(){$(".page-content").load(document.location.href+" .page-content > .wrapper",function(t){document.title=$(t).filter("title").text(),loadCategory(getUrlParameter("category")||"all")})}),$("body").on("mouseenter",".post-list a",function(){$(this).next(".home-post-meta").animate({marginLeft:"0em",opacity:1})}),$("body").on("touchstart",".post-list li",function(){$(this).find(".home-post-meta").animate({marginLeft:"0em",opacity:1})}),$("body").on("mouseleave",".post-list a",function(){$(this).next(".home-post-meta").animate({marginLeft:"-1em",opacity:0})}),$("body").on("touchend",".post-list li",function(){$(this).find(".home-post-meta").animate({marginLeft:"-1em",opacity:0})});var a="1"==getUrlParameter("ss");a&&($("#ts-div").hide(),TongWen.trans2Simp(document),new QRCode(document.getElementById("qrcode"),"https://conanblog.me")),e.onchange=function(){e.checked?(TongWen.trans2Trad(document),o.innerHTML="\u7e41"):(TongWen.trans2Simp(document),o.innerHTML="\u7b80")},$("body").on("click","#category-picker a",function(t){t.preventDefault(),t.stopImmediatePropagation();var e=$(this).attr("href");history.pushState(null,e,e),loadCategory(getUrlParameter("category")||"all")}),$("body").on("click","#cp-icon a",function(t){t.preventDefault(),t.stopImmediatePropagation(),$("#category-picker").slideToggle("fast")})});