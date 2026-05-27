# SLX-D+ Command Strings (Protocol Reference)

Technical reference for every TCP command this module exchanges with Shure SLX-D+
receivers (SLXD4+, SLXD4D+, SLXD4Q+, SLXD4QDAN+).

**Sources**

- Shure _SLXD+ Command Strings_, version 1.0 (2026-A) — <https://www.shure.com/en-US/docs/commandstrings/SLXDplus>
- Shure _SLXD4Q+ Wireless System Manual_, version 2.2 (2026-C) — operational and hardware reference

---

## Connection

|           |                                        |
| --------- | -------------------------------------- |
| Transport | TCP/IP (client)                        |
| Port      | **2202**                               |
| Encoding  | ASCII                                  |
| Framing   | `< … >` (angle brackets as delimiters) |

### ⚠️ Pre-Flight: enable Controller Access on the receiver

SLX-D+ **blocks TCP commands by default**. Before connecting from Companion,
on the receiver navigate to:

```
Device Configuration > Device Settings > Controller Access > Allow
```

Without this step the receiver accepts the TCP connection but silently
discards every GET/SET — no REP, no SAMPLE, no reaction. Source:
SLXD4Q+ user guide, page 27.

---

## Model matrix

| Model      | Channels | Side-channel slots (API) | Dante |
| ---------- | -------: | -----------------------: | :---: |
| SLXD4+     |        1 |                        1 |   —   |
| SLXD4D+    |        2 |                        1 |   —   |
| SLXD4Q+    |        4 |                        1 |   —   |
| SLXD4QDAN+ |        4 |                        1 |   ✓   |

Hardware-wise, the receiver can pair **two** transmitters per channel via the
_Add Second Tx Link_ menu (manual p. 21), but only one transmitter may be
powered on at a time. The TCP API exposes only the currently-active
transmitter at slot index **1** — when the user physically swaps between e.g.
a bodypack and a handheld (TX A off → TX B on), the `LINK_TX_MODEL 1` /
`LINK_STATUS 1` REPs reflect the new active transmitter.

```
[TX-A (bodypack) on]
< REP 1 LINK_TX_MODEL 1 SLXD1+ >
< REP 1 LINK_STATUS 1 LINKED.ACTIVE >

[user powers TX-A off and TX-B (handheld) on]
< REP 1 LINK_TX_MODEL 1 SLXD2+ >       ← slot 1 now reflects the handheld
< REP 1 LINK_STATUS 1 LINKED.ACTIVE >
```

> **Documentation footnotes**
>
> - The command-strings PDF writes _“Where x is the channel number and 1 is always the slot number”_ for `LINK_TX_MODEL` and `LINK_STATUS`. The wording _“always”_ is read as a deliberate API restriction to slot 1 — contrast the AD family, whose documentation says _“z is the slot number”_ with slots 1–8 addressable.
> - The `NA_DEVICE_NAME` variable description in the PDF mentions _“x is the channel number and z is the slot number”_, but the command itself takes no parameters (`< GET NA_DEVICE_NAME >`). This is a copy-paste artefact from a multi-slot template, not a real API variant — `NA_DEVICE_NAME` is purely device-scoped.
> - The module's slot iteration is fully parametric (`for slot in 1..model.slots`) so that a future firmware revision exposing slot 2 can be enabled by changing a single integer in `src/setup.js`.

---

## Conventions

| Type       | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| **GET**    | Query a property → answered by a REP                                     |
| **SET**    | Change a property → answered by a REP with the new value                 |
| **REP**    | Asynchronous report when a value changes (except for metered properties) |
| **SAMPLE** | Periodic metering (rate controlled by `METER_RATE`)                      |

Channel index `x`:

- `0` = all channels
- `1`–`4` = a single channel (model-dependent)

All messages are ASCII. Padded strings are right-filled with spaces to fixed
lengths (see per-command notes below).

---

## Device command strings

### ALL — discovery

|     |                                                                                             |
| --- | ------------------------------------------------------------------------------------------- |
| GET | `< GET x ALL >`                                                                             |
| REP | Multiple REP messages covering every device and channel property, including metered values. |

`x = 0` → full discovery. `x = 1..4` → device + channel x.

### FLASH — identify

