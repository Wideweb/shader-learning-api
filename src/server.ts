import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import TasksRoute from './routes/task.route';
import ModuleRoute from './routes/module.route';
import validateEnv from '@utils/validateEnv';
import MeRoute from './routes/me.route';
import FileRoute from './routes/file.route';
import FeedbackRoute from './routes/feedback.route';
import AchievementsRoute from './routes/achievements.route';

validateEnv();

const app = new App([
  new IndexRoute(),
  new FileRoute(),
  new MeRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new TasksRoute(),
  new ModuleRoute(),
  new FeedbackRoute(),
  new AchievementsRoute(),
]);

process.on('exit', () => app.free());

app.listen();
