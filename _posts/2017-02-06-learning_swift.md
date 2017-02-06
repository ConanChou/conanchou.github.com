---
layout: post
title: "最近在學 Swift"
date: 2017-02-06 00:26
comments: true
categories: [tech, coding]
---

最近在學習 Swift，一開始我以為它像目前的一些支持 [OOP](https://en.wikipedia.org/wiki/Object-oriented%5C_programming) 和 [FP](https://en.wikipedia.org/wiki/Functional%5C_programming) 的多範式語言一樣，可猝不及防它居然引入了一種新的範式，這種範式基於 Java 的 `interface`，但加了更多靈活的創新。我覺得學習語言不搞明白它的範式等於是沒學。畢竟語法是形，範式才是神。這才有了這篇文章。

給沒有耐心讀完的同學一句話概括一下，Swift 的設計基本就鼓勵更多地使用值類型，為了使值類型的應用更具可行性，它引入了比 Java `interface` 更加靈活的 `protocol` 機制。

## Swift 的時代背景

Swift 可以說是 [Chris Lattner](https://en.wikipedia.org/wiki/Chris_Lattner) 或 Apple 給現代操作系統和編程範式的一個答案。從它的歷史來說，根據最近 ATP 對 Chris 做的一個訪談[^1]，Apple 內部做了很多努力讓 Objective-C 更好，包括引進 [ARC](https://en.wikipedia.org/wiki/Automatic%5C_Reference%5C_Counting) 增強內存管理。強推一個新語言肯定是萬不得已的選擇。Objective-C 有個問題沒法根除，就是它並不是一個足夠安全的語言，它構建與 C 語言，C 用指針、可定義未初始化的變量、以及數組溢出的問題等等。而從 Objective-C 中剝離 C 又不太現實，最後這才有了 Swift。

Swift 跟其他現代編程語言一樣，有著很多吸引人的語法糖，其精髓也藏在這一大堆語法糖裏。2015 和 2016 年的 WWDC 有三個 Keynotes 對其做了揭示：

- [Protocol-Oriented Programming in Swift](https://developer.apple.com/videos/play/wwdc2015/408/)
- [Building Better Apps with Value Types in Swift](https://developer.apple.com/videos/play/wwdc2015/414/)
- [Protocol and Value Oriented Programming in UIKit Apps](https://developer.apple.com/videos/play/wwdc2016/419/)

不難看出，它的核心就是 Value 和 Protocol。當然從語法的角度來說，另一個我很讚賞的特徵就是它是一個非常顯式的（explicit）語言。但我不打算在這篇文章裏聊這個，我們還是先來看看 Value 和 Protocol，在聊這倆話題之前，我們先看看我們現在所處的編程語言／範式在歷史裏的位置。


### FauxO

OOP 是很優秀的一種編程範式，它很大程度的幫助我們復用代碼，而 OO 的模型也很好地減小了我們大腦對複雜世界構建時的負擔。不過 OOP 並非完美，隨著我們對世界建模的深入，複雜性也隨之增加。其實 Gary Bernhardt 曾在演講 [Boundaries](https://www.destroyallsoftware.com/talks/boundaries) 裏就總結過我們如何從 PP 到 OOP，再從 OOP 到 FP 的趨勢。這張表格我記憶深刻：

|   | Mutation | Data & Code |
|---|---|---|
| Procedural | Yes | Separated |
| OO              | Yes | Combined |
| Functional  | No  | Separated |

從 PP 到 OOP，我們隱藏了一些不必要的內部結構，但作為補償，我們不得不把數據和代碼（業務邏輯）合併在一起；而數據本身在 PP 和 OOP 裏，是可變的（mutable），即變量的傳遞是以引用（reference）。這就意味著數據是非顯式分享（implicit sharing），當我們構建的系統越來越複雜時可變性數據會讓我們更難去推理（reasoning）系統的狀態，而數據代碼的不分離又使得我們沒法更好得分離核心業務代碼和外圍代碼，依賴會越來越多，從而使單元測試更困難。這也是為什麼現在越來越多的語言和框架社區開始思考 FP 的原因之一。不過就像 Gary 說的一樣，FP 往往在建模方面沒有 OOP 來得更接近人們的思維方式，尤其是在用一個並非為 FP 所設計的編程語言的時候。而另一個考慮 FP 的原因是因為數據的可變性使得多線程程序很難保證沒有 bug。這個理由是人們經常提到的，但是我不認為它是真正的痛點。一些好的併發模型其實也是可以減少併發所致的潛在 bug 的。

如果你看了 Gary 的演講（非常推薦），他其實也提到了經典範式之外的第四種，即沒有 Mutation 但同時邏輯和相關數據是在一起的。他稱它為 FauxO。而恰好，今天我們要聊的範式就跟這 FauxO 相似，至少一部分相似。

### OO 的難點

多態和繼承是支持 OOP 語言必有的語言特性。就像《_松本行弘的程序世界_》裏總結的那樣，目前編程語言有多種繼承方式，優劣可以簡單概括為下表：

| 種類 | 優 | 劣 | 代表語言 |
|---|---|---|
| 单一继承 | 继承关系為簡單树结构 | 無法通過繼承來共享實現（implementation） | Smalltalk |
| 多重继承 | 可用繼承分享實現 | 類關係複雜，繼承的優先順序和功能可能存在衝突 | C++, Python |
| 單繼承 + 接口（Interface） | 類規範定義了方法聲明，從而使類接口相關的編程跟多重繼承一樣 | 無法共享實現 | Java |

其實我還想補充一下 Ruby 裏作為一個賣點的 Mix-in，坦率地說它只是一個較特殊的多重繼承，很大程度地減小了多重繼承的複雜類關係，但是依然存在繼承優先和衝突問題，而一旦衝突發生，它會以非顯式的方式發生。

我們是否能做得跟好呢？我覺得 Chris 的答案很棒。


## Value 和 Protocol

### Value

Swift 裏有除了所有原始類型（primitive type），`enum` 和 `struct` 也都是值類型。所謂值類型，就是這些數據類型不可變（immutable），傳遞進函數或方法的時候，是直接傳入值，即拷貝。跟其相對的是引用類型（reference type），其特徵是可變（mutable），引用式傳遞。前面提過引用類型的問題，那我們似乎就只能更多地使用值類型來規避引用類型的風險了。所以 Swift 將 `enum` 和 `struct` 升級為一等公民，這意味著你也可以對它們進行函數定義，對 `struct` 你還可以定義其內部變量和常量。所以這樣一來，我們幾乎完全可以用它們來代替 `class`。不過看得出來，蘋果官方文檔對於何時使用 `struct` 而非 `class` 的問題還是很克制的，而事實上 Swift 的很多原始類型都是用 `struct` 寫的。我們在寫 Java 代碼時不是經常手動寫不可變類嗎？其實 `struct` 是這種類的語法糖。當然因為它們是 Swift 的設計基礎，所以它不僅僅是語法糖，一般情況下性能方面比我們自己手寫不可變類要好。有了它們，我們這不是離 FauxO 更近了？

### Protocol

Swift 依然是一個面向對象編程語言，不過這幾年的 WWDC 都強調它的 `protocol`。其实 `protocol` 跟 Java 的 `interface` 很像，主要區別在於:

- 可定義字段／屬性，即 _field_
- 可用 `mutating` 定義方法是否會修改實現主
- 可被多元組合（_ protocol composition_）
- 可定義可選方法
- 可被擴展（_ protocol extensions_），從而**共享實現**

當然不一樣的地方很多，我這裡列舉的只是我覺得會導致整個語言地貌不一樣的點。而其中我覺得最重要的就是最後一點。因為它解決了上一章節留下的一個問題，即如何愉快地使用類多重繼承，但同時又可以最大程度上減小多重繼承帶來的問題。Java 的 `interface` 開了個好頭，在此基礎上只要加上實現共享即可。雖然最新的 Java 可以在 `interface` 裏加默認實現，但是它並不像 Swift `protocol` 那樣支持追加式建模（retroactive modeling）。可以說 `protocol` 在加以限制的基礎上最大限度地開放了自由度。默認實現方面可能唯一需要注意的是 `protocal` 裏定義的方法並不具有 `class` 的多態性。畢竟它可能會被 `enum` 或 `struct` 使用。

那我來再加一行：

| 種類 | 優 | 劣 | 代表語言 |
|---|---|---|
| 单一继承 | 继承关系為簡單树结构 | 無法通過繼承來共享實現（implementation） | Smalltalk |
| 多重继承 | 可用繼承分享實現 | 類關係複雜，繼承的優先順序和功能可能存在衝突 | C++, Python |
| 單繼承 + 接口（Interface） | 定義了方法簽名，從而使類接口相關的編程跟多重繼承一樣 | 無法共享實現 | Java |
| 單繼承 + 協議（Protocol） | 定義了方法簽名或聲明，從而使類接口相關的編程跟多重繼承一樣 | 暫時未發現，請發現的朋友賜教 | Swift |

### 例子

我本想自己寫一些例子，不過我覺得[Protocol-Oriented Programming in Swift](https://developer.apple.com/videos/play/wwdc2015/408/)的例子其實很到位，尤其是他提供的 Playground 文件裏，有詳細的解說。所以這讓我原先寫個案例分析的安排顯得多餘，或許在之後我的項目裏有些心得我會專門寫一寫吧。不過原版的是 Swift 2 的，新版 Swift 不兼容，改一下並不困難，但網上也可以找到有別人改好的版本。

下面貼一下我改過的例子，你可以直接用 Playground 跑這些代碼。

```swift
import CoreGraphics
import UIKit
import PlaygroundSupport
let twoPi = CGFloat(M_PI * 2)

//: 先創建一個 protocol 類型來定義一些基本圖型命令
protocol Renderer {
    // 移動畫筆位置，但並不會在畫布上添加任何像素
    func move(to position: CGPoint)

    // 從當前點畫一條直線到參數點，並把畫筆位置更像至參數點位置
    func addLine(to point: CGPoint)

    // 畫圓弧
    func addArc(center: CGPoint, radius: CGFloat,
                startAngle: CGFloat, endAngle: CGFloat)
}

//: 測試用 `Renderer`
//:
//: 它並不會真的 render 圖像，而是在命令行裏輸出作圖過程。這在開發時很管用，
//: 而且很多時候光從圖像上是看不出是否有問題的，比如下面嵌套圖型的例子。
struct TestRenderer : Renderer {
    func move(to p: CGPoint) { print("moveTo(\(p.x), \(p.y))") }

    func addLine(to p: CGPoint) { print("lineTo(\(p.x), \(p.y))") }

    func addArc(center: CGPoint, radius: CGFloat,
                startAngle: CGFloat, endAngle: CGFloat) {
        print("arcAt(\(center), radius: \(radius)," +
            " startAngle: \(startAngle), endAngle: \(endAngle))")
    }
}

//: 下面我們來構建圖型
protocol Drawable {
    // 將 `self` 傳給 `renderer` 使其顯示
    func draw(_ renderer: Renderer)
}

//: 定義多邊形和圓形
struct Polygon : Drawable {
    func draw(_ renderer: Renderer) {
        renderer.move(to: corners.last!)
        for p in corners { renderer.addLine(to: p) }
    }
    var corners: [CGPoint] = []
}

struct Circle : Drawable {
    func draw(_ renderer: Renderer) {
        renderer.addArc(center: center, radius: radius,
                        startAngle: 0.0, endAngle: twoPi)
    }
    var center: CGPoint
    var radius: CGFloat
}

//: 定義 `Diagram`，其本質是一對 `Drawable`s
struct Diagram : Drawable {
    func draw(_ renderer: Renderer) {
        for f in elements {
            f.draw(renderer)
        }
    }
    mutating func add(other: Drawable) {
        elements.append(other)
    }
    var elements: [Drawable] = []
}

//: ## 追加式建模（Retroactive Modeling）
//:
//: Here we extend `CGContext` to make it a `Renderer`.  This would
//: not be possible if `Renderer` were a base class rather than a
//: protocol.
//: 這裏我們對 `CGContext` 進行擴展使其成為 `Renderer`。
//: 如果我們一開始沒有用 `protocol` 而是 `class` 的話，這裏是沒法擴展的
extension CGContext : Renderer {
    func addArc(center: CGPoint, radius: CGFloat, startAngle: CGFloat,
                endAngle: CGFloat) {
        let arc = CGMutablePath()
        arc.addArc(center: center, radius: radius, startAngle: startAngle,
                   endAngle: endAngle, clockwise: true)
        addPath(arc)
    }
}

var circle = Circle(center: CGPoint(x: 187.5, y: 333.5), radius: 93.75)

var triangle = Polygon(corners: [
    CGPoint(x: 187.5, y: 427.25),
    CGPoint(x: 268.69, y: 286.625),
    CGPoint(x: 106.31, y: 286.625)])

var diagram = Diagram(elements: [circle, triangle])

//: ## 嵌套圖型
//:
//: 如果 `Diagram` 是引用式傳遞的話，嵌套會導致無限遞歸。而值傳入就沒問題。
//: 這裏為了能夠在圖型界面看出兩次作圖，我們將嵌入的圖縮小顯示。
struct ScaledRenderer : Renderer {
    let base: Renderer
    let scale: CGFloat

    func move(to p: CGPoint) {
        base.move(to: CGPoint(x: p.x * scale, y: p.y * scale))
    }

    func addLine(to p: CGPoint) {
        base.addLine(to: CGPoint(x: p.x * scale, y: p.y * scale))
    }

    func addArc(center: CGPoint, radius: CGFloat,
                startAngle: CGFloat, endAngle: CGFloat) {
        let scaledCenter = CGPoint(x: center.x * scale, y: center.y * scale)
        base.addArc(center: scaledCenter, radius: radius * scale,
                    startAngle: startAngle, endAngle: endAngle)
    }
}

// 定義一個可以縮放 `Base` 實例的 `Drawable`，而 `Base` 也是一個 Drawable
struct Scaled<Base: Drawable> : Drawable {
    var scale: CGFloat
    var subject: Base

    func draw(_ renderer: Renderer) {
        subject.draw(ScaledRenderer(base: renderer, scale: scale))
    }
}


// 定義畫布
let drawingArea = CGRect(x: 0.0, y: 0.0, width: 375.0, height: 667.0)

// `CoreGraphicsDiagramView` 是 `UIView`。
// 它會調用用戶定義的方法來在 `CGContext` 上生成淺藍色筆觸圖型。
class CoreGraphicsDiagramView : UIView {
    override func draw(_ rect: CGRect) {
        if let context = UIGraphicsGetCurrentContext(){
            context.saveGState()
            draw(context)

            let lightBlue = UIColor(red: 0.222, green: 0.617,
                                    blue: 0.976, alpha: 1.0).cgColor
            context.setStrokeColor(lightBlue)
            context.setLineWidth(3)
            context.strokePath()
            context.restoreGState()
        }
    }

    var draw: (CGContext)->() = { _ in () }
}

// 在 playgroud 裏添加 `CoreGraphicsDiagramView`
public func showCoreGraphicsDiagram(title: String,
                                    draw: @escaping (CGContext)->()) {
    let diagramView = CoreGraphicsDiagramView(frame: drawingArea)
    diagramView.draw = draw
    diagramView.setNeedsDisplay()
    PlaygroundPage.current.liveView = diagramView
}


// 現在我們把 `diagram` 自己添加進自己
diagram.elements.append(Scaled(scale: 0.3, subject: diagram))

// 按 shift-cmd-Y 看命令行輸出
diagram.draw(TestRenderer())

// 按 opt-cmd-Return 看圖型輸出
showCoreGraphicsDiagram(title: "Diagram") { diagram.draw($0) }

```

原先的 playground 裏，作者其實把跟定義畫布相關的那部分代碼藏在了一個單獨的文件裏。我在上面的例子裏把它搬了出來，這樣一方面讀者可以直接複製粘貼這段代碼就可以把玩，另一方面它也很好地展示了在一個並非純淨的 POP 世界裏，POP 如何跟 OOP 交互。

## 結語

Swift 是一門設計精良的語言，它的設計初衷就是引導程序員寫出更好的代碼，使代碼更加顯式，更少模稜兩可。Andy Matuschak 在他的演講[^2]裏也提到了，我們寫 Swift 代碼就是一個遊戲，每個程序都有 Object 層和 Value 層，我們能放越多東西進 Value 層越好。Value 和 Protocol，這就是 Swift 給我們的最具價值的東西。

另外，文中提到的各種演講視頻都非常有價值，比看我這篇文章值 100 倍。

[^1]:	[205: PEOPLE DON'T USE THE WEIRD PARTS](http://atp.fm/episodes/205)

[^2]:	[Controlling Complexity in Swift — or — Making Friends with Value Types](https://realm.io/news/andy-matuschak-controlling-complexity/)
