#!/bin/bash
# usage: sheet.sh out.png img1 img2 img3 img4  (2x2 contact sheet)
out=$1; shift
ffmpeg -y -loglevel error $(for f in "$@"; do echo -i $f; done) -filter_complex "[0:v]scale=960:540[a];[1:v]scale=960:540[b];[2:v]scale=960:540[c];[3:v]scale=960:540[d];[a][b]hstack[t];[c][d]hstack[u];[t][u]vstack" $out
