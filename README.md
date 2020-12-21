![logo](https://raw.githubusercontent.com/tumido/cron-explained/master/docs/assets/icon_large.png)

# Cron Explained

[![](https://img.shields.io/github/v/release/tumido/cron-explained)](https://github.com/tumido/cron-explained/releases)
[![](https://img.shields.io/visual-studio-marketplace/v/tumido.cron-explained?label=vs%20marketplace)](https://marketplace.visualstudio.com/items?itemName=tumido.cron-explained)
[![](https://img.shields.io/open-vsx/v/tumido/cron-explained)](https://open-vsx.org/extension/tumido/cron-explained)
[![](https://img.shields.io/github/license/tumido/cron-explained)](https://github.com/tumido/cron-explained/blob/master/LICENSE)
[![](https://img.shields.io/github/workflow/status/tumido/cron-explained/Release)](https://github.com/tumido/cron-explained/actions?query=workflow%3ARelease)

Have you ever found the cron format confusing? Did you ever need to know what is the "real" schedule? Are you tired of copy pasting the `"2,3,4 */2 * * 4"` into other online tools? This extension might come handy to you.

## Features

### Hover tooltips

When hovering over cron-like schedules, display a human friendly explanation in a tooltip.

![hover](https://raw.githubusercontent.com/tumido/cron-explained/master/docs/assets/hover.gif)

### Code lens

Show code lens action to make inserting explanation as comment easier.

![code-lens](https://raw.githubusercontent.com/tumido/cron-explained/master/docs/assets/code-lens.gif)

### Save as comment

Command allowing you add an inline comment with the explanation.

![comment](https://raw.githubusercontent.com/tumido/cron-explained/master/docs/assets/comment.gif)

## Extension Settings

This extension contributes the following settings:

| Settings                             | Description                                               | Default value        |
| ------------------------------------ | --------------------------------------------------------- | -------------------- |
| `cron-explained.use24HourTimeFormat` | If set, descriptions will use a 24-hour clock.            | `true`               |
| `cron-explained.verbose`             | Whether to use a verbose description.                     | `true`               |
| `cron-explained.enableCodeLens`      | When enabled, the transcript is shown as a code lens.     | `false`              |
| `cron-explained.enableHover`         | When enabled, the transcript is shown in a hover tooltip. | `true`               |
| `cron-explained.locale`              | Enforce specific language for transcriptions.             | Environment language |

## Credit

1. [unDraw](https://undraw.co) for wonderful art.
2. [`cronstrue`](https://www.npmjs.com/package/cronstrue) which provides the cron translations.
