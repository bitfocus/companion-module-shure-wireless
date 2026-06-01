# SLX-D+ Command Strings (Protocol Reference)

Technical reference for every TCP command this module exchanges with Shure SLX-D+
receivers (SLXD4+, SLXD4D+, SLXD4Q+, SLXD4QDAN+).

**Sources**

- Shure _SLXD+ Command Strings_, version 1.0 (2026-A) — <https://www.shure.com/en-US/docs/commandstrings/SLXDplus>
- Shure _SLXD4Q+ Wireless System Manual_, version 2.2 (2026-C) — operational and hardware reference
- **Empirical verification against firmware 2.0.38.9 on a real SLXD4QDAN+ (2026-05-28)** — used to lock in every concrete wire format and to correct several PDF inaccuracies (see [Firmware 2.0.38.9 deviations](#firmware-20389-deviations) below).

---

## Firmware 2.0.38.9 deviations

The Strings PDF v1.0 (2026-A) was Shure's first public release of the SLX-D+ protocol document and contains several inaccuracies that show up immediately against a real device on firmware 2.0.38.9. Every row below was **verified directly on hardware (SLXD4QDAN+, firmware 2.0.38.9, 2026-05-28)** — raw probe transcripts are reproduced further down. This module is built to match what the device actually emits; the PDF entries are kept for historical accuracy.

| PDF v1.0 says                                                              | Firmware 2.0.38.9 sends / accepts (verified)                                                                                                                                                                                                                                        | Module behaviour                                                                                                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LINK_STATUS` values are `LINKED.ACTIVE` / `LINKED.INACTIVE` / `EMPTY`     | Lowercase `online` / `offline` only, and the GET **requires** the slot token (`< GET x LINK_STATUS s >`; the no-token form returns `< REP ERR >`). No explicit "empty" REP — a slot is empty when its `SLOT_TX_MODEL` is the blank padded form.                                     | Parser stores `online` / `offline` verbatim per slot. Slot-empty is derived from `SLOT_TX_MODEL`. The three `slot_link_*` boolean feedbacks are wired accordingly. |
| Slot TX-model command is `LINK_TX_MODEL`                                   | `LINK_TX_MODEL` **does not exist** — `< GET x LINK_TX_MODEL 1 >` → `< REP ERR >`. The per-slot model comes through `SLOT_TX_MODEL` (same name AD uses) with a padded value like `{SLXD1+    }`; the active-TX model is the channel-scoped `TX_MODEL` (`< REP x TX_MODEL SLXD1+ >`). | Per-slot model routes via the `SLOT_*` branch (trimmed for `slxdplus`); active model uses the existing channel `TX_MODEL`/`TX_TYPE` handler.                       |
| Device property name is `APP_CONN_ENABLED`                                 | Only `APP_CONNECTION_ENABLED` works — the short form returns `< REP ERR >`.                                                                                                                                                                                                         | Parser/SET use `APP_CONNECTION_ENABLED` (and still accept the short form defensively).                                                                             |
| `RSSI` is reported per antenna: `< REP x RSSI 1 … >`, `< REP x RSSI 2 … >` | A **single** diversity-output RSSI: `< REP x RSSI 096 >`. There is no per-antenna RSSI.                                                                                                                                                                                             | Parser treats `RSSI` as one value → single `rfBitmapA` bar and one `ch_x_rf_level` (modelled like SLX-D).                                                          |
| `LINK_TX_BATT_MINS` is channel-scoped (no slot index)                      | The wire form includes a slot index (`< REP x LINK_TX_BATT_MINS s NNNNN >`) **but the receiver echoes the active TX's value into every slot** — e.g. both slots report `00494` on CH1. It is therefore just the channel battery runtime, equivalent to `TX_BATT_MINS`.              | Dispatcher strips the slot token and routes channel-level; folded into the same handler as `TX_BATT_MINS` (→ `ch_x_battery_runtime`).                              |
| `< GET 0 ALL >` triggers full discovery                                    | On 2.0.38.9 it returns `< REP ERR >` and only starts metering — **no** property REPs. Per-channel `< GET N ALL >` **does** emit the full device + channel dump.                                                                                                                     | Connect path sends `< GET 0 ALL >` (metering kick-off) **plus** `< GET 1 ALL >` … `< GET N ALL >` for slxdplus models.                                             |
| `NA_DEVICE_NAME` has both `x` (channel) and `z` (slot) parameters          | `< GET 1 NA_DEVICE_NAME 2 >` → `< REP ERR >`; only the device-level `< GET NA_DEVICE_NAME >` works. The PDF parameter list is a copy-paste artefact.                                                                                                                                | Parser uses the device-level form only.                                                                                                                            |

### Newly discovered properties not in PDF v1.0 (2026-A)

Confirmed in the per-channel `< GET 1 ALL >` dump on firmware 2.0.38.9.

| Property                    | Scope   | Example                          | Notes                                                                                                                                                          |
| --------------------------- | ------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ANTENNA_STATUS`            | channel | `< REP 1 ANTENNA_STATUS XB >`    | Two characters: `A` / `B` = active, `X` = idle. `XB` means antenna B locked, A idle. Exposed as the `ch_x_antenna` variable; it does **not** feed the RF icon. |
| `TX_MODEL` (channel-scoped) | channel | `< REP 1 TX_MODEL SLXD1+ >`      | The currently active TX. Distinct from `SLOT_TX_MODEL`, which lists the model paired into each slot.                                                           |
| `AUDIO_SUMMING_MODE`        | device  | `< REP AUDIO_SUMMING_MODE OFF >` | Module exposes a `SET` action (`SLX-D+: Set device audio summing mode`).                                                                                       |

### Side-channel slots — two addressable, distinct slots

PDF v1.0 says _"`1` is always the slot number"_. **This is wrong for firmware 2.0.38.9.** The receiver exposes **two** addressable slots per channel with fully independent `LINK_STATUS` and `SLOT_TX_MODEL`, matching the hardware "Add Second Tx Link" feature (manual p. 21). Verified by pairing a bodypack on CH1 slot 1 and a handheld on CH4 slot 2, both powered on:

```
< REP 1 LINK_STATUS 1 online  >   < REP 1 SLOT_TX_MODEL 1 {SLXD1+    } >
< REP 1 LINK_STATUS 2 offline >   < REP 1 SLOT_TX_MODEL 2 {          } >
< REP 4 LINK_STATUS 1 offline >   < REP 4 SLOT_TX_MODEL 1 {          } >
< REP 4 LINK_STATUS 2 online  >   < REP 4 SLOT_TX_MODEL 2 {SLXD2+    } >
```

Channel-scoped `TX_MODEL` only reports the _active_ TX (`SLXD2+` on CH4) and cannot express which slot it occupies or that a second TX is paired-but-offline. The module therefore keeps a **minimal** 2-slot model for `slxdplus`: only `LINK_STATUS` (`slot_x-yy_link_status`) and `SLOT_TX_MODEL` (`slot_x-yy_tx_model`) per slot. Everything else (battery, RF, audio) stays channel-scoped on the active TX. This is deliberately narrower than the AD family's full per-slot inventory.

### Empty-channel behaviour

`< GET N ALL >` on a channel with no TX paired returns only a minimal subset:

```
< REP 3 TX_MODEL UNKNOWN >
< REP 3 TX_BATT_BARS 255 >
< REP 3 TX_BATT_MINS 65535 >
< REP 3 SLOT_TX_MODEL 1 {          } >
< REP 3 LINK_STATUS 1 offline >
< REP 3 SLOT_TX_MODEL 2 {          } >
< REP 3 LINK_STATUS 2 offline >
```

`CHAN_NAME`, `AUDIO_GAIN`, `FREQUENCY` etc. for empty channels are populated only after the user pairs a TX. The module's default state (`Unknown`, `EMPTY`) is what the UI shows until then.

### Sentinel values for unknown TX state

When no TX is paired, the receiver uses these sentinels:

| Field                 | Sentinel                                                     |
| --------------------- | ------------------------------------------------------------ |
| `TX_BATT_BARS`        | `255`                                                        |
| `TX_BATT_MINS`        | `65535` (also `65534` = calculating, `65533` = comm-warning) |
| `LINK_TX_BATT_MINS s` | same as above                                                |
| `TX_MODEL`            | `UNKNOWN`                                                    |
| `SLOT_TX_MODEL s`     | blank 10-char padded form `{          }`                     |

Parser maps these to the string `Unknown` / empty-string for variable display.

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
| SLXD4+     |        1 |                        2 |   —   |
| SLXD4D+    |        2 |                        2 |   —   |
| SLXD4Q+    |        4 |                        2 |   —   |
| SLXD4QDAN+ |        4 |                        2 |   ✓   |

The receiver can pair **two** transmitters per channel via the _Add Second Tx
Link_ menu (manual p. 21), and the TCP API exposes **both** slots independently
(verified on firmware 2.0.38.9 — see the slot transcript above). Only one TX is
powered on at a time; the channel-scoped `TX_MODEL` reflects whichever slot is
`online`, while each slot's `LINK_STATUS` / `SLOT_TX_MODEL` track that slot's own
state.

```
[bodypack on CH1 slot 1, handheld on CH4 slot 2]
< REP 1 TX_MODEL SLXD1+ >              ← active TX on CH1
< REP 1 LINK_STATUS 1 online  >        ← slot 1 = the bodypack
< REP 4 TX_MODEL SLXD2+ >              ← active TX on CH4
< REP 4 LINK_STATUS 2 online  >        ← slot 2 = the handheld
```

> **Documentation footnotes**
>
> - The PDF writes _“Where x is the channel number and 1 is always the slot number”_ for `LINK_TX_MODEL` and `LINK_STATUS`. This is inaccurate: `LINK_TX_MODEL` is not implemented at all on firmware 2.0.38.9, and `LINK_STATUS` accepts slot indices **1 and 2** with independent values.
> - The `NA_DEVICE_NAME` variable description mentions a `z` (slot) parameter, but the firmware rejects it (`< GET 1 NA_DEVICE_NAME 2 >` → `< REP ERR >`). `NA_DEVICE_NAME` is device-scoped only — the PDF wording is a copy-paste artefact from the AD multi-slot template.
> - Slot iteration is parametric (`for slot in 1..model.slots`, `model.slots = 2`).

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

`rfRssi` is the same single diversity value returned by `< GET x RSSI >`.

### AUDIO_LEVEL_PEAK / AUDIO_LEVEL_RMS

|     |                                                            |
| --- | ---------------------------------------------------------- |
| GET | `< GET x AUDIO_LEVEL_PEAK >` / `< GET x AUDIO_LEVEL_RMS >` |
| REP | `< REP x AUDIO_LEVEL_PEAK 102 >`                           |

3 chars, dBFS. **Real value = reported − 120.** Reported range 000-120 →
−120…0 dBFS (typical −100…0).

### RSSI (single diversity value)

|     |                      |
| --- | -------------------- |
| GET | `< GET x RSSI >`     |
| REP | `< REP x RSSI 096 >` |

3 chars, dBm. **Real value = reported − 120.** Range −120…0 dBm. SLX-D+ reports a
single diversity RSSI — there is no per-antenna RSSI (the PDF's `RSSI 1` / `RSSI 2`
forms are not implemented). Which antenna is locked is reported separately by
`ANTENNA_STATUS`.

---

## Side-channel command strings (slots 1 and 2 per channel)

### SLOT_TX_MODEL — per-slot TX model (firmware uses this, not `LINK_TX_MODEL`)

|     |                                                                  |
| --- | ---------------------------------------------------------------- |
| GET | `< GET x SLOT_TX_MODEL s >`                                      |
| REP | `< REP x SLOT_TX_MODEL s {SLXD1+    } >` (padded; blank = empty) |

`LINK_TX_MODEL` from the PDF **is not implemented** on firmware 2.0.38.9
(`< GET x LINK_TX_MODEL 1 >` → `< REP ERR >`). Use `SLOT_TX_MODEL` (per slot) and
the channel-scoped `TX_MODEL` (active TX) instead.

### LINK_STATUS — per-slot link state

|     |                                                 |
| --- | ----------------------------------------------- |
| GET | `< GET x LINK_STATUS s >` (slot token required) |
| REP | `< REP x LINK_STATUS s online \| offline >`     |

| Value   | Meaning                                                         |
| ------- | --------------------------------------------------------------- |
| online  | Linked and powered on                                           |
| offline | Linked but powered off                                          |
| (empty) | No TX paired — derived when `SLOT_TX_MODEL s` is the blank form |

`s` is `1` or `2`. The no-token GET (`< GET x LINK_STATUS >`) returns `< REP ERR >`.

### LINK_TX_BATT_MINS — alias of TX_BATT_MINS

`< REP x LINK_TX_BATT_MINS s NNNNN >` carries a slot token, but the receiver echoes
the active TX's runtime into every slot, so it is identical to the channel-scoped
`TX_BATT_MINS` below. The module strips the token and treats it as the channel
battery runtime. (Same 5-digit encoding and sentinels as `TX_BATT_MINS`.)

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
- `SLOT_TX_MODEL` / `TX_MODEL` return `SLXD1+`, `SLXD2+`, `SLXD3+`, `UNKNOWN` — not to be confused with `SLXD1` / `SLXD2` / `SLXD3` (non-plus) used by the classic SLX-D module.
- SLX-D+ is modelled like SLX-D, not like Axient: a single diversity RF level (no per-antenna colour bitmaps), no per-slot battery/RF inventory. The only per-slot data kept is `LINK_STATUS` and `SLOT_TX_MODEL` (two slots). Device audio encryption (`ENCRYPTION_MODE`, ON/OFF) is surfaced through the shared `encryption` variable.
