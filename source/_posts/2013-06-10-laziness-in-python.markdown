---
layout: post
title: "蟒之惰性"
date: 2013-06-10 18:06
comments: true
categories: [Python]
---

[上一篇日誌](http://conanchou.github.io/blog/thought/2013/06/09/just-in-case-vs-just-in-time/)其實是發生在我研究了一些 lazy evaluation 之後，有感而發；最初我本來只是想寫現在的這篇博客的，聊一聊 Python 的惰性。如果對編程語言以及編程思想的惰性的定義還不明的話，可以參看我的上篇日誌以及 Wikipedia。

Python本身是具有惰性的，我在[《Python 調優筆記 · 經驗主義調優》](http://conanchou.github.io/blog/python/optimization/serial/programming/2012/08/26/python-optimization-4-high-performance-python-general-coding-tips/)的「懶惰>勤勞」小節就已經說了一些。我們接下來要看看Python中更高級一點的惰性用法。<!--more-->

Generator
=========

我不知道是不是應該給這個專有名詞硬塞上一個中文翻譯，但如果需要的話，我覺得叫生產器吧。它就像是個手動絞肉機，需要肉末的時候就搖一下，不需要了也就停在剛剛的狀態。假設我們現在有個 function，它的作用是輸出0到9999之間的數被幾個不明操作之後的數的列表。那我們有可能這樣寫：

```python
def range10000():
    l = []
    for i in range(10000):
        l.append(f2(f1(i)))
    return l
```

邏輯上來說這個程序沒什麼問題，但是不是可以做得更好呢？可以用 lambda 和 list comprehension 來一行代碼解決，這麼做好在哪裏呢？技術上來說 list comprehension 的效率比顯式循環體高，從逼格角度說更接近函數式編程。那能不能做得更好一些呢？假設之後的代碼中只需要`range10000()`生產出的list的前十個。也就是說後面的9980個運算是浪費資源的。即便`f1()`和`f2()`的複雜度都是O(1)，這也是莫大的浪費。要是能夠推遲`range10000()`的運算就好了。所以這裏我們就可以使用惰性求值的小技巧，具體來說，我們將用到關鍵詞`yield`：

```python
def lazy_range10000():
    for i in range(10000):
        yield f2(f1(i))
```

之後的調用：

```python
>>> g = lazy_range10000()
>>> g
<generator object lazy_gen at 0x7f2e47ba43c0>
>>> g.next()
0
>>> g.next()
1
>>> g.next()
2
```

從這個簡單的例子我們可以看出`yield`在此起到的作用是返回一個 Generator 對象，而這個對象會記住自己的狀態，在這個例子裏就是循環體循環的次數。每次調用`next()`時，才會做真正的計算。換句話說，這個技巧是推遲了計算的執行，即惰性求值。這麼一來，不但不會浪費CPU計算資源，也不會因爲要存儲額外數據而造成的內存空間的浪費。第一個例子主要還是體現了在CPU資源上的節約，下面我們再舉一個更加極端的例子來感受一下，生成無限多的連續數：

```python
def infinitely_inc(start=0):
    n = start - 1
    while True:
        n += 1
        yield n
```

對 Python 內建函數比較瞭解的同學應該是注意到了 Generator 對象的 `next()`，它跟 iterator 類型是一樣的，遵從 _Iterator protocol_，即有`next()`和`__iter__()`函數，會拋`StopIteration`異常。而且，跟list一樣，它也有類似list comprehension 的寫法，區別僅在於把list comprehension 的`[]`換成`()`：

```python
>>> squares = [i*i for i in range(10)] # list
>>> type(squares)
<type 'list'>
>>> gen_squares = (i*i for i in range(10)) # Generator 對象
>>> type(gen_squares)
<type 'generator'>
>>> iter(gen_squares) is gen_squares
True
```

Generator 看起來是個好物，但是它也有自己的使用注意事項，這裏我主要說一說除了惰性求值共性問題（見[上一篇日誌](http://conanchou.github.io/blog/thought/2013/06/09/just-in-case-vs-just-in-time/)）之外的注意事項。

第一點非常淺顯易懂，Generator 產生的序列只能使用一次，也就是說，如果生成的序列需要多次使用的話，還是選擇`list`。不要硬用 Generator，強扭的瓜不甜，你懂的。

第二點比較 tricky。就是要注意變量的作用域。下面我直接上一段代碼，想一下輸出結果是什麼：

```python
def add(s, x):
    return s + x
def gen():
    for i in range(4):
        yield i
base = gen()
numbers = [1, 10]
for n in numbers:
    base = (add(i, n) for i in base)
print list(base)
```

猜`[11, 12, 13, 14]`的同學，恭喜你們成功跳進了陷阱。上面代碼的運行結果是`[20, 21, 22,
23]`。不信貼到自己的環境裏跑跑看。爲什麼呢？`numbers`裏的`1`壓根不見了？其實是因爲直到最後一句`list(base)`的時候運算才被出發，而此時本地變量`n`已經循環到了最後一個，即`10`。又因爲有兩個數字要加，就變成了把10加了兩遍。理解這個過程的難點在於，要時刻提醒自己惰性求值發生的時間點在哪裏，以及它所記住的狀態（或變量）都包含哪些。下面爲了方便理解，我貼一個本程序跑的時候在內存裏的慢動作，還沒弄明白的同學可以一步一步看：

<iframe width="960" height="600" frameborder="0" src="http://pythontutor.com/iframe-embed.html#code=def+add(s,+x)%3A%0A++++return+s+%2B+x%0A%0Adef+gen()%3A%0A++++for+i+in+range(4)%3A%0A++++++++yield+i%0A++++++++%0Abase+%3D+gen()%0Anumbers+%3D+%5B1,+10%5D%0Afor+n+in+numbers%3A%0A++++base+%3D+(add(i,+n)+for+i+in+base)%0Aprint+list(base)&cumulative=false&heapPrimitives=false&drawParentPointers=false&textReferences=false&showOnlyOutputs=false&py=2&curInstr=0"> </iframe>

Generator 惰性求值玩脫了怎麼破？其實原理上來說很簡單，上面的問題就是因爲我們希望 Generator 記住的東西沒記住，那我們只要讓它記住不就完了？所以我們可以給`add()`寫個 wrapper，把要傳進去的`x`的狀態記住：

```python
def add(s, x):
    return s + x

def gen():
    for i in range(4):
        yield i

def add_wrapper(base, num):
    for i in base:
        yield i + num

base = gen()
numbers = [1, 10]
for n in numbers:
    base = add_wrapper(base, n)
print list(base)
```

以上便是如何用 Generator 來寫內存高效的代碼的簡介。僅僅是一窺，有興趣的同學可以去多搜一搜相關詞條以及翻閱《Core Python Programming》的相關章節。帶着對惰性求值的初步瞭解，我們接着將看一看 Python 給我們準備了什麼樣的語法糖做禮物。

`itertools`
===========

這是一個[Python 模塊](http://docs.python.org/2/library/itertools.html)，它的出現是受啓發於 APL，Haskell 和 SML 這些在函數式編程世界中有深遠意義的語言。Laziness 自然也被傳承下來。我們不妨先通過一些簡單的例子來對比一下普通和惰性兩種方法，以及`itertools`的用法。更多更詳細的資料還請看官方文檔。

假設我們現在要找到100以內前10個可以被3整除或可以被7整除的數。普通版我們可能會這麼做：

```python
In [1]: def my_filter(x):
   ...:     print 'Checking %d' % x
   ...:     return x % 3 == 0 or x % 7 == 0
   ...: 

In [2]: filter(my_filter, xrange(100))[:10]
Checking 0
Checking 1
Checking 2
Checking 3
# ...
# 因篇幅較長已被省略
# ...
Checking 98
Checking 99
Out[2]: [0, 3, 6, 7, 9, 12, 14, 15, 18, 21]
```

惰性版：

```python
In [3]: from itertools import islice, ifilter

In [4]: first_ten = islice(ifilter(my_filter, xrange(100)), 0, 10)

In [5]: type(first_ten)
Out[5]: itertools.islice

In [6]: for i in first_ten:
   ....:     print i
   ....:     
Checking 0
0
Checking 1
Checking 2
Checking 3
3
Checking 4
Checking 5
Checking 6
6
Checking 7
7
Checking 8
Checking 9
9
Checking 10
Checking 11
Checking 12
12
Checking 13
Checking 14
14
Checking 15
15
Checking 16
Checking 17
Checking 18
18
Checking 19
Checking 20
Checking 21
21
```

代碼上來說主要是`In [2]`和`In [4]`的區別，即`filter()`換成了`ifilter()`，`[:10]` slicing 的方法換成了函數`islice()`的方法。那最終效果上來說呢，結果都是預計的結果，但是前者測試了很多多餘的數字。

這篇日誌剛開始的時候我們自己寫過一個無限自增生成器。那其實`itertools`裏有個`count()`就是幹的這事兒。所以我們接着上面的例子，求8964之後的10個能被3整除或能被7整除的數：

```python
In [7]: from itertools import count

In [8]: first_ten = islice(ifilter(my_filter, count(8964)), 0, 10)

In [9]: list(first_ten)
Checking 8964
Checking 8965
Checking 8966
Checking 8967
Checking 8968
Checking 8969
Checking 8970
Checking 8971
Checking 8972
Checking 8973
Checking 8974
Checking 8975
Checking 8976
Checking 8977
Checking 8978
Checking 8979
Checking 8980
Checking 8981
Checking 8982
Checking 8983
Checking 8984
Checking 8985
Out[9]: [8964, 8967, 8970, 8973, 8974, 8976, 8979, 8981, 8982, 8985]
```

分組處理的操作我們平時也經常做，`itertools`裏就有個很好的函數叫`groupby()`，不過它的使用還有個注意事項。比如我們現在要將一堆數字分到奇偶兩個組裏。感覺這樣做應該沒問題：

```python
In [10]: from itertools import groupby

In [11]: def groupby_odd_even(numbers):
   ....:     odd_even_filter = lambda x: 'even' if x % 2 == 0 else 'odd'
   ....:     num_groups = groupby(numbers, odd_even_filter)
   ....:     for k, v in num_groups:
   ....:         print '%s: %s' % (k, ','.join(map(str, v)))
   ....:         

In [12]: groupby_odd_even([1,3,5,2,7,4,6])
odd: 1,3,5
even: 2
odd: 7
even: 4,6

```

從結果看，這個`groupby()`看起來不太對，怎麼出現了多組奇偶數呢？原因是因爲`groupby()`只組合 list 裏相鄰近的個體。所以如果要把組合併到一起，可以先把每個元素按組標排序，然後再分組：

```python
In [13]: def groupby_odd_even(numbers):
   ....:     odd_even_filter = lambda x: 'even' if x % 2 == 0 else 'odd'
   ....:     num_groups = groupby(sorted(numbers, key=odd_even_filter), odd_even_filter)
   ....:     for k, v in num_groups:
   ....:         print '%s: %s' % (k, ','.join(map(str, v)))
   ....:         

In [14]: groupby_odd_even([1,3,5,2,7,4,6])
even: 2,4,6
odd: 1,3,5,7
```

寫到這兒也差不多了，這篇日誌的主要目的也就是想說 Python 的惰性、原理以及惰性相關的語言特性。這方面的知識和信息還有很多，有興趣的同學可以把這篇日誌當起點繼續研究，這只是拋磚引玉。舉最後一個不加解說的例子，展示一下其它一些我沒介紹過的函數作爲結尾：

```python
In [15]: from itertools import ifilter, takewhile, count, imap, chain

In [16]: def factors(n):
   ....:     return ifilter(lambda x: n % x == 0, takewhile(lambda y: y <= n, count(1)))
   ....: 

In [17]: reduce(lambda x, y: x.intersection(y), map(set, imap(factors, [9,15,81,60])))
Out[17]: set([1, 3])

In [18]: set(chain.from_iterable(imap(factors, [9,15,81,60])))
Out[18]: set([1, 2, 3, 4, 5, 6, 9, 10, 12, 15, 81, 20, 27, 60, 30])
```
