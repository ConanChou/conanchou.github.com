---
layout: post
title: "Reagent 的 Figwheel REPL 方案"
date: 2016-03-06 11:42:03 -0500
comments: true
categories: [clojure, tech]
---

剛剛開始了壹個新 side project，這次打算用
[reagent](https://github.com/reagent-project/reagent)
做這個項目。我是直接用了 reagent 的默認模板：

```
lein new reagent myproject
```

開發的時候用 `lein figwheel` 運行，當瀏覽器指向默認的開發地址 `http://localhost:3449`
時，Figwheel 的
[REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)
就會出現，然後調試起來簡直不能更爽。不過這個 Figwheel REPL 有個問題，就是不支持歷史回溯，
不像 [nREPL](https://github.com/clojure/tools.nrepl)，你不能上下鍵調歷史，更不能 <kbd>ctrl</kbd> + <kbd>r</kbd> 搜索歷史。

<!--more-->

這個肯定不能忍啊，經過壹番搗鼓，算摸出個方案。記錄下來以免之後忘了……
其實方案很直白，就是在 nREPL 裏用 Figwheel REPL。
如果是直接用 Figwheel Leiningen 模板的，可以按照
[這份 wiki](https://github.com/bhauman/lein-figwheel/wiki/Using-the-Figwheel-REPL-within-NRepl)
配置壹下。如果是用 reagent 的默認模板，其實這些配置是已經配置好了的。
我也是看了 `project.clj` 的配置才意識到的，壹開始還改了半天配置，走了些彎路，直到看到這壹段：

```
:figwheel {:http-server-root "public"
           :server-port 3449
           :nrepl-port 7002
           :nrepl-middleware ["cemerick.piggieback/wrap-cljs-repl"
                              ]
           :css-dirs ["resources/public/css"]
           :ring-handler khm-clj.handler/app}
```

有 nREPL 相關的配置，看來是 reagent 已經配置了 nREPL，其實啟動後仔細看 STDOUT 也能看到：

```
Figwheel: Starting nREPL server on port: 7002
```

接下來只需要連上 nREPL 就好了。[Cursive](https://cursive-ide.com) 的話可以參考
[這份文檔](https://cursive-ide.com/userguide/repl.html) 配置遠程 nREPL，
我在文末的動圖裏也會演示。而純命令行的就更簡單了，直接

```
lein repl :connect 7002
```

連接成功就已經成功壹半了，最後還剩兩條命令，壹是加載 `figwheel-sidecar.repl-api`，
壹是調用 `cljs-repl`，調用之後 `namespace` 會被自動從 `user` 換到 `cljs.user`：

```
conan@crmbp ~/workspace/khm-clj $ lein repl :connect 7002
Connecting to nREPL at 127.0.0.1:7002
REPL-y 0.3.7, nREPL 0.2.12
Clojure 1.8.0
Java HotSpot(TM) 64-Bit Server VM 1.8.0_65-b17
    Docs: (doc function-name-here)
          (find-doc "part-of-name-here")
  Source: (source function-name-here)
 Javadoc: (javadoc java-object-or-class-here)
    Exit: Control+D or (exit) or (quit)
 Results: Stored in vars *1, *2, *3, an exception in *e

user=> (use 'figwheel-sidecar.repl-api)
nil
user=> (cljs-repl)
Launching ClojureScript REPL for build: app
Figwheel Controls:
          (stop-autobuild)                ;; stops Figwheel autobuilder
          (start-autobuild [id ...])      ;; starts autobuilder focused on optional ids
          (switch-to-build id ...)        ;; switches autobuilder to different build
          (reset-autobuild)               ;; stops, cleans, and starts autobuilder
          (reload-config)                 ;; reloads build config and resets autobuild
          (build-once [id ...])           ;; builds source one time
          (clean-builds [id ..])          ;; deletes compiled cljs target files
          (print-config [id ...])         ;; prints out build configurations
          (fig-status)                    ;; displays current state of system
  Switch REPL build focus:
          :cljs/quit                      ;; allows you to switch REPL to another build
    Docs: (doc function-name-here)
    Exit: Control+C or :cljs/quit
 Results: Stored in vars *1, *2, *3, *e holds last exception object
Prompt will show when Figwheel connects to your application
To quit, type: :cljs/quit
nil
cljs.user=>
```

最後我們來測試壹下：

![](https://cloud.githubusercontent.com/assets/480759/13558112/f083e61a-e3c9-11e5-9556-80eaab79b6a2.gif)


今天手賤，又忘了保存帖子，於是只能又重寫了壹遍……
