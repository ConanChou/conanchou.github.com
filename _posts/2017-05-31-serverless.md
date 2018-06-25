---
layout: post
title: Serverless
comments: true
categories: [tech, serverless, architecture]
---

長週末的期間，我跟進了一下關於 Serverless 的新動向，動手做了一些小項目來加深對目前工具、方法和社區的了解，當然也順便搞定了 Clojure 在 Serverless 環境下的配置方法。跟一年前相比，目前的工具鏈、服務平台，越發成熟了。年前跟盎可交流的時候說要用 Serverless 做的一個項目，當時看還有很多可行性的顧慮，如今我對它很有信心。

## 起源和發展

Serverless 又是一個類似 NoSQL 一樣誤導人的名字。其實把它叫做 FaaS（Function as a Service）更合適，私以為這是函數式編程對當今計算世界的另一個餽贈（手裡是錘子，看啥都是釘子）。不過言歸正傳，從一定距離看最近這十多年軟件行業，我意識到一個規律：**一切能用軟件完成的事情，人們會不惜一切代價把它變成軟件**。硬件也逃離不了這個命運，像各種虛擬機，從編程語言運行環境的虛擬化，到 OS 虛擬化，再到通信連路的虛擬化，它們實際上都是在模擬硬件。這種事情初聽起來像是脫褲子放屁，何況這類技術初期都有很多性能問題，可為什麼人們還是孜孜不倦地繼續注入智力呢？多年前淺薄如我，沒有看到短週期快速迭代的魅力，習慣 REPL[^1] 之後有一天頓悟了，這不就是硬件軟件化所帶來的最大優勢嘛。隨之而來還有非常吸引人的自動化／可編程化。所以當我看到 OpenAI 在遊戲裡練習自動駕駛，我就非常確信這個領域的發展會再加速。當然，可能當時人們並沒有意識到這些利好，當時眼下要做的事情只是多加一個間接層，因為“所有計算機領域的問題都可以通過加間接層來解決”，當初問題可能是跨平台。

回到 FaaS，我們不得不提比它早出現一些時間的 DevOps 運動和 Microservice。當然這兩件事情都是站在了虛擬化技術這個巨人的肩膀上。前者講求**開發、測試、運維人員身份統一，或至少能界線模糊**；後者講求**將業務邏輯切分成近乎可丟棄的小型網絡服務**。雖然 DevOps 運動沒有明確提倡 Microservice，但這幾乎成為標配，原因很簡單，開發人員盤子裡的菜更多了，能吃的量有限，縮小規模有助於有效迭代，又或不迭代、直接重寫。這兩件事隨後產生了一系列有趣的反應。

首先職責界線模糊會迫使軟件開發者和運維人員更多的溝通協作，這催熟了很多運維工具鏈和服務平台。多年來在很多公司裡，運維人員的工作相對沒那麼多變——一旦初期平台搭建穩定後，便不需要做太多事情，之後的工作僅僅是監測和維護。但是越來越多以科技為主導的公司無法滿足於一塵不變的硬件基礎設施，運維要跟得上開發的日新月異。讓我認識到這個現狀的還是不久前的一段小插曲。我之前所在公司的老上司加入了一家管理著300～400億美元的對衝基金，主管架構／基礎設施。我幫他做過一個數據中心 SDN 項目，當時 SDN 的版圖還不明朗，我們算是第一批吃螃蟹的人，最後項目很成功，合作很愉快，他便邀請我加入他的新冒險。在交流[^2]過程中我得知，因為他們的體量大，計算資源一方面短缺，一方面也不夠靈活。常常出現一個小組的資源不夠用，而另一個小組有富餘；又或是一天收到十多個小組的架構變更需求。他們原先的運維團隊還比較傳統，有大量對網絡協議、Linux 內核了解透徹卻缺乏大型軟件開發經驗的人員。但是新的需求已經不僅僅是搭建並維護起基礎設施供各個模型團隊用，更多的是要基礎設施更具彈性和靈活性。要做到這一點，開發者和運維人員就需要有足夠的信息交流，無論是人與人間的還是代碼層面的。因此架構代碼化和可被代碼化（自動化）的架構在這個情境下變得至關重要，代碼是這種信息交流的精確媒介。而這也是為什麼在他們公司傳統運維工程師需要更多軟件技能，而軟件工程師也同樣需要了解必要的架構知識。

