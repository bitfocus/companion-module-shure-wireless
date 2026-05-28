## Shure Wireless Microphones

This module will connect to the Shure receivers below to provide feedback status as well as some control:

- Shure ULX-D (ULXD4, ULXD4D, ULXD4Q)
- Shure QLX-D (QLXD4)
- Shure SLX-D (SLXD4, SLXD4D)
- Shure SLX-D+ (SLXD4+, SLXD4D+, SLXD4Q+, SLXD4QDAN+)
- Shure Axient Digital (AD4D, AD4Q)

### ⚠️ SLX-D+ pre-flight: enable Controller Access

**SLX-D+ receivers block TCP commands by default.** Before connecting from Companion, on the receiver navigate to:

> `Device Configuration > Device Settings > Controller Access > Allow`

Without this step the device accepts the TCP connection but silently discards every command — no variables update, no actions take effect. (Source: SLXD4Q+ user guide v2.2, page 27.)

### SLX-D+ — using two transmitters on one channel

The SLX-D+ hardware can pair **two** transmitters per channel (e.g. a bodypack and a handheld) via the receiver's `Transmitter > Add Second Tx Link` menu. In operation only one of the two transmitters may be powered on at a time; the receiver automatically follows whichever one is active over RF. Companion sees the active transmitter as the channel's _Side Channel Slot 1_ (model, link status, battery), and the values update automatically when you physically switch between transmitters.

A reference of every TCP command this module uses against SLX-D+ devices is available in [`docs/SLXDplus-protocol.md`](../docs/SLXDplus-protocol.md).

### SLX-D+ — drag-and-drop presets

When an SLX-D+ model is selected, the **Buttons** page in Companion shows a preset palette grouped as:

- **SLX-D+ Channel _N_** — one group per receiver channel, with ready-to-use buttons for status display, Bodypack/Handheld link indicator (colour-coded green/yellow/grey), frequency, battery, audio gain ±3 dB, encryption-error indicator, interference indicator, channel flash, linked-TX reboot, remote-pair listener, and (on SLXD4QDAN+) the Dante channel name.
- **SLX-D+ Channel _N_ (Encoder)** — a rotary preset (Stream Deck Plus / Loupedeck): turn = audio gain ±1 dB, push = reset to 0 dB. On surfaces without an encoder the button still works as a "reset gain" button.
- **SLX-D+ Device** — flash device, encryption ON/OFF, app-connection ON/OFF.

Drag any preset onto an empty button and it arrives fully configured — actions, feedbacks and style all wired up. Bodypack/Handheld presets automatically reflect whichever transmitter is currently active on the channel.

### SLX-D+ — recommended triggers

Companion's **Triggers** page can fire actions automatically when the receiver's state changes. The module exposes all the booleans below as **feedbacks**, so a trigger can use _"When feedback X becomes true"_ as its condition.

| Trigger                                               | Condition (feedback to watch)                           | Suggested action                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Battery critical**                                  | `Battery Level` with _Battery Alert Level_ set to **1** | Send Slack/Mail webhook ("CH _N_ battery ≤ 1 bar"), and/or flash a status button |
| **Encryption error**                                  | `SLX-D+ Encryption Error` on channel _N_                | Log message, flash device, switch a status page to red                           |
| **RF interference**                                   | `Interference Status` on channel _N_                    | Show a warning on a "stage manager" button, log the timestamp                    |
| **Transmitter went offline (paired but powered off)** | `SLX-D+ Slot Link Inactive` on slot _N:1_               | Reset Companion variable, switch monitoring view, notify FOH                     |
| **Remote-pair request pending**                       | `SLX-D+ Remote-Pair Request Pending` on channel _N_     | Highlight the receiver's "Pair" button so an operator notices the BLE request    |

**How to set one up (example: Battery critical)**

1. In Companion → **Triggers** → **+ Add trigger**.
2. **Type**: _Feedback_.
3. Pick the connection (this instance) → feedback `Battery Level` → channel = the receiver channel, _Battery Alert Level_ = `1`.
4. **Actions**: add whatever Companion action you want — internal `instance:custom-variable set`, `surface:page set`, a webhook, etc.
5. Save. The trigger fires the moment the receiver reports `TX_BATT_BARS ≤ 1`.

