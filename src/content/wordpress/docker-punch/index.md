---
title: "Docker Punch"
description: "Slight change to what this blog is about… The original two posts are still technically true, but I’m gonna change my focus to recording and reporting the technologies that I am trying to learn. I need a place to re-iterate what “my teachers” say, which will hopefully re-inforce the newly acquired data. If you can…"
pubDate: "2021-12-09T08:30:06Z"
updatedDate: "2021-12-09T17:15:52Z"
heroImage: './hero.jpg'
heroAlt: "Docker Punch"
heroCaption: "Photo by <a href=\"https://unsplash.com/@carrier_lost?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText\">Ian Taylor</a> on <a href=\"https://unsplash.com/s/photos/docker?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText\">Unsplash</a>"
categories:
  - "Vague"
tags:
  - "docker"
  - "powershell"
---

<p>Slight change to what this blog is about… The original two posts are still technically true, but I’m gonna change my focus to recording and reporting the technologies that I am trying to learn. I need a place to re-iterate what “my teachers” say, which will hopefully re-inforce the newly acquired data. If you can learn something from my ranting, that’s great!</p>

<p>I’m working through a TechWorld with Nana’s great video “<a href="https://www.youtube.com/watch?v=3c-iBn73dDE" target="_blank" rel="noreferrer noopener">Docker Tutorial for Beginners [FULL COURSE in 3 Hours]</a>“, because I want to leave XAMPP/WAMP in the wastebucket and use Docker to completely run my dev environment.</p>

<p>But the article that <em>really </em>clicked for me and wow-ed me was “<a href="https://nystudio107.com/blog/dock-life-using-docker-for-all-the-things" target="_blank" rel="noreferrer noopener">Dock Life: Using Docker for All The Things!</a>“. The article is about using Docker to spin up containers for certain tools or packages that I need, but don’t want to install. OR… What about if I need specific version of those tools or packages. Well, following the steps in this article, you can do just that.</p>

<p>I had no problem setting up “aliases” for these commands in my WSL Ubuntu instance. At least after following the steps to get Docker commands to run in WSL. See “<a href="https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-containers" target="_blank" rel="noreferrer noopener">Get started with Docker remote containers on WSL 2</a>“.</p>

<p>But what if I want to do the same thing in Powershell? Powershell lets you create aliases, but not the same way that you do it in Ubuntu. First I had to create a “function”.</p>

<pre><code>function Start-Node {docker run --rm -it -v `pwd`:/app -w /app node:16-alpine @args }</code></pre>

<p>After the function has been created (make sure to notice the <code>@args</code> [thanks to <a href="https://stackoverflow.com/questions/2468145/equivalent-to-bash-alias-in-powershell" target="_blank" rel="noreferrer noopener">StackOverflow</a> for that one]), you can create the alias.</p>

<pre><code>Set-Alias -Name node -Value Start-Node</code></pre>

<p>So, a couple extra steps, but now I can run the following command without NodeJS being installed!</p>

<pre><code>node -v</code></pre>

<p>I think that’s awesome! And you should too!</p>

<p>UPDATE: To make the Powershell aliases stick permanently, make sure to store them in a profile.ps1 file. Check out “<a href="https://stackoverflow.com/questions/24914589/how-to-create-permanent-powershell-aliases" target="_blank" rel="noreferrer noopener">How to create permanent PowerShell Aliases</a>“. And for the WSL, see “<a href="https://microcollaborative.atlassian.net/wiki/spaces/DSC/pages/147521540/Creating+aliases+in+Windows+Subsystem+for+Linux" target="_blank" rel="noreferrer noopener">Creating aliases in Windows Subsystem for Linux</a>“.</p>
