import { Route, Routes } from "react-router-dom";
import AlbumRoute from "./routes/album";
import AlbumYearRoute from "./routes/album-year";
import ArtistRoute from "./routes/artist";
import FavoritesRoute from "./routes/favorites";
import GenreRoute from "./routes/genre";
import HomeRoute from "./routes/home";
import ListRoute from "./routes/list";
import LoginRoute from "./routes/login";
import NotFoundRoute from "./routes/not-found";
import ProfileRoute from "./routes/profile";
import ProfileEditRoute from "./routes/profile-edit";
import RegisterRoute from "./routes/register";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/profile/edit" element={<ProfileEditRoute />} />
      <Route path="/profile/:userId" element={<ProfileRoute />} />
      <Route path="/profile/:userId/favorites" element={<FavoritesRoute />} />
      <Route path="/album/year/:year" element={<AlbumYearRoute />} />
      <Route path="/album/:albumId" element={<AlbumRoute />} />
      <Route path="/list/:listId" element={<ListRoute />} />
      <Route path="/artist/:artistId" element={<ArtistRoute />} />
      <Route path="/genre/:name" element={<GenreRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export default AppRouter;
