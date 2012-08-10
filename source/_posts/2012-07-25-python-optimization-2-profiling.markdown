---
layout: post
title: "Python 調優筆記·代碼造影"
date: 2012-07-25 00:14
comments: true
categories: [Optimization, Programming, Python, Serial]
---

在序中，我提到了熱門語言的運行速度比較，比較的前提是 benchmark 程序的質量必須相當。這也就是說，優化運行速度、比別人的跑得快，前提是你的代碼也足夠好。足夠好自然是沒有個標準，不過我認爲，效率高的代碼必須是將瓶頸消除化，或者說是將瓶頸代碼拉得越快越好。經驗再老道的程序員也有可能沒法看出代碼瓶頸的時候。這個時候我們就需要利用一些工具來幫助我們檢查代碼，看看每個部分的運行時長，這便是 Profiling，我用醫學詞彙來說便是「代碼造影」。

Python 是自帶造影工具的，從 [官方文檔](http://docs.python.org/library/profile.html) 看，有三款。但是一款太慢（profile），一款欠維護（hotshot），所以只剩下 cProfile 可用。爲了演示方便，我必須找一個不大不複雜又 CPU intensive 的小程序。於是我找來了 Ian Ozsvald 在 PyCon 上使用的案例——一個畫分形的 [小腳本](https://raw.github.com/ianozsvald/HighPerformancePython_PyCon2012/master/mandelbrot/pure_python/pure_python_slow.py)。

0. 我們不妨先來運行一下該腳本：

```
$ python pure_python_slow.py
```

運行結果是會生成這張圖片：

![分形](https://public.blu.livefilestore.com/y1pn9Ob0P_ELpnDR_BxhnQc9bjmo0F8y1gz4qudepNB2yt5xpJba35Q_fJmBdGT1TDqCszaOgh2-U_5WkHYh4ldTQ/fractal.png?psid=1 "分形")

命令行下的運行結果輸出則是：

```
Main took 0:00:17.247938
Total sum of elements (for validation): 1148485
```

1. 下面我們來用 cProfile 看看哪些地方用的時間比較長：

```
python -m cProfile -o rep.prof pure_python_slow.py
```

用這種方法可以對整個腳本進行 profiling，然後把結果輸出到 `rep.prof` 中。當然對於一些較大的項目，這麼做是不恰當的，因爲一些大的項目往往有人機交互，所以使用這樣的方式來獲取運行時長顯然不可行。所以 `cProfile` 也提供了 function 方式的調用，也就是說可以在代碼裏使用它。而事實上官網的文檔就是這樣用的。使用 Django
的同學可以試試[這樣的代碼](http://djangosnippets.org/snippets/727/)。

2. 接着我們來分析一下所得的 profile，在與生成的 profile 文件同目錄下打開 Python 交互命令行：

```
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

```

這裏我們可以看出，加了 `cProfile` 原來的程序會運行得略慢一些。
// TODO: analyz and continue
