---
layout: page
title: Photos
permalink: /photos/

---
{% assign link = '{{link}}' %}
{% assign image = '{{image}}' %}

<div id="instafeed"></div>
<div id="loadMore"><a href="https://www.instagram.com/conanchou/" title="Follow my feed">∞</a></div>
<script type="text/javascript">
    var feed = new Instafeed({
        get: 'user',
        userId: '5440990',
        clientId: '38e7796038704acab4925a0c3cf4a1e0',
        accessToken: '5440990.1677ed0.7c6c3ccbffb548c9a87c39cc1e81cb22',
        template: '<a href="{{link}}" target="_blank"><img src="{{image}}" /></a>',
        });
    feed.run();
</script>
