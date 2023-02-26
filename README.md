# Catapult README

Catapult is a simple VSCode extension to simplify launching and debugging application targets with custom arguments. Using Catapult, you shouldn't have to be constantly editing JSON files if you frequently switch up your command line arguments or debug different targets often.

## Features

* QuickPicker for finding and filtering previously used command line arguments
* Re-use command-line arguments across programs
* Prioritize recently used arguments for the current target
* Edit arguments in-place before launch
* Quick re-launch with one command
* Unified Launch and Debug UI & command-line argument history

## Requirements

* Can only work within CMake Projects
* Requires CMake Tools Extension

## Extension Commands
Catapult is predominantly used through the Command Palette, though you are free to add some keyboard shortcuts too!

* `catapult: Pick Target & Launch`:
Open QuickPick to select and set CMake Debug target to run, and then continue with `catapult: Launch`
* `catapult: Launch`:
  Open QuickPick to show recently used command-line arguments for the currently active CMake Debug target. Select `[Blank]` to start from a blank command line, or else choose another to edit.
* `catapult: Debug`:
  As per `catapult: Launch`, but run the target using the configured debugger.
* `catapult: Same again!`:
  Repeat the previous Launch or Debug with the same command line arguments without any user options.
* `catapult: Clear targets history`:
  Maybe your program has changed a lot? Start from 0 by clearing the current CMake Debug targets history. You can perform fine-grained edits by invoking `catapult: Settings` and showing the history (stored as editable JSON).
* `catapult: Settings`:
  Show the Catapult settings, as detailed below.

## Extension Settings

This extension contributes the following settings:

* `catapult.editArgumentsBeforeLaunch`:
  If you'd rather skip a keypress, you can set this to false to remove the ability to edit previously entered command-lines during launch / debug. To edit, you will need to jump to the JSON history. You will still get an edit input if you select `[blank]`
* `catapult.maxHistoryPerTarget`:
  You can keep your history tidier by limiting the recently used command-lines. 
* `catapult.history`:
  The modifiable history that Catapult uses to operate. You can tidy, delete, add to your hearts content. Changes will take effect immediately.

## Issues

Programming typescript is not my happy place, but this extension is born out of necessity. If you have problems with it, feel free to add an [issue](https://github.com/stevenlovegrove/catapult/issues) to share with the community (but please don't expect a prompt response from me). [PR's](https://github.com/stevenlovegrove/catapult/pulls) are welcome of course!

