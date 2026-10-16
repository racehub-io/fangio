# Branching Strategy

## Trunk based development

- `main` branch is the trunk
- `main` branch is protected

- `feature` branches are created from `main`
- `feature` branches are merged into `main`
- `feature` branches are deleted after being merged into `main`

## Key Points

- Small features
- No long-lived branches
- Build fast and execute immediately
- Use feature flags are used to deploy new/big features to production

## Related Documents

- [Trunk Development - Atlassian](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development)
