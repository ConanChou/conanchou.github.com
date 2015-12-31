---
layout: post
title: "Raspberry Pi 下載盒"
date: 2013-02-20 17:03
comments: true
categories: [Raspberry-Pi, BitTorrent, Arch, Linux]
---

[上一篇日誌](https://conanblog.me/blog/raspberry-pi/hack/arch/linux/go/2013/02/17/play-with-raspberry-pi/)我在篇尾大致說了一下我用 Raspberry Pi 做 Bit Torrent（BT）下載盒。這次不是蛋疼，而確實是爲了節省地球資源。簡單做個記錄，另外我也想說說我發現的問題和困惑。<!--more-->

## 環境搭建

OS 環境就跟上一篇日誌說的一樣，應用程序我隨便挑了個 Transmission。它有 daemon 模式跑，有簡單好用的 Web UI，最主要的是它也支持 Private Tracker（在國外下載東西還是這種類型的比較安全）：

```bash
$ sudo su
$ pacman -S transmission-cli
```

daemon 模式執行：

```bash
$ cp /usr/lib/systemd/system/transmission.service /etc/systemd/system/
$ cp /usr/lib/tmpfiles.d/transmission.conf /etc/tmpfiles.d/
$ groupadd transmission
$ gpasswd -a conan transmission
```

修改`/etc/tmpfiles.d/transmission.conf`，將`user`和`group`替換成我們剛剛設置的‘conan’和‘transmission’。接着啓用剛剛的配置：

```bash
$ systemd-tmpfiles --create transmission.conf
$ systemctl daemon-reload
```

別忘了把`/run/transmission`的權限設置成`777`：

```bash
$ chmod 777 /run/transmission
```

硬件方面，我不可能往我4GB的小SD卡裏面存儲，所以我用了一塊自供電的外接硬盤。將它`mount`起來，其方法很多，可以手動mount也可以修改`/etc/fstab`自動化mount。這個示例裏我就從簡，手動添加了（因爲這塊硬盤是NTFS的，之後我需要格式化一下，所以只是暫時使用）：

```bash
$ mkdir /mnt/disk500
$ mount /dev/sda1 /mnt/disk500
```

將`disk500`裏的「Downloads」軟連接到`~/Downloads`：

```bash
$ ln -s /mnt/disk500/Downloads/ ~/Downloads
```

## 使用情況

這樣就可以通過[http://127.0.0.1:9091](http://127.0.0.1:9091)來管理下載了。下面是效果圖。

![Web UI](https://conanblog.me/images/20130220/WebUI.png "Web UI")

![Peers](https://conanblog.me/images/20130220/peers.png "Peers")

速度還不錯吧，再來看一下內存和CPU使用情況：

![top](https://conanblog.me/images/20130220/top.png "top")

可以發現，其實 Transmission 內存使用並沒有很嚇人，反而是 NTFS 用掉了很多CPU資源，這也是爲什麼我上面說到要格式化這塊硬盤的原因。

最後我持續關注了下載速度，遇到了我之前也遇到過的一個問題，就是速度時上時下的，波動特別大。我之前用 Transmission 就會這樣，還時不時斷網，後來換了別的 BT 客戶端就沒這樣過，所以我想這應該是 Transmission 某些設置的問題。我也嘗試去找一些解決方案，可是基本都不是很有效。求高人答疑解惑。
