import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import HomePage from '../pages/home/home-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import MapPage from '../pages/map-page/map-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';

const routes = {
  '/login': new LoginPage(),
  '/register': new RegisterPage(),

  '/': new HomePage(),
  '/add-story': new AddStoryPage(),
  '/bookmark': new BookmarkPage(),
  '/map': new MapPage(),
  '/detail/:id': new StoryDetailPage(),
};

export default routes;
