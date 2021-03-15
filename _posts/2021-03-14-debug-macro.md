---
layout: post
title: 如何驗證 Elixir macro 是否書寫正確
comments: true
categories: [tech, coding, elixir]
tweet_id: 1371284528711483393
---

不少現代編程語言裡都有 REPL，我們用它來快速驗證想法。普通代碼的驗證過程很簡單——輸入 REPL，回車、看結果。但如果是元編程呢？雖然我們還是可以輸入後檢查最終結果，但如果出錯了要想找到 macro 哪個地方有問題，就沒那麼容易了——或者說沒那麼直接，畢竟最後一層代碼是用代碼生成的。我時常在腦中推演代碼時弄不清自己是在 macro 層還是最終層，尤其有多層 `quote` 的時候。如果我能看到最終生成的代碼，或許就更容易推演了。

Debug macro 首先還是得從語言的元編程機制開始。和不少 Lisp 編譯過程類似，Elixir 編譯過程大致是這樣的：

1. 源碼首先被初步編譯成語法樹 AST_1
2. AST_1 被進一步擴展，此時 macro 會被調用，進而生成最終的 AST
3. 最後，將最終的 AST 編譯成字節碼

也就是說 Elixir 的 macro 發生在編譯時、而非運行時[^1]。

知道了 macro 的編譯原理，就可以寫一個小工具幫助我們 debug 了：

```elixir
defmodule DebugMacro do
  defmacro __using__(_) do  # `use`時被調用，以將`final_code/1`注入目標 module
    quote do
      defmacro final_code(ast) do
        ast
        |> IO.inspect(label: "AST_1")     # 打印 AST_1
        |> Macro.expand(__ENV__)          # 對 AST_1 做擴展
        |> IO.inspect(label: "FINAL AST") # 打印最終版 AST
        |> Macro.to_string                # 將最終版 AST 轉化成字符串
        |> IO.puts                        # 打印轉譯宏後的最終代碼
      end
    end
  end
end
```

我們可以用它來查看代碼的最終形態。用法是這樣的：在需要調試 macro 的 module 裡加入`use DebugMacro`[^2]，接著在 iex 裡就可以使用注入的`final_code/1`了。

有幾件事我認為有必要紀錄：
- 被傳進`defmacro/2`的表達式會被自動`quote`
- `defmacro/2`返回值會被`unquote`，即被執行
- 如果想讓`defmacro/2`返回一段代碼，你得返回這段代碼的 AST，也就是`quote`版


## 使用案例

假設我們正在做一個類似於`IO.inspect/2`的 macro，意圖是打印出輸入語句以及它的執行結果，並返回執行結果（以便後續程序使用），我們期盼這樣使用它：

```elixir
iex(8)> Example.exam(1+2+5)
1 + 2 + 5 = 8
8
iex(9)> Example.exam(1 in 0..9)
1 in 0..9 = true
true
iex(10)> 9 in 0..9 |> Example.exam
9 in 0..9 = true
true
```

現在假設我們一開始寫了如下代碼：

```elixir
defmodule Example do
  defmacro exam(ast) do
    ast_str = Macro.to_string(ast)
    quote do
      result = ast
      Example.print(unquote(ast_str), result)
      result
    end
  end

  def print(ast_str, result) do
    IO.puts "#{ast_str} = #{inspect result}"
  end
end
```

運行時會出現：

```elixir
iex(14)> 1 in 0..9 |> Example.exam
** (CompileError) iex:14: undefined function ast/0
    (macro_checker 0.1.0) expanding macro: Example.exam/1
    iex:14: (file)
    (elixir 1.11.3) expanding macro: Kernel.|>/2
    iex:14: (file)
```

我們假設這個例子沒那麼容易一眼看出問題🙃，這個時候就可以請出剛剛的工具了，先加入工具：

```elixir
defmodule Example do
  use DebugMacro # <- 加入這一行

  defmacro exam(ast) do
    ast_str = Macro.to_string(ast)
    quote do
      result = ast
      Example.print(unquote(ast_str), result)
      result
    end
  end

  def print(ast_str, result) do
    IO.puts "#{ast_str} = #{inspect result}"
  end
end
```

在 iex 裡我們就可以這樣查看最終生成的代碼了：

```elixir
iex(14)> 1 in 0..9 |> Example.exam |> Example.final_code
AST_1: ...
FINAL AST: ...
(
  result = ast
  Example.print("1 in 0..9", result)
  result
)
:ok
```

為了減少雜訊，我將`AST_1`和`FINAL AST`都省略了，我們更關心的還是最終代碼的部分。問題現在清晰多了，因為我們期盼的生成代碼應該是：

```elixir
(
  result = 1 in 0..9
  Example.print("1 in 0..9", result)
  result
)
```

所以正確的代碼是：

```elixir
defmodule Example do
  defmacro exam(ast) do
    ast_str = Macro.to_string(ast)
    quote do
      result = unquote(ast)
      Example.print(unquote(ast_str), result)
      result
    end
  end

  def print(ast_str, result) do
    IO.puts "#{ast_str} = #{inspect result}"
  end
end
```

## 結語

這可能是我探索 Elixir 元編程系列博客的開始——很顯然我還有很多東西沒有探知，比如腳註2提到的問題。再比如今天本來想實現一個 `**` 乘方運算 macro 來作為案例的，很湊巧地發現[無法定義](https://stackoverflow.com/questions/30007655/elixir-macro-power-function)，這才發現原來還有個叫“functional pattern matching”的概念。慢慢來吧，很有趣不是嗎？


[^1]: 這使編碼人員相對更容易推演代碼，也使得像 dialyzer 這樣的靜態分析工具能正常工作。運行時的性能當然也不會因為元編程有任何折損，畢竟代碼在進入上面第三步的時候就已經是最終形態了。
[^2]: 我本想做無需有代碼改動、直接呼叫的版本，可是`final_code/1`是一個針對 macro 的工具，就必須先`require`。我目前還不知道如何在多層`quote`下保持初試 AST，所以我想與其在`final_code/1`裡動態加載其他含有 macro 的 module，還不如把這點代碼注入到需要的 module 裡。不過如果你知道怎麼實現，請一定告訴我。
