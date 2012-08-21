---
layout: post
title: "簡單粗暴解決 Zsh Home 和 End 按鍵問題"
date: 2012-08-20 22:21
comments: true
categories: [Linux, Unix, Zsh, Hack]
---

記得剛來美國那會兒，有一次在地鐵裏聽到兩位老太太聊關於手機待機時間短的話題，當中一個老太太勸另一個老太太說去找客服「Go talk to them. Don't settle.」這句話很大程度上概括了美國人的生活態度 —— 不妥協，有不滿就去解決。這種思想對 Hack 文化也有着潛移默化的影響，用中國人的話說便是「折騰」。<!--more-->

半年前我加入了 `Zsh` 的用戶陣營，一番配置後倒也用着挺爽。前幾天又去折騰 `.zshrc` 文件，更爽了，可是 `Home` 和 `End` 鍵工作得不正常了，就像這樣：

``` bash
$ H                     
git push origin source

```

按完 `Home` 鍵就在我的命令裏加了一個 H 還換行，我居然就這樣「settle」了一段時間。今天實在忍不住，找解決方案。網上的解決方案很多，也有很成熟的，比如用 `autoload zkbd`
來問答式生成按鍵和含義對應表的，可我嫌麻煩。更大部分的解決方案只是放一堆配置文件代碼，而事實上這些代碼在不同環境下是不一樣的。所以換句話說這些代碼只是治標不治本，答者沒有授問者以漁。

問題的本身在 `bindkey` 上。也就是說只要找到對應的按鍵和 `Zsh` 內的含義接口就可以解決問題。而含義接口就是 `beginning-of-line` 和 `end-of-line`。所以只需要找到我們的按鍵碼是什麼就可以了。下面這個小技巧可能鮮爲人知，就是利用 `cat` 來查看按鍵碼。很簡單，在命令行下直接 `cat` + 回車，然後接着按你想知道按鍵碼的按鍵，在我的例子裏就是 `Home` 鍵：

``` bash
$ cat
^[OH
```

接着我又得到了 `End` 鍵的按鍵碼。最後在 `.zshrc` 裏添加兩行代碼：

```
bindkey "^[OH" beginning-of-line
bindkey "^[OF" end-of-line
```

問題解決，簡單粗暴，但直截了當。Don't settle. Happy hacking.