|               |                                          |
| ------------- | ---------------------------------------- |
| SET (device)  | `< SET FLASH ON >`                       |
| REP (device)  | `< REP FLASH ON >` / `< REP FLASH OFF >` |
| SET (channel) | `< SET x FLASH ON >`                     |
| REP (channel) | `< REP x FLASH ON >`                     |

Without a channel index this is a _Device Identify_; with one it is a _Channel Identify_.

### MODEL — receiver model name

|     |                                                                                         |
| --- | --------------------------------------------------------------------------------------- |
| GET | `< GET MODEL >`                                                                         |
| REP | `< REP MODEL {SLXD4yyyyyyyyyyyyyyyyyyyyyyyyyyy} >` (32 chars, right-padded with spaces) |

### DEVICE_ID — device label (8 chars)

|     |                                |
| --- | ------------------------------ |
| GET | `< GET DEVICE_ID >`            |
| REP | `< REP DEVICE_ID {Name1yyy} >` |
| SET | `< SET DEVICE_ID {Name1} >`    |

Allowed characters: `A-Z a-z 0-9 !"#$%&'()*+,-./:;<=>?@[\]^_\`~` and space. 1–8 chars.

### RF_BAND

|     |                                               |
| --- | --------------------------------------------- |
| GET | `< GET RF_BAND >`                             |
| REP | `< REP RF_BAND {G55yyyyy} >` (8 chars padded) |

### LOCK_STATUS

|     |                                          |
| --- | ---------------------------------------- |
| GET | `< GET LOCK_STATUS >`                    |
| REP | `< REP LOCK_STATUS OFF \| MENU \| ALL >` |

### FW_VER — firmware version

|                        |                                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| GET                    | `< GET FW_VER >`                                                         |
| REP (self-test passed) | `< REP FW_VER {2.0.15.2yyyyyyyyyyyyyyyy} >` (24 chars padded)            |
| REP (self-test failed) | `< REP FW_VER {2.0.15.2*yyyyyyyyyyyyyyy} >` (asterisk marks the failure) |

Format: `Maj.Min.Pack.Build`.

### ENCRYPTION_MODE

|     |                                     |
| --- | ----------------------------------- |
| GET | `< GET ENCRYPTION_MODE >`           |
| REP | `< REP ENCRYPTION_MODE ON \| OFF >` |
| SET | `< SET ENCRYPTION_MODE ON \| OFF >` |

Toggling encryption requires linked transmitters to be re-synced via IR.

### NA_DEVICE_NAME — Dante device name (31 chars padded)

|                         |                                                            |
| ----------------------- | ---------------------------------------------------------- |
| GET                     | `< GET NA_DEVICE_NAME >`                                   |
| REP (default)           | `< REP NA_DEVICE_NAME {SLXD4Q-ffc8ecyyyyyyyyyyyyyyyyyy} >` |
| REP (Yamaha convention) | `< REP NA_DEVICE_NAME {Y001-Shure-SLXD4Q-435577yyyyyyy} >` |

Allowed characters: `A-Z a-z 0-9 -`. Case-insensitive. Must not begin or end
with a hyphen. Must be unique on the network.

### NET_SETTINGS — network configuration

|     |                                                                          |
| --- | ------------------------------------------------------------------------ |
| GET | `< GET NET_SETTINGS interface >`                                         |
| REP | `< REP NET_SETTINGS interface ipMode ipAddr subnetMask gwAddr macAddr >` |
| SET | `< SET NET_SETTINGS interface ipMode ipAddr subnetMask gwAddr >`         |

| Variable                         | Values                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| `interface`                      | `SC` (Shure Control), `D1` (Dante Primary), `D2` (Dante Secondary) |
| `ipMode`                         | `AUTO`, `MANUAL`                                                   |
| `ipAddr`, `subnetMask`, `gwAddr` | `aaa.aaa.aaa.aaa` (use `na` when `ipMode = AUTO`)                  |
| `gwAddr = 000.000.000.000`       | “no gateway”                                                       |
| `macAddr`                        | reported only (REP)                                                |

**Important notes**

- Changing `SC` requires reconnecting at the new IP.
- Changing `D1` or `D2` causes the receiver to reboot.
- `D2` is only meaningful in switch configuration _Split_ or _Redundant_.
- Non-Dante devices expose only `SC`.
- No asynchronous REPs — use GET to refresh.

**Examples**

