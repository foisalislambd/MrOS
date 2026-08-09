# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (latest) | Yes |
| Older commits / tags | Best effort |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email **foisalislambd@hotmail.com** with:

- A short description of the issue
- Steps to reproduce (PoC if available)
- Impact assessment (what an attacker could do)
- Affected commit, branch, or release if known

You should receive an initial response within **72 hours**.

## Scope

In scope examples:

- Auth bypass or privilege escalation
- Injection / RCE in API or bot handlers
- Secret leakage (tokens, database credentials)
- Unsafe Telegram command handling

Out of scope examples:

- Denial of service without a practical exploit path
- Issues only present in unreleased local experiments
- Social engineering

## Safe harbor

Good-faith security research that follows this policy is appreciated. Avoid
accessing or modifying other users' data, and avoid degrading service for
everyone while testing.
