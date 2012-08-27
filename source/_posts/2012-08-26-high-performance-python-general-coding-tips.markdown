---
layout: post
title: "Python 調優筆記·經驗主義調優"
date: 2012-08-26 14:56
comments: true
categories: [Python, Optimization, Serial, Programming]
---

上一次我們聊了「理性主義」，與其相對的哲學流派就是「經驗主義」了，在 Python 的調優中，我們自然也有從前人流傳下來的小技巧來使代碼的效率更高。在優化工作當中，這兩類方式往往是交替使用的。而且廣義地說，流派不一樣不代表它們對同一件事情的看法就是矛盾的。事實上流派不一樣僅僅是研究方式不一樣，最後結論往往是一致的。本文則將重點放在「經驗主義調優」，收集儘可能多的小技巧。預料中會有補充。<!--more-->

在列舉各種「術」之前，先說「道」（術指具體做事的方法，道指做事的原理）。領悟了道之後才能在不同情況下做出正確的選擇。一般而言，調優無非在兩方面做優化：時間複雜度和空間複雜度。有時候時間和空間會互相矛盾，而這個時候就不得不在它們中做取捨。不同的應用取捨的決定因素是不一樣的。不過就目前而言，因爲空間越來越廉價，時間越來越寶貴，大部分時候人們會偏向與用空間換時間。當然也有兩者不矛盾的時候，這個時候肯定是綜合複雜度越小越好。

從複雜度的角度說，選擇的優先級按下面的排列：

$$O(1)>O(\log n)>O(n\log n)>O(n^2)>O(n^3)>O(n^k)>O(k^n)>O(n!)$$

## `dict`{:lang="python"} > `list`{:lang="python"}

`dict`{:lang="python"} 的數據結構是 Hash Table，查找的時間複雜度 是$$O(1)$$；而 `list`{:lang="python"} 的數據結構是 Array，查找的時間複雜度是 $$O(n)$$。

## `dict[]`{:lang="python"} > `dict.get()`{:lang="python"}

http://wiki.python.org/moin/PythonSpeed/PerformanceTips?highlight=%28%28PythonSpeed%7CPerformanceTips%29%29
http://www.ibm.com/developerworks/cn/linux/l-cn-python-optim/index.html?ca=drs#ibm-pcon

{% render_partial documentation/_partials/Python_optimization_serial_TOC.markdown %}
