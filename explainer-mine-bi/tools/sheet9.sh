#!/bin/bash
out=$1; shift
args=(); fc=""; i=0
for f in "$@"; do args+=(-i "$f"); fc+="[$i:v]scale=640:360[v$i];"; i=$((i+1)); done
while [ $i -lt 9 ]; do args+=(-f lavfi -i color=c=black:s=640x360); fc+="[$i:v]null[v$i];"; i=$((i+1)); done
fc+="[v0][v1][v2]hstack=inputs=3[r0];[v3][v4][v5]hstack=inputs=3[r1];[v6][v7][v8]hstack=inputs=3[r2];[r0][r1][r2]vstack=inputs=3"
ffmpeg -y -loglevel error "${args[@]}" -filter_complex "$fc" -frames:v 1 $out
