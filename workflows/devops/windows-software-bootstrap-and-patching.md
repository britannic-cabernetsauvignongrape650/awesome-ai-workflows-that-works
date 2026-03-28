---
name: Windows Software Bootstrap and Patching
category: devops
difficulty: beginner
tools: Ninite, Scoop, NinjaOne
tested: false
---

# Windows Software Bootstrap and Patching

> Set up a new Windows machine or keep a fleet current without manually clicking through installers all day.

## What this is for

This workflow covers three different Windows automation jobs:

- fast personal machine setup
- repeatable developer workstation setup
- managed endpoint install and patch execution

## Pick the right path

| Situation | Best tool |
|------|------|
| one laptop, mostly common apps | Ninite |
| developer machine, repeatable CLI setup | Scoop |
| many endpoints with centralized control | NinjaOne |

## Workflow

### Path 1: Fast personal setup with Ninite

1. Go to `ninite.com`.
2. Select the apps you want.
3. Download the custom installer.
4. Run it once.
5. Re-run the same installer later to update the same app set.

### Path 2: Repeatable Windows setup with Scoop

1. Open PowerShell.
2. Install Scoop:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb get.scoop.sh | iex
```

3. Add buckets you actually need:

```powershell
scoop bucket add extras
scoop bucket add versions
```

4. Install packages:

```powershell
scoop install git 7zip curl
scoop install extras/vscode extras/googlechrome
```

5. Save the exact commands or manifest in your setup notes so you can replay them on the next machine.

### Path 3: Managed installs and scripts with NinjaOne

1. Open NinjaOne.
2. Go to `Administration > Library > Automation`.
3. Add either:
   - `New Script`
   - `Installation`
   - `Run`
4. Choose operating system, architecture, and run context.
5. Save the automation.
6. Run it:
   - on demand from a device
   - on many devices at once
   - on a schedule through policy or tasking

## Example commands

### Ninite Pro

Install a selected set of apps silently:

```text
NinitePro.exe /select Firefox 7-Zip VLC /silent report.txt
```

Update only what is out of date:

```text
NinitePro.exe /updateonly /silent report.txt
```

Run against machines from a file:

```text
NinitePro.exe /remote file:machines.txt /updateonly /silent report.csv
```

### Scoop

```powershell
scoop bucket add extras
scoop install git 7zip curl
scoop install extras/vscode
```

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current Ninite, Scoop, and NinjaOne documentation

## Failure modes

- using Ninite for apps it does not carry
- using Scoop for packages that require a more enterprise-controlled install path
- using endpoint scripting without testing on a sacrificial machine first

## Sources

- [Ninite](https://ninite.com/)
- [Ninite Pro: command-line app selection](https://ninite.com/help/features/selection.html)
- [Ninite Pro: remote mode](https://ninite.com/help/features/remote.html)
- [Scoop](https://scoop.sh/Scoop/)
- [Scoop GitHub repository](https://github.com/ScoopInstaller/Scoop)
- [NinjaOne: getting started with automation scripting](https://www.ninjaone.com/docs/scripting-and-automation/getting-started-automation-scripting/)
- [NinjaOne: run or install application automations](https://www.ninjaone.com/docs/scripting-and-automation/install-application-automations/)
