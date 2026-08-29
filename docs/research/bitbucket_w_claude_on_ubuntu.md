# Authenticating Claude Code with Private Bitbucket Server on Ubuntu 26.04

When adding a private Bitbucket Server repository as a marketplace source in **Claude Code**, background Git operations are executed non-interactively. This blocks terminal password prompts and results in the error: `It can't get users' password`.

Follow these instructions to configure **Ubuntu 26.04** to securely cache your HTTPS credentials so Claude Code can authenticate seamlessly.

---

## Prerequisites
* **Ubuntu 26.04 LTS** installed.
* **Claude Code CLI** installed and configured.
* **Personal Access Token (PAT)** from your Bitbucket Server (recommended over account passwords).

---

## Step 1: Install the Native Ubuntu Credential Manager
Instead of storing passwords in plaintext, configure Git to use the native Ubuntu **libsecret** helper. This securely stores your credentials inside the encrypted GNOME Keyring / Ubuntu system keyring.

1. Install the required build tools and the libsecret development library:
   ```bash
   sudo apt update
   sudo apt install -y make gcc libsecret-1-dev
   ```

2. Compile the Git credential helper plugin:
   ```bash
   sudo make --directory=/usr/share/doc/git/contrib/credential/libsecret
   ```

3. Configure Git globally to use the newly compiled `libsecret` helper:
   ```bash
   git config --global credential.helper /usr/share/doc/git/contrib/credential/libsecret/git-credential-libsecret
   ```

---

## Step 2: Cache your Bitbucket Credentials
Prime your system keyring by triggering a manual Git transaction. This prompts for credentials interactively once and saves them for Claude Code's background processes.

1. Run a dummy clone or fetch against your private domain:
   ```bash
   git ls-remote https://your-bitbucket-server.com/scm/project/repo.git
   ```
   *(Replace `https://your-bitbucket-server.com/scm/project/repo.git` with your actual Bitbucket Server repository URL).*

2. Enter your credentials when prompted:
   * **Username**: Your Bitbucket Server username.
   * **Password**: Your Bitbucket **Personal Access Token (PAT)**.

---

## Step 3: Add the Source in Claude Code
Now that the Ubuntu system keyring handles authentication automatically in the background, run Claude Code and register your marketplace source:

```text
/plugin marketplace add https://your-bitbucket-server.com/scm/project/repo.git
```

---

## Alternative: Scoped Domain Configuration (Optional)
If you prefer not to use `libsecret` globally for all Git repositories, configure the helper exclusively for your specific Bitbucket Server domain:

```bash
git config --global credential.https://your-bitbucket-server.com.helper /usr/share/doc/git/contrib/credential/libsecret/git-credential-libsecret
```

