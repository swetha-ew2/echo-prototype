#!/usr/bin/env python3
"""Pre-render Echo's spoken lines to audio/<lang>/<key>.mp3 so every device plays the
same gentle voice (no dependency on the browser's built-in voices).

Uses the `edge-tts` package (free, no API key; it calls Microsoft's online neural voices).
    python3 -m pip install edge-tts
    python3 tools/make_audio.py            # all languages
    python3 tools/make_audio.py samples    # one line in several voices, to compare by ear

To use ElevenLabs (or any other service) instead, just replace the mp3 files with the same
names; the page plays whatever is in audio/<lang>/<key>.mp3. Re-run this script after changing
the wording in js/i18n.js, because the audio is a recording of the text at that time.
"""
import asyncio, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS = ["r1", "r2", "r3", "ack1", "ack2", "done"]

# One voice per language. Change them here; run `samples` to listen to alternatives.
VOICES = {"en": "en-US-AvaNeural", "de": "de-DE-AmalaNeural", "pt": "pt-BR-FranciscaNeural"}
RATE = "-14%"     # slower than normal speech
PITCH = "-2Hz"    # a touch lower, calmer
VOLUME = "+0%"

SAMPLE_VOICES = ["en-US-AvaNeural", "en-US-JennyNeural", "en-US-EmmaNeural", "en-GB-LibbyNeural", "en-GB-SoniaNeural", "en-US-MichelleNeural"]


def load_lines():
    js = ("global.window=global;"
          "require(process.argv[1]);process.stdout.write(JSON.stringify(window.EP.I18N));")
    out = subprocess.run(["node", "-e", js, os.path.join(ROOT, "js", "i18n.js")], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


async def render(text, voice, path):
    import edge_tts
    os.makedirs(os.path.dirname(path), exist_ok=True)
    await edge_tts.Communicate(text, voice, rate=RATE, pitch=PITCH, volume=VOLUME).save(path)


async def main():
    lines = load_lines()
    if len(sys.argv) > 1 and sys.argv[1] == "samples":
        for v in SAMPLE_VOICES:
            await render(lines["en"]["r1"], v, os.path.join(ROOT, "tools", "voice-samples", v + ".mp3"))
            print("sample", v)
        return
    for lang, voice in VOICES.items():
        for k in KEYS:
            await render(lines[lang][k], voice, os.path.join(ROOT, "audio", lang, k + ".mp3"))
            print(lang, k, voice)

asyncio.run(main())
