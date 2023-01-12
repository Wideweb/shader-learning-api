import App from '@/app';
import AuthRoute from '@routes/auth.route';
import IndexRoute from '@routes/index.route';
import UsersRoute from '@routes/users.route';
import TasksRoute from './routes/task.route';
import ModuleRoute from './routes/module.route';
import validateEnv from '@utils/validateEnv';
import MeRoute from './routes/me.route';

validateEnv();

const app = new App([new IndexRoute(), new MeRoute(), new UsersRoute(), new AuthRoute(), new TasksRoute(), new ModuleRoute()]);

process.on('exit', () => app.free());

app.listen();
