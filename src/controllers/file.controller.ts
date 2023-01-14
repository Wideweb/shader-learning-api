import amazonFileStorage from '@/services/amazonFileStorage';
import { NextFunction, Request, Response } from 'express';

class FileController {
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = amazonFileStorage.get('Tasks', 'some.jpeg');
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public uploadTemp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(req.file?.filename);
    } catch (error) {
      next(error);
    }
  };
}

export default FileController;