These templates aren't shipped as preset JSON because Companion's module API doesn't yet support trigger presets — the user side has to wire them up once. The feedbacks they rely on are all already registered by this module, so no additional setup on the receiver is needed.

### Available actions

| Title                                                         | Model Support               |
| ------------------------------------------------------------- | --------------------------- |
| Set Channel Name <sup>x</sup>                                 | All                         |
| Mute/Unmute/Toggle Mute of Channel                            | ULX & AD                    |
| Set Audio Gain of Channel <sup>x</sup>                        | All                         |
| Increase Audio Gain of Channel <sup>x</sup>                   | All                         |
| Decrease Audio Gain of Channel <sup>x</sup>                   | All                         |
| Set Frequency of Channel <sup>x</sup>                         | ULX, QLX, SLX, SLX-D+, & AD |
| Flash Lights on Receiver                                      | ULX, SLX, SLX-D+, AD        |
| Flash Lights on Receiver Channel                              | SLX, SLX-D+, AD             |
| Set slot RF output                                            | ADX only                    |
| Set slot RF power level                                       | ADX only                    |
| SLX-D+: Set Group/Channel                                     | SLX-D+                      |
| SLX-D+: Set channel meter rate                                | SLX-D+                      |
| SLX-D+: Set audio encryption (device)                         | SLX-D+                      |
| SLX-D+: Enable / disable app (Bluetooth) connection           | SLX-D+                      |
| SLX-D+: Remote pairing — enable / disable / accept / reject   | SLX-D+                      |
| SLX-D+: Reboot the linked transmitter                         | SLX-D+                      |
| SLX-D+ (Dante): Set Dante channel name                        | SLXD4QDAN+                  |
| SLX-D+ (Dante): Set network settings (SC / D1 / D2)           | SLXD4QDAN+                  |
| <sup>x</sup> Dynamic variables can be used with these actions |                             |

### Available feedbacks

| Title                      | Description                                                                                   | Model Support               |
| -------------------------- | --------------------------------------------------------------------------------------------- | --------------------------- |
| Battery Level              | If the battery bar drops to or below a certain value, change the color of the button.         | All                         |
| Channel Frequency          | If the selected channel\'s frequency is set, change the color of the button.                  | ULX, QLX, SLX, SLX-D+, & AD |
| Channel Gain               | If the selected channel\'s gain is set, change the color of the button.                       | All                         |
| Channel Muted              | If the selected channel is muted, change the color of the button.                             | ULX, AD                     |
| Channel Status Display     | **See below**                                                                                 | ULX, QLX, SLX, SLX-D+, & AD |
| Interference Status        | If the selected channel gets interference, change the color of the button.                    | ULX, QLX, SLX-D+, AD        |
| Transmitter Muted          | If the selected channel\'s transmitter is muted, change the color of the button.              | ULX, QLX, & AD              |
| Transmitter Turned Off     | If the selected channel\'s transmitter is powered off, change the color of the button.        | All                         |
| Slot is Active             | If the selected slot\'s transmitter is active to the channel, change the color of the button. | AD                          |
| Slot RF Output             | If the selected slot\'s transmitter RF is set, change the color of the button.                | ADX only                    |
| Slot RF Power              | If the selected slot\'s transmitter power level is set, change the color of the button.       | ADX only                    |
| Slot Status                | If the selected slot\'s status is set, change the color of the button.                        | AD                          |
| SLX-D+ Encryption Error    | True when the channel reports `ENCRYPTION_STATUS = ERROR` (mismatched transmitter).           | SLX-D+                      |
| SLX-D+ Remote-Pair Request | True while a transmitter is advertising itself for BLE remote pairing.                        | SLX-D+                      |
| SLX-D+ Slot Link Active    | True when the side-channel slot is `LINKED.ACTIVE` (TX powered on).                           | SLX-D+                      |
| SLX-D+ Slot Link Inactive  | True when the slot is `LINKED.INACTIVE` (TX paired but currently powered off).                | SLX-D+                      |
| SLX-D+ Slot Empty          | True when no transmitter is paired into the slot.                                             | SLX-D+                      |

### Channel Status Display

The "Channel Status Display" is a customizable feedback to provide a graphic status readout for a channel, similar to information available on the front panel or in Wireless Workbench.

| Axient                               | ULX-D                                  | QLX-D                                  | SLX-D                                  |
| ------------------------------------ | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| ![AD example](images/example-ad.png) | ![ULX example](images/example-ulx.png) | ![QLX example](images/example-qlx.png) | ![SLX example](images/example-slx.png) |

