# Titanium Downloads Proxy

This app proxies the old https://downloads.titaniumsdk.com to the new
https://titaniumsdk.com.

Titanium CLI's `ti sdk ls -r` command makes requests to
`/registry/<branches|branch|channel>.json` for SDK releases and builds using
undici which its low level API doesn't follow redirects, so we need to proxy.

## Contributing

Interested in contributing? There are several ways you can help contribute to this project.

### New Features, Improvements, Bug Fixes, & Documentation

Source code contributions are always welcome! Before we can accept your pull request, you must sign a Contributor License Agreement (CLA). Please visit https://titaniumsdk.com/contribute for more information.

### Donations

Please consider supporting this project by making a charitable [donation](https://titaniumsdk.com/contribute). The money you donate goes to compensate the skilled engineers and maintainers that keep this project going.

### Code of Conduct

TiDev wants to provide a safe and welcoming community for everyone to participate. Please see our [Code of Conduct](https://titaniumsdk.com/code-of-conduct) that applies to all contributors.

## Security

If you find a security related issue, please send an email to [security@titaniumsdk.com](mailto:security@titaniumsdk.com) instead of publicly creating a ticket.

## Stay Connected

For the latest information, please find us on [Bluesky](https://bsky.app/profile/titaniumsdk.com) and [X](https://x.com/titaniumsdk).

Join our growing Slack community by visiting https://titaniumsdk.com/slack!

## Legal

Titanium is a registered trademark of TiDev Inc. All Titanium trademark and patent rights were transferred and assigned to TiDev Inc. on 4/7/2022. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at https://titaniumsdk.com/legal.
