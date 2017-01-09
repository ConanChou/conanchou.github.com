---
layout: post
title: "用 Python 的「神奇方法」元編程"
date: 2012-08-21 22:41
comments: true
categories: [Python, Programming]
---

在開始聊這個話題前，我覺得有必要先簡單說說這兩個概念：「神奇方法」和「元編程」。

什麼是「神奇方法」？其實是我亂翻譯的，英文中大家叫它們「Magic Methods」。我沒有在靜態語言中聽到過這個概念，只在 Python、PHP 這類動態語言中聽到。這是一類比較特殊的方法（Method/Function），是隨語言本身所故有的，在程序中無聲無息地起到作用。它們的命名方式都很特別，比如在 Python 中就是用`__`開頭用`__`結尾的方法，而在 PHP
中則是類似地用`__`開頭的方法。<!--more-->說他們默默無聞一點不假，因爲正常編程的過程中較少的跟它們打交道，就連官方的文檔都只是用只言片語描述了下，以示存在。然而它們非常重要。幸好有一些熱心人做了[一份較爲詳細的文檔](http://www.rafekettler.com/magicmethods.html)可作參考。

「元編程」的概念並不新鮮，簡單而廣義地說就是語言本身可以在運行時被修改或可以增量編譯，那麼我們就可以使用該語言進行元編程。而要實現上述功能，語言本身就需要有反射或者泛型編程的語言特性。這術語聽起來很嚇人，但其實說具體如何實踐就不嚇人了。根據維基百科，實現元編程可以有三種方法。一是語言本身暴露一些本身運行時的 API，然後我們可以通過對調教 API
來實現元編程。二是語言本身可以動態地執行一些本身是程序方法的字符串表達式。而第三種可能略有爭議，就是撤徹底底用一種可以形容別的語言的系統來生成目標語言。而元編程的目的嘛，自然是更加簡單優美地解決問題啦。元編程這話題本來就博大精深，我可不敢說我很明白，希望觀者掂量着看這些文字吧。

下面就進入正題。我不會在下文中概括所有有關 Python 的元編程方法，而是通過一個我最近遇到的實例來說明兩件事：元編程跟原子彈都姓 Yuan，它們都很強大；Python 的動態和優美賦予其元編程的能力。

前不久我因工作，需要寫一個腳本來訪問某私有 API，並把內容全部按照 json 結構錄入到數據庫中。接口大致上是這樣的類型：

```
http://abc.com/jsonrest/api/4.10/search_getRelatedVideos?x=aaa&y=bbb
http://abc.com/jsonrest/api/4.10/search_getRelatedArticles?x=aaa&y=bbb
http://abc.com/jsonrest/api/4.10/search_getRelatedTopics?x=aaa&y=bbb
```

問題就在於，我要如何做才能簡單而優美地寫一個 API wrapper。這個 wrapper 要可以做到這樣：

``` python
related_articles = api.search_getRelatedArticles(x=aaa, y=bbb)
related_topics = api.search_getRelatedTopics(x=aaa, y=bbb)
```

而且最好我都不需要一個一個地去實現相應的方法，因爲一旦需要呼叫新的 API，我又必须再添加一個個新的方法。所以我最好可以隨意地寫，wrapper 則幫我生成新方法：

``` python
# 假设 `calculate_getUnrelatedMusic()` 是個新 API 呼叫方法
unrelated_musics = api.calculate_getUnrelatedMusic(x=aaa, y=bbb, z=ccc)
```

其實說到這裏，我想很多老 Python 程序員應該是想到我要用的「神奇方法」了。沒錯，就是 `__getattr__(self, name)`。Python 會在找不到所呼叫的 attribute 的時候來調用這個方法。這不正是我想要的嘛，我只要截獲這個方法的邏輯就可以動態生成 API 調用方法了。所以解決方案一下子變得很簡單：

``` python

class ABCAPI:
    """ABC API wrapper"""

    # 初始化，很常規
    def __init__(self, accesskey, sharedsecret, server='abc.com', version='4.10'):
        self.accesskey = accesskey
        self.sharedsecret = sharedsecret
        self.server = server
        self.version = version

    # 這個方法是今天的主角。局部變量 name 就是我們上面所提到的 `search_getRelatedArticles`
    # 之類的方法名。而方法裏的那些參數都會被 `**params` 拿進來。這種寫法有關閉包，不在本文
    # 討論範疇裏。
    def __getattr__(self, name):
        """Get API Call"""
        # 進了方法先判斷下方法名是不是`__`開頭，只要是就拋異常，這樣 `__getattr__()` 就不會
        # 失去原有的行爲模式，即保護私有變量或方法。
        if name.startswith('_'):
            raise AttributeError, name
        else:
            def caller(**params):
                # 构建 API URL 的所有东西都在这儿了，这需要按照一定规律把这些材料组建成合法 URL
                url = self.construct_api_url(name, params)

                # 呼叫刚刚构建好的 URL 并返回结果
                return self.call_url(url)
            return caller

    #...
    # other utility methods for building the api url and calling the api
    #...
```

以上就是我认为很优美的解决方案，短小精悍。然而这种用法并没有在我上文提到的那個有關「神奇方法」的文檔裏提及。所以在參考的時候請開動腦筋，不要侷限在作者的框框裏。你可以拿它們來做很多意想不到的事情。

那最後我的這種實現方式到底屬於上文提到的哪種元編程實現方式呢？留作思考題吧～
