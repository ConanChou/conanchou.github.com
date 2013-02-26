---
layout: post
title: "Raspberry Pi + Arch + WiFi + Sound + Go 簡記"
date: 2013-02-17 17:11
comments: true
categories: [Raspberry-Pi, Hack, Arch, Linux, Go]
---

Tl;dr. 原文地址：[http://goo.gl/RSj7A](http://goo.gl/RSj7A)

[Raspberry Pi](http://www.raspberrypi.org/) 剛剛在 HN 上紅起來的時候，我就果斷通過 ebay 從英國買了一隻。那是上學期的事情了，由於[種種原因](http://www.conanblog.me/life/where-are-we/)，我直到最近才真正玩起來。寫這篇簡記有兩個目的，一爲了以後自己查閱配置方法方便，二爲了給明睿交差（太無聊可以直接看最後一節……）。<!--more-->

## 硬件

Pi 本身我是買了 Model B，它跟 A 的區別只是 B 有倆 USB 口和 512MB 內存，而 A 只有一個 USB 口和 256MB 内存。東西運到的時候除了機子本身什麼都沒有，所以其他東西你得自己配。

最基本的是電源，理論上說，電腦 USB 口直接供电就应该可以驱动 Pi 了，可是網上有些黑客表示有起不動的現象，用測電壓的儀器測了板子，當插上一些設備後，不達5伏。所以我建議在選擇電源時可以挑高一點電壓的，比如[摩托羅拉的SPN5504型充電器](http://www.amazon.com/gp/product/B004EYSKM8/ref=oh_details_o05_s00_i00?ie=UTF8&psc=1)，它的輸出規格是5.1V，850mA。補充一句，這塊板子的最高設計電壓是5.25V。我用的這個充電器的電流還是比較小，經測試，跑不動無電源供給的外接硬盤。

除此之外，我還買了一個迷你 WiFi 網卡，[Edimax EW-7811Un](http://www.amazon.com/gp/product/B005CLMJLU/ref=oh_details_o06_s00_i00?ie=UTF8&psc=1)。有了 WiFi，我就可以不用非得拿一根網線接着用了，比較方便。

其它硬件我就不一一說了，不太算是必須品，大致是殼子、各種線（我現在只用ssh鏈接）和麪包板以及各種小電子元件（這些是用來做別的擴展的）。

## 軟件

由於硬件的計算能力非常有限，我選擇了 Arch Linux 作爲操作系統。非常輕量級，而且給你更多的支配權。

### 操作系统

Arm 版的可以在 Pi 的[官網下載](http://www.raspberrypi.org/downloads)。這個系統裏也沒有GUI，正和我意。值得強調的是這個鏡像是hard-float ABI的，啓動非常快。

下載好鏡像後先檢查下 checksum：

``` bash
$ sha1sum ~/Downloads/archlinux-hf-2013-02-11.zip
```

解壓：

``` bash
$ unzip ~/Downloads/archlinux-hf-2013-02-11.zip
```

在插入SD卡之前，用 `df -h`{:lang='bash'} 查看當前掛載的磁盤，再插入SD卡再查看。找出你的SD卡名字，就是像 `/dev/mmcblk0p1` 或 `/dev/sdd1` 這樣的盤符。記住名字並卸載該盤符（如果這個SD卡裏有多個分區，保證卸載該SD卡下的所有盤符）,這裏我們假設是`mmcblk0p1`这个盘：

``` bash
$ unmount /dev/mmcblk0p1
```

卸载后就可以将镜像拷贝到刚刚的SD卡裏了：

``` bash
$ sudo dd bs=4M if=/path/to/your/image/arch-linux.img of=/dev/mmcblk0p1
```

### 分區擴容

OS 的安裝其實到這裏就算結束了，但是因爲原鏡像是2GB的，如果你的SD卡大於2GB，其他的空間就用不到了，要用就得對SD卡上的分區擴容。擴容的工具很多，有命令行的也有圖形界面的。GParted 就挺好用的，如果對命令行工具不太熟悉，它是個很好的選擇。不過在這篇簡記裏我要裝個逼：

``` bash
$ sudo fdisk -uc /dev/mmcblk0

# 打印分區表
Command (m for help): p
 
Disk /dev/mmcblk0: 3904 MB, 3904897024 bytes
64 heads, 32 sectors/track, 3724 cylinders, total 7626752 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disk identifier: 0x0004f23a
 
        Device Boot      Start         End      Blocks   Id  System
/dev/mmcblk0p1   *        2048      186367       92160    c  W95 FAT32 (LBA)
/dev/mmcblk0p2          186368     3667967     1740800   83  Linux

# 刪除第二個分區
Command (m for help): d
Partition number (1-4): 2

# 新建一個分區
Command (m for help): n
Command action
   e   extended
   p   primary partition (1-4)
p
Partition number (1-4): 2
 
# !!! 第一個扇區號必須和上面刪除的分區的起始扇區號一樣，這裏的話是186368 !!!
First sector (186368-7626751, default 186368): 186368
Last sector, +sectors or +size{K,M,G} (186368-7626751, default 7626751): 
Using default value 7626751

# 保存剛剛的操作並退出
Command (m for help): w
The partition table has been altered!
 
Calling ioctl() to re-read partition table.
Syncing disks.
```

檢查下磁盤，然後再擴容：

``` bash
$ sudo e2fsck -f /dev/mmcblk0p2
$ sudo resize2fs -p /dev/mmcblk0p2
```

### 系統常規設置

Arch 起來之後裏面基本上啥都沒有，所以得根據自己的喜好調教一下。本着極簡主義的原則，我做了如下調整。先以 root 身份登錄。

Pi 用 SD 卡做主盤，其實就相當與 SSD 了，爲了延長 SD 卡的壽命，我把系統的`atime`記錄取消掉了，只要修改`/etc/fstab`:

```
# 
# /etc/fstab: static file system information
#
# <file system>        <dir>         <type>    <options>          <dump> <pass>
devpts                 /dev/pts      devpts    defaults            0      0
shm                    /dev/shm      tmpfs     nodev,nosuid        0      0
/dev/mmcblk0p1  /boot           vfat    defaults        0       0
/dev/mmcblk0p2  /               ext4    defaults,noatime        0       0
tmpfs           /var/log        tmpfs   defaults,noatime,mode=0755,size=5%      0       0
```

升級系統：

``` bash
$ pacman -Syu
```

如果它說要先升級`pacman`，就讓它升，升完後再來一次，這樣整個系統都更新了。

修改默認 root 的密碼：

``` bash
$ passwd root
```

修改默認主機名，默認是叫`alarmpi`，你可以修改`/etc/hostname`裏的此默認值。

Arch 默認是沒有`sudo`的，安一個：

``` bash
$ pacman -S sudo
$ visudo
```

爲了只讓`sudo`用戶組的用戶有執行`sudo`的權限，我們還得修改一下 `/etc/sudoers`文件，用你最喜歡的文本編輯器打開，並去掉`%sudo ALL=(ALL) ALL`這一行前面的註釋，保存並關閉。

創建新用戶並設置密碼：

```bash
$ useradd -m -g users -s /bin/bash conan
$ passwd conan
```

将新用户加入到`sudo`用戶組：

```bash
$ sudo usermod -aG sudo conan
```

禁止`root`通過ssh登錄，打開`/etc/ssh/sshd_config`，找到`PermitRootLogin`並把它的值改成‘no’。重啓`sshd`:

```bash
$ systemctl restart sshd
```

修改時區設置：

```bash
$ tzselect
$ export TZ='America/New_York'
$ source /etc/profile
```

安裝`Vim`和`python2`：

```bash
$ pacman -S vim python2
```

常規設置這樣就差不多了，更新並重啓一下系統（再次更新是以防因爲以上變動之後有些包找不到）：

```bash
$ pacman -Syu
$ reboot
```

### 聲音

安裝`alsa`相關包：

```bash
$ sudo su
$ pacman -S alsa-firmware alsa-lib alsa-plugins alsa-utils mpg123
```

掛載聲音模塊：

```bash
$ modprobe snd_bcm2835
```

將聲音模塊放進內核模塊，這樣它會自啓動：

``` bash
$ vi /etc/modules-load.d/snd_bcm2835.conf
```

文件裏寫：

```bash
# Put snd_bcm2835.ko in kernel modules
snd_bcm2835
```

因爲 Pi 的音頻可以從 analog 和 HDMI 兩個通道出來，所以我們可以做個選擇，從[官網的信息](http://www.raspberrypi-spy.co.uk/2012/06/raspberry-pi-speakers-analog-sound-test/)看，你可以用 `amixer cset numid=3 <n>` 這個命令來制定通道，其中`<n>`可以是 0、1、2，意思是：0=auto, 1=analog, 2=hdmi。

測試一下是否有效：

``` bash
$ speaker-test -c 2
```

沒問題的話你應該可以聽到一些噪音。當然你也可以通過官網的方法測試：

```bash
$ wget http://www.freespecialeffects.co.uk/soundfx/sirens/police_s.wav
$ aplay police_s.wav
```

如果遇到這樣的報錯：

```bash
ALSA lib confmisc.c:768:(parse_card) cannot find card '0'
ALSA lib conf.c:4246:(_snd_config_evaluate) function snd_func_card_driver returned error: No such file or directory
ALSA lib confmisc.c:392:(snd_func_concat) error evaluating strings
ALSA lib conf.c:4246:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1251:(snd_func_refer) error evaluating name
ALSA lib conf.c:4246:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:4725:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2217:(snd_pcm_open_noupdate) Unknown PCM default
aplay: main:696: audio open error: No such file or directory
```

你需要把用戶加到`audio`用戶組裏：

```bash
$ usermod -G audio -a conan
$ su -l conan
```

#### VLC

安裝 VLC 純粹是因爲我`scp`了一份「白金迪斯科」到 Pi，發現居然解碼失敗了……以及 VLC 有個網頁端的控制接口，挺方便，可惜就是太 heavy 了。

```bash
$ pacman -S vlc pulseaudio pulseaudio-alsa libao
```

安裝完後把`/etc/libao.conf`裏的`alsa`換成`pulse`。之後再跑，你可能會遇到一些錯誤，那是因爲有些包還沒裝，仔細看下錯誤信息再補上就好了。上面的安裝我也不是一次到位的，也是跑跑補補，只是在寫簡記的時候重新 compile 了命令記錄。

爲了使用網頁控制接口，你得在`/usr/share/vlc/lua/http/.hosts`裏加上可訪問的 IP，在這裏我就開放了本地網絡的訪問權：

```bash
# local network
192.168.2.0/24
```

這樣應該就好了，來聽首歌試試：

```bash
$ vlc --intf http --http-host 192.168.2.11 --http-port 8080 /home/conan/hikari-loveletter.mp3
```

打開 Web Interface 就只需要：

```bash
$ vlc --extraintf=http
```

### WiFi

Edimax EW-7811Un 是基於 Realtek 8192CU 的 WiFi 網卡。這一款在 Raspberry Pi 社区里非常有人气，因为它能被 Pi 的小電力驅動。不過貌似它的驅動程序卻還沒有成爲 alarmpi 的標配，我聽說它的驅動已經成爲 Raspbian 的標配（基於 debian 的 Pi Linux 分支），估計 alarmpi 也快了吧。不過在此之前還是得自己擼。擼之前我建議參考這篇簡記的同學先用`lsmod`查看一下當前已經掛載的模塊，如果有叫`8192cu`的，那麼恭喜你，你不用自己擼了，直接跳過本章節吧！

安裝前還是先更新、安裝一些必要的工具：

```bash
$ sudo su
$ pacman -Syu
$ pacman -S util-linux base-devel unzip
$ reboot
```

`util-linux`包其實是已經安裝過的了，但是在這裏我們或許得重裝一下，這是爲了避免`util-linux`的c重啓後不能登錄的小 bug，如果重啓後不能登錄了，就`ssh`上，再重裝`util-linux`。

從另一臺機子下載 [RTL8192CU 驅動源碼](http://218.210.127.131/downloads/downloadsView.aspx?Langid=1&PNid=21&PFid=48&Level=5&Conn=4&DownTypeID=3&GetDown=false&Downloads=true#2772)(因爲這個極品的網站裏源碼是js搞的，不太容易弄直接下載地址，所以得有個有圖形界面的機子來下)。將下載好的 zip 包上傳到 Pi 裏：

```bash
$ scp ~/Downloads/RTL8192xC_USB_linux_v3.4.3_4369.20120622.zip conan@192.168.2.11:/home/conan/
```

下面再次回到 Pi 裏，解壓源碼：

```bash
$ sudo su
$ unzip RTL819xC_USB_linux_v3.4.3_4369.20120622.zip
$ cd RTL8188C_8192C_USB_linux_v3.4.3_4369.20120622/driver/
$ tar -xvf rtl8188C_8192C_usb_linux_v3.4.3_4369.20120622.tar.gz
$ cd rtl8188C_8192C_usb_linux_v3.4.3_4369.20120622
$ vim Makefile
```

這裏我們要修改一下編譯所基於的架構，首先找到`CONFIG_PLATFORM_I386_PC = y`，將‘y’改成‘n’；加上`CONFIG_PLATFORM_ARM_BCM2708 = y`，在架構配置區塊下面加上下面的代碼：

```bash
ifeq ($(CONFIG_PLATFORM_ARM_BCM2708), y)
EXTRA_CFLAGS += -DCONFIG_LITTLE_ENDIAN
ARCH := arm
CROSS_COMPILE :=
KVER  := $(shell uname -r)
KSRC := /lib/modules/$(KVER)/build
endif
```

保存後就可以出來編譯了：

```bash
$ make
```

不出意外，這裏應該就編譯成功了，我第一次跑的時候失敗了，原因是我下錯了源代碼包……成功後在一坨新生成的文件裏有個叫`8192cu.ko`的。這就是那個將要被掛載到內核的新模塊。

按理說這裏只要再`make install`就好了，可是官方的 install 腳本好像有點問題，不過還是有參考意義的，至少它描述了你大概要做哪些事情來安裝新的組件。

```bash
$ cp 8192cu.ko /lib/modules/$(uname -r)/kernel/net/wireless
$ depmod -a
$ insmod 8192cu.ko
$ install -p -m 644 ~/RTL8188C_8192C_USB_linux_v3.4.3_4369.20120622/driver/rtl8188C_8192C_usb_linux_v3.4.3_4369.20120622/8192cu.ko /lib/modules/($uname -r)/kernel/drivers/net/wireless/
```

驅動裝完後我們還得看看有沒有衝突的驅動，用`mkinitcpio -M`查看。如果发现列表里有`rtl8192cu`，我們得禁用它才能保證新的驅動正常工作：

```bash
$ echo "blacklist rtl8192cu" > /etc/modprobe.d/blacklist-rtl8192cu.conf
```

重啓並登錄後先看看驱动模块能不能用，如果有問題就再回到之前的部分仔細走一遍：

```bash
$ sudo su
$ rmmod 8192cu
$ modprobe 8192cu
$ ip link set wlan0 up
```

接着就可以裝網絡管理軟件來自動化鏈接 WiFi 了，我用的是`netcfg`，先安裝必要的工具：

```bash
$ pacman -S wireless_tools netcfg
```

安裝好後有些文件要配置一下，首先是創建 profile 文件：

```bash
$ cp /etc/network.d/examples/wireless-wpa /etc/network.d/conan_wireless
$ vim /etc/network.d/conan_wireless
```

更具自己網絡的情況填寫好相應信息，當然這裏我用的是wpa方式連的，其他模式都在`examples`目錄下，具體信息可以看 [Arch wiki](https://wiki.archlinux.org/index.php/Netcfg#Configuration)。

`/etc/conf.d/netcfg`也要做些修改，因爲 WiFi 的 DHCP 可能有些慢，所以最好把等待時間設置長一點，加一句`DHCP_TIMEOUT=30`；其他的配置可以更具自己的喜好自由調整。

最後終於可以連 WiFi 了：

```bash
$ netcfg /etc/network.d/conan_wireless
```

這個過程中可能會看到錯誤，但是之後如果出現了‘Done’，那就應該是連上了，可以`ifconfig`看一下。

最後我們要把 WiFi 鏈接自動化：

```bash
$ systemctl enable net-auto-wireless.service
```

### Go

在 arm 上編譯 Go 我純粹是吃飽了撐着，因爲發現在 Pi 上编译还比较 tricky，所以記錄一下。先裝上必要的軟件：

```bash
$ pacman -S mercurial gcc
```

下載源碼：

```bash
$ hg clone -u release https://code.google.com/p/go /usr/local/go
```

編譯流程跟[官網說的](http://golang.org/doc/install/source)差不多，只是在編譯之前要設置一些環境變量：

```bash
$ export GOARCH="arm"
$ export GOARM="5"
$ export GOOS="linux"
$ export GOPATH="/usr/local/go/bin"
```

下面接着正常編譯流程：

```bash
$ cd /usr/local/go/src
$ ./all.bash
```

跑完后應該會有類似這樣的信息：

```
ALL TESTS PASSED

---
Installed Go for linux/amd64 in /home/you/go.
Installed commands in /home/you/go/bin.
*** You need to add /home/you/go/bin to your $PATH. ***
```

當然也有可能測試沒有完全通過的，我就遇到過，但是 bin 已經編譯成功了。這時候只需要把環境變量裏的`PATH`更新一下就可以了：

```bash
$ export PATH=$PATH:/usr/local/go/bin
```

最後跑個「喂世界」程序測試下。建一個`hello.go`：

```go
package main

import "fmt"

func main() {
    fmt.Printf("hello, world\n")
}
```

走起：

```bash
$ go run hello.go
hello, world
```

## 後記

這篇簡記基本只是一個關於 Raspberry Pi 的 setup，可能明睿更多的是希望看到各種性能相關的測評。我想性能什麼的是在預料之中的，肯定跟我們的本本沒法比啦，在編譯 Go 的時候連`rand`的測試都超時了。但是作爲一個玩具，還是挺不錯的。有了它我現在可以更節能了，下載不用整夜開着能跑「暗黑3」和「星際爭霸2」的 Linux 主機了。聽個音樂和有聲讀物也不用特意開電腦，手機還能方便操控。連着硬盤做文件stream或分享也挺方便。其實最好的一點是換SD卡方便。現在一個卡是 Arch，回頭再做張卡弄媒體中心，要用什麼就換什麼。

至於麪包板以及擴展的一些 Hack 我還沒玩得起來，材料還在路上，不過我已經有些想法了。比如做些指示燈和語音輸出，把平時需要關注的信息用這些媒介傳遞給我，簡單說就是把以前的 pull 換成 push。

綜上所述，玩這個肯定是蛋非常疼的。