```
< GET NET_SETTINGS SC >
< REP NET_SETTINGS SC AUTO 192.168.001.025 255.255.255.000 000.000.000.000 00:0E:DD:45:60:EB >

< SET NET_SETTINGS SC MANUAL 192.168.1.123 255.255.255.0 192.168.1.1 >
< SET NET_SETTINGS SC AUTO na na na >
< SET NET_SETTINGS D1 MANUAL 10.10.1.15 255.255.255.0 10.10.1.1 >
```

### APP_CONN_ENABLED — Wireless Workbench Mobile (BLE) access

|     |                                      |
| --- | ------------------------------------ |
| GET | `< GET APP_CONN_ENABLED >`           |
| REP | `< REP APP_CONN_ENABLED ON \| OFF >` |
| SET | `< SET APP_CONN_ENABLED ON \| OFF >` |

---

## Channel command strings

### CHAN_NAME (31 chars padded; SET accepts up to 8 chars)

|     |                                                         |
| --- | ------------------------------------------------------- |
| GET | `< GET x CHAN_NAME >`                                   |
| REP | `< REP x CHAN_NAME {Lead Voxyyyyyyyyyyyyyyyyyyyyyyy} >` |
| SET | `< SET x CHAN_NAME {Lead Vox} >`                        |

Allowed characters: `A-Z a-z 0-9 !"#$%&'()*+,-./:;<=>?@[\]^_\`~` and space.

### AUDIO_GAIN (offset 18; range 000-060 → −18…+42 dB)

|               |                                           |
| ------------- | ----------------------------------------- |
| GET           | `< GET x AUDIO_GAIN >`                    |
| REP           | `< REP x AUDIO_GAIN 030 >` (= 12 dB real) |
| SET absolute  | `< SET x AUDIO_GAIN 40 >`                 |
| SET increment | `< SET x AUDIO_GAIN INC 10 >`             |
| SET decrement | `< SET x AUDIO_GAIN DEC 5 >`              |

**Reported value = real value + 18.**

### AUDIO_OUT_LVL_SWITCH (read-only)

|     |                                              |
| --- | -------------------------------------------- |
| GET | `< GET x AUDIO_OUT_LVL_SWITCH >`             |
| REP | `< REP x AUDIO_OUT_LVL_SWITCH MIC \| LINE >` |

### GROUP_CHANNEL

|     |                                                                     |
| --- | ------------------------------------------------------------------- |
| GET | `< GET x GROUP_CHANNEL >`                                           |
| REP | `< REP x GROUP_CHANNEL {6,100} >` (5 chars padded, comma-separated) |
| SET | `< SET x GROUP_CHANNEL {6,100} >`                                   |

Wildcard `--,--` = unset (cannot be SET). **SET also triggers a `< REP x FREQUENCY ... >` message.**

### REM_PAIR — remote pairing over BLE

|                        |                                       |
| ---------------------- | ------------------------------------- |
| SET enable             | `< SET x REM_PAIR ON >`               |
| REP enable             | `< REP x REM_PAIR ON >`               |
| Async (TX advertising) | `< REP x REM_PAIR REQUEST {TxName} >` |
| SET accept             | `< SET x REM_PAIR ACCEPT {TxName} >`  |
| REP accept             | `< REP x REM_PAIR ACCEPT {TxName} >`  |
| SET reject             | `< SET x REM_PAIR REJECT {TxName} >`  |
| Timeout                | `< REP x REM_PAIR OFF >`              |
| Error                  | `< REP ERR >` (e.g. unknown TxName)   |

`{TxName}` is the identifier shown on the transmitter's display.

### INTERFERENCE_STATUS

|     |                                                  |
| --- | ------------------------------------------------ |
| GET | `< GET x INTERFERENCE_STATUS >`                  |
| REP | `< REP x INTERFERENCE_STATUS NONE \| DETECTED >` |

### ENCRYPTION_STATUS

|     |                                           |
| --- | ----------------------------------------- |
| GET | `< GET x ENCRYPTION_STATUS >`             |
| REP | `< REP x ENCRYPTION_STATUS OK \| ERROR >` |

`ERROR` indicates a mismatched transmitter.

### FREQUENCY (7 chars, kHz)

|     |                               |
| --- | ----------------------------- |
| GET | `< GET x FREQUENCY >`         |
| REP | `< REP x FREQUENCY 0602125 >` |
| SET | `< SET x FREQUENCY 602125 >`  |