其次是 Microservice，它的進展不只如此，新的 FaaS 外衣讓它脫胎換骨。坦白說，它跟多年前討論的 SOA 沒有什麼本質區別。只是服務更小巧專精，但該有的還是都有——麻雀雖小五臟俱全。不難想像，一個網絡服務開發者不得不開始學習和考慮CAP、負載均衡、SDP（service discovery protocol）等等，當然也或者是運維團隊寫好 boilerplate code 或配置模板。但我們不難發現這底下藏著不少 overhead。且不說重複的架構組件，就光是那些架構代碼就很不 DRY，扔給哪個有理想的軟件工程師會受得了呢。更何況，此前我也跟很多朋友交流過這個問題，我們即便很願意學習架構知識，但是真正做起產品來，我們能外包多少非核心業務就外包多少，這些基礎設施／架構尤其如此。另一方面，Microservice 的推行需要全團隊的支持，尤其在現存代碼很 monolithic 的團隊，但凡有異議，這件事就很難推行，反對者會輕易把經驗積累的試錯過程看成是 Microservice 的弊端。所以我認為從開發者角度看， Microservice 終將是過度性的，它當然不會消失，也許它會成為眾多 Serverless 平台的基石，但對開發者是透明的。Serverless／FaaS 有可能是目前最好的答案。

### 優勢

做過 Microservice 項目的朋友知道，其實核心代碼只佔非常少的量，外圍有大量的 boilerplate code。架構相關的暫且不提，它還有像處理 API／RPC 之類的代碼。而 FaaS 的亮點之一就在於它將這些 boilerplate code 推到了服務提供商／運維團隊，而開發者可以集中精力寫業務邏輯，寫更接近於計算本質的代碼。然而這並非意味著開發者又回到了之前工作方式，因為 FaaS 會問開發者兩個很重要的問題，最多用多少內存，最長跑多長時間。這是兩個很聰明的問題，開發者即便在開發時就要對運行資源和財務做出決定，並對決定做出相應的優化。這樣一來 DevOps 的代價就很低了。

FaaS 的另一個優勢就是真正意義上的按使用收費，Function 不跑就不用給錢。當年 Cloud Computing 剛成為 buzz word 的時候，我看到有種解釋是“像自來水一樣使用計算資源”，不過事實上，雖然相比較傳統的服務器購買和租用，它確實降低了運維成本，但事實上我們還是需要，比方說，預付資源以降低單位成本。而且所謂彈性架構其實也是有一定的顆粒度的。FaaS 更接近這種自來水的解釋。而企業也真正有望將運維開銷從 CAPEX[^3]（資本支出）轉化為 OPEX[^4]（運營支出）。

### 潛在問題

那 FaaS 的缺點是啥呢？我現在能預見的有這麼幾點。
- 很難在本地測試，單元測試不難，但集成測試幾乎不可能。最終我們也許不得不在雲裡配置四個環境，dev、testing、staging 和 prod。技術上來說完全沒問題，問題在於開發成本，如果平台能減免部分費用，相信也算是個解決方案，不過我覺得這個不太可能發生…
- 有時無法確定那兩個問題的答案，這意味著開發者有可能只能靠猜測。畢竟測試數據和真實數據可能有區別。但這不是 FaaS 獨有的問題，這個依賴於經驗積累。
- 錯綜複雜的服務依賴。類似軟件包依賴的問題也很有可能出現在 FaaS 裏，但可能沒那麼嚴重，畢竟規模比包管理器處理的要小很多。雖然目前 provisioning 工具已經具備資源依賴處理的功能，但是面對 FaaS，這些是否足夠還要繼續觀察。

## 結語

FaaS 會有坑，但我對它的走向很樂觀。

[^1]:	[Read–eval–print loop](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)

[^2]:	因為老上司邀請太多次，還特別安排我跟他們 CTO 吃飯見面，我不得不答應去公司聊聊項目，但其實就是連蒙帶騙走了一遍面試流程，見了來自多個部門十多個人。加此標注特別說明對目前雇主表忠心，並非我想跳槽。雖然他們要解決的問題很誘人，可因為跟我的職業計劃和理想不相符，所以我還是婉拒了他們。

[^3]:	[Capital expenditure](https://en.wikipedia.org/wiki/Capital_expenditure)

[^4]:	[Operating expense](https://en.wikipedia.org/wiki/Operating_expense)