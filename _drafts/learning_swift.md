# 最近在學 Swift

最近在學習 Swift，根據多年學習語言的經驗，我原以為學習 Swift 應該是個很快的過程，可是我太天真了。一開始我以為它像目前的一些支持 [OOP](https://en.wikipedia.org/wiki/Object-oriented_programming) 和 [FP](https://en.wikipedia.org/wiki/Functional_programming) 的多範式語言一樣，可猝不及防它居然引入了一種新的範式，這就只能慢下來好好研究研究了。因為我覺得學習語言不搞明白它的範式等於是沒學。語法是形，範式才是神。

Swift 可以說是 [Chris Lattner](https://en.wikipedia.org/wiki/Chris_Lattner) 或 Apple 給現代操作系統和編程範式的一個答案。從它的歷史來說，根據最近 ATP 對 Chris 做的一個[訪談](http://atp.fm/episodes/205 "PEOPLE DON'T USE THE WEIRD PARTS")，Apple 內部做了很多努力讓 Objective-C 更好，比如引進 [ARC](https://en.wikipedia.org/wiki/Automatic_Reference_Counting) 增強內存管理，新推一個新語言肯定是最後的選擇。但與此同時 Objective-C 有個問題沒法根除，就是它並不是一個足夠安全的語言，它構建與 C 語言，C 有指針、可定義未初始化的變量、以及數組溢出等等。而剝離 C 又不太現實，最後這才有了後來的 Swift。

Swift 跟其他現代編程語言一樣，有著很多吸引人的語法糖，其精髓也藏在這一大堆語法糖裏。WWDC 2015 和 WWDC 2016 的三個 Keynotes 對其做了揭示：
- [Protocol-Oriented Programming in Swift](https://developer.apple.com/videos/play/wwdc2015/408/)
- [Building Better Apps with Value Types in Swift](https://developer.apple.com/videos/play/wwdc2015/414/)
- [Protocol and Value Oriented Programming in UIKit Apps](https://developer.apple.com/videos/play/wwdc2016/419/)

這是一套組合拳，而且打得很有機。一方面對補足 OOP 的弊端，另一方面也借了 FP 的功力。

OOP 是很優秀的一種編程範式，它很大程度的幫助我們復用代碼，而 OO 的模型也很好地減小了我們大腦對複雜世界構建時的負擔。不過 OOP 並非完美，隨著我們對世界模擬的深入，複雜性也隨之增加。其實 Gary Bernhardt 曾在演講 [Boundaries](https://www.destroyallsoftware.com/talks/boundaries) 裏就總結過我們如何從 PP 到 OOP，再從 OOP 到 FP 的趨勢。這張表格我記憶深刻：


|  | Mutation | Data & Code |
| --- | --- | --- |
| Precedual | Yes | Separated |
| OO | Yes | Combined |
| Functional | No | Separated |

從 PP 到 OOP，我們隱藏了一些不必要的內部結構，但作為補償，我們不得不把數據和代碼（業務邏輯）合併在一起；而數據本身在 PP 和 OOP 裏，是可變的，即變量的傳遞是以 reference。當我們構建的系統越來越複雜時可變性數據會讓我們更難去推理（reasoning）系統的狀態，而數據代碼的不分離又使得我們沒法更好得分離核心業務代碼和外圍代碼，依賴會很多，從而使單元測試更困難。這也是為什麼現在越來越多的語言和框架社區開始思考 FP 的原因。

