## Shure Wireless Microphones

This module will connect to the Shure receivers below to provide feedback status as well as some control:
* Shure ULX-D (ULXD4, ULXD4D, ULXD4Q)
* Shure QLX-D (QLXD4)
* Shure SLX-D (SLXD4, SLXD4D)
* Shure Axient Digital (AD4D, AD4Q)
* Shure Microflex Wireless (MXWANI4, MXWANI8)

### Available actions
Title | Model Support
--- | ---
Set Channel Name | All
Mute/Unmute/Toggle Mute of Channel | ULX & AD
Set Audio Gain of Channel | All
Increase Audio Gain of Channel | All
Decrease Audio Gain of Channel | All
Set Frequency of Channel | ULX, QLX, SLX, & AD
Flash Lights on Receiver | ULX, SLX, AD, & MXW
Flash Lights on Receiver Channel | SLX, AD, & MXW
Set slot RF output | ADX only
Set slot RF power level | ADX only

### Available feedbacks
Title | Description | Model Support
--- | --- | ---
Battery Level | If the battery bar drops to or below a certain value, change the color of the button. | All
Channel Frequency | If the selected channel\'s frequency is set, change the color of the button. | ULX, QLX, SLX, & AD
Channel Gain | If the selected channel\'s gain is set, change the color of the button. | All
Channel Muted | If the selected channel is muted, change the color of the button. | ULX, AD, & MXW
Channel Status Display | **See below** | ULX, QLX, SLX, & AD
Interference Status | If the selected channel gets interference, change the color of the button. | ULX, QLX, AD, & MXW
Transmitter Muted | If the selected channel\'s transmitter is muted, change the color of the button. | ULX, QLX, & AD
Transmitter Turned Off | If the selected channel\'s transmitter is powered off, change the color of the button. | All
Slot is Active | If the selected slot\'s transmitter is active to the channel, change the color of the button. | AD
Slot RF Output | If the selected slot\'s transmitter RF is set, change the color of the button. | ADX only
Slot RF Power | If the selected slot\'s transmitter power level is set, change the color of the button. | ADX only
Slot Status | If the selected slot\'s status is set, change the color of the button. | AD

### Channel Status Display
The "Channel Status Display" is a customizable feedback to provide a graphic status readout for a channel, similar to information available on the front panel or in Wireless Workbench.

Axient | ULX-D | QLX-D
--- | --- | ---
![AD example](icons/example-ad.png) | ![ULX example](icons/example-ulx.png) | ![QLX example](icons/example-qlx.png)

#### Setup
*Coming soon*

#### Labels
Title | Description | Model Support
--- | --- | ---
Channel Name | This is the channel's name.  8 characters are supported. | All
TX Device ID | This is the device ID programmed in the transmitter.<br />Note that for ULX-D and QLX-D, only ULXD6 and ULXD8 models support this field. | ULX, QLX, & AD
Frequency | Displayed as "XXX.XXX" | All
Group/Channel | Displayed as "XX,YY" | All
Audio Gain | Display as "+/- X dB" | All
TX Model | Displays the model of the current transmitter or "Unknown" when off. | All
TX Power Level | Displayed as "XX mW" or "Unknown" when off. | ULX, QLX, & AD
Battery Type | Displayed as "LION", "ALKA", "NIMH", "LITH", or "Unknown" when off. | ULX, QLX, & AD
Battery Runtime | Displayed as "hh:mm" or "Unknown" when off. | All

*Labels cannot be re-ordered and will display in the order listed here based on which are selected.*

#### Icons
Title | Description | Model Support | Examples
--- | --- | --- | ---
Audio | Will display a 6 or 8 segment audio meter on the right edge of the bank. | All | ![ULX audio example](icons/example-ulx-audio.png) ![AD audio example](icons/example-ad-audio.png)
Battery | Will display the 5-segment battery indicator in the bottom left of the bank.  Based on the "Battery Alert Level" the icon will turn red when the amounts reaches that level.  The icon will appear gray when the transmitter is off. | All | ![Full battery example](icons/example-battery-1.png) ![Low battery example](icons/example-battery-2.png) ![Transmitter off battery example](icons/example-battery-3.png)
Encryption | Will display a key icon in the top right of the bank.  This will appear white when encyption is enabled, gray when it is disabled, or red when there's an encryption error with the transmitter. | UlX, QLX, & AD | ![Encryption on example](icons/example-encryption-1.png) ![Encryption off example](icons/example-encryption-3.png) ![Encryption error example](icons/example-encryption-2.png)
Locks | Will display a transmitter lock indication on the bottom of the bank.  If a lock is detected the lock icon will be displayed along with an 'M' and/or 'P' to designate Menu and Power locks, repsectively. | UlX, QLX, & AD | ![Locks example](icons/example-locks.png)
Quality | Will display 5-segment quality indicator above the battery and lock icons (if enabled) or along the bottom of the bank. | AD | ![Quality example](icons/example-ad-quality.png)
RF | Will display a RF monitoring block appropriate for the model on the right edge of the bank and inside the audio meter (if enabled). | All | ![ULX rf example](icons/example-ulx-rf.png) ![AD rf example](icons/example-ad-rf.png)
