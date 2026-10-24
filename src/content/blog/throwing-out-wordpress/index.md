---
title: 'Throwing Out WordPress'
description: 'The old WordPress blog was five posts on its own host. I kept the writing and dropped the install.'
pubDate: 'Oct 23 2026'
heroImage: './hero.jpg'
---

I kept a WordPress site around for years after I stopped caring about WordPress.

It started in 2020. I wanted to learn it, maybe pick up some side work, and Docker was interesting at the same time. I wrote about that stretch in [Hello again](/blog/hello-again/). Then life happened, the posts stopped, and the site just sat there. The last real ones went up in December 2021. After that it was a subdomain, a host, and updates for a blog I was not writing.

There were five posts. That was the whole thing:

- [Hello world!](/wordpress/hello-world/) and [Digging In](/wordpress/digging-in/), from February 2020, when I was still trying to learn WordPress itself.
- [Docker Punch](/wordpress/docker-punch/), [MY SQL Workbench](/wordpress/my-sql-workbench/), and [Docker Developement Setup](/wordpress/docker-developement-setup/), from December 2021, after the blog turned into notes on Docker. Yes, "Developement." I left the typo. It was the URL.

I didn't want to delete them. They are not much, but they are the record of that try, including the part where I called the first attempt a failure. I also didn't want them in *this* blog. This one is a fresh start. Different look, different years, and I am not going to pretend the 2020 posts belong in the feed next to whatever I write now.

This site is already running [Astro](https://astro.build/) on [Cloudflare](https://www.cloudflare.com/). I was never a big PHP fan, and I had no reason to keep a database, a plugin list, and a second host alive for five old pages. And I'm sure you have all heard about the [PHP2Shell](https://www.php.net/archive/2026.php#2026-10-21-5) exploit. So I pulled the posts off the live site, saved them as Markdown with their photos, and parked them at [/wordpress](/wordpress/).

Same words, same photos, and a close copy of the old theme. Mint background, big site title, "A Blog for Me," and the dark mode button. A line at the top says the snapshot is frozen. No comments, no editor, no updates. They don't show up on [/blog](/blog/) and they don't go out in the RSS feed.

The old addresses for those five posts, the ones that used to live on this domain, redirect to the copies. [Hello world!](/hello-world/) still lands on the post. WordPress just isn't the thing answering anymore.

The subdomain is the leftover. The writing is already here, so that host doesn't need to keep serving it. I exported the site to XML, and I still have the All-in-One WP Migration file, in case I ever want the real install back. I doubt I will. I have already turned that host off and pointed wordpress.therobhenry.com at the archive.

Small site. Worth keeping IMO. The install can go in the trash.
