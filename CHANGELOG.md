# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.1.0 - 2020-02-14
### Changed
- Change every request to the Twitch API to include the OAuth token to comply with [upcoming requirements from Twitch](https://discuss.dev.twitch.tv/t/requiring-oauth-for-helix-twitch-api-endpoints/23916).

## 1.0.0 - 2020-02-07

### Changed
- Change `developer.url` and add `homepage_url` in [`manifest.json`](https://github.com/argowizbang/ttv-viewer-card-follow-button/blob/master/manifest.json) to point to TTV VCFB's GitHub repository

### Fixed
- Fix user cards displayed from the chat user list or cheer/gift sub leaderboard maintaining the "Add Friend" button without adding the "Follow"/"Unfollow" button.
- Fix "Follow"/"Unfollow" button still being swapped into viewer cards of the current channel being viewed if the channel is partnered or currently live.

## 0.1.0 - 2020-02-04

### Added
- Initial functional release. Replaces "Add Friend" button in Twitch chat viewer cards with a "Follow"/"Unfollow" button.
