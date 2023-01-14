import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import multer from 'multer';
import FileController from '@/controllers/file.controller';
import { TEMP_FOLDER } from '@/config';

class FileRoute implements Routes {
  public path = '/files';
  public router = Router();
  public controller = new FileController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, authMiddleware, this.controller.get);

    this.router.post(
      `${this.path}/temp`,
      authMiddleware,
      multer({ dest: TEMP_FOLDER, limits: { fieldSize: 8 * 1024 * 1024 } }).single('file'),
      this.controller.uploadTemp,
    );
  }
}

export default FileRoute;
