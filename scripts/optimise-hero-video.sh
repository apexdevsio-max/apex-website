#!/usr/bin/env bash
# Re-encodes the hero chroma-key video.
#
# The source is 1920x1080, 5.04s, 3.4 MB (~5.5 Mbps) with an audio track and its
# `moov` atom at the end of the file. Three things are wrong with that for a
# decorative loop:
#
#   1. It is rendered into a canvas that is at most half the viewport wide, so
#      1080p is far more detail than any display consumes. 720p is ample.
#   2. It is played `muted` and never unmuted, so the mp4a track is dead weight.
#   3. `moov` at the end means a player must fetch most of the file before it can
#      start; `+faststart` moves it to the front.
#
# Chroma keying happens in a WebGL shader against the green background, so the
# encode must protect hue fidelity at the key edges: yuv420p at a high-ish CRF
# would smear green into the subject and widen the matte. Hence CRF 26 with a
# slow preset rather than a smaller file at a worse edge.
#
# Requires ffmpeg on PATH. Run from the repo root.
set -euo pipefail

SRC="public/videos/robot_welcome.mp4"
OUT_MP4="public/videos/robot_welcome.opt.mp4"
OUT_WEBM="public/videos/robot_welcome.webm"

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }

# H.264 — universal fallback.
ffmpeg -y -i "$SRC" \
  -an \
  -vf "scale=-2:720" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p \
  -profile:v high -level 4.0 \
  -movflags +faststart \
  "$OUT_MP4"

# VP9 — smaller at equal quality for browsers that take it.
ffmpeg -y -i "$SRC" \
  -an \
  -vf "scale=-2:720" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -pix_fmt yuv420p \
  "$OUT_WEBM"

echo
echo "source : $(du -h "$SRC"     | cut -f1)"
echo "mp4    : $(du -h "$OUT_MP4" | cut -f1)"
echo "webm   : $(du -h "$OUT_WEBM"| cut -f1)"
echo
echo "If the mp4 looks right, replace the original:"
echo "  mv $OUT_MP4 $SRC"
