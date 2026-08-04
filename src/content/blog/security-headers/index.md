---
title: 'Security Headers'
description: 'Find out how secure your website is... or isn''t'
pubDate: 'Aug 03 2026'
heroImage: './hero.png'
---

It is beginning to look like most of my posts (at this point) will be articles or links that I have been saving in my [Feedly](https://feedly.com/) Read Later feed that I did not know what to do with...

Today, I want to present a neat little tool for us web nerds. It is called [Security Headers](https://securityheaders.com/) and it is a very simple testing tool. You provide a URL that you want to test and it grades the site based on the modern HTTP response headers that are returned (or are **not** returned). If the site is lacking any, it *may* get a bad grade and then it explains plainly which security feature is lacking or is misconfigured and why it is important.

It is a great tool to run against your sites, especially if you are serving up important data to protect. On a personal blog site like this, it might not be *super* crucial, but it is still best practice to secure yourself as much as possible. And if you use a service like [Cloudflare](https://www.cloudflare.com/), it is *extremely* easy to get an **A+** score like me!