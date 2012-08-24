---
layout: post
title: "用另一臺計算機寫 Octopress"
date: 2012-08-23 23:26
comments: true
categories: [Octopress, Hack]
---

用 Octopress 寫博客已經有幾天了，一直都在家裏的臺機上寫。今天想在我的小黑上寫點東西的時候我就只是把 Github 上所有的 branch `clone` 下來，裝了改裝的東西，可是折騰半天不能從小黑上發佈。去 doc 里面看了一下，也没有这方面的记录。於是決定刨根。<!--more-->

Octopress 的運行機制很簡單，就是用類似 `make` 的 `rake` 將寫好的 `markdown` 文件轉化成 HTML 文件，皮膚什麼的都也一併生成好，然後再把生成好的一堆靜態文件 `push` 到 Github 或其他類似的地方。我想不能推送的話應該是可以從 Rakefile 裏找到答案。果不其然：

``` ruby
mkdir deploy_dir
cd "#{deploy_dir}" do
  system "git init"
  system "echo 'My Octopress Page is coming soon &hellip;' > index.html"
  system "git add ."
  system "git commit -m \"Octopress init\""
  system "git branch -m gh-pages" unless branch == 'master'
  system "git remote add origin #{repo_url}"
  rakefile = IO.read(__FILE__)
  rakefile.sub!(/deploy_branch(\s*)=(\s*)(["'])[\w-]*["']/, "deploy_branch\\1=\\2\\3#{branch}\\3")
  rakefile.sub!(/deploy_default(\s*)=(\s*)(["'])[\w-]*["']/, "deploy_default\\1=\\2\\3push\\3")
  File.open(__FILE__, 'w') do |f|
    f.write rakefile
  end
end
```

很顯然，這個 `deploy_dir` 也是一個單獨的 git 目錄。追溯其根源，也就是默認設置，就是 「_deploy」 目錄。而這個目錄是被 「.gitignore」 排除的。這就難怪爲什麼單純的 `clone` 沒法工作了。于是完整的 `clone` 过程如下（包含註解）：

``` bash
$ ;: go to the dir you want to put your octopress repo
$ cd ~/Documents
$ ;: clone repo from your exists octopress repo
$ git clone git@github.com:ConanChou/conanchou.github.com.git octopress
$ cd octopress
$ ;: get the source branch
$ git checkout -d origin/source source
$ ;: add original octopress repo to remote for updates
$ git remote add octopress https://github.com/imathis/octopress.git 
$ ;: clone the master branch to _deploy dir
$ git clone git@github.com:ConanChou/conanchou.github.com.git _deploy
$ ;: install bundles
$ gem install bundler
$ bundle install
$ rake install
```

Happy hacking!