**SET also triggers `< REP x GROUP_CHANNEL {--,--yyyyy} >`** (group/channel is
invalidated). Conversely, `SET GROUP_CHANNEL` triggers a `REP FREQUENCY`.

### NA_CHAN_NAME — Dante channel name (31 chars padded)

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| GET            | `< GET x NA_CHAN_NAME >`                                   |
| REP            | `< REP x NA_CHAN_NAME {01yyyyyyyyyyyyyyyyyyyyyyyyyyyyy} >` |
| Async (rename) | `< REP x NA_CHAN_NAME {03yyyyyyyyyyyyyyyyyyyyyyyyyyyyy} >` |

Allowed characters as for `NA_DEVICE_NAME`. Transmitter channel labels may use
any character except `= . @`.

---

## Metering command strings

Metering is _sample-based_: no REP on every audio change. Instead `SAMPLE`
messages are emitted periodically at the rate configured by `METER_RATE`.

### METER_RATE (5 chars, milliseconds)

|         |                              |
| ------- | ---------------------------- |
| GET     | `< GET x METER_RATE >`       |
| REP     | `< REP x METER_RATE 01000 >` |
| SET     | `< SET x METER_RATE 01000 >` |
| SET off | `< SET x METER_RATE 00000 >` |

Range: `00000` (off — default) or `00100`–`65535` ms.

### SAMPLE (combined periodic message)

|                  |                                              |
| ---------------- | -------------------------------------------- |
| Format           | `< SAMPLE chNum ALL audPeak audRms rfRssi >` |
| Example response | `< SAMPLE 1 ALL 102 102 086 >`               |

| Key       | Property                | Fields | Chars per field |
| --------- | ----------------------- | -----: | --------------: |
| `audPeak` | AUDIO_LEVEL_PEAK        |      1 |               3 |
| `audRms`  | AUDIO_LEVEL_RMS         |      1 |               3 |
| `rfRssi`  | RSSI (diversity output) |      1 |               3 |

For per-antenna RSSI use the `< GET x RSSI >` REP pair (see below) instead.

### AUDIO_LEVEL_PEAK / AUDIO_LEVEL_RMS

|     |                                                            |
| --- | ---------------------------------------------------------- |
| GET | `< GET x AUDIO_LEVEL_PEAK >` / `< GET x AUDIO_LEVEL_RMS >` |
| REP | `< REP x AUDIO_LEVEL_PEAK 102 >`                           |

3 chars, dBFS. **Real value = reported − 120.** Reported range 000-120 →
−120…0 dBFS (typical −100…0).

### RSSI (per antenna)

|               |                        |
| ------------- | ---------------------- |
| GET           | `< GET x RSSI >`       |
| REP antenna A | `< REP x RSSI 1 083 >` |
| REP antenna B | `< REP x RSSI 2 064 >` |

3 chars, dBm. **Real value = reported − 120.** Range −120…0 dBm.

---

## Side-channel command strings (slot 1 per channel)

### LINK_TX_MODEL

|     |                                                                   |
| --- | ----------------------------------------------------------------- |
| GET | `< GET x LINK_TX_MODEL 1 >`                                       |
| REP | `< REP x LINK_TX_MODEL 1 SLXD1+ \| SLXD2+ \| SLXD3+ \| UNKNOWN >` |

### LINK_STATUS

|     |                                                                     |
| --- | ------------------------------------------------------------------- |
| GET | `< GET x LINK_STATUS 1 >`                                           |
| REP | `< REP x LINK_STATUS 1 EMPTY \| LINKED.ACTIVE \| LINKED.INACTIVE >` |

| Value           | Meaning                                             |
| --------------- | --------------------------------------------------- |
| EMPTY           | No transmitter linked                               |
| LINKED.INACTIVE | Linked but not currently connected (TX powered off) |
| LINKED.ACTIVE   | Linked and connected                                |

### LINK_TX_BATT_MINS (5 chars)

|     |                                     |
| --- | ----------------------------------- |
| GET | `< GET x LINK_TX_BATT_MINS >`       |
| REP | `< REP x LINK_TX_BATT_MINS 00360 >` |

| Value       | Meaning                                        |
| ----------- | ---------------------------------------------- |
| 00000–65532 | Minutes of runtime remaining                   |
| 65533       | Battery communication warning (check contacts) |
| 65534       | Calculating                                    |
| 65535       | Unknown / not applicable                       |

