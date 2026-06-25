---
# TEMPLATE — files starting with "_" are ignored by the site.
# Copy this file, rename it to a url-friendly slug (e.g. my-project.md),
# and the project automatically appears in the "projects" feed + at /projects/<slug>.

title: "Findash"

date: "06/17/2026"

image: "/projects/findash-git-repo.jpg"

links: "https://github.com/ya5huk/findash/"

period: "May - Jun '26 (then open-source)"

tools: "Claude skills, Claude Code, rclone, telegram bot, py"
---

A Claude finance plugin that delivers a status dashboard to your telegram.
1. Claude fetches financials from banks / credit cards / Interactive Brokers -> Drops them to a drive folder
2. You dump anything you want in that drive folder as well
3. Claude reads, reasons, renames files and moves to relevant drive dirs
4. Claude updates financial SQLite data
5. Claude sends telegram dashboard
