# Automation HQ

A standalone, installable version of the 3D office that shows Ali's Claude scheduled tasks as employees. It is meant to be served privately over Tailscale and added to a phone's home screen.

## What is here

| Path | What it is |
| --- | --- |
| `site/index.html` | The 3D office app (one page, no build step). |
| `site/status.json` | The status feed. Rewritten every 4 hours by the "Automation HQ status refresh" scheduled task. |
| `site/manifest.webmanifest`, `site/sw.js`, `site/icons/` | What makes it installable and lets the shell open offline. |
| `site/vendor/` | three.js r128 and OrbitControls (MIT, see `THREE-LICENSE`), bundled so the app needs no outside sites. |

## How it stays current

1. Every 4 hours a Claude scheduled task lists the scheduled tasks and commits a new `site/status.json` to `main`.
2. The server pulls this repo every 10 minutes.
3. The app re-reads `status.json` when opened and every 5 minutes while open.

So the office can be up to about 4 hours behind.

## Server setup (once)

Run on the machine that is on your tailnet. Replace `/home/hardcvre` if your home directory differs.

```bash
# 1. Copy the repo
git clone https://github.com/hardcvre/automation-hq.git /home/hardcvre/automation-hq

# 2. Pull updates every 10 minutes
( crontab -l 2>/dev/null; echo "*/10 * * * * git -C /home/hardcvre/automation-hq pull -q --ff-only" ) | crontab -

# 3. Serve the site folder to your tailnet over HTTPS on port 8443
sudo tailscale serve --bg --https=8443 /home/hardcvre/automation-hq/site
```

Step 3 prints the address, in the form `https://<machine>.<tailnet>.ts.net:8443`. It needs HTTPS certificates and MagicDNS enabled for the tailnet; Tailscale prompts for this if they are off. Check what is already being served first with `tailscale serve status`, and pick another port if 8443 is taken.

To stop serving: `sudo tailscale serve --https=8443 off`.

## Add to an iPhone

1. Connect the phone to Tailscale.
2. Open the address from step 3 in Safari.
3. Share, then Add to Home Screen.

The app only opens while the phone is connected to Tailscale. Offline or off the tailnet it shows the last office it loaded.

## Changing the office

Employees, rooms and job descriptions are the `TASKS` and `DEPTS` lists near the top of the script in `site/index.html`. A scheduled task that is not in `TASKS` has no desk, even if it appears in `status.json`. After changing any file listed in `SHELL` in `site/sw.js`, bump `VERSION` there so phones pick up the new copy.

## Privacy

`status.json` holds task names, schedules and last-run state. Keep this repo private and serve it with `tailscale serve` only. Do not use `tailscale funnel`, which would publish it to the internet.
