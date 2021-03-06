# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# 1.3.1 - 2021-06-09
### Fixed
- Fixed bug caused by recent minor changes to Twitch's HTML classes in the viewer card

# 1.3.0 - 2021-04-14
### Added
- Added confirmation prompt when attempting to unfollow someone

# 1.2.3 - 2021-02-17
### Fixed
- Minor fix to work with updated Twitch button CSS

## 1.2.2 - 2020-12-30
### Fixed
- Fixed bug caused by recent minor changes to Twitch's HTML classes in the viewer card

## 1.2.1 - 2020-11-12
### Fixed
- Fixed bug caused by recent Twitch change which broke the process of obtaining current user's Twitch username

## 1.2.0 - 2020-07-06
### Changed
- Replaced Twitch API v5 calls with new Helix endpoints for following/unfollowing

### Fixed
- Button sometimes would not be displayed after Twitch's channel redesign

## 1.1.1 - 2020-03-04
### Fixed
- Fix follow button not being properly inserted if you are already friends with or have a currently pending friend request to/from the viewer card user

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
