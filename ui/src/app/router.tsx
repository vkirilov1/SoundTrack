import { Route, Routes } from "react-router-dom";
import AlbumRoute from "./routes/album";
import ArtistRoute from "./routes/artist";
import HomeRoute from "./routes/home";
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
      <Route path="/album/:albumId" element={<AlbumRoute />} />
      <Route path="/artist/:artistId" element={<ArtistRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export default AppRouter;
