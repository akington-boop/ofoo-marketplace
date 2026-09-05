# commit-message

Generates a commit message for staged changes, prefixed with an issue ID: `<ISSUE-ID> | ...`.

## 📌 What it's for

Reads your staged changes (`git status --porcelain` / `git diff --cached`) and writes a concise commit message summarizing why the change was made, prefixed with an issue ID. Asks for the issue ID if one isn't provided.

## 🚀 When to use it

Whenever you've staged changes and want a commit message drafted for you instead of writing it by hand.

## 🛠️ Usage

`/commit-message` or `/commit-message ABC-123`
