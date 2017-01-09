---
layout: post
title: "Python 調優筆記·序"
date: 2012-07-23 01:19
comments: true
categories: [Python, Optimization, Serial, Programming]
---

以往我都以寫命令行下的 Python 腳本爲主。即使做項目也基本是做小規模 Web 類的。所以很少遇到效率太低受不了的情況，所以也鮮有調優的需要。當然，在寫代碼時就已經注意了一些效率問題，所以基本不需要很費心機地調優。可是幾個月前我做了兩個項目，一是一個機器學習引擎，用以學習在線讀者閱讀習慣；另一個是一個下 Chess 的 AI，用以人機對奕。<!-- more -->兩個系統都用 Python 構建。因爲這兩個項目都是 CPU intensive 的，真的是慢的可以。於是這逼得我不得不去研究下有關 Python
的調優。而在機器學習的項目中，因爲當時自己的服務器實在很爛（只有256 MB 內存），所以得瘋狂得做服務器部署的優化才能讓它處理外部請求和部分邏輯。加上以往的服務器調優經驗，也算是積累了一些有用的東西。

上個禮拜一個朋友跟我討論 Python 以及 Django 網站的調優問題。我告訴了他一些我的經驗。雖然當時聊得很匆忙，可是我想這些信息是有用的，至少對我很有用。一方面我真的沒有具體地整理過，另一方面也是怕自己將來忘記。所以趁熱打鐵，打算整理成系列。在這個系列裏，我將會涉及到以下兩大類瓶頸的調優：

- 瓶頸在計算的調優
- 瓶頸在數據讀寫的調優

讓我們來看張圖先：

![熱門編程語言速度對比](https://public.blu.livefilestore.com/y1pauSVpp8onRf0BIEWig2UQ0yvy0OYj-1bpinVGs6SqA4s4q2qZV1daZXxKrQXoG4ktnb0ddekeu2iTohP_PtyuQ/chart.png?psid=1 "熱門編程語言速度對比")

調優之後我們的程序到底能跑多快？猜 V8 JavaScript 的很大膽。但是你還不夠大膽，事實上效果好的情況可以直逼 GCC C。也就是可以提升 20 多倍的速度。而這張圖測試的背景是代碼本身已經優化過的基礎上。那在真實的生產生活中，這個數字可以是上三位數的。

優化是沒有一針見血很徹底的方案的，因爲優化牽扯到程序從編寫到運行的方方面面。有句話說：如果一個程序能夠很正常地運行，那說明沒有地方有問題；但是如果程序出錯了，就有可能不止一處有問題。同樣的道理，調優也是如此。因此，本系列會分很多篇，每一篇針對一個話題。

{% render_partial documentation/_partials/Python_optimization_serial_TOC.markdown %}

在整理時我參考了大量資料，以一定程度上確保靠譜。

整理和尋找知識系統和方法理論的時候，我使用了非常好用的 Mind Mapping 開源軟件 [FreeMind](http://freemind.sourceforge.net/wiki/index.php/Main_Page)，提高效率的 [tmux](http://tmux.sourceforge.net/) 和 [Vim](http://tmux.sourceforge.net/)。題外話，推薦一下。

