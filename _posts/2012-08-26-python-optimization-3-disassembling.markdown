---
layout: post
title: "Python 調優筆記·理性主義調優"
date: 2012-08-26 00:10
comments: true
categories: [python, serial, coding, tech]
---

[上次](/blog/optimization/programming/python/serial/2012/07/25/python-optimization-2-profiling/)我們學會了如何使用造影工具，使用它們的目的自然是設法找到代碼「慢」的理由。不過在上次的博文裏對於那段代碼慢的分析也是建立在我們有一定經驗的基礎上的。那我們總有第一次，如果第一次我們碰到這樣的瓶頸我們是不是就不知道該如何優化了呢？答案顯然是否定的。計算機作爲一門人造科學，可以說是完全在數學和邏輯的基礎上堆砌起來的，是完全可以推導出問題出在哪裏的（題外話，我認爲後者也屬於前者，可是聯合國教科文組織卻把它們分開了）。本篇博文就是要說如何在無經驗狀態下找到癥結。我稱之爲「理性主義調優」，當然這裏只指代碼級別的調優。（理性主義相對於經驗主義，是兩個相對的哲學流派。）<!--more-->

我們要做的第一步就是學會使用代碼造影，上次我們討論的幾個工具並不是你每次每個都要使用，但是先做大範圍的模塊造影，再做有針對性的行造影是造影的常規步驟。

經過上面的第一步，我們會得到一組有問題的代碼。能直接解決的可以直接解決，不能直接找到原因的就是下面我重點要講的了。因爲 Python 是相對很高級的語言，很多底層細節會被隱藏掉，這從某種程度上加大了找出癥結的難度。換句話說，只要能夠摸清楚某行有問題的代碼到底怎麼執行的，那基本也就能夠推導出問題所在了。所以「理性主義調優」的問題就被簡化爲「如何弄懂代碼到底幹什麼」的問題。

爲此去讀長篇的文檔當然算是一個辦法，很學院派，但是並不是很高效。另一條路就是「Disassembling」，有 C 背景的同學多半是聽過這個詞的。說白了，就是把程序執行時在內存裏的每一步操作都打印出來，以供分析。（如果對此不瞭解的同學可以到我翻譯的開源文集[相關章節](https://conanblog.me/Unix-as-IDE-CN/html/compiling.html#id3)學習）其實 Python 也可以 Disassembling，不過這和 C 的有些區別。因爲我們知道 Python 在運行時，其機制和 Java 是類似的，都是從源碼到字節碼，即
bytecode，而非二進制碼（binary code）；然後再把字節碼放在虛擬機裏運行。所以 Python 裏面的 Disassembling 其實是字節碼層面的。下面用到的工具就來自 Python 自帶的 `dis`{:lang="python"}。

我們繼續之前的[代碼例子](https://raw.github.com/ianozsvald/HighPerformancePython_PyCon2012/master/mandelbrot/pure_python/pure_python_slow.py)，只是假設我們現在還不知道「慢」的原因。目前的狀況是我們知道了瓶頸在 `calculate_z_serial_purepython()`{:lang="python"} 裏，並且通過行造影，我們知道 `z[i] = z[i]*z[i] +q[i]`{:lang="python"} 花了很多时间。现在我们来 Disassembling：

```python
>>> import pure_python_slow
>>> import dis
>>> dis.dis(pure_python_slow.calculate_z_serial_purepython)
# 前略

 32     >>   90 SETUP_LOOP              86 (to 179)
             93 LOAD_GLOBAL              1 (range)
             96 LOAD_FAST                1 (maxiter)
             99 CALL_FUNCTION            1
            102 GET_ITER            
        >>  103 FOR_ITER                72 (to 178)
            106 STORE_FAST               5 (iteration)

 33         109 LOAD_FAST                2 (z)   # 載入 z
            112 LOAD_FAST                4 (i)   # 載入 i
            115 BINARY_SUBSCR                    # 獲得 z[i] 的值
            116 LOAD_FAST                2 (z)   # 載入 z
            119 LOAD_FAST                4 (i)   # 載入 i
            122 BINARY_SUBSCR                    # 獲得 z[i] 的值
            123 BINARY_MULTIPLY                  # 計算 z[i]*z[i]
            124 LOAD_FAST                0 (q)   # 載入 q
            127 LOAD_FAST                4 (i)   # 載入 i
            130 BINARY_SUBSCR                    # 獲得 q[i] 的值
            131 BINARY_ADD                       # 計算 z[i]*z[i]+q[i]
            132 LOAD_FAST                2 (z)   # 載入 z
            135 LOAD_FAST                4 (i)   # 載入 i
            138 STORE_SUBSCR                     # 保存剛剛的計算結果進 z[i]

 34         139 LOAD_GLOBAL              2 (abs) # 載入 abs 方法
            142 LOAD_FAST                2 (z)   # 載入 z
            145 LOAD_FAST                4 (i)   # 載入 i
            148 BINARY_SUBSCR                    # 獲得 z[i]
            149 CALL_FUNCTION            1       # 執行 abs 方法
            152 LOAD_CONST               6 (2.0) # 載入 2.0
            155 COMPARE_OP               4 (>)   # 將 abd 的執行結果和 2.0 比較
            158 POP_JUMP_IF_FALSE      103       # 根據結果跳到 103

# 後略
```

因爲我們已經將我們的注意力定在了這幾行，所以我略去了前後無關的內容。後面的註釋是我加的，說實話光是註釋就加得累死我了，那問題看來也很顯然了吧。太多重複調用了，非常不科學。

這裏對輸出的每一列的內容做一個介紹，以便理解，從左往右：

1. 對應源碼的行號
2. 當前指令用 `-->` 表示，上面的例子中沒有
3. 有標記的指令用 `>>` 表示
4. 指令地址
5. 指令名
6. 指令傳入參數
7. 解析參數後對應原程序裏的變量名、常量、分支目標和比較符號

至於指令名的具體含義，請參考[官方文檔](http://docs.python.org/library/dis.html#python-bytecode-instructions)。

以上便是「理性主義調優」。我想我必須強調，「過早優化」沒有好處。所以，use it wisely.

{% render_partial documentation/_partials/Python_optimization_serial_TOC.markdown %}
