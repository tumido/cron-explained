# Cron Helper

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

- `cron-explained.use24HourTimeFormat`: If true, descriptions will use a 24-hour clock. Defaults to `true`.
- `cron-explained.verbose`: Whether to use a verbose description. Defaults to `true`.
- `cron-explained.enableCodeLens`: When enabled, the transcript is shown as a code lens. Defaults to `false`.
- `cron-explained.enableHover`: When enabled, the transcript is shown in a hover tooltip. Defaults to `true`.
