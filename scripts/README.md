# Scripts Directory

This directory contains utility scripts for the Bookstore project.

## Available Scripts

### `run-github-actions-locally.sh`

Run GitHub Actions workflows locally using [act](https://github.com/nektos/act).

#### What is act?

`act` is a tool that allows you to run your GitHub Actions workflows locally on your machine. This is useful for:
- Testing workflows before pushing to GitHub
- Debugging workflow issues faster
- Saving CI/CD minutes
- Working offline

#### Prerequisites

1. **Docker** must be installed and running
2. **act** must be installed

#### Installation

**macOS:**
```bash
brew install act
```

**Linux:**
```bash
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

**Windows:**
```bash
choco install act-cli
```

#### Usage

**Run all workflows:**
```bash
./scripts/run-github-actions-locally.sh
```

**Run a specific workflow:**
```bash
./scripts/run-github-actions-locally.sh -w test-bookstore.yml
```

**Run a specific job:**
```bash
./scripts/run-github-actions-locally.sh -j test
```

**Specify event type:**
```bash
./scripts/run-github-actions-locally.sh -e pull_request
```

**Show help:**
```bash
./scripts/run-github-actions-locally.sh -h
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --workflow WORKFLOW` | Specify workflow file | All workflows |
| `-j, --job JOB` | Specify job to run | All jobs |
| `-e, --event EVENT` | Specify event type | push |
| `-h, --help` | Show help message | - |

#### Examples

```bash
# Test the bookstore CI workflow
./scripts/run-github-actions-locally.sh -w test-bookstore.yml

# Run just the test job
./scripts/run-github-actions-locally.sh -j test

# Simulate a pull request event
./scripts/run-github-actions-locally.sh -e pull_request -w test-bookstore.yml
```

#### Troubleshooting

**Docker not running:**
```
Error: Docker is not running
```
Solution: Start Docker Desktop or the Docker daemon.

**act not found:**
```
Error: 'act' is not installed
```
Solution: Install act using the installation instructions above.

**Workflow not found:**
```
Error: unable to get git repo: ...
```
Solution: Make sure you're running the script from the project root directory.

**Port conflicts:**
If services fail to start due to port conflicts, make sure no other instances of the bookstore services are running:
```bash
docker compose down
# Then try again
./scripts/run-github-actions-locally.sh
```

#### Differences from GitHub-hosted runners

When running workflows locally with `act`, be aware of:

1. **Container images**: `act` uses different Docker images than GitHub's runners
2. **Environment variables**: Some GitHub-specific environment variables may not be available
3. **Secrets**: You'll need to provide secrets via `.secrets` file or command line
4. **Performance**: Local execution may be faster or slower depending on your machine
5. **Caching**: GitHub Actions cache may not work the same way locally

#### Best Practices

1. **Test before pushing**: Run workflows locally to catch issues early
2. **Clean state**: Stop all Docker containers between runs to ensure clean tests
3. **Resource limits**: Be aware of your local machine's resource constraints
4. **Secrets management**: Never commit secrets files to version control

## Adding More Scripts

When adding new scripts to this directory:

1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add a shebang line: `#!/bin/bash`
3. Include help text with `-h` or `--help` flag
4. Document the script in this README
5. Use clear, descriptive names
6. Add error handling with `set -e`
7. Provide colored output for better UX

## Resources

- [act Documentation](https://github.com/nektos/act)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
