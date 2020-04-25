---
layout: post
title: 寫給幫助測試 AutoTheme 的你們
comments: true
categories: [macOS, side-project, tech]
tweet_id: 1088831495844872192
---

![AutoTheme Poster](https://user-images.githubusercontent.com/480759/51755901-b58e7300-208d-11e9-84e6-b8ce2dd36246.png)

非常感謝你們的熱心幫助！

這篇文章主要是想告訴首批測試朋友現在 App 開發到什麼程度，有哪些已知問題，當然還有如何安裝。

## 這個 App 有什麼用

首先這是一個餐單欄應用。菜單裡有個很直接的切換主題的功能，用於在深/淺主題間切換。就像上面做的圖一樣，事實上那張圖是兩張截屏。從 Preferences 裡，你可以預設深/淺兩種主題的 Highlight 和 Accent 兩個的顏色。切換主題時，這兩種顏色配置會自動被切換。

## 如何安裝

我還沒有買蘋果開發者帳號，因此現在的測試版還沒有 sign。所以測試的朋友安裝就要麻煩一點了。下載後如果直接打開 App 的話可能會看到這個：

![install issue](https://user-images.githubusercontent.com/480759/51755893-b1faec00-208d-11e9-8b10-cfde9edd8c3f.png)

需要先关掉一下 macOS Gatekeeper[^1]。在 Terminal 下輸入：

```
sudo spctl --master-disable
```

把 App 放進 Applications 文件夾後再打開應該就可以用了。此時可以再把 Gatekeeper 開啟：

```
sudo spctl --master-enable
```

考慮到這一步可能讓一些同學不是很舒服，所以不勉強哈。

## 已知問題

在開發過程中，我意識到蘋果官方似乎在糾結這兩種顏色的設計，包括顏色本身和 API 的設計，我所使用的 API 在macOS 10.14（也許更早一點的版本）之前 `yellow` 是可以用的，但是最近的系統版本不能用了，而 API 裡 `yellow` 被取消了，新加了 `gold`，然而新加的這個也不能用。所以想了一個 fallback 方案，就是用 AppleScript 操作系統設置，但是缺點是換黃色的時候會有個選擇顏色的下拉菜單閃現⋯⋯目前還不知道怎麼解決，如果大家有啥想法歡迎來信討論 😅

## Roadmap

理想狀況下我想繼續做以下功能：

- 根據當地地理位置的日落時間自動更換深/淺主題
- I18N
- 快捷鍵
- 讓用戶自訂義 Highlight color？

同學們如果有啥想法也可以給我來信！

[^1]: [Gatekeeper](https://en.wikipedia.org/wiki/Gatekeeper_(macOS))，以及[如何關閉和開啓它](http://osxdaily.com/2016/09/27/allow-apps-from-anywhere-macos-gatekeeper/)