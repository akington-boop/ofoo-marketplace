# Bash Cheat Sheet

🔗 [devhints.io/bash](https://devhints.io/bash)   

## 1. 🔀 Checking Variables & Arrays (Conditionals)

Bash uses specific flags instead of standard math symbols like `<` or `>`.

| Flag | Meaning | Example |
|------|---------|---------|
| `-eq` | Equal to (integers only) | `[[ $a -eq $b ]]` |
| `-ne` | Not equal to | `[[ $a -ne $b ]]` |
| `-z` | String is empty | `[[ -z "$my_var" ]]` |
| `-n` | String is not empty | `[[ -n "$my_var" ]]` |

## 2. 📚 Working with Arrays

| Syntax | Meaning |
|--------|---------|
| `${MY_ARRAY[@]}` | All items in the array |
| `${#MY_ARRAY[@]}` | Count of items (`#` prefix) |
| `MY_ARRAY+=("new_item")` | Append an item |

## 3. 📁 File & Folder Tests

Prevents crashing before reading a file.

| Flag | Meaning | Example |
|------|---------|---------|
| `-f` | File exists and is a regular file | `[[ -f "script.log" ]]` |
| `-d` | Directory exists | `[[ -d "/var/log" ]]` |
| `-s` | File exists and is not empty | `[[ -s "script.log" ]]` |

## 4. ⚡ The `&&` and `||` Shortcuts

Shorthand for if/else:

- `command_A && command_B` — run B only if A succeeds (returns 0)
- `command_A || command_B` — run B only if A fails (returns non-zero)

## 5. 🔤 Comparing Strings

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | Strings equal | `[[ "$a" == "$b" ]]` |
| `!=` | Strings not equal | `[[ "$a" != "$b" ]]` |
| `<` / `>` | Lexicographic order (inside `[[ ]]`) | `[[ "$a" < "$b" ]]` |

## 6. 📍 Referencing an Array Element

| Syntax | Meaning |
|--------|---------|
| `${MY_ARRAY[0]}` | First element (arrays are 0-indexed) |
| `${MY_ARRAY[-1]}` | Last element |
| `${MY_ARRAY[i]}` | Element at index `i` |

## 7. 🔁 Loops

```bash
for item in "${MY_ARRAY[@]}"; do
  echo "$item"
done

for (( i=0; i<10; i++ )); do
  echo "$i"
done

while [[ $count -lt 5 ]]; do
  ((count++))
done
```