### TX_BATT_MINS / TX_BATT_BARS

|     |                                                               |
| --- | ------------------------------------------------------------- |
| GET | `< GET x TX_BATT_MINS >` / `< GET x TX_BATT_BARS >`           |
| REP | `< REP x TX_BATT_MINS 00125 >` / `< REP x TX_BATT_BARS 004 >` |

`TX_BATT_BARS`: 000-005 + 255 (unknown). `TX_BATT_MINS`: 5-digit, same
special values as `LINK_TX_BATT_MINS`.

### LINK_TX_REBOOT

|                  |                                            |
| ---------------- | ------------------------------------------ |
| SET              | `< SET x LINK_TX_REBOOT >`                 |
| REP (no tx)      | `< REP x LINK_TX_REBOOT EMPTY >`           |
| REP (offline tx) | `< REP x LINK_TX_REBOOT LINKED.INACTIVE >` |
| REP (online tx)  | `< REP x LINK_TX_REBOOT RESET >`           |

---

## Receiver-menu features without a documented API

The following functions appear in the SLXD4Q+ user-menu but are **not** listed
in the command-strings PDF. They may still be reachable over TCP — to be
verified by probing the live device. Confirmed commands will be added to a
future revision of this document and to the module.

| Menu function                | Receiver path                                         | Candidate probe                |
| ---------------------------- | ----------------------------------------------------- | ------------------------------ |
| Audio Summing                | `Device Configuration > Audio > Audio Summing`        | `< GET 0 AUDIO_SUMMING >`      |
| Interference Management Mode | `Device Configuration > RF > Interference Management` | `< GET 0 INTERFERENCE_MGMT >`  |
| Antenna Bias                 | `Device Configuration > RF > Antenna Bias`            | `< GET 0 ANTENNA_BIAS >`       |
| Feedback Reduction (DFR)     | `Audio Settings > Feedback Reduction`                 | `< GET x FEEDBACK_REDUCTION >` |
| Mic Offset (TX)              | TX menu via Tx Remote Control                         | `< GET x MIC_OFFSET >`         |
| RF Power (TX)                | TX menu via Tx Remote Control                         | `< GET x TX_RF_POWER >`        |
| High-Pass Filter (TX)        | TX menu via Tx Remote Control                         | `< GET x TX_HIGH_PASS >`       |
| Tx Factory Reset             | `Transmitter > Tx Factory Reset`                      | `< SET x TX_FACTORY_RESET >`   |
| Tx Preset                    | `Transmitter > Transmitter Preset`                    | `< GET x TX_PRESET >`          |
| Dante Device Lock            | `Device Configuration > Dante > Dante Device Lock`    | `< GET 0 DANTE_DEVICE_LOCK >`  |

---

## Implementation notes for this module

- Padded-string trimming required for: `MODEL` (32), `DEVICE_ID` (8), `RF_BAND` (8), `FW_VER` (24), `NA_DEVICE_NAME` (31), `NA_CHAN_NAME` (31), `CHAN_NAME` (31), `GROUP_CHANNEL` (5).
- Audio gain is presented to the user as −18…+42 dB; the offset of +18 is applied in the parser and in actions that set absolute values.
- Audio level and RSSI are presented as negative dBFS / dBm; the offset of +120 is applied in the parser.
- On connect, the module sends `< GET 0 ALL >` for discovery and `< SET 0 METER_RATE {ms} >` for metering. On disconnect / reset, metering is stopped with `< SET 0 METER_RATE 00000 >`.
- `FREQUENCY` and `GROUP_CHANNEL` are coupled — when one changes the receiver emits both REPs; both are parsed.
- `REM_PAIR` is asynchronous. Incoming `REQUEST` messages are exposed as a `Boolean` feedback (_Remote-Pair Request Pending_) and as a `rem_pair_state` variable, so users can light up a button when a transmitter is asking to be paired.
- `NET_SETTINGS` writes against `D1` or `D2` cause the device to reboot. The action surfaces this in its tooltip, and the module's automatic reconnect (via `configUpdated`) re-establishes the TCP session.
- `LINK_TX_MODEL` returns `SLXD1+`, `SLXD2+`, `SLXD3+`, `UNKNOWN` — not to be confused with `SLXD1` / `SLXD2` / `SLXD3` (non-plus) used by the classic SLX-D module.
