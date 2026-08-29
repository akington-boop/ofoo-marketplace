# changelog

Generates or updates a project's `CHANGELOG.md` from git history, formatted to the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) standard.

## 📌 What it's for

Writing changelog entries by hand means re-reading commit history and manually sorting changes into the right buckets. This skill:

- Reads the existing `CHANGELOG.md` (if any) to find where the last entry left off
- Collects commits since the last version, or the staged diff, as the source of changes
- Filters out noise (typo fixes, merges, formatting-only commits)
- Categorizes everything into the six standard Keep a Changelog headings: Added, Changed, Deprecated, Removed, Fixed, Security
- Writes plain-language entries focused on what the user or agent gains, not internal file/class names

## 🚀 When to use it

- You're cutting a release and need a changelog entry from the commits since the last one.
- You have staged changes ready to commit and want them documented before the commit lands.

Not for: rewriting or reformatting an entire existing changelog — this only adds new entries.

## 🛠️ Usage

```
/changelog
```

Run from the repo root. No arguments — it inspects git history and the existing `CHANGELOG.md` itself to decide what's new.
