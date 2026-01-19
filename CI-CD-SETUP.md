# CI/CD Setup Guide

## GitHub Secrets Configuration

You need to add these secrets to your GitHub repository settings:

### 1. **SERVER_HOST**
- Value: Your server's IP address or domain (e.g., `deploy.example.com`)

### 2. **SERVER_USER**
- Value: SSH username (e.g., `deploy`)

### 3. **SERVER_SSH_KEY**
- Value: Your private SSH key for the server
- How to generate:
  ```bash
  ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy
  ```
- Copy the contents of `~/.ssh/github_deploy` (the private key)
- Add the public key (`~/.ssh/github_deploy.pub`) to `~/.ssh/authorized_keys` on your server

## Steps to Configure

### 1. Create SSH Key Pair

On your local machine:
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy
```

### 2. Add Public Key to Server

```bash
ssh-copy-id -i ~/.ssh/github_deploy.pub deploy@your-server-ip
```

Or manually:
```bash
# On your server
echo "$(cat ~/.ssh/github_deploy.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 3. Add Secrets to GitHub

1. Go to your repository: **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add:
   - `SERVER_HOST`: Your server IP/domain
   - `SERVER_USER`: Your SSH username
   - `SERVER_SSH_KEY`: Contents of your private key file (without file extensions)

### 4. Test SSH Connection

```bash
ssh -i ~/.ssh/github_deploy deploy@your-server-ip "docker compose ps"
```

## Workflow Behavior

The CI/CD pipeline runs automatically when:
- ✅ You push to the `main` branch
- ✅ Changes are made in `frontend/` folder
- ✅ Changes are made to `docker-compose.yml`
- ✅ Manual trigger from **Actions** tab

## What It Does

1. **Build**: Compiles the Next.js app and creates Docker image
2. **Push**: Stores image in GitHub Container Registry (GHCR)
3. **Deploy**: 
   - SSHes into your server
   - Pulls latest code from git
   - Downloads the new image
   - Restarts the frontend service
4. **Verify**: Checks that the frontend is healthy (waits up to 60 seconds)
5. **Notify**: Reports success/failure

## Viewing Workflow Status

- Go to **Actions** tab in your GitHub repo
- Click on any workflow run to see logs
- Scroll down to see build and deploy steps

## Environment Variables

If you need environment variables in production, add them to `docker-compose.yml`:

```yaml
frontend:
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=http://your-domain.com
    - CUSTOM_VAR=${{ secrets.CUSTOM_VAR }}
```

## Troubleshooting

**Issue: "Permission denied (publickey)"**
- Verify SSH key is added to server's `authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`

**Issue: "Docker image not found"**
- Workflow pushed to GHCR but pull failed
- Verify `docker login` works on server: `echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin`

**Issue: Frontend stays in "Exited" state**
- Check logs: `docker compose logs frontend -f`
- Verify Next.js build succeeded in GitHub Actions logs

## Next Steps

1. ✅ Add SSH secrets to GitHub
2. ✅ Push this workflow file to your repository
3. ✅ Watch the Actions tab for the first deployment
4. ✅ Access your frontend at `http://your-server-ip:3001`
