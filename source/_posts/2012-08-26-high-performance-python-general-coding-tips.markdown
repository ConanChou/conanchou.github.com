---
layout: post
title: "Python 調優筆記·經驗主義調優"
date: 2012-08-26 14:56
comments: true
categories: [Python, Optimization, Serial, Programming]
---

[上一次我們聊了「理性主義」](http://conanchou.github.com/blog/Python/Optimization/Serial/Programming/2012/08/26/python-optimization-3-disassembling/)，與其相對的哲學流派就是「經驗主義」了，在 Python 的調優中，我們自然也有從前人流傳下來的小技巧來使代碼的效率更高。在優化工作當中，這兩類方式往往是交替使用的。而且廣義地說，流派不一樣不代表它們對同一件事情的看法就是矛盾的。事實上流派不一樣僅僅是研究方式不一樣，最後結論往往是一致的。本文則將重點放在「經驗主義調優」，收集儘可能多的小技巧。預料中會有補充。<!--more-->

在列舉各種「術」之前，先說「道」（術指具體做事的方法，道指做事的原理）。領悟了道之後才能在不同情況下做出正確的選擇。一般而言，調優無非在兩方面做優化：時間複雜度和空間複雜度。有時候時間和空間會互相矛盾，而這個時候就不得不在它們中做取捨。不同的應用取捨的決定因素是不一樣的。不過就目前而言，因爲空間越來越廉價，時間越來越寶貴，大部分時候人們會偏向與用空間換時間。當然也有兩者不矛盾的時候，這個時候肯定是綜合複雜度越小越好。除了空間、時間複雜度的取捨之外，還有一個可讀性的問題，實際上有時候爲了優化代碼，可讀性會下降不少。所以這個也是個要權衡的方面。

從複雜度的角度說，選擇的優先級按下面的排列：

$$O(1)>O(\log n)>O(n\log n)>O(n^2)>O(n^3)>O(n^k)>O(k^n)>O(n!)$$

在 Python 中，對 `list`{:lang="python"}、`collections.deque`{:lang="python"}、`set`{:lang="python"}、`dict`{:lang="python"} 的各種操作的時間複雜度可以在[這裏找到](http://wiki.python.org/moin/TimeComplexity)。

下面我就羅列各種「前人的經驗」。其實記住就可以，不過我還是用簡短的描述大致解釋一下原因,便於更加深刻地理解 Python 內部。有興趣的話其實可以用[「理性主義」的分析方法](http://conanchou.github.com/blog/Python/Optimization/Serial/Programming/2012/08/26/python-optimization-3-disassembling/)來看看下面的這些「經驗」。

- ### `dict`{:lang="python"} > `list`{:lang="python"}

`dict`{:lang="python"} 的數據結構是 Hash Table，查找的時間複雜度 是$$O(1)$$；而 `list`{:lang="python"} 的數據結構是 Array，查找的時間複雜度是 $$O(n)$$。

- ### `dict[]`{:lang="python"} > `dict.get()`{:lang="python"}

前者叫「直接獲取」，如果 `key`{:lang="python"} 超出了範圍會報錯；而後者是通過 `dict`{:lang="python"} 的方法調用，如果超出 `key`{:lang="python"} 範圍，它會將默認值賦給剛剛查詢的 `key`{:lang="python"}。顯然 `get()`{:lang="python"} 做了很多事情，慢一些是預料之中的。

這裏插一句題外話。有時候你確實需要類似 `get()`{:lang="python"} 所提供的效果，即這種容錯性，有些程序員傾向於用 `try...except...`{:lang="python"} 和 `dict[]`{:lang="python"} 來實現。在以前，這兩者在運行速度上區別還比較大，新版本的 Python 在這兩種方案下表現得比較一致，只有 10% 的性能差異。所以在這種情況下用 `dict.get()`{:lang="python"} 其實是個不錯的選擇。

- ### `set`{:lang="python"} > `list`{:lang="python"}

前者與生俱來的 `|`{:lang="python"} (union)、`&`{:lang="python"} (intersection) 和 `-`{:lang="python"} (difference) 運算就比 `list`{:lang="python"} 的迭代式效率高。所以涉及到 `list`{:lang="python"} 的這三種運算，最佳方案是轉成 `set`{:lang="python"} 再用相應的 `set`{:lang="python"} 運算符計算，最後再轉到 `list`{:lang="python"}。例如：

{% codeblock lang:python %}
list(set(list_a) | set(list_b))
{% endcodeblock %}

- ### `str.join()`{:lang="python"} > `str + str + str`{:lang="python"}

Python 字符串都是不可變的類型，任何類似改變字符串的操作其實都得拷貝原字符串。後者的連加其實是要做多次字符串相加運算的，而前者只要一次。不過就單次的速度而言，在 2.7 以上版本的 Python 中，兩者的區別已經不是很大。

- ### 字符串格式化 `%`{:lang="python"} > `str + str + str`{:lang="python"}

寫習慣了 PHP 的話很容易就愛後一種方式，但是跟上面一條說的原因差不多，用格式化 `%`{:lang="python"} 的方式要高效一些。

- ### 自帶函數 > 正則表達式

Python 字符串自帶了不少有用的方法可以取代正則表達式。比如那些 `is` 開頭的方法以及 `with` 結尾的方法。具體的列表可以查看 pydoc：

{% codeblock lang:bash %}
$ pydoc str
{% endcodeblock %}

- ### 自帶 `sort`{:lang="python"} > 自寫排序算法

如果你不確定你自己寫的算法真的優於 Python 內置的 `sort`{:lang="python"} 方法，那還是使用內置的。因爲 Python 的 `sort`{:lang="python"} 其實會因爲不同的數據類型、甚至根據數據的長度，選擇最優的排序方式。有興趣的話可以去看一看 CPython 有關 `sort`{:lang="python"} 的源碼。

其實大多數自帶函數的效率都比較高，甚至 `add()`{:lang="python"} 都要比 `+`{:lang="python"} 快。所以儘量使用 Python 自帶的函數。

- ### `list`{:lang="python"} comprehensions > 循環

`list`{:lang="python"} comprehensions 的運行是 CPython 的底層層面的，而一般的循環是在 VM 裏面跑的。很顯然前者要更優。

- ### `map`{:lang="python"} > 循環

跟 `list`{:lang="python"} comprehensions 的情況一樣，運算會被推到 C 層面，比 VM 裏跑的效率高。

- ### 局部變量 > 全局變量

這個尤其要在循環裏注意，就是[本系列第二篇](http://conanchou.github.com/blog/Optimization/Programming/Python/Serial/2012/07/25/python-optimization-2-profiling/)裏我們找到的問題。Python 對局部變量的訪問效率要比全局變量的訪問效率高。另外，如果是一些帶「點」的方法，最好也放到循環的外面，因爲每次「點」，相應的方法都要再 `eval`{:lang="python"} 一遍。因此應該像下面這樣寫：

{% codeblock lang:python %}
def func():
    upper = str.upper
    newlist = []
    append = newlist.append
    for word in oldlist:
        append(upper(word))
    return newlist
{% endcodeblock %}

當然，在可以用 `list`{:lang="python"} comprehensions 和 `map`{:lang="python"} 的情況下，優先考慮使用這些。

- ### 懶惰 > 勤勞

這裏的「懶惰」指 Lazy Evaluation，在 Python 中，我目前知道條件判斷和 2.x 中的 `xrange`{:lang="python"} (即 3.x 中的 `range`{:lang="python"})。

所以在類似 `if a and b`{:lang="python"} 的語句裏，`a` 會被先判斷，如果是 `False`{:lang="python"}，`b` 的運算就被直接跳過了。因此在寫程序時應該把運算量大的部分寫在靠後的部分。

`xrange()`{:lang="python"} 不會在運行時就在內存中產生一個 `list`{:lang="python"}，而是在用的時候臨時算出來。看下面的例子：

{% codeblock lang:python %}
>>> r = range(10)
>>> r
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> xr = xrange(10)
>>> xr
xrange(10)
>>> print r[3]
3
>>> print xr[3]
3
>>> iterator = iter(xr)
>>> print xr
xrange(10)
>>> print iterator
<rangeiterator object at 0x7fbbed1123f0>
>>> print iterator.next()
0
{% endcodeblock %}

- ### `()`{:lang="python"} > `[]`{:lang="python"}

前者不可變，後者可變，生成的時間前者更短。

- ### `is`{:lang="python"} > `==`{:lang="python"}

`is`{:lang="python"} 是比較對象，`==`{:lang="python"} 是比較對象裏的值。很顯然 `==`{:lang="python"} 要做的事情要稍微多一點。所以在能夠用 `is`{:lang="python"} 的時候要用 `is`{:lang="python"}

- ### 1 > `True`{:lang="python"}

Python 裏的 `bool` 也是繼承自 `int`，單純從運行效率來說，用 `int`{:lang="python"} 代替 `bool`{:lang="python"} 更好。可是可讀性會變差。

- ### `a > b > c`{:lang="python"} > `a > b and b > c`{:lang="python"}

類似 `map`{:lang="python"} 的情況，前者被放到更底層算，而後者還停留在 VM 內，效率自然有所差異。

- ### 循環放在方法裏 > 循環裏調方法

假設我們現在有個 `list`{:lang="python"} 需要對其內容一一處理，在你面前是兩條路（假設不用 `list`{:lang="python"} comprehensions 之類更好的方式），一條是將 `list`{:lang="python"} 傳進專門處理的方法，然後在方法內循環處理裏面的元素；另一條是遍歷此 `list`{:lang="python"}，然後將單個的元素用一個方法去做處理。這兩者間前者比較好，因爲 Python
的方法調用還是需要較多的開銷的。看例子，首先是循環裏調方法：

{% codeblock lang:python %}
x = 0
def doit(i):
    global x
    x = x + i

list = xrange(100000)
for i in list:
    doit(i)
{% endcodeblock %}

改成下面這樣更好

{% codeblock lang:python %}
x = 0
def doit(list):
    global x
    for i in list:
        x = x + i

list = xrange(100000)
doit(list)
{% endcodeblock %}

- ### 減少重複 `import`{:lang="python"}

有時候我們將 `import`{:lang="python"} 放在一個方法的開頭以此來縮小模塊的可用範圍或加快程序的啓動速度。而 Python 也足夠聰明可以防止多次導入相同的庫。但是 `import`{:lang="python"} 本身還是需要開銷一些時間的，無論是不是重複的。所以如果某個方法會被多次調用，最好將 `import`{:lang="python"} 放到方法外面。

- ### 方法重定向 > `if`{:lang="python"}

假設我們有這麼一種情況：

{% codeblock lang:python %}
class Test:
    def check(self,a,b,c):
        if a < 50:
            self.str = b*100
        else:
            self.str = c*100

a = Test()
def example():
    for i in xrange(0,100000):
        a.check(i,"b","c")
{% endcodeblock %}

初看這段代碼沒什麼問題，但是如果仔細看，`if`{:lang="python"} 用得很單調。前 50 個也就算了，但是後面的 99950
次 `if`{:lang="python"} 開銷就很大了。如果能省去這些 `if`{:lang="python"} 速度會好很多。這裏其實可以用方法重定向來提高效率：

{% codeblock lang:python %}
class Test:
    def check(self,a,b,c):
        self.str = b*100
        if a >= 50:
            self.check = self.check_post
    def check_post(self,a,b,c):
        self.str = c*100

a = Test()
def example():
    for i in xrange(0,100000):
        a.check(i,"b","c")
{% endcodeblock %}


{% render_partial documentation/_partials/Python_optimization_serial_TOC.markdown %}
