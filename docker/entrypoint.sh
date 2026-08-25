#!/bin/sh
set -e

mkdir -p "$USER_PHOTO_STORAGE_PATH" "$ARTIST_PHOTO_STORAGE_PATH" "$COVER_STORAGE_PATH"

[ -f "$USER_PHOTO_STORAGE_PATH/userDefault.png" ] ||
  cp /app/seed-assets/userDefault.png "$USER_PHOTO_STORAGE_PATH/userDefault.png"

for artist_photo in defaultArtistPhoto.jpg Pink_Floyd.png; do
  [ -f "$ARTIST_PHOTO_STORAGE_PATH/$artist_photo" ] || cp "/app/seed-assets/$artist_photo" "$ARTIST_PHOTO_STORAGE_PATH/$artist_photo"
done

for cover in A_Saucerful_of_Secrets.png Animals.png Dark_Side_of_the_Moon.png Meddle.png \
  The_Division_Bell.png The_Piper_At_The_Gates_Of_Dawn.png The_Wall.png Wish_You_Were_Here.png; do
  [ -f "$COVER_STORAGE_PATH/$cover" ] || cp "/app/seed-assets/$cover" "$COVER_STORAGE_PATH/$cover"
done

exec java -jar /app/app.jar
