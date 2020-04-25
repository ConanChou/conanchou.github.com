---
layout: post
title: Electron + ClojureScript + Reagent  + nREPL
comments: true
categories: [tech, clojurescript, clojure, electron]
tweet_id: 873655361491935234
---

正在進行的 Savant 項目就是這個前端技術架構做開發的，配置麻煩了一點，但是一旦配好了你將擁有爽爆了的 Live Coding 的開發體驗。

`Electron + ClojureScript + Reagent`部分已經有人做了——[descjop](https://github.com/karad/lein_template_descjop){:target="_blank"}，直接拿來用就好。想要了解細節的話可以看這個系列文章 [CLOJURESCRIPT + ELECTRON](https://owensd.io/2017/02/06/clojurescript-electron/){:target="_blank"}，雖然不是出自同一作者，但是思路一致。可是 descjop 只用了 Figwheel 的默認 REPL，所以這只解決了一半的問題，跟目前流行的 IDE／編輯器結合最好的方案還是通過 nREPL，這個我在[之前的文章](/blog/2016/03/06/reagent-figwheel-repl-with-nrepl/)提到過。配法類似，需要在 `project.clj` 裏加兩行。一個是 dependency：

```clj
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.473" :exclusions [org.apache.ant/ant]]
                 [org.clojure/core.async "0.2.395"]
                 [reagent "0.6.0"]
                 [ring/ring-core "1.5.1"]
                 [figwheel "0.5.9"]
                 [com.cemerick/piggieback "0.2.2"]]
```

加的是最後一行。還有就是 Figwheel 的配置：

```clj
  :figwheel {:http-server-root "public"
             :ring-handler figwheel-middleware/app
             :server-port 3449
             :nrepl-port 7002})
```

也是最後一行。接著按照 descjop 官方文檔說的運行：

```bash
lein descjop-figwheel
```

之後就跟之我之前的文章一樣了，用 Cursive 或 Emacs 之類的連接`7002`端口並運行：

```clj
(use 'figwheel-sidecar.repl-api)
(cljs-repl)
```

Happy Live Coding!