#### Setup

To utilize the feedback, you will utilize the "Instance Feedback" section of a button, selecting the "+ Add feedback" option.

![Instance feedback section](images/doc-fb-block.png)

In the dropdown you'll locate the "Channel Status Display" option for your Shure wireless instance.

![Instance feedback add](images/doc-add-fb.png)

Once added, the feedback will have option to select a channel to display, a field to select text labels to display, a field to select which visual icons should display, and a battery level alert option for the battery icon. A default selection of these options is loaded. Please reference the below tables for further information about them.

![Instance feedback options](images/doc-options.png)

Most of the data that presents is automatically populated from the receiver as information changes, however, a data flow called "metering" is used for the audio and RF data. By default the instance will ask for updates to that data every 5 seconds (5000 ms). In the instance's configuration, metering can be disabled or the interval changed to between 50 and 60000 ms. Because of the graphical nature of this display, additional CPU resources are needed to update the displays timely. For this reason it is recommended to test faster metering intervals with your configuration if you would like the audio and RF displays to update faster. Warning: if the metering interval is too low (fast), you can lock yourself out of the GUI to make changes.

![Instance metering](images/doc-metering.PNG)

#### Labels

| Title           | Description                                                                                                                              | Model Support  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Channel Name    | This is the channel's name. 8 characters are supported.                                                                                  | All            |
| TX Device ID    | This is the device ID programmed in the transmitter.<br />Note that for ULX-D and QLX-D, only ULXD6 and ULXD8 models support this field. | ULX, QLX, & AD |
| Frequency       | Displayed as "XXX.XXX"                                                                                                                   | All            |
| Group/Channel   | Displayed as "XX,YY"                                                                                                                     | All            |
| Audio Gain      | Displayed as "+/- X dB"                                                                                                                  | All            |
| TX Model        | Displays the model of the current transmitter or "Unknown" when off.                                                                     | All            |
| TX Power Level  | Displayed as "XX mW" or "Unknown" when off.                                                                                              | ULX, QLX, & AD |
| Battery Type    | Displayed as "LION", "ALKA", "NIMH", "LITH", or "Unknown" when off.                                                                      | ULX, QLX, & AD |
| Battery Runtime | Displayed as "hh:mm" or "Unknown" when off.                                                                                              | All            |

_Labels cannot be re-ordered and will display in the order listed here based on which are selected._

#### Icons

| Title      | Description                                                                                                                                                                                                                        | Model Support  | Examples                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audio      | Will display a 6 or 8 segment audio meter on the right edge of the bank.                                                                                                                                                           | All            | ![ULX audio example](images/example-ulx-audio.png) ![AD audio example](images/example-ad-audio.png)                                                                               |
| Battery    | Will display the 5-segment battery indicator in the bottom left of the bank. Based on the "Battery Alert Level" the icon will turn red when the amounts reaches that level. The icon will appear gray when the transmitter is off. | All            | ![Full battery example](images/example-battery-1.png) ![Low battery example](images/example-battery-2.png) ![Transmitter off battery example](images/example-battery-3.png)       |
| Encryption | Will display a key icon in the top right of the bank. This will appear white when encyption is enabled, gray when it is disabled, or red when there's an encryption error with the transmitter.                                    | UlX, QLX, & AD | ![Encryption on example](images/example-encryption-1.png) ![Encryption off example](images/example-encryption-3.png) ![Encryption error example](images/example-encryption-2.png) |
| Locks      | Will display a transmitter lock indication on the bottom of the bank. If a lock is detected the lock icon will be displayed along with an 'M' and/or 'P' to designate Menu and Power locks, repsectively.                          | UlX, QLX, & AD | ![Locks example](images/example-locks.png)                                                                                                                                        |
| Quality    | Will display 5-segment quality indicator above the battery and lock icons (if enabled) or along the bottom of the bank.                                                                                                            | AD             | ![Quality example](images/example-ad-quality.png)                                                                                                                                 |
| RF         | Will display a RF monitoring block appropriate for the model on the right edge of the bank and inside the audio meter (if enabled).                                                                                                | All            | ![ULX rf example](images/example-ulx-rf.png) ![AD rf example](images/example-ad-rf.png)                                                                                           |
