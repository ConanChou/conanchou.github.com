---
layout: post
title: "Python 調優筆記·代碼造影"
date: 2012-07-25 00:14
comments: true
categories: [Optimization, Programming, Python, Serial]
---

在序中，我提到了熱門語言的運行速度比較，比較效率的前提是 benchmark 程序的質量必須相當。這也就是說，優化運行速度、比別人的跑得快，前提是你的代碼也足夠好。足夠好自然是沒有個標準，不過我認爲，效率高的代碼必須是將瓶頸消除化，或者說是將瓶頸代碼拉得越快越好。經驗再老道的程序員也有可能沒法看出代碼瓶頸的時候。這個時候我們就需要利用一些工具來幫助我們檢查代碼，看看每個部分的運行時長，這便是 Profiling，我用醫學詞彙來說便是「代碼造影」。<!-- more -->

Python 是自帶造影工具的，從 [官方文檔](http://docs.python.org/library/profile.html) 看，有三款。但是一款太慢（profile），一款欠維護（hotshot），所以只剩下 `cProfile`{:lang="python"} 可用。爲了演示方便，我必須找一個不大不複雜又 CPU intensive 的小程序。於是我找來了 Ian Ozsvald 在 PyCon 上使用的案例 —— 一個畫分形的 [小腳本](https://raw.github.com/ianozsvald/HighPerformancePython_PyCon2012/master/mandelbrot/pure_python/pure_python_slow.py)。

我們不妨先來運行一下該腳本：

{% codeblock lang:sh %}
$ python pure_python_slow.py
{% endcodeblock %}

運行結果是會生成這張圖片：

![分形](https://public.blu.livefilestore.com/y1pn9Ob0P_ELpnDR_BxhnQc9bjmo0F8y1gz4qudepNB2yt5xpJba35Q_fJmBdGT1TDqCszaOgh2-U_5WkHYh4ldTQ/fractal.png?psid=1 "分形")

命令行下的運行結果輸出則是：

{% codeblock lang:sh %}
Main took 0:00:17.247938
Total sum of elements (for validation): 1148485
{% endcodeblock %}

下面我們來用 cProfile 看看哪些地方用的時間比較長：

{% codeblock lang:sh %}
$ python -m cProfile -o rep.prof pure_python_slow.py
{% endcodeblock %}

用這種方法可以對整個腳本進行 profiling，然後把結果輸出到 `rep.prof`{:lang="python"} 中。當然對於一些較大的項目，這麼做是不恰當的，因爲一些大的項目往往有人機交互，所以使用這樣的方式來獲取運行時長顯然不可行。所以 `cProfile`{:lang="python"} 也提供了 function 方式的調用，也就是說可以在代碼裏使用它。而事實上官網的文檔就是這樣用的。使用 Django
的同學可以試試[這樣的代碼](http://djangosnippets.org/snippets/727/)。

接着我們來分析一下所得的 profile，在與生成的 profile 文件同目錄下打開 Python 交互命令行：

{% codeblock lang:python %}
>>> import pstats
>>> p = pstats.Stats('rep.prof')
>>> p.sort_stats('cumulative').print_stats(10)
Sun May 13 20:12:47 2012    rep.prof

         52166198 function calls (52166197 primitive calls) in 20.844 seconds

   Ordered by: cumulative time
   List reduced from 182 to 10 due to restriction <10>

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.026    0.026   20.844   20.844 pure_python_slow.py:1(<module>)
        1    0.066    0.066   20.818   20.818 pure_python_slow.py:40(calc_pure_python)
        1   16.048   16.048   20.602   20.602 pure_python_slow.py:25(calculate_z_serial_purepython)
 51414419    3.588    0.000    3.588    0.000 {abs}
   250001    0.966    0.000    0.966    0.000 {range}
        1    0.035    0.035    0.136    0.136 pure_python_slow.py:8(show)
   250001    0.042    0.000    0.042    0.000 pure_python_slow.py:14(<genexpr>)
        1    0.018    0.018    0.038    0.038 /usr/lib/python2.7/dist-packages/PIL/Image.py:27(<module>)
      3/2    0.009    0.003    0.020    0.010 {apply}
        1    0.000    0.000    0.019    0.019 {__import__}

{% endcodeblock %}

這裏我們可以看出，加了 `cProfile`{:lang="python"} 原來的程序會運行得略慢一些。這也是意料之中的。

下面我們來仔細看一下造影報告，也就是從第十一行開始的表格。
表格第一行是總時間，第二行是 `calc_pure_python`{:lang="python"} 所用時間，而第三行是 `calculate_z_serial_purepython`{:lang="python"} 所用時間，以此類推。從以上的這個表格我們至少可以判斷：大部分時間都花在了 `calculate_z_serial_purepython`{:lang="python"} 上。

可能這個表格並不是很直觀。那下面我再介紹一種更加直觀的方式 —— `runsnake`{:lang="sh"}。我們回到命令行，用 `runsnake`{:lang="sh"} 跑剛剛生成的造影文件（`rep.prof`{:lang="python"}）:

{% codeblock lang:sh %}
$ runsnake res.prof
{% endcodeblock %}

運行後你會看到這個窗口：

![RunSnake 運行結果](https://xiil8w.blu.livefilestore.com/y1p-S46t388afLR5WALVXfzfgc36A_zh3jlEMbbjm3ouwkI1KEl7CRTPE8OS9mmtW7MZBCkujoUHT19OkiolKb1Dvd37IW8WMd-/runsnake.png?psid=1 "RunSnake 運行結果")

現在顯而易見了吧， `calculate_z_serial_purepython`{:lang="python"} 就是花時間最多的。可是到底是什麼使得它花這麼久，還是不能從上圖中找到原因。很顯然不是因爲 `<abs>` 和 `<range>`。于是我们定位到这个 function：

{% codeblock function calculate_z_serial_purepython lang:python %}
def calculate_z_serial_purepython(q, maxiter, z):
    """Pure python with complex datatype, iterating over list of q and z"""
    output = [0] * len(q)
    for i in range(len(q)):
        if i % 1000 == 0:
            # print out some progress info since it is so slow...
            print "%0.2f%% complete" % (1.0/len(q) * i * 100)
        for iteration in range(maxiter):
            z[i] = z[i]*z[i] + q[i]
            if abs(z[i]) > 2.0:
                output[i] = iteration
                break
    return output
{% endcodeblock %}

有經驗的 Python 程序員可能已經知道問題出在哪裏了，但是我先賣個關子。當然目的是爲了介紹下面的一個造影工具 —— `kernprof.py`，line profiling，行造影工具。

相比之下，使用 `kernprof.py` 略麻煩一點。你得在需要做“行造影”的 function 前面加一個 decorator `@profile`{:lang="python"}，然后运行：

{% codeblock lang:sh %}
$ kernprof.py -l -v pure_python_slow_lineprof.py
#...略去部分無關輸出
Main took 0:03:38.140994
Total sum of elements (for validation): 1148485
Wrote profile results to pure_python_slow_lineprof.py.lprof
Timer unit: 1e-06 s

File: pure_python_slow_lineprof.py
Function: calculate_z_serial_purepython at line 24
Total time: 112.149 s

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    24                                           @profile
    25                                           def calculate_z_serial_purepython(q, maxiter, z):
    26                                               """Pure python with complex datatype, iterating over list of q and z"""
    27         1         1193   1193.0      0.0      output = [0] * len(q)
    28    250001       158612      0.6      0.1      for i in range(len(q)):
    29    250000       178444      0.7      0.2          if i % 1000 == 0:
    30                                                       # print out some progress info since it is so slow...
    31       250         5943     23.8      0.0              print "%0.2f%% complete" % (1.0/len(q) * i * 100)
    32  51464485     31971119      0.6     28.5          for iteration in range(maxiter):
    33  51414419     40896082      0.8     36.5              z[i] = z[i]*z[i] + q[i]
    34  51414419     38095052      0.7     34.0              if abs(z[i]) > 2.0:
    35    199934       128641      0.6      0.1                  output[i] = iteration
    36    199934       714362      3.6      0.6                  break
    37         1            4      4.0      0.0      return output
{% endcodeblock %}

這裏我爲了不弄亂之前的文件裏的代碼，就直接另存爲了 `pure_python_slow_lineprof.py`。

如果你剛剛也跟我一起運行的話，你可能會首先注意到，運行速度非常之慢。所以我分享一則小技巧，就是想辦法讓運行的腳本縮小運行 scope。比方說你在做一個 1TB 數據的分析，在做優化的時候可以將目標數據減少到 1GB 之類的，數據量的減小不會對我們的行造影結果產生影響。在我們的這個例子裏，我們可以在運行的命令行末加上 ` 300 300`，這樣腳本就只會算一個 300*300 的分形圖，計算量相對要小很多。

那結果的最重要部分自然是表格部分了，這個表格裏我們可以看到對應代碼行的運行時間。因爲這個代碼相對很簡單，所以我們可以立刻看出是哪裏的問題了。重點在第 32、33、34 行。

這三行裏就有兩個小問題。

- 首先是 32 行，在 Python 3.x 之前，`range()`{:lang="python"} 和 `xrange()`{:lang="python"} 還是有區別的。前者會在內存中真的生成 `list`{:lang="python"}，而後者只是返回一個類似的 object （我們會在[第四篇](https://conanblog.me/blog/python/optimization/serial/programming/2012/08/26/python-optimization-4-high-performance-python-general-coding-tips/)中詳細討論到這個問題）。性能上略有提升，但是並不顯著，從運行時間上來說，區別不大。
- 33、34 行一直在直接從 `list`{:lang="python"} 裏查詢數據，而雖然查詢時間複雜度是 $$O(1)$$，但是代碼一遍又一遍地 `get`{:lang="python"} 和 `set`{:lang="python"}，這樣做勢必會消耗更多時間。

所以通過分析，我們知道就以上的第一點而言，我們即使改用成 `xrange()`{:lang="python"}，在速度上我們也不會得到很大的提升。而就第二點，我們可以做如下修改：

{% codeblock lang:python %}
def calculate_z_serial_purepython(q, maxiter, z):
    """Pure python with complex datatype, iterating over list of q and z"""
    output = [0] * len(q)
    for i in range(len(q)):
        zi = z[i]
        qi = q[i]
        if i % 1000 == 0:
            # print out some progress info since it is so slow...
            print "%0.2f%% complete" % (1.0/len(q) * i * 100)
        for iteration in xrange(maxiter):
            #z[i] = z[i]*z[i] + q[i]
            zi = zi * zi + qi
            if abs(zi) > 2.0:
                output[i] = iteration
                break
    return output
{% endcodeblock %}

修改後我們再運行一遍行造影：

{% codeblock lang:sh %}
File: pure_python_improved_lineprof.py
Function: calculate_z_serial_purepython at line 24
Total time: 110.898 s

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    24                                           @profile
    25                                           def calculate_z_serial_purepython(q, maxiter, z):
    26                                               """Pure python with complex datatype, iterating over list of q and z"""
    27         1         1180   1180.0      0.0      output = [0] * len(q)
    28    250001       162404      0.6      0.1      for i in range(len(q)):
    29    250000       161958      0.6      0.1          zi = z[i]
    30    250000       155260      0.6      0.1          qi = q[i]
    31    250000       173665      0.7      0.2          if i % 1000 == 0:
    32                                                       # print out some progress info since it is so slow...
    33       250         5647     22.6      0.0              print "%0.2f%% complete" % (1.0/len(q) * i * 100)
    34  51464485     31790147      0.6     28.7          for iteration in xrange(maxiter):
    35                                                       #z[i] = z[i]*z[i] + q[i]
    36  51414419     37946710      0.7     34.2              zi = zi * zi + qi
    37  51414419     40239095      0.8     36.3              if abs(zi) > 2.0:
    38    199934       138030      0.7      0.1                  output[i] = iteration
    39    199934       123589      0.6      0.1                  break
    40         1            4      4.0      0.0      return output
{% endcodeblock %}

看似沒有多大提升？確實，就每行時間上來看確實沒有多大提升，但是從總時間看，有了差不多兩秒的提升。而且如果我把行造影去掉，裸跑的話，速度的提升更加顯著一些（大約 6 秒）。有人說這樣的提升要不要都也無所謂，其實不然。我剛剛說到 scope，如果放大 scope，原先兩秒的優勢可能會被放大到 20 分鐘甚至更多。

大致總結下，代碼造影工具可以有效地幫助你找到代碼運行速度上的癥結，`cProfile`{:lang="python"} 可用於造影模塊的運行，`RunSnake`{:lang="sh"} 可以幫助可視化造影結果，而 `kernprof.py` 可以對代碼進行更加精準的行造影。另外，在使用這些造影工具的同時，我們還要注意學習前人的經驗，知道如何寫更好的代碼。

最後我要說，代碼層面的優化是很有限的，只要運行機制層面不改變，可能最好的代碼都會很慢，所以本系列之後的文章裏我會談一談優化「運行機制」。

{% render_partial documentation/_partials/Python_optimization_serial_TOC.markdown %}
